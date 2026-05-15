import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSerialStore } from '../store/serialStore'
import { parseSerialLine, resetParser } from '../utils/parser'

export const BAUD_RATES = [
  300,
  1200,
  2400,
  4800,
  9600,
  19200,
  38400,
  57600,
  115200,
]

export function useSerial() {
  const [baudRate, setBaudRate] = useState(9600)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const [parseWarning, setParseWarning] = useState(false)
  const [readingsPerSecond, setReadingsPerSecond] = useState(0)
  const [reconnectRequestId, setReconnectRequestId] = useState(0)
  const [reconnectStatus, setReconnectStatus] = useState(null)
  const [toast, setToast] = useState('')
  const addLine = useSerialStore((state) => state.addLine)
  const clearData = useSerialStore((state) => state.clearData)
  const lines = useSerialStore((state) => state.rawLines)

  const portRef = useRef(null)
  const readerRef = useRef(null)
  const writerRef = useRef(null)
  const writerStreamClosedRef = useRef(null)
  const streamClosedRef = useRef(null)
  const keepReadingRef = useRef(false)
  const lineBufferRef = useRef('')
  const selectedPortRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const failedParseCountRef = useRef(0)
  const readingsThisSecondRef = useRef(0)
  const isPausedRef = useRef(false)

  const isSupported = useMemo(() => 'serial' in navigator, [])

  const appendLines = useCallback((incomingLines) => {
    if (incomingLines.length === 0) {
      return
    }

    for (const line of incomingLines) {
      if (isPausedRef.current) {
        continue
      }

      const parsedValues = parseSerialLine(line)
      readingsThisSecondRef.current += 1

      if (parsedValues) {
        failedParseCountRef.current = 0
        setParseWarning(false)
      } else if (line.trim()) {
        failedParseCountRef.current += 1

        if (failedParseCountRef.current >= 10) {
          setParseWarning(true)
        }
      }

      addLine(line, parsedValues)
    }
  }, [addLine])

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current)
      reconnectTimerRef.current = null
    }
  }, [])

  const closeConnection = useCallback(
    async ({ keepPort = false, unexpected = false } = {}) => {
      keepReadingRef.current = false

      const reader = readerRef.current
      readerRef.current = null

      if (reader) {
        try {
          await reader.cancel()
        } catch {
          // The device may already be gone; cleanup should continue.
        }

        try {
          reader.releaseLock()
        } catch {
          // Some browsers release the lock during cancellation.
        }
      }

      const streamClosed = streamClosedRef.current
      streamClosedRef.current = null

      if (streamClosed) {
        try {
          await streamClosed
        } catch {
          // Expected when canceling the read stream.
        }
      }

      const writer = writerRef.current
      writerRef.current = null

      if (writer) {
        try {
          await writer.close()
        } catch {
          // The device may already be gone; cleanup should continue.
        }

        try {
          writer.releaseLock()
        } catch {
          // Some browsers release the lock during close().
        }
      }

      const writerStreamClosed = writerStreamClosedRef.current
      writerStreamClosedRef.current = null

      if (writerStreamClosed) {
        try {
          await writerStreamClosed
        } catch {
          // Expected when closing the write stream.
        }
      }

      const port = portRef.current
      portRef.current = null

      if (port?.readable || port?.writable) {
        try {
          await port.close()
        } catch {
          // A physically removed port can reject close().
        }
      }

      lineBufferRef.current = ''
      resetParser()
      setIsConnected(false)

      if (!keepPort) {
        selectedPortRef.current = null
        clearReconnectTimer()
        setReconnectStatus(null)
      }

      if (unexpected) {
        setToast('Serial port disconnected unexpectedly')
      }
    },
    [clearReconnectTimer],
  )

  const readLoop = useCallback(
    async (reader) => {
      try {
        while (keepReadingRef.current) {
          const { value, done } = await reader.read()

          if (done) {
            break
          }

          if (!value) {
            continue
          }

          const normalizedChunk = value.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
          const parts = (lineBufferRef.current + normalizedChunk).split('\n')
          lineBufferRef.current = parts.pop() ?? ''
          appendLines(parts)
        }
      } catch (readError) {
        if (keepReadingRef.current) {
          setError(readError.message || 'Serial read failed')
          await closeConnection({ keepPort: true, unexpected: true })
          setReconnectRequestId((requestId) => requestId + 1)
        }
      }
    },
    [appendLines, closeConnection],
  )

  const openPort = useCallback(
    async (port, { resetData = false } = {}) => {
      await port.open({ baudRate: Number(baudRate) })

      const textDecoder = new TextDecoderStream()
      const streamClosed = port.readable.pipeTo(textDecoder.writable)
      const reader = textDecoder.readable.getReader()

      const textEncoder = new TextEncoderStream()
      const writerStreamClosed = textEncoder.readable.pipeTo(port.writable)
      const writer = textEncoder.writable.getWriter()

      selectedPortRef.current = port
      portRef.current = port
      readerRef.current = reader
      streamClosedRef.current = streamClosed
      writerRef.current = writer
      writerStreamClosedRef.current = writerStreamClosed
      keepReadingRef.current = true
      lineBufferRef.current = ''

      resetParser()
      failedParseCountRef.current = 0
      setParseWarning(false)
      setReconnectStatus(null)

      if (resetData) {
        clearData()
      }

      setIsConnected(true)
      void readLoop(reader)
    },
    [baudRate, clearData, readLoop],
  )

  const scheduleReconnect = useCallback(() => {
    let attempt = 1

    const runAttempt = () => {
      if (attempt > 5 || !selectedPortRef.current) {
        setReconnectStatus(null)
        return
      }

      let secondsRemaining = 3
      setReconnectStatus({ attempt, seconds: secondsRemaining })

      const tick = async () => {
        secondsRemaining -= 1

        if (secondsRemaining > 0) {
          setReconnectStatus({ attempt, seconds: secondsRemaining })
          reconnectTimerRef.current = setTimeout(tick, 1000)
          return
        }

        try {
          await openPort(selectedPortRef.current)
          setToast('Serial port reconnected')
        } catch {
          attempt += 1
          runAttempt()
        }
      }

      reconnectTimerRef.current = setTimeout(tick, 1000)
    }

    clearReconnectTimer()
    runAttempt()
  }, [clearReconnectTimer, openPort])

  const connect = useCallback(async () => {
    if (!isSupported) {
      setError('Use Chrome or Edge browser to use this app')
      return
    }

    try {
      setError('')
      setToast('')
      clearReconnectTimer()
      const port = await navigator.serial.requestPort()
      await openPort(port, { resetData: true })
    } catch (connectError) {
      setError(connectError.message || 'Unable to connect to serial port')
      await closeConnection()
    }
  }, [clearReconnectTimer, closeConnection, isSupported, openPort])

  const disconnect = useCallback(async () => {
    await closeConnection()
  }, [closeConnection])

  const sendCommand = useCallback(
    async (text, { appendNewline = true } = {}) => {
      const writer = writerRef.current

      if (!writer) {
        setError('Connect to a serial port before sending commands')
        return false
      }

      const payload = appendNewline && !text.endsWith('\n') ? `${text}\n` : text

      try {
        await writer.write(payload)
        return true
      } catch (writeError) {
        setError(writeError.message || 'Failed to send serial command')
        return false
      }
    },
    [],
  )

  const togglePause = useCallback(() => {
    setIsPaused((currentValue) => {
      const nextValue = !currentValue
      isPausedRef.current = nextValue
      return nextValue
    })
  }, [])

  useEffect(() => {
    const rateTimer = setInterval(() => {
      setReadingsPerSecond(readingsThisSecondRef.current)
      readingsThisSecondRef.current = 0
    }, 1000)

    return () => clearInterval(rateTimer)
  }, [])

  useEffect(() => {
    if (reconnectRequestId > 0) {
      scheduleReconnect()
    }
  }, [reconnectRequestId, scheduleReconnect])

  useEffect(() => {
    if (!isSupported) {
      return undefined
    }

    const handleDisconnect = (event) => {
      if (event.target === portRef.current) {
        void closeConnection({ keepPort: true, unexpected: true }).then(() => {
          setReconnectRequestId((requestId) => requestId + 1)
        })
      }
    }

    navigator.serial.addEventListener('disconnect', handleDisconnect)

    return () => {
      navigator.serial.removeEventListener('disconnect', handleDisconnect)
      void closeConnection()
    }
  }, [closeConnection, isSupported, scheduleReconnect])

  return {
    baudRate,
    setBaudRate,
    connect,
    disconnect,
    error,
    isConnected,
    isPaused,
    isSupported,
    lines,
    parseWarning,
    readingsPerSecond,
    reconnectStatus,
    sendCommand,
    toast,
    setToast,
    togglePause,
  }
}
