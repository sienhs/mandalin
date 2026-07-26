import type { AnyBuildingKey } from './buildings'
import type { Stage } from './catalog'

/**
 * 건물 썸네일(static PNG) 경로 규칙.
 * `/thumbnails` 스튜디오의 다운로드 파일명(`${key}_s${stage}.png`)과 동일 규칙.
 * PNG를 `public/thumbnails/`에 커밋하면 상점이 <img>로 가볍게 표시(수백 개 대응).
 */
export function thumbnailSrc(key: AnyBuildingKey, stage: Stage = 3): string {
  return `/thumbnails/${key}_s${stage}.png`
}
