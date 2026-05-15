import { useEffect, useRef, useState } from 'react'

function ChartViewport({ children, className = 'h-56 min-h-40 min-w-0' }) {
  const containerRef = useRef(null)
  const [size, setSize] = useState({ height: 0, width: 0 })

  useEffect(() => {
    const node = containerRef.current

    if (!node) {
      return undefined
    }

    const updateSize = () => {
      const rect = node.getBoundingClientRect()
      setSize({
        height: Math.max(0, Math.floor(rect.height)),
        width: Math.max(0, Math.floor(rect.width)),
      })
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  return (
    <div className={className} ref={containerRef}>
      {size.width > 0 && size.height > 0 ? children(size) : null}
    </div>
  )
}

export default ChartViewport
