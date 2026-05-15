import WidgetCard from './WidgetCard'
import { formatValue, getLatestValues, useVariableSeries } from './widgetUtils'

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180

  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

function describeArc(centerX, centerY, radius, startAngle, endAngle) {
  const start = polarToCartesian(centerX, centerY, radius, endAngle)
  const end = polarToCartesian(centerX, centerY, radius, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return [
    'M',
    start.x,
    start.y,
    'A',
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(' ')
}

export function GaugeWidget({
  variableName,
  title,
  min = 0,
  max = 100,
  unit = '',
}) {
  const data = useVariableSeries(variableName, 1)
  const { latest } = getLatestValues(data)
  const hasValue = latest !== null
  const range = max - min
  const clampedValue = hasValue && range > 0
    ? Math.min(max, Math.max(min, latest))
    : min
  const progress = range > 0 ? (clampedValue - min) / range : 0
  const valueArc = describeArc(100, 100, 78, 0, progress * 180)

  return (
    <WidgetCard title={title} variableName={variableName}>
      <div className="flex min-h-56 flex-col items-center justify-center">
        <svg className="h-36 w-full" viewBox="0 0 200 120" role="img">
          <path
            d={describeArc(100, 100, 78, 0, 180)}
            fill="none"
            stroke="var(--chart-grid)"
            strokeLinecap="round"
            strokeWidth="18"
          />
          {hasValue && (
            <path
              d={valueArc}
              fill="none"
              stroke="#6366f1"
              strokeLinecap="round"
              strokeWidth="18"
            />
          )}
        </svg>
        <div className="-mt-6 text-center">
          <div className="text-4xl font-bold text-slate-950 dark:text-slate-100">
            {formatValue(latest)}
            {hasValue && unit && (
              <span className="ml-1 text-lg font-semibold text-slate-500 dark:text-slate-400">
                {unit}
              </span>
            )}
          </div>
          <div className="mt-3 flex justify-center gap-8 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
      </div>
    </WidgetCard>
  )
}
