import WidgetCard from './WidgetCard'
import EmptyWidgetState from './EmptyWidgetState'
import { useStringVariable } from './widgetUtils'

const SUCCESS_KEYWORDS = ['ok', 'ready', 'armed', 'on', 'connected', 'pass']
const WARN_KEYWORDS = ['warn', 'pending', 'idle', 'low', 'wait']
const ERROR_KEYWORDS = ['error', 'fail', 'fault', 'off', 'critical', 'lost']

function colorClassFor(value) {
  if (!value) {
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  }
  const lower = value.toLowerCase()
  if (ERROR_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-200'
  }
  if (WARN_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-200'
  }
  if (SUCCESS_KEYWORDS.some((keyword) => lower.includes(keyword))) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-200'
  }
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
}

export function StatusTextWidget({ title, variableName }) {
  const value = useStringVariable(variableName)
  const hasValue = value !== null && value !== undefined

  return (
    <WidgetCard title={title} variableName={variableName}>
      {!hasValue ? (
        <EmptyWidgetState label="Waiting for status message" />
      ) : (
        <div className="grid h-full min-h-40 place-items-center">
          <div
            className={`rounded-xl px-6 py-4 text-center text-2xl font-bold uppercase tracking-wide ${colorClassFor(value)}`}
          >
            {value}
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
