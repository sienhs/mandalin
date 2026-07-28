-- ============================================================
-- 테스트용 더미 데이터 (개발 환경 전용 — 프로덕션 배포 전 삭제 필요)
-- ============================================================

-- 테스트 유저 3명 (uuid 고정 → 팀원 간 공유 가능)
INSERT INTO users (name, nickname, uuid, point, profile_image) VALUES
    ('테스트유저A', '유저A', 'test-uuid-user-aaaa', 0, NULL),
    ('테스트유저B', '유저B', 'test-uuid-user-bbbb', 0, NULL),
    ('테스트유저C', '유저C', 'test-uuid-user-cccc', 0, NULL);
