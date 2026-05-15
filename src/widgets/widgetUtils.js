import { useMemo } from 'react'
import { useSerialStore } from '../store/serialStore'

const EMPTY_VALUES = []

export const SERIES_COLORS = [
  '#6366f1',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#a855f7',
  '#ec4899',
  '#84cc16',
]

export function useVariableSeries(variableName, limit = 100) {
  const values = useSerialStore(
    (state) => state.variables[variableName] ?? EMPTY_VALUES,
  )
  const timestamps = useSerialStore((state) => state.timestamps)

  return useMemo(() => {
    const visibleValues = values.slice(-limit)
    const visibleTimestamps = timestamps.slice(-visibleValues.length)

    return visibleValues.map((value, index) => ({
      index,
      timestamp: visibleTimestamps[index] ?? index,
      value,
    }))
  }, [limit, timestamps, values])
}

export function useMultiVariableSeries(variableNames, limit = 100) {
  const variables = useSerialStore((state) => state.variables)
  const timestamps = useSerialStore((state) => state.timestamps)

  return useMemo(() => {
    if (!variableNames || variableNames.length === 0) {
      return []
    }

    const seriesByName = {}
    let maxLength = 0

    for (const name of variableNames) {
      const values = variables[name] ?? EMPTY_VALUES
      const sliced = values.slice(-limit)
      seriesByName[name] = sliced
      if (sliced.length > maxLength) {
        maxLength = sliced.length
      }
    }

    if (maxLength === 0) {
      return []
    }

    const visibleTimestamps = timestamps.slice(-maxLength)
    const rows = []

    for (let index = 0; index < maxLength; index += 1) {
      const row = {
        index,
        timestamp: visibleTimestamps[index] ?? index,
      }

      for (const name of variableNames) {
        const series = seriesByName[name]
        const offset = series.length - maxLength
        const valueIndex = index + offset
        row[name] = valueIndex >= 0 ? series[valueIndex] : null
      }

      rows.push(row)
    }

    return rows
  }, [limit, timestamps, variables, variableNames])
}

export function resolveVariableNames(props) {
  if (Array.isArray(props.variableNames) && props.variableNames.length > 0) {
    return props.variableNames
  }

  if (props.variableName) {
    return [props.variableName]
  }

  return []
}

export function useVariableStats(variableName) {
  const values = useSerialStore(
    (state) => state.variables[variableName] ?? EMPTY_VALUES,
  )

  return useMemo(() => {
    if (values.length === 0) {
      return null
    }

    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((sum, value) => sum + value, 0) / values.length

    return { min, max, avg }
  }, [values])
}

export function getLatestValues(data) {
  const latest = data.at(-1)?.value ?? null
  const previous = data.at(-2)?.value ?? null

  return { latest, previous }
}

export function formatStat(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

export function formatValue(value, decimalPlaces = 2) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--'
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(decimalPlaces)
}

export function useStringVariable(variableName) {
  return useSerialStore(
    (state) => state.stringVariables[variableName] ?? null,
  )
}

export function useLatestValue(variableName) {
  return useSerialStore((state) => {
    const values = state.variables[variableName]
    return values && values.length > 0 ? values[values.length - 1] : null
  })
}
