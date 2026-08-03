import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrthographicCamera } from '@react-three/drei'
import type { OrthographicCamera as ThreeOrthographicCamera } from 'three'

/**
 * 아이소메트릭 카메라.
 *
 * <p><b>원근이 아니라 직교 투영이다.</b> 2D 만다라트 화면이 평행 투영 격자라, 3D 마을만
 * 원근으로 그리면 같은 데이터인데도 다른 물건처럼 보인다. 직교로 두면 두 화면이
 * 수학적으로 같은 투영을 쓰게 되고, 멀리 있는 블록도 앞쪽 블록과 같은 크기로 보여
 * 9칸 격자가 격자로 읽힌다.
 *
 * <p>회전은 없애지 않고 <b>90° 스냅</b>으로 묶었다. 자유 회전(OrbitControls)은 건물 뒤를
 * 볼 수 있어 좋지만, 조금만 돌려도 수평선이 기울고 UI 오버레이와 각도가 어긋난다.
 * 네 방향만 허용하면 "뒤를 본다"는 요구는 남기고 화면은 항상 정돈된 상태를 유지한다.
 */

/** 지면에서 카메라를 들어 올리는 각도. 30°가 아이소메트릭의 관습적인 값이다. */
const ELEVATION = Math.PI / 6

/** 카메라가 도는 반경. 직교라 크기에는 영향이 없고 클리핑 여유만 결정한다. */
const RADIUS = 90

/**
 * 마을이 화면에 차지하는 크기.
 *
 * <p>대지 한 변(`SPAN`)이 약 35 단위인데, 아이소메트릭에서는 대각선으로 보이므로 가로로
 * 약 √2 배 넓어진다. 세로는 30° 각도 때문에 눌리는 대신 건물·랜드마크 높이가 더해진다.
 * 회전해도 정사각형이라 이 값은 변하지 않는다.
 */
const WORLD_WIDTH = 52
const WORLD_HEIGHT = 42

/**
 * 줌 프리셋. 값이 클수록 확대된다.
 *
 * <p>보이는 세로 = {@code WORLD_HEIGHT / zoom} 이므로 각각 42 / 28 / 15 단위다.
 * 42 는 마을 전체가 딱 들어오는 크기이고, 15 는 블록 한 개(8.6)에 길까지 붙는 크기다.
 *
 * <p>예전 값(0.75/1.0/1.5)은 가장 확대해도 마을 대부분이 보여서 세 단계가 다 비슷했다.
 * "전체 → 절반 → 블록 하나"로 잡으면 단계마다 보는 대상이 분명해진다.
 */
export const ZOOM_PRESETS = [1.0, 1.5, 2.8] as const
export type ZoomLevel = 0 | 1 | 2

/**
 * 처음 보여 줄 확대 단계 — '멀리'(마을 전체).
 *
 * <p>마을에 들어오면 먼저 전체를 봐야 한다. 확대된 채로 시작하면 일부만 보이는데
 * 그게 마을 전부인지 일부인지 알 방법이 없다. '원위치로'가 돌아오는 곳이기도 하다.
 */
export const DEFAULT_ZOOM: ZoomLevel = 0

/** 기본으로 바라보는 지점(마을 중심). 섬 아래 암반을 걷어냈으므로 지면 살짝 위를 본다. */
const TARGET: [number, number, number] = [0, 2, 0]

/** 3차원 좌표. focus prop 과 내부 보간에 쓴다. */
type Vec3 = [number, number, number]

/**
 * 카메라를 궤도 위 한 점에 놓고 마을 중심을 보게 한다.
 *
 * <p>초기 배치(useLayoutEffect)와 매 프레임 갱신(useFrame)이 <b>같은 식</b>을 써야 한다.
 * 두 곳에 따로 적으면 한쪽만 고쳤을 때 첫 프레임에서 카메라가 튄다.
 */
function place(
  camera: ThreeOrthographicCamera | null,
  angle: number,
  zoom: number,
  target: Vec3,
): void {
  if (!camera) return

  camera.position.set(
    target[0] + Math.cos(angle) * RADIUS * Math.cos(ELEVATION),
    target[1] + Math.sin(ELEVATION) * RADIUS,
    target[2] + Math.sin(angle) * RADIUS * Math.cos(ELEVATION),
  )
  camera.lookAt(target[0], target[1], target[2])

  if (Math.abs(camera.zoom - zoom) > 0.0005) {
    camera.zoom = zoom
    camera.updateProjectionMatrix()
  }
}

export type IsoCameraHandle = {
  /** 시계 방향으로 90° 돈다. */
  rotateCW: () => void
  rotateCCW: () => void
  setZoom: (level: ZoomLevel) => void
  /** 방향과 확대를 기본값으로 되돌린다. 시선은 확대가 '멀리'가 되면서 마을 중심으로 따라온다. */
  reset: () => void
  /** 현재 방향(0~3)과 줌 단계. UI 버튼의 활성 표시에 쓴다. */
  getState: () => { facing: number; zoom: ZoomLevel }
}

type Props = {
  /** 부모가 회전·줌을 조작할 수 있게 여는 통로. */
  handleRef?: React.Ref<IsoCameraHandle>
  /** 방향이 바뀔 때마다 알린다(라벨을 화면에 겹쳐 그릴 때 필요). */
  onFacingChange?: (facing: number) => void
  initialZoom?: ZoomLevel
  /**
   * 바라볼 지점. 생략하면 마을 중심이다.
   *
   * <p>확대 단계가 올라가면 마을이 화면에 다 안 들어오는데, 그때도 중심만 보고 있으면
   * 정작 사용자가 고른 블록이 화면 밖에 있을 수 있다. 부모가 고른 블록 좌표를 내려주면
   * 카메라가 그쪽으로 미끄러진다.
   */
  focus?: Vec3
}

export function IsoCamera({ handleRef, onFacingChange, initialZoom = DEFAULT_ZOOM, focus }: Props) {
  const cameraRef = useRef<ThreeOrthographicCamera>(null)
  const { gl, size } = useThree()

  /** 0~3. 0 = 남동쪽에서 보기(기본), 시계 방향으로 증가. */
  const [facing, setFacing] = useState(0)
  const [zoom, setZoomLevel] = useState<ZoomLevel>(initialZoom)

  /** 실제로 그려지는 각도. facing 이 바뀌면 이 값이 그쪽으로 따라간다(부드러운 전환). */
  const angleRef = useRef(Math.PI / 4)
  const zoomRef = useRef<number>(ZOOM_PRESETS[initialZoom])
  /** 실제로 바라보는 지점. focus 가 바뀌면 이 값이 그쪽으로 미끄러진다. */
  const targetRef = useRef<Vec3>([...TARGET])

  useImperativeHandle(
    handleRef,
    () => ({
      rotateCW: () => setFacing((f) => (f + 1) % 4),
      rotateCCW: () => setFacing((f) => (f + 3) % 4),
      setZoom: (level) => setZoomLevel(level),
      reset: () => {
        setFacing(0)
        setZoomLevel(DEFAULT_ZOOM)
      },
      getState: () => ({ facing, zoom }),
    }),
    [facing, zoom],
  )

  useEffect(() => {
    onFacingChange?.(facing)
  }, [facing, onFacingChange])

  /**
   * 첫 프레임 전에 카메라를 제자리에 놓는다.
   *
   * <p>위치 계산은 `useFrame` 이 하는데 그건 첫 렌더 <b>다음</b>에 돈다. 그 사이 한 프레임은
   * 카메라가 원점 근처에 있어 마을 내부가 화면을 가득 채운 채 번쩍인다.
   * `position` prop 으로 넘기지 않는 이유는, 매 렌더 새 배열이 들어가 R3F 가 위치를
   * 계속 되돌리고 그때마다 카메라가 튀기 때문이다.
   */
  useLayoutEffect(() => {
    place(cameraRef.current, angleRef.current, zoomRef.current, targetRef.current)
  }, [])

  /**
   * 끌어서 돌린다 — 단, <b>손을 따라가지 않는다.</b>
   *
   * <p>예전에는 드래그 거리에 각도를 실시간으로 물려 놨는데, 놓는 순간 가까운 90°로 튕겨
   * 돌아가느라 "내가 돌린 만큼"과 "실제로 돌아간 각도"가 늘 어긋났다. 조금 끌면 제자리로
   * 되돌아가고 많이 끌면 훌쩍 넘어가서, 같은 동작을 해도 결과가 달랐다.
   *
   * <p>그래서 <b>방향만 읽는다.</b> 한 번의 드래그 = 정확히 한 칸(90°). 손이 어디에 있든
   * 화면은 조용히 있다가, 놓으면 그때부터 한 칸 돈다. 예측이 되고 결과가 항상 같다.
   *
   * <p>짧게 누른 것은 회전이 아니라 건물 클릭이므로 임계값 아래는 무시한다.
   */
  useEffect(() => {
    const el = gl.domElement

    /** 이 거리를 넘겨야 회전으로 친다. 클릭과 구분되는 최소 폭이기도 하다. */
    const SWIPE = 48

    let pointerId: number | null = null
    let startX = 0
    let turned = false

    const onDown = (e: PointerEvent) => {
      // 주 버튼만. 우클릭·보조 버튼은 다른 용도로 남겨 둔다.
      if (e.button !== 0) return
      pointerId = e.pointerId
      startX = e.clientX
      turned = false
    }

    const onMove = (e: PointerEvent) => {
      if (pointerId !== e.pointerId || turned) return

      const dx = e.clientX - startX
      if (Math.abs(dx) < SWIPE) return

      /*
        임계값을 넘는 순간 한 칸 돌리고 이 제스처는 끝낸다(turned).
        계속 끌어도 더 돌지 않는다 — 한 번의 동작이 한 칸이라는 규칙을 지키기 위해서다.
        놓을 때까지 기다리지 않는 이유는, 손을 뗀 뒤에 움직이면 반응이 늦게 느껴져서다.
      */
      turned = true
      el.style.cursor = 'grabbing'
      setFacing((f) => (dx < 0 ? (f + 1) % 4 : (f + 3) % 4))
    }

    const onUp = (e: PointerEvent) => {
      if (pointerId !== e.pointerId) return
      pointerId = null
      el.style.cursor = 'grab'
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    el.addEventListener('pointerleave', onUp)

    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
      el.removeEventListener('pointerleave', onUp)
      el.style.cursor = 'grab'
    }
  }, [gl])

  /**
   * 목표 각도로 최단 경로를 따라 돈다.
   *
   * <p>3 → 0 으로 넘어갈 때 그냥 값을 대입하면 270°를 거꾸로 훑는다. 각도 차이를
   * ±π 안으로 접어서 항상 90°만 돌게 한다.
   */
  useFrame((_, delta) => {
    const camera = cameraRef.current
    if (!camera) return

    /*
      프레임 독립적인 감속. 약 0.45초에 걸쳐 한 칸을 돈다.
      예전(0.0015 ≒ 0.2초)은 눈 깜짝할 새라 어느 방향으로 돌았는지 못 따라갔다.
      회전이 보여야 어느 면을 보고 있는지 감각이 유지된다.
    */
    const t = 1 - Math.pow(0.02, delta)

    const goal = Math.PI / 4 + (facing * Math.PI) / 2
    let diff = goal - angleRef.current
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    angleRef.current += diff * t

    const targetZoom = ZOOM_PRESETS[zoom]
    zoomRef.current += (targetZoom - zoomRef.current) * t

    // 시선도 같은 감속으로 옮긴다. 순간이동하면 어디로 갔는지 따라갈 수 없다.
    const goalTarget = focus ?? TARGET
    for (let i = 0; i < 3; i++) {
      targetRef.current[i] += (goalTarget[i] - targetRef.current[i]) * t
    }

    place(camera, angleRef.current, zoomRef.current, targetRef.current)
  })

  /**
   * 창 크기가 어떻게 바뀌어도 마을 전체가 들어오도록 절두체를 잡는다(contain).
   *
   * <p>예전에는 세로만 기준으로 고정해서, 창을 좁히면 가로가 모자라 마을이 옆으로 잘렸다.
   * 가로·세로 <b>둘 다</b> 검사해 더 모자란 쪽에 맞추면 어떤 비율에서도 잘리지 않는다.
   * 창을 줄이면 마을이 작아질 뿐 구도는 그대로다.
   *
   * <p><b>크기가 아직 0 일 때를 반드시 걸러야 한다.</b> Canvas 가 마운트되는 첫 프레임에는
   * `size` 가 (0, 0) 으로 들어오는데, 그때 `width / height` 를 그대로 쓰면 aspect 가
   * 수천이 되고 절두체가 ±20000 까지 벌어진다. 마을이 점 하나로 사라져서
   * "카메라가 어디론가 날아간" 것처럼 보인다.
   */
  const ready = size.width > 0 && size.height > 0
  const aspect = ready ? size.width / size.height : 1
  // 세로로 담으려면 이만큼, 가로로 담으려면 이만큼 — 둘 중 큰 값을 쓴다.
  const half = Math.max(WORLD_HEIGHT / 2, WORLD_WIDTH / 2 / aspect)

  return (
    <OrthographicCamera
      ref={cameraRef}
      makeDefault
      left={-half * aspect}
      right={half * aspect}
      top={half}
      bottom={-half}
      // 카메라가 마을 밖(반경 90)에 있으므로 양수 범위로 충분하다.
      // 음수 near 는 깊이 정밀도를 낭비해 면이 겹쳐 깜빡이게 만든다.
      near={1}
      far={400}
      zoom={ZOOM_PRESETS[initialZoom]}
    />
  )
}

/**
 * 카메라 조작 훅.
 *
 * <p>Canvas 밖(HTML)에서 버튼을 그리려면 핸들이 필요한데, ref 를 그대로 넘기면
 * 부모가 매 렌더 새 객체를 만들어 카메라가 다시 마운트된다. 훅으로 감싸 안정적인
 * 참조를 준다.
 */
export function useIsoCamera() {
  const ref = useRef<IsoCameraHandle>(null)
  const [facing, setFacing] = useState(0)
  const [zoom, setZoom] = useState<ZoomLevel>(DEFAULT_ZOOM)

  const rotateCW = useCallback(() => ref.current?.rotateCW(), [])
  const rotateCCW = useCallback(() => ref.current?.rotateCCW(), [])
  const changeZoom = useCallback((level: ZoomLevel) => {
    setZoom(level)
    ref.current?.setZoom(level)
  }, [])

  /*
    바깥 상태(버튼 활성 표시용)와 카메라 안 상태를 함께 되돌린다.
    facing 은 카메라가 onFacingChange 로 알려 주므로 여기서 건드리지 않는다 —
    양쪽에서 쓰면 어느 쪽이 정본인지 흐려진다.
  */
  const reset = useCallback(() => {
    setZoom(DEFAULT_ZOOM)
    ref.current?.reset()
  }, [])

  return { ref, facing, setFacing, zoom, changeZoom, rotateCW, rotateCCW, reset }
}
