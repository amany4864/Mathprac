import { useState, useEffect, useRef } from 'react'
import './Settings.css'

export default function Settings({ onStart }) {
  const [rangeMin, setRangeMin]     = useState(2)
  const [rangeMax, setRangeMax]     = useState(12)
  const [numQ, setNumQ]             = useState(10)
  const [timePerQ, setTimePerQ]     = useState(10)
  const [error, setError]           = useState('')
  const firstInputRef               = useRef(null)

  useEffect(() => {
    firstInputRef.current?.focus()
  }, [])

  function handleSubmit(e) {
    e?.preventDefault()
    setError('')

    const min = parseInt(rangeMin)
    const max = parseInt(rangeMax)
    const q   = parseInt(numQ)
    const t   = parseInt(timePerQ)

    if (isNaN(min) || isNaN(max) || isNaN(q) || isNaN(t)) {
      setError('All fields are required.'); return
    }
    if (min < 1 || max < 1) {
      setError('Range values must be at least 1.'); return
    }
    if (min >= max) {
      setError('Max must be greater than Min.'); return
    }
    if (q < 1 || q > 100) {
      setError('Questions must be between 1 and 100.'); return
    }
    if (t < 3 || t > 120) {
      setError('Time must be between 3 and 120 seconds.'); return
    }

    onStart({ rangeMin: min, rangeMax: max, numQ: q, timePerQ: t })
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="settings">
      <div className="settings__header">
        <span className="settings__icon">×</span>
        <h1>Times Table<br />Trainer</h1>
        <p>Configure your session below</p>
      </div>

      <div className="settings__form" onKeyDown={handleKeyDown}>
        <div className="settings__row">
          <div className="field">
            <label>Range Min</label>
            <input
              ref={firstInputRef}
              type="number"
              value={rangeMin}
              min={1}
              onChange={e => setRangeMin(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Range Max</label>
            <input
              type="number"
              value={rangeMax}
              min={2}
              onChange={e => setRangeMax(e.target.value)}
            />
          </div>
        </div>

        <div className="settings__row">
          <div className="field">
            <label>Questions</label>
            <input
              type="number"
              value={numQ}
              min={1}
              max={100}
              onChange={e => setNumQ(e.target.value)}
            />
          </div>
          <div className="field">
            <label>Seconds / Q</label>
            <input
              type="number"
              value={timePerQ}
              min={3}
              max={120}
              onChange={e => setTimePerQ(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="settings__error">{error}</p>}

        <button className="btn-start" onClick={handleSubmit}>
          Start Session <span>↵</span>
        </button>
      </div>
    </div>
  )
}