import { BrowserRouter } from 'react-router-dom'
import { StoreProvider } from './data/store'
import { ToastProvider } from './components/common/Toast'
import AppRoutes from './routes/AppRoutes'

/**
 * 앱 진입점.
 *
 * <p>중첩 순서에 이유가 있다. `ToastProvider` 가 `StoreProvider` 바깥이어야 한다 —
 * 스토어의 액션(과제 완료 → 포인트 적립, 요청 실패 → 서버 메시지)이 토스트를 직접 띄우기
 * 때문이다. 반대로 두면 스토어가 토스트를 찾지 못한다.
 *
 * <p>세션의 주인은 `StoreProvider` 하나다. 예전에는 `AuthProvider` 가 같이 떠서 토큰
 * 보관소와 부팅 복원이 두 벌로 돌았는데, 둘 다 뜨자마자 `POST /api/auth/reissue` 를
 * 불러 같은 리프레시 쿠키를 동시에 회전시켰다. 서버는 이미 회전된 토큰이 다시 오면
 * 탈취로 보고 그 사용자의 모든 세션을 끊으므로(AuthService.reissue), 새 탭을 열 때마다
 * 로그아웃되는 증상이 났다. 그래서 인증 스택은 반드시 하나만 마운트한다.
 */
function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <StoreProvider>
          <AppRoutes />
        </StoreProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
