import { useMemo } from 'react'
import { BackSide, Color, ShaderMaterial } from 'three'
import type { Terrain } from './villageApi'

/**
 * 2색 그라디언트 하늘.
 *
 * <p>drei `Sky` 는 대기 산란을 실제로 계산한다(turbidity·rayleigh). 사실적이지만 2D 화면의
 * 담백한 배경과 나란히 놓으면 두 화면이 다른 세계처럼 보인다. 같은 정보를 담되 톤을
 * 맞추려고 위·아래 두 색만 섞는 큰 구체로 바꿨다.
 *
 * <p>색은 2D 마을 뷰(`IsoVillage` 의 TERRAIN_STYLE.sky)와 같은 값이다. 한쪽을 고치면
 * 다른 쪽도 같이 고쳐야 두 화면이 어긋나지 않는다.
 *
 * <p>부수 효과로 무거운 산란 셰이더가 사라져 첫 프레임이 빨라진다.
 */
const SKY_GRADIENT: Record<Terrain, [string, string]> = {
  GRASS_PATH: ['#dff3ff', '#f4fbf2'],
  CITY_ROAD: ['#e8eefc', '#f7f8fb'],
  WATER_WAY: ['#dff6ff', '#f0fbff'],
  DIRT_ROAD: ['#fff2df', '#fdf8f0'],
}

const VERTEX = /* glsl */ `
  varying vec3 vWorld;
  void main() {
    vWorld = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

/**
 * 위아래로만 섞는다. 수평선 근처를 부드럽게 하려고 smoothstep 을 한 번 태운다 —
 * 선형으로 두면 지평선에 띠가 보인다.
 */
const FRAGMENT = /* glsl */ `
  varying vec3 vWorld;
  uniform vec3 topColor;
  uniform vec3 bottomColor;

  void main() {
    float h = normalize(vWorld).y * 0.5 + 0.5;
    float t = smoothstep(0.15, 0.85, h);
    gl_FragColor = vec4(mix(bottomColor, topColor, t), 1.0);
    #include <colorspace_fragment>
  }
`

export function SkyBackdrop({ terrain }: { terrain: Terrain }) {
  const material = useMemo(() => {
    const [top, bottom] = SKY_GRADIENT[terrain] ?? SKY_GRADIENT.GRASS_PATH
    return new ShaderMaterial({
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      side: BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new Color(top) },
        bottomColor: { value: new Color(bottom) },
      },
    })
  }, [terrain])

  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[300, 24, 16]} />
    </mesh>
  )
}

/** 배경 클리어 색. 구체가 덮지 못하는 프레임(첫 렌더)에도 같은 톤을 유지한다. */
export function skyClearColor(terrain: Terrain): string {
  return (SKY_GRADIENT[terrain] ?? SKY_GRADIENT.GRASS_PATH)[1]
}

/**
 * 같은 하늘을 CSS 그라디언트로.
 *
 * <p>배경 고르는 화면의 '기본' 칸이 쓴다. 거기서 색을 따로 적으면 위 표를 고칠 때마다
 * 미리보기만 예전 색으로 남으므로, 값을 한 곳에서만 읽게 한다.
 */
export function skyGradientCss(terrain: Terrain): string {
  const [top, bottom] = SKY_GRADIENT[terrain] ?? SKY_GRADIENT.GRASS_PATH
  return `linear-gradient(180deg, ${top}, ${bottom})`
}
