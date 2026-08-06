type IconProps = { className?: string }

/** 라인 아이콘 세트. 굵기 1.8, 24 그리드로 통일한다. */
function Svg({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className ?? 'size-[22px]'}
    >
      {children}
    </svg>
  )
}

export const IconHome = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M3 10.5 12 3l9 7.5" />
    <path d="M5 9.8V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.8" />
  </Svg>
)

export const IconGrid = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect x="3" y="3" width="7" height="7" rx="1.6" />
    <rect x="14" y="3" width="7" height="7" rx="1.6" />
    <rect x="3" y="14" width="7" height="7" rx="1.6" />
    <rect x="14" y="14" width="7" height="7" rx="1.6" />
  </Svg>
)

export const IconVillage = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M12 3 21 8.5 12 14 3 8.5 12 3Z" />
    <path d="M3 13.5 12 19l9-5.5" />
  </Svg>
)

export const IconSparkle = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.5l-1.9-5.7-5.6-1.9L10.1 9 12 3.5Z" />
    <path d="M19 16.5 19.7 19l2.3.8-2.3.8L19 23l-.7-2.4-2.3-.8 2.3-.8.7-2.5Z" />
  </Svg>
)

export const IconShop = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M4 8h16l-1 3.4A3 3 0 0 1 16.1 14H7.9A3 3 0 0 1 5 11.4L4 8Z" />
    <path d="M6 8V6.5A2.5 2.5 0 0 1 8.5 4h7A2.5 2.5 0 0 1 18 6.5V8" />
    <path d="M6.5 14v5A1 1 0 0 0 7.5 20h9a1 1 0 0 0 1-1v-5" />
  </Svg>
)

export const IconChart = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M4 20V4" />
    <path d="M4 20h16" />
    <path d="M8 16v-4" />
    <path d="M13 16V7" />
    <path d="M18 16v-6" />
  </Svg>
)

export const IconFriends = ({ className }: IconProps) => (
  <Svg className={className}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2A3.2 3.2 0 0 1 16 11.4" />
    <path d="M17.6 14.2A5.5 5.5 0 0 1 21 19.3" />
  </Svg>
)

export const IconTrophy = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    <path d="M7 6H4.5v1A3.5 3.5 0 0 0 8 10.5" />
    <path d="M17 6h2.5v1a3.5 3.5 0 0 1-3.5 3.5" />
    <path d="M10 14v3h4v-3" />
    <path d="M8 20h8" />
  </Svg>
)

export const IconBell = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M18 9a6 6 0 1 0-12 0c0 5-2.2 5.6-2.2 7.5h16.4C20.2 14.6 18 14 18 9Z" />
    <path d="M10 20a2 2 0 0 0 4 0" />
  </Svg>
)

export const IconCheck = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="m4.5 12.5 5 5L20 7" />
  </Svg>
)

export const IconPlus = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
)

export const IconMore = ({ className }: IconProps) => (
  <Svg className={className}>
    <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </Svg>
)

export const IconSun = ({ className }: IconProps) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Svg>
)

export const IconMoon = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M20 14.2A8.2 8.2 0 0 1 9.8 4a8.4 8.4 0 1 0 10.2 10.2Z" />
  </Svg>
)

export const IconArrowLeft = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M15 5.5 8.5 12l6.5 6.5" />
  </Svg>
)

export const IconArrowRight = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="m9 5.5 6.5 6.5L9 18.5" />
  </Svg>
)

/**
 * AI 코치 표식. 안테나 달린 둥근 머리 + 눈 두 개.
 *
 * <p>이모지(🤖)를 쓰면 글꼴에 따라 모양·색이 제각각이고 다크 모드에서 혼자 튄다.
 * 선 아이콘으로 두면 나머지 아이콘과 굵기·색이 같아 화면이 정돈된다.
 */
export const IconCoach = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect x="4" y="8" width="16" height="12" rx="4" />
    <path d="M12 8V4.5" />
    <circle cx="12" cy="3.4" r="1.3" />
    <path d="M9.3 13.2v1.6M14.7 13.2v1.6" />
  </Svg>
)

export const IconChevronDown = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="m5.5 9 6.5 6.5L18.5 9" />
  </Svg>
)

export const IconHeart = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M12 20s-7.5-4.6-7.5-9.4A4.1 4.1 0 0 1 12 7.6a4.1 4.1 0 0 1 7.5 3C19.5 15.4 12 20 12 20Z" />
  </Svg>
)

export const IconMic = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
    <path d="M12 18v3" />
  </Svg>
)

export const IconSend = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M4.5 12 20 4.5 15.5 20l-4-6.5-7-1.5Z" />
  </Svg>
)

export const IconCoin = ({ className }: IconProps) => (
  <Svg className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M9.5 9.5h5M9.5 12h5M12 9v6" />
  </Svg>
)

/** 마일스톤 보상 — 아직 열지 않은 구간. */
export const IconGift = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M4 11h16v8.2a1.3 1.3 0 0 1-1.3 1.3H5.3A1.3 1.3 0 0 1 4 19.2V11Z" />
    <path d="M3 7.6h18V11H3V7.6Z" />
    <path d="M12 7.6v13" />
    <path d="M12 7.6S10.8 3.5 8.6 3.5a2 2 0 0 0 0 4.1H12Z" />
    <path d="M12 7.6s1.2-4.1 3.4-4.1a2 2 0 0 1 0 4.1H12Z" />
  </Svg>
)

/** 아직 도달하지 못한 구간. */
export const IconLock = ({ className }: IconProps) => (
  <Svg className={className}>
    <rect x="4.8" y="10.2" width="14.4" height="10.3" rx="2.2" />
    <path d="M8.3 10.2V7.6a3.7 3.7 0 0 1 7.4 0v2.6" />
    <path d="M12 14.2v2.4" />
  </Svg>
)

/**
 * 랜드마크 — 마을 정중앙 3x3 거대 건물.
 *
 * <p>{@link IconVillage}(마름모)와 다르다. 저쪽은 "마을 전체" 를 가리키고 이쪽은
 * 그 안의 한 종류를 가리킨다. 기둥과 박공이 13종의 공통 실루엣이다.
 */
export const IconLandmark = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M3.5 9.2 12 4l8.5 5.2" />
    <path d="M6 9.6v8.2M10 9.6v8.2M14 9.6v8.2M18 9.6v8.2" />
    <path d="M3.8 20.4h16.4" />
  </Svg>
)

export const IconTrash = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M4.5 7h15" />
    <path d="M9.5 7V5.2A1.2 1.2 0 0 1 10.7 4h2.6a1.2 1.2 0 0 1 1.2 1.2V7" />
    <path d="M6.5 7 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2A1.5 1.5 0 0 0 16.6 19L17.5 7" />
  </Svg>
)

export const IconEdit = ({ className }: IconProps) => (
  <Svg className={className}>
    <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="m14.5 6.5 3 3" />
  </Svg>
)
