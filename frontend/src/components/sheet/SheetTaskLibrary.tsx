import { cn } from '../../utils/cn'
import { PAGES } from './sheet.data'
import type { SubjectTemplate } from './sheet.types'

type SheetTaskLibraryProps = {
  search: string
  onSearchChange: (value: string) => void
  /** 검색어로 걸러진 추천 과제 목록 */
  tasks: SubjectTemplate[]
  onAdd: (task: SubjectTemplate) => void
  page: string
  onPageChange: (page: string) => void
}

/** 사이드 패널: 추가할 수 있는 과제(검색 · 목록 · 페이지네이션) */
export default function SheetTaskLibrary({
  search,
  onSearchChange,
  tasks,
  onAdd,
  page,
  onPageChange,
}: SheetTaskLibraryProps) {
  return (
    <section
      aria-labelledby="addable-2d"
      className="card rounded-2xl border-[3px] border-[#e9f6e8] bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
    >
      <h3 id="addable-2d" className="section-title m-0 mb-3 text-[13.5px]">
        추가할 수 있는 과제
      </h3>

      <div className="mb-4 flex flex-col gap-1">
        <label htmlFor="task-search" className="text-xs font-bold text-ink-500">
          과제 검색
        </label>
        <input
          id="task-search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="추가할 과제 검색"
          className="w-full rounded-lg border border-ink-300 bg-[#f8fafc] px-3 py-[10px] text-xs text-ink-700 outline-none focus:border-mint-400"
        />
      </div>

      <ul className="m-0 mb-5 flex list-none flex-col gap-2 p-0">
        {tasks.map((task) => (
          <li
            key={task.title}
            className="card card-hover flex items-center gap-2.5 rounded-xl border border-[#e2e8f0] p-3 shadow-none"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-300 text-sm">
              {task.emoji}
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-bold text-ink-900">{task.title}</span>
              <span className="mt-[2px] text-[10.5px] text-ink-400">{task.domainName}</span>
            </div>
            <button
              type="button"
              onClick={() => onAdd(task)}
              className="btn ml-auto shrink-0 rounded-md bg-mint-500 px-3 py-[3px] text-[11px] font-bold text-white"
            >
              + 추가
            </button>
          </li>
        ))}
      </ul>

      <nav
        className="pagination flex w-full justify-center gap-1.5 text-[13px]"
        aria-label="과제 페이지네이션"
      >
        {PAGES.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => p !== '‹' && p !== '›' && onPageChange(p)}
            aria-current={page === p ? 'page' : undefined}
            className={cn('page-btn h-7 w-7 rounded-lg', page === p && 'active')}
          >
            {p}
          </button>
        ))}
      </nav>
    </section>
  )
}
