import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Bounds, Center } from '@react-three/drei'
import { StageBuilding } from './buildings'
import type { BuildingKey, Stage } from './catalog'

/**
 * 썸네일 베이커 — WebGL 컨텍스트 폭발 방지.
 *
 * 건물마다 <Canvas>를 띄우면 브라우저 컨텍스트 한도(~16)를 금방 넘겨 마을 캔버스가 손실됨.
 * 대신 숨겨진 **단일 캔버스 하나**가 큐의 건물을 하나씩 렌더→toDataURL로 구워 캐시하고,
 * 화면에는 <img>(BuildingImage)로만 표시한다. → 컨텍스트는 마을(1) + 베이커(1) = 2개 고정.
 */

type Job = { k: BuildingKey; stage: Stage }

const cache = new Map<string, string>()
const queued = new Set<string>()
let queue: Job[] = []
const listeners = new Set<() => void>()

const ck = (k: string, s: number) => `${k}_s${s}`
const emit = () => listeners.forEach((l) => l())
const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export function requestThumbnail(k: BuildingKey, stage: Stage) {
  const key = ck(k, stage)
  if (cache.has(key) || queued.has(key)) return
  queued.add(key)
  queue.push({ k, stage })
  emit()
}

export function getCachedThumbnail(k: BuildingKey, stage: Stage): string | null {
  return cache.get(ck(k, stage)) ?? null
}

/** 캐시된 dataURL 반환. 없으면 베이킹 큐에 등록하고 완료 시 리렌더. */
export function useThumbnail(k: BuildingKey | null, stage: Stage): string | null {
  const key = k ? ck(k, stage) : ''
  const value = useSyncExternalStore(
    subscribe,
    () => (k ? cache.get(key) ?? null : null),
  )
  useEffect(() => {
    if (k) requestThumbnail(k, stage)
  }, [k, stage, key])
  return value
}

/** 캔버스 내부: 현재 job을 몇 프레임 렌더 후 캡처. */
function BakeOne({ job, onDone }: { job: Job; onDone: (url: string) => void }) {
  const gl = useThree((s) => s.gl)
  const frame = useRef(0)
  const done = useRef(false)
  useFrame(() => {
    if (done.current) return
    frame.current += 1
    if (frame.current >= 4) {
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
          <group scale={2.4}>
            <StageBuilding k={job.k} stage={job.stage} theme="warm" />
          </group>
        </Center>
      </Bounds>
    </>
  )
}

/**
 * 앱에 1개만 마운트하면 됨(썸네일 쓰는 페이지에 배치).
 * 숨겨진 단일 캔버스가 큐를 순차 처리.
 */
export function ThumbnailBakery({ size = 160 }: { size?: number }) {
  const [tick, force] = useState(0)
  const [current, setCurrent] = useState<Job | null>(null)

  useEffect(() => subscribe(() => force((n) => n + 1)), [])

  // 유휴 상태거나 큐가 바뀌면 다음 job을 꺼냄
  useEffect(() => {
    if (!current && queue.length > 0) setCurrent(queue[0])
  }, [current, tick])

  const handleDone = (url: string) => {
    if (!current) return
    const key = ck(current.k, current.stage)
    cache.set(key, url)
    queue = queue.filter((j) => ck(j.k, j.stage) !== key)
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
        {current && <BakeOne key={ck(current.k, current.stage)} job={current} onDone={handleDone} />}
      </Canvas>
    </div>
  )
}
