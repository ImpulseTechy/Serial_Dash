import WidgetCard from './WidgetCard'
import EmptyWidgetState from './EmptyWidgetState'
import { formatValue, useLatestValue } from './widgetUtils'

const CARDINALS = [
  { label: 'N', angle: 0 },
  { label: 'E', angle: 90 },
  { label: 'S', angle: 180 },
  { label: 'W', angle: 270 },
]

function cardinalFromAngle(angle) {
  const normalized = ((angle % 360) + 360) % 360
  if (normalized < 22.5 || normalized >= 337.5) return 'N'
  if (normalized < 67.5) return 'NE'
  if (normalized < 112.5) return 'E'
  if (normalized < 157.5) return 'SE'
  if (normalized < 202.5) return 'S'
  if (normalized < 247.5) return 'SW'
  if (normalized < 292.5) return 'W'
  return 'NW'
}

export function CompassWidget({ title, variableName }) {
  const value = useLatestValue(variableName)
  const hasValue = value !== null
  const rotation = hasValue ? ((value % 360) + 360) % 360 : 0

  return (
    <WidgetCard title={title} variableName={variableName}>
      {!hasValue ? (
        <EmptyWidgetState label="Waiting for heading" />
      ) : (
        <div className="flex h-full min-h-56 flex-col items-center justify-center">
          <svg viewBox="0 0 200 200" className="h-44 w-44">
            <circle
              cx="100"
              cy="100"
              r="92"
              fill="none"
              stroke="var(--chart-grid)"
              strokeWidth="3"
            />
            {Array.from({ length: 36 }).map((_, index) => {
              const angle = index * 10
              const isMajor = angle % 90 === 0
              const length = isMajor ? 12 : 6
              const radians = ((angle - 90) * Math.PI) / 180
              const x1 = 100 + Math.cos(radians) * 92
              const y1 = 100 + Math.sin(radians) * 92
              const x2 = 100 + Math.cos(radians) * (92 - length)
              const y2 = 100 + Math.sin(radians) * (92 - length)
              return (
                <line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--chart-tick)"
                  strokeWidth={isMajor ? 2 : 1}
                />
              )
            })}
            {CARDINALS.map(({ label, angle }) => {
              const radians = ((angle - 90) * Math.PI) / 180
              const x = 100 + Math.cos(radians) * 70
              const y = 100 + Math.sin(radians) * 70
              return (
                <text
                  key={label}
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="700"
                  fill={label === 'N' ? '#ef4444' : 'var(--chart-tick)'}
                >
                  {label}
                </text>
              )
            })}
            <g transform={`rotate(${rotation} 100 100)`}>
              <polygon
                points="100,18 110,100 100,108 90,100"
                fill="#ef4444"
              />
              <polygon
                points="100,182 110,100 100,92 90,100"
                fill="#64748b"
              />
              <circle cx="100" cy="100" r="6" fill="#0f172a" />
            </g>
          </svg>
          <div className="mt-2 text-center">
            <div className="text-3xl font-bold text-slate-950 dark:text-slate-100">
              {formatValue(value)}°
            </div>
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              {cardinalFromAngle(value)}
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
