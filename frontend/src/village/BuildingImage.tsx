import { useState } from 'react'
import { thumbnailSrc } from './thumbnails'
import { useThumbnail } from './thumbnailBaker'
import type { LandmarkStage, Part, Stage } from './partTypes'

interface Props {
  /** 건물 key — static PNG 경로와 베이킹 캐시 id 로 쓰인다. */
  k: string
  /** 서버가 내려준 썸네일. 있으면 최우선. */
  remoteUrl?: string | null
  /** 이미지가 모두 없을 때 직접 구울 부품 배열. */
  parts?: Part[] | null
  stage?: Stage | LandmarkStage
  size?: number
  alt?: string
  /** 랜드마크(8단계) — 단계 규칙이 달라 렌더러를 갈아탄다. 기본 단계는 8(완성). */
  landmark?: boolean
}

/**
 * 상점/목록/피커용 건물 프리뷰 — 항상 <img>(WebGL 컨텍스트 안 씀).
 * 1) 서버 썸네일(remoteUrl)
 * 2) 로컬 static PNG(`/thumbnails/*.png`)
 * 3) 둘 다 없으면 parts 로 라이브 베이킹 (페이지에 <ThumbnailBakery/> 마운트 필요)
 */
export function BuildingImage({ k, remoteUrl, parts, stage, size = 140, alt, landmark = false }: Props) {
  // 폴백은 remote → static 순으로 내려간다. 실패한 URL을 전부 기억해야
  // static 도 실패했을 때 remote 로 되돌아가 무한 루프가 나지 않는다.
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set())

  const shown: Stage | LandmarkStage = stage ?? (landmark ? 8 : 3)
  const candidates = [remoteUrl, thumbnailSrc(k, shown)].filter((u): u is string => !!u)
  const showing = candidates.find((u) => !failed.has(u)) ?? null
  const baked = useThumbnail(showing ? null : k, parts ?? null, shown, landmark)

  const imgStyle: React.CSSProperties = { objectFit: 'contain', display: 'block' }

  if (showing) {
    return (
      <img
        src={showing}
        width={size}
        height={size}
        alt={alt ?? k}
        loading="lazy"
        style={imgStyle}
        onError={() => setFailed((prev) => new Set(prev).add(showing))}
      />
    )
  }

  if (baked) {
    return <img src={baked} width={size} height={size} alt={alt ?? k} style={imgStyle} />
  }

  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aa7b0', fontSize: 11 }}>
      {parts ? '렌더 중…' : '이미지 없음'}
    </div>
  )
}
