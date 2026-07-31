import { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import Button from '../components/common/Button'
import Header from '../components/common/Header'
import ProgressBar from '../components/common/ProgressBar'
import { GROUP_DOMAIN_SLOTS, loadGroupDetail } from '../components/group/group.data'
import { MY_SHEETS } from '../components/sheetList/sheetList.data'
import { cn } from '../utils/cn'
// 카드(.card) 는 생성 화면과 공유한다.
import '../styles/sheet-create.css'
import '../styles/group-detail.css'

/** 멤버 줄에 돌려 쓰는 색. 자리 순서대로 붙는다. */
const MEMBER_COLORS = ['green', 'orange', 'blue', 'amber'] as const

/**
 * 그룹 만다라트 화면. 그룹을 만든 직후, 그리고 목록에서 그룹 카드를 눌러 들어온다.
 *
 * 두 상태를 데이터만 보고 그린다 — 자리가 남았으면 초대 버튼을, 혼자면 안내 문구를 띄운다.
 */
export default function GroupDetail() {
  const navigate = useNavigate()
  const { groupId } = useParams()
  const { state } = useLocation()
  /** 방금 만든 그룹이면 이름 · 어느 시트에서 도메인을 냈는지가 함께 넘어온다. */
  const passed = state as { groupTitle?: string; sheetId?: number; justCreated?: boolean } | null

  const id = Number(groupId) || 1
  const detail = useMemo(
    () => loadGroupDetail(id, { title: passed?.groupTitle, justCreated: passed?.justCreated }),
    [id, passed?.groupTitle, passed?.justCreated],
  )

  /**
   * '선택한 만다라트로 이동' 이 갈 내 만다라트.
   *
   * 상세 응답(MemberContributionResponse)에는 멤버가 어느 시트에서 도메인을 냈는지가 없어서,
   * 만든 직후에 넘겨받은 값을 쓰고 없으면 첫 시트로 보낸다.
   */
  const mySheetId = passed?.sheetId ?? MY_SHEETS[0]?.sheetId ?? 1

  /** 나 말고 다른 멤버가 아직 없는 상태인지 */
  const isAlone = detail.members.length <= 1
  /** 도메인 자리가 남아 있으면 아직 초대할 수 있다 */
  const canInvite = detail.mappedDomainCount < GROUP_DOMAIN_SLOTS

  return (
    <div className="group-detail-page">
      <Header />

      <main className="group-detail-main">
        <div className="card p-6">
          <header className="group-detail-header">
            <div className="group-detail-identity">
              <h1 className="group-detail-title">{detail.title}</h1>
              <p className="group-detail-sub">
                멤버 총 {detail.members.length}명 · 도메인 {detail.mappedDomainCount}/
                {GROUP_DOMAIN_SLOTS} 자리
              </p>
            </div>

            <div className="group-detail-rate">
              <div className="group-detail-rate-row">
                <p className="group-detail-rate-text">달성률 {detail.groupAchievementRate}%</p>
                <ProgressBar
                  value={detail.groupAchievementRate}
                  label={`${detail.title} 달성률`}
                  className="group-detail-rate-bar"
                />
              </div>
              <p className="group-detail-rate-label">그룹 달성률</p>
              <p className="group-detail-rate-big">{detail.groupAchievementRate}%</p>
            </div>
          </header>

          <div className="group-detail-body">
            {/* 그룹 마을 이미지가 들어갈 자리. 이미지가 준비되면 이 상자를 대체한다. */}
            <div className="group-detail-image">
              <p className="group-detail-image-note">그룹 마을 이미지가 들어갈 자리예요</p>
            </div>

            <section className="group-detail-side" aria-labelledby="member-contribution">
              <h2 id="member-contribution" className="group-detail-section-title">
                멤버별 기여도
              </h2>

              <ul className="group-detail-members">
                {detail.members.map((member, i) => (
                  <li
                    key={member.userId}
                    className={cn(
                      'group-detail-member',
                      `group-detail-member--${MEMBER_COLORS[i % MEMBER_COLORS.length]}`,
                    )}
                  >
                    <div className="group-detail-member-row">
                      <span className="group-detail-member-name">
                        <span aria-hidden="true" className="group-detail-member-dot" />
                        {member.name}
                      </span>
                      <span className="group-detail-member-rate">
                        {member.memberAchievementRate}%
                      </span>
                    </div>
                    <ProgressBar
                      value={member.memberAchievementRate}
                      label={`${member.name} 기여도`}
                      className="group-detail-member-bar"
                    />
                  </li>
                ))}
              </ul>

              {isAlone && (
                <p className="group-detail-notice">
                  현재 혼자서 만다라트를 진행하고 있어요!
                  <br />
                  친구를 초대하면 친구가 선택한 도메인을 함께 볼 수 있어요.
                </p>
              )}

              <div className="group-detail-actions">
                {/*
                  도메인 8자리가 다 차면 초대 버튼을 감춘다 — 더 받을 자리가 없다.
                  연동 시 POST /api/v1/groups/{groupId}/invites 로 초대를 보낸다.
                  아직 초대할 친구를 고르는 화면이 없어서 친구 목록으로 보낸다.
                */}
                {canInvite && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="group-detail-invite"
                    onClick={() => navigate('/friends')}
                  >
                    멤버 초대하기
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="lg"
                  className="group-detail-move"
                  onClick={() => navigate(`/sheet/${mySheetId}`)}
                >
                  선택한 만다라트로 이동
                </Button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
