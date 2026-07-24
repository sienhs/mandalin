import { useState } from 'react'
import { BuildingThumbnail } from './BuildingThumbnail'
import { thumbnailSrc } from './thumbnails'
import type { BuildingKey, Stage } from './catalog'

interface Props {
  k: BuildingKey
  stage?: Stage
  size?: number
  alt?: string
}

/**
 * 상점/목록용 건물 프리뷰.
 * static PNG(`/thumbnails/*.png`)를 우선 사용하고, 파일이 없으면 라이브 3D(BuildingThumbnail)로 폴백.
 * → 썸네일 커밋 전에도 동작하고, 커밋 후엔 수백 개도 가볍게(<img>) 표시.
 */
export function BuildingImage({ k, stage = 3, size = 140, alt }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed) return <BuildingThumbnail k={k} stage={stage} size={size} />

  return (
    <img
      src={thumbnailSrc(k, stage)}
      width={size}
      height={size}
      alt={alt ?? k}
      loading="lazy"
      style={{ objectFit: 'contain', display: 'block' }}
      onError={() => setFailed(true)}
    />
  )
}
