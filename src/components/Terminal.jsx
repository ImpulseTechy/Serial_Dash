import { useEffect, useRef } from 'react'

function Terminal({ lines }) {
  const terminalRef = useRef(null)

  useEffect(() => {
    terminalRef.current?.scrollTo({
      top: terminalRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [lines])

  return (
    <section className="h-[40vh] border-t border-slate-800 bg-slate-950 dark:border-slate-700">
      <div
        ref={terminalRef}
        className="h-full overflow-y-auto px-5 py-4 font-mono text-sm leading-6 text-emerald-300"
      >
        {lines.length === 0 ? (
          <p className="text-slate-500 dark:text-slate-400">Waiting for serial data...</p>
        ) : (
          lines.map((line, index) => (
            <div className="whitespace-pre-wrap break-words" key={`${index}-${line}`}>
              {line}
            </div>
          ))
        )}
      </div>
    </section>
  )
}

export default Terminal
