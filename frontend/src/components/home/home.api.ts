import { apiFetch } from '../../api/client'

export type TodoPeriod = 'DAILY' | 'WEEKLY' | 'NONE'

/** `/api/v1/subjects/todo`가 반환하는 오늘의 할 일 항목. */
export type TodoSubject = {
  subjectId: number
  domainId: number
  domainTitle: string
  title: string
  period: TodoPeriod
  point: number
  targetCount: number
  tryCount: number
  position: number
  isDone: boolean
  /** true면 오늘 수행을 완료한 과제다. */
  isDoneToday: boolean
}

/** 공통 응답의 data 배열만 반환한다. */
export function fetchTodoSubjects(): Promise<TodoSubject[]> {
  return apiFetch<TodoSubject[]>('/api/v1/subjects/todo')
}
