-- 리프레시 토큰을 기기(세션)당 한 행으로 바꾼다.
--
-- 기존에는 refresh_token.uuid 에 UNIQUE 가 걸려 사용자당 토큰이 하나뿐이었다.
-- PC 에서 로그인하면 모바일 세션이 끊기는 구조였다.
--
-- 진행 중인 세션은 스키마가 바뀌면 어차피 매칭되지 않으므로 전부 지운다.
-- 사용자는 다시 로그인하면 되고, 액세스 토큰(30분)은 만료까지 그대로 동작한다.

DELETE FROM refresh_token;

ALTER TABLE refresh_token DROP CONSTRAINT IF EXISTS refresh_token_uuid_key;

-- 기기 식별자. 로그인할 때마다 서버가 새로 발급하고 리프레시 토큰 클레임에 넣는다.
ALTER TABLE refresh_token ADD COLUMN device_id VARCHAR(64) NOT NULL;

ALTER TABLE refresh_token ADD CONSTRAINT uk_refresh_token_device UNIQUE (device_id);

-- 한 사용자의 세션 전체를 훑는 일이 잦다(로그아웃, 재사용 탐지 시 전체 폐기).
CREATE INDEX idx_refresh_token_uuid ON refresh_token (uuid);

-- findByToken 이 전체 스캔으로 돌고 있었다.
CREATE INDEX idx_refresh_token_token ON refresh_token (token);
