import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
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
 * <p>`AuthProvider` 는 기존 화면(그룹 만다라트 등)이 아직 쓰고 있어 남겨 둔다.
 * 새 화면들은 `StoreProvider` 의 세션을 본다.
 */
function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <StoreProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </StoreProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}

export default App
