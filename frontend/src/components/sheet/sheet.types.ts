/**
 * 만다라트 생성 화면의 데이터 타입.
 *
 * 필드명은 서버가 내려주는 JSON 키(camelCase)를 따른다. ERD 컬럼은 snake_case지만
 * 백엔드가 Jackson 기본 규약대로 camelCase로 직렬화하므로 여기서 변환하지 않는다.
 */

/** 과제의 기간 설정 */
export type Period = 'daily' | 'weekly' | 'none'

/**
 * 만다라트 한 장. 기본 설정 패널이 편집하는 값은 모두 이 타입 안에만 저장한다.
 * (기간 설정 = createdAt ~ expiredAt, 공개 여부 = isOpen)
 */
export type Sheet = {
  userId: number //사용자 아이디
  title: string //시트명(핵심 목표)
  isOpen: boolean //공개 여부
  like: number //좋아요 수
  createdAt: string //생성 날짜 = 목표 기간의 시작일
  expiredAt: string //만료 날짜 = 목표 기간의 종료일
}

export type Domain = {
  sheetId: number //시트 아이디
  domainTemplateId: number //참고 도메인 아이디
  title: string //도메인 명
  position: number //위치
  createdAt: string //생성 날짜
  subjectCount: number //완료한 과제 갯수
}

export type Subject = {
  domainId: number //도메인 아이디
  userId: number //유저 아이디
  title: string //과제 이름
  period: Period //기간 설정
  point: number //획득 포인트
  targetCount: number //목표횟수
  tryCount: number //현재 횟수
  position: number //위치
  isDone: boolean //완료 여부
  createdAt: string //생성 날짜
  updatedAt: string //수정 날짜
}

/** 9x9 그리드에서의 위치. b = 3x3 블록 번호, c = 블록 안의 칸 번호. */
export type CellPos = { b: number; c: number }

/**
 * 화면에 그릴 칸 하나. Sheet/Domain/Subject 상태에서 파생되며,
 * 세 종류(핵심 목표 · 도메인 라벨 · 과제) 중 하나다.
 */
export type GridCell = {
  /** 칸에 표시할 글자. 비어 있으면 안내 문구(PLACEHOLDER)가 들어간다. */
  task: string
  isSheet: boolean
  isDomain: boolean
  isSubject: boolean
  /** 도메인 · 과제 칸이 속한 도메인 인덱스(0~7). 핵심 목표 칸은 -1. */
  domainIndex: number
  /** 과제 칸의 도메인 내 인덱스(0~7). 그 외 칸은 -1. */
  subjectIndex: number
  /** 과제 칸에 저장된 값. 아직 입력하지 않았거나 과제 칸이 아니면 null. */
  subject: Subject | null
}

/** 과제 설정 팝업이 저장 전까지 들고 있는 임시 값. */
export type TaskDraft = {
  /** 수정 중인 칸의 위치 */
  cell: CellPos
  /** 팝업을 열었을 때의 글자. 입력을 비운 채 저장하면 이 값으로 되돌린다. */
  original: string
  /** 입력 중인 글자 */
  task: string
  /** 소속 도메인명. 도메인을 정하지 않았으면 '미지정'. */
  domain: string
  period: Period
  done?: boolean
}
