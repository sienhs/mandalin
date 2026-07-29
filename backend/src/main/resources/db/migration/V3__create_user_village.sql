-- 유저별 마을 설정. 현재는 지형(건물이 놓이는 바닥·길·치장) 하나뿐이라 user_id 를 PK 로 쓴다.
--
-- 지형은 언제든 바꿀 수 있다. 행이 없으면 애플리케이션 기본값(GRASS_PATH)으로 동작하므로
-- 유저가 한 번도 고르지 않아도 마을은 정상적으로 그려진다.

CREATE TABLE user_village (
    user_id BIGINT PRIMARY KEY,
    terrain VARCHAR(20) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_village_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT ck_user_village_terrain CHECK (terrain IN ('CITY_ROAD', 'DIRT_ROAD', 'GRASS_PATH', 'WATER_WAY'))
);
