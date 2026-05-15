import WidgetCard from './WidgetCard'
import EmptyWidgetState from './EmptyWidgetState'
import { formatValue, useLatestValue } from './widgetUtils'

function colorFor(percent) {
  if (percent >= 60) return '#10b981'
  if (percent >= 25) return '#f59e0b'
  return '#ef4444'
}

export function BatteryWidget({
  title,
  variableName,
  min = 0,
  max = 100,
  unit = '%',
}) {
  const value = useLatestValue(variableName)
  const hasValue = value !== null
  const range = max - min
  const clamped = hasValue && range > 0 ? Math.min(max, Math.max(min, value)) : min
  const percent = range > 0 ? ((clamped - min) / range) * 100 : 0
  const fill = colorFor(percent)

  return (
    <WidgetCard title={title} variableName={variableName}>
      {!hasValue ? (
        <EmptyWidgetState />
      ) : (
        <div className="flex h-full min-h-56 items-center justify-center gap-6">
          <div className="relative flex h-44 w-20 flex-col">
            <div className="mx-auto mb-1 h-3 w-10 rounded-t bg-slate-300 dark:bg-slate-700" />
            <div className="relative flex-1 overflow-hidden rounded-lg border-2 border-slate-300 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
              <div
                className="absolute inset-x-0 bottom-0 transition-all duration-300"
                style={{ height: `${percent}%`, backgroundColor: fill }}
              />
              <div className="absolute inset-y-0 left-1/2 grid place-items-center">
                <span className="rounded bg-white/80 px-1 text-xs font-bold text-slate-900 backdrop-blur dark:bg-slate-950/70 dark:text-slate-100">
                  {Math.round(percent)}%
                </span>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-slate-950 dark:text-slate-100">
              {formatValue(value)}
              {unit && (
                <span className="ml-1 text-base font-semibold text-slate-500 dark:text-slate-400">
                  {unit}
                </span>
              )}
            </div>
            <div className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              {min} – {max}
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
