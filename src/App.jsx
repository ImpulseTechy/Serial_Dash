import { useEffect, useState } from 'react'
import AboutModal from './components/AboutModal'
import Navbar from './components/Navbar'
import TemplatesModal from './components/TemplatesModal'
import { useSerial } from './hooks/useSerial'
import Dashboard from './pages/Dashboard'
import { useSerialStore } from './store/serialStore'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const storedTheme = localStorage.getItem('serial-dashboard-theme')

    if (storedTheme) {
      return storedTheme === 'dark'
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [isAboutOpen, setIsAboutOpen] = useState(false)
  const loadTemplate = useSerialStore((state) => state.loadTemplate)
  const {
    baudRate,
    connect,
    disconnect,
    error,
    isConnected,
    isPaused,
    isSupported,
    lines,
    parseWarning,
    readingsPerSecond,
    reconnectStatus,
    sendCommand,
    setBaudRate,
    setToast,
    toast,
    togglePause,
  } = useSerial()

  function handleUseTemplate(template) {
    loadTemplate(template)
    if (!isConnected && template.recommendedBaud) {
      setBaudRate(template.recommendedBaud)
    }
    setToast(`Loaded "${template.name}" template`)
    setIsTemplatesOpen(false)
  }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode)
    localStorage.setItem(
      'serial-dashboard-theme',
      isDarkMode ? 'dark' : 'light',
    )
  }, [isDarkMode])

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-950 transition-colors dark:bg-slate-950 dark:text-slate-100">
      {!isSupported && (
        <div className="bg-amber-100 px-5 py-3 text-center text-sm font-medium text-amber-900 dark:bg-amber-400/15 dark:text-amber-200">
          Use Chrome or Edge browser to use this app
        </div>
      )}

      <Navbar
        baudRate={baudRate}
        isDarkMode={isDarkMode}
        isConnected={isConnected}
        isPaused={isPaused}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
        onThemeToggle={() => setIsDarkMode((currentValue) => !currentValue)}
        onBaudRateChange={setBaudRate}
        onConnect={connect}
        onDisconnect={disconnect}
        onPauseToggle={togglePause}
        readingsPerSecond={readingsPerSecond}
        reconnectStatus={reconnectStatus}
      />

      {error && (
        <div className="border-b border-rose-200 bg-rose-50 px-5 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950 dark:text-rose-200">
          {error}
        </div>
      )}

      {parseWarning && (
        <div className="border-b border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          <p className="font-semibold">
            Cannot parse incoming data — check your Arduino serial format
          </p>
          <pre className="mt-3 overflow-x-auto rounded-lg bg-amber-100 p-3 font-mono text-xs text-amber-950 dark:bg-slate-900 dark:text-amber-100">
{`temp,humidity,pressure
34.5,60.2,1013

temp:34.5,humidity:60.2,pressure:1013

34.5`}
          </pre>
        </div>
      )}

      <Dashboard
        isConnected={isConnected}
        lines={lines}
        onSendCommand={sendCommand}
      />

      {isTemplatesOpen && (
        <TemplatesModal
          onClose={() => setIsTemplatesOpen(false)}
          onUse={handleUseTemplate}
        />
      )}

      {isAboutOpen && <AboutModal onClose={() => setIsAboutOpen(false)} />}

      {toast && (
        <div className="fixed right-5 top-20 z-50 flex items-center gap-3 rounded bg-slate-950 px-4 py-3 text-sm font-medium text-white shadow-xl dark:bg-white dark:text-slate-950">
          <span>{toast}</span>
          <button
            className="text-slate-300 transition hover:text-white dark:text-slate-500 dark:hover:text-slate-950"
            type="button"
            onClick={() => setToast('')}
            aria-label="Dismiss notification"
          >
            x
          </button>
        </div>
      )}
    </div>
  )
}

export default App
