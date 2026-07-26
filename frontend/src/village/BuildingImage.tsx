import { useState } from 'react'
import { thumbnailSrc } from './thumbnails'
import { useThumbnail } from './thumbnailBaker'
import type { AnyBuildingKey } from './buildings'
import type { Stage } from './catalog'

interface Props {
  k: AnyBuildingKey
  stage?: Stage
  size?: number
  alt?: string
}

/**
 * 상점/목록/피커용 건물 프리뷰 — 항상 <img>(WebGL 컨텍스트 안 씀).
 * 1) static PNG(`/thumbnails/*.png`) 우선
 * 2) 없으면 ThumbnailBakery가 구운 dataURL 사용 (페이지에 <ThumbnailBakery/> 마운트 필요)
 * 3) 굽는 중이면 플레이스홀더
 */
export function BuildingImage({ k, stage = 3, size = 140, alt }: Props) {
  const [staticFailed, setStaticFailed] = useState(false)
  const baked = useThumbnail(staticFailed ? k : null, stage)

  const imgStyle: React.CSSProperties = { objectFit: 'contain', display: 'block' }

  if (!staticFailed) {
    return (
      <img
        src={thumbnailSrc(k, stage)}
        width={size}
        height={size}
        alt={alt ?? k}
        loading="lazy"
        style={imgStyle}
        onError={() => setStaticFailed(true)}
      />
    )
  }

  if (baked) {
    return <img src={baked} width={size} height={size} alt={alt ?? k} style={imgStyle} />
  }

  return (
    <div style={{ width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9aa7b0', fontSize: 11 }}>
      렌더 중…
    </div>
  )
}
