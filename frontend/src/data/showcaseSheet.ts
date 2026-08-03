import type { Period, Sheet } from './types'

/**
 * 로그인 전 화면(소개·로그인)이 보여 주는 견본 마을.
 *
 * <p>비로그인 상태라 서버를 부를 수 없어 화면에서 직접 만든다. <b>두 화면이 같은 것을
 * 써야 한다</b> — 각자 만들면 진행률이나 도메인 이름이 갈라져 어느 쪽이 이 서비스의
 * 모습인지 알 수 없게 된다.
 */
export function showcaseSheet(): Sheet {
  const titles = ['운동', '식습관', '수면', '멘탈', '체중', '습관', '검진', '활동']
  const ratios = [78, 64, 42, 30, 55, 70, 88, 60]

  return {
    id: 0,
    title: '건강한 몸 만들기',
    isOpen: true,
    likeCount: 42,
    isLiked: false,
    achievementRate: 61,
    createdAt: '2026-06-01T00:00:00',
    expiredAt: '2026-12-31T00:00:00',
    terrain: 'GRASS_PATH',
    domains: titles.map((title, i) => ({
      id: i,
      position: i,
      title,
      subjects: Array.from({ length: 8 }, (_, j) => {
        const progress = Math.max(0, Math.min(100, ratios[i] + ((i * 7 + j * 13) % 40) - 20))
        return {
          id: i * 10 + j,
          position: j,
          title: `${title} 과제 ${j + 1}`,
          period: 'DAILY' as Period,
          point: 10,
          targetCount: 30,
          tryCount: Math.round((progress / 100) * 30),
          isDone: progress >= 100,
          isDonePeriod: false,
          progress,
        }
      }),
    })),
  }
}
