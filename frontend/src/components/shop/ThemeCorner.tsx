/**
 * 상점 카드 우측 상단의 테마 장식.
 *
 * <p>256개 카드가 이름과 가격만 다른 흰 상자로 늘어서면 무엇을 고르는지가 아니라
 * 몇 개가 남았는지만 보인다. 테마마다 다른 무늬를 깔면 스크롤하는 동안 "여긴 벚꽃 구역,
 * 여긴 사이버 구역"이 눈에 남는다.
 *
 * <p><b>설계 규칙 세 가지.</b>
 * <ol>
 *   <li><b>정적이다.</b> 움직이는 장식을 256개 깔면 스크롤이 끊긴다. 애니메이션 없음.
 *   <li><b>구석에만 있다.</b> 카드 전체를 덮으면 건물 그림과 글자가 안 읽힌다.
 *       우측 상단에서 뻗어 나오다 페이드로 사라진다.
 *   <li><b>연하다.</b> 주인공은 건물 그림이다. 무늬가 그보다 진하면 카드가 시끄러워진다.
 * </ol>
 *
 * <p>이미지 파일이 아니라 인라인 SVG 인 이유는 13장을 받아 오는 네트워크 비용을 없애고,
 * 다크 모드에서 색을 함께 낮출 수 있어서다. 파일이면 밝은 무늬가 어두운 카드 위에 떠 버린다.
 */

/** 테마별 주조색. 무늬는 이 색 하나에서 농도만 달리해 그린다. */
const TINT: Record<string, string> = {
  BASIC: '#94a3b8',
  SAKURA: '#f472b6',
  CYBER: '#facc15',
  SEOUL: '#60a5fa',
  WEST: '#d97706',
  MEDIEVAL: '#a8a29e',
  SANTORINI: '#38bdf8',
  SCIFI: '#a78bfa',
  TROPICAL: '#34d399',
  NORDIC: '#7dd3fc',
  STEAMPUNK: '#b45309',
  EGYPT: '#eab308',
  ARTDECO: '#f59e0b',
  LANDMARK: '#fb923c',
}

/**
 * 테마별 무늬. 모두 88×88 좌표계에서 <b>우측 상단(88,0) 근처</b>부터 그린다.
 *
 * <p>각 무늬는 그 테마가 무엇인지 한눈에 말해야 한다 — 벚꽃은 흩날리는 꽃잎, 사이버는
 * 회로 선, 이집트는 피라미드. 추상 도형으로 통일하면 예쁘긴 해도 구분이 안 된다.
 */
function pattern(theme: string, c: string): React.ReactNode {
  switch (theme) {
    // 흩날리는 꽃잎 — 크기와 각도를 흩어 바람에 실린 느낌을 낸다.
    case 'SAKURA':
      return (
        <>
          {[
            [70, 12, 7, 20],
            [84, 30, 5.5, -35],
            [56, 30, 4.5, 55],
            [76, 52, 4, -10],
            [62, 8, 3.5, 70],
          ].map(([x, y, r, rot], i) => (
            <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`} opacity={0.9 - i * 0.13}>
              <path
                d={`M0 ${-r} C ${r * 0.9} ${-r * 0.6}, ${r * 0.9} ${r * 0.6}, 0 ${r} C ${-r * 0.9} ${r * 0.6}, ${-r * 0.9} ${-r * 0.6}, 0 ${-r} Z`}
                fill={c}
              />
            </g>
          ))}
        </>
      )

    // 회로 기판 — 직각으로 꺾이는 선과 접점.
    case 'CYBER':
      return (
        <g fill="none" stroke={c} strokeWidth="2" strokeLinecap="square">
          <path d="M88 10 H66 V32 H44" opacity=".9" />
          <path d="M88 26 H76 V48" opacity=".65" />
          <path d="M88 44 H58" opacity=".45" />
          <circle cx="44" cy="32" r="3" fill={c} stroke="none" opacity=".9" />
          <circle cx="76" cy="48" r="2.5" fill={c} stroke="none" opacity=".65" />
        </g>
      )

    // 피라미드 세 채.
    case 'EGYPT':
      return (
        <g fill={c}>
          <path d="M88 44 L70 10 L52 44 Z" opacity=".85" />
          <path d="M62 44 L50 22 L38 44 Z" opacity=".5" />
          <circle cx="60" cy="8" r="5" opacity=".7" />
        </g>
      )

    // 아르데코 — 계단식 부채살.
    case 'ARTDECO':
      return (
        <g fill="none" stroke={c} strokeWidth="2.5">
          <path d="M88 46 A 42 42 0 0 0 46 4" opacity=".85" />
          <path d="M88 32 A 28 28 0 0 0 60 4" opacity=".6" />
          <path d="M88 18 A 14 14 0 0 0 74 4" opacity=".4" />
        </g>
      )

    // 톱니바퀴와 파이프.
    case 'STEAMPUNK':
      return (
        <g stroke={c} fill="none" strokeWidth="2.5">
          <circle cx="70" cy="22" r="14" opacity=".85" />
          <circle cx="70" cy="22" r="5" opacity=".85" />
          {[0, 45, 90, 135].map((a) => (
            <line
              key={a}
              x1={70 + 14 * Math.cos((a * Math.PI) / 180)}
              y1={22 + 14 * Math.sin((a * Math.PI) / 180)}
              x2={70 + 19 * Math.cos((a * Math.PI) / 180)}
              y2={22 + 19 * Math.sin((a * Math.PI) / 180)}
              opacity=".85"
            />
          ))}
          <path d="M44 46 H56 V34" opacity=".45" />
        </g>
      )

    // 야자수 잎.
    case 'TROPICAL':
      return (
        <g stroke={c} fill="none" strokeWidth="2.5" strokeLinecap="round">
          <path d="M88 6 C 70 10, 58 24, 54 44" opacity=".85" />
          {[
            [80, 9, 68, 2],
            [72, 15, 62, 8],
            [64, 24, 56, 18],
            [58, 34, 51, 29],
          ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} opacity={0.7 - i * 0.1} />
          ))}
        </g>
      )

    // 오로라 — 세로로 흐르는 빛의 띠.
    case 'NORDIC':
      return (
        <g stroke={c} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M60 2 C 66 16, 62 30, 68 46" opacity=".7" />
          <path d="M72 2 C 78 18, 74 32, 80 48" opacity=".5" />
          <path d="M84 2 C 88 14, 86 26, 88 38" opacity=".32" />
        </g>
      )

    // 파란 돔과 흰 벽.
    case 'SANTORINI':
      return (
        <g fill={c}>
          <path d="M56 44 A 14 14 0 0 1 84 44 Z" opacity=".85" />
          <rect x="56" y="44" width="28" height="4" opacity=".5" />
          <circle cx="70" cy="24" r="2.5" opacity=".6" />
        </g>
      )

    // 성벽 총안(凸凹).
    case 'MEDIEVAL':
      return (
        <g fill={c}>
          <path d="M44 20 h8 v-8 h8 v8 h8 v-8 h8 v8 h8 v-8 h4 v20 H44 Z" opacity=".8" />
          <path d="M52 40 h28 v10 H52 Z" opacity=".4" />
        </g>
      )

    // 서부 — 선인장과 지평선.
    case 'WEST':
      return (
        <g stroke={c} fill="none" strokeWidth="3" strokeLinecap="round">
          <path d="M72 46 V18" opacity=".85" />
          <path d="M72 30 H62 V22" opacity=".7" />
          <path d="M72 36 H82 V26" opacity=".7" />
          <line x1="46" y1="50" x2="88" y2="50" strokeWidth="2" opacity=".3" />
        </g>
      )

    // 서울 — 한옥 처마 곡선.
    case 'SEOUL':
      return (
        <g stroke={c} fill="none" strokeWidth="2.5">
          <path d="M40 26 C 58 8, 74 8, 88 20" opacity=".85" />
          <path d="M48 38 C 62 24, 76 24, 88 34" opacity=".55" />
          <line x1="56" y1="40" x2="56" y2="52" opacity=".35" />
          <line x1="78" y1="38" x2="78" y2="52" opacity=".35" />
        </g>
      )

    // SF — 궤도를 도는 위성.
    case 'SCIFI':
      return (
        <g stroke={c} fill="none" strokeWidth="2.5">
          <circle cx="74" cy="24" r="12" opacity=".85" />
          <ellipse cx="74" cy="24" rx="22" ry="8" transform="rotate(-24 74 24)" opacity=".5" />
          <circle cx="50" cy="44" r="2.5" fill={c} stroke="none" opacity=".5" />
        </g>
      )

    /*
      기본 — 단정한 집 두 채와 나무.

      예전에는 겹친 삼각형 두 개라 무슨 형태인지 읽히지 않고 그냥 얼룩처럼 보였다.
      다른 테마가 모두 "무엇"인지 말하는데 기본만 추상이면 그 카드들만 미완성으로 보인다.
      가장 평범한 동네 풍경으로 두면 '기본'이라는 이름과도 맞는다.
    */
    default:
      return (
        <g stroke={c} fill="none" strokeWidth="2.5" strokeLinejoin="round">
          {/* 큰 집 — 오른쪽 위 모서리에 붙인다 */}
          <path d="M58 50 V28 L72 14 L86 28 V50" opacity=".85" />
          <path d="M67 50 V39 h10 v11" opacity=".5" />
          {/* 작은 집 */}
          <path d="M38 50 V38 L48 29 L58 38" opacity=".5" />
          {/* 나무 */}
          <path d="M28 50 V40" opacity=".4" />
          <circle cx="28" cy="35" r="6" opacity=".4" />
          {/* 지면 */}
          <line x1="22" y1="50" x2="88" y2="50" strokeWidth="2" opacity=".22" />
        </g>
      )
  }
}

/**
 * 카드 우측 상단 장식. 부모에 `relative overflow-hidden` 이 있어야 한다.
 *
 * <p>`aria-hidden` 이다 — 순수한 분위기이고, 테마 이름은 카드에 글자로 이미 있다.
 * 읽어 주면 목록을 훑는 스크린리더 사용자에게 소음만 늘어난다.
 */
export function ThemeCorner({ theme }: { theme: string }) {
  const c = TINT[theme] ?? TINT.BASIC
  const id = `fade-${theme}`

  return (
    <svg
      viewBox="0 0 88 88"
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-0 size-[112px] opacity-[.55] dark:opacity-[.42]"
    >
      <defs>
        {/*
          오른쪽 위에서 왼쪽 아래로 사라지는 마스크. 이게 없으면 무늬가 카드 한가운데서
          뚝 끊겨 잘린 스티커처럼 보인다.
        */}
        <radialGradient id={id} cx="100%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="55%" stopColor="#fff" stopOpacity=".65" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`m-${id}`}>
          <rect width="88" height="88" fill={`url(#${id})`} />
        </mask>
      </defs>

      <g mask={`url(#m-${id})`}>{pattern(theme, c)}</g>
    </svg>
  )
}
