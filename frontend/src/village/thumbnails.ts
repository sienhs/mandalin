import type { LandmarkStage, Stage } from './partTypes'

/**
 * 건물 썸네일 경로 규칙.
 *
 * <p>파일명은 `${key}_s${stage}.png` 하나로 통일돼 있다. `/thumbnails` 스튜디오가 구워
 * 내려받는 이름이 그것이고, S3 에 올린 것도 같은 이름이다 — 규칙이 갈라지면 어느 쪽이
 * 정본인지 알 수 없게 되므로 이 파일에서만 조립한다.
 *
 * <p>이미지는 세 군데에 있을 수 있고 우선순위는 아래와 같다.
 * <ol>
 *   <li>서버가 building_item.thumbnail_url 로 내려준 값 — 있으면 무조건 이게 정본이다.
 *   <li>S3(아래 BASE) — 지금 실제로 이미지가 올라가 있는 곳.
 *   <li>프론트 public/thumbnails — 아직 안 올린 건물을 로컬에서 보기 위한 폴백.
 * </ol>
 * 실제 선택은 {@link BuildingImage} 가 하고, 여기서는 후보 URL 만 만든다.
 */

/**
 * 썸네일이 올라간 곳. 끝의 슬래시는 붙여도 되고 안 붙여도 된다.
 *
 * <p>버킷 주소를 <b>기본값으로 코드에 두는 이유</b>는 이게 비밀이 아니고(공개 읽기 전용
 * 에셋 경로다) 프론트에 .env 파일을 두지 않기로 했기 때문이다. 환경변수를 쓰면 로컬·배포
 * 모두 파일을 하나씩 더 관리해야 하는데, 값이 하나뿐이고 바뀔 일도 드물다.
 *
 * <p>그래도 <b>덮어쓸 구멍은 남긴다.</b> CloudFront 를 앞에 붙이면 도메인만 바뀌는데,
 * 그때 코드를 고쳐 다시 배포하는 대신 `VITE_THUMBNAIL_BASE_URL` 하나로 갈아 끼운다.
 * 빈 문자열을 주면 S3 를 건너뛰고 로컬 폴백만 쓴다(오프라인 개발용).
 */
const DEFAULT_BASE = 'https://mandalin-assets-d106.s3.ap-northeast-2.amazonaws.com/thumbnails/v1'

const configured = import.meta.env.VITE_THUMBNAIL_BASE_URL as string | undefined
const BASE = (configured ?? DEFAULT_BASE).replace(/\/+$/, '')

/** 프론트 public/ 안의 폴백 경로. */
export function thumbnailSrc(key: string, stage: Stage | LandmarkStage = 3): string {
  return `/thumbnails/${fileName(key, stage)}`
}

/** S3 에 올라간 썸네일 주소. 베이스를 빈 값으로 껐으면 null. */
export function remoteThumbnailSrc(key: string, stage: Stage | LandmarkStage = 3): string | null {
  return BASE ? `${BASE}/${fileName(key, stage)}` : null
}

function fileName(key: string, stage: Stage | LandmarkStage): string {
  return `${key}_s${stage}.png`
}
