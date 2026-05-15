import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartViewport from './ChartViewport'
import WidgetCard from './WidgetCard'
import EmptyWidgetState from './EmptyWidgetState'
import {
  resolveVariableNames,
  SERIES_COLORS,
  useMultiVariableSeries,
} from './widgetUtils'

export function LineChartWidget(props) {
  const { title, color } = props
  const names = resolveVariableNames(props)
  const data = useMultiVariableSeries(names, 100)
  const showLegend = names.length > 1

  return (
    <WidgetCard title={title} variableNames={names}>
      {data.length === 0 ? (
        <EmptyWidgetState />
      ) : (
        <ChartViewport>
          {({ height, width }) => (
            <LineChart
              data={data}
              height={height}
              margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
              width={width}
            >
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
              <XAxis
                dataKey="index"
                tick={{ fill: 'var(--chart-tick)', fontSize: 12 }}
                tickLine={false}
              />
              <YAxis
                domain={['dataMin', 'dataMax']}
                tick={{ fill: 'var(--chart-tick)', fontSize: 12 }}
                tickLine={false}
                width={42}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--chart-tooltip-bg)',
                  border: '1px solid var(--chart-tooltip-border)',
                  borderRadius: 8,
                  color: 'var(--chart-tooltip-text)',
                }}
                labelFormatter={(label) => `Reading ${label}`}
              />
              {showLegend && (
                <Legend
                  wrapperStyle={{ fontSize: 12, color: 'var(--chart-tick)' }}
                />
              )}
              {names.map((name, index) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  dot={false}
                  isAnimationActive={false}
                  stroke={
                    names.length === 1 && color
                      ? color
                      : SERIES_COLORS[index % SERIES_COLORS.length]
                  }
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          )}
        </ChartViewport>
      )}
    </WidgetCard>
  )
}
