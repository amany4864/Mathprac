import { useEffect, useState, useRef } from 'react'
import './Results.css'

const STORAGE_KEY = 'tt_history'

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch { return [] }
}

function saveSession(session) {
  const history = loadHistory()
  history.unshift(session)                  // newest first
  const trimmed = history.slice(0, 50)      // keep last 50 sessions
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed))
}

export default function Results({ results, config, onRestart }) {
  const [tab,     setTab]     = useState('current')  // 'current' | 'history'
  const [history, setHistory] = useState([])
  const restartRef            = useRef(null)

  const total    = results.length
  const correct  = results.filter(r => r.correct).length
  const wrong    = total - correct
  const accuracy = total ? Math.round((correct / total) * 100) : 0
  const avgTime  = total
    ? (results.reduce((s, r) => s + r.timeTaken, 0) / total).toFixed(1)
    : 0
  const fastest  = total
    ? Math.min(...results.map(r => r.timeTaken)).toFixed(1)
    : 0

  useEffect(() => {
    const session = {
      date:     new Date().toISOString(),
      config:   { rangeMin: config.rangeMin, rangeMax: config.rangeMax, numQ: config.numQ, timePerQ: config.timePerQ },
      total, correct, wrong, accuracy,
      avgTime:  parseFloat(avgTime),
      fastest:  parseFloat(fastest),
    }
    saveSession(session)
    setHistory(loadHistory())
  }, [])

  useEffect(() => {
    restartRef.current?.focus()
  }, [])

  function handleKeyDown(e) {
    if (e.key === 'Enter') onRestart()
  }

  function formatDate(iso) {
    const d = new Date(iso)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  }

  function clearHistory() {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }

  return (
    <div className="results" onKeyDown={handleKeyDown}>

      {/* tabs */}
      <div className="results__tabs">
        <button
          className={`results__tab ${tab === 'current' ? 'results__tab--active' : ''}`}
          onClick={() => setTab('current')}
        >Current</button>
        <button
          className={`results__tab ${tab === 'history' ? 'results__tab--active' : ''}`}
          onClick={() => setTab('history')}
        >History <span className="results__tab-count">{history.length}</span></button>
      </div>

      {/* ── CURRENT SESSION ── */}
      {tab === 'current' && (
        <>
          <div className="results__header">
            <span className="results__icon">=</span>
            <h2>Session Complete</h2>
            <p>{config.rangeMin}–{config.rangeMax} range · {total} questions · {config.timePerQ}s/q</p>
          </div>

          <div className="results__big">
            <span className="results__accuracy">{accuracy}%</span>
            <span className="results__label">accuracy</span>
          </div>

          <div className="results__grid">
            <div className="stat">
              <span className="stat__val stat__val--green">{correct}</span>
              <span className="stat__key">correct</span>
            </div>
            <div className="stat">
              <span className="stat__val stat__val--red">{wrong}</span>
              <span className="stat__key">wrong</span>
            </div>
            <div className="stat">
              <span className="stat__val">{avgTime}s</span>
              <span className="stat__key">avg time</span>
            </div>
            <div className="stat">
              <span className="stat__val">{fastest}s</span>
              <span className="stat__key">fastest</span>
            </div>
          </div>

          {/* per-question log */}
          <div className="results__log">
            {results.map((r, i) => (
              <div key={i} className={`log-row ${r.correct ? 'log-row--correct' : 'log-row--wrong'}`}>
                <span className="log-row__q">{r.question.a} × {r.question.b}</span>
                <span className="log-row__eq">= {r.question.answer}</span>
                <span className="log-row__yours">{r.userAnswer === null ? '—' : r.userAnswer}</span>
                <span className="log-row__time">{r.timeTaken.toFixed(1)}s</span>
                <span className="log-row__icon">{r.correct ? '✓' : '✗'}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── HISTORY ── */}
      {tab === 'history' && (
        <>
          <div className="results__header">
            <span className="results__icon">◷</span>
            <h2>Past Sessions</h2>
            <p>Last {history.length} session{history.length !== 1 ? 's' : ''} saved locally</p>
          </div>

          {history.length === 0 ? (
            <p className="results__empty">No history yet.</p>
          ) : (
            <div className="results__log">
              {history.map((s, i) => (
                <div key={i} className="hist-row">
                  <div className="hist-row__left">
                    <span className="hist-row__date">{formatDate(s.date)}</span>
                    <span className="hist-row__meta">
                      {s.config.rangeMin}–{s.config.rangeMax} · {s.total}q · {s.config.timePerQ}s
                    </span>
                  </div>
                  <div className="hist-row__right">
                    <span className={`hist-row__acc ${s.accuracy >= 80 ? 'hist-row__acc--good' : s.accuracy >= 50 ? 'hist-row__acc--mid' : 'hist-row__acc--bad'}`}>
                      {s.accuracy}%
                    </span>
                    <span className="hist-row__avg">{s.avgTime}s avg</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {history.length > 0 && (
            <button className="btn-clear" onClick={clearHistory}>Clear History</button>
          )}
        </>
      )}

      <button
        ref={restartRef}
        className="btn-restart"
        onClick={onRestart}
        tabIndex={0}
      >
        New Session <span>↵</span>
      </button>
    </div>
  )
}