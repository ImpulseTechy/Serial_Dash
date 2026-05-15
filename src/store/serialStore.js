import { create } from 'zustand'

const MAX_RAW_LINES = 200
const MAX_VARIABLE_VALUES = 100
const DASHBOARD_STORAGE_KEY = 'serial-dashboard-layout'

function appendValue(values = [], value) {
  return [...values, value].slice(-MAX_VARIABLE_VALUES)
}

function saveDashboardState(widgetConfigs, layouts, controls) {
  try {
    localStorage.setItem(
      DASHBOARD_STORAGE_KEY,
      JSON.stringify({ widgetConfigs, layouts, controls }),
    )
  } catch {
    // Dashboard editing should continue even if storage is unavailable.
  }
}

function loadDashboardState() {
  try {
    const storedState = localStorage.getItem(DASHBOARD_STORAGE_KEY)
    return storedState ? JSON.parse(storedState) : null
  } catch {
    return null
  }
}

function createControlId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `control-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const useSerialStore = create((set, get) => ({
  rawLines: [],
  variables: {},
  stringVariables: {},
  timestamps: [],
  widgetConfigs: [],
  layouts: [],
  controls: [],

  addLine: (line, parsedValues = null) =>
    set((state) => {
      const nextState = {
        rawLines: [...state.rawLines, line].slice(-MAX_RAW_LINES),
      }

      if (!parsedValues) {
        return nextState
      }

      const timestamp = Date.now()
      const nextVariables = { ...state.variables }
      const nextStringVariables = { ...state.stringVariables }
      let hasNumeric = false

      for (const [key, value] of Object.entries(parsedValues)) {
        if (typeof value === 'number') {
          nextVariables[key] = appendValue(nextVariables[key], value)
          hasNumeric = true
        } else {
          nextStringVariables[key] = value
        }
      }

      return {
        ...nextState,
        variables: nextVariables,
        stringVariables: nextStringVariables,
        timestamps: hasNumeric
          ? [...state.timestamps, timestamp].slice(-MAX_VARIABLE_VALUES)
          : state.timestamps,
      }
    }),

  clearData: () =>
    set({
      rawLines: [],
      variables: {},
      stringVariables: {},
      timestamps: [],
    }),

  addWidget: (widgetConfig) =>
    set((state) => {
      const compact =
        widgetConfig.type === 'number' ||
        widgetConfig.type === 'led' ||
        widgetConfig.type === 'stats' ||
        widgetConfig.type === 'status'
      const tall =
        widgetConfig.type === 'map' || widgetConfig.type === 'orientation'
      const height = tall ? 4 : compact ? 2 : 3

      const nextWidgetConfigs = [...state.widgetConfigs, widgetConfig]
      const nextLayouts = [
        ...state.layouts,
        {
          i: widgetConfig.id,
          x: (state.layouts.length * 4) % 12,
          y: Infinity,
          w: 4,
          h: height,
          minW: 3,
          minH: 2,
        },
      ]

      saveDashboardState(nextWidgetConfigs, nextLayouts, state.controls)

      return {
        widgetConfigs: nextWidgetConfigs,
        layouts: nextLayouts,
      }
    }),

  removeWidget: (widgetId) =>
    set((state) => {
      const nextWidgetConfigs = state.widgetConfigs.filter(
        (config) => config.id !== widgetId,
      )
      const nextLayouts = state.layouts.filter((layout) => layout.i !== widgetId)

      saveDashboardState(nextWidgetConfigs, nextLayouts, state.controls)

      return {
        widgetConfigs: nextWidgetConfigs,
        layouts: nextLayouts,
      }
    }),

  setLayouts: (layouts) =>
    set((state) => {
      saveDashboardState(state.widgetConfigs, layouts, state.controls)
      return { layouts }
    }),

  loadTemplate: (template) =>
    set((state) => {
      const nextWidgetConfigs = []
      const nextLayouts = []

      template.widgets.forEach((widget, index) => {
        const id =
          (typeof crypto !== 'undefined' && crypto.randomUUID?.()) ||
          `widget-${Date.now()}-${index}`
        const config = { ...widget, id }
        const isCompact =
          widget.type === 'number' ||
          widget.type === 'led' ||
          widget.type === 'stats' ||
          widget.type === 'status'
        const isTall =
          widget.type === 'map' || widget.type === 'orientation'
        const height = isTall ? 4 : isCompact ? 2 : 3

        nextWidgetConfigs.push(config)
        nextLayouts.push({
          i: id,
          x: (index * 4) % 12,
          y: Math.floor(index / 3) * 3,
          w: 4,
          h: height,
          minW: 3,
          minH: 2,
        })
      })

      saveDashboardState(nextWidgetConfigs, nextLayouts, state.controls)

      return {
        widgetConfigs: nextWidgetConfigs,
        layouts: nextLayouts,
      }
    }),

  addControl: (control) =>
    set((state) => {
      const nextControl = { ...control, id: control.id ?? createControlId() }
      const nextControls = [...state.controls, nextControl]
      saveDashboardState(state.widgetConfigs, state.layouts, nextControls)
      return { controls: nextControls }
    }),

  removeControl: (controlId) =>
    set((state) => {
      const nextControls = state.controls.filter(
        (control) => control.id !== controlId,
      )
      saveDashboardState(state.widgetConfigs, state.layouts, nextControls)
      return { controls: nextControls }
    }),

  updateControl: (controlId, patch) =>
    set((state) => {
      const nextControls = state.controls.map((control) =>
        control.id === controlId ? { ...control, ...patch } : control,
      )
      saveDashboardState(state.widgetConfigs, state.layouts, nextControls)
      return { controls: nextControls }
    }),

  loadDashboardFromStorage: () => {
    const storedState = loadDashboardState()

    if (!storedState) {
      return
    }

    set({
      widgetConfigs: Array.isArray(storedState.widgetConfigs)
        ? storedState.widgetConfigs
        : [],
      layouts: Array.isArray(storedState.layouts) ? storedState.layouts : [],
      controls: Array.isArray(storedState.controls) ? storedState.controls : [],
    })
  },

  exportCsv: () => {
    const { timestamps, variables } = get()
    const variableNames = Object.keys(variables)
    const rowCount = Math.max(timestamps.length, 0)

    if (variableNames.length === 0 || rowCount === 0) {
      return 'timestamp'
    }

    const rows = [['timestamp', ...variableNames]]

    for (let index = 0; index < rowCount; index += 1) {
      rows.push([
        new Date(timestamps[index]).toISOString(),
        ...variableNames.map((name) => {
          const values = variables[name]
          const offset = values.length - rowCount
          return values[index + offset] ?? ''
        }),
      ])
    }

    return rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','),
      )
      .join('\n')
  },
}))
