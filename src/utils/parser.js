let csvHeaders = null

function toNumber(value) {
  const parsedValue = Number(value.trim())
  return Number.isFinite(parsedValue) ? parsedValue : null
}

function parseCsvLine(line) {
  const columns = line.split(',').map((column) => column.trim())

  if (columns.length < 2) {
    return null
  }

  const numericColumns = columns.map(toNumber)
  const isNumericRow = numericColumns.every((value) => value !== null)

  if (!isNumericRow) {
    const isHeaderRow = columns.every(
      (column) => column.length > 0 && toNumber(column) === null,
    )

    if (isHeaderRow) {
      csvHeaders = columns
    }

    return null
  }

  if (!csvHeaders || csvHeaders.length !== numericColumns.length) {
    return null
  }

  return csvHeaders.reduce((values, header, index) => {
    values[header] = numericColumns[index]
    return values
  }, {})
}

function parseKeyValueLine(line) {
  if (!line.includes(':')) {
    return null
  }

  const pairs = line.split(',')
  const values = {}

  for (const pair of pairs) {
    const separatorIndex = pair.indexOf(':')

    if (separatorIndex === -1) {
      continue
    }

    const rawKey = pair.slice(0, separatorIndex).trim()
    const rawValue = pair.slice(separatorIndex + 1).trim()

    if (!rawKey || !rawValue) {
      continue
    }

    const numericValue = toNumber(rawValue)
    values[rawKey] = numericValue !== null ? numericValue : rawValue
  }

  return Object.keys(values).length > 0 ? values : null
}

function parseSingleValueLine(line) {
  const value = toNumber(line)
  return value === null ? null : { value }
}

export function parseSerialLine(line) {
  const trimmedLine = line.trim()

  if (!trimmedLine) {
    return null
  }

  return (
    parseCsvLine(trimmedLine) ??
    parseKeyValueLine(trimmedLine) ??
    parseSingleValueLine(trimmedLine)
  )
}

export function resetParser() {
  csvHeaders = null
}
