import WidgetCard from './WidgetCard'
import EmptyWidgetState from './EmptyWidgetState'
import { formatValue, useLatestValue } from './widgetUtils'

const START_ANGLE = 135
const END_ANGLE = 405
const SWEEP = END_ANGLE - START_ANGLE

function polar(cx, cy, radius, angleDegrees) {
  const radians = ((angleDegrees - 90) * Math.PI) / 180
  return {
    x: cx + Math.cos(radians) * radius,
    y: cy + Math.sin(radians) * radius,
  }
}

function arcPath(cx, cy, radius, startAngle, endAngle) {
  const start = polar(cx, cy, radius, endAngle)
  const end = polar(cx, cy, radius, startAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`
}

export function TachometerWidget({
  title,
  variableName,
  min = 0,
  max = 8000,
  unit = '',
}) {
  const value = useLatestValue(variableName)
  const hasValue = value !== null
  const range = max - min
  const clamped = hasValue && range > 0 ? Math.min(max, Math.max(min, value)) : min
  const progress = range > 0 ? (clamped - min) / range : 0
  const angle = START_ANGLE + progress * SWEEP

  const ticks = 9
  const tickElements = []
  for (let index = 0; index < ticks; index += 1) {
    const tickAngle = START_ANGLE + (SWEEP * index) / (ticks - 1)
    const outer = polar(100, 100, 86, tickAngle)
    const inner = polar(100, 100, 72, tickAngle)
    const labelPos = polar(100, 100, 62, tickAngle)
    const labelValue = Math.round(min + ((max - min) * index) / (ticks - 1))
    const isHot = index >= ticks - 2
    tickElements.push(
      <g key={index}>
        <line
          x1={outer.x}
          y1={outer.y}
          x2={inner.x}
          y2={inner.y}
          stroke={isHot ? '#ef4444' : 'var(--chart-tick)'}
          strokeWidth="2"
        />
        <text
          x={labelPos.x}
          y={labelPos.y + 4}
          textAnchor="middle"
          fontSize="10"
          fill="var(--chart-tick)"
        >
          {labelValue}
        </text>
      </g>,
    )
  }

  const needleEnd = polar(100, 100, 78, angle)

  return (
    <WidgetCard title={title} variableName={variableName}>
      {!hasValue ? (
        <EmptyWidgetState />
      ) : (
        <div className="flex h-full flex-col items-center justify-center">
          <svg viewBox="0 0 200 200" className="h-48 w-48">
            <path
              d={arcPath(100, 100, 86, START_ANGLE, END_ANGLE)}
              fill="none"
              stroke="var(--chart-grid)"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d={arcPath(
                100,
                100,
                86,
                START_ANGLE + (SWEEP * 0.75),
                END_ANGLE,
              )}
              fill="none"
              stroke="#ef4444"
              strokeWidth="6"
              strokeLinecap="round"
              opacity="0.4"
            />
            {tickElements}
            <line
              x1="100"
              y1="100"
              x2={needleEnd.x}
              y2={needleEnd.y}
              stroke="#0891b2"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="8" fill="#0f172a" />
          </svg>
          <div className="-mt-2 text-center">
            <div className="text-2xl font-bold text-slate-950 dark:text-slate-100">
              {formatValue(value)}
              {unit && (
                <span className="ml-1 text-base font-semibold text-slate-500 dark:text-slate-400">
                  {unit}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
