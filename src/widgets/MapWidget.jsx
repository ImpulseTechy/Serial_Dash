import { useEffect, useMemo, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'
import WidgetCard from './WidgetCard'
import EmptyWidgetState from './EmptyWidgetState'
import { useMultiVariableSeries } from './widgetUtils'

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

export function MapWidget({
  title,
  latVariable = 'lat',
  lonVariable = 'lon',
}) {
  const variableNames = useMemo(
    () => [latVariable, lonVariable],
    [latVariable, lonVariable],
  )
  const series = useMultiVariableSeries(variableNames, 200)

  const path = useMemo(() => {
    const points = []
    for (const row of series) {
      const lat = row[latVariable]
      const lon = row[lonVariable]
      if (typeof lat === 'number' && typeof lon === 'number') {
        points.push([lat, lon])
      }
    }
    return points
  }, [series, latVariable, lonVariable])

  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const polylineRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return undefined
    }

    const map = L.map(containerRef.current, {
      zoomControl: true,
      attributionControl: false,
      preferCanvas: true,
    }).setView([0, 0], 2)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map)

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
      markerRef.current = null
      polylineRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || path.length === 0) {
      return
    }

    if (!polylineRef.current) {
      polylineRef.current = L.polyline(path, {
        color: '#06b6d4',
        weight: 3,
      }).addTo(map)
    } else {
      polylineRef.current.setLatLngs(path)
    }

    const latest = path[path.length - 1]

    if (!markerRef.current) {
      markerRef.current = L.marker(latest, { icon: defaultIcon }).addTo(map)
      map.setView(latest, 15)
    } else {
      markerRef.current.setLatLng(latest)
      map.panTo(latest, { animate: true, duration: 0.3 })
    }
  }, [path])

  useEffect(() => {
    const map = mapRef.current
    if (!map) {
      return undefined
    }

    const resize = () => map.invalidateSize()
    const observer = new ResizeObserver(resize)

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <WidgetCard title={title} variableNames={variableNames}>
      {path.length === 0 ? (
        <EmptyWidgetState label="Waiting for GPS coordinates" />
      ) : (
        <div
          ref={containerRef}
          className="h-64 min-h-40 w-full overflow-hidden rounded-lg"
        />
      )}
    </WidgetCard>
  )
}
