import WidgetCard from './WidgetCard'
import {
  formatValue,
  getLatestValues,
  useVariableSeries,
} from './widgetUtils'

export function NumberCardWidget({
  variableName,
  title,
  unit = '',
  decimalPlaces = 2,
}) {
  const data = useVariableSeries(variableName, 2)
  const { latest, previous } = getLatestValues(data)
  const trend = latest !== null && previous !== null ? latest - previous : 0

  return (
    <WidgetCard title={title} variableName={variableName}>
      <div className="flex min-h-40 items-end justify-between gap-4">
        <div>
          <div className="text-5xl font-bold tracking-normal text-slate-950 dark:text-slate-100">
            {formatValue(latest, decimalPlaces)}
          </div>
          <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
            {variableName}
            {unit ? ` (${unit})` : ''}
          </p>
        </div>

        {trend !== 0 && (
          <div
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              trend > 0
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'
            }`}
            aria-label={trend > 0 ? 'Trending up' : 'Trending down'}
          >
            {trend > 0 ? '^' : 'v'}
          </div>
        )}
      </div>
    </WidgetCard>
  )
}
