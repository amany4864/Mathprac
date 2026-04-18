import { useState, useEffect, useRef, useCallback } from 'react'
import './Session.css'

function generateQuestion(min, max, usedSet) {
  const total = (max - min + 1) * (max - min + 1)
  if (usedSet.size >= total) usedSet.clear()

  let a, b, key
  do {
    a = Math.floor(Math.random() * (max - min + 1)) + min
    b = Math.floor(Math.random() * (max - min + 1)) + min
    key = `${a}x${b}`
  } while (usedSet.has(key))

  usedSet.add(key)
  return { a, b, answer: a * b }
}

export default function Session({ config, onFinish }) {
  const { rangeMin, rangeMax, numQ, timePerQ } = config

  const [qIndex,   setQIndex]   = useState(0)
  const [question, setQuestion] = useState(() => generateQuestion(rangeMin, rangeMax, new Set()))
  const [input,    setInput]    = useState('')
  const [timeLeft, setTimeLeft] = useState(timePerQ)
  const [feedback, setFeedback] = useState(null)
  const [autoLeft, setAutoLeft] = useState(null)
  const [log,      setLog]      = useState([])
  const [expired,  setExpired]  = useState(false)

  const inputRef  = useRef(null)
  const startTime = useRef(Date.now())
  const timerRef  = useRef(null)
  const autoRef   = useRef(null)
  const logRef    = useRef([])
  const usedRef   = useRef(new Set())  // ✅ inside component

  useEffect(() => { logRef.current = log }, [log])

  useEffect(() => {
    if (feedback === null) inputRef.current?.focus()
  }, [feedback])

  useEffect(() => {
    if (feedback !== null) return
    setExpired(false)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setExpired(true); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [qIndex, feedback])

  useEffect(() => {
    if (feedback !== 'correct') return
    setAutoLeft(2)
    autoRef.current = setInterval(() => {
      setAutoLeft(prev => {
        if (prev <= 1) { clearInterval(autoRef.current); goNext(); return null }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(autoRef.current)
  }, [feedback])

  const goNext = useCallback(() => {
    clearInterval(autoRef.current)
    const nextIndex = qIndex + 1
    if (nextIndex >= numQ) { onFinish(logRef.current); return }
    setQIndex(nextIndex)
    setQuestion(generateQuestion(rangeMin, rangeMax, usedRef.current)) // ✅ correct call
    setInput('')
    setFeedback(null)
    setAutoLeft(null)
    setTimeLeft(timePerQ)
    startTime.current = Date.now()
  }, [qIndex, numQ, rangeMin, rangeMax, timePerQ, onFinish])

  const submitAnswer = useCallback(() => {
    if (feedback === 'wrong')   { goNext(); return }
    if (feedback === 'correct') return

    clearInterval(timerRef.current)
    const timeTaken  = (Date.now() - startTime.current) / 1000
    const userAnswer = parseInt(input.trim())
    const correct    = !isNaN(userAnswer) && userAnswer === question.answer

    const entry = {
      question,
      userAnswer: isNaN(userAnswer) ? null : userAnswer,
      correct,
      timeTaken: Math.min(timeTaken, timePerQ),
      timedOut: !input.trim() && expired,
    }

    setLog(prev => {
      const updated = [...prev, entry]
      logRef.current = updated
      return updated
    })
    setFeedback(correct ? 'correct' : 'wrong')
  }, [feedback, input, question, expired, timePerQ, goNext])

  function handleKeyDown(e) {
    if (e.key === 'Enter') { e.preventDefault(); submitAnswer() }
  }

  const progress = (qIndex / numQ) * 100
  const timerPct = (timeLeft / timePerQ) * 100

  return (
    <div className="session">
      <div className="session__topbar">
        <span className="session__counter">{qIndex + 1} <span>/ {numQ}</span></span>
        <div className="session__progress-track">
          <div className="session__progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={`timer ${timeLeft <= 3 && !feedback ? 'timer--urgent' : ''}`}>
        <svg viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" className="timer__bg" />
          <circle
            cx="50" cy="50" r="44"
            className="timer__ring"
            strokeDasharray="276.46"
            strokeDashoffset={276.46 * (1 - timerPct / 100)}
            style={{ transition: feedback ? 'none' : 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <span className="timer__label">{timeLeft}s</span>
      </div>

      <div className="session__question">
        <span className="session__num">{question.a}</span>
        <span className="session__op">×</span>
        <span className="session__num">{question.b}</span>
        <span className="session__op">=</span>
      </div>

      <div className={`session__input-wrap ${feedback ? `session__input-wrap--${feedback}` : ''}`}>
        <input
          ref={inputRef}
          type="number"
          value={input}
          onChange={e => { if (feedback === null) setInput(e.target.value) }}
          onKeyDown={handleKeyDown}
          placeholder="?"
          className="session__input"
          autoComplete="off"
        />
      </div>

      {feedback === 'correct' && (
        <div className="session__feedback session__feedback--correct">
          <span>✓ Correct!</span>
          <span className="session__feedback-hint">next in <strong>{autoLeft}s</strong></span>
        </div>
      )}

      {feedback === 'wrong' && (
        <div className="session__feedback session__feedback--wrong">
          <span>✗ Answer: {question.answer}</span>
          <span className="session__feedback-hint">press Enter to continue</span>
        </div>
      )}

      {expired && !feedback && (
        <p className="session__expired">Time's up — still enter your answer or press Enter</p>
      )}
    </div>
  )
}