import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import type { HTMLMotionProps } from 'motion/react'

type DecryptedTextProps = HTMLMotionProps<'span'> & {
  text: string
  speed?: number
  duration?: number
  maxIterations?: number
  sequential?: boolean
  revealDirection?: 'start' | 'end' | 'center'
  characters?: string
  className?: string
  parentClassName?: string
  encryptedClassName?: string
  animateOn?: 'view' | 'hover'
}

export default function DecryptedText({
  text,
  speed = 50,
  duration,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'view',
  ...props
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isAnimating, setIsAnimating] = useState(false)
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set())
  const [hasAnimated, setHasAnimated] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)
  const intervalDelay = sequential && duration !== undefined
    ? duration / Math.max(text.length, 1)
    : speed

  const availableChars = useMemo(() => characters.split(''), [characters])
  const shuffleText = useCallback(
    (revealed: Set<number>) => text.split('').map((char, index) => {
      if (char === ' ' || revealed.has(index)) return char
      return availableChars[Math.floor(Math.random() * availableChars.length)]
    }).join(''),
    [availableChars, text],
  )

  const nextIndex = useCallback((revealed: Set<number>) => {
    if (revealDirection === 'start') return revealed.size
    if (revealDirection === 'end') return text.length - 1 - revealed.size
    const middle = Math.floor(text.length / 2)
    const offset = Math.floor(revealed.size / 2)
    return revealed.size % 2 === 0 ? middle + offset : middle - offset - 1
  }, [revealDirection, text.length])

  const startAnimation = useCallback(() => {
    if (isAnimating) return
    setRevealedIndices(new Set())
    setDisplayText(text)
    setIsAnimating(true)
  }, [isAnimating, text])

  useEffect(() => {
    if (!isAnimating) return
    let iteration = 0
    const timer = window.setInterval(() => {
      setRevealedIndices((previous) => {
        if (sequential) {
          if (previous.size >= text.length) {
            window.clearInterval(timer)
            setDisplayText(text)
            setIsAnimating(false)
            return previous
          }
          const updated = new Set(previous)
          updated.add(nextIndex(previous))
          setDisplayText(shuffleText(updated))
          return updated
        }
        setDisplayText(shuffleText(previous))
        iteration += 1
        if (iteration >= maxIterations) {
          window.clearInterval(timer)
          setDisplayText(text)
          setIsAnimating(false)
        }
        return previous
      })
    }, intervalDelay)
    return () => window.clearInterval(timer)
  }, [intervalDelay, isAnimating, maxIterations, nextIndex, sequential, shuffleText, text])

  useEffect(() => {
    if (animateOn !== 'view') return
    const element = containerRef.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        startAnimation()
        setHasAnimated(true)
      }
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [animateOn, hasAnimated, startAnimation])

  return (
    <motion.span
      {...props}
      ref={containerRef}
      className={parentClassName}
      onMouseEnter={animateOn === 'hover' ? startAnimation : undefined}
      style={{ display: 'inline-block', whiteSpace: 'pre-wrap', ...props.style }}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {displayText.split('').map((char, index) => (
          <span key={`${char}-${index}`} className={revealedIndices.has(index) || !isAnimating ? className : encryptedClassName}>
            {char}
          </span>
        ))}
      </span>
    </motion.span>
  )
}
