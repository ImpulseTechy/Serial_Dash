import { formatStat, useVariableStats } from './widgetUtils'

function WidgetCard({ children, title, variableName, variableNames }) {
  const names =
    Array.isArray(variableNames) && variableNames.length > 0
      ? variableNames
      : variableName
        ? [variableName]
        : []
  const singleName = names.length === 1 ? names[0] : null
  const stats = useVariableStats(singleName)
  const tooltip = stats
    ? `Min: ${formatStat(stats.min)} | Max: ${formatStat(stats.max)} | Avg: ${formatStat(stats.avg)}`
    : names.length > 1
      ? `Variables: ${names.join(', ')}`
      : 'No statistics yet'

  return (
    <article
      className="flex h-full flex-col rounded-xl bg-white p-4 shadow-sm transition-all duration-200 dark:bg-slate-900 dark:shadow-slate-950/40"
      title={tooltip}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-slate-950 dark:text-slate-100">
          {title || names.join(' + ')}
        </h3>
        <div className="flex flex-wrap justify-end gap-1">
          {names.map((name) => (
            <span
              key={name}
              className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </article>
  )
}

export default WidgetCard
