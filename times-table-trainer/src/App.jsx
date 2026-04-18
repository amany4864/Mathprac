import { useState } from 'react'
import Settings from './components/Settings'
import Session from './components/Session'
import Results from './components/Results'
import './App.css'

const SCREENS = { SETTINGS: 'settings', SESSION: 'session', RESULTS: 'results' }

export default function App() {
  const [screen, setScreen] = useState(SCREENS.SETTINGS)
  const [config, setConfig] = useState(null)
  const [results, setResults] = useState(null)

  function handleStart(cfg) {
    setConfig(cfg)
    setScreen(SCREENS.SESSION)
  }

  function handleFinish(res) {
    setResults(res)
    setScreen(SCREENS.RESULTS)
  }

  function handleRestart() {
    setScreen(SCREENS.SETTINGS)
    setResults(null)
    setConfig(null)
  }

  return (
    <div className="app">
      {screen === SCREENS.SETTINGS && <Settings onStart={handleStart} />}
      {screen === SCREENS.SESSION  && <Session  config={config} onFinish={handleFinish} />}
      {screen === SCREENS.RESULTS  && <Results  results={results} config={config} onRestart={handleRestart} />}
    </div>
  )
}