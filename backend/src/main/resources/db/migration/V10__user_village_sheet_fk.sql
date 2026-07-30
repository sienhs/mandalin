-- user_village.sheet_id → sheet FK.
--
-- 컬럼과 PK 는 V3 의 CREATE 에 있는데 FK 만 여기 떨어져 있는 이유: user_village 는 V3,
-- sheet 는 V6 에서 만들어진다. V3 시점에는 참조할 sheet 테이블이 아직 없어서
-- CREATE TABLE 안에 이 제약을 쓸 수 없다.

-- 시트를 지우면 그 시트의 지형 설정도 함께 사라져야 한다. SheetService.deleteSheet 는
-- user_village 를 지우지 않으므로, 이 CASCADE 가 없으면 고아 행이 영구히 남는다.
ALTER TABLE user_village ADD CONSTRAINT fk_user_village_sheet FOREIGN KEY (sheet_id)
    REFERENCES sheet (id) ON DELETE CASCADE;

-- PK 선두 컬럼이 user_id 라 sheet_id 단독 조회는 인덱스를 타지 못한다(V6 의 idx_likes_sheet 와 같은 이유).
-- 위 CASCADE 가 시트를 지울 때마다 sheet_id 로 훑으므로 인덱스가 없으면 매번 전체 스캔이다.
CREATE INDEX idx_user_village_sheet ON user_village (sheet_id);
