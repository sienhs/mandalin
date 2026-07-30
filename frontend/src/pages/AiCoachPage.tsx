import Header from '../components/common/Header'
import '../styles/ai-coach.css'

const RECOMMENDED_TASKS = [
  { category: '수면', title: '23시 전 취침하기', selected: true },
  { category: '운동', title: '주 3회 저녁 스트레칭 15분', selected: true },
  { category: '식단', title: '카페인 오후 3시 이후 컷오프', selected: false },
] as const

/** AI 과제 생성 기능이 연결되기 전 화면 구성을 확인하는 정적 코치 페이지. */
export default function AiCoachPage() {
  return (
    <div className="ai-coach-page">
      <Header />

      <main className="ai-coach-layout">
        <aside className="ai-coach-sidebar" aria-label="AI 코치 메뉴">
          <h1 className="ai-coach-sidebar-title">🤖 만다린 AI 코치</h1>
          <nav className="ai-coach-menu">
            <span>📢 업데이트 소식</span>
            <span># 추천 태스크</span>
            <span># 채팅</span>
            <small>음성 채널</small>
            <strong>🎙️ AI 음성 코칭</strong>
          </nav>
          <div className="ai-coach-members">
            <span>🤖 만다린 AI</span>
            <span>지 지우</span>
          </div>
        </aside>

        <section className="ai-coach-call" aria-labelledby="ai-call-title">
          <header className="ai-coach-call-header">
            <h2 id="ai-call-title">🎙️ AI 음성 코칭</h2>
            <span>● 통화 중 00:04</span>
          </header>

          <div className="ai-coach-stage">
            <div className="ai-coach-person">
              <div className="ai-coach-avatar ai-coach-avatar-bot">🤖</div>
              <strong>만다린 AI</strong>
            </div>
            <div className="ai-coach-person">
              <div className="ai-coach-avatar ai-coach-avatar-user">지</div>
              <strong>지우 (나)</strong>
            </div>
          </div>

          <footer className="ai-coach-controls" aria-label="통화 제어">
            <button type="button" aria-label="마이크">🎙️</button>
            <button type="button" aria-label="헤드셋">🎧</button>
            <button type="button" aria-label="통화 종료" className="ai-coach-hangup">☎</button>
          </footer>
        </section>

        <aside className="ai-coach-panel">
          <section className="ai-coach-tasks">
            <header>
              <h2>추천 태스크</h2>
              <button type="button">새로고침</button>
            </header>
            <div className="ai-coach-task-list">
              {RECOMMENDED_TASKS.map((task) => (
                <article key={task.title} className="ai-coach-task">
                  <input type="checkbox" checked={task.selected} readOnly />
                  <div>
                    <span>{task.category}</span>
                    <p>{task.title}</p>
                  </div>
                </article>
              ))}
            </div>
            <button type="button" className="ai-coach-apply">적용하기(2)</button>
          </section>

          <section className="ai-coach-chat">
            <h2>채팅</h2>
            <div className="ai-coach-messages">
              <p>안녕하세요! 오늘 컨디션은 좀 어때요?</p>
              <p className="is-mine">괜찮아요! 어제보다 훨씬 나아요</p>
              <p>다행이에요 :) 추천 태스크 중에 오늘 할 것들을 체크해보세요.</p>
            </div>
            <div className="ai-coach-message-input">
              <span>메시지 입력...</span>
              <button type="button" aria-label="메시지 전송">➤</button>
            </div>
          </section>
        </aside>
      </main>
    </div>
  )
}
