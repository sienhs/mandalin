import type { GoalPayload } from '../../components/aiCoach/useCoachRoom'

/**
 * 안내용 예시 대화의 대본.
 *
 * <p>재생 장치(`useCoachDemo`)와 나눠 둔 이유는 <b>고치는 사람이 다르기 때문</b>이다. 대사는
 * 시연 때마다 손보게 되는데, 타이머·상태 전환이 섞인 파일에서 문장만 고치려면 매번 재생
 * 순서를 다시 읽어야 한다.
 *
 * <p><b>글자 수 상한을 지킨다</b>(`draftStorage`): 세부 목표 20자, 과제 40자. 넘기면 담는
 * 순간 잘려서, 카드에 보이던 제목과 초안에 들어간 제목이 달라진다.
 */

/** 한 턴 = 사용자가 한 번 말하고 코치가 한 번 답하는 왕복. */
export type DemoTurn = {
  /**
   * 받아 적히는 토막. <b>마지막 토막이 최종 발화</b>다 — 따로 두면 둘이 어긋날 수 있다.
   *
   * <p>첫 턴만 길게 끊는다. 실시간 전사가 어떻게 보이는지는 한 번만 보여 주면 충분하고,
   * 매 턴 같은 속도로 타자를 치면 재생이 지루해진다.
   */
  chunks: string[]
  reply: string
  proposal: GoalPayload
  /**
   * 이 턴의 과제를 <b>대신 담을지</b>.
   *
   * <p>마지막 턴은 거짓이다. 안내가 곧바로 "마음에 드는 것만 담기" 로 넘어가는데, 그때
   * 카드가 전부 "담았어요" 로 잠겨 있으면 눌러 볼 것이 없다. 앞 턴들을 담아 두는 것은
   * 오른쪽 초안이 차오르는 모습 — 이 대화가 무엇을 만드는지 — 을 보여 주기 위해서다.
   */
  autoAdd: boolean
}

export const DEMO_TURNS: DemoTurn[] = [
  {
    chunks: [
      '요즘',
      '요즘 체력이 너무',
      '요즘 체력이 너무 떨어졌어요.',
      '요즘 체력이 너무 떨어졌어요. 올해는 건강을',
      '요즘 체력이 너무 떨어졌어요. 올해는 건강을 제대로 챙기고 싶어요.',
    ],
    reply:
      '좋아요. 체력은 한 번에 끌어올리는 것보다 끊기지 않는 게 중요해요. ' +
      '“꾸준한 운동”을 첫 세부 목표로 잡고, 오늘부터 할 수 있는 것으로 세 가지를 골라 봤습니다.',
    proposal: {
      action: 'generate',
      domain: '꾸준한 운동',
      domain_is_new: true,
      generated_tasks: [
        {
          title: '아침 스트레칭 10분',
          frequency: 'daily',
          count: 1,
          description: '몸을 깨우는 가장 가벼운 시작',
        },
        {
          title: '30분 달리기',
          frequency: 'weekly',
          count: 3,
          description: '심폐 지구력을 올리는 기본 운동',
        },
        {
          title: '엘리베이터 대신 계단',
          frequency: 'daily',
          count: 1,
          description: '따로 시간을 내지 않아도 되는 운동',
        },
      ],
    },
    autoAdd: true,
  },
  {
    chunks: ['운동만으로는', '운동만으로는 안 될 것 같아요. 먹는 것도 같이 바꾸고 싶어요.'],
    reply:
      '맞습니다. 식사는 크게 바꾸면 오래 못 가요. 지키기 쉬운 크기로 “규칙적인 식사”를 ' +
      '다음 칸에 넣을게요.',
    proposal: {
      action: 'generate',
      domain: '규칙적인 식사',
      domain_is_new: true,
      generated_tasks: [
        {
          title: '아침 거르지 않기',
          frequency: 'daily',
          count: 1,
          description: '하루 리듬을 잡아 주는 한 끼',
        },
        {
          title: '물 2L 마시기',
          frequency: 'daily',
          count: 1,
          description: '가장 쉬운데 가장 자주 빠지는 것',
        },
        {
          title: '배달 음식 줄이기',
          frequency: 'weekly',
          count: 2,
          description: '아예 끊지 않고 횟수만 정해 둡니다',
        },
      ],
    },
    autoAdd: true,
  },
  {
    chunks: ['잠도', '잠도 자꾸 늦게 자요.'],
    reply:
      '수면은 앞의 두 가지를 받쳐 주는 바닥이에요. “충분한 수면”으로 한 칸 더 만들었습니다. ' +
      '이번에는 마음에 드는 것만 직접 담아 보세요.',
    proposal: {
      action: 'generate',
      domain: '충분한 수면',
      domain_is_new: true,
      generated_tasks: [
        {
          title: '12시 전에 잠들기',
          frequency: 'daily',
          count: 1,
          description: '기상 시각보다 취침 시각을 먼저 정합니다',
        },
        {
          title: '자기 전 휴대폰 멀리 두기',
          frequency: 'daily',
          count: 1,
          description: '잠드는 데 걸리는 시간을 줄여 줍니다',
        },
        {
          title: '주말에도 같은 시각에 일어나기',
          frequency: 'weekly',
          count: 2,
          description: '주말에 무너지면 월요일이 가장 힘듭니다',
        },
      ],
    },
    autoAdd: false,
  },
]
