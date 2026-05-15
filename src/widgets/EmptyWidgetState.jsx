function EmptyWidgetState({ label = 'No data yet' }) {
  return (
    <div className="min-h-40 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
      <div className="space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="text-center text-sm font-medium text-slate-400 dark:text-slate-500">
          {label}
        </div>
      </div>
    </div>
  )
}

export default EmptyWidgetState
