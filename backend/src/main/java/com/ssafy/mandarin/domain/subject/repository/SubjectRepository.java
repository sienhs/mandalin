package com.ssafy.mandarin.domain.subject.repository;

import java.util.List;

import com.ssafy.mandarin.domain.subject.entity.Subject;
import com.ssafy.mandarin.domain.subject.entity.SubjectPeriod;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    // 특정 도메인에 속한 세부 과제 목록을 위치 좌표(position: 1~8) 오름차순으로 조회
    List<Subject> findByDomainIdOrderByPositionAsc(Long domainId);

    // 특정 만다라트 시트 전체에 속한 세부 과제 목록 조회
    List<Subject> findByDomainSheetId(Long sheetId);

    // 특정 유저의 주기별(daily, weekly, none) 과제 목록 조회 (To-do 리스트용)
    @EntityGraph(attributePaths = {"domain", "domain.sheet"})
    List<Subject> findByUserIdAndPeriod(Long userId, SubjectPeriod period);

    // 특정 만다라트 시트 전체에 속한 세부 과제의 총 개수 카운트
    long countByDomainSheetId(Long sheetId);

    // 특정 만다라트 시트에서 최종 완료(is_done = true) 상태인 과제 개수 카운트 (달성률 계산용)
    long countByDomainSheetIdAndIsDoneTrue(Long sheetId);

    // 시트 전체 과제를 도메인과 함께 조회 (리포트 집계용 — 도메인별로 묶어 목표 횟수를 센다)
    @Query("SELECT s FROM Subject s JOIN FETCH s.domain d WHERE d.sheet.id = :sheetId")
    List<Subject> findBySheetIdWithDomain(@Param("sheetId") Long sheetId);

    /**
     * 오늘 할 일 후보. 시트까지 한 번에 끌어와 응답에 sheetId 를 채운다.
     *
     * <p>기존 조회는 DAILY 만 봤는데, 주간 과제도 "이번 주에 해야 하는 일"이라 함께 내린다.
     * 완료 API 가 sheetId 를 요구하므로 domain → sheet 를 fetch join 해야 한다 —
     * 안 그러면 응답을 만들 때 시트마다 추가 쿼리가 나간다.
     */
    @Query("SELECT s FROM Subject s "
            + "JOIN FETCH s.domain d "
            + "JOIN FETCH d.sheet sh "
            + "WHERE s.user.id = :userId AND s.period IN :periods "
            + "ORDER BY sh.id ASC, d.position ASC, s.position ASC")
    List<Subject> findTodoCandidates(@Param("userId") Long userId,
                                     @Param("periods") List<SubjectPeriod> periods);

    /*
     * 과제 수정·삭제용 메서드는 두지 않는다.
     *
     * 만다라트는 생성 시점에 81칸이 확정되고 그 뒤로는 수행만 한다. 목표를 나중에 고칠 수 있으면
     * 채우기 어려운 칸을 지우거나 쉬운 것으로 바꾸게 되고, 그러면 큰 목표를 잘게 나눈 의미가
     * 사라진다. 수정 경로를 아예 만들지 않는 것이 이 규칙을 지키는 가장 확실한 방법이다.
     */
}
