package com.ssafy.mandarin.domain.sheet;

import static org.assertj.core.api.Assertions.assertThat;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;

import com.ssafy.mandarin.domain.sheet.controller.SheetController;
import com.ssafy.mandarin.domain.sheet.repository.DomainRepository;
import com.ssafy.mandarin.domain.subject.repository.SubjectRepository;

/**
 * "만다라트는 생성 후 내용을 고칠 수 없다" 는 규칙을 구조로 고정한다.
 *
 * <p>이 규칙은 코드 어디에도 강제 장치가 없고 "그런 API 를 만들지 않는다" 로만 지켜진다.
 * 나중에 누군가 편의를 위해 수정 엔드포인트를 하나 추가하면 규칙이 조용히 무너지는데,
 * 그때 이 테스트가 실패해서 <b>의도한 변경인지 다시 묻게</b> 만드는 것이 목적이다.
 *
 * <p>정말로 정책을 바꾸기로 했다면 이 테스트도 함께 고치면 된다. 막으려는 것은
 * 정책 변경 자체가 아니라 <b>모르는 사이에 바뀌는 것</b>이다.
 */
class SheetImmutabilityTest {

    /** 허용된 변경 경로. 이 목록에 없는 쓰기 메서드가 생기면 실패한다. */
    private static final List<String> ALLOWED_WRITE_METHODS = List.of(
            "createSheet",      // 생성 — 여기서 81칸이 확정된다
            "deleteSheet",      // 통째로 버리기 (부분 수정이 아니다)
            "toggleLike",       // 남의 시트에 누르는 반응. 내용이 아니다
            "updateVisibility"  // 공개 여부. 목표가 아니라 노출 설정이다
    );

    @DisplayName("SheetController 에는 허용된 쓰기 엔드포인트만 있다")
    @Test
    void sheetControllerExposesNoContentEditing() {
        List<String> writeMethods = Arrays.stream(SheetController.class.getDeclaredMethods())
                .filter(SheetImmutabilityTest::isWriteMapping)
                .map(Method::getName)
                .toList();

        assertThat(writeMethods)
                .as("만다라트 내용을 고치는 엔드포인트가 새로 생겼습니다. "
                        + "생성 이후 수정 불가 정책을 바꾸는 것이라면 이 테스트도 함께 고쳐 주세요.")
                .containsExactlyInAnyOrderElementsOf(ALLOWED_WRITE_METHODS);
    }

    @DisplayName("과제 리포지토리에 내용을 고치는 벌크 UPDATE 가 없다")
    @Test
    void subjectRepositoryHasNoContentUpdate() {
        List<String> suspicious = Arrays.stream(SubjectRepository.class.getDeclaredMethods())
                .map(Method::getName)
                .filter(name -> name.startsWith("update") || name.startsWith("delete"))
                .toList();

        assertThat(suspicious)
                .as("과제 내용을 고치는 메서드가 생겼습니다. 수행 기록(tryCount·updatedAt)은 "
                        + "SubjectService 의 완료 처리로만 바뀌어야 합니다.")
                .isEmpty();
    }

    @DisplayName("세부 목표 리포지토리에 이름을 고치는 메서드가 없다")
    @Test
    void domainRepositoryHasNoTitleUpdate() {
        List<String> suspicious = Arrays.stream(DomainRepository.class.getDeclaredMethods())
                .map(Method::getName)
                .filter(name -> name.startsWith("update") || name.startsWith("delete"))
                .toList();

        assertThat(suspicious).isEmpty();
    }

    private static boolean isWriteMapping(Method method) {
        return method.isAnnotationPresent(PostMapping.class)
                || method.isAnnotationPresent(PatchMapping.class)
                || method.isAnnotationPresent(PutMapping.class)
                || method.isAnnotationPresent(DeleteMapping.class);
    }
}
