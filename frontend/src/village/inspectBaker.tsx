import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bounds, Center } from '@react-three/drei'
import { StageBuilding, isLandmarkKey, type AnyBuildingKey } from './localCatalog'
import type { LandmarkStage, Stage } from './partTypes'

/**
 * 검수용 4방면 베이커 — 썸네일 베이커와 동일 원리(숨은 단일 캔버스 + toDataURL)지만
 * 건물을 Y축으로 az(0/90/180/270°) 회전시켜 각 면을 구운다. 카메라는 고정 코너뷰.
 * 헤드리스 브라우저에서도 <img>(dataURL)로 캡처된다.
 */

/**
 * stage 는 건물 종류에 따라 뜻이 다르다 — 일반 건물은 1~3, 랜드마크는 1~8.
 * 캐시 키에 그대로 들어가므로 같은 key 를 다른 의미로 굽는 충돌은 없다.
 */
type Job = { key: AnyBuildingKey; stage: Stage | LandmarkStage; az: number }

const cache = new Map<string, string>()
const queued = new Set<string>()
let queue: Job[] = []
const listeners = new Set<() => void>()

const ck = (k: string, s: number, a: number) => `${k}_s${s}_a${a}`
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => { listeners.delete(l) }
}

export function useInspectShot(
  key: AnyBuildingKey | null, stage: Stage | LandmarkStage, az: number,
): string | null {
  const id = key ? ck(key, stage, az) : ''
  const value = useSyncExternalStore(subscribe, () => (key ? cache.get(id) ?? null : null))
  useEffect(() => {
    if (!key) return
    if (cache.has(id) || queued.has(id)) return
    queued.add(id)
    queue.push({ key, stage, az })
    emit()
  }, [key, stage, az, id])
  return value
}

function BakeOne({ job, onDone }: { job: Job; onDone: (url: string) => void }) {
  const gl = useThree((s) => s.gl)
  const frame = useRef(0)
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    frame.current += 1
    if (frame.current >= 5) {
      done.current = true
      onDone(gl.domElement.toDataURL('image/png'))
    }
  })
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[4, 6, 3]} intensity={1.5} />
      <directionalLight position={[-3, 2, -2]} intensity={0.4} />
      <Bounds fit clip margin={1.15}>
        <Center>
          <group rotation={[0, (job.az * Math.PI) / 180, 0]}>
            <group scale={2.4}>
              <StageBuilding
                k={job.key}
                stage={isLandmarkKey(job.key) ? 3 : (job.stage as Stage)}
                landmarkStage={job.stage as LandmarkStage}
                theme="warm"
              />
            </group>
          </group>
        </Center>
      </Bounds>
    </>
  )
}

export function InspectBakery({ size = 340 }: { size?: number }) {
  const [tick, force] = useState(0)
  const [current, setCurrent] = useState<Job | null>(null)

  useEffect(() => subscribe(() => force((n) => n + 1)), [])
  useEffect(() => {
    if (!current && queue.length > 0) setCurrent(queue[0])
  }, [current, tick])

  const handleDone = (url: string) => {
    if (!current) return
    const key = ck(current.key, current.stage, current.az)
    cache.set(key, url)
    queue = queue.filter((j) => ck(j.key, j.stage, j.az) !== key)
    setCurrent(null)
    emit()
  }

  return (
    <div aria-hidden style={{ position: 'fixed', left: -99999, top: 0, width: size, height: size, pointerEvents: 'none' }}>
      <Canvas
        dpr={1}
        gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
        camera={{ position: [3, 2.2, 3], fov: 32 }}
        frameloop="always"
      >
        {current && <BakeOne key={ck(current.key, current.stage, current.az)} job={current} onDone={handleDone} />}
      </Canvas>
    </div>
  )
}
