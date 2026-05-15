import { useEffect, useMemo, useState } from 'react'
import { GridLayout, useContainerWidth } from 'react-grid-layout'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'
import ControlPanel from '../components/ControlPanel'
import Terminal from '../components/Terminal'
import { useSerialStore } from '../store/serialStore'
import {
  BarChartWidget,
  BatteryWidget,
  CompassWidget,
  GaugeWidget,
  LEDWidget,
  LineChartWidget,
  MapWidget,
  NumberCardWidget,
  OrientationWidget,
  ScatterWidget,
  StatsCardWidget,
  StatusTextWidget,
  TachometerWidget,
} from '../widgets'

const WIDGET_TYPES = [
  { type: 'line', label: 'Line Chart', icon: LineIcon },
  { type: 'bar', label: 'Bar Chart', icon: BarIcon },
  { type: 'scatter', label: 'XY Scatter', icon: ScatterIcon },
  { type: 'gauge', label: 'Gauge', icon: GaugeIcon },
  { type: 'tachometer', label: 'Tachometer', icon: TachometerIcon },
  { type: 'compass', label: 'Compass', icon: CompassIcon },
  { type: 'battery', label: 'Battery / Level', icon: BatteryIcon },
  { type: 'led', label: 'LED Indicator', icon: LedIcon },
  { type: 'number', label: 'Number Card', icon: NumberIcon },
  { type: 'stats', label: 'Stats Card', icon: StatsIcon },
  { type: 'status', label: 'Status Text', icon: StatusIcon },
  { type: 'map', label: 'Map (GPS)', icon: MapIcon },
  { type: 'orientation', label: '3D Orientation', icon: OrientationIcon },
]

function createWidgetId() {
  return crypto.randomUUID?.() ?? `widget-${Date.now()}`
}

function getDefaultTitle(type) {
  return WIDGET_TYPES.find((widgetType) => widgetType.type === type)?.label ?? 'Widget'
}

function Dashboard({ isConnected, lines, onSendCommand }) {
  const [selectedType, setSelectedType] = useState(null)
  const [isTerminalOpen, setIsTerminalOpen] = useState(false)
  const [isControlPanelOpen, setIsControlPanelOpen] = useState(false)
  const [formState, setFormState] = useState({
    title: '',
    variableName: '',
    variableNames: [],
    latVariable: '',
    lonVariable: '',
    xVariable: '',
    yVariable: '',
    rollVariable: '',
    pitchVariable: '',
    yawVariable: '',
    min: 0,
    max: 100,
    threshold: 0.5,
    unit: '',
  })
  const { containerRef, mounted, width } = useContainerWidth()

  const variables = useSerialStore((state) => state.variables)
  const stringVariables = useSerialStore((state) => state.stringVariables)
  const variableNames = useMemo(() => Object.keys(variables), [variables])
  const stringVariableNames = useMemo(
    () => Object.keys(stringVariables),
    [stringVariables],
  )
  const widgetConfigs = useSerialStore((state) => state.widgetConfigs)
  const layouts = useSerialStore((state) => state.layouts)
  const addWidget = useSerialStore((state) => state.addWidget)
  const clearData = useSerialStore((state) => state.clearData)
  const exportCsv = useSerialStore((state) => state.exportCsv)
  const loadDashboardFromStorage = useSerialStore(
    (state) => state.loadDashboardFromStorage,
  )
  const removeWidget = useSerialStore((state) => state.removeWidget)
  const setLayouts = useSerialStore((state) => state.setLayouts)

  useEffect(() => {
    loadDashboardFromStorage()
  }, [loadDashboardFromStorage])

  function openWidgetConfig(type) {
    const first = variableNames[0] ?? ''
    const findByHint = (hints) =>
      variableNames.find((name) =>
        hints.some((hint) => name.toLowerCase().includes(hint)),
      ) ?? first

    let min = 0
    let max = 100
    if (type === 'tachometer') {
      max = 8000
    } else if (type === 'compass') {
      max = 360
    }

    setSelectedType(type)
    setFormState({
      title: getDefaultTitle(type),
      variableName:
        type === 'status' ? stringVariableNames[0] ?? '' : first,
      variableNames: first ? [first] : [],
      latVariable: findByHint(['lat']),
      lonVariable: findByHint(['lon', 'lng']),
      xVariable: variableNames[0] ?? '',
      yVariable: variableNames[1] ?? '',
      rollVariable: findByHint(['roll']),
      pitchVariable: findByHint(['pitch']),
      yawVariable: findByHint(['yaw', 'heading']),
      min,
      max,
      threshold: 0.5,
      unit: '',
    })
  }

  function closeWidgetConfig() {
    setSelectedType(null)
  }

  function updateField(field, value) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }))
  }

  function handleAddWidget() {
    if (!selectedType) {
      return
    }

    const widgetConfig = {
      id: createWidgetId(),
      type: selectedType,
      title: formState.title || getDefaultTitle(selectedType),
    }

    if (selectedType === 'line' || selectedType === 'bar') {
      if (formState.variableNames.length === 0) return
      widgetConfig.variableNames = formState.variableNames
    } else if (selectedType === 'map') {
      if (!formState.latVariable || !formState.lonVariable) return
      widgetConfig.latVariable = formState.latVariable
      widgetConfig.lonVariable = formState.lonVariable
    } else if (selectedType === 'orientation') {
      if (
        !formState.rollVariable &&
        !formState.pitchVariable &&
        !formState.yawVariable
      ) {
        return
      }
      widgetConfig.rollVariable = formState.rollVariable
      widgetConfig.pitchVariable = formState.pitchVariable
      widgetConfig.yawVariable = formState.yawVariable
    } else if (selectedType === 'scatter') {
      if (!formState.xVariable || !formState.yVariable) return
      widgetConfig.xVariable = formState.xVariable
      widgetConfig.yVariable = formState.yVariable
    } else {
      if (!formState.variableName) return
      widgetConfig.variableName = formState.variableName
    }

    if (
      selectedType === 'gauge' ||
      selectedType === 'tachometer' ||
      selectedType === 'battery'
    ) {
      widgetConfig.min = Number(formState.min)
      widgetConfig.max = Number(formState.max)
      widgetConfig.unit = formState.unit
    }

    if (selectedType === 'led') {
      widgetConfig.threshold = Number(formState.threshold)
    }

    if (selectedType === 'number' || selectedType === 'stats') {
      widgetConfig.unit = formState.unit
    }

    addWidget(widgetConfig)
    closeWidgetConfig()
  }

  function handleExportCsv() {
    const csvContent = exportCsv()
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = `serial-dashboard-${new Date().toISOString()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="flex min-h-0 flex-1 overflow-hidden bg-slate-100 transition-colors max-md:flex-col dark:bg-slate-950">
      <aside className="w-full shrink-0 border-r border-slate-200 bg-white p-4 transition-colors md:w-60 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-100">Add Widget</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-1">
          {WIDGET_TYPES.map(({ type, label, icon: Icon }) => (
            <button
              className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-cyan-700 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-200"
              key={type}
              type="button"
              onClick={() => openWidgetConfig(type)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="relative flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-5 py-4 transition-colors dark:border-slate-800 dark:bg-slate-900">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-950 dark:text-slate-100">Dashboard</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Drag from each widget header and resize from the bottom-right.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              type="button"
              onClick={clearData}
            >
              Clear Data
            </button>
            <button
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              type="button"
              onClick={handleExportCsv}
            >
              Export CSV
            </button>
            <button
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              type="button"
              onClick={() => setIsControlPanelOpen((isOpen) => !isOpen)}
            >
              {isControlPanelOpen ? 'Hide Controls' : 'Send Commands'}
            </button>
            <button
              className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              type="button"
              onClick={() => setIsTerminalOpen((isOpen) => !isOpen)}
            >
              {isTerminalOpen ? 'Hide Terminal' : 'Show Terminal'}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-5">
          {widgetConfigs.length === 0 ? (
            <div className="grid h-full min-h-96 place-items-center rounded-xl border border-dashed border-slate-300 bg-white px-6 text-center text-sm font-medium text-slate-500 transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
              Add a widget from the left panel to get started
            </div>
          ) : (
            <div ref={containerRef}>
              {mounted && (
                <GridLayout
                  className="layout"
                  cols={12}
                  draggableHandle=".widget-drag-handle"
                  layout={layouts}
                  margin={[16, 16]}
                  onLayoutChange={setLayouts}
                  rowHeight={100}
                  width={width}
                >
                  {widgetConfigs.map((config) => (
                    <div key={config.id}>
                      <div className="group relative h-full opacity-100 transition-all duration-200">
                        <div
                          className="widget-drag-handle absolute left-0 right-10 top-0 z-10 h-12 cursor-move"
                          title="Drag widget"
                        />
                        <button
                          className="absolute right-3 top-3 z-20 grid size-7 place-items-center rounded-full bg-slate-950 text-sm font-bold text-white opacity-0 shadow-sm transition group-hover:opacity-100 dark:bg-white dark:text-slate-950"
                          type="button"
                          onClick={() => removeWidget(config.id)}
                          aria-label={`Remove ${config.title}`}
                        >
                          x
                        </button>
                        {renderWidget(config)}
                      </div>
                    </div>
                  ))}
                </GridLayout>
              )}
            </div>
          )}
        </div>

        {selectedType && (
          <WidgetConfigDialog
            formState={formState}
            onAdd={handleAddWidget}
            onClose={closeWidgetConfig}
            onUpdate={updateField}
            selectedType={selectedType}
            stringVariableNames={stringVariableNames}
            variableNames={variableNames}
          />
        )}

        <div
          className={`absolute inset-x-0 bottom-0 z-30 transform border-t border-slate-800 shadow-2xl transition-transform duration-300 dark:border-slate-700 ${
            isTerminalOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <Terminal lines={lines} />
        </div>

        <div
          className={`absolute inset-y-0 right-0 z-40 flex w-full max-w-sm transform transition-transform duration-300 ${
            isControlPanelOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <ControlPanel
            isConnected={isConnected}
            onClose={() => setIsControlPanelOpen(false)}
            onSend={onSendCommand}
          />
        </div>
      </section>
    </main>
  )
}

function WidgetConfigDialog({
  formState,
  onAdd,
  onClose,
  onUpdate,
  selectedType,
  stringVariableNames,
  variableNames,
}) {
  const isMultiVarChart = selectedType === 'line' || selectedType === 'bar'
  const isMap = selectedType === 'map'
  const isOrientation = selectedType === 'orientation'
  const isScatter = selectedType === 'scatter'
  const isStatus = selectedType === 'status'
  const hasMinMax =
    selectedType === 'gauge' ||
    selectedType === 'tachometer' ||
    selectedType === 'battery'
  const hasUnit = hasMinMax || selectedType === 'number' || selectedType === 'stats'

  let canSubmit
  if (isMultiVarChart) {
    canSubmit = formState.variableNames.length > 0
  } else if (isMap) {
    canSubmit = Boolean(formState.latVariable && formState.lonVariable)
  } else if (isOrientation) {
    canSubmit = Boolean(
      formState.rollVariable || formState.pitchVariable || formState.yawVariable,
    )
  } else if (isScatter) {
    canSubmit = Boolean(formState.xVariable && formState.yVariable)
  } else {
    canSubmit = Boolean(formState.variableName)
  }

  function toggleVariable(name) {
    const current = formState.variableNames
    const next = current.includes(name)
      ? current.filter((value) => value !== name)
      : [...current, name]
    onUpdate('variableNames', next)
  }

  const namesForStatus = isStatus ? stringVariableNames : variableNames

  return (
    <div className="absolute left-4 right-4 top-20 z-40 max-h-[80vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:left-auto sm:right-auto sm:w-80 md:left-64 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-950 dark:text-slate-100">
          Configure {getDefaultTitle(selectedType)}
        </h3>
        <button
          className="grid size-7 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
          type="button"
          onClick={onClose}
          aria-label="Close widget configuration"
        >
          x
        </button>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Widget title
          <input
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-950"
            value={formState.title}
            onChange={(event) => onUpdate('title', event.target.value)}
          />
        </label>

        {isMultiVarChart && (
          <div className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Variables to plot
            {variableNames.length === 0 ? (
              <p className="mt-1 rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                No variables detected yet
              </p>
            ) : (
              <div className="mt-1 max-h-40 space-y-1 overflow-y-auto rounded-lg border border-slate-300 bg-white p-2 dark:border-slate-700 dark:bg-slate-950">
                {variableNames.map((variableName) => {
                  const checked =
                    formState.variableNames.includes(variableName)
                  return (
                    <label
                      key={variableName}
                      className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm font-normal text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleVariable(variableName)}
                        className="size-4 accent-cyan-600"
                      />
                      {variableName}
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {isMap && (
          <>
            <VariableSelect
              label="Latitude variable"
              value={formState.latVariable}
              names={variableNames}
              onChange={(value) => onUpdate('latVariable', value)}
            />
            <VariableSelect
              label="Longitude variable"
              value={formState.lonVariable}
              names={variableNames}
              onChange={(value) => onUpdate('lonVariable', value)}
            />
          </>
        )}

        {isOrientation && (
          <>
            <VariableSelect
              label="Roll variable (X)"
              value={formState.rollVariable}
              names={variableNames}
              allowEmpty
              onChange={(value) => onUpdate('rollVariable', value)}
            />
            <VariableSelect
              label="Pitch variable (Y)"
              value={formState.pitchVariable}
              names={variableNames}
              allowEmpty
              onChange={(value) => onUpdate('pitchVariable', value)}
            />
            <VariableSelect
              label="Yaw variable (Z)"
              value={formState.yawVariable}
              names={variableNames}
              allowEmpty
              onChange={(value) => onUpdate('yawVariable', value)}
            />
          </>
        )}

        {isScatter && (
          <>
            <VariableSelect
              label="X variable"
              value={formState.xVariable}
              names={variableNames}
              onChange={(value) => onUpdate('xVariable', value)}
            />
            <VariableSelect
              label="Y variable"
              value={formState.yVariable}
              names={variableNames}
              onChange={(value) => onUpdate('yVariable', value)}
            />
          </>
        )}

        {!isMultiVarChart &&
          !isMap &&
          !isOrientation &&
          !isScatter && (
            <VariableSelect
              label={
                isStatus ? 'String variable to display' : 'Variable to display'
              }
              value={formState.variableName}
              names={namesForStatus}
              emptyMessage={
                isStatus
                  ? 'No string variables detected'
                  : 'No variables detected'
              }
              onChange={(value) => onUpdate('variableName', value)}
            />
          )}

        {hasMinMax && (
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Min
              <input
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-950"
                type="number"
                value={formState.min}
                onChange={(event) => onUpdate('min', event.target.value)}
              />
            </label>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Max
              <input
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-950"
                type="number"
                value={formState.max}
                onChange={(event) => onUpdate('max', event.target.value)}
              />
            </label>
          </div>
        )}

        {selectedType === 'led' && (
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Threshold
            <input
              className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-950"
              step="0.1"
              type="number"
              value={formState.threshold}
              onChange={(event) => onUpdate('threshold', event.target.value)}
            />
          </label>
        )}

        {hasUnit && <UnitInput value={formState.unit} onUpdate={onUpdate} />}

        <button
          className="mt-2 h-10 w-full rounded-lg bg-cyan-600 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-slate-300 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400 dark:disabled:bg-slate-700 dark:disabled:text-slate-400"
          type="button"
          disabled={!canSubmit}
          onClick={onAdd}
        >
          Add to Dashboard
        </button>
      </div>
    </div>
  )
}

function VariableSelect({
  label,
  value,
  names,
  allowEmpty = false,
  emptyMessage = 'No variables detected',
  onChange,
}) {
  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}
      <select
        className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-950"
        disabled={names.length === 0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {names.length === 0 && <option value="">{emptyMessage}</option>}
        {allowEmpty && names.length > 0 && (
          <option value="">— none —</option>
        )}
        {names.map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </label>
  )
}

function UnitInput({ value, onUpdate }) {
  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
      Unit
      <input
        className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-cyan-950"
        value={value}
        onChange={(event) => onUpdate('unit', event.target.value)}
      />
    </label>
  )
}

function renderWidget(config) {
  switch (config.type) {
    case 'line':
      return <LineChartWidget {...config} />
    case 'bar':
      return <BarChartWidget {...config} />
    case 'scatter':
      return <ScatterWidget {...config} />
    case 'gauge':
      return <GaugeWidget {...config} />
    case 'tachometer':
      return <TachometerWidget {...config} />
    case 'compass':
      return <CompassWidget {...config} />
    case 'battery':
      return <BatteryWidget {...config} />
    case 'led':
      return <LEDWidget {...config} />
    case 'stats':
      return <StatsCardWidget {...config} />
    case 'status':
      return <StatusTextWidget {...config} />
    case 'map':
      return <MapWidget {...config} />
    case 'orientation':
      return <OrientationWidget {...config} />
    default:
      return <NumberCardWidget {...config} />
  }
}

function IconShell({ children }) {
  return (
    <span className="grid size-8 place-items-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
      <svg
        className="size-4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        {children}
      </svg>
    </span>
  )
}

function LineIcon() {
  return (
    <IconShell>
      <path d="M4 17 9 11l4 3 7-8" />
    </IconShell>
  )
}

function BarIcon() {
  return (
    <IconShell>
      <path d="M5 20V9" />
      <path d="M12 20V4" />
      <path d="M19 20v-7" />
    </IconShell>
  )
}

function GaugeIcon() {
  return (
    <IconShell>
      <path d="M4 14a8 8 0 0 1 16 0" />
      <path d="m12 14 4-4" />
    </IconShell>
  )
}

function LedIcon() {
  return (
    <IconShell>
      <circle cx="12" cy="12" r="6" />
    </IconShell>
  )
}

function NumberIcon() {
  return (
    <IconShell>
      <path d="M8 7h8" />
      <path d="M8 12h8" />
      <path d="M8 17h5" />
    </IconShell>
  )
}

function ScatterIcon() {
  return (
    <IconShell>
      <circle cx="6" cy="18" r="1.4" />
      <circle cx="10" cy="13" r="1.4" />
      <circle cx="14" cy="9" r="1.4" />
      <circle cx="18" cy="6" r="1.4" />
      <circle cx="9" cy="17" r="1.4" />
      <circle cx="16" cy="12" r="1.4" />
    </IconShell>
  )
}

function TachometerIcon() {
  return (
    <IconShell>
      <path d="M4 16a8 8 0 0 1 16 0" />
      <path d="m12 16 5-5" />
      <circle cx="12" cy="16" r="1" />
    </IconShell>
  )
}

function CompassIcon() {
  return (
    <IconShell>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 15 2-6 4 2-2 6z" />
    </IconShell>
  )
}

function BatteryIcon() {
  return (
    <IconShell>
      <rect x="4" y="8" width="14" height="9" rx="1.5" />
      <path d="M19 11v3" />
      <path d="M7 11v3" />
      <path d="M10 10v5" />
    </IconShell>
  )
}

function StatsIcon() {
  return (
    <IconShell>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
    </IconShell>
  )
}

function StatusIcon() {
  return (
    <IconShell>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M7 12h4" />
      <circle cx="16" cy="12" r="1" />
    </IconShell>
  )
}

function MapIcon() {
  return (
    <IconShell>
      <path d="M9 4 4 6v14l5-2 6 2 5-2V4l-5 2-6-2z" />
      <path d="M9 4v14" />
      <path d="M15 6v14" />
    </IconShell>
  )
}

function OrientationIcon() {
  return (
    <IconShell>
      <path d="M4 7v10l8 4 8-4V7l-8-4-8 4z" />
      <path d="m4 7 8 4 8-4" />
      <path d="M12 11v10" />
    </IconShell>
  )
}

export default Dashboard
