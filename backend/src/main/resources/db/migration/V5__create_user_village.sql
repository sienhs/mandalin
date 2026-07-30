-- 유저별 시트(마을) 지형 설정. 시트 한 장마다 다른 지형을 고를 수 있어 (user_id, sheet_id) 를 PK 로 쓴다.
--
-- 지형은 언제든 바꿀 수 있다. 행이 없으면 애플리케이션 기본값(GRASS_PATH)으로 동작하므로
-- 유저가 한 번도 고르지 않아도 마을은 정상적으로 그려진다.
--
-- sheet_id 의 FK 를 CREATE TABLE 안에 두려면 sheet 테이블이 먼저 있어야 하므로,
-- sheet 를 만드는 V4 보다 뒤에 와야 한다. 순서만 맞추면 ALTER 없이 CREATE 한 번으로 끝난다.

CREATE TABLE user_village (
    user_id BIGINT NOT NULL,
    sheet_id BIGINT NOT NULL,
    terrain VARCHAR(20) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user_village PRIMARY KEY (user_id, sheet_id),
    CONSTRAINT fk_user_village_user FOREIGN KEY (user_id)
        REFERENCES users (id) ON DELETE CASCADE,
    -- 시트를 지우면 그 시트의 지형 설정도 함께 사라져야 한다. SheetService.deleteSheet 는
    -- user_village 를 지우지 않으므로, 이 CASCADE 가 없으면 고아 행이 영구히 남는다.
    CONSTRAINT fk_user_village_sheet FOREIGN KEY (sheet_id)
        REFERENCES sheet (id) ON DELETE CASCADE,
    CONSTRAINT ck_user_village_terrain CHECK (terrain IN ('CITY_ROAD', 'DIRT_ROAD', 'GRASS_PATH', 'WATER_WAY'))
);

-- PK 선두 컬럼이 user_id 라 sheet_id 단독 조회는 인덱스를 타지 못한다(V4 의 idx_likes_sheet 와 같은 이유).
-- 위 CASCADE 가 시트를 지울 때마다 sheet_id 로 훑으므로 인덱스가 없으면 매번 전체 스캔이다.
CREATE INDEX idx_user_village_sheet ON user_village (sheet_id);
