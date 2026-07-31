import type { LandmarkStage, Stage } from './partTypes'

/**
 * 건물 썸네일(로컬 static PNG) 경로 규칙.
 * `/thumbnails` 스튜디오의 다운로드 파일명(`${key}_s${stage}.png`)과 동일 규칙.
 *
 * 실서비스 썸네일은 서버가 내려주는 thumbnailUrl 이 정본이고, 이 경로는 아직 안 올라간
 * 건물을 로컬에서 보기 위한 폴백이다.
 */
export function thumbnailSrc(key: string, stage: Stage | LandmarkStage = 3): string {
  return `/thumbnails/${key}_s${stage}.png`
}
