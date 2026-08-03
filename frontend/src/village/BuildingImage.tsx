import { useState, type ReactNode } from 'react'
import { remoteThumbnailSrc, thumbnailSrc } from './thumbnails'
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
  /**
   * 이미지도 없고 구울 parts 도 없을 때 대신 그릴 것.
   *
   * <p>상점처럼 parts 를 안 받는 화면에서 필요하다. 기본 문구("이미지 없음")보다
   * 실루엣 도형이 목록의 리듬을 덜 깬다.
   */
  fallback?: ReactNode
}

/**
 * 상점/목록/피커용 건물 프리뷰 — 항상 <img>(WebGL 컨텍스트 안 씀).
 * 1) 서버 썸네일(remoteUrl)
 * 2) S3(VITE_THUMBNAIL_BASE_URL)
 * 3) 로컬 static PNG(`/thumbnails/*.png`)
 * 4) 모두 없거나 모두 실패하면 parts 로 라이브 베이킹 (페이지에 <ThumbnailBakery/> 마운트 필요)
 *
 * <p>단계마다 <b>실패한 URL 을 기억</b>하고 다음 후보로 내려간다. 그래야 S3 에 아직 안 올린
 * 건물이 섞여 있어도 그 건물만 로컬 이미지로 떨어지고, 나머지는 그대로 S3 를 쓴다.
 */
export function BuildingImage({
  k,
  remoteUrl,
  parts,
  stage,
  size = 140,
  alt,
  landmark = false,
  fallback,
}: Props) {
  // 폴백은 remote → static 순으로 내려간다. 실패한 URL을 전부 기억해야
  // static 도 실패했을 때 remote 로 되돌아가 무한 루프가 나지 않는다.
  const [failed, setFailed] = useState<ReadonlySet<string>>(() => new Set())

  const shown: Stage | LandmarkStage = stage ?? (landmark ? 8 : 3)
  const candidates = [remoteUrl, remoteThumbnailSrc(k, shown), thumbnailSrc(k, shown)].filter(
    (u): u is string => !!u,
  )
  const showing = candidates.find((u) => !failed.has(u)) ?? null
  const baked = useThumbnail(showing ? null : k, parts ?? null, shown, landmark)

  const imgStyle: React.CSSProperties = {
    objectFit: 'contain',
    display: 'block',
  }

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

  if (!parts && fallback) {
    return <div style={{ width: size, height: size }}>{fallback}</div>
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#9aa7b0',
        fontSize: 11,
      }}
    >
      {parts ? '렌더 중…' : '이미지 없음'}
    </div>
  )
}
