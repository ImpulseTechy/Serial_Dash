import {
  Line,
  LineChart,
  Tooltip,
  YAxis,
} from 'recharts'
import ChartViewport from '../widgets/ChartViewport'

function VariablesPanel({ variables }) {
  const variableEntries = Object.entries(variables)

  return (
    <section className="border-t border-slate-200 bg-white px-5 py-5">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-950">
            Variables Detected
          </h2>
          <span className="rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {variableEntries.length} active
          </span>
        </div>

        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="w-1/4 px-4 py-3 font-semibold">Variable name</th>
                <th className="w-1/4 px-4 py-3 font-semibold">Latest value</th>
                <th className="px-4 py-3 font-semibold">Sparkline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {variableEntries.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-500" colSpan="3">
                    No numeric variables detected yet.
                  </td>
                </tr>
              ) : (
                variableEntries.map(([name, values]) => {
                  const latestValue = values.at(-1)
                  const sparklineData = values.slice(-30).map((value, index) => ({
                    index,
                    value,
                  }))

                  return (
                    <tr key={name}>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {name}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-700">
                        {Number.isInteger(latestValue)
                          ? latestValue
                          : latestValue.toFixed(3)}
                      </td>
                      <td className="h-12 px-4 py-2">
                        <ChartViewport className="h-8 min-w-0">
                          {({ height, width }) => (
                          <LineChart data={sparklineData} height={height} width={width}>
                            <YAxis hide domain={['dataMin', 'dataMax']} />
                            <Tooltip
                              cursor={false}
                              labelFormatter={() => name}
                              formatter={(value) => [value, 'value']}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              dot={false}
                              isAnimationActive={false}
                              stroke="#0891b2"
                              strokeWidth={2}
                            />
                          </LineChart>
                          )}
                        </ChartViewport>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default VariablesPanel
