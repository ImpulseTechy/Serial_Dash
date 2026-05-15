import { Suspense, useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import WidgetCard from './WidgetCard'
import EmptyWidgetState from './EmptyWidgetState'
import { useLatestValue } from './widgetUtils'

function toRadians(degrees) {
  return (degrees * Math.PI) / 180
}

function OrientedCube({ rollRef, pitchRef, yawRef }) {
  const meshRef = useRef(null)

  useFrame(() => {
    if (!meshRef.current) {
      return
    }
    const targetRoll = toRadians(rollRef.current ?? 0)
    const targetPitch = toRadians(pitchRef.current ?? 0)
    const targetYaw = toRadians(yawRef.current ?? 0)
    meshRef.current.rotation.x +=
      (targetPitch - meshRef.current.rotation.x) * 0.2
    meshRef.current.rotation.y += (targetYaw - meshRef.current.rotation.y) * 0.2
    meshRef.current.rotation.z +=
      (targetRoll - meshRef.current.rotation.z) * 0.2
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <boxGeometry args={[1.6, 0.25, 2.4]} />
        <meshStandardMaterial color="#0891b2" metalness={0.4} roughness={0.5} />
      </mesh>
      <axesHelper args={[2]} />
    </group>
  )
}

export function OrientationWidget({
  title,
  rollVariable = 'roll',
  pitchVariable = 'pitch',
  yawVariable = 'yaw',
}) {
  const roll = useLatestValue(rollVariable)
  const pitch = useLatestValue(pitchVariable)
  const yaw = useLatestValue(yawVariable)

  const rollRef = useRef(roll)
  const pitchRef = useRef(pitch)
  const yawRef = useRef(yaw)

  useEffect(() => {
    rollRef.current = roll
    pitchRef.current = pitch
    yawRef.current = yaw
  }, [roll, pitch, yaw])

  const variableNames = useMemo(
    () => [rollVariable, pitchVariable, yawVariable],
    [rollVariable, pitchVariable, yawVariable],
  )
  const hasData = roll !== null || pitch !== null || yaw !== null

  return (
    <WidgetCard title={title} variableNames={variableNames}>
      {!hasData ? (
        <EmptyWidgetState label="Waiting for orientation data" />
      ) : (
        <div className="flex h-full flex-col">
          <div className="h-48 min-h-40 overflow-hidden rounded-lg bg-slate-900">
            <Suspense fallback={null}>
              <Canvas camera={{ position: [3, 2.5, 3.5], fov: 50 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 5, 5]} intensity={0.8} />
                <OrientedCube
                  rollRef={rollRef}
                  pitchRef={pitchRef}
                  yawRef={yawRef}
                />
              </Canvas>
            </Suspense>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800 dark:text-slate-200">
              <div className="text-slate-500 dark:text-slate-400">roll</div>
              <div>{roll === null ? '--' : roll.toFixed(1)}°</div>
            </div>
            <div className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800 dark:text-slate-200">
              <div className="text-slate-500 dark:text-slate-400">pitch</div>
              <div>{pitch === null ? '--' : pitch.toFixed(1)}°</div>
            </div>
            <div className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800 dark:text-slate-200">
              <div className="text-slate-500 dark:text-slate-400">yaw</div>
              <div>{yaw === null ? '--' : yaw.toFixed(1)}°</div>
            </div>
          </div>
        </div>
      )}
    </WidgetCard>
  )
}
