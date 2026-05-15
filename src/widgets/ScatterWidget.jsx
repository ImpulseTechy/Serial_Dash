import { useMemo } from 'react'
import {
  CartesianGrid,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import ChartViewport from './ChartViewport'
import WidgetCard from './WidgetCard'
import EmptyWidgetState from './EmptyWidgetState'
import { useMultiVariableSeries } from './widgetUtils'

export function ScatterWidget({
  title,
  xVariable,
  yVariable,
}) {
  const variableNames = useMemo(
    () => [xVariable, yVariable].filter(Boolean),
    [xVariable, yVariable],
  )
  const series = useMultiVariableSeries(variableNames, 200)

  const points = useMemo(() => {
    const result = []
    for (const row of series) {
      const x = row[xVariable]
      const y = row[yVariable]
      if (typeof x === 'number' && typeof y === 'number') {
        result.push({ x, y })
      }
    }
    return result
  }, [series, xVariable, yVariable])

  return (
    <WidgetCard title={title} variableNames={variableNames}>
      {points.length === 0 ? (
        <EmptyWidgetState label="Waiting for X/Y values" />
      ) : (
        <ChartViewport>
          {({ height, width }) => (
            <ScatterChart
              height={height}
              width={width}
              margin={{ top: 8, right: 12, bottom: 8, left: 0 }}
            >
              <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={{ fill: 'var(--chart-tick)', fontSize: 12 }}
                tickLine={false}
                name={xVariable}
              />
              <YAxis
                dataKey="y"
                type="number"
                domain={['dataMin', 'dataMax']}
                tick={{ fill: 'var(--chart-tick)', fontSize: 12 }}
                tickLine={false}
                width={42}
                name={yVariable}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--chart-tooltip-bg)',
                  border: '1px solid var(--chart-tooltip-border)',
                  borderRadius: 8,
                  color: 'var(--chart-tooltip-text)',
                }}
                formatter={(value, key) => [value, key]}
              />
              <Scatter
                data={points}
                fill="#06b6d4"
                isAnimationActive={false}
              />
            </ScatterChart>
          )}
        </ChartViewport>
      )}
    </WidgetCard>
  )
}
