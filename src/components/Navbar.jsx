import { BAUD_RATES } from '../hooks/useSerial'

function Navbar({
  baudRate,
  isDarkMode,
  isConnected,
  isPaused,
  onOpenAbout,
  onOpenTemplates,
  onThemeToggle,
  onBaudRateChange,
  onConnect,
  onDisconnect,
  onPauseToggle,
  readingsPerSecond,
  reconnectStatus,
}) {
  const statusText = reconnectStatus
    ? `Reconnect ${reconnectStatus.attempt}/5 in ${reconnectStatus.seconds}s`
    : isConnected
      ? 'Connected'
      : 'Disconnected'

  return (
    <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-3 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-wrap items-center gap-3">
        <div className="grid size-9 place-items-center rounded bg-slate-950 text-sm font-bold text-cyan-300 dark:bg-cyan-300 dark:text-slate-950">
          SD
        </div>
        <h1 className="text-xl font-semibold text-slate-950 dark:text-slate-100">
          SerialDash
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
          <span>Baud</span>
          <select
            className="h-10 rounded border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:ring-cyan-950 dark:disabled:bg-slate-800"
            disabled={isConnected}
            value={baudRate}
            onChange={(event) => onBaudRateChange(Number(event.target.value))}
          >
            {BAUD_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}
              </option>
            ))}
          </select>
        </label>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isConnected
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300'
              : reconnectStatus
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-400/15 dark:text-amber-200'
                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}
        >
          {statusText}
        </span>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {readingsPerSecond} msg/s
        </span>

        {isConnected && (
          <button
            className="h-10 rounded border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
            type="button"
            onClick={onPauseToggle}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}

        <button
          className="h-10 rounded border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          type="button"
          onClick={onOpenTemplates}
        >
          Templates
        </button>

        <button
          className="h-10 rounded border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          type="button"
          onClick={onOpenAbout}
        >
          About
        </button>

        <button
          className="grid size-10 place-items-center rounded border border-slate-300 text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          type="button"
          onClick={onThemeToggle}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          title={isDarkMode ? 'Light mode' : 'Dark mode'}
        >
          {isDarkMode ? <SunIcon /> : <MoonIcon />}
        </button>

        <button
          className={`h-10 rounded px-4 text-sm font-semibold text-white transition ${
            isConnected
              ? 'bg-rose-600 hover:bg-rose-700'
              : 'bg-cyan-600 hover:bg-cyan-700'
          }`}
          type="button"
          onClick={isConnected ? onDisconnect : onConnect}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </header>
  )
}

function MoonIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3 6.5 6.5 0 0 0 21 12.8Z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg className="size-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  )
}

export default Navbar
