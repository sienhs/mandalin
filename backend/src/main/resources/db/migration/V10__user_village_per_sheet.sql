-- 지형을 "유저당 하나" 에서 "유저의 시트마다 하나" 로 바꾼다.
--
-- V3 은 지형을 유저 단위 설정으로 보고 user_id 를 PK 로 잡았다. 실제로는 시트(마을) 한 장마다
-- 다른 지형을 고를 수 있어야 해서 PK 를 (user_id, sheet_id) 로 넓힌다.
--
-- V3 을 직접 고치지 않고 새 마이그레이션으로 옮기는 이유: V3 은 이미 적용된 마이그레이션이라
-- 내용을 바꾸면 checksum 이 어긋나 그 DB 는 기동 자체가 막힌다(validateOnMigrate 기본값 true).
--
-- sheet 를 참조하므로 sheet 테이블을 만드는 V6 보다 뒤에 와야 한다 — V3 시점에는 sheet 가
-- 없어서 애초에 이 FK 를 걸 수 없었다.

-- 기존 행을 시트별로 펼치려면 user_id 단독 PK 를 먼저 풀어야 한다.
ALTER TABLE user_village DROP CONSTRAINT IF EXISTS user_village_pkey;

ALTER TABLE user_village ADD COLUMN sheet_id BIGINT;

-- 이미 고른 지형을 그 유저의 시트 전체에 복사한다. 행을 지우고 기본값(GRASS_PATH)으로
-- 돌리는 편이 간단하지만, 유저가 고른 설정이 말없이 초기화되는 쪽이 더 나쁘다.
INSERT INTO user_village (user_id, sheet_id, terrain, created_at, updated_at)
SELECT uv.user_id, s.id, uv.terrain, uv.created_at, uv.updated_at
FROM user_village uv
         JOIN sheet s ON s.user_id = uv.user_id
WHERE uv.sheet_id IS NULL;

-- 펼치기 전의 원본 행. 시트가 하나도 없는 유저의 행도 여기서 사라지지만, 그릴 마을이 없으므로
-- 잃는 것이 없다 — 다음에 시트를 만들고 지형을 고르면 그때 새로 생긴다.
DELETE FROM user_village WHERE sheet_id IS NULL;

ALTER TABLE user_village ALTER COLUMN sheet_id SET NOT NULL;

ALTER TABLE user_village ADD CONSTRAINT pk_user_village PRIMARY KEY (user_id, sheet_id);

-- 시트를 지우면 그 시트의 지형 설정도 같이 사라져야 한다. SheetService.deleteSheet 는
-- user_village 를 지우지 않으므로, 이 CASCADE 가 없으면 고아 행이 영구히 남는다.
ALTER TABLE user_village ADD CONSTRAINT fk_user_village_sheet FOREIGN KEY (sheet_id)
    REFERENCES sheet (id) ON DELETE CASCADE;

-- PK 선두 컬럼이 user_id 라 sheet_id 단독 조회는 인덱스를 타지 못한다(V6 의 idx_likes_sheet 와 같은 이유).
-- 위 CASCADE 가 시트를 지울 때마다 sheet_id 로 훑으므로 인덱스가 없으면 매번 전체 스캔이다.
CREATE INDEX idx_user_village_sheet ON user_village (sheet_id);
