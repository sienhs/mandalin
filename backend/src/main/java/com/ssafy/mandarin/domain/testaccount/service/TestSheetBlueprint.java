package com.ssafy.mandarin.domain.testaccount.service;

import java.util.Arrays;
import java.util.List;

import com.ssafy.mandarin.domain.subject.entity.SubjectPeriod;
import com.ssafy.mandarin.domain.village.entity.Terrain;

/**
 * 테스트 계정에 심을 만다라트 내용.
 *
 * <p>내용을 서비스 코드에서 떼어 둔 이유는 길이다 — 81칸을 채우려면 시트 하나에 제목이 73개
 * 필요하고, 두 장이면 146개다. 시딩 절차({@link TestAccountService})와 섞이면 절차가 보이지
 * 않는다.
 *
 * <p><b>빈 계정을 주지 않는다.</b> 갓 만든 계정으로는 확인할 수 있는 화면이 로그인과 생성
 * 화면뿐이다. 홈의 오늘 할 일, 마을의 성장 단계, 리포트의 주간 그래프, 리더보드, 친구 시트는
 * 모두 <i>데이터가 있어야</i> 비로소 보인다. 그래서 두 장을 서로 다른 상태로 심는다.
 *
 * <ul>
 *   <li>1장 — <b>100%</b>. 먼저 심으므로 보상 판정 시트가 되고, 여덟 구간이 전부 열려 있다.
 *   <li>2장 — <b>50%</b>. 구역별 진행률이 100% 부터 0% 까지 계단으로 벌어져 마을 건물이 여러
 *       성장 단계로 섞여 보이고, 남은 32칸이 오늘 할 일로 나온다.
 * </ul>
 *
 * <p>두 수치는 <b>정확히</b> 100.0 / 50.0 이다. 어떻게 오차 없이 맞추는지는 {@link #done(int)}
 * 주석에 있다.
 */
final class TestSheetBlueprint {

	private TestSheetBlueprint() {
	}

	/** 과제 한 칸. 목표 횟수는 적지 않는다 — 주기와 기간으로 서버가 계산한다. */
	record Task(String title, SubjectPeriod period, int countPerPeriod) {
	}

	/**
	 * 세부 목표 한 칸 = 과제 8개.
	 *
	 * @param progress 과제별 진행률(%). {@code tasks} 와 같은 순서·같은 개수다. 값을 과제 옆에
	 *                 두는 이유는 <b>둘이 어긋나면 눈에 보이지 않는다</b>는 것이다 — 표를 따로
	 *                 두면 몇 번째 과제가 몇 %인지 세어 봐야 한다.
	 *                 <p>값은 0 아니면 100 만 쓴다({@link #done(int)} 주석 참고). 시트 진행률이
	 *                 여기서 나오고, 그 진행률이 곧 보상 구간 판정에 쓰인다.
	 */
	record DomainSpec(String title, List<Integer> progress, List<Task> tasks) {
	}

	/** 시트 한 장. */
	record SheetSpec(
			String title,
			boolean open,
			Terrain terrain,
			int expiresInDays,
			List<DomainSpec> domains
	) {
	}

	/** 진행률 8개. {@code List.of(...)} 보다 표처럼 읽힌다. */
	private static List<Integer> pct(int... values) {
		return Arrays.stream(values).boxed().toList();
	}

	/**
	 * 앞에서부터 {@code done} 칸을 완료(100)로, 나머지를 0 으로 채운다.
	 *
	 * <p><b>중간값(50, 70 …)을 쓰지 않는 이유가 있다.</b> 진행률은 DB 에 없고
	 * {@code tryCount / targetCount} 로 계산되는데, 심을 때는 반대로
	 * {@code round(progress/100 × targetCount)} 로 역산한다({@code TestAccountService.applyProgress}).
	 * 목표 횟수가 8~91 로 제각각이라 이 왕복에서 반올림 오차가 남아, 청사진에 50 이라고 적어도
	 * 화면에는 51 이 뜬다. 시트 하나로 모으면 오차가 몇 %p 씩 밀린다.
	 *
	 * <p>0 과 100 은 왕복해도 정확하다 — 100 은 {@code isDone} 이고 0 은 아예 건드리지 않는다.
	 * 그래서 <b>구역당 완료 칸 수</b>로 진행률을 만든다. 구역 진행률은 {@code done × 12.5}% 이고,
	 * 시트 진행률은 여덟 구역의 평균이라 <b>정확히</b> 원하는 값이 된다.
	 */
	private static List<Integer> done(int done) {
		int[] values = new int[SLOTS];
		Arrays.fill(values, 0, done, 100);
		return pct(values);
	}

	/** 구역 하나의 과제 수이자 시트의 구역 수. */
	private static final int SLOTS = 8;

	/**
	 * 심는 순서. <b>100% 시트가 먼저다.</b>
	 *
	 * <p>마일스톤 보상은 계정당 구간별 1회이고, 판정은 <b>가장 먼저 만든 시트</b> 하나로만 한다
	 * ({@code RewardTrackService.findBoundSheet}). 그래서 먼저 심는 시트의 진행률이 곧 "이 계정이
	 * 보상 구간을 어디까지 열 수 있는가" 다.
	 *
	 * <p>예전에는 진행률 0 인 시트를 먼저 심었다. 그러면 판정 시트가 0% 라 <b>보상 트랙이 통째로
	 * 잠긴 계정</b>이 되고, 옆 시트가 47.5% 를 보여주고 있어 잠긴 이유도 화면에서 읽히지 않았다.
	 * 지금은 100% 시트를 먼저 심어 <b>여덟 구간이 전부 열린 상태</b>로 시작한다 — 크레딧 수령,
	 * 랜덤 랜드마크, 마지막 구간의 전종 지급까지 눌러서 확인할 수 있다.
	 */
	static List<SheetSpec> all() {
		return List.of(growth(), habit());
	}

	/**
	 * <b>100% 시트.</b> 먼저 심으므로 보상 판정 시트가 된다.
	 *
	 * <p>64칸이 전부 완료라 진행률이 정확히 100.0% 이고, 여덟 구간이 모두 열린 채로 시작한다.
	 * 마지막 구간(100%)은 남은 랜드마크를 전종 주므로 컬렉션이 한 번에 채워지는 것까지 볼 수 있다.
	 *
	 * <p>공개(open)로 둔다. 세 계정이 서로 친구라서, 공개 시트가 하나는 있어야 친구 목록 ·
	 * 친구 시트 열람 · 좋아요 · 리더보드가 빈 화면이 아니게 된다.
	 *
	 * <p>완성된 마을이라 <b>건물이 전부 최종 성장 단계</b>다. 짓다 만 건물과 빈 땅은 50% 시트인
	 * {@link #habit()} 에서 본다 — 두 시트를 오가면 성장 단계가 한 벌 다 나온다.
	 *
	 * <p>다만 64칸이 모두 {@code isDone} 이라 <b>이 시트에는 오늘 할 일이 없다</b>. 홈의 할 일
	 * 목록과 과제 완료 · 포인트 적립은 50% 시트 쪽에서 확인한다.
	 */
	private static SheetSpec growth() {
		return new SheetSpec(
				"개발자로 성장하기",
				true,
				Terrain.GRASS_PATH,
				60,
				List.of(
						// 여덟 구역 모두 done(8) — 64칸 전부 완료라 진행률이 정확히 100.0% 다.
						new DomainSpec("알고리즘", done(8), List.of(
								new Task("백준 한 문제 풀기", SubjectPeriod.DAILY, 1),
								new Task("틀린 문제 오답 정리", SubjectPeriod.WEEKLY, 2),
								new Task("풀이 코드 리뷰 받기", SubjectPeriod.WEEKLY, 1),
								new Task("시간복잡도 계산 연습", SubjectPeriod.WEEKLY, 2),
								new Task("그래프 문제 다섯 개", SubjectPeriod.WEEKLY, 1),
								new Task("DP 문제 다섯 개", SubjectPeriod.WEEKLY, 1),
								new Task("모의 코딩테스트 응시", SubjectPeriod.WEEKLY, 1),
								new Task("알고리즘 스터디 참여", SubjectPeriod.WEEKLY, 1))),
						new DomainSpec("백엔드", done(8), List.of(
								new Task("Spring 공식 문서 읽기", SubjectPeriod.DAILY, 1),
								new Task("REST API 설계 연습", SubjectPeriod.WEEKLY, 2),
								new Task("JPA 쿼리 튜닝해 보기", SubjectPeriod.WEEKLY, 1),
								new Task("테스트 코드 작성", SubjectPeriod.DAILY, 1),
								new Task("예외 처리 규칙 정리", SubjectPeriod.WEEKLY, 1),
								new Task("트랜잭션 실습", SubjectPeriod.WEEKLY, 1),
								new Task("인증·인가 구현해 보기", SubjectPeriod.WEEKLY, 1),
								new Task("API 응답 시간 측정", SubjectPeriod.WEEKLY, 1))),
						new DomainSpec("프론트엔드", done(8), List.of(
								new Task("React 훅 실습", SubjectPeriod.DAILY, 1),
								new Task("타입스크립트 타입 연습", SubjectPeriod.DAILY, 1),
								new Task("접근성 점검", SubjectPeriod.WEEKLY, 1),
								new Task("렌더 최적화 실험", SubjectPeriod.WEEKLY, 1),
								new Task("상태 관리 리팩터링", SubjectPeriod.WEEKLY, 1),
								new Task("반응형 레이아웃 만들기", SubjectPeriod.WEEKLY, 1),
								new Task("애니메이션 다듬기", SubjectPeriod.WEEKLY, 1),
								new Task("컴포넌트 문서화", SubjectPeriod.WEEKLY, 1))),
						new DomainSpec("인프라", done(8), List.of(
								new Task("배포 로그 확인", SubjectPeriod.DAILY, 1),
								new Task("Docker 이미지 만들기", SubjectPeriod.WEEKLY, 1),
								new Task("CI 파이프라인 손보기", SubjectPeriod.WEEKLY, 1),
								new Task("nginx 설정 이해하기", SubjectPeriod.WEEKLY, 1),
								new Task("모니터링 지표 보기", SubjectPeriod.WEEKLY, 2),
								new Task("백업 스크립트 점검", SubjectPeriod.MONTHLY, 1),
								new Task("보안 그룹 정리", SubjectPeriod.MONTHLY, 1),
								new Task("장애 대응 훈련", SubjectPeriod.MONTHLY, 1))),
						new DomainSpec("CS 기초", done(8), List.of(
								new Task("면접 질문 답변 정리", SubjectPeriod.DAILY, 1),
								new Task("네트워크 한 챕터", SubjectPeriod.WEEKLY, 2),
								new Task("운영체제 한 챕터", SubjectPeriod.WEEKLY, 2),
								new Task("자료구조 직접 구현", SubjectPeriod.WEEKLY, 1),
								new Task("정규화 연습", SubjectPeriod.WEEKLY, 1),
								new Task("디자인 패턴 하나 정리", SubjectPeriod.WEEKLY, 1),
								new Task("동시성 개념 정리", SubjectPeriod.WEEKLY, 1),
								new Task("컴파일 과정 정리", SubjectPeriod.MONTHLY, 1))),
						new DomainSpec("협업", done(8), List.of(
								new Task("커밋 메시지 다듬기", SubjectPeriod.DAILY, 1),
								new Task("PR 리뷰 남기기", SubjectPeriod.DAILY, 1),
								new Task("데일리 스크럼 참여", SubjectPeriod.DAILY, 1),
								new Task("회고 작성", SubjectPeriod.WEEKLY, 1),
								new Task("이슈 정리", SubjectPeriod.WEEKLY, 2),
								new Task("문서 최신화", SubjectPeriod.WEEKLY, 1),
								new Task("페어 프로그래밍", SubjectPeriod.WEEKLY, 1),
								new Task("팀 규칙 점검", SubjectPeriod.MONTHLY, 1))),
						new DomainSpec("기록", done(8), List.of(
								new Task("학습 노트 작성", SubjectPeriod.DAILY, 1),
								new Task("읽은 문서 링크 정리", SubjectPeriod.DAILY, 1),
								new Task("블로그 글 초안 쓰기", SubjectPeriod.WEEKLY, 1),
								new Task("트러블슈팅 기록", SubjectPeriod.WEEKLY, 2),
								new Task("코드 스니펫 정리", SubjectPeriod.WEEKLY, 1),
								new Task("주간 회고 쓰기", SubjectPeriod.WEEKLY, 1),
								new Task("블로그 발행", SubjectPeriod.MONTHLY, 2),
								new Task("목표 점검", SubjectPeriod.MONTHLY, 1))),
						new DomainSpec("건강", done(8), List.of(
								new Task("아침 스트레칭", SubjectPeriod.DAILY, 1),
								new Task("산책 30분", SubjectPeriod.DAILY, 1),
								new Task("물 2리터 마시기", SubjectPeriod.DAILY, 1),
								new Task("12시 전에 자기", SubjectPeriod.DAILY, 1),
								new Task("눈 운동", SubjectPeriod.DAILY, 3),
								new Task("식단 기록", SubjectPeriod.DAILY, 1),
								new Task("주말 운동", SubjectPeriod.WEEKLY, 2),
								new Task("건강검진 예약", SubjectPeriod.NONE, 1)))));
	}

	/**
	 * <b>50% 시트.</b> 나중에 심으므로 보상 판정에는 쓰이지 않는다.
	 *
	 * <p>구역별 완료 칸 수를 <b>8 · 7 · 6 · 5 · 3 · 2 · 1 · 0</b> 으로 흩어 놓았다. 합이 32칸이라
	 * 시트 진행률이 정확히 50.0% 이면서, 구역 진행률은 100% 부터 0% 까지 계단으로 벌어진다.
	 * 평평하게 32칸을 고르게 나누면(구역마다 4칸) 수치는 같아도 리포트의 "잘하고 있는 것 /
	 * 챙길 것" 과 도메인별 달성률 막대가 전부 같은 높이가 되어 화면이 죽는다.
	 *
	 * <p>덕분에 마을에도 <b>완성된 구역 · 짓다 만 구역 · 빈 땅</b>이 한 화면에 같이 나와 성장 단계
	 * 렌더링을 눈으로 검수할 수 있다. 손대지 않은 과제가 32칸 남아 있어 홈의 오늘 할 일과 과제
	 * 완료 · 포인트 적립도 여기서 확인한다.
	 *
	 * <p>비공개로 둔다 — 공개/비공개 배지와 공개 전환 흐름을 한 계정 안에서 비교할 수 있어야
	 * 한다. 지형도 초원이 아닌 도시 도로로 두어 두 지형 렌더러를 같이 확인한다.
	 */
	private static SheetSpec habit() {
		return new SheetSpec(
				"생활 습관 만들기",
				false,
				Terrain.CITY_ROAD,
				90,
				List.of(
						new DomainSpec("운동", done(8), List.of(
								new Task("아침 스트레칭", SubjectPeriod.DAILY, 1),
								new Task("계단 이용하기", SubjectPeriod.DAILY, 1),
								new Task("홈트 20분", SubjectPeriod.DAILY, 1),
								new Task("만보 걷기", SubjectPeriod.DAILY, 1),
								new Task("자세 교정 운동", SubjectPeriod.DAILY, 1),
								new Task("러닝 다녀오기", SubjectPeriod.WEEKLY, 2),
								new Task("체중 기록", SubjectPeriod.WEEKLY, 3),
								new Task("주말 등산", SubjectPeriod.MONTHLY, 1))),
						new DomainSpec("식습관", done(7), List.of(
								new Task("아침 먹기", SubjectPeriod.DAILY, 1),
								new Task("야식 참기", SubjectPeriod.DAILY, 1),
								new Task("채소 한 접시", SubjectPeriod.DAILY, 1),
								new Task("물 2리터 마시기", SubjectPeriod.DAILY, 1),
								new Task("커피 두 잔 이하", SubjectPeriod.DAILY, 1),
								new Task("영양제 챙겨 먹기", SubjectPeriod.DAILY, 1),
								new Task("직접 요리하기", SubjectPeriod.WEEKLY, 2),
								new Task("배달 한 번만", SubjectPeriod.WEEKLY, 1))),
						new DomainSpec("수면", done(6), List.of(
								new Task("12시 전에 자기", SubjectPeriod.DAILY, 1),
								new Task("일곱 시간 자기", SubjectPeriod.DAILY, 1),
								new Task("기상 시간 고정", SubjectPeriod.DAILY, 1),
								new Task("자기 전 휴대폰 끄기", SubjectPeriod.DAILY, 1),
								new Task("오후에 카페인 안 먹기", SubjectPeriod.DAILY, 1),
								new Task("수면 기록", SubjectPeriod.DAILY, 1),
								new Task("낮잠 20분 이내", SubjectPeriod.DAILY, 1),
								new Task("침구 정리", SubjectPeriod.WEEKLY, 2))),
						new DomainSpec("독서", done(5), List.of(
								new Task("스무 쪽 읽기", SubjectPeriod.DAILY, 1),
								new Task("밑줄 옮겨 적기", SubjectPeriod.WEEKLY, 2),
								new Task("독서 노트 쓰기", SubjectPeriod.WEEKLY, 1),
								new Task("오디오북 듣기", SubjectPeriod.WEEKLY, 2),
								new Task("한 달 한 권 끝내기", SubjectPeriod.MONTHLY, 1),
								new Task("서점 가기", SubjectPeriod.MONTHLY, 1),
								new Task("서평 쓰기", SubjectPeriod.MONTHLY, 1),
								new Task("읽을 책 목록 만들기", SubjectPeriod.MONTHLY, 1))),
						new DomainSpec("정리", done(3), List.of(
								new Task("책상 정리", SubjectPeriod.DAILY, 1),
								new Task("설거지 바로 하기", SubjectPeriod.DAILY, 1),
								new Task("빨래 개기", SubjectPeriod.WEEKLY, 2),
								new Task("냉장고 정리", SubjectPeriod.WEEKLY, 1),
								new Task("파일 백업", SubjectPeriod.WEEKLY, 1),
								new Task("지갑 정리", SubjectPeriod.WEEKLY, 1),
								new Task("안 쓰는 물건 비우기", SubjectPeriod.MONTHLY, 1),
								new Task("사진 정리", SubjectPeriod.MONTHLY, 1))),
						new DomainSpec("재정", done(2), List.of(
								new Task("가계부 쓰기", SubjectPeriod.DAILY, 1),
								new Task("무지출 하루", SubjectPeriod.WEEKLY, 1),
								new Task("커피값 줄이기", SubjectPeriod.WEEKLY, 3),
								new Task("투자 공부", SubjectPeriod.WEEKLY, 2),
								new Task("고정비 점검", SubjectPeriod.MONTHLY, 1),
								new Task("적금 넣기", SubjectPeriod.MONTHLY, 1),
								new Task("구독 서비스 점검", SubjectPeriod.MONTHLY, 1),
								new Task("다음 달 예산 세우기", SubjectPeriod.MONTHLY, 1))),
						new DomainSpec("관계", done(1), List.of(
								new Task("고맙다고 말하기", SubjectPeriod.DAILY, 1),
								new Task("안부 메시지 보내기", SubjectPeriod.WEEKLY, 3),
								new Task("가족에게 연락", SubjectPeriod.WEEKLY, 2),
								new Task("같이 운동하기", SubjectPeriod.WEEKLY, 1),
								new Task("묵힌 답장 보내기", SubjectPeriod.WEEKLY, 1),
								new Task("친구 만나기", SubjectPeriod.MONTHLY, 2),
								new Task("생일 챙기기", SubjectPeriod.MONTHLY, 1),
								new Task("편지 쓰기", SubjectPeriod.MONTHLY, 1))),
						new DomainSpec("취미", done(0), List.of(
								new Task("그림 10분", SubjectPeriod.DAILY, 1),
								new Task("악기 연습", SubjectPeriod.DAILY, 1),
								new Task("사진 찍기", SubjectPeriod.WEEKLY, 2),
								new Task("영화 한 편", SubjectPeriod.WEEKLY, 1),
								new Task("새 요리 도전", SubjectPeriod.WEEKLY, 1),
								new Task("산책 코스 개발", SubjectPeriod.WEEKLY, 1),
								new Task("전시 보기", SubjectPeriod.MONTHLY, 1),
								new Task("플레이리스트 만들기", SubjectPeriod.MONTHLY, 1)))));
	}
}
