import WidgetCard from './WidgetCard'
import { getLatestValues, useVariableSeries } from './widgetUtils'

export function LEDWidget({
  variableName,
  title,
  threshold = 0.5,
}) {
  const data = useVariableSeries(variableName, 1)
  const { latest } = getLatestValues(data)
  const hasValue = latest !== null
  const isOn = hasValue && latest > threshold

  return (
    <WidgetCard title={title} variableName={variableName}>
      <div className="grid min-h-56 place-items-center text-center">
        <div>
          <p className="mb-4 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {variableName} {hasValue ? (isOn ? 'ON' : 'OFF') : '--'}
          </p>
          <div
            className={`mx-auto size-28 rounded-full border-8 shadow-inner ${
              !hasValue
                ? 'border-slate-200 bg-slate-300 dark:border-slate-700 dark:bg-slate-600'
                : isOn
                  ? 'border-emerald-200 bg-emerald-500'
                  : 'border-rose-200 bg-rose-500'
            }`}
          />
        </div>
      </div>
    </WidgetCard>
  )
}
