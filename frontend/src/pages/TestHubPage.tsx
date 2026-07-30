import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import {
  applySheetProgress,
  applySubjectProgress,
  grantDemoPoint,
  unlockDemoLandmarks,
} from '../components/sheet/demo.api'
import { buildSampleSheetPayload } from '../components/sheet/demo.data'
import {
  createSheet,
  fetchMySheets,
  fetchSheetDetail,
  type SheetDetail,
  type SheetSummary,
} from '../components/sheet/sheet.api'

/**
 * 시연 허브 (/test).
 *
 * 과제 수행 체크 API 가 아직 없어서 실제 사용으로는 진행률을 올릴 수 없다. 발표·시연에서
 * 마을이 자라는 모습을 보여줄 수 있도록 진행률을 임의로 넣는 화면을 둔다.
 *
 * 발표용이라 배포 환경에서도 동작한다. 백엔드 시연 API 는 app.demo.progress-enabled 로
 * 켜고 끄며(기본 true), 끄면 이 화면의 버튼이 404 를 받는다. 실서비스 진입점은 아니다.
 */

const CARDS = [
  { to: '/village', emoji: '🏡', title: '마을', desc: '만다라트 3D 마을 — 진행률에 따라 건물이 자란다' },
  { to: '/testVillage', emoji: '🧪', title: '마을 UI 테스트', desc: '서버 없이 뜨는 하네스 — 전 종 보유·진행률 슬라이더' },
  { to: '/shop', emoji: '🏪', title: '건물 상점', desc: '포인트로 건물 구매 (테마별)' },
  { to: '/sheet/create', emoji: '📝', title: '만다라트 만들기', desc: '핵심 목표·도메인·과제 입력 후 저장' },
  { to: '/gallery', emoji: '🏘', title: '건물 모아보기', desc: '전체 건물 카탈로그' },
  { to: '/thumbnails', emoji: '🖼', title: '썸네일 스튜디오', desc: '건물 PNG 썸네일 추출 유틸' },
]

const PRESETS = [0, 30, 60, 100]

/** 시연에서 한 번에 지급하는 포인트. 가장 비싼 건물이 300P 라 넉넉하다. */
const GRANT_AMOUNT = 50_000

const CARD: React.CSSProperties = {
  background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 4px 18px rgba(0,0,0,0.10)',
}

const BTN: React.CSSProperties = {
  cursor: 'pointer', border: '1px solid #d7dee4', background: '#fff', borderRadius: 8,
  padding: '5px 10px', fontSize: 12, fontWeight: 700, color: '#3d4f5c',
}

export default function TestHubPage() {
  const [sheets, setSheets] = useState<SheetSummary[] | null>(null)
  const [sheetId, setSheetId] = useState<number | null>(null)
  const [detail, setDetail] = useState<SheetDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)

  const fail = (cause: unknown, fallback: string) => {
    setError(cause instanceof Error ? cause.message : fallback)
  }

  useEffect(() => {
    fetchMySheets()
      .then((list) => {
        setSheets(list)
        if (list.length > 0) setSheetId(list[0].sheetId)
      })
      .catch((cause) => fail(cause, '만다라트 목록을 불러오지 못했습니다.'))
  }, [])

  const reload = useCallback((id: number) => {
    return fetchSheetDetail(id)
      .then(setDetail)
      .catch((cause) => fail(cause, '만다라트를 불러오지 못했습니다.'))
  }, [])

  useEffect(() => {
    if (sheetId != null) void reload(sheetId)
  }, [sheetId, reload])

  /** 진행률을 바꾸고 서버 값으로 다시 그린다 — 낙관적 갱신을 하면 서버 계산과 어긋난다. */
  const run = async (action: () => Promise<unknown>) => {
    if (sheetId == null || busy) return
    setBusy(true)
    setError(null)
    try {
      await action()
      await reload(sheetId)
    } catch (cause: unknown) {
      fail(cause, '진행률을 바꾸지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  /** 샘플 만다라트를 만들고 그것을 선택한다. 81칸을 손으로 채우지 않고 마을을 보기 위한 것. */
  const createSample = async () => {
    if (busy) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const newId = await createSheet(buildSampleSheetPayload())
      const list = await fetchMySheets()
      setSheets(list)
      setSheetId(newId)
      setNotice('샘플 만다라트를 만들었습니다. 진행률을 올리고 마을에서 확인해 보세요.')
    } catch (cause: unknown) {
      fail(cause, '샘플 만다라트를 만들지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  /** 시연용 포인트 지급. Header 의 잔액은 다음 조회 때 갱신된다. */
  const grantPoint = async () => {
    if (busy) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const balance = await grantDemoPoint(GRANT_AMOUNT)
      setNotice(`${GRANT_AMOUNT.toLocaleString('ko-KR')}P 지급 완료 — 현재 잔액 ${balance.toLocaleString('ko-KR')}P`)
    } catch (cause: unknown) {
      fail(cause, '포인트를 지급하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  /**
   * 랜드마크 전 종 해금. 포인트를 쓰지 않는다 — 만다라트 완성 보상 자리를 임시로 메우는 것이다.
   *
   * 이미 다 보유한 상태에서 눌러도 오류가 아니라 "이미 전부" 로 알린다. 멱등한 API 인데
   * 화면이 0 을 실패처럼 보여주면 눌러도 되는지 헷갈린다.
   */
  const unlockLandmarks = async () => {
    if (busy) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const { granted, owned, total } = await unlockDemoLandmarks()
      setNotice(granted > 0
        ? `랜드마크 ${granted}종 해금 — ${owned}/${total}종 보유. 마을 정중앙 블록에서 골라 보세요.`
        : `이미 랜드마크 ${owned}/${total}종을 전부 갖고 있습니다.`)
    } catch (cause: unknown) {
      fail(cause, '랜드마크를 해금하지 못했습니다.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#cfe8f0,#eef2f5)', fontFamily: 'system-ui, sans-serif' }}>
      <TopBar />
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '96px 24px 64px' }}>
        <h1 style={{ fontSize: 30, margin: '0 0 6px', color: '#1e2a33' }}>🧪 만다린 · 시연 허브</h1>
        <p style={{ color: '#5a6b76', margin: '0 0 28px' }}>
          화면 진입점과, 마을 성장을 보여주기 위한 진행률 조작 도구 (실서비스 진입점 아님)
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {CARDS.map((c) => (
            <Link key={c.to} to={c.to} style={{ ...CARD, display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>{c.emoji}</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 12.5, color: '#5a6b76', lineHeight: 1.5 }}>{c.desc}</div>
            </Link>
          ))}
        </div>

        <section style={{ ...CARD, marginTop: 28 }}>
          <h2 style={{ fontSize: 20, margin: '0 0 4px', color: '#1e2a33' }}>⚙️ 진행률 조작 (시연용)</h2>
          <p style={{ fontSize: 12.5, color: '#5a6b76', margin: '0 0 16px', lineHeight: 1.6 }}>
            과제 수행 체크 API 가 아직 없어 실제 사용으로는 진행률이 올라가지 않습니다. 여기서 값을
            넣고 <Link to="/village" style={{ color: '#2b6cb0' }}>마을</Link> 에서 건물이 자라는 걸 확인하세요.
            <br />
            발표용이라 배포 환경에서도 동작합니다. 실제 수행 체크 API 가 나오면 서버에서
            끕니다(<code>DEMO_PROGRESS_ENABLED=false</code>).
            <br />
            <b>랜드마크</b>(마을 정중앙 3×3)는 상점에서 사는 물건이 아니라 만다라트 완성 보상입니다.
            그 보상 지급이 아직 없어 <b>🗺 랜드마크 전부 획득</b> 으로 해금해 두고 검수합니다 — 포인트를 쓰지 않습니다.
          </p>

          {/* 만다라트 없이도 마을을 볼 수 있게 하는 지름길 + 포인트 지급 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
            <button type="button" disabled={busy} onClick={() => void createSample()}
              style={{ ...BTN, background: '#eaf3fb', borderColor: '#b8d6ee', padding: '7px 12px' }}>
              🏗 샘플 만다라트 생성
            </button>
            <button type="button" disabled={busy} onClick={() => void grantPoint()}
              style={{ ...BTN, background: '#fff6e0', borderColor: '#eccf92', padding: '7px 12px' }}>
              🪙 {GRANT_AMOUNT.toLocaleString('ko-KR')}P 받기
            </button>
            <button type="button" disabled={busy} onClick={() => void unlockLandmarks()}
              style={{ ...BTN, background: '#f0ecdf', borderColor: '#cfc4a6', padding: '7px 12px' }}
              title="포인트를 쓰지 않습니다. 만다라트 완성 보상이 붙기 전까지 쓰는 임시 해금입니다.">
              🗺 랜드마크 전부 획득
            </button>
          </div>

          {error && (
            <p style={{ margin: '0 0 12px', padding: '8px 12px', borderRadius: 8, background: '#fdecea', color: '#b3261e', fontSize: 12.5, fontWeight: 700 }} role="alert">
              {error}
            </p>
          )}

          {notice && (
            <p style={{ margin: '0 0 12px', padding: '8px 12px', borderRadius: 8, background: '#eaf6ee', color: '#2e7d5b', fontSize: 12.5, fontWeight: 700 }} role="status">
              {notice}
            </p>
          )}

          {sheets == null && <p style={{ fontSize: 13, color: '#5a6b76' }}>불러오는 중…</p>}

          {sheets != null && sheets.length === 0 && (
            <p style={{ fontSize: 13, color: '#5a6b76' }}>
              만다라트가 없습니다. 위의 <b>샘플 만다라트 생성</b> 을 누르거나{' '}
              <Link to="/sheet/create" style={{ color: '#2b6cb0' }}>직접 만들어</Link> 주세요.
            </p>
          )}

          {sheets != null && sheets.length > 0 && (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <select
                  value={sheetId ?? ''}
                  onChange={(e) => setSheetId(Number(e.target.value))}
                  style={{ ...BTN, cursor: 'pointer', padding: '6px 10px' }}
                >
                  {sheets.map((s) => (
                    <option key={s.sheetId} value={s.sheetId}>
                      {s.title} (달성률 {s.achievementRate}%)
                    </option>
                  ))}
                </select>

                <span style={{ fontSize: 12, color: '#8a97a0' }}>시트 전체:</span>
                {PRESETS.map((p) => (
                  <button key={p} type="button" disabled={busy} style={BTN}
                    onClick={() => void run(() => applySheetProgress(sheetId!, { progress: p }))}>
                    {p}%
                  </button>
                ))}
                <button type="button" disabled={busy} style={{ ...BTN, background: '#eef7f1', borderColor: '#b6dcc3' }}
                  onClick={() => void run(() => applySheetProgress(sheetId!, { random: true }))}>
                  🎲 랜덤
                </button>
                {busy && <span style={{ fontSize: 12, color: '#8a97a0' }}>적용 중…</span>}
              </div>

              {detail && (
                <>
                  <p style={{ fontSize: 12.5, color: '#3d4f5c', margin: '0 0 10px' }}>
                    달성률 <b>{detail.achievementRate}%</b> · 도메인 {detail.domains.length}개
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
                    {[...detail.domains].sort((a, b) => a.position - b.position).map((domain) => (
                      <div key={domain.domainId} style={{ border: '1px solid #e7eaee', borderRadius: 12, padding: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                          <b style={{ fontSize: 13.5 }}>
                            <span style={{ color: '#8a97a0', fontWeight: 400 }}>#{domain.position}</span> {domain.title}
                          </b>
                          <span style={{ display: 'flex', gap: 4 }}>
                            {PRESETS.map((p) => (
                              <button key={p} type="button" disabled={busy}
                                style={{ ...BTN, padding: '3px 7px', fontSize: 11 }}
                                onClick={() => void run(() => applySheetProgress(sheetId!, { progress: p, domainPosition: domain.position }))}>
                                {p}
                              </button>
                            ))}
                          </span>
                        </div>

                        {[...domain.subjects].sort((a, b) => a.position - b.position).map((subject) => (
                          <div key={subject.subjectId} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                            <span style={{ flex: 1, fontSize: 12, color: '#3d4f5c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {subject.title}
                            </span>
                            <input
                              type="range" min={0} max={100} step={10}
                              value={subject.progress}
                              disabled={busy}
                              onChange={(e) => void run(() => applySubjectProgress(subject.subjectId, Number(e.target.value)))}
                              style={{ width: 96 }}
                              aria-label={`${subject.title} 진행률`}
                            />
                            <span style={{ width: 34, textAlign: 'right', fontSize: 11.5, fontWeight: 700, color: subject.progress >= 100 ? '#2e7d5b' : '#5a6b76' }}>
                              {subject.progress}%
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </section>

        <p style={{ marginTop: 24, fontSize: 12, color: '#8a97a0' }}>
          실서비스 진입점(로그인)은 <Link to="/" style={{ color: '#2b6cb0' }}>/</Link>
        </p>
      </div>
    </div>
  )
}
