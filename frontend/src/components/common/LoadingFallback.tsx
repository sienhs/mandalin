/**
 * 무거운 페이지를 lazy 로드하는 동안 Suspense fallback으로 보여주는 화면.
 * TODO: 지금은 임시 안내 문구뿐 — 실제 스피너/스켈레톤 UI로 교체 필요.
 */
export default function LoadingFallback() {
  return (
    <div className="fixed inset-0 flex items-center justify-center font-sans text-[#5a6b76]">
      로딩중
    </div>
  )
}
