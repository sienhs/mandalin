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

/**
 * 절두체를 세팅한다. **네 값을 항상 함께 쓴다.**
 *
 * <p>`place` 와 같은 이유로 함수로 뽑았다 — 초기 배치(useLayoutEffect)와 매 프레임
 * 갱신(useFrame)이 같은 식을 써야 한다. 한쪽만 고치면 첫 프레임에서 화면이 튄다.
 *
 * <p>`shift` 는 절두체를 카메라 좌표 기준으로 좌우로 민다. **줄이면 내용이 오른쪽으로
 * 간다** — 창(window)이 왼쪽으로 가면 같은 월드 좌표가 창 안에서 오른쪽에 놓이기 때문이다.
 *
 * <p>네 값을 전부 쓰는 것이 중요하다. prop 으로만 넘기면 R3F 가 바뀐 것만 반영하는데,
 * `half` 는 aspect 가 1.238 이상이면 상수라 `top`·`bottom` 이 갱신되지 않는다.
 */
function applyFrustum(
  camera: ThreeOrthographicCamera | null,
  half: number,
  aspect: number,
  shift: number,
): void {
  if (!camera) return
  camera.left = -half * aspect + shift
  camera.right = half * aspect + shift
  camera.top = half
  camera.bottom = -half
  camera.updateProjectionMatrix()
}

/**
 * UI 가 좌·우를 덮었을 때 마을이 화면에서 옮겨 가야 할 거리(px).
 *
 * <p>노출된 영역의 중심이 캔버스 중심에서 얼마나 벗어났는지다. 왼쪽이 덮였으면 노출
 * 중심이 오른쪽에 있으므로 양수 = 마을을 오른쪽으로.
 *
 * <p>원래 식은 `(oL + (w - oR))/2 - w/2` 였는데 펴면 캔버스 폭이 지워진다. 폭에 의존하지
 * 않는다는 사실이 식에 드러나 있어야 "창 크기가 바뀌면 이 값도 바뀌나" 를 매번 되짚지 않는다.
 */
function exposedCenterOffset(occludedLeft: number, occludedRight: number): number {
  return (occludedLeft - occludedRight) / 2
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
  /**
   * 화면 왼쪽·오른쪽에서 UI 가 덮은 폭(px). 마을이 <b>남은 영역의 중앙</b>으로 미끄러진다.
   *
   * <p>`focus` 와 하는 일이 다르다. `focus` 는 "무엇을 볼지"(월드 좌표)를 옮기고, 이쪽은
   * "그것이 화면 어디에 보일지"를 옮긴다. 그래서 회전해도 방향이 흔들리지 않는다 —
   * 절두체를 좌우로 미는 것이라 카메라 각도와 무관하다.
   *
   * <p>`focus` 로 대신할 수 없는 이유: look-at 을 옮기면 화면상 이동 방향이 `facing` 에
   * 따라 달라지는데, `facing` 은 state 인 반면 실제 각도는 프레임 보간이라 회전 중에
   * 오프셋이 튄다.
   */
  occludedLeft?: number
  occludedRight?: number
}

export function IsoCamera({
  handleRef,
  onFacingChange,
  initialZoom = DEFAULT_ZOOM,
  focus,
  occludedLeft = 0,
  occludedRight = 0,
}: Props) {
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
  /**
   * 마을을 화면에서 옮길 거리 — **픽셀 단위**로 들고 있는다.
   *
   * <p>월드 단위로 들면 확대할 때 어긋난다. three.js 직교 투영은 `left`·`right` 의 <b>중심</b>은
   * 그대로 쓰고 <b>폭</b>만 `zoom` 으로 나눈다(`dx = (right-left)/(2*zoom)`). 그래서 월드
   * 오프셋을 고정해 두면 화면상 이동량이 `offset × zoom` 이 되어, 확대할수록 마을이 과하게
   * 밀려난다(zoom 2.8 에서 2.8배).
   *
   * <p>패널이 덮는 폭은 픽셀로 고정이므로 보정도 픽셀로 고정이어야 한다. 그래서 여기서는
   * 픽셀을 보간하고, 월드 변환은 매 프레임 <b>지금 적용된 zoom</b>으로 한다.
   */
  const offsetRef = useRef(0)
  /** 지금 카메라에 들어가 있는 절두체 이동량(월드). 바뀔 때만 투영행렬을 다시 만든다. */
  const appliedShiftRef = useRef(0)

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

  /**
   * 마을이 화면에서 옮겨 가야 할 거리(px). {@link exposedCenterOffset} 참고.
   *
   * <p>밀되 <b>마을을 프레임 밖으로 내보내지는 않는다</b> — 절두체가 마을보다 넓을 때
   * 남는 여백(`slack`)까지만 민다. 이 제한이 없으면 배치 패널을 여는 순간 마을 오른쪽
   * 끝이 캔버스 밖으로 나간다.
   *
   * <p><b>여백은 확대 <i>목표값</i>(`ZOOM_PRESETS[zoom]`)으로 잰다. 프레임마다 움직이는
   * `zoomRef` 로 재면 안 된다.</b> 확대가 진행되는 동안 여백이 줄다가 어느 지점에서
   * 음수로 넘어가는데(비율 1.78 에서 zoom≈1.44), 거기서 제한이 통째로 풀리면 밀기 값이
   * 잘린 값에서 원래 값으로 <b>한 프레임에</b> 되돌아간다 — 실측 화면상 260px 이라
   * '멀리'에서 '가까이'로 한 번에 갈 때 카메라가 눈에 띄게 끊겼다.
   *
   * <p>목표값으로 재면 이 값은 <b>버튼을 누른 순간에만</b> 바뀌고, 그 차이는 아래
   * `offsetRef` 감속이 회전·확대와 같은 리듬으로 메운다. 잘라야 할 것은 여전히 잘리되
   * (확대가 끝난 상태에서는 목표값 = 실제값이라 결과가 같다) 도중에 튀지 않는다.
   *
   * <p>절두체가 마을보다 좁으면(확대한 상태) 제한하지 않는다. 그때는 잘라 보는 것이
   * 목적이고, 0 으로 묶으면 고른 블록이 패널 뒤에 숨어 확대가 쓸모없어진다.
   */
  const wantedOffset = ready ? exposedCenterOffset(occludedLeft, occludedRight) : 0
  const slack = (half * aspect) / ZOOM_PRESETS[zoom] - WORLD_WIDTH / 2
  const offsetLimit = (slack * ZOOM_PRESETS[zoom] * size.width) / (2 * half * aspect)
  const offsetGoal =
    ready && slack > 0
      ? Math.max(-offsetLimit, Math.min(offsetLimit, wantedOffset))
      : wantedOffset

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

    /*
      UI 가 덮은 만큼 마을을 남은 영역 중앙으로 민다. 각도·줌과 같은 감속을 써서 패널이
      열리고 닫힐 때 마을이 같은 리듬으로 미끄러진다.

      **보간은 픽셀로, 적용은 지금 zoom 으로.** 둘을 나눠 두면 확대와 패널이 서로 간섭하지
      않는다 — 확대 중에도(`zoomRef` 가 움직이는 동안) 마을이 패널 옆에 그대로 머문다.
      월드 오프셋을 보간했다면 zoom 이 바뀔 때마다 화면상 위치가 같이 튀었을 것이다.

      CSS transition 으로 캔버스를 움직이지 않는 이유: 캔버스를 늘리면 렌더 결과가 늘어나
      뭉개진다. 절두체를 옮기면 매 프레임 제대로 다시 그린다.
    */
    offsetRef.current += (offsetGoal - offsetRef.current) * t

    /*
      화면 1px 이 월드 몇 단위인지. zoom 이 크면(확대) 1px 이 덮는 월드가 작아진다.

      여기서는 <b>자르지 않는다.</b> 잘라야 할 몫은 위에서 목표 픽셀값에 이미 반영했고,
      이 자리는 그 값을 월드로 옮기기만 한다 — 매 프레임 다시 자르면 확대 도중에 조건이
      뒤집히며 카메라가 튄다(위 `offsetGoal` 주석 참고).
    */
    const worldPerPx = (2 * half * aspect) / zoomRef.current / size.width
    const wantShift = -offsetRef.current * worldPerPx

    if (Math.abs(wantShift - appliedShiftRef.current) > 0.0005) {
      appliedShiftRef.current = wantShift
      applyFrustum(camera, half, aspect, wantShift)
    }
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
  /*
    절두체를 매번 네 값 전부 다시 쓰고 투영행렬을 직접 갱신한다.

    **prop 으로만 넘기면 안 된다.** R3F 는 바뀐 prop 만 카메라에 반영하는데(applyProps 가
    diff 한다), `half` 는 aspect 가 1.238 이상이면 항상 WORLD_HEIGHT/2 로 고정이라
    `top`·`bottom` 이 "안 바뀐 prop" 이 된다. 그래서 창 비율만 달라지면 left·right 만
    갱신되고 top·bottom 은 그 순간 카메라에 남아 있던 값을 그대로 쓴다.

    그 남아 있던 값이 문제였다. `manual` 이 없으면 R3F 가 리사이즈마다 네 값을 **픽셀
    단위**로 덮어쓰는데(updateCamera: left=-width/2, top=height/2 …), 그 뒤 left·right 만
    월드 값으로 바뀌면 **가로는 월드(±26) 세로는 픽셀(±557)** 인 절두체가 된다. 세로 범위가
    20배 넓으니 마을이 가로로만 늘어난 얇은 띠로 짜부라진다. Ctrl+휠(브라우저 확대)에서
    유독 잘 드러난 것은 그때 aspect 와 devicePixelRatio 가 같이 흔들리기 때문이다.

    그래서 두 가지를 같이 한다.
      1. `manual` — R3F 가 절두체에 손대지 않게 한다(updateCamera 가 즉시 반환한다).
      2. `applyFrustum` 이 네 값을 전부 쓰고 updateProjectionMatrix 를 부른다. `manual` 이면
         drei 도 갱신을 건너뛰므로(OrthographicCamera.js) 부를 사람이 우리뿐이다.

    지금 적용된 이동량을 같이 넘긴다 — 크기가 바뀌었을 때 0 으로 되돌리면 패널이 열린 채
    마을이 중앙으로 튄다. 다음 프레임에 useFrame 이 새 비율로 다시 계산한다.
  */
  useLayoutEffect(() => {
    if (!ready) return
    applyFrustum(cameraRef.current, half, aspect, appliedShiftRef.current)
  }, [ready, half, aspect])

  return (
    <OrthographicCamera
      ref={cameraRef}
      makeDefault
      /*
        절두체는 위 useLayoutEffect 가 소유한다. R3F 가 픽셀 단위로 덮어쓰면 월드 좌표와
        섞여 화면이 짜부라진다.
      */
      manual
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
