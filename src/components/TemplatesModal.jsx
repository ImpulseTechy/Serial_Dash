import { useEffect, useState } from 'react'
import { SENSOR_TEMPLATES } from '../data/sensorTemplates'

function TemplatesModal({ onClose, onUse }) {
  const [expandedId, setExpandedId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  async function copyCode(template) {
    try {
      await navigator.clipboard.writeText(template.arduinoCode)
      setCopiedId(template.id)
      setTimeout(() => setCopiedId(null), 1500)
    } catch {
      // Clipboard may be blocked by the browser; fail quietly.
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">
              Sensor Templates
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pick a sensor and we'll set up the dashboard widgets and give you
              ready-to-paste Arduino code.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close templates"
            className="grid size-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          >
            x
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3 overflow-y-auto p-5 sm:grid-cols-2">
          {SENSOR_TEMPLATES.map((template) => {
            const isExpanded = expandedId === template.id
            const isCopied = copiedId === template.id

            return (
              <article
                key={template.id}
                className="flex flex-col rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-300 hover:bg-white dark:border-slate-700 dark:bg-slate-950 dark:hover:border-cyan-700 dark:hover:bg-slate-900"
              >
                <h3 className="text-base font-semibold text-slate-950 dark:text-slate-100">
                  {template.name}
                </h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {template.description}
                </p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {template.variablesPreview.map((variable) => (
                    <span
                      key={variable}
                      className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {variable}
                    </span>
                  ))}
                  <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
                    {template.widgets.length} widgets
                  </span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {template.recommendedBaud} baud
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onUse(template)}
                    className="rounded-lg bg-cyan-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
                  >
                    Use Template
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : template.id)
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    {isExpanded ? 'Hide Code' : 'Show Arduino Code'}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700">
                    <div className="flex items-center justify-between bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      <span>Arduino sketch</span>
                      <button
                        type="button"
                        onClick={() => copyCode(template)}
                        className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 transition hover:bg-white dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                      >
                        {isCopied ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="max-h-72 overflow-auto bg-slate-950 p-3 font-mono text-xs leading-5 text-emerald-200">
                      {template.arduinoCode}
                    </pre>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TemplatesModal
