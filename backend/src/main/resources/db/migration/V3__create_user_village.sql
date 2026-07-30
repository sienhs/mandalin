-- 유저별 시트(마을) 지형 설정. 시트 한 장마다 다른 지형을 고를 수 있어 (user_id, sheet_id) 를 PK 로 쓴다.
--
-- 지형은 언제든 바꿀 수 있다. 행이 없으면 애플리케이션 기본값(GRASS_PATH)으로 동작하므로
-- 유저가 한 번도 고르지 않아도 마을은 정상적으로 그려진다.
--
-- sheet_id 의 FK 는 여기서 걸 수 없다 — sheet 테이블은 V6 에서 생성되므로 이 시점에는 없다.
-- V10 에서 붙인다.

CREATE TABLE user_village (
    user_id BIGINT NOT NULL,
    sheet_id BIGINT NOT NULL,
    terrain VARCHAR(20) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user_village PRIMARY KEY (user_id, sheet_id),
    CONSTRAINT fk_user_village_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_user_village_terrain CHECK (terrain IN ('CITY_ROAD', 'DIRT_ROAD', 'GRASS_PATH', 'WATER_WAY'))
);
