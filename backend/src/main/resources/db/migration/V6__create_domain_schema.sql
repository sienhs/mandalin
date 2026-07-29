-- 사용자 (미제공, 참조용 최소 정의)
CREATE TABLE user (
                      id          BIGINT       NOT NULL AUTO_INCREMENT primary key,
                      created_at  DATETIME(6)  NOT NULL CURRENT_TIMESTAMP,
                      updated_at  DATETIME(6)  NULL,
);

-- 도메인 템플릿
CREATE TABLE domain_template (
                                 id     BIGINT       NOT NULL AUTO_INCREMENT primary key,
                                 title  VARCHAR(255) NOT NULL,
);
-- 만다라트 시트
CREATE TABLE sheet (
                       id          BIGINT       NOT NULL AUTO_INCREMENT primary key,
                       user_id     BIGINT       NOT NULL,
                       title       VARCHAR(255) NOT NULL,
                       is_open     BIT(1)       NOT NULL DEFAULT b'0',
                       likeCount      BIGINT       NULL     DEFAULT 0,
                       expired_at  DATETIME(6)  NULL,
                       created_at  DATETIME(6)  NOT NULL CURRENT_TIMESTAMP,
                       updated_at  DATETIME(6)  NULL,
                       CONSTRAINT fk_sheet_user FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE INDEX idx_sheet_user ON sheet (user_id);

-- 도메인 (시트의 8개 대분류)
CREATE TABLE domain (
                        id                  BIGINT       NOT NULL AUTO_INCREMENT primary key,
                        sheet_id            BIGINT       NOT NULL,
                        domain_template_id  BIGINT       NULL,
                        title               VARCHAR(255) NOT NULL,
                        position            INT          NOT NULL,
                        subject_count       INT          NULL,
                        created_at          DATETIME(6)  NOT NULL CURRENT_TIMESTAMP,
                        CONSTRAINT fk_domain_sheet    FOREIGN KEY (sheet_id)           REFERENCES sheet (id),
                        CONSTRAINT fk_domain_template FOREIGN KEY (domain_template_id) REFERENCES domain_template (id)
);

CREATE INDEX idx_domain_sheet ON domain (sheet_id);

-- 세부 목표
CREATE TABLE subject (
                         id            BIGINT       NOT NULL AUTO_INCREMENT primary key,
                         domain_id     BIGINT       NOT NULL,
                         user_id       BIGINT       NOT NULL,
                         title         VARCHAR(255) NOT NULL,
                         period_type        VARCHAR(50)  NOT NULL,
                         point         BIGINT       NOT NULL DEFAULT 0,
                         target_count  INT          NULL,
                         try_count     INT          NULL     DEFAULT 0,
                         position      INT          NOT NULL,
                         is_done       BIT(1)       NOT NULL DEFAULT b'0',
                         created_at    DATETIME(6)  NOT NULL CURRENT_TIMESTAMP,
                         updated_at    DATETIME(6)  NULL,
                         CONSTRAINT fk_subject_domain FOREIGN KEY (domain_id) REFERENCES domain (id),
                         CONSTRAINT fk_subject_user   FOREIGN KEY (user_id)   REFERENCES user (id)
);

CREATE INDEX idx_subject_domain ON subject (domain_id);
CREATE INDEX idx_subject_user   ON subject (user_id);

-- 좋아요 (LikesId 복합키 기준)
CREATE TABLE likes (
                       user_id   BIGINT NOT NULL,
                       sheet_id  BIGINT NOT NULL,
                       created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                       PRIMARY KEY (user_id, sheet_id),
                       CONSTRAINT fk_likes_user  FOREIGN KEY (user_id)  REFERENCES user (id),
                       CONSTRAINT fk_likes_sheet FOREIGN KEY (sheet_id) REFERENCES sheet (id)
);