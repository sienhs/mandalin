import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { domainProgress, useStore } from '../data/store'
import { PERIOD_LABEL, type TodoItem } from '../data/types'
import { VillagePreview } from '../village/VillagePreview'
import Button from '../components/common/ActionButton'
import { IconArrowLeft, IconArrowRight, IconCheck, IconSparkle } from '../components/common/Icons'
import {
  Badge,
  EmptyState,
  ErrorState,
  ProgressRing,
  Skeleton,
  domainColor,
} from '../components/common/Primitives'
import { cn } from '../utils/cn'
import { num } from '../utils/format'

/** 오늘의 할 일 한 줄. todo 응답 + 도메인 색을 정할 순서. */
type Row = {
  todo: TodoItem
  domainPosition: number
}

export default function Home() {
  const { user, details, todos, sheets, shop, completeSubjects, reloadDetails } = useStore()
  const navigate = useNavigate()
  const [villageIndex, setVillageIndex] = useState(0)
  const [pending, setPending] = useState<number | null>(null)
  /** 요청이 날아가는 중인지. 상태보다 먼저 바뀌어야 연타를 막을 수 있다. */
  const inFlight = useRef(false)

  const detailList = useMemo(
    () => Object.values(details.data).sort((a, b) => b.id - a.id),
    [details.data],
  )

  /**
   * 오늘의 할 일.
   *
   * 서버가 `sheetId` 를 함께 내려주므로 이 응답만으로 완료 API 를 부를 수 있다.
   * 예전에는 시트 상세를 전부 받아 subjectId → sheetId 표를 직접 만들어야 했다.
   *
   * 도메인 색은 상세 캐시에서 찾는다 — todo 응답에 도메인 순서(position)가 없어서다.
   */
  const rows = useMemo<Row[]>(() => {
    const positionOf = new Map<number, number>()
    for (const sheet of detailList) {
      for (const domain of sheet.domains ?? []) positionOf.set(domain.id, domain.position)
    }

    return todos.data
      .filter((t) => !t.isDone)
      .map((t) => ({
        todo: t,
        domainPosition: positionOf.get(t.domainId) ?? 0,
      }))
      .sort((a, b) => {
        if (a.todo.isDoneToday !== b.todo.isDoneToday) {
          return Number(a.todo.isDoneToday) - Number(b.todo.isDoneToday)
        }
        return a.todo.progress - b.todo.progress
      })
  }, [todos.data, detailList])

  const doneToday = todos.data.filter((t) => t.isDoneToday).length

  /*
    홈 안내(8단계)는 <b>저절로 뜨지 않는다.</b>

    로그인 직후에는 설명 팝업(`OnboardingTour`)이 이미 화면 한가운데에 떠 있는데, 여기서
    안내를 자동으로 시작하면 팝업과 오버레이가 <b>동시에</b> 뜬다 — 처음 온 사람이 두 벌의
    "다음/건너뛰기" 를 한 화면에서 마주하게 된다. 팝업이 끝난 뒤로 미뤄도 결국 안내를 두 번
    연달아 미는 것이라 마찬가지다.

    대신 팝업의 마지막 장이 상단 물음표 버튼을 가리키며 끝나고(`welcome` 안내), 홈 안내는
    거기서 <b>골라서</b> 보는 것이 된다. 목록에는 아직 안 본 안내에 NEW 가 붙어 있다.
  */

  const overall = useMemo(() => {
    const all = detailList.flatMap((s) => s.domains?.flatMap((d) => d.subjects) ?? [])
    return domainProgress(all)
  }, [detailList])

  const sheet = detailList[Math.min(villageIndex, Math.max(0, detailList.length - 1))]
  const sheetProgress = sheet?.progress ?? sheet?.achievementRate ?? 0

  /** 다음으로 살 수 있는 가장 싼 건물까지 몇 개를 더 해야 하는지. */
  const nextBuilding = useMemo(() => {
    const target = shop.data
      .filter((i) => !i.owned && i.price > 0)
      .sort((a, b) => a.price - b.price)[0]
    if (!target || !user) return null
    const remain = Math.max(0, target.price - user.point)
    // 과제마다 포인트가 달라 평균으로 잡는다.
    const avg =
      rows.length > 0
        ? Math.max(1, Math.round(rows.reduce((a, r) => a + r.todo.point, 0) / rows.length))
        : 10
    return { name: target.name, remain, count: Math.ceil(remain / avg) }
  }, [shop.data, user, rows])

  /*
    상세 화면과 같은 이유로 ref 로 한 번 더 막는다 — `pending` 상태만으로는 버튼이 다음
    렌더부터 잠기므로, 빠른 연타가 같은 렌더에서 두 번 요청을 낸다.
  */
  const complete = async (row: Row) => {
    if (inFlight.current) return
    inFlight.current = true
    setPending(row.todo.subjectId)
    try {
      await completeSubjects(row.todo.sheetId, [row.todo.subjectId])
    } finally {
      inFlight.current = false
      setPending(null)
    }
  }

  /* ───────── 로딩 · 에러 ───────── */

  if (details.loading && detailList.length === 0) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-[132px] w-full" />
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
          <Skeleton className="h-[470px] w-full" />
          <Skeleton className="h-[520px] w-full" />
        </div>
      </div>
    )
  }

  if (details.error && detailList.length === 0) {
    return <ErrorState message={details.error} onRetry={() => void reloadDetails()} />
  }

  if (detailList.length === 0) {
    return (
      <div className="card mt-4">
        <EmptyState
          icon="🧩"
          title="먼저 만다라트를 하나 만들어 볼까요?"
          body="큰 목표 하나를 81칸으로 나누면, 오늘 할 일이 자동으로 생기고 마을에 건물이 세워집니다."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button to="/app/sheets/new">만다라트 만들기</Button>
              <Button to="/app/coach" variant="secondary">
                <IconSparkle className="size-[18px]" /> AI 코치와 만들기
              </Button>
            </div>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* ───────── 요약 ───────── */}
      <section
        data-tour="home-summary"
        className="card animate-rise flex flex-wrap items-center gap-6 p-6 sm:p-7"
      >
        <ProgressRing
          value={overall}
          size={96}
          hint="내 만다라트 전체의 실천 과제 달성률이에요. 과제를 체크할 때마다 올라갑니다."
        >
          <div className="text-center leading-none">
            <strong className="block text-xl font-black tracking-[-0.04em]">{overall}%</strong>
            <span className="muted mt-1 block text-[10.5px] font-bold">전체</span>
          </div>
        </ProgressRing>

        <div className="min-w-[220px] flex-1">
          <h1 className="page-title">
            {user?.name ?? '만다린'}님, 오늘 {doneToday}개 완료했어요
          </h1>
          <p className="page-caption">
            {nextBuilding && nextBuilding.remain > 0 ? (
              <>
                과제{' '}
                <strong className="text-brand-600 dark:text-brand-400">
                  {nextBuilding.count}개
                </strong>
                만 더 하면 <strong>{nextBuilding.name}</strong>({num(nextBuilding.remain)}P 남음)을
                살 수 있어요.
              </>
            ) : (
              <>지금 포인트로 상점에서 새 건물을 살 수 있어요.</>
            )}
          </p>
        </div>

        <div className="flex gap-2">
          <Button to="/app/village" state={{ from: '/app' }} variant="secondary" size="sm">
            내 마을 보기
          </Button>
          <Button to="/app/shop" size="sm">
            상점 가기
          </Button>
        </div>
      </section>

      {/* 모바일은 내용 높이를 유지하고, 2열에서는 두 카드의 하단을 맞춘다. */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:items-stretch">
        {/* ───────── 오늘의 할 일 ───────── */}
        <section
          data-tour="home-todos"
          className="card animate-rise flex flex-col p-6 lg:h-full"
          style={{ animationDelay: '.06s' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="section-title m-0">오늘의 할 일</h2>
              <p className="muted m-0 mt-1 text-[12.5px] font-semibold">
                체크하면 서버에 바로 저장되고 포인트가 쌓여요
              </p>
            </div>
            <Badge tone="brand">{rows.length}개</Badge>
          </div>

          {rows.length === 0 ? (
            <EmptyState
              icon="🎉"
              title="오늘 할 일을 모두 끝냈어요"
              body="매일·주간 과제를 전부 채웠습니다. 마을에서 자란 건물을 확인해 보세요."
              action={
                <Button to="/app/village" state={{ from: '/app' }} variant="secondary" size="sm">
                  마을 보러 가기
                </Button>
              }
            />
          ) : (
            /* 모바일은 자연 높이, 2열에서는 마을 카드와 맞춘 높이 안에서 목록만 스크롤한다. */
            <div className="mt-5 lg:relative lg:min-h-0 lg:flex-1">
              <ul className="m-0 flex list-none flex-col gap-2 p-0 lg:absolute lg:inset-0 lg:overflow-y-auto lg:pr-1">
                {rows.map((row) => {
                  const color = domainColor(row.domainPosition)
                  const busy = pending === row.todo.subjectId
                  const done = row.todo.isDoneToday

                  return (
                    <li key={row.todo.subjectId}>
                      <button
                        type="button"
                        onClick={() => void complete(row)}
                        disabled={busy || done}
                        /*
                          바탕은 라이트에서만 #f5f5f5 로 못 박는다. 다크에서 그대로 두면
                          어두운 카드 위에 밝은 회색 덩어리가 떠 버리므로 그쪽은 토큰에 맡긴다.
                          인라인 style 로 주면 클래스를 이겨 dark: 변형이 먹지 않으니 클래스로 준다.
                        */
                        className={cn(
                          'group flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-all duration-200',
                          'hover:-translate-y-px disabled:cursor-not-allowed',
                          'bg-[#f5f5f5] dark:bg-[var(--surface-sunken)]',
                          done && 'opacity-65',
                        )}
                        title={done ? '이번 주기에는 이미 완료했어요' : undefined}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'grid size-7 shrink-0 place-items-center rounded-full border-2 transition-all',
                            done
                              ? 'border-transparent text-white'
                              : 'border-[var(--border-hairline)] text-transparent group-hover:border-brand-400',
                          )}
                          style={done ? { background: color } : undefined}
                        >
                          {busy ? (
                            <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent text-brand-500" />
                          ) : (
                            <IconCheck className="size-4" />
                          )}
                        </span>

                        <span className="min-w-0 flex-1">
                          {/*
                          truncate(한 줄 말줄임)를 쓰면 "영어 단어 30개 외우기" 가
                          "영어 단어 30개…" 로 잘려 무슨 과제인지 알 수 없었다.
                          두 줄까지 접어 보여 주면 대부분의 제목이 온전히 읽힌다.
                        */}
                          <span
                            className={cn(
                              'line-clamp-2 block text-[13.5px] font-bold leading-snug',
                              done && 'line-through',
                            )}
                          >
                            {row.todo.title}
                          </span>

                          {/*
                          부제는 한 줄로 고정한다. min-w-0 이 없으면 flex 자식이 내용 폭만큼
                          버텨서 truncate 가 걸리지 않고, 대신 옆의 주기 배지가 아래로 밀려나
                          줄이 두 겹으로 어긋났다.

                          배지를 Badge 컴포넌트로 두지 않은 이유: 여기서만 더 작아야 하는데
                          `!px-1.5` 같은 접두 important 는 Tailwind v4 에서 없어진 문법이라
                          아무 효과가 없었다(그래서 배지가 커진 채로 줄을 밀어냈다).
                        */}
                          <span className="muted mt-1 flex items-center gap-1.5 text-[11.5px] font-semibold">
                            <span className="min-w-0 flex-1 truncate">
                              {row.todo.domainTitle} · {row.todo.sheetTitle}
                            </span>
                            <span
                              className="shrink-0 rounded-full px-1.5 py-px text-[10.5px] font-bold"
                              style={{ background: 'var(--surface-card)' }}
                            >
                              {PERIOD_LABEL[row.todo.period]}
                            </span>
                          </span>
                        </span>

                        <span className="shrink-0 text-right">
                          <span className="block text-[11.5px] font-black tabular-nums">
                            {row.todo.tryCount}/{row.todo.targetCount}
                          </span>
                          <span className="muted block text-[10.5px] font-bold">
                            +{row.todo.point}P
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

        </section>

        {/* ───────── 내 마을 ───────── */}
        <section
          data-tour="home-village"
          className="card animate-rise flex flex-col p-6"
          style={{ animationDelay: '.12s' }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="section-title m-0">내 마을</h2>
              <p className="muted m-0 mt-1 truncate text-[12.5px] font-semibold">
                {sheet.title} · 달성률 {sheetProgress}%
              </p>
            </div>

            {detailList.length > 1 && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="이전 만다라트"
                  onClick={() =>
                    setVillageIndex((i) => (i - 1 + detailList.length) % detailList.length)
                  }
                  className="grid size-9 place-items-center rounded-full border text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <IconArrowLeft className="size-[18px]" />
                </button>
                <span className="muted min-w-[42px] text-center text-[12px] font-bold tabular-nums">
                  {Math.min(villageIndex, detailList.length - 1) + 1}/{detailList.length}
                </span>
                <button
                  type="button"
                  aria-label="다음 만다라트"
                  onClick={() => setVillageIndex((i) => (i + 1) % detailList.length)}
                  className="grid size-9 place-items-center rounded-full border text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
                  style={{ borderColor: 'var(--border-hairline)' }}
                >
                  <IconArrowRight className="size-[18px]" />
                </button>
              </div>
            )}
          </div>

          {/*
            SVG 로 흉내 낸 마을이 아니라 마을 화면과 <b>같은 3D</b>를 그린다. 예전 그림은
            건물 종류도, 배치도, 성장 단계도 실제와 달라서 크게 보기를 누르면 다른 마을이
            나왔다 — 미리보기가 본문과 다르면 미리보기가 아니다.

            카드 전체를 누르면 마을로 간다. 3D 자체는 조작을 막아 뒀으므로(pointer-events)
            안쪽 아무 데나 눌러도 이 버튼이 받는다.
          */}
          <button
            type="button"
            onClick={() => navigate(`/app/village?sheet=${sheet.id}`, { state: { from: '/app' } })}
            aria-label={`${sheet.title} 마을 크게 보기`}
            className="mt-4 block w-full overflow-hidden rounded-2xl border-0 p-0 text-left"
            style={{ background: 'var(--surface-sunken)' }}
          >
            {/*
              높이를 종횡비가 아니라 <b>뷰포트</b>가 정하게 한다.

              16/10 종횡비로 두면 화면이 넓을수록 미리보기가 세로로 길어져서, 정작
              아래 '마을 크게 보기' 버튼이 첫 화면 밖으로 밀려났다. 넓은 모니터일수록
              더 안 보이는 셈이라 앞뒤가 맞지 않는다.

              빼는 520px 의 내역: 헤더 64 + 본문 위 여백 24 + 요약 카드 약 160 +
              카드 사이 간격 20 + 마을 카드의 머리말·버튼·안쪽 여백 약 162,
              그리고 아래 여백 몫 약 90(본문 아래 여백 64 + 잘리지 않을 만큼의 완충).

              완충을 둔 이유는 요약 카드가 이름 길이나 문구 줄바꿈에 따라 조금씩
              높아지기 때문이다. 딱 맞게 계산하면 그때마다 버튼이 잘린다.
            */}
            <VillagePreview
              sheet={sheet}
              className="h-[clamp(220px,calc(100dvh-520px),480px)] w-full"
            />
          </button>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button to={`/app/village?sheet=${sheet.id}`} state={{ from: '/app' }} size="sm">
              마을 크게 보기
            </Button>
            <Button to={`/app/sheets/${sheet.id}`} size="sm" variant="secondary">
              만다라트 열기
            </Button>
          </div>
        </section>
      </div>

      {/* ───────── 만다라트 요약 ───────── */}
      {sheets.data.length > 0 && (
        <section className="card animate-rise p-6" style={{ animationDelay: '.18s' }}>
          <div className="flex items-center justify-between gap-3">
            <h2 className="section-title m-0">내 만다라트</h2>
            <Link
              to="/app/sheets"
              className="muted text-[12.5px] font-bold no-underline hover:text-brand-600"
            >
              전체 보기 →
            </Link>
          </div>

          <ul className="m-0 mt-4 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {sheets.data.slice(0, 3).map((s) => (
              <li key={s.id}>
                {/* 할 일 줄과 같은 바탕 — 같은 화면의 목록 두 개가 서로 다른 회색이면 어긋나 보인다. */}
                <Link
                  to={`/app/sheets/${s.id}`}
                  className="flex items-center gap-3 rounded-2xl bg-[#f5f5f5] p-4 no-underline transition-transform hover:-translate-y-0.5 dark:bg-[var(--surface-sunken)]"
                >
                  <ProgressRing value={s.achievementRate} size={44} stroke={5}>
                    <span className="text-[10px] font-black tabular-nums">{s.achievementRate}</span>
                  </ProgressRing>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13.5px] font-extrabold">{s.title}</span>
                    <span className="muted block text-[11.5px] font-semibold">
                      좋아요 {s.likeCount} · {s.isOpen ? '공개' : '비공개'}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
