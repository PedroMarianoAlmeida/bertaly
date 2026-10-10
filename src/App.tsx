import DecryptedText from './components/DecryptedText'
import { useState } from 'react'
import './App.css'

function shiftBackFive(text: string) {
  return text.replace(/[a-z]/gi, (letter) => {
    const start = letter >= 'a' && letter <= 'z' ? 97 : 65
    const position = letter.charCodeAt(0) - start
    return String.fromCharCode(((position - 5 + 26) % 26) + start)
  })
}

function App() {
  const [input, setInput] = useState('')
  const [decodedText, setDecodedText] = useState(input)
  const [animationKey, setAnimationKey] = useState(0)

  function handleDecode(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextText = input.trim()
    if (!nextText) return

    setDecodedText(shiftBackFive(nextText))
    setAnimationKey((key) => key + 1)
  }

  function handleClear() {
    setInput('')
    setDecodedText('')
    setAnimationKey((key) => key + 1)
  }

  return (
    <main>
      <div className="decoder">
        <h1>
          Bertaly <span aria-hidden="true">🔎</span>
        </h1>

        <form className="decoder-form" onSubmit={handleDecode}>
          <label className="sr-only" htmlFor="decode-input">
            Text to decode
          </label>
          <input
            id="decode-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Escreva o Código"
          />
          <button type="submit" disabled={!input.trim()}>
            Descubra
          </button>
        </form>

        <DecryptedText
          key={animationKey}
          text={decodedText}
          animateOn="view"
          sequential
          speed={75}
          className="decrypted-text"
          encryptedClassName="encrypted-text"
        />

        <button type="button" className="clear-button" onClick={handleClear}>
          Limpar
        </button>
      </div>
    </main>
  )
}

export default App
