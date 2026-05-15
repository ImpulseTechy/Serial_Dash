import WidgetCard from './WidgetCard'
import EmptyWidgetState from './EmptyWidgetState'
import {
  formatStat,
  useLatestValue,
  useVariableStats,
} from './widgetUtils'

export function StatsCardWidget({ title, variableName, unit = '' }) {
  const stats = useVariableStats(variableName)
  const latest = useLatestValue(variableName)
  const hasValue = stats !== null && latest !== null

  return (
    <WidgetCard title={title} variableName={variableName}>
      {!hasValue ? (
        <EmptyWidgetState />
      ) : (
        <div className="grid h-full min-h-40 grid-cols-2 gap-3">
          <StatTile label="Current" value={latest} unit={unit} highlight />
          <StatTile label="Average" value={stats.avg} unit={unit} />
          <StatTile label="Min" value={stats.min} unit={unit} tone="cool" />
          <StatTile label="Max" value={stats.max} unit={unit} tone="warm" />
        </div>
      )}
    </WidgetCard>
  )
}

function StatTile({ label, value, unit, highlight = false, tone }) {
  const toneClass =
    tone === 'cool'
      ? 'text-cyan-700 dark:text-cyan-300'
      : tone === 'warm'
        ? 'text-rose-700 dark:text-rose-300'
        : highlight
          ? 'text-slate-950 dark:text-slate-100'
          : 'text-slate-700 dark:text-slate-200'

  return (
    <div className="flex flex-col justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className={`text-xl font-bold ${toneClass}`}>
        {formatStat(value)}
        {unit && (
          <span className="ml-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>
    </div>
  )
}
