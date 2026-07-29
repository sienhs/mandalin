package com.ssafy.mandarin.domain.demo.service;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.demo.dto.DemoProgressRequest;
import com.ssafy.mandarin.domain.sheet.entity.Sheet;
import com.ssafy.mandarin.domain.sheet.repository.SheetRepository;
import com.ssafy.mandarin.domain.subject.entity.Subject;
import com.ssafy.mandarin.domain.subject.repository.SubjectRepository;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 시연용 진행률 조작.
 *
 * <p>과제 수행/체크 API(SubjectController)가 아직 없어서 마을이 영원히 빈 땅으로 남는다.
 * 발표·시연에서 마을이 자라는 모습을 보여줄 수 있도록 진행률을 임의로 넣는 통로만 둔다.
 *
 * <p>{@code app.demo.progress-enabled} 로 켜고 끈다(기본 true). 발표 때는 배포 환경에서도
 * 동작해야 해서 프로필로 막지 않고 스위치를 뒀다.
 *
 * <p><b>포인트 적립이 구현되면 반드시 끈다</b>({@code DEMO_PROGRESS_ENABLED=false}).
 * 진행률을 임의로 100 으로 올릴 수 있어 포인트를 무한히 찍을 수 있게 된다. 지금은 포인트를
 * 주는 코드가 없어서 자기 달성률만 조작되는 수준에 머문다.
 *
 * <p>실제 기능(수행 체크, 주기별 To-do)은 SubjectController 담당자가 구현한다. 그때 이 클래스는
 * 지워도 된다.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "app.demo.progress-enabled", havingValue = "true")
@RequiredArgsConstructor
public class DemoProgressService {

	private final SheetRepository sheetRepository;
	private final SubjectRepository subjectRepository;

	/**
	 * 시트(또는 그 안의 한 도메인) 전체 진행률을 한 번에 지정한다.
	 *
	 * <p>과제 64개를 한 건씩 호출하면 요청이 64번 나가서, 시연 중에 눈에 보일 만큼 느리다.
	 *
	 * @return 실제로 바뀐 과제 수
	 */
	@Transactional
	public int applyToSheet(Long userId, Long sheetId, DemoProgressRequest request) {
		Sheet sheet = sheetRepository.findById(sheetId)
				.orElseThrow(() -> new BusinessException(ErrorCode.SHEET_NOT_FOUND));

		// 남의 시트를 바꾸지 못하게 막는다. 공개(isOpen) 여부와 무관하게 소유자만 쓸 수 있다 —
		// 조회는 공개면 허용이지만 쓰기는 아니다.
		if (!sheet.getUser().getId().equals(userId)) {
			throw new BusinessException(ErrorCode.SHEET_ACCESS_DENIED);
		}

		List<Subject> subjects = subjectRepository.findByDomainSheetId(sheetId).stream()
				.filter(subject -> request.domainPosition() == null
						|| request.domainPosition().equals(subject.getDomain().getPosition()))
				.toList();

		for (Subject subject : subjects) {
			apply(subject, request.isRandom() ? ThreadLocalRandom.current().nextInt(101) : progressOf(request));
		}

		log.info("[demo] sheet {} 과제 {}건 진행률 변경 (user {})", sheetId, subjects.size(), userId);
		return subjects.size();
	}

	/** 과제 한 건의 진행률을 지정한다. */
	@Transactional
	public void applyToSubject(Long userId, Long subjectId, DemoProgressRequest request) {
		Subject subject = subjectRepository.findById(subjectId)
				.orElseThrow(() -> new BusinessException(ErrorCode.SUBJECT_NOT_FOUND));

		if (!subject.getUser().getId().equals(userId)) {
			throw new BusinessException(ErrorCode.SUBJECT_ACCESS_DENIED);
		}

		apply(subject, request.isRandom() ? ThreadLocalRandom.current().nextInt(101) : progressOf(request));
	}

	private int progressOf(DemoProgressRequest request) {
		return request.progress() == null ? 0 : request.progress();
	}

	/**
	 * 진행률(0~100)을 저장 형태로 되돌린다.
	 *
	 * <p>DB 에는 진행률 컬럼이 없고 tryCount/targetCount/isDone 만 있다(진행률은 조회 시
	 * SheetService.progressOf 가 계산한다). 그래서 역산해서 넣는다 — 그러지 않으면 시연에서
	 * 바꾼 값과 조회에서 계산한 값이 어긋난다.
	 */
	private void apply(Subject subject, int progress) {
		Integer target = subject.getTargetCount();
		if (target == null || target <= 0) {
			// 목표 횟수가 없으면 비율을 표현할 수 없다. 완료/미완료로만 다룬다.
			subject.updateTryCount(progress >= 100 ? 1 : 0);
		} else {
			subject.updateTryCount((int) Math.round(progress / 100.0 * target));
		}
		subject.updateIsDone(progress >= 100);
	}
}
