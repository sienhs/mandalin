--
-- PostgreSQL database dump
--

\restrict TwlIJn7NJcv51JC4uFukd7T8ddJ1QP7NNYPtx8dVymFCXmPp2lI2x2zLCJvBdry

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.groups DROP CONSTRAINT IF EXISTS groups_user_id3_fkey;
ALTER TABLE IF EXISTS ONLY public.groups DROP CONSTRAINT IF EXISTS groups_user_id2_fkey;
ALTER TABLE IF EXISTS ONLY public.groups DROP CONSTRAINT IF EXISTS groups_user_id1_fkey;
ALTER TABLE IF EXISTS ONLY public.groups DROP CONSTRAINT IF EXISTS groups_inven_id_fkey;
ALTER TABLE IF EXISTS ONLY public.groups DROP CONSTRAINT IF EXISTS groups_group_sheet_id_fkey;
ALTER TABLE IF EXISTS ONLY public.groups DROP CONSTRAINT IF EXISTS groups_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.group_sheet DROP CONSTRAINT IF EXISTS group_sheet_domain_id8_fkey;
ALTER TABLE IF EXISTS ONLY public.group_sheet DROP CONSTRAINT IF EXISTS group_sheet_domain_id7_fkey;
ALTER TABLE IF EXISTS ONLY public.group_sheet DROP CONSTRAINT IF EXISTS group_sheet_domain_id6_fkey;
ALTER TABLE IF EXISTS ONLY public.group_sheet DROP CONSTRAINT IF EXISTS group_sheet_domain_id5_fkey;
ALTER TABLE IF EXISTS ONLY public.group_sheet DROP CONSTRAINT IF EXISTS group_sheet_domain_id4_fkey;
ALTER TABLE IF EXISTS ONLY public.group_sheet DROP CONSTRAINT IF EXISTS group_sheet_domain_id3_fkey;
ALTER TABLE IF EXISTS ONLY public.group_sheet DROP CONSTRAINT IF EXISTS group_sheet_domain_id2_fkey;
ALTER TABLE IF EXISTS ONLY public.group_sheet DROP CONSTRAINT IF EXISTS group_sheet_domain_id1_fkey;
ALTER TABLE IF EXISTS ONLY public.group_request DROP CONSTRAINT IF EXISTS group_request_receiver_id_fkey;
ALTER TABLE IF EXISTS ONLY public.group_request DROP CONSTRAINT IF EXISTS group_request_group_id_fkey;
ALTER TABLE IF EXISTS ONLY public.group_request DROP CONSTRAINT IF EXISTS group_request_creator_id_fkey;
ALTER TABLE IF EXISTS ONLY public.user_village DROP CONSTRAINT IF EXISTS fk_user_village_user;
ALTER TABLE IF EXISTS ONLY public.user_village DROP CONSTRAINT IF EXISTS fk_user_village_sheet;
ALTER TABLE IF EXISTS ONLY public.user_building DROP CONSTRAINT IF EXISTS fk_user_building_user;
ALTER TABLE IF EXISTS ONLY public.user_building DROP CONSTRAINT IF EXISTS fk_user_building_item;
ALTER TABLE IF EXISTS ONLY public.subject DROP CONSTRAINT IF EXISTS fk_subject_user;
ALTER TABLE IF EXISTS ONLY public.subject_log DROP CONSTRAINT IF EXISTS fk_subject_log_user;
ALTER TABLE IF EXISTS ONLY public.subject_log DROP CONSTRAINT IF EXISTS fk_subject_log_subject;
ALTER TABLE IF EXISTS ONLY public.subject DROP CONSTRAINT IF EXISTS fk_subject_domain;
ALTER TABLE IF EXISTS ONLY public.sheet DROP CONSTRAINT IF EXISTS fk_sheet_user;
ALTER TABLE IF EXISTS ONLY public.reward_claim DROP CONSTRAINT IF EXISTS fk_reward_claim_user;
ALTER TABLE IF EXISTS ONLY public.reward_claim_item DROP CONSTRAINT IF EXISTS fk_reward_claim_item_claim;
ALTER TABLE IF EXISTS ONLY public.reward_claim_item DROP CONSTRAINT IF EXISTS fk_reward_claim_item_building;
ALTER TABLE IF EXISTS ONLY public.request DROP CONSTRAINT IF EXISTS fk_request_sender;
ALTER TABLE IF EXISTS ONLY public.request DROP CONSTRAINT IF EXISTS fk_request_receiver;
ALTER TABLE IF EXISTS ONLY public.oauth_identities DROP CONSTRAINT IF EXISTS fk_oauth_identities_user;
ALTER TABLE IF EXISTS ONLY public.likes DROP CONSTRAINT IF EXISTS fk_likes_user;
ALTER TABLE IF EXISTS ONLY public.likes DROP CONSTRAINT IF EXISTS fk_likes_sheet;
ALTER TABLE IF EXISTS ONLY public.item_spot DROP CONSTRAINT IF EXISTS fk_item_spot_sheet;
ALTER TABLE IF EXISTS ONLY public.item_spot DROP CONSTRAINT IF EXISTS fk_item_spot_inven;
ALTER TABLE IF EXISTS ONLY public.friends DROP CONSTRAINT IF EXISTS fk_friends_user2;
ALTER TABLE IF EXISTS ONLY public.friends DROP CONSTRAINT IF EXISTS fk_friends_user1;
ALTER TABLE IF EXISTS ONLY public.domain DROP CONSTRAINT IF EXISTS fk_domain_sheet;
DROP INDEX IF EXISTS public.idx_user_village_sheet;
DROP INDEX IF EXISTS public.idx_user_building_user;
DROP INDEX IF EXISTS public.idx_subject_user;
DROP INDEX IF EXISTS public.idx_subject_log_user;
DROP INDEX IF EXISTS public.idx_subject_log_subject;
DROP INDEX IF EXISTS public.idx_subject_domain;
DROP INDEX IF EXISTS public.idx_sheet_user;
DROP INDEX IF EXISTS public.idx_reward_claim_user;
DROP INDEX IF EXISTS public.idx_reward_claim_item_claim;
DROP INDEX IF EXISTS public.idx_refresh_token_uuid;
DROP INDEX IF EXISTS public.idx_refresh_token_token;
DROP INDEX IF EXISTS public.idx_oauth_identities_user;
DROP INDEX IF EXISTS public.idx_likes_sheet;
DROP INDEX IF EXISTS public.idx_item_spot_inven;
DROP INDEX IF EXISTS public.idx_groups_user3;
DROP INDEX IF EXISTS public.idx_groups_user2;
DROP INDEX IF EXISTS public.idx_groups_user1;
DROP INDEX IF EXISTS public.idx_groups_inven;
DROP INDEX IF EXISTS public.idx_groups_creator;
DROP INDEX IF EXISTS public.idx_group_request_receiver;
DROP INDEX IF EXISTS public.idx_friends_user2;
DROP INDEX IF EXISTS public.idx_friends_user1;
DROP INDEX IF EXISTS public.idx_domain_sheet;
DROP INDEX IF EXISTS public.idx_building_item_type;
DROP INDEX IF EXISTS public.idx_building_item_theme;
DROP INDEX IF EXISTS public.idx_building_item_sort;
DROP INDEX IF EXISTS public.flyway_schema_history_s_idx;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_uuid_key;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.user_building DROP CONSTRAINT IF EXISTS user_building_pkey;
ALTER TABLE IF EXISTS ONLY public.user_building DROP CONSTRAINT IF EXISTS uk_user_building;
ALTER TABLE IF EXISTS ONLY public.reward_claim DROP CONSTRAINT IF EXISTS uk_reward_claim;
ALTER TABLE IF EXISTS ONLY public.request DROP CONSTRAINT IF EXISTS uk_request_pair;
ALTER TABLE IF EXISTS ONLY public.refresh_token DROP CONSTRAINT IF EXISTS uk_refresh_token_device;
ALTER TABLE IF EXISTS ONLY public.oauth_identities DROP CONSTRAINT IF EXISTS uk_oauth_identities_user_provider;
ALTER TABLE IF EXISTS ONLY public.oauth_identities DROP CONSTRAINT IF EXISTS uk_oauth_identities_provider_user;
ALTER TABLE IF EXISTS ONLY public.item_spot DROP CONSTRAINT IF EXISTS uk_item_spot_tile;
ALTER TABLE IF EXISTS ONLY public.group_request DROP CONSTRAINT IF EXISTS uk_group_request;
ALTER TABLE IF EXISTS ONLY public.friends DROP CONSTRAINT IF EXISTS uk_friends_pair;
ALTER TABLE IF EXISTS ONLY public.subject DROP CONSTRAINT IF EXISTS subject_pkey;
ALTER TABLE IF EXISTS ONLY public.subject_log DROP CONSTRAINT IF EXISTS subject_log_pkey;
ALTER TABLE IF EXISTS ONLY public.sheet DROP CONSTRAINT IF EXISTS sheet_pkey;
ALTER TABLE IF EXISTS ONLY public.reward_claim DROP CONSTRAINT IF EXISTS reward_claim_pkey;
ALTER TABLE IF EXISTS ONLY public.reward_claim_item DROP CONSTRAINT IF EXISTS reward_claim_item_pkey;
ALTER TABLE IF EXISTS ONLY public.request DROP CONSTRAINT IF EXISTS request_pkey;
ALTER TABLE IF EXISTS ONLY public.refresh_token DROP CONSTRAINT IF EXISTS refresh_token_pkey;
ALTER TABLE IF EXISTS ONLY public.user_village DROP CONSTRAINT IF EXISTS pk_user_village;
ALTER TABLE IF EXISTS ONLY public.oauth_identities DROP CONSTRAINT IF EXISTS oauth_identities_pkey;
ALTER TABLE IF EXISTS ONLY public.likes DROP CONSTRAINT IF EXISTS likes_pkey;
ALTER TABLE IF EXISTS ONLY public.item_spot DROP CONSTRAINT IF EXISTS item_spot_pkey;
ALTER TABLE IF EXISTS ONLY public.groups DROP CONSTRAINT IF EXISTS groups_pkey;
ALTER TABLE IF EXISTS ONLY public.group_sheet DROP CONSTRAINT IF EXISTS group_sheet_pkey;
ALTER TABLE IF EXISTS ONLY public.group_request DROP CONSTRAINT IF EXISTS group_request_pkey;
ALTER TABLE IF EXISTS ONLY public.friends DROP CONSTRAINT IF EXISTS friends_pkey;
ALTER TABLE IF EXISTS ONLY public.flyway_schema_history DROP CONSTRAINT IF EXISTS flyway_schema_history_pk;
ALTER TABLE IF EXISTS ONLY public.domain DROP CONSTRAINT IF EXISTS domain_pkey;
ALTER TABLE IF EXISTS ONLY public.building_item DROP CONSTRAINT IF EXISTS building_item_pkey;
ALTER TABLE IF EXISTS ONLY public.building_item DROP CONSTRAINT IF EXISTS building_item_item_key_key;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.user_village;
DROP TABLE IF EXISTS public.user_building;
DROP TABLE IF EXISTS public.subject_log;
DROP TABLE IF EXISTS public.subject;
DROP TABLE IF EXISTS public.sheet;
DROP TABLE IF EXISTS public.reward_claim_item;
DROP TABLE IF EXISTS public.reward_claim;
DROP TABLE IF EXISTS public.request;
DROP TABLE IF EXISTS public.refresh_token;
DROP TABLE IF EXISTS public.oauth_identities;
DROP TABLE IF EXISTS public.likes;
DROP TABLE IF EXISTS public.item_spot;
DROP TABLE IF EXISTS public.groups;
DROP TABLE IF EXISTS public.group_sheet;
DROP TABLE IF EXISTS public.group_request;
DROP TABLE IF EXISTS public.friends;
DROP TABLE IF EXISTS public.flyway_schema_history;
DROP TABLE IF EXISTS public.domain;
DROP TABLE IF EXISTS public.building_item;
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: building_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.building_item (
    id bigint NOT NULL,
    item_key character varying(80) NOT NULL,
    name character varying(120) NOT NULL,
    theme character varying(30) NOT NULL,
    type character varying(20) NOT NULL,
    price integer DEFAULT 0 NOT NULL,
    default_granted boolean DEFAULT false NOT NULL,
    size_width numeric(6,3) NOT NULL,
    size_depth numeric(6,3) NOT NULL,
    size_height numeric(6,3) NOT NULL,
    parts jsonb NOT NULL,
    thumbnail_url text,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_building_item_price CHECK ((price >= 0)),
    CONSTRAINT ck_building_item_type CHECK (((type)::text = ANY ((ARRAY['NORMAL'::character varying, 'LANDMARK'::character varying])::text[])))
);


--
-- Name: building_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.building_item ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.building_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: domain; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.domain (
    id bigint NOT NULL,
    sheet_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    "position" integer NOT NULL,
    subject_count integer,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: domain_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.domain ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.domain_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


--
-- Name: friends; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.friends (
    id bigint NOT NULL,
    user_id1 bigint NOT NULL,
    user_id2 bigint NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: friends_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.friends ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.friends_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: group_request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_request (
    id bigint NOT NULL,
    group_id bigint NOT NULL,
    creator_id bigint NOT NULL,
    receiver_id bigint NOT NULL,
    progress character varying(20) DEFAULT 'NOT_READ'::character varying NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_group_request_progress CHECK (((progress)::text = ANY ((ARRAY['NOT_READ'::character varying, 'READ'::character varying, 'ACCEPTED'::character varying, 'REJECTED'::character varying])::text[])))
);


--
-- Name: group_request_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.group_request ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.group_request_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: group_sheet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.group_sheet (
    id bigint NOT NULL,
    domain_id1 bigint,
    domain_id2 bigint,
    domain_id3 bigint,
    domain_id4 bigint,
    domain_id5 bigint,
    domain_id6 bigint,
    domain_id7 bigint,
    domain_id8 bigint,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: group_sheet_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.group_sheet ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.group_sheet_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: groups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.groups (
    id bigint NOT NULL,
    title character varying(255) NOT NULL,
    creator_id bigint NOT NULL,
    group_sheet_id bigint,
    user_id1 bigint,
    user_id2 bigint,
    user_id3 bigint,
    inven_id bigint,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: groups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: item_spot; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.item_spot (
    id bigint NOT NULL,
    sheet_id bigint NOT NULL,
    inven_id bigint,
    domain_position integer NOT NULL,
    item_position integer NOT NULL,
    dir character varying(10) DEFAULT 'DEG_0'::character varying NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_item_spot_dir CHECK (((dir)::text = ANY ((ARRAY['DEG_0'::character varying, 'DEG_90'::character varying, 'DEG_180'::character varying, 'DEG_270'::character varying])::text[]))),
    CONSTRAINT ck_item_spot_domain_position CHECK (((domain_position >= 1) AND (domain_position <= 9))),
    CONSTRAINT ck_item_spot_item_position CHECK (((item_position >= 1) AND (item_position <= 9)))
);


--
-- Name: item_spot_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.item_spot ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.item_spot_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.likes (
    user_id bigint NOT NULL,
    sheet_id bigint NOT NULL,
    created_at timestamp(6) without time zone
);


--
-- Name: oauth_identities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.oauth_identities (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    provider character varying(20) NOT NULL,
    provider_user_id character varying(255) NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL,
    CONSTRAINT ck_oauth_identities_provider CHECK (((provider)::text = 'KAKAO'::text))
);


--
-- Name: oauth_identities_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.oauth_identities ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.oauth_identities_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: refresh_token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_token (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    device_id character varying(64) NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp(6) without time zone NOT NULL,
    created_at timestamp(6) without time zone NOT NULL,
    updated_at timestamp(6) without time zone NOT NULL
);


--
-- Name: refresh_token_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.refresh_token ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.refresh_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: request; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.request (
    id bigint NOT NULL,
    sender_id bigint NOT NULL,
    receiver_id bigint NOT NULL,
    progress character varying(20) DEFAULT 'NOT_READ'::character varying NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_request_progress CHECK (((progress)::text = ANY ((ARRAY['ACCEPTED'::character varying, 'REJECTED'::character varying, 'READ'::character varying, 'NOT_READ'::character varying])::text[])))
);


--
-- Name: request_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.request ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.request_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reward_claim; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reward_claim (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    milestone smallint NOT NULL,
    kind character varying(16) NOT NULL,
    granted_point integer,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_reward_claim_kind CHECK (((kind)::text = ANY ((ARRAY['CREDIT'::character varying, 'LANDMARK'::character varying])::text[]))),
    CONSTRAINT ck_reward_claim_milestone CHECK (((milestone >= 1) AND (milestone <= 8)))
);


--
-- Name: reward_claim_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.reward_claim ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.reward_claim_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: reward_claim_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reward_claim_item (
    id bigint NOT NULL,
    reward_claim_id bigint NOT NULL,
    building_item_id bigint NOT NULL
);


--
-- Name: reward_claim_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.reward_claim_item ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.reward_claim_item_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: sheet; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sheet (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    is_open boolean DEFAULT false NOT NULL,
    like_count bigint DEFAULT 0,
    expired_at timestamp(6) without time zone,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_sheet_like_count CHECK ((like_count >= 0))
);


--
-- Name: sheet_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.sheet ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.sheet_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: subject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subject (
    id bigint NOT NULL,
    domain_id bigint NOT NULL,
    user_id bigint NOT NULL,
    title character varying(255) NOT NULL,
    period_type character varying(20) NOT NULL,
    point bigint DEFAULT 0 NOT NULL,
    target_count integer,
    try_count integer DEFAULT 0,
    "position" integer NOT NULL,
    is_done boolean DEFAULT false NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT (CURRENT_TIMESTAMP - '1 day'::interval) NOT NULL,
    count_per_period integer DEFAULT 1 NOT NULL,
    CONSTRAINT ck_subject_count_per_period CHECK ((count_per_period >= 1)),
    CONSTRAINT ck_subject_period_type CHECK (((period_type)::text = ANY ((ARRAY['DAILY'::character varying, 'WEEKLY'::character varying, 'MONTHLY'::character varying, 'NONE'::character varying])::text[])))
);


--
-- Name: subject_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.subject ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.subject_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: subject_log; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subject_log (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    subject_id bigint NOT NULL,
    earned_point bigint DEFAULT 0 NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: subject_log_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.subject_log ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.subject_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_building; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_building (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    building_item_id bigint NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: user_building_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.user_building ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.user_building_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_village; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_village (
    user_id bigint NOT NULL,
    sheet_id bigint NOT NULL,
    terrain character varying(20) NOT NULL,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT ck_user_village_terrain CHECK (((terrain)::text = ANY ((ARRAY['CITY_ROAD'::character varying, 'DIRT_ROAD'::character varying, 'GRASS_PATH'::character varying, 'WATER_WAY'::character varying])::text[])))
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    name character varying(255) NOT NULL,
    uuid character varying(255) NOT NULL,
    point integer DEFAULT 0 NOT NULL,
    profile_image text,
    created_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    deleted_at timestamp(6) without time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.users ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Data for Name: building_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.building_item (id, item_key, name, theme, type, price, default_granted, size_width, size_depth, size_height, parts, thumbnail_url, sort_order, created_at, updated_at) FROM stdin;
1	cottage_cream	타운하우스 (크림)	BASIC	NORMAL	0	t	0.464	0.464	1.110	[{"d": 0.34, "k": "plinth", "w": 0.4, "color": "path"}, {"d": 0.34, "h": 0.72, "k": "box", "w": 0.4, "y": 0.07, "color": "wallCream", "rough": 0.85, "windows": {"to": 0.9, "from": 0.12, "glow": 0.28, "color": "glassWarm"}}, {"h": 0.23, "k": "panel", "w": 0.064, "pos": [-0.072, 0.1852, 0.17600000000000002], "color": "wood"}, {"d": 0.34, "k": "roof", "w": 0.4, "y": 0.79, "type": "pyramid", "color": "roof", "height": 0.26}, {"d": 0.07, "h": 0.22, "k": "box", "w": 0.07, "x": 0.112, "y": 0.89, "z": -0.068, "color": "wallTerracotta", "detail": true}]	\N	0	2026-08-03 01:12:42.029463	2026-08-03 01:12:42.029463
2	cottage_terracotta	타운하우스 (테라코타)	BASIC	NORMAL	0	t	0.464	0.464	1.110	[{"d": 0.34, "k": "plinth", "w": 0.4, "color": "path"}, {"d": 0.34, "h": 0.72, "k": "box", "w": 0.4, "y": 0.07, "color": "wallTerracotta", "rough": 0.85, "windows": {"to": 0.9, "from": 0.12, "glow": 0.28, "color": "glassWarm"}}, {"h": 0.23, "k": "panel", "w": 0.064, "pos": [-0.072, 0.1852, 0.17600000000000002], "color": "wood"}, {"d": 0.34, "k": "roof", "w": 0.4, "y": 0.79, "type": "pyramid", "color": "roof", "height": 0.26}, {"d": 0.07, "h": 0.22, "k": "box", "w": 0.07, "x": 0.112, "y": 0.89, "z": -0.068, "color": "wallTerracotta", "detail": true}]	\N	1	2026-08-03 01:12:42.076362	2026-08-03 01:12:42.076362
3	cottage_blue	타운하우스 (블루)	BASIC	NORMAL	0	t	0.464	0.464	1.110	[{"d": 0.34, "k": "plinth", "w": 0.4, "color": "path"}, {"d": 0.34, "h": 0.72, "k": "box", "w": 0.4, "y": 0.07, "color": "wallBlue", "rough": 0.85, "windows": {"to": 0.9, "from": 0.12, "glow": 0.28, "color": "glassWarm"}}, {"h": 0.23, "k": "panel", "w": 0.064, "pos": [-0.072, 0.1852, 0.17600000000000002], "color": "wood"}, {"d": 0.34, "k": "roof", "w": 0.4, "y": 0.79, "type": "pyramid", "color": "roof", "height": 0.26}, {"d": 0.07, "h": 0.22, "k": "box", "w": 0.07, "x": 0.112, "y": 0.89, "z": -0.068, "color": "wallTerracotta", "detail": true}]	\N	2	2026-08-03 01:12:42.078577	2026-08-03 01:12:42.078577
4	clocktower	시계탑	BASIC	NORMAL	0	t	0.302	0.302	1.680	[{"k": "plinth", "w": 0.26, "color": "concrete"}, {"h": 1.15, "k": "box", "w": 0.26, "y": 0.07, "color": "wallBlue", "rough": 0.8, "windows": {"to": 0.6, "from": 0.15, "glow": 0.3, "color": "glassWarm"}}, {"k": "clock", "w": 0.26, "y": 1.013, "color": "wallCream"}, {"k": "roof", "w": 0.26, "y": 1.22, "type": "pyramid", "color": "roofDark", "height": 0.3}, {"d": 0.02, "h": 0.16, "k": "box", "w": 0.02, "y": 1.52, "color": "accent", "detail": true, "emissive": true}]	\N	3	2026-08-03 01:12:42.079935	2026-08-03 01:12:42.079935
5	windmill	풍차	BASIC	NORMAL	0	t	1.060	0.436	1.474	[{"k": "plinth", "w": 0.3, "color": "path"}, {"h": 0.95, "k": "cyl", "y": 0.07, "rb": 0.216, "rt": 0.165, "color": "wallCream"}, {"h": 0.03, "k": "cyl", "y": 0.659, "rb": 0.198, "rt": 0.198, "color": "wood", "detail": true}, {"h": 0.08, "k": "panel", "w": 0.06, "pos": [0, 0.5925, 0.168], "glow": 0.3, "color": "glassWarm"}, {"k": "roof", "w": 0.3, "y": 1.02, "type": "cone", "color": "roofDark", "height": 0.2}, {"k": "blades", "y": 0.944}]	\N	4	2026-08-03 01:12:42.081292	2026-08-03 01:12:42.081292
6	tree	나무	BASIC	NORMAL	0	t	1.440	1.440	2.260	[{"k": "tree"}]	\N	5	2026-08-03 01:12:42.083101	2026-08-03 01:12:42.083101
7	hospital	병원	BASIC	NORMAL	0	t	0.576	0.524	1.645	[{"d": 0.34, "k": "plinth", "w": 0.4, "color": "concrete"}, {"d": 0.34, "h": 1.35, "k": "box", "w": 0.4, "y": 0.07, "color": "hospitalWhite", "metal": 0.1, "rough": 0.5, "windows": {"to": 0.9, "from": 0.12, "glow": 0.22, "color": "glass"}}, {"d": 0.306, "h": 0.44, "k": "box", "w": 0.2, "x": 0.248, "y": 0.07, "color": "hospitalWhite", "rough": 0.5}, {"d": 0.16, "h": 0.03, "k": "box", "w": 0.2, "y": 0.23, "z": 0.25, "color": "beaconRed", "detail": true}, {"k": "cross", "s": 0.6, "y": 1.015, "z": 0.176, "color": "beaconRed"}, {"d": 0.34, "k": "parapet", "w": 0.4, "y": 1.4200000000000002, "color": "hospitalWhite"}, {"k": "rooftopUnits", "w": 0.4, "y": 1.4200000000000002}, {"k": "cross", "y": 1.56, "color": "beaconRed"}]	\N	6	2026-08-03 01:12:42.084536	2026-08-03 01:12:42.084536
8	office	오피스 타워	BASIC	NORMAL	0	t	0.388	0.388	2.395	[{"k": "plinth", "w": 0.34, "color": "roofDark"}, {"h": 1.558, "k": "box", "w": 0.34, "y": 0.07, "color": "officeBody", "metal": 0.55, "rough": 0.25, "windows": {"to": 0.9, "from": 0.12, "glow": 0.4, "color": "glass"}}, {"h": 0.342, "k": "box", "w": 0.2448, "y": 1.6280000000000001, "color": "concrete", "metal": 0.55, "rough": 0.25, "windows": {"to": 0.9, "from": 0.12, "glow": 0.4, "color": "glass"}}, {"k": "parapet", "w": 0.2448, "y": 1.97, "color": "roofDark"}, {"k": "rooftopUnits", "w": 0.2448, "y": 1.97}, {"h": 0.4, "k": "antenna", "y": 1.97}]	\N	7	2026-08-03 01:12:42.08583	2026-08-03 01:12:42.08583
9	apartment	아파트	BASIC	NORMAL	0	t	0.456	0.402	1.760	[{"d": 0.32, "k": "plinth", "w": 0.4, "color": "concrete"}, {"d": 0.32, "h": 1.55, "k": "box", "w": 0.4, "y": 0.07, "color": "wallCream", "metal": 0.05, "rough": 0.7, "windows": {"to": 0.9, "from": 0.12, "glow": 0.26, "color": "glassWarm"}}, {"d": 0.32, "k": "balconies", "w": 0.4, "y0": 0.31800000000000006, "y1": 1.4340000000000002, "color": "concrete", "floors": 7}, {"d": 0.32, "k": "parapet", "w": 0.4, "y": 1.62, "color": "wallCream"}, {"k": "rooftopUnits", "w": 0.4, "y": 1.62}]	\N	8	2026-08-03 01:12:42.08734	2026-08-03 01:12:42.08734
10	cornerstore	편의점	BASIC	NORMAL	0	t	0.456	0.524	0.920	[{"k": "plinth", "w": 0.4, "color": "concrete"}, {"h": 0.78, "k": "box", "w": 0.4, "y": 0.07, "color": "wallCream", "rough": 0.6, "windows": {"to": 0.9, "from": 0.55, "glow": 0.28, "color": "glassWarm"}}, {"k": "storefront", "w": 0.4, "sign": "wallBlue", "faceH": 0.39, "awning": "accent"}, {"k": "parapet", "w": 0.4, "y": 0.8500000000000001, "color": "wallCream"}]	\N	9	2026-08-03 01:12:42.088618	2026-08-03 01:12:42.088618
11	cafe	카페	BASIC	NORMAL	0	t	0.429	0.445	1.010	[{"k": "plinth", "w": 0.34, "color": "path"}, {"h": 0.62, "k": "box", "w": 0.34, "y": 0.07, "color": "wallTerracotta", "rough": 0.75, "windows": {"to": 0.9, "from": 0.58, "glow": 0.28, "color": "glassWarm"}}, {"k": "storefront", "w": 0.34, "sign": "wallCream", "faceH": 0.322, "awning": "bush"}, {"k": "parapet", "w": 0.34, "y": 0.69, "color": "wallTerracotta"}, {"k": "parasol", "pos": [0.095, 0.69, 0.095], "color": "accent"}]	\N	10	2026-08-03 01:12:42.089909	2026-08-03 01:12:42.089909
12	mart	마트	BASIC	NORMAL	0	t	0.524	0.538	1.030	[{"d": 0.4, "k": "plinth", "w": 0.46, "color": "concrete"}, {"d": 0.4, "h": 0.82, "k": "box", "w": 0.46, "y": 0.07, "color": "concrete", "rough": 0.6, "windows": {"to": 0.9, "from": 0.6, "glow": 0.3, "color": "glass"}}, {"d": 0.4, "k": "storefront", "w": 0.46, "sign": "accent", "faceH": 0.426, "awning": "accent"}, {"d": 0.4, "k": "parapet", "w": 0.46, "y": 0.8899999999999999, "color": "concrete"}, {"k": "rooftopUnits", "w": 0.46, "y": 0.8899999999999999}]	\N	11	2026-08-03 01:12:42.091352	2026-08-03 01:12:42.091352
13	pharmacy	약국	BASIC	NORMAL	0	t	0.365	0.476	1.140	[{"k": "plinth", "w": 0.32, "color": "concrete"}, {"h": 1, "k": "box", "w": 0.32, "y": 0.07, "color": "wallCream", "rough": 0.7, "windows": {"to": 0.9, "from": 0.12, "glow": 0.26, "color": "glassWarm"}}, {"h": 0.28, "k": "panel", "w": 0.256, "pos": [0, 0.25, 0.166], "glow": 0.28, "color": "glass"}, {"k": "parapet", "w": 0.32, "y": 1.07, "color": "wallCream"}, {"k": "cross", "s": 0.6, "y": 0.8899999999999999, "z": 0.166, "color": "bush"}]	\N	12	2026-08-03 01:12:42.092565	2026-08-03 01:12:42.092565
14	civic	관공서 (돔)	BASIC	NORMAL	0	t	0.456	0.424	1.384	[{"d": 0.34, "k": "plinth", "w": 0.4, "color": "concrete"}, {"d": 0.34, "h": 1.05, "k": "box", "w": 0.4, "y": 0.07, "color": "wallCream", "rough": 0.7, "windows": {"to": 0.9, "from": 0.12, "glow": 0.24, "color": "glassWarm"}}, {"d": 0.34, "h": 0.462, "k": "columns", "w": 0.4, "y": 0.07, "color": "stoneLight", "count": 4}, {"h": 0.12, "k": "cyl", "y": 1.12, "rb": 0.136, "rt": 0.136, "color": "wallCream"}, {"k": "roof", "w": 0.4, "y": 1.2400000000000002, "type": "dome", "color": "glassWarm"}]	\N	13	2026-08-03 01:12:42.093731	2026-08-03 01:12:42.093731
15	skyscraper	마천루	BASIC	NORMAL	0	t	0.752	0.752	3.515	[{"k": "plinth", "w": 0.66, "color": "roofDark"}, {"h": 0.95, "k": "box", "w": 0.66, "y": 0.07, "color": "skyBody", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.95, "from": 0.1, "glow": 0.42, "color": "glass"}}, {"h": 0.04, "k": "box", "w": 0.693, "y": 1.02, "color": "wallCream"}, {"h": 0.85, "k": "box", "w": 0.52, "y": 1.02, "color": "skyBody", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.95, "from": 0.1, "glow": 0.42, "color": "glass"}}, {"h": 0.04, "k": "box", "w": 0.546, "y": 1.87, "color": "wallCream"}, {"h": 0.7, "k": "box", "w": 0.4, "y": 1.87, "color": "skyBody", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.95, "from": 0.1, "glow": 0.42, "color": "glass"}}, {"h": 0.04, "k": "box", "w": 0.42, "y": 2.57, "color": "wallCream"}, {"h": 0.42, "k": "box", "w": 0.28, "y": 2.57, "color": "roofDark", "metal": 0.5, "rough": 0.4}, {"h": 0.5, "k": "antenna", "y": 2.9899999999999998}]	\N	14	2026-08-03 01:12:42.094926	2026-08-03 01:12:42.094926
16	sakura_pagoda_tower	사쿠라 오층탑	SAKURA	NORMAL	300	f	0.730	0.811	2.720	[{"d": 0.64, "k": "plinth", "w": 0.64, "color": "#D8CFC2"}, {"d": 0.58, "h": 0.16, "k": "box", "w": 0.58, "y": 0.07, "color": "#CFC4B4", "rough": 0.9}, {"d": 0.5, "h": 0.06, "k": "box", "w": 0.5, "y": 0.23, "color": "#6E5570"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.3, "y": 0.07, "z": 0.41, "color": "#D8CFC2"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.26, "y": 0.098, "z": 0.37, "color": "#D8CFC2"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.21999999999999997, "y": 0.126, "z": 0.32999999999999996, "color": "#D8CFC2"}, {"d": 0.5, "h": 0.34, "k": "box", "w": 0.5, "y": 0.29000000000000004, "color": "#F7E6EC", "rough": 0.8, "windows": {"to": 0.82, "from": 0.25, "glow": 0.28, "color": "#BFE3EA"}}, {"d": 0.02, "h": 0.34, "k": "box", "w": 0.02, "x": -0.215, "y": 0.29000000000000004, "z": 0.254, "color": "#5A3A2E"}, {"d": 0.02, "h": 0.34, "k": "box", "w": 0.02, "x": -0.1075, "y": 0.29000000000000004, "z": 0.254, "color": "#5A3A2E"}, {"d": 0.02, "h": 0.34, "k": "box", "w": 0.02, "x": 0, "y": 0.29000000000000004, "z": 0.254, "color": "#5A3A2E"}, {"d": 0.02, "h": 0.34, "k": "box", "w": 0.02, "x": 0.1075, "y": 0.29000000000000004, "z": 0.254, "color": "#5A3A2E"}, {"d": 0.02, "h": 0.34, "k": "box", "w": 0.02, "x": 0.215, "y": 0.29000000000000004, "z": 0.254, "color": "#5A3A2E"}, {"d": 0.56, "h": 0.03, "k": "box", "w": 0.56, "y": 0.5700000000000001, "color": "#B83227"}, {"k": "roof", "w": 0.6, "y": 0.6000000000000001, "type": "pyramid", "color": "#8A6D8B", "height": 0.14}, {"d": 0.42, "h": 0.3, "k": "box", "w": 0.42, "y": 0.75, "color": "#F7E6EC", "rough": 0.8, "windows": {"to": 0.82, "from": 0.25, "glow": 0.28, "color": "#BFE3EA"}}, {"d": 0.02, "h": 0.3, "k": "box", "w": 0.02, "x": -0.18059999999999998, "y": 0.75, "z": 0.214, "color": "#5A3A2E"}, {"d": 0.02, "h": 0.3, "k": "box", "w": 0.02, "x": -0.060200000000000004, "y": 0.75, "z": 0.214, "color": "#5A3A2E"}, {"d": 0.02, "h": 0.3, "k": "box", "w": 0.02, "x": 0.06019999999999998, "y": 0.75, "z": 0.214, "color": "#5A3A2E"}, {"d": 0.02, "h": 0.3, "k": "box", "w": 0.02, "x": 0.18059999999999998, "y": 0.75, "z": 0.214, "color": "#5A3A2E"}, {"k": "roof", "w": 0.52, "y": 1.05, "type": "pyramid", "color": "#8A6D8B", "height": 0.13}, {"d": 0.34, "h": 0.28, "k": "box", "w": 0.34, "y": 1.1800000000000002, "color": "#F7E6EC", "rough": 0.8, "windows": {"to": 0.82, "from": 0.25, "glow": 0.28, "color": "#BFE3EA"}}, {"k": "roof", "w": 0.44, "y": 1.46, "type": "pyramid", "color": "#8A6D8B", "height": 0.12}, {"d": 0.26, "h": 0.26, "k": "box", "w": 0.26, "y": 1.58, "color": "#F7E6EC", "rough": 0.8, "windows": {"to": 0.82, "from": 0.25, "glow": 0.28, "color": "#BFE3EA"}}, {"k": "roof", "w": 0.36, "y": 1.84, "type": "pyramid", "color": "#8A6D8B", "height": 0.11}, {"d": 0.18, "h": 0.22, "k": "box", "w": 0.18, "y": 1.95, "color": "#F7E6EC", "rough": 0.8}, {"k": "roof", "w": 0.28, "y": 2.17, "type": "pyramid", "color": "#8A6D8B", "height": 0.13}, {"d": 0.06, "h": 0.06, "k": "box", "w": 0.06, "y": 2.3, "color": "#C9A24B", "detail": true}, {"h": 0.26, "k": "cyl", "y": 2.36, "rb": 0.02, "rt": 0.02, "seg": 8, "color": "#C9A24B", "detail": true}, {"d": 0.02, "h": 0.02, "k": "box", "w": 0.14, "y": 2.4699999999999998, "color": "#C9A24B", "detail": true, "emissive": true}, {"d": 0.02, "h": 0.1, "k": "box", "w": 0.02, "y": 2.6199999999999997, "color": "#C9A24B", "detail": true, "emissive": true}, {"h": 0.24, "k": "panel", "w": 0.16, "pos": [0, 0.41000000000000003, 0.256], "color": "#5A3A2E"}, {"h": 0.07, "k": "panel", "w": 0.28, "pos": [0, 0.6699999999999999, 0.306], "glow": 0.25, "color": "#B83227"}]	\N	15	2026-08-03 01:12:42.096195	2026-08-03 01:12:42.096195
17	sakura_castle_keep	사쿠라 천수각	SAKURA	NORMAL	300	f	0.798	0.916	2.600	[{"d": 0.7, "k": "plinth", "w": 0.7, "color": "#D8CFC2"}, {"d": 0.64, "h": 0.28, "k": "box", "w": 0.64, "y": 0.07, "color": "#CFC4B4", "rough": 0.95}, {"d": 0.56, "h": 0.16, "k": "box", "w": 0.56, "y": 0.35000000000000003, "color": "#D8CFC2", "rough": 0.92}, {"d": 0.5, "h": 0.08, "k": "box", "w": 0.5, "y": 0.51, "color": "#CFC4B4", "rough": 0.9}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.26, "y": 0.07, "z": 0.49, "color": "#D8CFC2"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.22, "y": 0.098, "z": 0.45, "color": "#D8CFC2"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.18, "y": 0.126, "z": 0.41000000000000003, "color": "#D8CFC2"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.14, "y": 0.15400000000000003, "z": 0.37, "color": "#D8CFC2"}, {"d": 0.46, "h": 0.4, "k": "box", "w": 0.46, "y": 0.5900000000000001, "color": "#F7E6EC", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.22, "color": "#BFE3EA"}}, {"d": 0.03, "h": 0.4, "k": "box", "w": 0.03, "x": -0.23, "y": 0.5900000000000001, "z": -0.23, "color": "#5A3A2E"}, {"d": 0.03, "h": 0.4, "k": "box", "w": 0.03, "x": 0.23, "y": 0.5900000000000001, "z": -0.23, "color": "#5A3A2E"}, {"d": 0.03, "h": 0.4, "k": "box", "w": 0.03, "x": -0.23, "y": 0.5900000000000001, "z": 0.23, "color": "#5A3A2E"}, {"d": 0.03, "h": 0.4, "k": "box", "w": 0.03, "x": 0.23, "y": 0.5900000000000001, "z": 0.23, "color": "#5A3A2E"}, {"k": "roof", "w": 0.58, "y": 0.99, "type": "pyramid", "color": "#6E5570", "height": 0.16}, {"d": 0.03, "h": 0.1, "k": "box", "w": 0.14, "y": 1.03, "z": 0.24, "color": "#FBD7E0"}, {"d": 0.38, "h": 0.34, "k": "box", "w": 0.38, "y": 1.1500000000000001, "color": "#F7E6EC", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.22, "color": "#BFE3EA"}}, {"k": "roof", "w": 0.5, "y": 1.49, "type": "pyramid", "color": "#6E5570", "height": 0.15}, {"d": 0.3, "h": 0.3, "k": "box", "w": 0.3, "y": 1.6400000000000001, "color": "#F7E6EC", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.22, "color": "#BFE3EA"}}, {"k": "roof", "w": 0.42, "y": 1.9400000000000002, "type": "pyramid", "color": "#6E5570", "height": 0.14}, {"d": 0.22, "h": 0.24, "k": "box", "w": 0.22, "y": 2.0799999999999996, "color": "#F7E6EC", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#C9A24B"}}, {"d": 0.28, "h": 0.03, "k": "box", "w": 0.28, "y": 2.32, "color": "#C9A24B"}, {"k": "roof", "w": 0.34, "y": 2.3499999999999996, "type": "pyramid", "color": "#6E5570", "height": 0.16}, {"d": 0.02, "h": 0.09, "k": "box", "w": 0.05, "x": -0.09, "y": 2.51, "color": "#C9A24B", "detail": true, "emissive": true}, {"d": 0.02, "h": 0.09, "k": "box", "w": 0.05, "x": 0.09, "y": 2.51, "color": "#C9A24B", "detail": true, "emissive": true}, {"h": 0.28, "k": "panel", "w": 0.22, "pos": [0, 0.73, 0.246], "color": "#5A3A2E"}, {"h": 0.06, "k": "panel", "w": 0.32, "pos": [0, 0.9299999999999999, 0.248], "glow": 0.28, "color": "#C9A24B"}]	\N	16	2026-08-03 01:12:42.098037	2026-08-03 01:12:42.098037
18	sakura_office	사쿠라 오피스	SAKURA	NORMAL	300	f	0.479	0.546	2.545	[{"d": 0.4, "k": "plinth", "w": 0.42, "color": "roofDark"}, {"d": 0.4, "h": 0.16, "k": "box", "w": 0.42, "y": 0.07, "color": "#CFC4B4", "rough": 0.8}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.24, "y": 0.07, "z": 0.29, "color": "#D8CFC2"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.19999999999999998, "y": 0.098, "z": 0.25, "color": "#D8CFC2"}, {"d": 0.38, "h": 1.5, "k": "box", "w": 0.42, "y": 0.23, "color": "#D6E9EE", "metal": 0.5, "rough": 0.3, "windows": {"to": 0.95, "from": 0.06, "glow": 0.36, "color": "#BFE3EA"}}, {"d": 0.02, "h": 1.5, "k": "box", "w": 0.02, "x": -0.18059999999999998, "y": 0.23, "z": 0.194, "color": "#B7D2DA"}, {"d": 0.02, "h": 1.5, "k": "box", "w": 0.02, "x": -0.10835999999999998, "y": 0.23, "z": 0.194, "color": "#B7D2DA"}, {"d": 0.02, "h": 1.5, "k": "box", "w": 0.02, "x": -0.036119999999999985, "y": 0.23, "z": 0.194, "color": "#B7D2DA"}, {"d": 0.02, "h": 1.5, "k": "box", "w": 0.02, "x": 0.036119999999999985, "y": 0.23, "z": 0.194, "color": "#B7D2DA"}, {"d": 0.02, "h": 1.5, "k": "box", "w": 0.02, "x": 0.10836000000000001, "y": 0.23, "z": 0.194, "color": "#B7D2DA"}, {"d": 0.02, "h": 1.5, "k": "box", "w": 0.02, "x": 0.18059999999999998, "y": 0.23, "z": 0.194, "color": "#B7D2DA"}, {"d": 0.394, "h": 0.028, "k": "box", "w": 0.434, "y": 0.73, "color": "#F6A8C4"}, {"d": 0.394, "h": 0.028, "k": "box", "w": 0.434, "y": 1.23, "color": "#F6A8C4"}, {"d": 0.4, "h": 0.05, "k": "box", "w": 0.44, "y": 1.73, "color": "#C9A24B"}, {"d": 0.3, "h": 0.34, "k": "box", "w": 0.3, "y": 1.78, "color": "#D6E9EE", "metal": 0.5, "rough": 0.3, "windows": {"to": 0.9, "from": 0.1, "glow": 0.36, "color": "#BFE3EA"}}, {"k": "roof", "w": 0.38, "y": 2.1199999999999997, "type": "pyramid", "color": "#8A6D8B", "height": 0.18}, {"d": 0.02, "h": 0.14, "k": "box", "w": 0.02, "y": 2.3, "color": "#C9A24B", "detail": true, "emissive": true}, {"h": 0.4, "k": "antenna", "y": 2.1199999999999997}, {"d": 0.42, "h": 0.06, "k": "box", "w": 0.44, "y": 0.23, "color": "#C9A24B"}, {"h": 0.3, "k": "panel", "w": 0.22, "pos": [0, 0.37, 0.20600000000000002], "glow": 0.32, "color": "#BFE3EA"}, {"h": 0.6, "k": "panel", "w": 0.05, "pos": [-0.16, 0.77, 0.20600000000000002], "glow": 0.3, "color": "#F6A8C4"}, {"h": 0.6, "k": "panel", "w": 0.05, "pos": [0.16, 0.77, 0.20600000000000002], "glow": 0.3, "color": "#F6A8C4"}]	\N	17	2026-08-03 01:12:42.099453	2026-08-03 01:12:42.099453
19	sakura_hotel	사쿠라 호텔	SAKURA	NORMAL	300	f	0.707	0.679	2.450	[{"d": 0.44, "k": "plinth", "w": 0.62, "color": "concrete"}, {"d": 0.44, "h": 0.5, "k": "box", "w": 0.62, "y": 0.07, "color": "#FBD7E0", "rough": 0.6, "windows": {"to": 0.85, "from": 0.5, "glow": 0.3, "color": "#BFE3EA"}}, {"d": 0.44, "h": 0.44, "k": "columns", "w": 0.62, "y": 0.07, "color": "#5A3A2E", "count": 6}, {"d": 0.07, "h": 0.05, "k": "box", "w": 0.5828, "y": 0.54, "z": 0.25, "color": "#C9A24B"}, {"d": 0.42, "h": 1.2, "k": "box", "w": 0.22, "x": -0.19, "y": 0.5700000000000001, "color": "#F7E6EC", "rough": 0.65, "windows": {"to": 0.95, "from": 0.05, "glow": 0.28, "color": "#BFE3EA"}}, {"d": 0.42, "h": 1.2, "k": "box", "w": 0.22, "x": 0.19, "y": 0.5700000000000001, "color": "#F7E6EC", "rough": 0.65, "windows": {"to": 0.95, "from": 0.05, "glow": 0.28, "color": "#BFE3EA"}}, {"d": 0.4, "h": 1.5, "k": "box", "w": 0.24, "y": 0.5700000000000001, "color": "#FBD7E0", "rough": 0.65, "windows": {"to": 0.95, "from": 0.05, "glow": 0.28, "color": "#BFE3EA"}}, {"d": 0.454, "h": 0.028, "k": "box", "w": 0.634, "y": 0.97, "color": "#F6A8C4"}, {"d": 0.454, "h": 0.028, "k": "box", "w": 0.634, "y": 1.37, "color": "#F6A8C4"}, {"d": 0.42, "h": 0.03, "k": "box", "w": 0.22, "x": -0.19, "y": 1.77, "color": "#8A6D8B"}, {"d": 0.4, "h": 0.06, "k": "box", "w": 0.28, "y": 2.07, "color": "#8A6D8B"}, {"k": "roof", "w": 0.34, "y": 2.13, "type": "pyramid", "color": "#8A6D8B", "height": 0.16}, {"d": 0.02, "h": 0.16, "k": "box", "w": 0.02, "y": 2.29, "color": "#C9A24B", "detail": true, "emissive": true}, {"h": 0.12, "k": "panel", "w": 0.05, "pos": [-0.22, 0.6699999999999999, 0.23600000000000002], "glow": 0.5, "color": "#F5E6B8"}, {"h": 0.12, "k": "panel", "w": 0.05, "pos": [0, 0.6699999999999999, 0.23600000000000002], "glow": 0.5, "color": "#B83227"}, {"h": 0.12, "k": "panel", "w": 0.05, "pos": [0.22, 0.6699999999999999, 0.23600000000000002], "glow": 0.5, "color": "#F5E6B8"}, {"h": 0.08, "k": "panel", "w": 0.4, "pos": [0, 0.49, 0.228], "glow": 0.25, "color": "#B83227"}]	\N	18	2026-08-03 01:12:42.100883	2026-08-03 01:12:42.100883
20	sakura_dept_store	벚꽃 백화점	SAKURA	NORMAL	300	f	0.730	0.800	1.740	[{"d": 0.52, "k": "plinth", "w": 0.64, "color": "concrete"}, {"d": 0.52, "h": 0.5, "k": "box", "w": 0.64, "y": 0.07, "color": "#F7E6EC", "rough": 0.6, "windows": {"to": 0.9, "from": 0.45, "glow": 0.3, "color": "#BFE3EA"}}, {"d": 0.52, "k": "storefront", "w": 0.64, "sign": "#F6A8C4", "faceH": 0.32, "awning": "#B83227"}, {"d": 0.5700000000000001, "h": 0.05, "k": "box", "w": 0.6900000000000001, "y": 0.5700000000000001, "color": "#C9A24B"}, {"d": 0.48, "h": 0.5, "k": "box", "w": 0.6, "y": 0.6200000000000001, "color": "#FBD7E0", "rough": 0.6, "windows": {"to": 0.85, "from": 0.15, "glow": 0.3, "color": "#BFE3EA"}}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": -0.258, "y": 0.6200000000000001, "z": 0.244, "color": "#C9A24B"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": -0.17200000000000001, "y": 0.6200000000000001, "z": 0.244, "color": "#C9A24B"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": -0.08600000000000001, "y": 0.6200000000000001, "z": 0.244, "color": "#C9A24B"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": 0, "y": 0.6200000000000001, "z": 0.244, "color": "#C9A24B"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": 0.08599999999999998, "y": 0.6200000000000001, "z": 0.244, "color": "#C9A24B"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": 0.17200000000000001, "y": 0.6200000000000001, "z": 0.244, "color": "#C9A24B"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": 0.258, "y": 0.6200000000000001, "z": 0.244, "color": "#C9A24B"}, {"d": 0.5, "h": 0.05, "k": "box", "w": 0.62, "y": 1.12, "color": "#C9A24B"}, {"d": 0.36, "h": 0.4, "k": "box", "w": 0.44, "y": 1.1700000000000002, "color": "#F7E6EC", "rough": 0.6, "windows": {"to": 0.85, "from": 0.2, "glow": 0.3, "color": "#BFE3EA"}}, {"k": "roof", "w": 0.52, "y": 1.57, "type": "pyramid", "color": "#8A6D8B", "height": 0.14}, {"d": 0.52, "k": "parapet", "w": 0.64, "y": 0.5700000000000001, "color": "#F7E6EC"}, {"d": 0.05, "h": 0.14, "k": "box", "w": 0.05, "x": 0.24, "y": 0.5700000000000001, "z": 0.16, "color": "#5A3A2E", "detail": true}, {"d": 0.16, "h": 0.12, "k": "box", "w": 0.16, "x": 0.24, "y": 0.71, "z": 0.16, "color": "#F6A8C4", "detail": true}, {"h": 0.1, "k": "panel", "w": 0.5, "pos": [0, 0.97, 0.248], "glow": 0.35, "color": "#C9A24B"}]	\N	19	2026-08-03 01:12:42.102294	2026-08-03 01:12:42.102294
21	sakura_cityhall	기와 시청	SAKURA	NORMAL	300	f	0.858	0.858	1.970	[{"d": 0.5, "k": "plinth", "w": 0.66, "color": "concrete"}, {"d": 0.5, "h": 0.9, "k": "box", "w": 0.66, "y": 0.07, "color": "#F7E6EC", "rough": 0.68, "windows": {"to": 0.88, "from": 0.15, "glow": 0.26, "color": "#BFE3EA"}}, {"d": 0.5, "h": 0.6, "k": "columns", "w": 0.66, "y": 0.07, "color": "#D8CFC2", "count": 8}, {"d": 0.07, "h": 0.05, "k": "box", "w": 0.6204, "y": 0.7, "z": 0.28, "color": "#C9A24B"}, {"d": 0.514, "h": 0.028, "k": "box", "w": 0.674, "y": 0.53, "color": "#8A6D8B"}, {"d": 0.58, "k": "roof", "w": 0.74, "y": 0.97, "type": "pyramid", "color": "#8A6D8B", "height": 0.12}, {"d": 0.26, "h": 0.6, "k": "box", "w": 0.26, "y": 0.97, "color": "#FBD7E0", "rough": 0.68, "windows": {"to": 0.5, "from": 0.1, "glow": 0.26, "color": "#BFE3EA"}}, {"d": 0.022, "h": 0.6, "k": "box", "w": 0.022, "x": -0.13, "y": 0.97, "z": -0.13, "color": "#5A3A2E"}, {"d": 0.022, "h": 0.6, "k": "box", "w": 0.022, "x": 0.13, "y": 0.97, "z": -0.13, "color": "#5A3A2E"}, {"d": 0.022, "h": 0.6, "k": "box", "w": 0.022, "x": -0.13, "y": 0.97, "z": 0.13, "color": "#5A3A2E"}, {"d": 0.022, "h": 0.6, "k": "box", "w": 0.022, "x": 0.13, "y": 0.97, "z": 0.13, "color": "#5A3A2E"}, {"k": "clock", "w": 0.26, "y": 1.4100000000000001, "color": "#C9A24B"}, {"d": 0.32, "h": 0.04, "k": "box", "w": 0.32, "y": 1.57, "color": "#B83227"}, {"k": "roof", "w": 0.36, "y": 1.61, "type": "pyramid", "color": "#8A6D8B", "height": 0.2}, {"d": 0.02, "h": 0.16, "k": "box", "w": 0.02, "y": 1.81, "color": "#C9A24B", "detail": true, "emissive": true}, {"h": 0.09, "k": "panel", "w": 0.34, "pos": [0, 0.8500000000000001, 0.258], "glow": 0.25, "color": "#B83227"}]	\N	20	2026-08-03 01:12:42.103621	2026-08-03 01:12:42.103621
22	sakura_theater	가부키 극장	SAKURA	NORMAL	300	f	0.711	0.768	1.830	[{"d": 0.48, "k": "plinth", "w": 0.58, "color": "concrete"}, {"d": 0.48, "h": 1, "k": "box", "w": 0.58, "y": 0.07, "color": "#B83227", "rough": 0.7, "windows": {"to": 0.85, "from": 0.55, "glow": 0.32, "color": "#F5E6B8"}}, {"d": 0.022, "h": 1, "k": "box", "w": 0.022, "x": -0.24939999999999998, "y": 0.07, "z": 0.244, "color": "#C9A24B"}, {"d": 0.022, "h": 1, "k": "box", "w": 0.022, "x": -0.14964, "y": 0.07, "z": 0.244, "color": "#C9A24B"}, {"d": 0.022, "h": 1, "k": "box", "w": 0.022, "x": -0.04987999999999999, "y": 0.07, "z": 0.244, "color": "#C9A24B"}, {"d": 0.022, "h": 1, "k": "box", "w": 0.022, "x": 0.04987999999999999, "y": 0.07, "z": 0.244, "color": "#C9A24B"}, {"d": 0.022, "h": 1, "k": "box", "w": 0.022, "x": 0.14964000000000002, "y": 0.07, "z": 0.244, "color": "#C9A24B"}, {"d": 0.022, "h": 1, "k": "box", "w": 0.022, "x": 0.24939999999999998, "y": 0.07, "z": 0.244, "color": "#C9A24B"}, {"d": 0.48, "k": "storefront", "w": 0.58, "sign": "#C9A24B", "faceH": 0.42, "awning": "#7A1F1F"}, {"d": 0.5, "h": 0.05, "k": "box", "w": 0.6, "y": 1.07, "color": "#C9A24B"}, {"d": 0.38, "h": 0.3, "k": "box", "w": 0.42, "y": 1.12, "color": "#F7E6EC", "rough": 0.7}, {"k": "roof", "w": 0.5, "y": 1.4200000000000002, "type": "pyramid", "color": "#6E5570", "height": 0.13}, {"d": 0.5, "k": "roof", "w": 0.28, "y": 1.4200000000000002, "type": "round", "color": "#6E5570"}, {"d": 0.02, "h": 0.14, "k": "box", "w": 0.02, "y": 1.6900000000000002, "color": "#C9A24B", "detail": true, "emissive": true}, {"h": 0.7, "k": "panel", "w": 0.16, "pos": [0.3, 0.6699999999999999, 0.246], "glow": 0.5, "color": "#F6A8C4"}, {"h": 0.16, "k": "panel", "w": 0.44, "pos": [0, 0.97, 0.258], "glow": 0.45, "color": "#F6A8C4"}, {"h": 0.13, "k": "panel", "w": 0.05, "pos": [-0.24, 0.5700000000000001, 0.256], "glow": 0.55, "color": "#B83227"}, {"h": 0.13, "k": "panel", "w": 0.05, "pos": [-0.12, 0.5700000000000001, 0.256], "glow": 0.55, "color": "#F5E6B8"}]	\N	21	2026-08-03 01:12:42.104991	2026-08-03 01:12:42.104991
23	sakura_garden_mansion	벚꽃정원 맨션	SAKURA	NORMAL	300	f	0.673	0.673	1.870	[{"d": 0.4, "k": "plinth", "w": 0.52, "color": "concrete"}, {"d": 0.4, "h": 1.5, "k": "box", "w": 0.52, "y": 0.07, "color": "#F7E6EC", "rough": 0.7, "windows": {"to": 0.92, "from": 0.1, "glow": 0.26, "color": "#BFE3EA"}}, {"d": 0.4, "k": "balconies", "w": 0.52, "y0": 0.31, "y1": 1.3900000000000001, "color": "#FBD7E0", "floors": 7}, {"d": 0.025, "h": 1.5, "k": "box", "w": 0.025, "x": -0.26, "y": 0.07, "z": -0.2, "color": "#7A5540"}, {"d": 0.025, "h": 1.5, "k": "box", "w": 0.025, "x": 0.26, "y": 0.07, "z": -0.2, "color": "#7A5540"}, {"d": 0.025, "h": 1.5, "k": "box", "w": 0.025, "x": -0.26, "y": 0.07, "z": 0.2, "color": "#7A5540"}, {"d": 0.025, "h": 1.5, "k": "box", "w": 0.025, "x": 0.26, "y": 0.07, "z": 0.2, "color": "#7A5540"}, {"d": 0.41400000000000003, "h": 0.028, "k": "box", "w": 0.534, "y": 0.8200000000000001, "color": "#F6A8C4"}, {"d": 0.42, "h": 0.05, "k": "box", "w": 0.54, "y": 1.57, "color": "#C9A24B"}, {"k": "roof", "w": 0.58, "y": 1.62, "type": "pyramid", "color": "#8A6D8B", "height": 0.14}, {"d": 0.4, "k": "parapet", "w": 0.52, "y": 1.57, "color": "#F7E6EC"}, {"d": 0.05, "h": 0.16, "k": "box", "w": 0.05, "x": 0.18, "y": 1.57, "z": 0.1, "color": "#5A3A2E", "detail": true}, {"d": 0.18, "h": 0.14, "k": "box", "w": 0.18, "x": 0.18, "y": 1.73, "z": 0.1, "color": "#F6A8C4", "detail": true}, {"d": 0.12, "h": 0.1, "k": "box", "w": 0.12, "x": -0.14, "y": 1.57, "z": -0.06, "color": "#F6C0D4", "detail": true}, {"d": 0.4, "k": "storefront", "w": 0.52, "sign": "#F7E6EC", "faceH": 0.28, "awning": "#B83227"}]	\N	22	2026-08-03 01:12:42.106604	2026-08-03 01:12:42.106604
24	sakura_onsen_inn	온천 여관	SAKURA	NORMAL	300	f	0.835	0.835	1.820	[{"d": 0.46, "k": "plinth", "w": 0.62, "color": "path"}, {"d": 0.46, "h": 0.5, "k": "box", "w": 0.62, "y": 0.07, "color": "#F7E6EC", "rough": 0.78, "windows": {"to": 0.82, "from": 0.3, "glow": 0.3, "color": "#F5E6B8"}}, {"d": 0.56, "k": "roof", "w": 0.72, "y": 0.5700000000000001, "type": "pyramid", "color": "#6E5570", "height": 0.13}, {"d": 0.4, "h": 0.42, "k": "box", "w": 0.5, "y": 0.7, "color": "#F7E6EC", "rough": 0.78, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#F5E6B8"}}, {"d": 0.48, "k": "roof", "w": 0.58, "y": 1.12, "type": "pyramid", "color": "#6E5570", "height": 0.13}, {"d": 0.32, "h": 0.4, "k": "box", "w": 0.36, "y": 1.25, "color": "#F7E6EC", "rough": 0.78, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#F5E6B8"}}, {"d": 0.4, "k": "roof", "w": 0.44, "y": 1.6500000000000001, "type": "pyramid", "color": "#6E5570", "height": 0.14}, {"d": 0.07, "h": 0.44, "k": "box", "w": 0.07, "x": 0.2, "y": 1.12, "z": -0.12, "color": "#5A3A2E", "detail": true}, {"d": 0.1, "h": 0.06, "k": "box", "w": 0.1, "x": 0.2, "y": 1.56, "z": -0.12, "color": "#D8D0C8", "detail": true}, {"d": 0.46, "k": "storefront", "w": 0.62, "sign": "#F7E6EC", "faceH": 0.3, "awning": "#B83227"}, {"h": 0.12, "k": "panel", "w": 0.05, "pos": [-0.22, 0.49, 0.246], "glow": 0.5, "color": "#B83227"}, {"h": 0.12, "k": "panel", "w": 0.05, "pos": [-0.07, 0.49, 0.246], "glow": 0.5, "color": "#F5E6B8"}, {"h": 0.12, "k": "panel", "w": 0.05, "pos": [0.08, 0.49, 0.246], "glow": 0.5, "color": "#B83227"}, {"h": 0.12, "k": "panel", "w": 0.05, "pos": [0.23, 0.49, 0.246], "glow": 0.5, "color": "#F5E6B8"}]	\N	23	2026-08-03 01:12:42.107954	2026-08-03 01:12:42.107954
25	sakura_bank	화신 은행	SAKURA	NORMAL	300	f	0.649	0.733	1.710	[{"d": 0.44, "k": "plinth", "w": 0.54, "color": "#D8CFC2"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.4, "y": 0.07, "z": 0.35, "color": "#D8CFC2"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.36000000000000004, "y": 0.098, "z": 0.31, "color": "#D8CFC2"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.32, "y": 0.126, "z": 0.27, "color": "#D8CFC2"}, {"d": 0.44, "h": 0.7, "k": "box", "w": 0.54, "y": 0.13, "color": "#CFC4B4", "rough": 0.7, "windows": {"to": 0.85, "from": 0.4, "glow": 0.22, "color": "#BFE3EA"}}, {"d": 0.44, "h": 0.62, "k": "columns", "w": 0.54, "y": 0.13, "color": "#F7E6EC", "count": 6}, {"d": 0.48, "h": 0.06, "k": "box", "w": 0.58, "y": 0.8300000000000001, "color": "#F7E6EC"}, {"d": 0.38, "h": 0.6, "k": "box", "w": 0.46, "y": 0.8899999999999999, "color": "#CFC4B4", "rough": 0.7, "windows": {"to": 0.85, "from": 0.15, "glow": 0.22, "color": "#BFE3EA"}}, {"d": 0.022, "h": 0.6, "k": "box", "w": 0.022, "x": -0.1978, "y": 0.8899999999999999, "z": 0.194, "color": "#F7E6EC"}, {"d": 0.022, "h": 0.6, "k": "box", "w": 0.022, "x": -0.0989, "y": 0.8899999999999999, "z": 0.194, "color": "#F7E6EC"}, {"d": 0.022, "h": 0.6, "k": "box", "w": 0.022, "x": 0, "y": 0.8899999999999999, "z": 0.194, "color": "#F7E6EC"}, {"d": 0.022, "h": 0.6, "k": "box", "w": 0.022, "x": 0.0989, "y": 0.8899999999999999, "z": 0.194, "color": "#F7E6EC"}, {"d": 0.022, "h": 0.6, "k": "box", "w": 0.022, "x": 0.1978, "y": 0.8899999999999999, "z": 0.194, "color": "#F7E6EC"}, {"d": 0.42, "h": 0.05, "k": "box", "w": 0.5, "y": 1.49, "color": "#C9A24B"}, {"k": "roof", "w": 0.56, "y": 1.54, "type": "pyramid", "color": "#8A6D8B", "height": 0.14}, {"d": 0.44, "k": "parapet", "w": 0.54, "y": 0.8300000000000001, "color": "#CFC4B4"}, {"h": 0.08, "k": "panel", "w": 0.34, "pos": [0, 0.69, 0.23800000000000002], "glow": 0.3, "color": "#C9A24B"}]	\N	24	2026-08-03 01:12:42.109312	2026-08-03 01:12:42.109312
26	sakura_bathhouse	센토 목욕탕	SAKURA	NORMAL	300	f	0.673	0.681	1.530	[{"d": 0.44, "k": "plinth", "w": 0.52, "color": "concrete"}, {"d": 0.44, "h": 0.7, "k": "box", "w": 0.52, "y": 0.07, "color": "#F7E6EC", "rough": 0.75, "windows": {"to": 0.82, "from": 0.4, "glow": 0.3, "color": "#F5E6B8"}}, {"d": 0.02, "h": 0.7, "k": "box", "w": 0.02, "x": -0.2236, "y": 0.07, "z": 0.224, "color": "#7A5540"}, {"d": 0.02, "h": 0.7, "k": "box", "w": 0.02, "x": -0.1118, "y": 0.07, "z": 0.224, "color": "#7A5540"}, {"d": 0.02, "h": 0.7, "k": "box", "w": 0.02, "x": 0, "y": 0.07, "z": 0.224, "color": "#7A5540"}, {"d": 0.02, "h": 0.7, "k": "box", "w": 0.02, "x": 0.1118, "y": 0.07, "z": 0.224, "color": "#7A5540"}, {"d": 0.02, "h": 0.7, "k": "box", "w": 0.02, "x": 0.2236, "y": 0.07, "z": 0.224, "color": "#7A5540"}, {"d": 0.36, "h": 0.4, "k": "box", "w": 0.44, "y": 0.77, "color": "#FBD7E0", "rough": 0.75, "windows": {"to": 0.75, "from": 0.2, "glow": 0.3, "color": "#F5E6B8"}}, {"d": 0.5, "k": "roof", "w": 0.36, "y": 1.1700000000000002, "type": "round", "color": "#6E5570"}, {"d": 0.5, "k": "roof", "w": 0.58, "y": 0.77, "type": "pyramid", "color": "#6E5570", "height": 0.1}, {"d": 0.1, "h": 0.7, "k": "box", "w": 0.1, "x": 0.18, "y": 0.77, "z": -0.12, "color": "#8A5A44"}, {"d": 0.12, "h": 0.06, "k": "box", "w": 0.12, "x": 0.18, "y": 1.47, "z": -0.12, "color": "#6E4636", "detail": true}, {"d": 0.44, "k": "storefront", "w": 0.52, "sign": "#F7E6EC", "faceH": 0.32, "awning": "#2E6E8C"}, {"h": 0.14, "k": "panel", "w": 0.16, "pos": [0, 0.6300000000000001, 0.23800000000000002], "glow": 0.3, "color": "#2E6E8C"}]	\N	25	2026-08-03 01:12:42.110611	2026-08-03 01:12:42.110611
27	sakura_machiya	마치야 상가주택	SAKURA	NORMAL	300	f	0.603	0.680	1.600	[{"d": 0.46, "k": "plinth", "w": 0.32, "color": "path"}, {"d": 0.46, "h": 0.5, "k": "box", "w": 0.32, "y": 0.07, "color": "#5A3A2E", "rough": 0.8}, {"d": 0.44, "h": 0.44, "k": "box", "w": 0.3, "y": 0.5700000000000001, "color": "#F7E6EC", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.24, "color": "#BFE3EA"}}, {"d": 0.42, "h": 0.4, "k": "box", "w": 0.28, "y": 1.01, "color": "#FBD7E0", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.24, "color": "#BFE3EA"}}, {"d": 0.52, "k": "roof", "w": 0.38, "y": 1.4100000000000001, "type": "pyramid", "color": "#8A6D8B", "height": 0.16}, {"h": 0.44, "k": "panel", "w": 0.28, "pos": [0, 0.79, 0.226], "color": "#7A5540"}, {"h": 0.38, "k": "panel", "w": 0.26, "pos": [0, 1.21, 0.216], "color": "#8A6550"}, {"d": 0.47400000000000003, "h": 0.028, "k": "box", "w": 0.334, "y": 0.5700000000000001, "color": "#7A5540"}, {"d": 0.47400000000000003, "h": 0.028, "k": "box", "w": 0.334, "y": 1.01, "color": "#7A5540"}, {"h": 0.1, "k": "panel", "w": 0.28, "pos": [0, 0.51, 0.23800000000000002], "glow": 0.2, "color": "#B83227"}, {"h": 0.14, "k": "panel", "w": 0.06, "pos": [0.1, 0.31, 0.23600000000000002], "glow": 0.45, "color": "#F5E6B8"}]	\N	26	2026-08-03 01:12:42.111924	2026-08-03 01:12:42.111924
28	sakura_temple_hall	사원 본당	SAKURA	NORMAL	300	f	0.881	0.881	1.470	[{"d": 0.54, "k": "plinth", "w": 0.68, "color": "#D8CFC2"}, {"d": 0.48, "h": 0.2, "k": "box", "w": 0.62, "y": 0.07, "color": "#CFC4B4", "rough": 0.9}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.34, "y": 0.07, "z": 0.37, "color": "#D8CFC2"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.30000000000000004, "y": 0.098, "z": 0.33, "color": "#D8CFC2"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.26, "y": 0.126, "z": 0.29, "color": "#D8CFC2"}, {"d": 0.42, "h": 0.56, "k": "box", "w": 0.56, "y": 0.27, "color": "#B83227", "rough": 0.75, "windows": {"to": 0.8, "from": 0.25, "glow": 0.28, "color": "#F5E6B8"}}, {"d": 0.42, "h": 0.56, "k": "columns", "w": 0.56, "y": 0.27, "color": "#5A3A2E", "count": 6}, {"d": 0.6, "k": "roof", "w": 0.76, "y": 0.8300000000000001, "type": "pyramid", "color": "#6E5570", "height": 0.14}, {"d": 0.34, "h": 0.16, "k": "box", "w": 0.44, "y": 0.97, "color": "#B83227", "rough": 0.75}, {"d": 0.44, "k": "roof", "w": 0.56, "y": 1.1300000000000001, "type": "pyramid", "color": "#6E5570", "height": 0.2}, {"d": 0.05, "h": 0.14, "k": "box", "w": 0.05, "y": 1.33, "color": "#C9A24B", "detail": true, "emissive": true}, {"d": 0.02, "h": 0.06, "k": "box", "w": 0.05, "x": -0.24, "y": 0.97, "color": "#8A6D8B", "detail": true}, {"d": 0.02, "h": 0.06, "k": "box", "w": 0.05, "x": 0.24, "y": 0.97, "color": "#8A6D8B", "detail": true}, {"h": 0.1, "k": "panel", "w": 0.3, "pos": [0, 0.71, 0.228], "glow": 0.3, "color": "#C9A24B"}]	\N	27	2026-08-03 01:12:42.113273	2026-08-03 01:12:42.113273
29	sakura_shrine	신사 배전	SAKURA	NORMAL	300	f	0.673	0.734	1.370	[{"d": 0.46, "k": "plinth", "w": 0.54, "color": "#D8CFC2"}, {"d": 0.4, "h": 0.4, "k": "box", "w": 0.48, "y": 0.07, "color": "#CFC4B4", "rough": 0.9}, {"d": 0.055, "h": 0.05, "k": "box", "w": 0.24, "y": 0.07, "z": 0.37, "color": "#5A3A2E"}, {"d": 0.055, "h": 0.05, "k": "box", "w": 0.19999999999999998, "y": 0.12000000000000001, "z": 0.32999999999999996, "color": "#5A3A2E"}, {"d": 0.055, "h": 0.05, "k": "box", "w": 0.15999999999999998, "y": 0.17, "z": 0.29, "color": "#5A3A2E"}, {"d": 0.055, "h": 0.05, "k": "box", "w": 0.12, "y": 0.22000000000000003, "z": 0.25, "color": "#5A3A2E"}, {"d": 0.36, "h": 0.5, "k": "box", "w": 0.44, "y": 0.47000000000000003, "color": "#B83227", "rough": 0.72, "windows": {"to": 0.78, "from": 0.25, "glow": 0.3, "color": "#F5E6B8"}}, {"d": 0.36, "h": 0.5, "k": "columns", "w": 0.44, "y": 0.47000000000000003, "color": "#5A3A2E", "count": 5}, {"d": 0.48, "k": "roof", "w": 0.58, "y": 0.97, "type": "pyramid", "color": "#6E5570", "height": 0.24}, {"d": 0.02, "h": 0.16, "k": "box", "w": 0.02, "x": -0.08, "y": 1.21, "color": "#C9A24B", "rough": 0.4, "detail": true, "emissive": true}, {"d": 0.02, "h": 0.16, "k": "box", "w": 0.02, "x": 0.08, "y": 1.21, "color": "#C9A24B", "rough": 0.4, "detail": true, "emissive": true}, {"d": 0.04, "h": 0.04, "k": "box", "w": 0.24, "y": 1.23, "color": "#C9A24B", "detail": true}, {"d": 0.05, "h": 0.5, "k": "box", "w": 0.05, "x": -0.18, "y": 0.07, "z": 0.34, "color": "#B83227"}, {"d": 0.05, "h": 0.5, "k": "box", "w": 0.05, "x": 0.18, "y": 0.07, "z": 0.34, "color": "#B83227"}, {"d": 0.06, "h": 0.05, "k": "box", "w": 0.5, "y": 0.5700000000000001, "z": 0.34, "color": "#8A2420"}, {"d": 0.04, "h": 0.04, "k": "box", "w": 0.42, "y": 0.47000000000000003, "z": 0.34, "color": "#B83227"}, {"h": 0.12, "k": "panel", "w": 0.18, "pos": [0, 0.69, 0.20600000000000002], "glow": 0.3, "color": "#F5E6B8"}]	\N	28	2026-08-03 01:12:42.11461	2026-08-03 01:12:42.11461
30	sakura_lantern_shops	종이등 상점가	SAKURA	NORMAL	300	f	0.928	0.932	1.200	[{"d": 0.42, "k": "plinth", "w": 0.7, "color": "path"}, {"d": 0.42, "h": 0.46, "k": "box", "w": 0.23, "x": -0.23, "y": 0.07, "color": "#5A3A2E", "rough": 0.8}, {"d": 0.42, "h": 0.5, "k": "box", "w": 0.23, "x": 0, "y": 0.07, "color": "#7A5540", "rough": 0.8}, {"d": 0.42, "h": 0.44, "k": "box", "w": 0.23, "x": 0.23, "y": 0.07, "color": "#5A3A2E", "rough": 0.8}, {"d": 0.42, "k": "storefront", "w": 0.7, "sign": "#F5E6B8", "faceH": 0.3, "awning": "#B83227"}, {"d": 0.4, "h": 0.4, "k": "box", "w": 0.68, "y": 0.5700000000000001, "color": "#F7E6EC", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#F5E6B8"}}, {"d": 0.02, "h": 0.4, "k": "box", "w": 0.02, "x": -0.2924, "y": 0.5700000000000001, "z": 0.20400000000000001, "color": "#7A5540"}, {"d": 0.02, "h": 0.4, "k": "box", "w": 0.02, "x": -0.20885714285714285, "y": 0.5700000000000001, "z": 0.20400000000000001, "color": "#7A5540"}, {"d": 0.02, "h": 0.4, "k": "box", "w": 0.02, "x": -0.1253142857142857, "y": 0.5700000000000001, "z": 0.20400000000000001, "color": "#7A5540"}, {"d": 0.02, "h": 0.4, "k": "box", "w": 0.02, "x": -0.041771428571428584, "y": 0.5700000000000001, "z": 0.20400000000000001, "color": "#7A5540"}, {"d": 0.02, "h": 0.4, "k": "box", "w": 0.02, "x": 0.04177142857142855, "y": 0.5700000000000001, "z": 0.20400000000000001, "color": "#7A5540"}, {"d": 0.02, "h": 0.4, "k": "box", "w": 0.02, "x": 0.1253142857142857, "y": 0.5700000000000001, "z": 0.20400000000000001, "color": "#7A5540"}, {"d": 0.02, "h": 0.4, "k": "box", "w": 0.02, "x": 0.20885714285714282, "y": 0.5700000000000001, "z": 0.20400000000000001, "color": "#7A5540"}, {"d": 0.02, "h": 0.4, "k": "box", "w": 0.02, "x": 0.2924, "y": 0.5700000000000001, "z": 0.20400000000000001, "color": "#7A5540"}, {"d": 0.44, "h": 0.04, "k": "box", "w": 0.72, "y": 0.97, "color": "#B83227"}, {"d": 0.5, "k": "roof", "w": 0.8, "y": 1.01, "type": "pyramid", "color": "#8A6D8B", "height": 0.16}, {"h": 0.12, "k": "panel", "w": 0.05, "pos": [-0.28, 0.49, 0.216], "glow": 0.55, "color": "#B83227"}, {"h": 0.12, "k": "panel", "w": 0.05, "pos": [-0.14, 0.49, 0.216], "glow": 0.55, "color": "#F5E6B8"}, {"h": 0.12, "k": "panel", "w": 0.05, "pos": [0, 0.49, 0.216], "glow": 0.55, "color": "#B83227"}, {"h": 0.12, "k": "panel", "w": 0.05, "pos": [0.14, 0.49, 0.216], "glow": 0.55, "color": "#F5E6B8"}, {"h": 0.12, "k": "panel", "w": 0.05, "pos": [0.28, 0.49, 0.216], "glow": 0.55, "color": "#B83227"}, {"h": 0.09, "k": "panel", "w": 0.5, "pos": [0, 0.8500000000000001, 0.218], "glow": 0.28, "color": "#B83227"}]	\N	29	2026-08-03 01:12:42.115977	2026-08-03 01:12:42.115977
31	sakura_garden_cafe	정원 카페	SAKURA	NORMAL	300	f	0.533	0.572	1.490	[{"d": 0.4, "k": "plinth", "w": 0.44, "color": "path"}, {"d": 0.4, "h": 0.48, "k": "box", "w": 0.44, "y": 0.07, "color": "#FBD7E0", "rough": 0.75, "windows": {"to": 0.88, "from": 0.45, "glow": 0.3, "color": "#BFE3EA"}}, {"d": 0.4, "k": "storefront", "w": 0.44, "sign": "#5A3A2E", "faceH": 0.3, "awning": "#F6A8C4"}, {"d": 0.38, "h": 0.44, "k": "box", "w": 0.42, "y": 0.55, "color": "#F7E6EC", "rough": 0.75, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#BFE3EA"}}, {"d": 0.34, "h": 0.34, "k": "box", "w": 0.38, "y": 0.99, "color": "#FBD7E0", "rough": 0.75, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#BFE3EA"}}, {"d": 0.42, "k": "roof", "w": 0.46, "y": 1.33, "type": "pyramid", "color": "#8A6D8B", "height": 0.13}, {"d": 0.022, "h": 1.26, "k": "box", "w": 0.022, "x": -0.22, "y": 0.07, "z": -0.2, "color": "#7A5540"}, {"d": 0.022, "h": 1.26, "k": "box", "w": 0.022, "x": 0.22, "y": 0.07, "z": -0.2, "color": "#7A5540"}, {"d": 0.022, "h": 1.26, "k": "box", "w": 0.022, "x": -0.22, "y": 0.07, "z": 0.2, "color": "#7A5540"}, {"d": 0.022, "h": 1.26, "k": "box", "w": 0.022, "x": 0.22, "y": 0.07, "z": 0.2, "color": "#7A5540"}, {"d": 0.38, "k": "parapet", "w": 0.42, "y": 0.99, "color": "#F7E6EC"}, {"k": "parasol", "pos": [0.12, 0.55, 0.12], "color": "#F6A8C4"}, {"d": 0.04, "h": 0.12, "k": "box", "w": 0.04, "x": -0.14, "y": 0.99, "z": 0.1, "color": "#5A3A2E", "detail": true}, {"d": 0.14, "h": 0.1, "k": "box", "w": 0.14, "x": -0.14, "y": 1.11, "z": 0.1, "color": "#F6A8C4", "detail": true}]	\N	30	2026-08-03 01:12:42.117398	2026-08-03 01:12:42.117398
32	sakura_tea_house	다실 하우스	SAKURA	NORMAL	300	f	0.603	0.608	1.400	[{"d": 0.42, "k": "plinth", "w": 0.42, "color": "path"}, {"d": 0.5, "h": 0.05, "k": "box", "w": 0.5, "y": 0.07, "color": "#5A3A2E", "rough": 0.85}, {"d": 0.4, "h": 0.44, "k": "box", "w": 0.4, "y": 0.12000000000000001, "color": "#F7E6EC", "rough": 0.82, "windows": {"to": 0.8, "from": 0.25, "glow": 0.28, "color": "#F5E6B8"}}, {"d": 0.52, "k": "roof", "w": 0.52, "y": 0.56, "type": "pyramid", "color": "#6E5570", "height": 0.16}, {"d": 0.3, "h": 0.36, "k": "box", "w": 0.3, "y": 0.72, "color": "#FBD7E0", "rough": 0.82, "windows": {"to": 0.8, "from": 0.25, "glow": 0.28, "color": "#F5E6B8"}}, {"d": 0.42, "k": "roof", "w": 0.42, "y": 1.08, "type": "pyramid", "color": "#6E5570", "height": 0.2}, {"d": 0.02, "h": 0.12, "k": "box", "w": 0.02, "y": 1.28, "color": "#5A3A2E", "detail": true}, {"d": 0.06, "h": 0.14, "k": "box", "w": 0.06, "x": 0.22, "y": 0.07, "z": 0.2, "color": "#CFC4B4", "detail": true}, {"d": 0.09, "h": 0.05, "k": "box", "w": 0.09, "x": 0.22, "y": 0.21000000000000002, "z": 0.2, "color": "#D8CFC2", "detail": true}, {"h": 0.06, "k": "panel", "w": 0.06, "pos": [0.22, 0.22, 0.2], "glow": 0.4, "color": "#F5E6B8"}, {"h": 0.14, "k": "panel", "w": 0.2, "pos": [0, 0.31, 0.20600000000000002], "glow": 0.15, "color": "#B83227"}]	\N	31	2026-08-03 01:12:42.118889	2026-08-03 01:12:42.118889
33	sakura_dango_stall	경단 찻집	SAKURA	NORMAL	300	f	0.487	0.522	1.400	[{"d": 0.32, "k": "plinth", "w": 0.34, "color": "path"}, {"d": 0.32, "h": 0.42, "k": "box", "w": 0.34, "y": 0.07, "color": "#5A3A2E", "rough": 0.82}, {"d": 0.32, "k": "storefront", "w": 0.34, "sign": "#F5E6B8", "faceH": 0.26, "awning": "#B83227"}, {"d": 0.3, "h": 0.38, "k": "box", "w": 0.32, "y": 0.49, "color": "#F7E6EC", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#F5E6B8"}}, {"d": 0.28, "h": 0.34, "k": "box", "w": 0.3, "y": 0.8700000000000001, "color": "#FBD7E0", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#F5E6B8"}}, {"d": 0.38, "k": "roof", "w": 0.42, "y": 1.21, "type": "pyramid", "color": "#8A6D8B", "height": 0.16}, {"d": 0.334, "h": 0.028, "k": "box", "w": 0.35400000000000004, "y": 0.49, "color": "#7A5540"}, {"d": 0.334, "h": 0.028, "k": "box", "w": 0.35400000000000004, "y": 0.8700000000000001, "color": "#7A5540"}, {"h": 0.06, "k": "panel", "w": 0.06, "pos": [0.1, 0.41000000000000003, 0.17800000000000002], "glow": 0.4, "color": "#E86A88"}, {"h": 0.06, "k": "panel", "w": 0.06, "pos": [0.1, 0.49, 0.17800000000000002], "glow": 0.3, "color": "#F7E6EC"}, {"h": 0.06, "k": "panel", "w": 0.06, "pos": [0.1, 0.5700000000000001, 0.17800000000000002], "glow": 0.4, "color": "#8AB84B"}, {"h": 0.11, "k": "panel", "w": 0.05, "pos": [-0.11, 0.39, 0.17600000000000002], "glow": 0.5, "color": "#B83227"}, {"h": 0.08, "k": "panel", "w": 0.22, "pos": [0, 0.79, 0.168], "glow": 0.25, "color": "#B83227"}]	\N	32	2026-08-03 01:12:42.12022	2026-08-03 01:12:42.12022
34	sakura_torii_gate	토리이 게이트	SAKURA	NORMAL	300	f	0.740	0.649	1.250	[{"d": 0.44, "k": "plinth", "w": 0.62, "color": "#D8CFC2"}, {"d": 0.08, "h": 1.1, "k": "box", "w": 0.08, "x": -0.24, "y": 0.07, "z": 0.16, "color": "#B83227", "rough": 0.7}, {"d": 0.08, "h": 1.1, "k": "box", "w": 0.08, "x": 0.24, "y": 0.07, "z": 0.16, "color": "#B83227", "rough": 0.7}, {"d": 0.07, "h": 0.07, "k": "box", "w": 0.62, "y": 0.8899999999999999, "z": 0.16, "color": "#B83227", "rough": 0.7}, {"d": 0.12, "h": 0.08, "k": "box", "w": 0.74, "y": 1.1700000000000002, "z": 0.16, "color": "#8A2420", "rough": 0.7}, {"d": 0.09, "h": 0.06, "k": "box", "w": 0.64, "y": 1.11, "z": 0.16, "color": "#B83227", "rough": 0.7}, {"d": 0.05, "h": 0.16, "k": "box", "w": 0.1, "y": 0.97, "z": 0.16, "color": "#C9A24B", "detail": true, "emissive": true}, {"d": 0.3, "h": 0.6, "k": "box", "w": 0.44, "y": 0.07, "z": -0.12, "color": "#F7E6EC", "rough": 0.78, "windows": {"to": 0.8, "from": 0.3, "glow": 0.28, "color": "#F5E6B8"}}, {"d": 0.3, "h": 0.5, "k": "columns", "w": 0.44, "y": 0.07, "color": "#5A3A2E", "count": 5}, {"d": 0.4, "k": "roof", "w": 0.56, "y": 0.6699999999999999, "type": "pyramid", "color": "#6E5570", "height": 0.2}, {"d": 0.02, "h": 0.12, "k": "box", "w": 0.02, "y": 0.8700000000000001, "z": -0.12, "color": "#C9A24B", "detail": true, "emissive": true}, {"h": 0.14, "k": "panel", "w": 0.12, "pos": [0, 0.9299999999999999, 0.166], "glow": 0.3, "color": "#C9A24B"}, {"h": 0.12, "k": "panel", "w": 0.05, "pos": [0, 0.5700000000000001, 0.166], "glow": 0.5, "color": "#F5E6B8"}]	\N	33	2026-08-03 01:12:42.121601	2026-08-03 01:12:42.121601
35	sakura_bell_tower	종루 (쇼로)	SAKURA	NORMAL	300	f	0.649	0.662	1.810	[{"d": 0.46, "k": "plinth", "w": 0.46, "color": "#D8CFC2"}, {"d": 0.42, "h": 0.3, "k": "box", "w": 0.42, "y": 0.07, "color": "#CFC4B4", "rough": 0.92}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.22, "y": 0.07, "z": 0.31, "color": "#D8CFC2"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.18, "y": 0.098, "z": 0.27, "color": "#D8CFC2"}, {"d": 0.06, "h": 0.9, "k": "box", "w": 0.06, "x": -0.16, "y": 0.37, "z": -0.16, "color": "#5A3A2E"}, {"d": 0.06, "h": 0.9, "k": "box", "w": 0.06, "x": 0.16, "y": 0.37, "z": -0.16, "color": "#5A3A2E"}, {"d": 0.06, "h": 0.9, "k": "box", "w": 0.06, "x": -0.16, "y": 0.37, "z": 0.16, "color": "#5A3A2E"}, {"d": 0.06, "h": 0.9, "k": "box", "w": 0.06, "x": 0.16, "y": 0.37, "z": 0.16, "color": "#5A3A2E"}, {"d": 0.44, "h": 0.06, "k": "box", "w": 0.44, "y": 1.21, "color": "#7A5540"}, {"d": 0.36, "h": 0.16, "k": "box", "w": 0.36, "y": 1.27, "color": "#F7E6EC", "rough": 0.8}, {"d": 0.56, "k": "roof", "w": 0.56, "y": 1.4300000000000002, "type": "pyramid", "color": "#6E5570", "height": 0.26}, {"d": 0.05, "h": 0.12, "k": "box", "w": 0.05, "y": 1.6900000000000002, "color": "#C9A24B", "detail": true, "emissive": true}, {"h": 0.24, "k": "cyl", "y": 0.73, "rb": 0.1, "rt": 0.08, "color": "#7A6A3A", "detail": true}, {"d": 0.04, "h": 0.04, "k": "box", "w": 0.24, "y": 1.1900000000000002, "color": "#5A3A2E", "detail": true}]	\N	34	2026-08-03 01:12:42.122891	2026-08-03 01:12:42.122891
36	cyber_megacorp	메가코프 본사	CYBER	NORMAL	300	f	0.775	0.812	3.565	[{"d": 0.62, "k": "plinth", "w": 0.68, "color": "#0E0B1A"}, {"d": 0.62, "h": 0.12, "k": "box", "w": 0.68, "y": 0.07, "color": "#3A3A46"}, {"d": 0.6, "h": 1, "k": "box", "w": 0.66, "y": 0.19, "color": "#141026", "metal": 0.6, "rough": 0.4, "windows": {"to": 0.95, "from": 0.1, "glow": 0.6, "color": "#22E0FF"}}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": -0.2838, "y": 0.19, "z": 0.304, "color": "#1B2A4A"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": -0.1892, "y": 0.19, "z": 0.304, "color": "#1B2A4A"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": -0.0946, "y": 0.19, "z": 0.304, "color": "#1B2A4A"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": 0, "y": 0.19, "z": 0.304, "color": "#1B2A4A"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": 0.09459999999999998, "y": 0.19, "z": 0.304, "color": "#1B2A4A"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": 0.1892, "y": 0.19, "z": 0.304, "color": "#1B2A4A"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": 0.2838, "y": 0.19, "z": 0.304, "color": "#1B2A4A"}, {"d": 0.64, "h": 0.02, "k": "box", "w": 0.7, "x": 0, "y": 0.69, "z": 0, "color": "#22E0FF", "emissive": true}, {"d": 0.62, "h": 0.05, "k": "box", "w": 0.68, "y": 1.1900000000000002, "color": "#3A3A46"}, {"d": 0.46, "h": 0.9, "k": "box", "w": 0.5, "y": 1.24, "color": "#141026", "metal": 0.6, "rough": 0.4, "windows": {"to": 0.95, "from": 0.1, "glow": 0.6, "color": "#22E0FF"}}, {"d": 0.48, "h": 0.02, "k": "box", "w": 0.52, "x": 0, "y": 1.6700000000000002, "z": 0, "color": "#FF2E88", "emissive": true}, {"d": 0.48, "h": 0.05, "k": "box", "w": 0.52, "y": 2.1399999999999997, "color": "#3A3A46"}, {"d": 0.32, "h": 0.85, "k": "box", "w": 0.34, "y": 2.19, "color": "#141026", "metal": 0.6, "rough": 0.4, "windows": {"to": 0.95, "from": 0.1, "glow": 0.6, "color": "#FF2E88"}}, {"d": 0.32, "k": "parapet", "w": 0.34, "y": 3.04, "color": "#0E0B1A"}, {"h": 0.5, "k": "antenna", "y": 3.04}, {"h": 0.28, "k": "panel", "w": 0.28, "pos": [0, 2.67, 0.168], "glow": 0.85, "color": "#FF2E88"}, {"h": 0.95, "k": "panel", "w": 0.03, "pos": [-0.33, 0.6699999999999999, 0.306], "glow": 0.8, "color": "#22E0FF"}, {"h": 0.95, "k": "panel", "w": 0.03, "pos": [0.33, 0.6699999999999999, 0.306], "glow": 0.8, "color": "#FF2E88"}, {"d": 0.6, "k": "storefront", "w": 0.66, "sign": "#22E0FF", "faceH": 0.32, "awning": "#2A1B4A"}]	\N	35	2026-08-03 01:12:42.124521	2026-08-03 01:12:42.124521
37	cyber_skybridge_towers	스카이브리지 트윈타워	CYBER	NORMAL	300	f	0.798	0.603	3.115	[{"d": 0.42, "k": "plinth", "w": 0.7, "color": "#0E0B1A"}, {"d": 0.36, "h": 2.1, "k": "box", "w": 0.28, "x": -0.2, "y": 0.07, "color": "#141026", "metal": 0.6, "rough": 0.4, "windows": {"to": 0.96, "from": 0.06, "glow": 0.55, "color": "#22E0FF"}}, {"d": 0.36, "h": 2.5, "k": "box", "w": 0.28, "x": 0.2, "y": 0.07, "color": "#141026", "metal": 0.6, "rough": 0.4, "windows": {"to": 0.96, "from": 0.06, "glow": 0.55, "color": "#FF2E88"}}, {"d": 0.02, "h": 2.1, "k": "box", "w": 0.02, "x": -0.33, "y": 0.07, "z": 0.18, "color": "#1B2A4A"}, {"d": 0.02, "h": 2.5, "k": "box", "w": 0.02, "x": 0.33, "y": 0.07, "z": 0.18, "color": "#1B2A4A"}, {"d": 0.24, "h": 0.14, "k": "box", "w": 0.16, "y": 1.6700000000000002, "color": "#3A3A46", "metal": 0.5, "rough": 0.5}, {"d": 0.26, "h": 0.02, "k": "box", "w": 0.16, "x": 0, "y": 1.6700000000000002, "z": 0, "color": "#22E0FF", "emissive": true}, {"d": 0.2, "h": 0.12, "k": "box", "w": 0.16, "y": 1.02, "color": "#3A3A46", "metal": 0.5, "rough": 0.5}, {"d": 0.22, "h": 0.02, "k": "box", "w": 0.16, "x": 0, "y": 1.02, "z": 0, "color": "#FF2E88", "emissive": true}, {"d": 0.36, "h": 0.12, "k": "box", "w": 0.3, "x": -0.2, "y": 2.17, "color": "#3A3A46"}, {"d": 0.36, "h": 0.12, "k": "box", "w": 0.3, "x": 0.2, "y": 2.57, "color": "#3A3A46"}, {"h": 0.4, "k": "antenna", "y": 2.69}, {"h": 0.6, "k": "panel", "w": 0.16, "pos": [-0.2, 1.97, 0.186], "glow": 0.7, "color": "#39FF8B"}, {"h": 0.6, "k": "panel", "w": 0.16, "pos": [0.2, 2.17, 0.186], "glow": 0.7, "color": "#22E0FF"}, {"d": 0.4, "k": "storefront", "w": 0.68, "sign": "#FF2E88", "faceH": 0.28, "awning": "#2A1B4A"}]	\N	36	2026-08-03 01:12:42.125867	2026-08-03 01:12:42.125867
38	cyber_antenna_spire	통신 스파이어	CYBER	NORMAL	300	f	0.502	0.569	3.845	[{"d": 0.44, "k": "plinth", "w": 0.44, "color": "#0E0B1A"}, {"d": 0.4, "h": 0.5, "k": "box", "w": 0.4, "y": 0.07, "color": "#141026", "rough": 0.5, "windows": {"to": 0.8, "from": 0.2, "glow": 0.55, "color": "#22E0FF"}}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": -0.2, "y": 0.07, "z": -0.2, "color": "#22E0FF"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": 0.2, "y": 0.07, "z": -0.2, "color": "#22E0FF"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": -0.2, "y": 0.07, "z": 0.2, "color": "#22E0FF"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": 0.2, "y": 0.07, "z": 0.2, "color": "#22E0FF"}, {"h": 2.2, "k": "cyl", "y": 0.5700000000000001, "rb": 0.18, "rt": 0.07, "seg": 10, "color": "#3A3A46"}, {"d": 0.3, "h": 0.22, "k": "box", "w": 0.3, "y": 0.97, "color": "#141026", "rough": 0.5, "windows": {"to": 0.8, "from": 0.2, "glow": 0.6, "color": "#FF2E88"}}, {"d": 0.24, "h": 0.2, "k": "box", "w": 0.24, "y": 1.6700000000000002, "color": "#141026", "rough": 0.5, "windows": {"to": 0.8, "from": 0.2, "glow": 0.6, "color": "#22E0FF"}}, {"h": 0.03, "k": "cyl", "y": 1.21, "rb": 0.14, "rt": 0.14, "seg": 14, "color": "#22E0FF", "detail": true}, {"h": 0.03, "k": "cyl", "y": 1.9100000000000001, "rb": 0.11, "rt": 0.11, "seg": 14, "color": "#FF2E88", "detail": true}, {"h": 0.7, "k": "cyl", "y": 2.77, "rb": 0.05, "rt": 0.02, "seg": 8, "color": "#3A3A46", "detail": true}, {"h": 0.35, "k": "antenna", "y": 3.4699999999999998}, {"h": 0.06, "k": "panel", "w": 0.3, "pos": [0, 1.07, 0.168], "glow": 0.7, "color": "#39FF8B"}]	\N	37	2026-08-03 01:12:42.127394	2026-08-03 01:12:42.127394
44	cyber_surveillance_tower	감시탑	CYBER	NORMAL	300	f	0.480	0.638	2.615	[{"d": 0.36, "k": "plinth", "w": 0.36, "color": "#0E0B1A"}, {"d": 0.3, "h": 0.3, "k": "box", "w": 0.3, "y": 0.07, "color": "#2A2A33", "rough": 0.5}, {"h": 1.5, "k": "cyl", "y": 0.37, "rb": 0.12, "rt": 0.09, "seg": 8, "color": "#3A3A46"}, {"h": 0.04, "k": "cyl", "y": 0.97, "rb": 0.13, "rt": 0.13, "seg": 12, "color": "#FF2E88", "detail": true}, {"h": 0.12, "k": "cyl", "y": 1.77, "rb": 0.2, "rt": 0.24, "seg": 14, "color": "#3A3A46"}, {"d": 0.44, "h": 0.26, "k": "box", "w": 0.44, "y": 1.8900000000000001, "color": "#141026", "rough": 0.4, "windows": {"to": 0.8, "from": 0.2, "glow": 0.6, "color": "#22E0FF"}}, {"k": "roof", "w": 0.44, "y": 2.15, "type": "dome", "color": "#1B2A4A"}, {"h": 0.3, "k": "antenna", "y": 2.29}, {"h": 0.06, "k": "panel", "w": 0.34, "pos": [0, 1.97, 0.228], "glow": 0.9, "color": "#FF2E88"}, {"h": 0.4, "k": "panel", "w": 0.06, "pos": [0, 0.97, 0.126], "glow": 0.6, "color": "#FFB020"}]	\N	43	2026-08-03 01:12:42.135043	2026-08-03 01:12:42.135043
39	cyber_reactor_tower	리액터 타워	CYBER	NORMAL	300	f	0.752	0.864	2.795	[{"d": 0.66, "k": "plinth", "w": 0.66, "color": "#0E0B1A"}, {"d": 0.62, "h": 0.16, "k": "box", "w": 0.62, "y": 0.07, "color": "#3A3A46"}, {"h": 1.3, "k": "cyl", "y": 0.23, "rb": 0.32, "rt": 0.26, "seg": 14, "color": "#2A2A33"}, {"h": 0.04, "k": "cyl", "y": 0.5700000000000001, "rb": 0.34, "rt": 0.34, "seg": 16, "color": "#22E0FF", "detail": true}, {"h": 0.04, "k": "cyl", "y": 1.07, "rb": 0.32, "rt": 0.32, "seg": 16, "color": "#22E0FF", "detail": true}, {"h": 0.5, "k": "cyl", "y": 1.53, "rb": 0.26, "rt": 0.2, "seg": 14, "color": "#3A3A46"}, {"h": 0.34, "k": "cyl", "y": 2.03, "rb": 0.15, "rt": 0.15, "seg": 14, "color": "#22E0FF", "detail": true}, {"k": "roof", "w": 0.5, "y": 2.3699999999999997, "type": "dome", "color": "#1B2A4A"}, {"h": 0.4, "k": "antenna", "y": 2.3699999999999997}, {"d": 0.07, "h": 1.1, "k": "box", "w": 0.07, "x": 0.28, "y": 0.23, "z": 0.14, "color": "#3A3A46", "detail": true}, {"d": 0.07, "h": 1.1, "k": "box", "w": 0.07, "x": -0.28, "y": 0.23, "z": 0.14, "color": "#3A3A46", "detail": true}, {"d": 0.07, "h": 1, "k": "box", "w": 0.07, "x": 0.28, "y": 0.23, "z": -0.16, "color": "#3A3A46", "detail": true}, {"h": 0.12, "k": "panel", "w": 0.34, "pos": [0, 0.77, 0.318], "glow": 0.7, "color": "#FFB020"}]	\N	38	2026-08-03 01:12:42.128826	2026-08-03 01:12:42.128826
40	cyber_holo_tower	홀로 광고 타워	CYBER	NORMAL	300	f	0.676	0.592	2.595	[{"d": 0.34, "k": "plinth", "w": 0.48, "color": "#0E0B1A"}, {"d": 0.34, "h": 2, "k": "box", "w": 0.48, "y": 0.07, "color": "#141026", "metal": 0.5, "rough": 0.4, "windows": {"to": 0.95, "from": 0.1, "glow": 0.3, "color": "#1B2A4A"}}, {"d": 0.34, "k": "parapet", "w": 0.48, "y": 2.07, "color": "#0E0B1A"}, {"h": 0.5, "k": "antenna", "y": 2.07}, {"h": 1.7, "k": "panel", "w": 0.44, "pos": [0, 1.12, 0.17800000000000002], "glow": 0.8, "color": "#FF2E88"}, {"h": 0.7, "k": "panel", "w": 0.36, "pos": [0, 1.47, 0.19], "glow": 0.85, "color": "#22E0FF"}, {"h": 0.4, "k": "panel", "w": 0.3, "pos": [0, 0.77, 0.19], "glow": 0.8, "color": "#39FF8B"}, {"h": 1.6, "k": "panel", "w": 0.3, "pos": [0.248, 1.12, 0], "glow": 0.75, "rotY": 1.5708, "color": "#4FA0FF"}, {"h": 2, "k": "panel", "w": 0.06, "pos": [-0.248, 1.07, 0], "glow": 0.7, "rotY": 1.5708, "color": "#FF2E88"}, {"d": 0.34, "k": "storefront", "w": 0.48, "sign": "#22E0FF", "faceH": 0.3, "awning": "#2A1B4A"}]	\N	39	2026-08-03 01:12:42.130121	2026-08-03 01:12:42.130121
41	cyber_media_tower	미디어 스크린 타워	CYBER	NORMAL	300	f	0.836	0.836	2.535	[{"d": 0.44, "k": "plinth", "w": 0.44, "color": "#0E0B1A"}, {"d": 0.44, "h": 1.5, "k": "box", "w": 0.44, "y": 0.07, "color": "#141026", "metal": 0.5, "rough": 0.4}, {"d": 0.32, "h": 0.5, "k": "box", "w": 0.32, "y": 1.57, "color": "#2A2A33", "rough": 0.4}, {"k": "roof", "w": 0.36, "y": 2.07, "type": "pyramid", "color": "#3A3A46", "height": 0.14}, {"h": 0.3, "k": "antenna", "y": 2.21}, {"h": 1.3, "k": "panel", "w": 0.38, "pos": [0, 0.8700000000000001, 0.228], "glow": 0.75, "color": "#22E0FF"}, {"h": 1.3, "k": "panel", "w": 0.38, "pos": [0, 0.8700000000000001, -0.228], "glow": 0.75, "rotY": 3.1416, "color": "#FF2E88"}, {"h": 1.3, "k": "panel", "w": 0.38, "pos": [0.228, 0.8700000000000001, 0], "glow": 0.75, "rotY": 1.5708, "color": "#39FF8B"}, {"h": 1.3, "k": "panel", "w": 0.38, "pos": [-0.228, 0.8700000000000001, 0], "glow": 0.7, "rotY": 1.5708, "color": "#FFB020"}, {"h": 0.3, "k": "panel", "w": 0.28, "pos": [0, 1.77, 0.168], "glow": 0.8, "color": "#FF2E88"}]	\N	40	2026-08-03 01:12:42.131265	2026-08-03 01:12:42.131265
42	cyber_hive_apartment	하이브 아파트	CYBER	NORMAL	300	f	0.634	0.558	2.345	[{"d": 0.4, "k": "plinth", "w": 0.54, "color": "#0E0B1A"}, {"d": 0.4, "h": 1.9, "k": "box", "w": 0.54, "y": 0.07, "color": "#141026", "rough": 0.6, "windows": {"to": 0.96, "from": 0.06, "glow": 0.45, "color": "#FFB020"}}, {"d": 0.4, "k": "balconies", "w": 0.54, "y0": 0.25, "y1": 1.82, "color": "#3A3A46", "floors": 10}, {"d": 0.025, "h": 1.9, "k": "box", "w": 0.025, "x": -0.27, "y": 0.07, "z": -0.2, "color": "#1B2A4A"}, {"d": 0.025, "h": 1.9, "k": "box", "w": 0.025, "x": 0.27, "y": 0.07, "z": -0.2, "color": "#1B2A4A"}, {"d": 0.025, "h": 1.9, "k": "box", "w": 0.025, "x": -0.27, "y": 0.07, "z": 0.2, "color": "#1B2A4A"}, {"d": 0.025, "h": 1.9, "k": "box", "w": 0.025, "x": 0.27, "y": 0.07, "z": 0.2, "color": "#1B2A4A"}, {"d": 0.42, "h": 0.02, "k": "box", "w": 0.56, "x": 0, "y": 0.6699999999999999, "z": 0, "color": "#22E0FF", "emissive": true}, {"d": 0.42, "h": 0.02, "k": "box", "w": 0.56, "x": 0, "y": 1.27, "z": 0, "color": "#FF2E88", "emissive": true}, {"d": 0.4, "k": "parapet", "w": 0.54, "y": 1.97, "color": "#0E0B1A"}, {"k": "rooftopUnits", "w": 0.54, "y": 1.97}, {"h": 0.35, "k": "antenna", "y": 1.97}, {"h": 1.4, "k": "panel", "w": 0.1, "pos": [0.276, 0.97, 0], "glow": 0.7, "rotY": 1.5708, "color": "#FF2E88"}, {"d": 0.4, "k": "storefront", "w": 0.54, "sign": "#FFB020", "faceH": 0.26, "awning": "#2A1B4A"}]	\N	41	2026-08-03 01:12:42.132419	2026-08-03 01:12:42.132419
43	cyber_penthouse_tower	캔틸레버 펜트하우스	CYBER	NORMAL	300	f	0.590	0.833	2.375	[{"d": 0.36, "k": "plinth", "w": 0.36, "color": "#0E0B1A"}, {"d": 0.28, "h": 1.5, "k": "box", "w": 0.28, "y": 0.07, "color": "#141026", "metal": 0.5, "rough": 0.35, "windows": {"to": 0.92, "from": 0.1, "glow": 0.45, "color": "#22E0FF"}}, {"d": 0.02, "h": 1.5, "k": "box", "w": 0.02, "x": -0.14, "y": 0.07, "z": -0.14, "color": "#1B2A4A"}, {"d": 0.02, "h": 1.5, "k": "box", "w": 0.02, "x": 0.14, "y": 0.07, "z": -0.14, "color": "#1B2A4A"}, {"d": 0.02, "h": 1.5, "k": "box", "w": 0.02, "x": -0.14, "y": 0.07, "z": 0.14, "color": "#1B2A4A"}, {"d": 0.02, "h": 1.5, "k": "box", "w": 0.02, "x": 0.14, "y": 0.07, "z": 0.14, "color": "#1B2A4A"}, {"d": 0.44, "h": 0.24, "k": "box", "w": 0.44, "y": 1.57, "color": "#1B2A4A", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.85, "from": 0.15, "glow": 0.6, "color": "#22E0FF"}}, {"d": 0.56, "h": 0.24, "k": "box", "w": 0.56, "y": 1.81, "color": "#1B2A4A", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.85, "from": 0.15, "glow": 0.6, "color": "#FF2E88"}}, {"d": 0.58, "h": 0.02, "k": "box", "w": 0.58, "x": 0, "y": 2.05, "z": 0, "color": "#22E0FF", "emissive": true}, {"d": 0.56, "k": "parapet", "w": 0.56, "y": 2.05, "color": "#0E0B1A"}, {"k": "rooftopUnits", "w": 0.5, "y": 2.05}, {"h": 0.3, "k": "antenna", "y": 2.05}, {"h": 0.06, "k": "panel", "w": 0.5, "pos": [0, 1.61, 0.28800000000000003], "glow": 0.8, "color": "#FF2E88"}]	\N	42	2026-08-03 01:12:42.133636	2026-08-03 01:12:42.133636
45	cyber_slum_stack	슬럼 스택	CYBER	NORMAL	300	f	0.618	0.730	2.355	[{"d": 0.46, "k": "plinth", "w": 0.54, "color": "#0E0B1A"}, {"d": 0.46, "h": 0.5, "k": "box", "w": 0.54, "y": 0.07, "color": "#2A2A33", "rough": 0.7, "windows": {"to": 0.85, "from": 0.2, "glow": 0.45, "color": "#FFB020"}}, {"d": 0.52, "h": 0.44, "k": "box", "w": 0.44, "x": 0.08, "y": 0.5700000000000001, "color": "#141026", "rough": 0.7, "windows": {"to": 0.85, "from": 0.2, "glow": 0.45, "color": "#FF2E88"}}, {"d": 0.36, "h": 0.42, "k": "box", "w": 0.5, "x": -0.06, "y": 1.01, "z": 0.05, "color": "#3A3A46", "rough": 0.7, "windows": {"to": 0.85, "from": 0.2, "glow": 0.45, "color": "#22E0FF"}}, {"d": 0.42, "h": 0.4, "k": "box", "w": 0.36, "x": 0.1, "y": 1.4300000000000002, "z": -0.04, "color": "#2A2A33", "rough": 0.7, "windows": {"to": 0.85, "from": 0.2, "glow": 0.45, "color": "#39FF8B"}}, {"d": 0.3, "h": 0.36, "k": "box", "w": 0.3, "x": -0.08, "y": 1.83, "color": "#141026", "rough": 0.7}, {"k": "rooftopUnits", "w": 0.4, "y": 2.19}, {"h": 0.5, "k": "antenna", "y": 1.83}, {"h": 0.12, "k": "panel", "w": 0.36, "pos": [0.08, 0.97, 0.28800000000000003], "glow": 0.7, "color": "#39FF8B"}, {"h": 0.34, "k": "panel", "w": 0.08, "pos": [-0.24, 0.47000000000000003, 0.246], "glow": 0.7, "color": "#FF2E88"}, {"h": 0.28, "k": "panel", "w": 0.08, "pos": [0.26, 1.37, 0.20600000000000002], "glow": 0.7, "color": "#22E0FF"}, {"d": 0.015, "h": 0.015, "k": "box", "w": 0.5, "y": 1.07, "z": 0.24, "color": "#FF2E88", "emissive": true}]	\N	44	2026-08-03 01:12:42.136188	2026-08-03 01:12:42.136188
46	cyber_arena	홀로 아레나	CYBER	NORMAL	300	f	0.821	1.038	1.725	[{"d": 0.68, "k": "plinth", "w": 0.72, "color": "#0E0B1A"}, {"h": 0.7, "k": "cyl", "y": 0.07, "rb": 0.38, "rt": 0.36, "seg": 16, "color": "#2A2A33"}, {"h": 0.05, "k": "cyl", "y": 0.31, "rb": 0.39, "rt": 0.39, "seg": 16, "color": "#22E0FF", "detail": true}, {"h": 0.05, "k": "cyl", "y": 0.5700000000000001, "rb": 0.39, "rt": 0.39, "seg": 16, "color": "#FF2E88", "detail": true}, {"h": 0.16, "k": "cyl", "y": 0.77, "rb": 0.36, "rt": 0.32, "seg": 16, "color": "#141026"}, {"k": "roof", "w": 0.76, "y": 0.9299999999999999, "type": "dome", "color": "#1B2A4A"}, {"h": 0.34, "k": "panel", "w": 0.34, "pos": [0, 1.27, 0], "glow": 0.7, "color": "#FF2E88"}, {"h": 0.35, "k": "antenna", "y": 1.35}, {"d": 0.5, "k": "storefront", "w": 0.6, "sign": "#22E0FF", "faceH": 0.36, "awning": "#2A1B4A"}, {"h": 0.14, "k": "panel", "w": 0.5, "pos": [0, 0.5900000000000001, 0.398], "glow": 0.8, "color": "#39FF8B"}]	\N	45	2026-08-03 01:12:42.137407	2026-08-03 01:12:42.137407
47	cyber_datacenter	데이터센터 큐브	CYBER	NORMAL	300	f	0.730	0.900	1.510	[{"d": 0.6, "k": "plinth", "w": 0.64, "color": "#0E0B1A"}, {"d": 0.6, "h": 1.1, "k": "box", "w": 0.64, "y": 0.07, "color": "#2A2A33", "metal": 0.3, "rough": 0.6}, {"d": 0.62, "h": 0.02, "k": "box", "w": 0.66, "x": 0, "y": 0.37, "z": 0, "color": "#22E0FF", "emissive": true}, {"d": 0.62, "h": 0.02, "k": "box", "w": 0.66, "x": 0, "y": 0.6200000000000001, "z": 0, "color": "#22E0FF", "emissive": true}, {"d": 0.62, "h": 0.02, "k": "box", "w": 0.66, "x": 0, "y": 0.8700000000000001, "z": 0, "color": "#39FF8B", "emissive": true}, {"h": 0.5, "k": "panel", "w": 0.5, "pos": [0, 0.6200000000000001, 0.308], "glow": 0.2, "color": "#1B2A4A"}, {"h": 0.14, "k": "panel", "w": 0.14, "pos": [-0.16, 0.6200000000000001, 0.314], "glow": 0.7, "color": "#39FF8B"}, {"h": 0.14, "k": "panel", "w": 0.14, "pos": [0.16, 0.6200000000000001, 0.314], "glow": 0.7, "color": "#22E0FF"}, {"d": 0.6, "k": "parapet", "w": 0.64, "y": 1.1700000000000002, "color": "#0E0B1A"}, {"k": "rooftopUnits", "w": 0.64, "y": 1.1700000000000002}, {"d": 0.12, "h": 0.34, "k": "box", "w": 0.12, "x": -0.18, "y": 1.1700000000000002, "color": "#3A3A46", "detail": true}, {"d": 0.12, "h": 0.28, "k": "box", "w": 0.12, "x": 0.14, "y": 1.1700000000000002, "z": 0.12, "color": "#3A3A46", "detail": true}, {"h": 0.3, "k": "antenna", "y": 1.1700000000000002}]	\N	46	2026-08-03 01:12:42.138581	2026-08-03 01:12:42.138581
48	cyber_capsule_hotel	캡슐 호텔	CYBER	NORMAL	300	f	0.660	0.713	1.710	[{"d": 0.5, "k": "plinth", "w": 0.52, "color": "#0E0B1A"}, {"d": 0.5, "h": 1.5, "k": "box", "w": 0.52, "y": 0.07, "color": "#2A2A33", "rough": 0.6, "windows": {"to": 0.95, "from": 0.08, "glow": 0.5, "color": "#FFB020"}}, {"d": 0.52, "h": 0.02, "k": "box", "w": 0.54, "x": 0, "y": 0.42, "z": 0, "color": "#22E0FF", "emissive": true}, {"d": 0.52, "h": 0.02, "k": "box", "w": 0.54, "x": 0, "y": 0.77, "z": 0, "color": "#22E0FF", "emissive": true}, {"d": 0.52, "h": 0.02, "k": "box", "w": 0.54, "x": 0, "y": 1.12, "z": 0, "color": "#22E0FF", "emissive": true}, {"d": 0.52, "h": 0.02, "k": "box", "w": 0.54, "x": 0, "y": 1.47, "z": 0, "color": "#22E0FF", "emissive": true}, {"d": 0.06, "h": 0.1, "k": "box", "w": 0.1, "x": 0.28, "y": 0.5700000000000001, "z": 0.12, "color": "#3A3A46", "detail": true}, {"d": 0.06, "h": 0.1, "k": "box", "w": 0.1, "x": 0.28, "y": 0.97, "z": -0.12, "color": "#3A3A46", "detail": true}, {"d": 0.06, "h": 0.1, "k": "box", "w": 0.1, "x": -0.28, "y": 1.27, "z": 0.12, "color": "#3A3A46", "detail": true}, {"d": 0.5, "k": "parapet", "w": 0.52, "y": 1.57, "color": "#0E0B1A"}, {"k": "rooftopUnits", "w": 0.52, "y": 1.57}, {"d": 0.5, "k": "storefront", "w": 0.52, "sign": "#22E0FF", "faceH": 0.3, "awning": "#2A1B4A"}, {"h": 0.12, "k": "panel", "w": 0.34, "pos": [0, 1.45, 0.258], "glow": 0.8, "color": "#FF2E88"}]	\N	47	2026-08-03 01:12:42.139768	2026-08-03 01:12:42.139768
49	cyber_neon_arcade	네온 아케이드	CYBER	NORMAL	300	f	0.775	0.822	1.570	[{"d": 0.48, "k": "plinth", "w": 0.68, "color": "#0E0B1A"}, {"d": 0.48, "h": 0.7, "k": "box", "w": 0.68, "y": 0.07, "color": "#141026", "rough": 0.5, "windows": {"to": 0.9, "from": 0.5, "glow": 0.55, "color": "#FF2E88"}}, {"d": 0.48, "k": "storefront", "w": 0.68, "sign": "#FF2E88", "faceH": 0.42, "awning": "#2A1B4A"}, {"d": 0.53, "h": 0.05, "k": "box", "w": 0.7300000000000001, "y": 0.77, "color": "#3A3A46"}, {"d": 0.4, "h": 0.5, "k": "box", "w": 0.56, "y": 0.8200000000000001, "color": "#2A2A33", "rough": 0.5, "windows": {"to": 0.8, "from": 0.2, "glow": 0.5, "color": "#22E0FF"}}, {"d": 0.4, "k": "parapet", "w": 0.56, "y": 1.32, "color": "#0E0B1A"}, {"k": "rooftopUnits", "w": 0.56, "y": 1.32}, {"h": 0.16, "k": "panel", "w": 0.58, "pos": [0, 0.9299999999999999, 0.258], "glow": 0.85, "color": "#22E0FF"}, {"h": 0.6, "k": "panel", "w": 0.1, "pos": [-0.3, 0.6699999999999999, 0.246], "glow": 0.8, "color": "#FF2E88"}, {"h": 0.45, "k": "panel", "w": 0.1, "pos": [0.3, 0.5700000000000001, 0.246], "glow": 0.8, "color": "#39FF8B"}, {"h": 0.4, "k": "panel", "w": 0.12, "pos": [0, 1.37, 0.20600000000000002], "glow": 0.75, "color": "#FFB020"}]	\N	48	2026-08-03 01:12:42.140996	2026-08-03 01:12:42.140996
50	cyber_nightclub	나이트클럽	CYBER	NORMAL	300	f	0.720	0.804	2.055	[{"d": 0.52, "k": "plinth", "w": 0.6, "color": "#0E0B1A"}, {"d": 0.52, "h": 0.7, "k": "box", "w": 0.6, "y": 0.07, "color": "#2A1B4A", "rough": 0.5, "windows": {"to": 0.7, "from": 0.3, "glow": 0.6, "color": "#FF2E88"}}, {"d": 0.4, "h": 0.16, "k": "box", "w": 0.46, "y": 0.77, "color": "#141026"}, {"d": 0.12, "h": 0.9, "k": "box", "w": 0.12, "y": 0.9299999999999999, "color": "#3A3A46"}, {"h": 0.7, "k": "panel", "w": 0.36, "pos": [0, 1.27, 0.066], "glow": 0.9, "color": "#22E0FF"}, {"h": 0.7, "k": "panel", "w": 0.36, "pos": [0, 1.27, -0.066], "glow": 0.9, "rotY": 3.1416, "color": "#FF2E88"}, {"d": 0.52, "k": "storefront", "w": 0.6, "sign": "#FF2E88", "faceH": 0.35, "awning": "#12081F"}, {"h": 0.2, "k": "panel", "w": 0.46, "pos": [0, 0.6499999999999999, 0.278], "glow": 0.9, "color": "#22E0FF"}, {"h": 0.5, "k": "panel", "w": 0.12, "pos": [-0.3, 0.5700000000000001, 0.256], "glow": 0.85, "color": "#FF2E88"}, {"h": 0.5, "k": "panel", "w": 0.12, "pos": [0.3, 0.5700000000000001, 0.256], "glow": 0.85, "color": "#39FF8B"}, {"h": 0.2, "k": "antenna", "y": 1.83}]	\N	49	2026-08-03 01:12:42.14214	2026-08-03 01:12:42.14214
51	cyber_pawn_shop	전당포	CYBER	NORMAL	300	f	0.638	0.704	1.730	[{"d": 0.52, "k": "plinth", "w": 0.56, "color": "#0E0B1A"}, {"d": 0.24, "h": 0.9, "k": "box", "w": 0.56, "y": 0.07, "z": -0.12, "color": "#141026", "rough": 0.6, "windows": {"to": 0.85, "from": 0.15, "glow": 0.5, "color": "#39FF8B"}}, {"d": 0.5, "h": 1.3, "k": "box", "w": 0.24, "x": -0.14, "y": 0.07, "color": "#2A2A33", "rough": 0.6, "windows": {"to": 0.9, "from": 0.12, "glow": 0.5, "color": "#FFB020"}}, {"d": 0.52, "h": 0.06, "k": "box", "w": 0.26, "x": -0.14, "y": 1.37, "color": "#3A3A46"}, {"d": 0.14, "h": 0.3, "k": "box", "w": 0.14, "x": -0.14, "y": 1.4300000000000002, "color": "#3A3A46", "detail": true}, {"k": "rooftopUnits", "w": 0.5, "y": 0.97}, {"d": 0.5, "k": "storefront", "w": 0.4, "sign": "#FFB020", "faceH": 0.4, "awning": "#2A1B4A"}, {"h": 0.5, "k": "panel", "w": 0.16, "pos": [0.16, 0.77, 0.256], "glow": 0.85, "color": "#FFB020"}, {"h": 0.12, "k": "panel", "w": 0.3, "pos": [-0.14, 0.73, 0.258], "glow": 0.7, "color": "#39FF8B"}]	\N	50	2026-08-03 01:12:42.143347	2026-08-03 01:12:42.143347
52	cyber_street_clinic	스트리트 클리닉	CYBER	NORMAL	300	f	0.677	0.674	1.871	[{"d": 0.5, "k": "plinth", "w": 0.58, "color": "#0E0B1A"}, {"d": 0.5, "h": 0.5, "k": "box", "w": 0.58, "y": 0.07, "color": "#2A2A33", "rough": 0.55, "windows": {"to": 0.8, "from": 0.3, "glow": 0.45, "color": "#22E0FF"}}, {"d": 0.55, "h": 0.05, "k": "box", "w": 0.63, "y": 0.5700000000000001, "color": "#3A3A46"}, {"d": 0.3, "h": 1.1, "k": "box", "w": 0.3, "y": 0.6200000000000001, "color": "#141026", "rough": 0.5, "windows": {"to": 0.9, "from": 0.1, "glow": 0.5, "color": "#22E0FF"}}, {"d": 0.02, "h": 1.1, "k": "box", "w": 0.02, "x": -0.15, "y": 0.6200000000000001, "z": -0.15, "color": "#1B2A4A"}, {"d": 0.02, "h": 1.1, "k": "box", "w": 0.02, "x": 0.15, "y": 0.6200000000000001, "z": -0.15, "color": "#1B2A4A"}, {"d": 0.02, "h": 1.1, "k": "box", "w": 0.02, "x": -0.15, "y": 0.6200000000000001, "z": 0.15, "color": "#1B2A4A"}, {"d": 0.02, "h": 1.1, "k": "box", "w": 0.02, "x": 0.15, "y": 0.6200000000000001, "z": 0.15, "color": "#1B2A4A"}, {"d": 0.3, "k": "parapet", "w": 0.3, "y": 1.72, "color": "#0E0B1A"}, {"k": "rooftopUnits", "w": 0.3, "y": 1.72}, {"k": "cross", "s": 0.8, "y": 1.27, "z": 0.158, "color": "#39FF8B"}, {"k": "cross", "s": 0.6, "y": 1.82, "color": "#39FF8B"}, {"d": 0.5, "k": "storefront", "w": 0.58, "sign": "#22E0FF", "faceH": 0.34, "awning": "#0E2A2A"}, {"h": 0.4, "k": "panel", "w": 0.1, "pos": [0.296, 0.37, 0], "glow": 0.7, "rotY": 1.5708, "color": "#39FF8B"}]	\N	51	2026-08-03 01:12:42.144626	2026-08-03 01:12:42.144626
53	cyber_noodle_bar	누들 포드타워	CYBER	NORMAL	300	f	0.430	0.528	1.915	[{"d": 0.34, "k": "plinth", "w": 0.36, "color": "#0E0B1A"}, {"d": 0.34, "h": 0.44, "k": "box", "w": 0.36, "y": 0.07, "color": "#141026", "rough": 0.6, "windows": {"to": 0.85, "from": 0.4, "glow": 0.55, "color": "#FFB020"}}, {"d": 0.34, "k": "storefront", "w": 0.36, "sign": "#FF2E88", "faceH": 0.28, "awning": "#12081F"}, {"h": 0.28, "k": "cyl", "y": 0.51, "rb": 0.19, "rt": 0.19, "seg": 12, "color": "#2A2A33"}, {"h": 0.28, "k": "cyl", "y": 0.8500000000000001, "rb": 0.19, "rt": 0.19, "seg": 12, "color": "#141026"}, {"h": 0.28, "k": "cyl", "y": 1.1900000000000002, "rb": 0.17, "rt": 0.17, "seg": 12, "color": "#2A2A33"}, {"h": 0.04, "k": "cyl", "y": 0.79, "rb": 0.21, "rt": 0.21, "seg": 12, "color": "#22E0FF", "detail": true}, {"h": 0.04, "k": "cyl", "y": 1.1300000000000001, "rb": 0.21, "rt": 0.21, "seg": 12, "color": "#FF2E88", "detail": true}, {"k": "roof", "w": 0.34, "y": 1.47, "type": "cone", "color": "#3A3A46", "height": 0.18}, {"h": 0.24, "k": "antenna", "y": 1.6500000000000001}, {"h": 0.9, "k": "panel", "w": 0.12, "pos": [0.16, 0.97, 0.16], "glow": 0.85, "color": "#FF2E88"}, {"h": 0.1, "k": "panel", "w": 0.28, "pos": [0, 0.43, 0.17800000000000002], "glow": 0.7, "color": "#FFB020"}]	\N	52	2026-08-03 01:12:42.145941	2026-08-03 01:12:42.145941
54	cyber_ramen_stall	자판기 갠트리	CYBER	NORMAL	300	f	0.570	0.573	1.250	[{"d": 0.36, "k": "plinth", "w": 0.5, "color": "#0E0B1A"}, {"d": 0.05, "h": 1.1, "k": "box", "w": 0.05, "x": -0.21, "y": 0.07, "z": -0.14, "color": "#3A3A46"}, {"d": 0.05, "h": 1.1, "k": "box", "w": 0.05, "x": 0.21, "y": 0.07, "z": -0.14, "color": "#3A3A46"}, {"d": 0.05, "h": 1.1, "k": "box", "w": 0.05, "x": -0.21, "y": 0.07, "z": 0.14, "color": "#3A3A46"}, {"d": 0.05, "h": 1.1, "k": "box", "w": 0.05, "x": 0.21, "y": 0.07, "z": 0.14, "color": "#3A3A46"}, {"d": 0.36, "h": 0.08, "k": "box", "w": 0.52, "y": 1.1700000000000002, "color": "#2A2A33"}, {"d": 0.14, "h": 0.6, "k": "box", "w": 0.4, "y": 0.07, "z": -0.08, "color": "#141026", "rough": 0.5}, {"h": 0.5, "k": "panel", "w": 0.12, "pos": [-0.12, 0.39, 0.006], "glow": 0.8, "color": "#22E0FF"}, {"h": 0.5, "k": "panel", "w": 0.12, "pos": [0.02, 0.39, 0.006], "glow": 0.8, "color": "#FF2E88"}, {"h": 0.5, "k": "panel", "w": 0.12, "pos": [0.16, 0.39, 0.006], "glow": 0.8, "color": "#FFB020"}, {"d": 0.32, "h": 0.06, "k": "box", "w": 0.44, "y": 0.69, "color": "#7A1030"}, {"h": 0.1, "k": "panel", "w": 0.4, "pos": [0, 0.6300000000000001, 0.168], "glow": 0.7, "color": "#FFB020"}, {"h": 0.14, "k": "panel", "w": 0.05, "pos": [-0.16, 0.51, 0.166], "glow": 0.8, "color": "#FF2E88"}, {"d": 0.02, "h": 0.02, "k": "box", "w": 0.5, "y": 0.97, "z": 0.15, "color": "#22E0FF", "emissive": true}]	\N	53	2026-08-03 01:12:42.147064	2026-08-03 01:12:42.147064
55	cyber_neon_shrine	네온 사당	CYBER	NORMAL	300	f	0.660	0.558	1.270	[{"d": 0.44, "k": "plinth", "w": 0.56, "color": "#0E0B1A"}, {"d": 0.06, "h": 1.1, "k": "box", "w": 0.06, "x": -0.2, "y": 0.07, "z": 0.16, "color": "#FF2E88", "emissive": true}, {"d": 0.06, "h": 1.1, "k": "box", "w": 0.06, "x": 0.2, "y": 0.07, "z": 0.16, "color": "#FF2E88", "emissive": true}, {"d": 0.06, "h": 0.06, "k": "box", "w": 0.56, "y": 0.9199999999999999, "z": 0.16, "color": "#22E0FF", "emissive": true}, {"d": 0.1, "h": 0.06, "k": "box", "w": 0.66, "y": 1.1700000000000002, "z": 0.16, "color": "#FF2E88", "emissive": true}, {"d": 0.3, "h": 0.4, "k": "box", "w": 0.34, "y": 0.5700000000000001, "z": -0.1, "color": "#141026", "rough": 0.5, "windows": {"to": 0.8, "from": 0.2, "glow": 0.6, "color": "#22E0FF"}}, {"d": 0.36, "h": 0.06, "k": "box", "w": 0.4, "y": 0.51, "z": -0.1, "color": "#3A3A46"}, {"d": 0.4, "k": "roof", "w": 0.48, "y": 0.97, "type": "pyramid", "color": "#2A1B4A", "height": 0.16}, {"d": 0.03, "h": 0.14, "k": "box", "w": 0.03, "y": 1.1300000000000001, "z": -0.1, "color": "#22E0FF", "detail": true, "emissive": true}, {"h": 0.14, "k": "panel", "w": 0.2, "pos": [0, 0.77, 0.056], "glow": 0.85, "color": "#FF2E88"}, {"h": 0.1, "k": "panel", "w": 0.14, "pos": [0, 1.05, 0.18], "glow": 0.8, "color": "#39FF8B"}]	\N	54	2026-08-03 01:12:42.148255	2026-08-03 01:12:42.148255
56	seoul_landmark_tower	한강 랜드마크타워	SEOUL	NORMAL	300	f	0.684	0.712	3.995	[{"d": 0.6, "k": "plinth", "w": 0.6, "color": "roofDark"}, {"d": 0.56, "h": 0.14, "k": "box", "w": 0.56, "y": 0.07, "color": "#3A3A44", "rough": 0.6}, {"d": 0.5, "h": 1, "k": "box", "w": 0.5, "y": 0.21000000000000002, "color": "#5E86A8", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.95, "from": 0.08, "glow": 0.4, "color": "#7FA6C4"}}, {"d": 0.018, "h": 1, "k": "box", "w": 0.018, "x": -0.215, "y": 0.21000000000000002, "z": 0.254, "color": "#7FA6C4"}, {"d": 0.018, "h": 1, "k": "box", "w": 0.018, "x": -0.129, "y": 0.21000000000000002, "z": 0.254, "color": "#7FA6C4"}, {"d": 0.018, "h": 1, "k": "box", "w": 0.018, "x": -0.04299999999999999, "y": 0.21000000000000002, "z": 0.254, "color": "#7FA6C4"}, {"d": 0.018, "h": 1, "k": "box", "w": 0.018, "x": 0.04299999999999999, "y": 0.21000000000000002, "z": 0.254, "color": "#7FA6C4"}, {"d": 0.018, "h": 1, "k": "box", "w": 0.018, "x": 0.129, "y": 0.21000000000000002, "z": 0.254, "color": "#7FA6C4"}, {"d": 0.018, "h": 1, "k": "box", "w": 0.018, "x": 0.215, "y": 0.21000000000000002, "z": 0.254, "color": "#7FA6C4"}, {"d": 0.4, "h": 0.9, "k": "box", "w": 0.4, "y": 1.21, "color": "#5E86A8", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.95, "from": 0.08, "glow": 0.4, "color": "#7FA6C4"}}, {"d": 0.3, "h": 0.85, "k": "box", "w": 0.3, "y": 2.11, "color": "#5E86A8", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.95, "from": 0.08, "glow": 0.4, "color": "#7FA6C4"}}, {"h": 0.5, "k": "cyl", "y": 2.96, "rb": 0.16, "rt": 0.05, "seg": 12, "color": "#7FA6C4"}, {"k": "roof", "w": 0.2, "y": 3.46, "type": "cone", "color": "#7FA6C4", "height": 0.24}, {"h": 0.3, "k": "antenna", "y": 3.67}, {"d": 0.52, "h": 0.05, "k": "box", "w": 0.52, "y": 1.1600000000000001, "color": "#EFEAE0"}, {"d": 0.5, "k": "storefront", "w": 0.5, "sign": "#EFEAE0", "faceH": 0.3, "awning": "#5E86A8"}]	\N	55	2026-08-03 01:12:42.149417	2026-08-03 01:12:42.149417
57	seoul_namsan_tower	남산 전망타워	SEOUL	NORMAL	300	f	0.638	0.707	3.465	[{"d": 0.56, "k": "plinth", "w": 0.56, "color": "grass"}, {"d": 0.46, "h": 0.34, "k": "box", "w": 0.46, "y": 0.07, "color": "#B7AE9E", "rough": 0.9}, {"d": 0.36, "h": 0.22, "k": "box", "w": 0.36, "y": 0.41000000000000003, "color": "#C9C2B6", "rough": 0.9}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.24, "y": 0.07, "z": 0.36, "color": "#C9C2B6"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.19999999999999998, "y": 0.098, "z": 0.32, "color": "#C9C2B6"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.15999999999999998, "y": 0.126, "z": 0.27999999999999997, "color": "#C9C2B6"}, {"h": 1.5, "k": "cyl", "y": 0.6300000000000001, "rb": 0.13, "rt": 0.09, "seg": 12, "color": "concrete"}, {"h": 0.04, "k": "cyl", "y": 1.27, "rb": 0.15, "rt": 0.15, "seg": 12, "color": "#B83227", "detail": true}, {"d": 0.36, "h": 0.3, "k": "box", "w": 0.36, "y": 2.13, "color": "#EFEAE0", "rough": 0.4, "windows": {"to": 0.8, "from": 0.2, "glow": 0.45, "color": "#7FA6C4"}}, {"h": 0.16, "k": "cyl", "y": 2.4299999999999997, "rb": 0.2, "rt": 0.12, "seg": 12, "color": "#C9C2B6"}, {"h": 0.5, "k": "cyl", "y": 2.59, "rb": 0.05, "rt": 0.02, "seg": 8, "color": "concrete", "detail": true}, {"h": 0.35, "k": "antenna", "y": 3.09}, {"h": 0.05, "k": "panel", "w": 0.3, "pos": [0, 2.27, 0.188], "glow": 0.4, "color": "#B83227"}]	\N	56	2026-08-03 01:12:42.150641	2026-08-03 01:12:42.150641
58	seoul_hangang_bridge	한강 대교탑	SEOUL	NORMAL	300	f	0.730	0.479	2.250	[{"d": 0.42, "k": "plinth", "w": 0.64, "color": "concrete"}, {"d": 0.34, "h": 0.16, "k": "box", "w": 0.64, "y": 0.07, "color": "concrete", "rough": 0.7}, {"d": 0.12, "h": 2, "k": "box", "w": 0.1, "x": -0.18, "y": 0.23, "color": "#EFEAE0", "rough": 0.5}, {"d": 0.12, "h": 2, "k": "box", "w": 0.1, "x": 0.18, "y": 0.23, "color": "#EFEAE0", "rough": 0.5}, {"d": 0.09, "h": 0.09, "k": "box", "w": 0.36, "y": 1.27, "color": "#EFEAE0", "rough": 0.5}, {"d": 0.09, "h": 0.09, "k": "box", "w": 0.36, "y": 1.97, "color": "#EFEAE0", "rough": 0.5}, {"h": 1, "k": "panel", "w": 0.02, "pos": [-0.32, 0.77, 0.02], "color": "#8A8A8A"}, {"h": 0.8, "k": "panel", "w": 0.02, "pos": [-0.28, 0.6699999999999999, 0.02], "color": "#8A8A8A"}, {"h": 1, "k": "panel", "w": 0.02, "pos": [0.32, 0.77, 0.02], "color": "#8A8A8A"}, {"h": 0.8, "k": "panel", "w": 0.02, "pos": [0.28, 0.6699999999999999, 0.02], "color": "#8A8A8A"}, {"d": 0.02, "h": 0.02, "k": "box", "w": 0.02, "x": -0.18, "y": 2.23, "color": "#B83227", "detail": true, "emissive": true}, {"d": 0.02, "h": 0.02, "k": "box", "w": 0.02, "x": 0.18, "y": 2.23, "color": "#B83227", "detail": true, "emissive": true}]	\N	57	2026-08-03 01:12:42.151798	2026-08-03 01:12:42.151798
59	seoul_gangnam_office	강남 오피스타워	SEOUL	NORMAL	300	f	0.502	0.534	2.655	[{"d": 0.4, "k": "plinth", "w": 0.44, "color": "roofDark"}, {"d": 0.4, "h": 0.16, "k": "box", "w": 0.44, "y": 0.07, "color": "#B7AE9E", "rough": 0.7}, {"d": 0.4, "h": 2, "k": "box", "w": 0.44, "y": 0.23, "color": "#5E86A8", "metal": 0.6, "rough": 0.22, "windows": {"to": 0.96, "from": 0.06, "glow": 0.42, "color": "#7FA6C4"}}, {"d": 0.016, "h": 2, "k": "box", "w": 0.016, "x": -0.1892, "y": 0.23, "z": 0.20400000000000001, "color": "#4A6E8A"}, {"d": 0.016, "h": 2, "k": "box", "w": 0.016, "x": -0.12613333333333335, "y": 0.23, "z": 0.20400000000000001, "color": "#4A6E8A"}, {"d": 0.016, "h": 2, "k": "box", "w": 0.016, "x": -0.06306666666666667, "y": 0.23, "z": 0.20400000000000001, "color": "#4A6E8A"}, {"d": 0.016, "h": 2, "k": "box", "w": 0.016, "x": 0, "y": 0.23, "z": 0.20400000000000001, "color": "#4A6E8A"}, {"d": 0.016, "h": 2, "k": "box", "w": 0.016, "x": 0.06306666666666666, "y": 0.23, "z": 0.20400000000000001, "color": "#4A6E8A"}, {"d": 0.016, "h": 2, "k": "box", "w": 0.016, "x": 0.12613333333333335, "y": 0.23, "z": 0.20400000000000001, "color": "#4A6E8A"}, {"d": 0.016, "h": 2, "k": "box", "w": 0.016, "x": 0.1892, "y": 0.23, "z": 0.20400000000000001, "color": "#4A6E8A"}, {"d": 0.41400000000000003, "h": 0.028, "k": "box", "w": 0.454, "y": 0.9299999999999999, "color": "#DCD6C8"}, {"d": 0.41400000000000003, "h": 0.028, "k": "box", "w": 0.454, "y": 1.6300000000000001, "color": "#DCD6C8"}, {"d": 0.42, "h": 0.05, "k": "box", "w": 0.46, "y": 2.23, "color": "#EFEAE0"}, {"d": 0.4, "k": "parapet", "w": 0.44, "y": 2.23, "color": "roofDark"}, {"k": "rooftopUnits", "w": 0.44, "y": 2.23}, {"h": 0.4, "k": "antenna", "y": 2.23}, {"d": 0.4, "k": "storefront", "w": 0.44, "sign": "#7FA6C4", "faceH": 0.3, "awning": "roofDark"}]	\N	58	2026-08-03 01:12:42.152874	2026-08-03 01:12:42.152874
60	seoul_finance_tower	파이낸스 타워	SEOUL	NORMAL	300	f	0.593	0.650	2.895	[{"d": 0.46, "k": "plinth", "w": 0.52, "color": "roofDark"}, {"d": 0.46, "h": 1.2, "k": "box", "w": 0.52, "y": 0.07, "color": "#3E4650", "metal": 0.55, "rough": 0.3, "windows": {"to": 0.92, "from": 0.1, "glow": 0.4, "color": "#7FA6C4"}}, {"d": 0.48, "h": 0.05, "k": "box", "w": 0.54, "y": 1.27, "color": "#C9C2B6"}, {"d": 0.36, "h": 0.7, "k": "box", "w": 0.4, "y": 1.32, "z": -0.04, "color": "#3E4650", "metal": 0.55, "rough": 0.3, "windows": {"to": 0.92, "from": 0.1, "glow": 0.4, "color": "#7FA6C4"}}, {"d": 0.38, "h": 0.05, "k": "box", "w": 0.42, "y": 2.02, "color": "#C9C2B6"}, {"d": 0.24, "h": 0.4, "k": "box", "w": 0.26, "y": 2.07, "z": -0.06, "color": "#3E4650", "metal": 0.55, "rough": 0.3}, {"d": 0.26, "h": 0.06, "k": "box", "w": 0.28, "y": 2.4699999999999998, "z": -0.06, "color": "roofDark"}, {"h": 0.4, "k": "antenna", "y": 2.4699999999999998}, {"d": 0.46, "h": 0.36, "k": "columns", "w": 0.52, "y": 0.07, "color": "#C9C2B6", "count": 4}, {"h": 0.1, "k": "panel", "w": 0.3, "pos": [0, 0.5700000000000001, 0.23800000000000002], "glow": 0.3, "color": "#7FA6C4"}]	\N	59	2026-08-03 01:12:42.154063	2026-08-03 01:12:42.154063
61	seoul_apartment	대단지 아파트	SEOUL	NORMAL	300	f	0.775	0.486	2.270	[{"d": 0.32, "k": "plinth", "w": 0.68, "color": "concrete"}, {"d": 0.32, "h": 2, "k": "box", "w": 0.68, "y": 0.07, "color": "#EFEAE0", "rough": 0.7, "windows": {"to": 0.96, "from": 0.06, "glow": 0.28, "color": "#7FA6C4"}}, {"d": 0.32, "k": "balconies", "w": 0.68, "y0": 0.23, "y1": 1.97, "color": "#DCD6C8", "floors": 11}, {"d": 0.34, "h": 2, "k": "box", "w": 0.08, "x": -0.22, "y": 0.07, "color": "#B7AE9E", "rough": 0.7}, {"d": 0.34, "h": 2, "k": "box", "w": 0.08, "x": 0.22, "y": 0.07, "color": "#B7AE9E", "rough": 0.7}, {"d": 0.34, "h": 0.05, "k": "box", "w": 0.7, "y": 2.07, "color": "#C9C2B6"}, {"d": 0.32, "k": "parapet", "w": 0.68, "y": 2.07, "color": "#EFEAE0"}, {"k": "rooftopUnits", "w": 0.68, "y": 2.07}, {"d": 0.14, "h": 0.2, "k": "box", "w": 0.14, "x": -0.18, "y": 2.07, "color": "concrete", "detail": true}, {"h": 0.2, "k": "panel", "w": 0.14, "pos": [0, 1.77, 0.17800000000000002], "glow": 0.25, "color": "#B83227"}]	\N	60	2026-08-03 01:12:42.155281	2026-08-03 01:12:42.155281
62	seoul_officetel	오피스텔	SEOUL	NORMAL	300	f	0.570	0.612	2.295	[{"d": 0.46, "k": "plinth", "w": 0.5, "color": "concrete"}, {"d": 0.28, "h": 1.7, "k": "box", "w": 0.44, "y": 0.07, "z": -0.09, "color": "#C8CDD2", "metal": 0.4, "rough": 0.4, "windows": {"to": 0.94, "from": 0.08, "glow": 0.32, "color": "#7FA6C4"}}, {"d": 0.44, "h": 1.9, "k": "box", "w": 0.22, "x": 0.14, "y": 0.07, "color": "#5E86A8", "metal": 0.55, "rough": 0.25, "windows": {"to": 0.95, "from": 0.08, "glow": 0.42, "color": "#7FA6C4"}}, {"d": 0.016, "h": 1.9, "k": "box", "w": 0.016, "x": 0.04, "y": 0.07, "z": 0.22, "color": "#4A6E8A"}, {"d": 0.016, "h": 1.9, "k": "box", "w": 0.016, "x": 0.24, "y": 0.07, "z": 0.22, "color": "#4A6E8A"}, {"d": 0.46, "h": 0.05, "k": "box", "w": 0.24, "x": 0.14, "y": 1.97, "color": "#EFEAE0"}, {"d": 0.3, "h": 0.05, "k": "box", "w": 0.46, "y": 1.77, "z": -0.09, "color": "roofDark"}, {"k": "rooftopUnits", "w": 0.4, "y": 1.97}, {"h": 0.3, "k": "antenna", "y": 1.97}, {"d": 0.46, "k": "storefront", "w": 0.5, "sign": "#7FA6C4", "faceH": 0.3, "awning": "roofDark"}]	\N	61	2026-08-03 01:12:42.156411	2026-08-03 01:12:42.156411
63	seoul_palace_hall	고궁 정전	SEOUL	NORMAL	300	f	0.928	0.928	1.380	[{"d": 0.58, "k": "plinth", "w": 0.74, "color": "#C9C2B6"}, {"d": 0.52, "h": 0.16, "k": "box", "w": 0.68, "y": 0.07, "color": "#B7AE9E", "rough": 0.9}, {"d": 0.46, "h": 0.14, "k": "box", "w": 0.6, "y": 0.23, "color": "#C9C2B6", "rough": 0.9}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.34, "y": 0.07, "z": 0.43000000000000005, "color": "#C9C2B6"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.30000000000000004, "y": 0.098, "z": 0.39, "color": "#C9C2B6"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.26, "y": 0.126, "z": 0.35000000000000003, "color": "#C9C2B6"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.22000000000000003, "y": 0.15400000000000003, "z": 0.31, "color": "#C9C2B6"}, {"d": 0.42, "h": 0.5, "k": "box", "w": 0.54, "y": 0.37, "color": "#EFEAE0", "rough": 0.7}, {"d": 0.42, "h": 0.5, "k": "columns", "w": 0.54, "y": 0.37, "color": "#B83227", "count": 7}, {"d": 0.62, "k": "roof", "w": 0.8, "y": 0.8700000000000001, "type": "pyramid", "color": "#3B4048", "height": 0.14}, {"d": 0.38, "h": 0.14, "k": "box", "w": 0.5, "y": 1.01, "color": "#EFEAE0", "rough": 0.7}, {"d": 0.48, "k": "roof", "w": 0.62, "y": 1.1500000000000001, "type": "pyramid", "color": "#3B4048", "height": 0.2}, {"d": 0.02, "h": 0.07, "k": "box", "w": 0.06, "x": -0.26, "y": 1.1500000000000001, "color": "#3B4048", "detail": true}, {"d": 0.02, "h": 0.07, "k": "box", "w": 0.06, "x": 0.26, "y": 1.1500000000000001, "color": "#3B4048", "detail": true}, {"h": 0.1, "k": "panel", "w": 0.26, "pos": [0, 0.73, 0.228], "glow": 0.2, "color": "#2E6E4B"}]	\N	62	2026-08-03 01:12:42.157554	2026-08-03 01:12:42.157554
64	seoul_gwanghwamun_gate	광화문 게이트	SEOUL	NORMAL	300	f	0.905	0.905	1.370	[{"d": 0.42, "k": "plinth", "w": 0.74, "color": "#B7AE9E"}, {"d": 0.38, "h": 0.62, "k": "box", "w": 0.7, "y": 0.07, "color": "#C9C2B6", "rough": 0.88}, {"h": 0.4, "k": "panel", "w": 0.14, "pos": [-0.2, 0.27, 0.196], "color": "#20242A"}, {"h": 0.44, "k": "panel", "w": 0.16, "pos": [0, 0.29000000000000004, 0.196], "color": "#20242A"}, {"h": 0.4, "k": "panel", "w": 0.14, "pos": [0.2, 0.27, 0.196], "color": "#20242A"}, {"d": 0.4, "h": 0.05, "k": "box", "w": 0.72, "y": 0.69, "color": "#B7AE9E"}, {"d": 0.32, "h": 0.34, "k": "box", "w": 0.6, "y": 0.74, "color": "#EFEAE0", "rough": 0.7}, {"d": 0.32, "h": 0.34, "k": "columns", "w": 0.6, "y": 0.74, "color": "#B83227", "count": 8}, {"d": 0.46, "k": "roof", "w": 0.78, "y": 1.08, "type": "pyramid", "color": "#3B4048", "height": 0.22}, {"d": 0.02, "h": 0.07, "k": "box", "w": 0.06, "x": -0.28, "y": 1.3, "color": "#3B4048", "detail": true}, {"d": 0.02, "h": 0.07, "k": "box", "w": 0.06, "x": 0.28, "y": 1.3, "color": "#3B4048", "detail": true}, {"h": 0.08, "k": "panel", "w": 0.24, "pos": [0, 0.9299999999999999, 0.17800000000000002], "glow": 0.2, "color": "#2E6E4B"}]	\N	63	2026-08-03 01:12:42.159103	2026-08-03 01:12:42.159103
65	seoul_cityhall	서울 시청	SEOUL	NORMAL	300	f	0.730	0.748	1.870	[{"d": 0.5, "k": "plinth", "w": 0.64, "color": "concrete"}, {"d": 0.28, "h": 1.6, "k": "box", "w": 0.56, "y": 0.07, "z": -0.12, "color": "#5E86A8", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.94, "from": 0.08, "glow": 0.42, "color": "#7FA6C4"}}, {"d": 0.3, "h": 0.2, "k": "box", "w": 0.5, "y": 1.6700000000000002, "z": -0.16, "color": "#7FA6C4", "metal": 0.6, "rough": 0.2}, {"d": 0.016, "h": 1.6, "k": "box", "w": 0.016, "x": -0.2, "y": 0.07, "z": 0.02, "color": "#DCD6C8"}, {"d": 0.016, "h": 1.6, "k": "box", "w": 0.016, "x": 0, "y": 0.07, "z": 0.02, "color": "#DCD6C8"}, {"d": 0.016, "h": 1.6, "k": "box", "w": 0.016, "x": 0.2, "y": 0.07, "z": 0.02, "color": "#DCD6C8"}, {"d": 0.32, "h": 0.6, "k": "box", "w": 0.5, "y": 0.07, "z": 0.12, "color": "#EFEAE0", "rough": 0.7, "windows": {"to": 0.8, "from": 0.2, "glow": 0.26, "color": "#7FA6C4"}}, {"d": 0.32, "h": 0.6, "k": "columns", "w": 0.5, "y": 0.07, "color": "#B7AE9E", "count": 6}, {"d": 0.18, "h": 0.34, "k": "box", "w": 0.18, "y": 0.6699999999999999, "z": 0.12, "color": "#EFEAE0", "rough": 0.7}, {"k": "clock", "w": 0.18, "y": 0.8899999999999999, "color": "#B83227"}, {"k": "roof", "w": 0.24, "y": 1.01, "type": "pyramid", "color": "#3B4048", "height": 0.14}, {"h": 0.08, "k": "panel", "w": 0.3, "pos": [0, 0.55, 0.28800000000000003], "glow": 0.2, "color": "#2E6E4B"}]	\N	64	2026-08-03 01:12:42.160584	2026-08-03 01:12:42.160584
66	seoul_museum	국립박물관	SEOUL	NORMAL	300	f	0.844	0.723	1.470	[{"d": 0.5, "k": "plinth", "w": 0.74, "color": "#C9C2B6"}, {"d": 0.5, "h": 0.8, "k": "box", "w": 0.74, "y": 0.07, "color": "#B7AE9E", "rough": 0.7, "windows": {"to": 0.78, "from": 0.3, "glow": 0.28, "color": "#7FA6C4"}}, {"d": 0.5, "h": 0.5, "k": "box", "w": 0.26, "x": -0.24, "y": 0.8700000000000001, "color": "#B7AE9E", "rough": 0.7}, {"d": 0.5, "h": 0.5, "k": "box", "w": 0.26, "x": 0.24, "y": 0.8700000000000001, "color": "#B7AE9E", "rough": 0.7}, {"d": 0.5, "h": 0.34, "k": "box", "w": 0.16, "y": 0.8700000000000001, "color": "#C9C2B6", "rough": 0.7}, {"d": 0.52, "h": 0.1, "k": "box", "w": 0.76, "y": 1.37, "color": "#C9C2B6"}, {"d": 0.5, "h": 0.7, "k": "columns", "w": 0.74, "y": 0.07, "color": "#C9C2B6", "count": 9}, {"d": 0.07, "h": 0.05, "k": "box", "w": 0.6956, "y": 0.8, "z": 0.28, "color": "#EFEAE0"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.4, "y": 0.07, "z": 0.37, "color": "#C9C2B6"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.36000000000000004, "y": 0.098, "z": 0.33, "color": "#C9C2B6"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.32, "y": 0.126, "z": 0.29, "color": "#C9C2B6"}, {"h": 0.1, "k": "panel", "w": 0.34, "pos": [0, 0.69, 0.268], "glow": 0.2, "color": "#2E6E4B"}]	\N	65	2026-08-03 01:12:42.161831	2026-08-03 01:12:42.161831
67	seoul_hanok_hotel	한옥 호텔	SEOUL	NORMAL	300	f	0.789	0.789	1.720	[{"d": 0.46, "k": "plinth", "w": 0.6, "color": "#C9C2B6"}, {"d": 0.46, "h": 0.8, "k": "box", "w": 0.6, "y": 0.07, "color": "#D8D2C6", "rough": 0.5, "windows": {"to": 0.88, "from": 0.12, "glow": 0.3, "color": "#7FA6C4"}}, {"d": 0.51, "h": 0.05, "k": "box", "w": 0.65, "y": 0.8700000000000001, "color": "#6E4B2A"}, {"d": 0.54, "k": "roof", "w": 0.68, "y": 0.9199999999999999, "type": "pyramid", "color": "#3B4048", "height": 0.1}, {"d": 0.36, "h": 0.44, "k": "box", "w": 0.46, "y": 1.02, "color": "#EFEAE0", "rough": 0.7, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#7FA6C4"}}, {"d": 0.36, "h": 0.44, "k": "columns", "w": 0.46, "y": 1.02, "color": "#6E4B2A", "count": 5}, {"d": 0.48, "k": "roof", "w": 0.6, "y": 1.46, "type": "pyramid", "color": "#3B4048", "height": 0.2}, {"d": 0.02, "h": 0.06, "k": "box", "w": 0.05, "x": -0.2, "y": 1.6600000000000001, "color": "#3B4048", "detail": true}, {"d": 0.02, "h": 0.06, "k": "box", "w": 0.05, "x": 0.2, "y": 1.6600000000000001, "color": "#3B4048", "detail": true}, {"d": 0.46, "k": "storefront", "w": 0.6, "sign": "#2E6E4B", "faceH": 0.4, "awning": "#6E4B2A"}, {"h": 0.08, "k": "panel", "w": 0.3, "pos": [0, 1.1700000000000002, 0.20800000000000002], "glow": 0.2, "color": "#2E6E4B"}]	\N	66	2026-08-03 01:12:42.162914	2026-08-03 01:12:42.162914
68	seoul_hanok_mansion	한옥 대저택	SEOUL	NORMAL	300	f	0.821	0.724	1.370	[{"d": 0.56, "k": "plinth", "w": 0.72, "color": "#C9C2B6"}, {"d": 0.26, "h": 0.5, "k": "box", "w": 0.5, "y": 0.17, "z": -0.13, "color": "#EFEAE0", "rough": 0.75, "windows": {"to": 0.8, "from": 0.2, "glow": 0, "color": "#3A2A1A"}}, {"d": 0.03, "h": 0.5, "k": "box", "w": 0.03, "x": -0.2, "y": 0.17, "z": 0, "color": "#6E4B2A"}, {"d": 0.03, "h": 0.5, "k": "box", "w": 0.03, "x": 0.2, "y": 0.17, "z": 0, "color": "#6E4B2A"}, {"d": 0.3, "h": 0.06, "k": "box", "w": 0.54, "y": 0.6699999999999999, "z": -0.13, "color": "#3B4048"}, {"d": 0.26, "h": 0.44, "k": "box", "w": 0.34, "y": 0.73, "z": -0.11, "color": "#EFEAE0", "rough": 0.75, "windows": {"to": 0.8, "from": 0.2, "glow": 0.24, "color": "#7FA6C4"}}, {"d": 0.34, "h": 0.14, "k": "box", "w": 0.46, "y": 1.1700000000000002, "z": -0.11, "color": "#3B4048"}, {"d": 0.02, "h": 0.06, "k": "box", "w": 0.05, "x": -0.2, "y": 1.31, "z": -0.11, "color": "#3B4048", "detail": true}, {"d": 0.02, "h": 0.06, "k": "box", "w": 0.05, "x": 0.2, "y": 1.31, "z": -0.11, "color": "#3B4048", "detail": true}, {"d": 0.34, "k": "roof", "w": 0.6, "y": 0.6699999999999999, "type": "pyramid", "color": "#3B4048", "height": 0.12}, {"d": 0.4, "h": 0.42, "k": "box", "w": 0.22, "x": -0.26, "y": 0.13, "color": "#EFEAE0", "rough": 0.75}, {"d": 0.48, "h": 0.06, "k": "box", "w": 0.3, "x": -0.26, "y": 0.55, "color": "#3B4048"}, {"d": 0.4, "h": 0.42, "k": "box", "w": 0.22, "x": 0.26, "y": 0.13, "color": "#EFEAE0", "rough": 0.75}, {"d": 0.48, "h": 0.06, "k": "box", "w": 0.3, "x": 0.26, "y": 0.55, "color": "#3B4048"}, {"d": 0.14, "h": 0.4, "k": "box", "w": 0.16, "y": 0.07, "z": 0.24, "color": "#6E4B2A", "rough": 0.8}, {"d": 0.2, "h": 0.06, "k": "box", "w": 0.22, "y": 0.47000000000000003, "z": 0.24, "color": "#3B4048"}, {"d": 0.12, "h": 0.05, "k": "box", "w": 0.14, "y": 0.53, "z": 0.24, "color": "#3B4048"}, {"h": 0.24, "k": "panel", "w": 0.1, "pos": [0, 0.19, 0.326], "color": "#3A2A1A"}]	\N	67	2026-08-03 01:12:42.164043	2026-08-03 01:12:42.164043
69	seoul_stone_pagoda	석탑 (원각사)	SEOUL	NORMAL	300	f	0.570	0.570	2.080	[{"d": 0.5, "k": "plinth", "w": 0.5, "color": "#C9C2B6"}, {"d": 0.46, "h": 0.2, "k": "box", "w": 0.46, "y": 0.07, "color": "#B7AE9E", "rough": 0.95}, {"d": 0.4, "h": 0.12, "k": "box", "w": 0.4, "y": 0.27, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.34, "h": 0.26, "k": "box", "w": 0.34, "y": 0.39, "color": "#C9C2B6", "rough": 0.95}, {"k": "roof", "w": 0.46, "y": 0.6499999999999999, "type": "pyramid", "color": "#B7AE9E", "height": 0.09}, {"d": 0.3, "h": 0.24, "k": "box", "w": 0.3, "y": 0.74, "color": "#C9C2B6", "rough": 0.95}, {"k": "roof", "w": 0.4, "y": 0.98, "type": "pyramid", "color": "#B7AE9E", "height": 0.08}, {"d": 0.26, "h": 0.22, "k": "box", "w": 0.26, "y": 1.06, "color": "#C9C2B6", "rough": 0.95}, {"k": "roof", "w": 0.34, "y": 1.28, "type": "pyramid", "color": "#B7AE9E", "height": 0.08}, {"d": 0.2, "h": 0.2, "k": "box", "w": 0.2, "y": 1.36, "color": "#C9C2B6", "rough": 0.95}, {"k": "roof", "w": 0.28, "y": 1.56, "type": "pyramid", "color": "#B7AE9E", "height": 0.08}, {"d": 0.14, "h": 0.18, "k": "box", "w": 0.14, "y": 1.6400000000000001, "color": "#C9C2B6", "rough": 0.95}, {"k": "roof", "w": 0.22, "y": 1.82, "type": "pyramid", "color": "#B7AE9E", "height": 0.12}, {"d": 0.04, "h": 0.14, "k": "box", "w": 0.04, "y": 1.9400000000000002, "color": "#9A8A5A", "detail": true}, {"h": 0.12, "k": "panel", "w": 0.16, "pos": [0, 0.51, 0.17600000000000002], "color": "#3A342A"}]	\N	68	2026-08-03 01:12:42.165258	2026-08-03 01:12:42.165258
70	seoul_dept_store	백화점	SEOUL	NORMAL	300	f	0.752	0.814	1.570	[{"d": 0.52, "k": "plinth", "w": 0.66, "color": "concrete"}, {"d": 0.52, "h": 1.3, "k": "box", "w": 0.66, "y": 0.07, "color": "#D8D2C6", "rough": 0.5, "windows": {"to": 0.9, "from": 0.12, "glow": 0.32, "color": "#7FA6C4"}}, {"d": 0.02, "h": 1.3, "k": "box", "w": 0.02, "x": -0.2838, "y": 0.07, "z": 0.264, "color": "#EFEAE0"}, {"d": 0.02, "h": 1.3, "k": "box", "w": 0.02, "x": -0.2027142857142857, "y": 0.07, "z": 0.264, "color": "#EFEAE0"}, {"d": 0.02, "h": 1.3, "k": "box", "w": 0.02, "x": -0.12162857142857143, "y": 0.07, "z": 0.264, "color": "#EFEAE0"}, {"d": 0.02, "h": 1.3, "k": "box", "w": 0.02, "x": -0.04054285714285716, "y": 0.07, "z": 0.264, "color": "#EFEAE0"}, {"d": 0.02, "h": 1.3, "k": "box", "w": 0.02, "x": 0.040542857142857124, "y": 0.07, "z": 0.264, "color": "#EFEAE0"}, {"d": 0.02, "h": 1.3, "k": "box", "w": 0.02, "x": 0.12162857142857143, "y": 0.07, "z": 0.264, "color": "#EFEAE0"}, {"d": 0.02, "h": 1.3, "k": "box", "w": 0.02, "x": 0.20271428571428568, "y": 0.07, "z": 0.264, "color": "#EFEAE0"}, {"d": 0.02, "h": 1.3, "k": "box", "w": 0.02, "x": 0.2838, "y": 0.07, "z": 0.264, "color": "#EFEAE0"}, {"d": 0.534, "h": 0.028, "k": "box", "w": 0.674, "y": 0.5700000000000001, "color": "#B83227"}, {"d": 0.534, "h": 0.028, "k": "box", "w": 0.674, "y": 0.97, "color": "#B83227"}, {"d": 0.54, "h": 0.06, "k": "box", "w": 0.68, "y": 1.37, "color": "#EFEAE0"}, {"d": 0.52, "k": "parapet", "w": 0.66, "y": 1.4300000000000002, "color": "#D8D2C6"}, {"k": "rooftopUnits", "w": 0.66, "y": 1.4300000000000002}, {"d": 0.52, "k": "storefront", "w": 0.66, "sign": "#7FA6C4", "faceH": 0.42, "awning": "#B83227"}, {"h": 1, "k": "panel", "w": 0.08, "pos": [0.336, 0.77, 0], "glow": 0.35, "rotY": 1.5708, "color": "#7FA6C4"}, {"h": 0.1, "k": "panel", "w": 0.5, "pos": [0, 1.27, 0.268], "glow": 0.3, "color": "#B83227"}]	\N	69	2026-08-03 01:12:42.166428	2026-08-03 01:12:42.166428
71	seoul_villa	다세대 빌라	SEOUL	NORMAL	300	f	0.603	0.603	1.640	[{"d": 0.44, "k": "plinth", "w": 0.5, "color": "concrete"}, {"d": 0.44, "h": 0.44, "k": "box", "w": 0.5, "y": 0.07, "color": "#D9C7A8", "rough": 0.7, "windows": {"to": 0.82, "from": 0.2, "glow": 0.28, "color": "#7FA6C4"}}, {"d": 0.42, "h": 0.4, "k": "box", "w": 0.48, "y": 0.51, "color": "#E0CFB2", "rough": 0.7, "windows": {"to": 0.85, "from": 0.15, "glow": 0.28, "color": "#7FA6C4"}}, {"d": 0.4, "h": 0.4, "k": "box", "w": 0.46, "y": 0.9099999999999999, "color": "#D9C7A8", "rough": 0.7, "windows": {"to": 0.85, "from": 0.15, "glow": 0.28, "color": "#7FA6C4"}}, {"d": 0.38, "h": 0.18, "k": "box", "w": 0.42, "y": 1.31, "color": "#C08A50", "rough": 0.7}, {"d": 0.48, "k": "roof", "w": 0.52, "y": 1.49, "type": "pyramid", "color": "#B83227", "height": 0.12}, {"d": 0.44, "k": "balconies", "w": 0.5, "y0": 0.37, "y1": 1.1700000000000002, "color": "concrete", "floors": 3}, {"d": 0.022, "h": 1.24, "k": "box", "w": 0.022, "x": -0.25, "y": 0.07, "z": -0.22, "color": "#B8A078"}, {"d": 0.022, "h": 1.24, "k": "box", "w": 0.022, "x": 0.25, "y": 0.07, "z": -0.22, "color": "#B8A078"}, {"d": 0.022, "h": 1.24, "k": "box", "w": 0.022, "x": -0.25, "y": 0.07, "z": 0.22, "color": "#B8A078"}, {"d": 0.022, "h": 1.24, "k": "box", "w": 0.022, "x": 0.25, "y": 0.07, "z": 0.22, "color": "#B8A078"}, {"h": 0.22, "k": "panel", "w": 0.12, "pos": [0, 0.2, 0.23600000000000002], "color": "#6E4B2A"}]	\N	70	2026-08-03 01:12:42.167666	2026-08-03 01:12:42.167666
72	seoul_market_arcade	전통시장 상가	SEOUL	NORMAL	300	f	0.918	0.927	1.190	[{"d": 0.42, "k": "plinth", "w": 0.68, "color": "path"}, {"d": 0.42, "h": 0.5, "k": "box", "w": 0.22, "x": -0.23, "y": 0.07, "color": "#C8B48E", "rough": 0.75}, {"d": 0.42, "h": 0.54, "k": "box", "w": 0.22, "x": 0, "y": 0.07, "color": "#B8A078", "rough": 0.75}, {"d": 0.42, "h": 0.48, "k": "box", "w": 0.22, "x": 0.23, "y": 0.07, "color": "#C8B48E", "rough": 0.75}, {"d": 0.42, "k": "storefront", "w": 0.68, "sign": "#E0C070", "faceH": 0.3, "awning": "#B83227"}, {"d": 0.4, "h": 0.44, "k": "box", "w": 0.66, "y": 0.6300000000000001, "color": "#D8CBA8", "rough": 0.75, "windows": {"to": 0.8, "from": 0.2, "glow": 0.28, "color": "#7FA6C4"}}, {"d": 0.46, "k": "roof", "w": 0.74, "y": 1.07, "type": "round", "color": "#8AA0B0"}, {"h": 0.1, "k": "panel", "w": 0.12, "pos": [-0.24, 0.49, 0.228], "glow": 0.25, "color": "#B83227"}, {"h": 0.1, "k": "panel", "w": 0.12, "pos": [0, 0.49, 0.228], "glow": 0.25, "color": "#2E6E4B"}, {"h": 0.1, "k": "panel", "w": 0.12, "pos": [0.24, 0.49, 0.228], "glow": 0.3, "color": "#E0C070"}, {"h": 0.09, "k": "panel", "w": 0.5, "pos": [0, 0.9299999999999999, 0.218], "glow": 0.28, "color": "#E0C070"}]	\N	71	2026-08-03 01:12:42.16882	2026-08-03 01:12:42.16882
79	west_church	서부 교회	WEST	NORMAL	300	f	0.742	0.742	1.873	[{"d": 0.58, "k": "plinth", "w": 0.46, "color": "path"}, {"d": 0.58, "h": 0.9, "k": "box", "w": 0.46, "y": 0.07, "color": "#E4D8BE", "rough": 0.8, "windows": {"to": 0.75, "from": 0.2, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.64, "k": "roof", "w": 0.52, "y": 0.97, "type": "pyramid", "color": "#8B3A2F", "height": 0.24}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.1978, "y": 0.07, "z": 0.294, "color": "#7A4E30"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.06593333333333334, "y": 0.07, "z": 0.294, "color": "#7A4E30"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.06593333333333332, "y": 0.07, "z": 0.294, "color": "#7A4E30"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.1978, "y": 0.07, "z": 0.294, "color": "#7A4E30"}, {"d": 0.24, "h": 1.2, "k": "box", "w": 0.24, "y": 0.07, "z": 0.24, "color": "#E4D8BE", "rough": 0.8, "windows": {"to": 0.6, "from": 0.4, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.2, "h": 0.14, "k": "box", "w": 0.2, "y": 1.27, "z": 0.24, "color": "#8B3A2F"}, {"d": 0.14, "h": 0.16, "k": "box", "w": 0.14, "y": 1.4100000000000001, "z": 0.24, "color": "#8B3A2F"}, {"d": 0.07, "h": 0.2, "k": "box", "w": 0.07, "y": 1.57, "z": 0.24, "color": "#8B3A2F"}, {"k": "cross", "s": 0.5, "y": 1.83, "z": 0.24, "color": "#E4D8BE"}, {"h": 0.3, "k": "panel", "w": 0.14, "pos": [0, 0.25, 0.296], "color": "#7A4E30"}, {"h": 0.14, "k": "panel", "w": 0.14, "pos": [0, 0.69, 0.246], "glow": 0.2, "color": "#9AB0C0"}]	\N	78	2026-08-03 01:12:42.176754	2026-08-03 01:12:42.176754
73	seoul_street_cafe	카페거리 건물	SEOUL	NORMAL	300	f	0.531	0.534	1.590	[{"d": 0.4, "k": "plinth", "w": 0.44, "color": "path"}, {"d": 0.4, "h": 1.2, "k": "box", "w": 0.44, "y": 0.07, "color": "#5A4636", "rough": 0.6, "windows": {"to": 0.9, "from": 0.12, "glow": 0.3, "color": "#7FA6C4"}}, {"h": 1.2, "k": "cyl", "y": 0.07, "rb": 0.14, "rt": 0.14, "seg": 12, "color": "#5E86A8"}, {"k": "roof", "w": 0.24, "y": 1.27, "type": "cone", "color": "#4A3828", "height": 0.14}, {"d": 0.41400000000000003, "h": 0.028, "k": "box", "w": 0.454, "y": 0.49, "color": "#E0C070"}, {"d": 0.41400000000000003, "h": 0.028, "k": "box", "w": 0.454, "y": 0.8899999999999999, "color": "#E0C070"}, {"d": 0.4, "k": "parapet", "w": 0.44, "y": 1.27, "color": "#5A4636"}, {"d": 0.4, "k": "storefront", "w": 0.44, "sign": "#E0C070", "faceH": 0.34, "awning": "#2E4636"}, {"k": "parasol", "pos": [0.14, 1.27, 0.12], "color": "#2E6E4B"}, {"h": 0.5, "k": "panel", "w": 0.1, "pos": [0.226, 0.6699999999999999, 0], "glow": 0.3, "rotY": 1.5708, "color": "#E0C070"}]	\N	72	2026-08-03 01:12:42.169895	2026-08-03 01:12:42.169895
74	seoul_convenience	편의점 오피스텔	SEOUL	NORMAL	300	f	0.570	0.689	1.770	[{"d": 0.44, "k": "plinth", "w": 0.5, "color": "concrete"}, {"d": 0.44, "h": 0.5, "k": "box", "w": 0.5, "y": 0.07, "color": "#EFEAE0", "rough": 0.55, "windows": {"to": 0.9, "from": 0.4, "glow": 0.32, "color": "#7FA6C4"}}, {"d": 0.46, "h": 0.06, "k": "box", "w": 0.52, "y": 0.5700000000000001, "color": "#2E6E4B"}, {"d": 0.36, "h": 1, "k": "box", "w": 0.4, "y": 0.6300000000000001, "color": "#C8CDD2", "metal": 0.4, "rough": 0.4, "windows": {"to": 0.9, "from": 0.1, "glow": 0.32, "color": "#7FA6C4"}}, {"d": 0.016, "h": 1, "k": "box", "w": 0.016, "x": -0.17200000000000001, "y": 0.6300000000000001, "z": 0.184, "color": "#9AA6B0"}, {"d": 0.016, "h": 1, "k": "box", "w": 0.016, "x": -0.08600000000000001, "y": 0.6300000000000001, "z": 0.184, "color": "#9AA6B0"}, {"d": 0.016, "h": 1, "k": "box", "w": 0.016, "x": 0, "y": 0.6300000000000001, "z": 0.184, "color": "#9AA6B0"}, {"d": 0.016, "h": 1, "k": "box", "w": 0.016, "x": 0.08600000000000001, "y": 0.6300000000000001, "z": 0.184, "color": "#9AA6B0"}, {"d": 0.016, "h": 1, "k": "box", "w": 0.016, "x": 0.17200000000000001, "y": 0.6300000000000001, "z": 0.184, "color": "#9AA6B0"}, {"d": 0.36, "k": "parapet", "w": 0.4, "y": 1.6300000000000001, "color": "roofDark"}, {"k": "rooftopUnits", "w": 0.4, "y": 1.6300000000000001}, {"d": 0.44, "k": "storefront", "w": 0.5, "sign": "#B83227", "faceH": 0.36, "awning": "#2E6E4B"}, {"h": 0.1, "k": "panel", "w": 0.4, "pos": [0, 0.49, 0.23800000000000002], "glow": 0.35, "color": "#2E6E4B"}]	\N	73	2026-08-03 01:12:42.171025	2026-08-03 01:12:42.171025
75	seoul_pojangmacha	포차거리 푸드홀	SEOUL	NORMAL	300	f	0.893	0.944	1.150	[{"d": 0.46, "k": "plinth", "w": 0.64, "color": "path"}, {"d": 0.46, "h": 0.9, "k": "box", "w": 0.64, "y": 0.07, "color": "#8A4030", "rough": 0.7, "windows": {"to": 0.85, "from": 0.5, "glow": 0.4, "color": "#F2C060"}}, {"d": 0.022, "h": 0.9, "k": "box", "w": 0.022, "x": -0.2752, "y": 0.07, "z": 0.234, "color": "#6E3226"}, {"d": 0.022, "h": 0.9, "k": "box", "w": 0.022, "x": -0.1834666666666667, "y": 0.07, "z": 0.234, "color": "#6E3226"}, {"d": 0.022, "h": 0.9, "k": "box", "w": 0.022, "x": -0.09173333333333335, "y": 0.07, "z": 0.234, "color": "#6E3226"}, {"d": 0.022, "h": 0.9, "k": "box", "w": 0.022, "x": 0, "y": 0.07, "z": 0.234, "color": "#6E3226"}, {"d": 0.022, "h": 0.9, "k": "box", "w": 0.022, "x": 0.09173333333333332, "y": 0.07, "z": 0.234, "color": "#6E3226"}, {"d": 0.022, "h": 0.9, "k": "box", "w": 0.022, "x": 0.1834666666666667, "y": 0.07, "z": 0.234, "color": "#6E3226"}, {"d": 0.022, "h": 0.9, "k": "box", "w": 0.022, "x": 0.2752, "y": 0.07, "z": 0.234, "color": "#6E3226"}, {"d": 0.48, "h": 0.06, "k": "box", "w": 0.66, "y": 0.97, "color": "#C85040"}, {"d": 0.52, "k": "roof", "w": 0.72, "y": 1.03, "type": "round", "color": "#C85040"}, {"d": 0.46, "k": "storefront", "w": 0.64, "sign": "#F2C060", "faceH": 0.4, "awning": "#902820"}, {"d": 0.1, "h": 0.04, "k": "box", "w": 0.6, "y": 0.41000000000000003, "z": 0.24, "color": "#D06848"}, {"h": 0.12, "k": "panel", "w": 0.5, "pos": [0, 0.8300000000000001, 0.248], "glow": 0.4, "color": "#F2C060"}, {"h": 0.13, "k": "panel", "w": 0.05, "pos": [-0.24, 0.5700000000000001, 0.246], "glow": 0.55, "color": "#F2C060"}, {"h": 0.13, "k": "panel", "w": 0.05, "pos": [0, 0.5700000000000001, 0.246], "glow": 0.55, "color": "#B83227"}, {"h": 0.13, "k": "panel", "w": 0.05, "pos": [0.24, 0.5700000000000001, 0.246], "glow": 0.55, "color": "#F2C060"}]	\N	74	2026-08-03 01:12:42.172177	2026-08-03 01:12:42.172177
76	west_watertower	급수탑	WEST	NORMAL	300	f	0.552	0.624	2.210	[{"d": 0.44, "k": "plinth", "w": 0.44, "color": "path"}, {"d": 0.3, "h": 0.14, "k": "box", "w": 0.3, "y": 0.07, "color": "#7A4E30"}, {"d": 0.06, "h": 1.3, "k": "box", "w": 0.06, "x": -0.15, "y": 0.21000000000000002, "z": -0.15, "color": "#7A4E30"}, {"d": 0.06, "h": 1.3, "k": "box", "w": 0.06, "x": 0.15, "y": 0.21000000000000002, "z": -0.15, "color": "#7A4E30"}, {"d": 0.06, "h": 1.3, "k": "box", "w": 0.06, "x": -0.15, "y": 0.21000000000000002, "z": 0.15, "color": "#7A4E30"}, {"d": 0.06, "h": 1.3, "k": "box", "w": 0.06, "x": 0.15, "y": 0.21000000000000002, "z": 0.15, "color": "#7A4E30"}, {"d": 0.03, "h": 0.03, "k": "box", "w": 0.34, "y": 0.5700000000000001, "z": 0.15, "color": "#9B6B43"}, {"d": 0.03, "h": 0.03, "k": "box", "w": 0.34, "y": 0.97, "z": 0.15, "color": "#9B6B43"}, {"d": 0.34, "h": 0.03, "k": "box", "w": 0.03, "x": 0.15, "y": 0.77, "color": "#9B6B43"}, {"h": 0.5, "k": "cyl", "y": 1.51, "rb": 0.21, "rt": 0.21, "seg": 12, "color": "#9B6B43"}, {"h": 0.03, "k": "cyl", "y": 1.6700000000000002, "rb": 0.22, "rt": 0.22, "seg": 12, "color": "#7A4E30", "detail": true}, {"h": 0.03, "k": "cyl", "y": 1.9100000000000001, "rb": 0.22, "rt": 0.22, "seg": 12, "color": "#7A4E30", "detail": true}, {"k": "roof", "w": 0.46, "y": 2.01, "type": "cone", "color": "#7A4E30", "height": 0.2}, {"d": 0.04, "h": 0.5, "k": "box", "w": 0.04, "x": 0.19, "y": 0.21000000000000002, "z": 0.1, "color": "#6E6A60", "detail": true}, {"h": 0.1, "k": "panel", "w": 0.26, "pos": [0, 1.6900000000000002, 0.218], "color": "#3E2A1E"}]	\N	75	2026-08-03 01:12:42.173368	2026-08-03 01:12:42.173368
77	west_windmill_pump	풍차 물펌프	WEST	NORMAL	300	f	1.060	0.456	2.200	[{"d": 0.4, "k": "plinth", "w": 0.4, "color": "path"}, {"d": 0.3, "h": 0.5, "k": "box", "w": 0.3, "y": 0.07, "color": "#9B6B43", "rough": 0.8, "windows": {"to": 0.7, "from": 0.3, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.05, "h": 1, "k": "box", "w": 0.05, "x": -0.1, "y": 0.5700000000000001, "z": -0.1, "color": "#7A4E30"}, {"d": 0.05, "h": 1, "k": "box", "w": 0.05, "x": 0.1, "y": 0.5700000000000001, "z": -0.1, "color": "#7A4E30"}, {"d": 0.05, "h": 1, "k": "box", "w": 0.05, "x": -0.1, "y": 0.5700000000000001, "z": 0.1, "color": "#7A4E30"}, {"d": 0.05, "h": 1, "k": "box", "w": 0.05, "x": 0.1, "y": 0.5700000000000001, "z": 0.1, "color": "#7A4E30"}, {"d": 0.025, "h": 0.025, "k": "box", "w": 0.24, "y": 0.97, "z": 0.1, "color": "#9B6B43"}, {"d": 0.025, "h": 0.025, "k": "box", "w": 0.24, "y": 1.37, "z": 0.1, "color": "#9B6B43"}, {"d": 0.2, "h": 0.14, "k": "box", "w": 0.2, "y": 1.57, "color": "#7A4E30", "rough": 0.8}, {"k": "blades", "y": 1.6700000000000002}, {"d": 0.16, "h": 0.4, "k": "box", "w": 0.16, "x": 0.24, "y": 0.07, "z": 0.05, "color": "#6E6A60", "detail": true}, {"d": 0.18, "h": 0.05, "k": "box", "w": 0.18, "x": 0.24, "y": 0.47000000000000003, "z": 0.05, "color": "#7A4E30", "detail": true}]	\N	76	2026-08-03 01:12:42.174549	2026-08-03 01:12:42.174549
78	west_mine_headframe	광산 권양탑	WEST	NORMAL	300	f	0.649	0.665	1.910	[{"d": 0.44, "k": "plinth", "w": 0.5, "color": "path"}, {"d": 0.44, "h": 0.44, "k": "box", "w": 0.5, "y": 0.07, "color": "#7A4E30", "rough": 0.85, "windows": {"to": 0.7, "from": 0.3, "glow": 0.25, "color": "glassWarm"}}, {"d": 0.5, "k": "roof", "w": 0.56, "y": 0.51, "type": "pyramid", "color": "#6E6A60", "height": 0.1}, {"d": 0.2, "h": 0.4, "k": "box", "w": 0.34, "y": 0.6100000000000001, "color": "#9B6B43", "rough": 0.85}, {"d": 0.16, "h": 0.4, "k": "box", "w": 0.26, "y": 1.01, "color": "#9B6B43", "rough": 0.85}, {"d": 0.14, "h": 0.5, "k": "box", "w": 0.16, "y": 1.4100000000000001, "color": "#9B6B43", "rough": 0.85}, {"d": 0.03, "h": 0.03, "k": "box", "w": 0.24, "y": 1.77, "z": 0.09, "color": "#6E6A60", "detail": true}, {"h": 0.03, "k": "cyl", "y": 1.85, "rb": 0.09, "rt": 0.09, "seg": 12, "color": "#6E6A60", "detail": true}, {"h": 0.7, "k": "panel", "w": 0.06, "pos": [0.24, 0.6699999999999999, 0.1], "color": "#7A4E30"}, {"d": 0.44, "k": "storefront", "w": 0.5, "sign": "#3E2A1E", "faceH": 0.24, "awning": "#7A4E30"}]	\N	77	2026-08-03 01:12:42.175699	2026-08-03 01:12:42.175699
80	west_hotel	그랜드 호텔	WEST	NORMAL	300	f	0.649	0.783	1.770	[{"d": 0.46, "k": "plinth", "w": 0.52, "color": "path"}, {"d": 0.46, "h": 1.4, "k": "box", "w": 0.52, "y": 0.07, "color": "#C99A6A", "rough": 0.8, "windows": {"to": 0.9, "from": 0.1, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.06, "h": 0.3, "k": "box", "w": 0.56, "y": 1.47, "z": 0.2, "color": "#7A4E30", "rough": 0.8}, {"d": 0.5, "k": "roof", "w": 0.56, "y": 1.47, "type": "pyramid", "color": "#8B3A2F", "height": 0.1}, {"d": 0.47400000000000003, "h": 0.028, "k": "box", "w": 0.534, "y": 0.53, "color": "#7A4E30"}, {"d": 0.47400000000000003, "h": 0.028, "k": "box", "w": 0.534, "y": 0.97, "color": "#7A4E30"}, {"d": 0.46, "k": "balconies", "w": 0.52, "y0": 0.5700000000000001, "y1": 1.01, "color": "#7A4E30", "floors": 2}, {"d": 0.46, "k": "storefront", "w": 0.52, "sign": "#3E2A1E", "faceH": 0.32, "awning": "#8B3A2F"}, {"h": 0.16, "k": "panel", "w": 0.42, "pos": [0, 1.59, 0.248], "color": "#3E2A1E"}, {"h": 0.09, "k": "panel", "w": 0.36, "pos": [0, 1.61, 0.251], "glow": 0.25, "color": "#C9A24B"}]	\N	79	2026-08-03 01:12:42.177921	2026-08-03 01:12:42.177921
81	west_saloon	살롱	WEST	NORMAL	300	f	0.626	0.761	1.430	[{"d": 0.44, "k": "plinth", "w": 0.5, "color": "path"}, {"d": 0.44, "h": 1, "k": "box", "w": 0.5, "y": 0.07, "color": "#9B6B43", "rough": 0.8, "windows": {"to": 0.9, "from": 0.55, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.06, "h": 0.36, "k": "box", "w": 0.54, "y": 1.07, "z": 0.19, "color": "#7A4E30", "rough": 0.8}, {"d": 0.48, "k": "roof", "w": 0.54, "y": 1.07, "type": "pyramid", "color": "#8B3A2F", "height": 0.1}, {"d": 0.022, "h": 1, "k": "box", "w": 0.022, "x": -0.215, "y": 0.07, "z": 0.224, "color": "#7A4E30"}, {"d": 0.022, "h": 1, "k": "box", "w": 0.022, "x": -0.1075, "y": 0.07, "z": 0.224, "color": "#7A4E30"}, {"d": 0.022, "h": 1, "k": "box", "w": 0.022, "x": 0, "y": 0.07, "z": 0.224, "color": "#7A4E30"}, {"d": 0.022, "h": 1, "k": "box", "w": 0.022, "x": 0.1075, "y": 0.07, "z": 0.224, "color": "#7A4E30"}, {"d": 0.022, "h": 1, "k": "box", "w": 0.022, "x": 0.215, "y": 0.07, "z": 0.224, "color": "#7A4E30"}, {"d": 0.14, "h": 0.03, "k": "box", "w": 0.56, "y": 0.5700000000000001, "z": 0.2, "color": "#7A4E30"}, {"d": 0.02, "h": 0.2, "k": "box", "w": 0.02, "x": -0.2, "y": 0.5700000000000001, "z": 0.26, "color": "#7A4E30"}, {"d": 0.02, "h": 0.2, "k": "box", "w": 0.02, "x": 0.2, "y": 0.5700000000000001, "z": 0.26, "color": "#7A4E30"}, {"d": 0.44, "k": "storefront", "w": 0.5, "sign": "#3E2A1E", "faceH": 0.4, "awning": "#8B3A2F"}, {"h": 0.16, "k": "panel", "w": 0.42, "pos": [0, 1.1900000000000002, 0.23800000000000002], "color": "#3E2A1E"}, {"h": 0.09, "k": "panel", "w": 0.36, "pos": [0, 1.21, 0.241], "glow": 0.25, "color": "#D9A24B"}]	\N	80	2026-08-03 01:12:42.17924	2026-08-03 01:12:42.17924
82	west_courthouse	법원 청사	WEST	NORMAL	300	f	0.661	0.723	1.800	[{"d": 0.5, "k": "plinth", "w": 0.58, "color": "path"}, {"d": 0.5, "h": 1, "k": "box", "w": 0.58, "y": 0.07, "color": "#E4D8BE", "rough": 0.8, "windows": {"to": 0.85, "from": 0.2, "glow": 0.26, "color": "glassWarm"}}, {"d": 0.5, "h": 0.7, "k": "columns", "w": 0.58, "y": 0.07, "color": "#D9C29A", "count": 6}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.42, "y": 0.07, "z": 0.39, "color": "#D9C29A"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.38, "y": 0.098, "z": 0.35000000000000003, "color": "#D9C29A"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.33999999999999997, "y": 0.126, "z": 0.31, "color": "#D9C29A"}, {"d": 0.54, "h": 0.08, "k": "box", "w": 0.62, "y": 1.07, "color": "#D9C29A"}, {"d": 0.3, "h": 0.24, "k": "box", "w": 0.3, "y": 1.1500000000000001, "color": "#E4D8BE", "rough": 0.8}, {"h": 0.14, "k": "cyl", "y": 1.3900000000000001, "rb": 0.16, "rt": 0.14, "seg": 12, "color": "#E4D8BE"}, {"k": "roof", "w": 0.36, "y": 1.53, "type": "dome", "color": "#8B3A2F"}, {"d": 0.02, "h": 0.14, "k": "box", "w": 0.02, "y": 1.6600000000000001, "color": "#C9A24B", "detail": true, "emissive": true}, {"h": 0.1, "k": "panel", "w": 0.34, "pos": [0, 0.97, 0.268], "color": "#3E2A1E"}]	\N	81	2026-08-03 01:12:42.180444	2026-08-03 01:12:42.180444
83	west_theater	오페라 하우스	WEST	NORMAL	300	f	0.698	0.816	1.710	[{"d": 0.48, "k": "plinth", "w": 0.56, "color": "path"}, {"d": 0.48, "h": 1.3, "k": "box", "w": 0.56, "y": 0.07, "color": "#C99A6A", "rough": 0.8, "windows": {"to": 0.85, "from": 0.15, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.06, "h": 0.34, "k": "box", "w": 0.6, "y": 1.37, "z": 0.21, "color": "#7A4E30", "rough": 0.8}, {"d": 0.52, "k": "roof", "w": 0.6, "y": 1.37, "type": "pyramid", "color": "#8B3A2F", "height": 0.1}, {"d": 0.48, "h": 0.5, "k": "columns", "w": 0.56, "y": 0.07, "color": "#E4D8BE", "count": 5}, {"d": 0.494, "h": 0.028, "k": "box", "w": 0.5740000000000001, "y": 0.6100000000000001, "color": "#7A4E30"}, {"d": 0.494, "h": 0.028, "k": "box", "w": 0.5740000000000001, "y": 1.01, "color": "#7A4E30"}, {"d": 0.48, "k": "storefront", "w": 0.56, "sign": "#C9A24B", "faceH": 0.34, "awning": "#7A2E2E"}, {"h": 0.6, "k": "panel", "w": 0.14, "pos": [0.28, 0.77, 0.246], "glow": 0.4, "color": "#C9A24B"}, {"h": 0.16, "k": "panel", "w": 0.44, "pos": [0, 1.49, 0.248], "color": "#3E2A1E"}, {"h": 0.09, "k": "panel", "w": 0.38, "pos": [0, 1.51, 0.251], "glow": 0.28, "color": "#D9A24B"}]	\N	82	2026-08-03 01:12:42.181495	2026-08-03 01:12:42.181495
84	west_bank	은행 (금고)	WEST	NORMAL	300	f	0.616	0.640	1.520	[{"d": 0.46, "k": "plinth", "w": 0.54, "color": "path"}, {"d": 0.46, "h": 1.1, "k": "box", "w": 0.54, "y": 0.07, "color": "#D9C29A", "rough": 0.8, "windows": {"to": 0.82, "from": 0.45, "glow": 0.26, "color": "glassWarm"}}, {"d": 0.46, "h": 0.7, "k": "columns", "w": 0.54, "y": 0.07, "color": "#E4D8BE", "count": 4}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.4, "y": 0.07, "z": 0.32, "color": "#D9C29A"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.36000000000000004, "y": 0.098, "z": 0.27999999999999997, "color": "#D9C29A"}, {"d": 0.51, "h": 0.05, "k": "box", "w": 0.5900000000000001, "y": 1.1700000000000002, "color": "#7A4E30"}, {"d": 0.36, "h": 0.24, "k": "box", "w": 0.44, "y": 1.23, "color": "#D9C29A", "rough": 0.8}, {"d": 0.38, "h": 0.05, "k": "box", "w": 0.46, "y": 1.47, "color": "#7A4E30"}, {"h": 0.1, "k": "panel", "w": 0.36, "pos": [0, 1.31, 0.198], "color": "#3E2A1E"}, {"h": 0.28, "k": "panel", "w": 0.16, "pos": [0, 0.21000000000000002, 0.23600000000000002], "glow": 0.1, "color": "#6E6A60"}]	\N	83	2026-08-03 01:12:42.182603	2026-08-03 01:12:42.182603
85	west_train_depot	기차역	WEST	NORMAL	300	f	0.997	0.997	1.540	[{"d": 0.44, "k": "plinth", "w": 0.68, "color": "path"}, {"d": 0.44, "h": 0.8, "k": "box", "w": 0.68, "y": 0.07, "color": "#8B3A2F", "rough": 0.82, "windows": {"to": 0.78, "from": 0.2, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.6, "k": "roof", "w": 0.86, "y": 0.8700000000000001, "type": "pyramid", "color": "#7A4E30", "height": 0.16}, {"d": 0.454, "h": 0.028, "k": "box", "w": 0.6940000000000001, "y": 0.51, "color": "#D9C29A"}, {"d": 0.22, "h": 0.34, "k": "box", "w": 0.22, "y": 1.03, "color": "#D9C29A", "rough": 0.8}, {"k": "clock", "w": 0.22, "y": 1.27, "color": "#E4D8BE"}, {"k": "roof", "w": 0.28, "y": 1.37, "type": "pyramid", "color": "#7A4E30", "height": 0.14}, {"d": 0.03, "h": 0.4, "k": "box", "w": 0.03, "x": -0.3, "y": 0.07, "z": 0.22, "color": "#7A4E30"}, {"d": 0.03, "h": 0.4, "k": "box", "w": 0.03, "x": 0.3, "y": 0.07, "z": 0.22, "color": "#7A4E30"}, {"d": 0.44, "k": "storefront", "w": 0.68, "sign": "#3E2A1E", "faceH": 0.34, "awning": "#7A4E30"}]	\N	84	2026-08-03 01:12:42.183674	2026-08-03 01:12:42.183674
86	west_general_store	잡화점	WEST	NORMAL	300	f	0.640	0.761	1.410	[{"d": 0.44, "k": "plinth", "w": 0.5, "color": "path"}, {"d": 0.44, "h": 1, "k": "box", "w": 0.5, "y": 0.07, "color": "#9B6B43", "rough": 0.82, "windows": {"to": 0.88, "from": 0.55, "glow": 0.28, "color": "glassWarm"}}, {"d": 0.06, "h": 0.34, "k": "box", "w": 0.54, "y": 1.07, "z": 0.19, "color": "#7A4E30", "rough": 0.8}, {"d": 0.48, "k": "roof", "w": 0.54, "y": 1.07, "type": "pyramid", "color": "#8B3A2F", "height": 0.08}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": -0.215, "y": 0.07, "z": 0.224, "color": "#7A4E30"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": -0.1075, "y": 0.07, "z": 0.224, "color": "#7A4E30"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": 0, "y": 0.07, "z": 0.224, "color": "#7A4E30"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": 0.1075, "y": 0.07, "z": 0.224, "color": "#7A4E30"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": 0.215, "y": 0.07, "z": 0.224, "color": "#7A4E30"}, {"d": 0.08, "h": 0.12, "k": "box", "w": 0.08, "x": -0.28, "y": 0.07, "z": 0.26, "color": "#7A4E30", "detail": true}, {"d": 0.08, "h": 0.12, "k": "box", "w": 0.08, "x": 0.28, "y": 0.07, "z": 0.26, "color": "#7A4E30", "detail": true}, {"d": 0.44, "k": "storefront", "w": 0.5, "sign": "#3E2A1E", "faceH": 0.4, "awning": "#D9C29A"}, {"h": 0.16, "k": "panel", "w": 0.42, "pos": [0, 1.1900000000000002, 0.23800000000000002], "color": "#3E2A1E"}, {"h": 0.09, "k": "panel", "w": 0.36, "pos": [0, 1.21, 0.241], "glow": 0.2, "color": "#D9A24B"}]	\N	85	2026-08-03 01:12:42.184939	2026-08-03 01:12:42.184939
87	west_boarding_house	하숙집	WEST	NORMAL	300	f	0.580	0.586	1.670	[{"d": 0.44, "k": "plinth", "w": 0.4, "color": "path"}, {"d": 0.44, "h": 1.3, "k": "box", "w": 0.4, "y": 0.07, "color": "#E4D8BE", "rough": 0.82, "windows": {"to": 0.9, "from": 0.12, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.5, "k": "roof", "w": 0.46, "y": 1.37, "type": "pyramid", "color": "#7A4E30", "height": 0.2}, {"d": 0.454, "h": 0.028, "k": "box", "w": 0.41400000000000003, "y": 0.51, "color": "#D9C29A"}, {"d": 0.454, "h": 0.028, "k": "box", "w": 0.41400000000000003, "y": 0.95, "color": "#D9C29A"}, {"d": 0.44, "k": "balconies", "w": 0.4, "y0": 0.5700000000000001, "y1": 1.01, "color": "#7A4E30", "floors": 2}, {"d": 0.08, "h": 0.3, "k": "box", "w": 0.08, "x": -0.12, "y": 1.37, "z": -0.12, "color": "#7A3A2E", "detail": true}, {"h": 0.24, "k": "panel", "w": 0.12, "pos": [0, 0.21000000000000002, 0.23600000000000002], "color": "#7A4E30"}]	\N	86	2026-08-03 01:12:42.186191	2026-08-03 01:12:42.186191
88	west_blacksmith	대장간	WEST	NORMAL	300	f	0.649	0.691	1.730	[{"d": 0.44, "k": "plinth", "w": 0.5, "color": "path"}, {"d": 0.44, "h": 0.7, "k": "box", "w": 0.5, "y": 0.07, "color": "#7A4E30", "rough": 0.88}, {"d": 0.5, "k": "roof", "w": 0.56, "y": 0.77, "type": "pyramid", "color": "#6E6A60", "height": 0.18}, {"d": 0.16, "h": 0.9, "k": "box", "w": 0.16, "x": 0.16, "y": 0.77, "z": -0.08, "color": "#7A3A2E"}, {"d": 0.18, "h": 0.06, "k": "box", "w": 0.18, "x": 0.16, "y": 1.6700000000000002, "z": -0.08, "color": "#5A2A1E", "detail": true}, {"h": 0.44, "k": "panel", "w": 0.28, "pos": [-0.06, 0.31, 0.226], "color": "#241A12"}, {"h": 0.14, "k": "panel", "w": 0.16, "pos": [0.12, 0.47000000000000003, 0.228], "glow": 0.6, "color": "#E07A30"}, {"d": 0.1, "h": 0.16, "k": "box", "w": 0.1, "x": -0.06, "y": 0.07, "z": 0.26, "color": "#6E6A60", "detail": true}, {"d": 0.44, "k": "storefront", "w": 0.5, "sign": "#D9A24B", "faceH": 0.2, "awning": "#3E2A1E"}]	\N	87	2026-08-03 01:12:42.187234	2026-08-03 01:12:42.187234
89	west_stable	마구간	WEST	NORMAL	300	f	0.835	0.853	1.300	[{"d": 0.46, "k": "plinth", "w": 0.64, "color": "path"}, {"d": 0.46, "h": 0.8, "k": "box", "w": 0.64, "y": 0.07, "color": "#8B3A2F", "rough": 0.85, "windows": {"to": 0.75, "from": 0.5, "glow": 0, "color": "#3A2A1A"}}, {"d": 0.54, "k": "roof", "w": 0.72, "y": 0.8700000000000001, "type": "pyramid", "color": "#7A4E30", "height": 0.4}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": -0.2752, "y": 0.07, "z": 0.234, "color": "#E4D8BE"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": -0.16512, "y": 0.07, "z": 0.234, "color": "#E4D8BE"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": -0.055039999999999985, "y": 0.07, "z": 0.234, "color": "#E4D8BE"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": 0.055039999999999985, "y": 0.07, "z": 0.234, "color": "#E4D8BE"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": 0.16512000000000002, "y": 0.07, "z": 0.234, "color": "#E4D8BE"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": 0.2752, "y": 0.07, "z": 0.234, "color": "#E4D8BE"}, {"h": 0.2, "k": "panel", "w": 0.18, "pos": [0, 1.01, 0.246], "color": "#3E2A1E"}, {"d": 0.1, "h": 0.06, "k": "box", "w": 0.04, "y": 1.23, "z": 0.28, "color": "#7A4E30", "detail": true}, {"h": 0.5, "k": "panel", "w": 0.4, "pos": [0, 0.32, 0.23600000000000002], "color": "#9B6B43"}, {"h": 0.5, "k": "panel", "w": 0.02, "pos": [0, 0.32, 0.241], "color": "#7A4E30"}, {"d": 0.1, "h": 0.14, "k": "box", "w": 0.1, "x": 0.26, "y": 0.07, "z": 0.26, "color": "#8A7A4A", "detail": true}]	\N	88	2026-08-03 01:12:42.188242	2026-08-03 01:12:42.188242
90	west_sheriff	보안관 사무소	WEST	NORMAL	300	f	0.705	0.649	1.770	[{"d": 0.44, "k": "plinth", "w": 0.52, "color": "path"}, {"d": 0.44, "h": 0.9, "k": "box", "w": 0.52, "y": 0.07, "color": "#D9C29A", "rough": 0.85, "windows": {"to": 0.8, "from": 0.2, "glow": 0, "color": "#4A3020"}}, {"d": 0.06, "h": 0.28, "k": "box", "w": 0.54, "y": 0.97, "z": 0.18, "color": "#7A4E30", "rough": 0.8}, {"d": 0.48, "k": "roof", "w": 0.56, "y": 0.97, "type": "pyramid", "color": "#8B3A2F", "height": 0.08}, {"d": 0.2, "h": 1.4, "k": "box", "w": 0.2, "x": 0.24, "y": 0.07, "z": -0.1, "color": "#7A4E30", "rough": 0.85}, {"d": 0.24, "h": 0.2, "k": "box", "w": 0.24, "x": 0.24, "y": 1.47, "z": -0.1, "color": "#9B6B43", "rough": 0.8, "windows": {"to": 0.9, "from": 0.1, "glow": 0.35, "color": "glassWarm"}}, {"d": 0.28, "h": 0.1, "k": "box", "w": 0.28, "x": 0.24, "y": 1.6700000000000002, "z": -0.1, "color": "#8B3A2F"}, {"h": 0.2, "k": "panel", "w": 0.14, "pos": [-0.12, 0.47000000000000003, 0.226], "color": "#20160C"}, {"h": 0.16, "k": "panel", "w": 0.16, "pos": [-0.12, 0.79, 0.228], "glow": 0.35, "color": "#C9A24B"}, {"d": 0.44, "k": "storefront", "w": 0.42, "sign": "#3E2A1E", "faceH": 0.26, "awning": "#7A4E30"}]	\N	89	2026-08-03 01:12:42.189354	2026-08-03 01:12:42.189354
91	west_ranch_house	목장 저택	WEST	NORMAL	300	f	0.858	0.858	1.370	[{"d": 0.46, "k": "plinth", "w": 0.66, "color": "path"}, {"d": 0.46, "h": 0.9, "k": "box", "w": 0.66, "y": 0.07, "color": "#9B6B43", "rough": 0.82, "windows": {"to": 0.85, "from": 0.15, "glow": 0.28, "color": "glassWarm"}}, {"d": 0.54, "k": "roof", "w": 0.74, "y": 0.97, "type": "pyramid", "color": "#8B3A2F", "height": 0.22}, {"d": 0.47400000000000003, "h": 0.028, "k": "box", "w": 0.674, "y": 0.53, "color": "#7A4E30"}, {"d": 0.14, "h": 0.04, "k": "box", "w": 0.66, "y": 0.5700000000000001, "z": 0.24, "color": "#7A4E30"}, {"d": 0.03, "h": 0.5, "k": "box", "w": 0.03, "x": -0.28, "y": 0.07, "z": 0.29, "color": "#7A4E30"}, {"d": 0.03, "h": 0.5, "k": "box", "w": 0.03, "x": 0, "y": 0.07, "z": 0.29, "color": "#7A4E30"}, {"d": 0.03, "h": 0.5, "k": "box", "w": 0.03, "x": 0.28, "y": 0.07, "z": 0.29, "color": "#7A4E30"}, {"d": 0.1, "h": 0.4, "k": "box", "w": 0.1, "x": 0.22, "y": 0.97, "z": -0.1, "color": "#7A3A2E", "detail": true}, {"d": 0.02, "h": 0.16, "k": "box", "w": 0.02, "x": -0.2, "y": 1.1900000000000002, "color": "#6E6A60", "detail": true}, {"h": 0.28, "k": "panel", "w": 0.14, "pos": [0, 0.23, 0.241], "color": "#7A4E30"}]	\N	90	2026-08-03 01:12:42.19041	2026-08-03 01:12:42.19041
92	west_adobe_house	푸에블로 주택	WEST	NORMAL	300	f	0.684	0.632	1.410	[{"d": 0.52, "k": "plinth", "w": 0.6, "color": "#D9C29A"}, {"d": 0.52, "h": 0.5, "k": "box", "w": 0.6, "y": 0.07, "color": "#C99A6A", "rough": 0.95, "windows": {"to": 0.7, "from": 0.3, "glow": 0, "color": "#5A3A2E"}}, {"d": 0.42, "h": 0.44, "k": "box", "w": 0.46, "x": -0.06, "y": 0.5700000000000001, "z": -0.04, "color": "#B8894A", "rough": 0.95, "windows": {"to": 0.7, "from": 0.3, "glow": 0, "color": "#5A3A2E"}}, {"d": 0.32, "h": 0.4, "k": "box", "w": 0.32, "x": -0.12, "y": 1.01, "z": -0.08, "color": "#C99A6A", "rough": 0.95}, {"d": 0.52, "k": "parapet", "w": 0.6, "y": 0.5700000000000001, "color": "#B98A5A"}, {"d": 0.03, "h": 0.03, "k": "box", "w": 0.64, "y": 0.51, "z": 0.22, "color": "#7A4E30", "detail": true}, {"d": 0.03, "h": 0.03, "k": "box", "w": 0.5, "x": -0.06, "y": 0.95, "z": 0.16, "color": "#7A4E30", "detail": true}, {"d": 0.03, "h": 0.5, "k": "box", "w": 0.03, "x": 0.24, "y": 0.5700000000000001, "z": 0.2, "color": "#7A4E30", "detail": true}, {"h": 0.24, "k": "panel", "w": 0.12, "pos": [0.14, 0.19, 0.276], "color": "#5A3A2E"}]	\N	91	2026-08-03 01:12:42.191479	2026-08-03 01:12:42.191479
93	west_stagecoach_station	역마차 정거장	WEST	NORMAL	300	f	0.752	0.629	1.290	[{"d": 0.44, "k": "plinth", "w": 0.66, "color": "path"}, {"d": 0.44, "h": 0.9, "k": "box", "w": 0.4, "x": -0.13, "y": 0.07, "color": "#C99A6A", "rough": 0.82, "windows": {"to": 0.8, "from": 0.2, "glow": 0.28, "color": "glassWarm"}}, {"d": 0.5, "h": 0.08, "k": "box", "w": 0.46, "x": -0.13, "y": 0.97, "color": "#8B3A2F"}, {"d": 0.06, "h": 0.7, "k": "box", "w": 0.06, "x": 0.28, "y": 0.07, "z": 0.16, "color": "#7A4E30"}, {"d": 0.06, "h": 0.7, "k": "box", "w": 0.06, "x": 0.28, "y": 0.07, "z": -0.16, "color": "#7A4E30"}, {"d": 0.44, "h": 0.06, "k": "box", "w": 0.28, "x": 0.2, "y": 0.77, "color": "#9B6B43"}, {"d": 0.12, "h": 1.2, "k": "box", "w": 0.12, "x": -0.13, "y": 0.07, "z": -0.14, "color": "#7A4E30"}, {"d": 0.02, "h": 0.02, "k": "box", "w": 0.02, "x": -0.13, "y": 1.27, "z": -0.14, "color": "#D02030", "detail": true, "emissive": true}, {"d": 0.44, "k": "storefront", "w": 0.4, "sign": "#3E2A1E", "faceH": 0.3, "awning": "#7A4E30"}, {"h": 0.1, "k": "panel", "w": 0.3, "pos": [-0.13, 0.8500000000000001, 0.228], "color": "#3E2A1E"}]	\N	92	2026-08-03 01:12:42.192538	2026-08-03 01:12:42.192538
94	west_barber	이발소	WEST	NORMAL	300	f	0.510	0.623	1.350	[{"d": 0.4, "k": "plinth", "w": 0.38, "color": "path"}, {"d": 0.4, "h": 1, "k": "box", "w": 0.38, "y": 0.07, "color": "#E4D8BE", "rough": 0.82, "windows": {"to": 0.85, "from": 0.5, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.06, "h": 0.28, "k": "box", "w": 0.42, "y": 1.07, "z": 0.17, "color": "#7A4E30", "rough": 0.8}, {"d": 0.44, "k": "roof", "w": 0.42, "y": 1.07, "type": "pyramid", "color": "#8B3A2F", "height": 0.08}, {"d": 0.41400000000000003, "h": 0.028, "k": "box", "w": 0.394, "y": 0.51, "color": "#B03A48"}, {"d": 0.4, "k": "storefront", "w": 0.38, "sign": "#E4D8BE", "faceH": 0.38, "awning": "#B03A48"}, {"d": 0.04, "h": 0.3, "k": "box", "w": 0.04, "x": 0.15, "y": 0.43, "z": 0.2, "color": "#D02030", "detail": true}, {"d": 0.05, "h": 0.05, "k": "box", "w": 0.05, "x": 0.15, "y": 0.73, "z": 0.2, "color": "#E4D8BE", "detail": true}, {"h": 0.14, "k": "panel", "w": 0.3, "pos": [0, 1.1900000000000002, 0.218], "color": "#3E2A1E"}]	\N	93	2026-08-03 01:12:42.193568	2026-08-03 01:12:42.193568
95	west_schoolhouse	학교	WEST	NORMAL	300	f	0.649	0.723	1.490	[{"d": 0.46, "k": "plinth", "w": 0.5, "color": "path"}, {"d": 0.46, "h": 0.8, "k": "box", "w": 0.5, "y": 0.07, "color": "#8B3A2F", "rough": 0.85, "windows": {"to": 0.75, "from": 0.25, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.52, "k": "roof", "w": 0.56, "y": 0.8700000000000001, "type": "pyramid", "color": "#7A4E30", "height": 0.2}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": -0.215, "y": 0.07, "z": 0.234, "color": "#E4D8BE"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": -0.07166666666666667, "y": 0.07, "z": 0.234, "color": "#E4D8BE"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": 0.07166666666666666, "y": 0.07, "z": 0.234, "color": "#E4D8BE"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": 0.215, "y": 0.07, "z": 0.234, "color": "#E4D8BE"}, {"d": 0.16, "h": 0.3, "k": "box", "w": 0.16, "y": 0.97, "z": 0.06, "color": "#E4D8BE", "rough": 0.8}, {"d": 0.18, "h": 0.12, "k": "box", "w": 0.18, "y": 1.27, "z": 0.06, "color": "#8B3A2F"}, {"d": 0.02, "h": 0.1, "k": "box", "w": 0.02, "y": 1.3900000000000001, "z": 0.06, "color": "#6E6A60", "detail": true}, {"d": 0.04, "h": 0.06, "k": "box", "w": 0.06, "y": 1.31, "z": 0.09, "color": "#8A7A4A", "detail": true}, {"h": 0.26, "k": "panel", "w": 0.14, "pos": [0, 0.21000000000000002, 0.246], "color": "#7A4E30"}, {"h": 0.09, "k": "panel", "w": 0.3, "pos": [0, 0.73, 0.248], "glow": 0.15, "color": "#E4D8BE"}]	\N	94	2026-08-03 01:12:42.19466	2026-08-03 01:12:42.19466
102	medieval_gatehouse	성문	MEDIEVAL	NORMAL	300	f	0.860	0.535	1.830	[{"d": 0.42, "k": "plinth", "w": 0.74, "color": "#6E6B63"}, {"d": 0.36, "h": 0.9, "k": "box", "w": 0.74, "y": 0.07, "color": "#8C8A83", "rough": 0.9}, {"h": 0.56, "k": "panel", "w": 0.22, "pos": [0, 0.35000000000000003, 0.186], "color": "#20160C"}, {"d": 0.36, "k": "parapet", "w": 0.74, "y": 0.97, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": -0.3182, "y": 1.04, "z": 0.18, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": -0.21213333333333334, "y": 1.04, "z": 0.18, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": -0.10606666666666667, "y": 1.04, "z": 0.18, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": 0, "y": 1.04, "z": 0.18, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": 0.10606666666666664, "y": 1.04, "z": 0.18, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": 0.21213333333333334, "y": 1.04, "z": 0.18, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": 0.3182, "y": 1.04, "z": 0.18, "color": "#6E6B63"}, {"d": 0.28, "h": 1.4, "k": "box", "w": 0.24, "x": -0.3, "y": 0.07, "color": "#8C8A83", "rough": 0.9}, {"d": 0.28, "h": 1.4, "k": "box", "w": 0.24, "x": 0.3, "y": 0.07, "color": "#8C8A83", "rough": 0.9}, {"h": 0.14, "k": "cyl", "y": 1.47, "rb": 0.16, "rt": 0.2, "seg": 12, "color": "#6E6B63"}, {"d": 0.26, "h": 0.12, "k": "box", "w": 0.26, "x": -0.3, "y": 1.47, "z": 0, "color": "#3E5B8C"}, {"d": 0.17333333333333337, "h": 0.12, "k": "box", "w": 0.17333333333333337, "x": -0.3, "y": 1.5899999999999999, "z": 0, "color": "#3E5B8C"}, {"d": 0.08666666666666668, "h": 0.12, "k": "box", "w": 0.08666666666666668, "x": -0.3, "y": 1.71, "z": 0, "color": "#3E5B8C"}, {"d": 0.26, "h": 0.12, "k": "box", "w": 0.26, "x": 0.3, "y": 1.47, "z": 0, "color": "#3E5B8C"}, {"d": 0.17333333333333337, "h": 0.12, "k": "box", "w": 0.17333333333333337, "x": 0.3, "y": 1.5899999999999999, "z": 0, "color": "#3E5B8C"}, {"d": 0.08666666666666668, "h": 0.12, "k": "box", "w": 0.08666666666666668, "x": 0.3, "y": 1.71, "z": 0, "color": "#3E5B8C"}, {"h": 0.4, "k": "panel", "w": 0.14, "pos": [0, 0.6699999999999999, 0.196], "glow": 0.15, "color": "#B03A48"}]	\N	101	2026-08-03 01:12:42.203123	2026-08-03 01:12:42.203123
96	medieval_castle_keep	성 천수탑	MEDIEVAL	NORMAL	300	f	0.775	0.865	2.070	[{"d": 0.68, "k": "plinth", "w": 0.68, "color": "#6E6B63"}, {"d": 0.6, "h": 0.2, "k": "box", "w": 0.6, "y": 0.07, "color": "#6E6B63", "rough": 0.9}, {"d": 0.5, "h": 1.4, "k": "box", "w": 0.5, "y": 0.27, "color": "#8C8A83", "rough": 0.9, "windows": {"to": 0.85, "from": 0.15, "glow": 0, "color": "#3A2A1A"}}, {"d": 0.514, "h": 0.028, "k": "box", "w": 0.514, "y": 0.77, "color": "#6E6B63"}, {"d": 0.514, "h": 0.028, "k": "box", "w": 0.514, "y": 1.1700000000000002, "color": "#6E6B63"}, {"d": 0.5, "k": "parapet", "w": 0.5, "y": 1.6700000000000002, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": -0.215, "y": 1.74, "z": 0.25, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": -0.1075, "y": 1.74, "z": 0.25, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": 0, "y": 1.74, "z": 0.25, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": 0.1075, "y": 1.74, "z": 0.25, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": 0.215, "y": 1.74, "z": 0.25, "color": "#6E6B63"}, {"d": 0.14, "h": 1.7, "k": "box", "w": 0.14, "x": -0.26, "y": 0.07, "z": -0.26, "color": "#8C8A83", "rough": 0.9}, {"d": 0.18, "h": 0.1, "k": "box", "w": 0.18, "x": -0.26, "y": 1.77, "z": -0.26, "color": "#3E5B8C"}, {"d": 0.12000000000000001, "h": 0.1, "k": "box", "w": 0.12000000000000001, "x": -0.26, "y": 1.87, "z": -0.26, "color": "#3E5B8C"}, {"d": 0.060000000000000005, "h": 0.1, "k": "box", "w": 0.060000000000000005, "x": -0.26, "y": 1.97, "z": -0.26, "color": "#3E5B8C"}, {"d": 0.14, "h": 1.7, "k": "box", "w": 0.14, "x": 0.26, "y": 0.07, "z": -0.26, "color": "#8C8A83", "rough": 0.9}, {"d": 0.18, "h": 0.1, "k": "box", "w": 0.18, "x": 0.26, "y": 1.77, "z": -0.26, "color": "#3E5B8C"}, {"d": 0.12000000000000001, "h": 0.1, "k": "box", "w": 0.12000000000000001, "x": 0.26, "y": 1.87, "z": -0.26, "color": "#3E5B8C"}, {"d": 0.060000000000000005, "h": 0.1, "k": "box", "w": 0.060000000000000005, "x": 0.26, "y": 1.97, "z": -0.26, "color": "#3E5B8C"}, {"d": 0.14, "h": 1.7, "k": "box", "w": 0.14, "x": -0.26, "y": 0.07, "z": 0.26, "color": "#8C8A83", "rough": 0.9}, {"d": 0.18, "h": 0.1, "k": "box", "w": 0.18, "x": -0.26, "y": 1.77, "z": 0.26, "color": "#3E5B8C"}, {"d": 0.12000000000000001, "h": 0.1, "k": "box", "w": 0.12000000000000001, "x": -0.26, "y": 1.87, "z": 0.26, "color": "#3E5B8C"}, {"d": 0.060000000000000005, "h": 0.1, "k": "box", "w": 0.060000000000000005, "x": -0.26, "y": 1.97, "z": 0.26, "color": "#3E5B8C"}, {"d": 0.14, "h": 1.7, "k": "box", "w": 0.14, "x": 0.26, "y": 0.07, "z": 0.26, "color": "#8C8A83", "rough": 0.9}, {"d": 0.18, "h": 0.1, "k": "box", "w": 0.18, "x": 0.26, "y": 1.77, "z": 0.26, "color": "#3E5B8C"}, {"d": 0.12000000000000001, "h": 0.1, "k": "box", "w": 0.12000000000000001, "x": 0.26, "y": 1.87, "z": 0.26, "color": "#3E5B8C"}, {"d": 0.060000000000000005, "h": 0.1, "k": "box", "w": 0.060000000000000005, "x": 0.26, "y": 1.97, "z": 0.26, "color": "#3E5B8C"}, {"d": 0.02, "h": 0.28, "k": "box", "w": 0.16, "y": 0.97, "z": 0.25, "color": "#B03A48"}, {"h": 0.3, "k": "panel", "w": 0.14, "pos": [0, 0.27, 0.256], "color": "#3E2A1C"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.24, "y": 0.07, "z": 0.45, "color": "#8C8A83"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.19999999999999998, "y": 0.098, "z": 0.41000000000000003, "color": "#8C8A83"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.15999999999999998, "y": 0.126, "z": 0.37, "color": "#8C8A83"}]	\N	95	2026-08-03 01:12:42.19585	2026-08-03 01:12:42.19585
97	medieval_cathedral	대성당	MEDIEVAL	NORMAL	300	f	0.789	0.810	1.970	[{"d": 0.64, "k": "plinth", "w": 0.64, "color": "#6E6B63"}, {"d": 0.62, "h": 1, "k": "box", "w": 0.36, "y": 0.07, "color": "#8C8A83", "rough": 0.85, "windows": {"to": 0.75, "from": 0.2, "glow": 0.15, "color": "#3A2A4A"}}, {"d": 0.68, "k": "roof", "w": 0.42, "y": 1.07, "type": "pyramid", "color": "#3E5B8C", "height": 0.24}, {"d": 0.5, "h": 0.12, "k": "box", "w": 0.02, "y": 1.31, "color": "#C9A24B", "detail": true}, {"d": 0.18, "h": 1.5, "k": "box", "w": 0.18, "x": -0.24, "y": 0.07, "z": 0.22, "color": "#8C8A83", "rough": 0.85}, {"d": 0.18, "h": 1.5, "k": "box", "w": 0.18, "x": 0.24, "y": 0.07, "z": 0.22, "color": "#8C8A83", "rough": 0.85}, {"d": 0.2, "h": 0.1, "k": "box", "w": 0.2, "x": -0.24, "y": 1.57, "z": 0.22, "color": "#3E5B8C"}, {"d": 0.15000000000000002, "h": 0.1, "k": "box", "w": 0.15000000000000002, "x": -0.24, "y": 1.6700000000000002, "z": 0.22, "color": "#3E5B8C"}, {"d": 0.1, "h": 0.1, "k": "box", "w": 0.1, "x": -0.24, "y": 1.77, "z": 0.22, "color": "#3E5B8C"}, {"d": 0.05, "h": 0.1, "k": "box", "w": 0.05, "x": -0.24, "y": 1.87, "z": 0.22, "color": "#3E5B8C"}, {"d": 0.2, "h": 0.1, "k": "box", "w": 0.2, "x": 0.24, "y": 1.57, "z": 0.22, "color": "#3E5B8C"}, {"d": 0.15000000000000002, "h": 0.1, "k": "box", "w": 0.15000000000000002, "x": 0.24, "y": 1.6700000000000002, "z": 0.22, "color": "#3E5B8C"}, {"d": 0.1, "h": 0.1, "k": "box", "w": 0.1, "x": 0.24, "y": 1.77, "z": 0.22, "color": "#3E5B8C"}, {"d": 0.05, "h": 0.1, "k": "box", "w": 0.05, "x": 0.24, "y": 1.87, "z": 0.22, "color": "#3E5B8C"}, {"d": 0.2, "h": 0.028, "k": "box", "w": 0.2, "x": -0.24, "y": 0.6699999999999999, "z": 0.22, "color": "#6E6B63"}, {"d": 0.2, "h": 0.028, "k": "box", "w": 0.2, "x": 0.24, "y": 0.6699999999999999, "z": 0.22, "color": "#6E6B63"}, {"d": 0.2, "h": 0.028, "k": "box", "w": 0.2, "x": -0.24, "y": 1.07, "z": 0.22, "color": "#6E6B63"}, {"d": 0.2, "h": 0.028, "k": "box", "w": 0.2, "x": 0.24, "y": 1.07, "z": 0.22, "color": "#6E6B63"}, {"h": 0.18, "k": "panel", "w": 0.18, "pos": [0, 0.77, 0.326], "glow": 0.35, "color": "#2E5A8C"}, {"h": 0.34, "k": "panel", "w": 0.16, "pos": [0, 0.25, 0.326], "color": "#3E2A1C"}, {"k": "cross", "s": 0.5, "y": 1.27, "z": 0.32, "color": "#C9A24B"}]	\N	96	2026-08-03 01:12:42.197307	2026-08-03 01:12:42.197307
98	medieval_royal_palace	왕궁	MEDIEVAL	NORMAL	300	f	0.858	0.858	2.370	[{"d": 0.56, "k": "plinth", "w": 0.74, "color": "#6E6B63"}, {"d": 0.5, "h": 1, "k": "box", "w": 0.68, "y": 0.07, "color": "#D8CDB8", "rough": 0.8, "windows": {"to": 0.85, "from": 0.15, "glow": 0.28, "color": "glassWarm"}}, {"d": 0.5, "h": 0.6, "k": "columns", "w": 0.68, "y": 0.07, "color": "#8C8A83", "count": 7}, {"d": 0.07, "h": 0.05, "k": "box", "w": 0.6392, "y": 0.7, "z": 0.28, "color": "#6E6B63"}, {"d": 0.514, "h": 0.028, "k": "box", "w": 0.6940000000000001, "y": 0.6200000000000001, "color": "#2E5A8C"}, {"d": 0.56, "k": "roof", "w": 0.74, "y": 1.07, "type": "pyramid", "color": "#3E5B8C", "height": 0.12}, {"d": 0.3, "h": 0.5, "k": "box", "w": 0.3, "y": 1.1900000000000002, "color": "#D8CDB8", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.28, "color": "glassWarm"}}, {"h": 0.12, "k": "cyl", "y": 1.6900000000000002, "rb": 0.18, "rt": 0.16, "seg": 12, "color": "#8C8A83"}, {"k": "roof", "w": 0.42, "y": 1.81, "type": "cone", "color": "#7A2E2E", "height": 0.4}, {"d": 0.02, "h": 0.16, "k": "box", "w": 0.02, "y": 2.21, "color": "#C9A24B", "detail": true, "emissive": true}, {"d": 0.16, "h": 1.2, "k": "box", "w": 0.16, "x": -0.32, "y": 0.07, "z": 0.08, "color": "#D8CDB8", "rough": 0.8}, {"d": 0.2, "h": 0.1, "k": "box", "w": 0.2, "x": -0.32, "y": 1.27, "z": 0.08, "color": "#7A2E2E"}, {"d": 0.13333333333333336, "h": 0.1, "k": "box", "w": 0.13333333333333336, "x": -0.32, "y": 1.37, "z": 0.08, "color": "#7A2E2E"}, {"d": 0.06666666666666668, "h": 0.1, "k": "box", "w": 0.06666666666666668, "x": -0.32, "y": 1.47, "z": 0.08, "color": "#7A2E2E"}, {"d": 0.16, "h": 1.2, "k": "box", "w": 0.16, "x": 0.32, "y": 0.07, "z": 0.08, "color": "#D8CDB8", "rough": 0.8}, {"d": 0.2, "h": 0.1, "k": "box", "w": 0.2, "x": 0.32, "y": 1.27, "z": 0.08, "color": "#7A2E2E"}, {"d": 0.13333333333333336, "h": 0.1, "k": "box", "w": 0.13333333333333336, "x": 0.32, "y": 1.37, "z": 0.08, "color": "#7A2E2E"}, {"d": 0.06666666666666668, "h": 0.1, "k": "box", "w": 0.06666666666666668, "x": 0.32, "y": 1.47, "z": 0.08, "color": "#7A2E2E"}, {"h": 0.4, "k": "panel", "w": 0.1, "pos": [-0.12, 0.5700000000000001, 0.266], "glow": 0.15, "color": "#B03A48"}, {"h": 0.4, "k": "panel", "w": 0.1, "pos": [0.12, 0.5700000000000001, 0.266], "glow": 0.15, "color": "#2E5A8C"}]	\N	97	2026-08-03 01:12:42.198645	2026-08-03 01:12:42.198645
99	medieval_towerhouse	타워하우스	MEDIEVAL	NORMAL	300	f	0.528	0.540	2.370	[{"d": 0.42, "k": "plinth", "w": 0.42, "color": "#6E6B63"}, {"d": 0.4, "h": 0.2, "k": "box", "w": 0.4, "y": 0.07, "color": "#6E6B63", "rough": 0.9}, {"h": 1.5, "k": "cyl", "y": 0.27, "rb": 0.21, "rt": 0.19, "seg": 12, "color": "#8C8A83"}, {"h": 0.04, "k": "cyl", "y": 0.77, "rb": 0.22, "rt": 0.22, "seg": 12, "color": "#6E6B63", "detail": true}, {"h": 0.04, "k": "cyl", "y": 1.27, "rb": 0.22, "rt": 0.22, "seg": 12, "color": "#6E6B63", "detail": true}, {"h": 0.12, "k": "cyl", "y": 1.77, "rb": 0.21, "rt": 0.23, "seg": 12, "color": "#6E6B63"}, {"k": "roof", "w": 0.44, "y": 1.8900000000000001, "type": "cone", "color": "#7A2E2E", "height": 0.34}, {"d": 0.02, "h": 0.14, "k": "box", "w": 0.02, "y": 2.23, "color": "#C9A24B", "detail": true, "emissive": true}, {"h": 0.16, "k": "panel", "w": 0.05, "pos": [0, 1.07, 0.20600000000000002], "color": "#2A1A0E"}, {"h": 0.16, "k": "panel", "w": 0.05, "pos": [0, 0.6200000000000001, 0.20600000000000002], "color": "#2A1A0E"}, {"h": 0.4, "k": "panel", "w": 0.12, "pos": [0, 0.8200000000000001, 0.216], "glow": 0.15, "color": "#2E5A8C"}, {"d": 0.1, "h": 0.3, "k": "box", "w": 0.1, "x": 0.18, "y": 1.77, "z": -0.1, "color": "#6E6B63", "detail": true}]	\N	98	2026-08-03 01:12:42.199849	2026-08-03 01:12:42.199849
100	medieval_clocktower	시계탑	MEDIEVAL	NORMAL	300	f	0.479	0.495	2.430	[{"d": 0.42, "k": "plinth", "w": 0.42, "color": "#6E6B63"}, {"d": 0.38, "h": 1.6, "k": "box", "w": 0.38, "y": 0.07, "color": "#8C8A83", "rough": 0.85, "windows": {"to": 0.55, "from": 0.1, "glow": 0, "color": "#2A1A0E"}}, {"d": 0.394, "h": 0.028, "k": "box", "w": 0.394, "y": 0.6200000000000001, "color": "#6E6B63"}, {"d": 0.394, "h": 0.028, "k": "box", "w": 0.394, "y": 1.12, "color": "#6E6B63"}, {"k": "clock", "w": 0.38, "y": 1.4300000000000002, "color": "#D8CDB8"}, {"d": 0.38, "k": "parapet", "w": 0.38, "y": 1.6700000000000002, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": -0.1634, "y": 1.74, "z": 0.19, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": -0.05446666666666667, "y": 1.74, "z": 0.19, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": 0.05446666666666665, "y": 1.74, "z": 0.19, "color": "#6E6B63"}, {"d": 0.04, "h": 0.07, "k": "box", "w": 0.05, "x": 0.1634, "y": 1.74, "z": 0.19, "color": "#6E6B63"}, {"d": 0.24, "h": 0.24, "k": "box", "w": 0.24, "y": 1.6700000000000002, "color": "#8C8A83", "rough": 0.85}, {"k": "roof", "w": 0.36, "y": 1.9100000000000001, "type": "cone", "color": "#3E5B8C", "height": 0.36}, {"d": 0.02, "h": 0.16, "k": "box", "w": 0.02, "y": 2.27, "color": "#C9A24B", "detail": true, "emissive": true}, {"h": 0.28, "k": "panel", "w": 0.12, "pos": [0, 0.27, 0.196], "color": "#3E2A1C"}]	\N	99	2026-08-03 01:12:42.200943	2026-08-03 01:12:42.200943
101	medieval_watchtower	감시탑	MEDIEVAL	NORMAL	300	f	0.600	0.600	2.390	[{"d": 0.42, "k": "plinth", "w": 0.42, "color": "#6E6B63"}, {"h": 1.7, "k": "cyl", "y": 0.07, "rb": 0.24, "rt": 0.17, "seg": 12, "color": "#8C8A83"}, {"h": 0.04, "k": "cyl", "y": 0.6699999999999999, "rb": 0.2, "rt": 0.2, "seg": 12, "color": "#6E6B63", "detail": true}, {"h": 0.04, "k": "cyl", "y": 1.27, "rb": 0.18, "rt": 0.18, "seg": 12, "color": "#6E6B63", "detail": true}, {"h": 0.16, "k": "cyl", "y": 1.77, "rb": 0.2, "rt": 0.26, "seg": 12, "color": "#6E6B63"}, {"k": "roof", "w": 0.5, "y": 1.9300000000000002, "type": "cone", "color": "#3E5B8C", "height": 0.32}, {"d": 0.02, "h": 0.14, "k": "box", "w": 0.02, "y": 2.25, "color": "#B03A48", "detail": true}, {"h": 0.16, "k": "panel", "w": 0.05, "pos": [0, 1.07, 0.20600000000000002], "color": "#2A1A0E"}, {"h": 0.16, "k": "panel", "w": 0.05, "pos": [0, 0.6200000000000001, 0.216], "color": "#2A1A0E"}, {"h": 0.36, "k": "panel", "w": 0.12, "pos": [0, 0.9199999999999999, 0.216], "glow": 0.15, "color": "#B03A48"}]	\N	100	2026-08-03 01:12:42.202049	2026-08-03 01:12:42.202049
103	medieval_guildhall	길드홀	MEDIEVAL	NORMAL	300	f	0.812	0.812	1.840	[{"d": 0.46, "k": "plinth", "w": 0.56, "color": "#6E6B63"}, {"d": 0.46, "h": 0.5, "k": "box", "w": 0.56, "y": 0.07, "color": "#8C8A83", "rough": 0.85}, {"d": 0.5, "h": 0.5, "k": "box", "w": 0.6, "y": 0.5700000000000001, "color": "#D8CDB8", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.54, "h": 0.44, "k": "box", "w": 0.64, "y": 1.07, "color": "#E4DAC6", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.6, "k": "roof", "w": 0.7, "y": 1.51, "type": "pyramid", "color": "#7A2E2E", "height": 0.3}, {"d": 0.022, "h": 0.5, "k": "box", "w": 0.022, "x": -0.258, "y": 0.5700000000000001, "z": 0.254, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.5, "k": "box", "w": 0.022, "x": -0.129, "y": 0.5700000000000001, "z": 0.254, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.5, "k": "box", "w": 0.022, "x": 0, "y": 0.5700000000000001, "z": 0.254, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.5, "k": "box", "w": 0.022, "x": 0.129, "y": 0.5700000000000001, "z": 0.254, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.5, "k": "box", "w": 0.022, "x": 0.258, "y": 0.5700000000000001, "z": 0.254, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": -0.2752, "y": 1.07, "z": 0.274, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": -0.16512, "y": 1.07, "z": 0.274, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": -0.055039999999999985, "y": 1.07, "z": 0.274, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": 0.055039999999999985, "y": 1.07, "z": 0.274, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": 0.16512000000000002, "y": 1.07, "z": 0.274, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": 0.2752, "y": 1.07, "z": 0.274, "color": "#3E2A1C"}, {"d": 0.52, "h": 0.03, "k": "box", "w": 0.62, "y": 1.05, "color": "#3E2A1C"}, {"d": 0.56, "h": 0.03, "k": "box", "w": 0.66, "y": 1.49, "color": "#3E2A1C"}, {"d": 0.46, "k": "storefront", "w": 0.56, "sign": "#C9A24B", "faceH": 0.3, "awning": "#B03A48"}, {"h": 0.2, "k": "panel", "w": 0.16, "pos": [0, 0.6699999999999999, 0.266], "glow": 0.2, "color": "#C9A24B"}]	\N	102	2026-08-03 01:12:42.204283	2026-08-03 01:12:42.204283
104	medieval_townhall	시청	MEDIEVAL	NORMAL	300	f	0.765	0.765	2.170	[{"d": 0.48, "k": "plinth", "w": 0.6, "color": "#6E6B63"}, {"d": 0.48, "h": 1, "k": "box", "w": 0.6, "y": 0.07, "color": "#D8CDB8", "rough": 0.8, "windows": {"to": 0.85, "from": 0.18, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.48, "h": 0.6, "k": "columns", "w": 0.6, "y": 0.07, "color": "#8C8A83", "count": 5}, {"d": 0.07, "h": 0.05, "k": "box", "w": 0.564, "y": 0.7, "z": 0.27, "color": "#6E6B63"}, {"d": 0.54, "k": "roof", "w": 0.66, "y": 1.07, "type": "pyramid", "color": "#7A2E2E", "height": 0.14}, {"d": 0.24, "h": 0.5, "k": "box", "w": 0.24, "y": 1.21, "color": "#8C8A83", "rough": 0.85, "windows": {"to": 0.7, "from": 0.3, "glow": 0, "color": "#2A1A0E"}}, {"k": "roof", "w": 0.34, "y": 1.71, "type": "cone", "color": "#7A2E2E", "height": 0.32}, {"d": 0.02, "h": 0.14, "k": "box", "w": 0.02, "y": 2.03, "color": "#C9A24B", "detail": true, "emissive": true}, {"h": 0.36, "k": "panel", "w": 0.1, "pos": [-0.1, 0.6200000000000001, 0.246], "glow": 0.15, "color": "#B03A48"}, {"h": 0.36, "k": "panel", "w": 0.1, "pos": [0.1, 0.6200000000000001, 0.246], "glow": 0.15, "color": "#2E5A8C"}]	\N	103	2026-08-03 01:12:42.205502	2026-08-03 01:12:42.205502
105	medieval_market_hall	시장 홀	MEDIEVAL	NORMAL	300	f	0.835	0.835	1.870	[{"d": 0.5, "k": "plinth", "w": 0.66, "color": "#6E6B63"}, {"d": 0.5, "h": 0.16, "k": "box", "w": 0.66, "y": 0.07, "color": "#6E6B63", "rough": 0.85}, {"d": 0.5, "h": 0.44, "k": "columns", "w": 0.66, "y": 0.23, "color": "#8C8A83", "count": 6}, {"d": 0.5, "h": 0.06, "k": "box", "w": 0.66, "y": 0.6699999999999999, "color": "#8C8A83"}, {"d": 0.44, "h": 0.5, "k": "box", "w": 0.6, "y": 0.73, "color": "#D8CDB8", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": -0.258, "y": 0.73, "z": 0.224, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": -0.1548, "y": 0.73, "z": 0.224, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": -0.05159999999999999, "y": 0.73, "z": 0.224, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": 0.05159999999999999, "y": 0.73, "z": 0.224, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": 0.15480000000000002, "y": 0.73, "z": 0.224, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": 0.258, "y": 0.73, "z": 0.224, "color": "#3E2A1C"}, {"d": 0.52, "k": "roof", "w": 0.72, "y": 1.23, "type": "pyramid", "color": "#3E5B8C", "height": 0.24}, {"d": 0.16, "h": 0.2, "k": "box", "w": 0.16, "y": 1.47, "color": "#5A3E28", "rough": 0.8}, {"k": "roof", "w": 0.24, "y": 1.6700000000000002, "type": "cone", "color": "#3E5B8C", "height": 0.2}, {"d": 0.44, "h": 0.03, "k": "box", "w": 0.5, "y": 0.71, "color": "#3E2A1C"}]	\N	104	2026-08-03 01:12:42.206547	2026-08-03 01:12:42.206547
106	medieval_tavern	선술집	MEDIEVAL	NORMAL	300	f	0.673	0.681	1.810	[{"d": 0.46, "k": "plinth", "w": 0.48, "color": "#6E6B63"}, {"d": 0.46, "h": 0.5, "k": "box", "w": 0.48, "y": 0.07, "color": "#8C8A83", "rough": 0.85, "windows": {"to": 0.8, "from": 0.4, "glow": 0.35, "color": "glassWarm"}}, {"d": 0.5, "h": 0.44, "k": "box", "w": 0.52, "y": 0.5700000000000001, "color": "#D8CDB8", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.35, "color": "glassWarm"}}, {"d": 0.48, "h": 0.4, "k": "box", "w": 0.5, "y": 1.01, "color": "#E4DAC6", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.35, "color": "glassWarm"}}, {"d": 0.56, "k": "roof", "w": 0.58, "y": 1.4100000000000001, "type": "pyramid", "color": "#7A2E2E", "height": 0.26}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": -0.2236, "y": 0.5700000000000001, "z": 0.254, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": -0.1118, "y": 0.5700000000000001, "z": 0.254, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": 0, "y": 0.5700000000000001, "z": 0.254, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": 0.1118, "y": 0.5700000000000001, "z": 0.254, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": 0.2236, "y": 0.5700000000000001, "z": 0.254, "color": "#3E2A1C"}, {"d": 0.51, "h": 0.03, "k": "box", "w": 0.53, "y": 0.99, "color": "#3E2A1C"}, {"d": 0.1, "h": 0.4, "k": "box", "w": 0.1, "x": 0.18, "y": 1.4100000000000001, "z": -0.12, "color": "#6E6B63", "detail": true}, {"d": 0.12, "h": 0.16, "k": "box", "w": 0.02, "x": 0.24, "y": 0.5700000000000001, "z": 0.24, "color": "#3E2A1C"}, {"h": 0.14, "k": "panel", "w": 0.14, "pos": [0.24, 0.51, 0.248], "glow": 0.25, "color": "#C9A24B"}, {"d": 0.46, "k": "storefront", "w": 0.48, "sign": "#B03A48", "faceH": 0.28, "awning": "#3E2A1C"}]	\N	105	2026-08-03 01:12:42.207745	2026-08-03 01:12:42.207745
107	medieval_manor	장원 저택	MEDIEVAL	NORMAL	300	f	0.835	0.835	1.730	[{"d": 0.46, "k": "plinth", "w": 0.64, "color": "#6E6B63"}, {"d": 0.46, "h": 0.9, "k": "box", "w": 0.64, "y": 0.07, "color": "#D8CDB8", "rough": 0.8, "windows": {"to": 0.85, "from": 0.15, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.54, "k": "roof", "w": 0.72, "y": 0.97, "type": "pyramid", "color": "#7A2E2E", "height": 0.24}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.2752, "y": 0.07, "z": 0.234, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.16512, "y": 0.07, "z": 0.234, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.055039999999999985, "y": 0.07, "z": 0.234, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.055039999999999985, "y": 0.07, "z": 0.234, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.16512000000000002, "y": 0.07, "z": 0.234, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.2752, "y": 0.07, "z": 0.234, "color": "#3E2A1C"}, {"d": 0.47, "h": 0.03, "k": "box", "w": 0.65, "y": 0.53, "color": "#3E2A1C"}, {"d": 0.2, "h": 1.3, "k": "box", "w": 0.2, "x": -0.28, "y": 0.07, "z": 0.08, "color": "#8C8A83", "rough": 0.85}, {"d": 0.26, "h": 0.12, "k": "box", "w": 0.26, "x": -0.28, "y": 1.37, "z": 0.08, "color": "#3E5B8C"}, {"d": 0.17333333333333337, "h": 0.12, "k": "box", "w": 0.17333333333333337, "x": -0.28, "y": 1.4900000000000002, "z": 0.08, "color": "#3E5B8C"}, {"d": 0.08666666666666668, "h": 0.12, "k": "box", "w": 0.08666666666666668, "x": -0.28, "y": 1.61, "z": 0.08, "color": "#3E5B8C"}, {"d": 0.08, "h": 0.4, "k": "box", "w": 0.08, "x": 0.2, "y": 0.97, "z": -0.1, "color": "#6E6B63", "detail": true}, {"h": 0.3, "k": "panel", "w": 0.14, "pos": [0.05, 0.23, 0.246], "color": "#3E2A1C"}]	\N	106	2026-08-03 01:12:42.208979	2026-08-03 01:12:42.208979
108	medieval_halftimber_house	하프팀버 주택	MEDIEVAL	NORMAL	300	f	0.673	0.673	1.670	[{"d": 0.42, "k": "plinth", "w": 0.4, "color": "#6E6B63"}, {"d": 0.42, "h": 0.44, "k": "box", "w": 0.4, "y": 0.07, "color": "#8C8A83", "rough": 0.85}, {"d": 0.46, "h": 0.42, "k": "box", "w": 0.44, "y": 0.51, "color": "#D8CDB8", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.5, "h": 0.4, "k": "box", "w": 0.48, "y": 0.9299999999999999, "color": "#E4DAC6", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.58, "k": "roof", "w": 0.56, "y": 1.33, "type": "pyramid", "color": "#7A2E2E", "height": 0.28}, {"d": 0.07, "h": 0.34, "k": "box", "w": 0.07, "x": 0.16, "y": 1.33, "z": -0.12, "color": "#6E6B63", "detail": true}, {"d": 0.022, "h": 0.42, "k": "box", "w": 0.022, "x": -0.1892, "y": 0.51, "z": 0.234, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.42, "k": "box", "w": 0.022, "x": -0.06306666666666667, "y": 0.51, "z": 0.234, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.42, "k": "box", "w": 0.022, "x": 0.06306666666666666, "y": 0.51, "z": 0.234, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.42, "k": "box", "w": 0.022, "x": 0.1892, "y": 0.51, "z": 0.234, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.4, "k": "box", "w": 0.022, "x": -0.2064, "y": 0.9299999999999999, "z": 0.254, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.4, "k": "box", "w": 0.022, "x": -0.06880000000000001, "y": 0.9299999999999999, "z": 0.254, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.4, "k": "box", "w": 0.022, "x": 0.06879999999999999, "y": 0.9299999999999999, "z": 0.254, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.4, "k": "box", "w": 0.022, "x": 0.2064, "y": 0.9299999999999999, "z": 0.254, "color": "#3E2A1C"}, {"d": 0.47, "h": 0.03, "k": "box", "w": 0.45, "y": 0.9099999999999999, "color": "#3E2A1C"}, {"d": 0.51, "h": 0.03, "k": "box", "w": 0.49, "y": 1.31, "color": "#3E2A1C"}, {"h": 0.28, "k": "panel", "w": 0.12, "pos": [0, 0.23, 0.226], "color": "#3E2A1C"}]	\N	107	2026-08-03 01:12:42.210323	2026-08-03 01:12:42.210323
109	medieval_apothecary	약재상	MEDIEVAL	NORMAL	300	f	0.580	0.601	1.700	[{"d": 0.42, "k": "plinth", "w": 0.42, "color": "#6E6B63"}, {"d": 0.42, "h": 0.5, "k": "box", "w": 0.42, "y": 0.07, "color": "#8C8A83", "rough": 0.85, "windows": {"to": 0.85, "from": 0.5, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.44, "h": 0.44, "k": "box", "w": 0.44, "y": 0.5700000000000001, "color": "#D8CDB8", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.42, "h": 0.38, "k": "box", "w": 0.42, "y": 1.01, "color": "#E4DAC6", "rough": 0.8}, {"d": 0.5, "k": "roof", "w": 0.5, "y": 1.3900000000000001, "type": "pyramid", "color": "#7A2E2E", "height": 0.28}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": -0.1892, "y": 0.5700000000000001, "z": 0.224, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": -0.06306666666666667, "y": 0.5700000000000001, "z": 0.224, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": 0.06306666666666666, "y": 0.5700000000000001, "z": 0.224, "color": "#3E2A1C"}, {"d": 0.022, "h": 0.44, "k": "box", "w": 0.022, "x": 0.1892, "y": 0.5700000000000001, "z": 0.224, "color": "#3E2A1C"}, {"d": 0.42, "k": "storefront", "w": 0.42, "sign": "#C9A24B", "faceH": 0.34, "awning": "#2E5A4A"}, {"d": 0.1, "h": 0.14, "k": "box", "w": 0.02, "x": 0.2, "y": 0.5700000000000001, "z": 0.22, "color": "#3E2A1C"}, {"h": 0.12, "k": "panel", "w": 0.12, "pos": [0.2, 0.53, 0.228], "glow": 0.3, "color": "#2E7D4F"}]	\N	108	2026-08-03 01:12:42.211981	2026-08-03 01:12:42.211981
115	medieval_chapel	예배당	MEDIEVAL	NORMAL	300	f	0.719	0.735	1.444	[{"d": 0.56, "k": "plinth", "w": 0.44, "color": "#6E6B63"}, {"d": 0.56, "h": 0.9, "k": "box", "w": 0.44, "y": 0.07, "color": "#8C8A83", "rough": 0.85, "windows": {"to": 0.7, "from": 0.25, "glow": 0.15, "color": "#3A2A4A"}}, {"d": 0.62, "k": "roof", "w": 0.5, "y": 0.97, "type": "pyramid", "color": "#3E5B8C", "height": 0.3}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.1892, "y": 0.07, "z": 0.28400000000000003, "color": "#6E6B63"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0, "y": 0.07, "z": 0.28400000000000003, "color": "#6E6B63"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.1892, "y": 0.07, "z": 0.28400000000000003, "color": "#6E6B63"}, {"h": 0.6, "k": "cyl", "y": 0.07, "rb": 0.22, "rt": 0.22, "seg": 12, "color": "#8C8A83"}, {"k": "roof", "w": 0.42, "y": 0.6699999999999999, "type": "dome", "color": "#3E5B8C"}, {"d": 0.06, "h": 0.34, "k": "box", "w": 0.28, "y": 0.97, "z": 0.28, "color": "#8C8A83", "rough": 0.85}, {"h": 0.16, "k": "panel", "w": 0.1, "pos": [0, 1.1300000000000001, 0.316], "color": "#2A1A0E"}, {"d": 0.02, "h": 0.06, "k": "box", "w": 0.05, "y": 1.1300000000000001, "z": 0.28, "color": "#3E2A1C", "detail": true}, {"k": "cross", "s": 0.4, "y": 1.4100000000000001, "z": 0.28, "color": "#C9A24B"}, {"h": 0.18, "k": "panel", "w": 0.18, "pos": [0, 0.69, 0.28600000000000003], "glow": 0.3, "color": "#2E5A8C"}, {"h": 0.3, "k": "panel", "w": 0.12, "pos": [0, 0.25, 0.28600000000000003], "color": "#3E2A1C"}]	\N	114	2026-08-03 01:12:42.218601	2026-08-03 01:12:42.218601
110	medieval_blacksmith	대장간	MEDIEVAL	NORMAL	300	f	0.649	0.691	1.630	[{"d": 0.44, "k": "plinth", "w": 0.5, "color": "#6E6B63"}, {"d": 0.44, "h": 0.7, "k": "box", "w": 0.5, "y": 0.07, "color": "#8C8A83", "rough": 0.88}, {"d": 0.5, "k": "roof", "w": 0.56, "y": 0.77, "type": "pyramid", "color": "#3E2A1C", "height": 0.2}, {"d": 0.14, "h": 0.8, "k": "box", "w": 0.14, "x": 0.16, "y": 0.77, "z": -0.08, "color": "#6E6B63"}, {"d": 0.16, "h": 0.06, "k": "box", "w": 0.16, "x": 0.16, "y": 1.57, "z": -0.08, "color": "#8C8A83", "detail": true}, {"h": 0.44, "k": "panel", "w": 0.28, "pos": [-0.06, 0.31, 0.226], "color": "#1A120A"}, {"h": 0.14, "k": "panel", "w": 0.16, "pos": [0.12, 0.47000000000000003, 0.228], "glow": 0.6, "color": "#E07A30"}, {"d": 0.1, "h": 0.16, "k": "box", "w": 0.1, "x": -0.06, "y": 0.07, "z": 0.26, "color": "#6E6B63", "detail": true}, {"d": 0.44, "k": "storefront", "w": 0.5, "sign": "#C9A24B", "faceH": 0.2, "awning": "#3E2A1C"}]	\N	109	2026-08-03 01:12:42.213098	2026-08-03 01:12:42.213098
111	medieval_bakery	제빵소	MEDIEVAL	NORMAL	300	f	0.580	0.606	1.670	[{"d": 0.42, "k": "plinth", "w": 0.44, "color": "#6E6B63"}, {"d": 0.42, "h": 0.6, "k": "box", "w": 0.44, "y": 0.07, "color": "#D8CDB8", "rough": 0.8, "windows": {"to": 0.82, "from": 0.45, "glow": 0.32, "color": "glassWarm"}}, {"d": 0.4, "h": 0.44, "k": "box", "w": 0.42, "y": 0.6699999999999999, "color": "#E4DAC6", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.32, "color": "glassWarm"}}, {"d": 0.48, "k": "roof", "w": 0.5, "y": 1.11, "type": "pyramid", "color": "#7A2E2E", "height": 0.24}, {"d": 0.13, "h": 0.5, "k": "box", "w": 0.13, "x": -0.14, "y": 1.11, "z": -0.08, "color": "#B85A3A"}, {"d": 0.15, "h": 0.06, "k": "box", "w": 0.15, "x": -0.14, "y": 1.61, "z": -0.08, "color": "#8A4030", "detail": true}, {"d": 0.02, "h": 0.44, "k": "box", "w": 0.02, "x": -0.18059999999999998, "y": 0.6699999999999999, "z": 0.20400000000000001, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.44, "k": "box", "w": 0.02, "x": -0.060200000000000004, "y": 0.6699999999999999, "z": 0.20400000000000001, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.44, "k": "box", "w": 0.02, "x": 0.06019999999999998, "y": 0.6699999999999999, "z": 0.20400000000000001, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.44, "k": "box", "w": 0.02, "x": 0.18059999999999998, "y": 0.6699999999999999, "z": 0.20400000000000001, "color": "#3E2A1C"}, {"d": 0.42, "k": "storefront", "w": 0.44, "sign": "#3E2A1C", "faceH": 0.34, "awning": "#B8863B"}, {"h": 0.12, "k": "panel", "w": 0.12, "pos": [0, 0.55, 0.228], "glow": 0.25, "color": "#C9A24B"}]	\N	110	2026-08-03 01:12:42.214224	2026-08-03 01:12:42.214224
112	medieval_watermill	물레방아	MEDIEVAL	NORMAL	300	f	1.060	0.580	1.500	[{"d": 0.46, "k": "plinth", "w": 0.46, "color": "#6E6B63"}, {"d": 0.42, "h": 0.7, "k": "box", "w": 0.42, "y": 0.07, "color": "#D8CDB8", "rough": 0.8, "windows": {"to": 0.75, "from": 0.3, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.38, "h": 0.44, "k": "box", "w": 0.38, "y": 0.77, "color": "#E4DAC6", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.5, "k": "roof", "w": 0.5, "y": 1.21, "type": "pyramid", "color": "#7A2E2E", "height": 0.26}, {"d": 0.02, "h": 0.7, "k": "box", "w": 0.02, "x": -0.18059999999999998, "y": 0.07, "z": 0.214, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.7, "k": "box", "w": 0.02, "x": -0.060200000000000004, "y": 0.07, "z": 0.214, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.7, "k": "box", "w": 0.02, "x": 0.06019999999999998, "y": 0.07, "z": 0.214, "color": "#3E2A1C"}, {"d": 0.02, "h": 0.7, "k": "box", "w": 0.02, "x": 0.18059999999999998, "y": 0.07, "z": 0.214, "color": "#3E2A1C"}, {"d": 0.43, "h": 0.03, "k": "box", "w": 0.43, "y": 0.75, "color": "#3E2A1C"}, {"k": "blades", "y": 0.41000000000000003}, {"d": 0.06, "h": 0.06, "k": "box", "w": 0.5, "y": 0.07, "z": 0.24, "color": "#6E6B63", "detail": true}, {"d": 0.08, "h": 0.34, "k": "box", "w": 0.08, "x": -0.16, "y": 0.77, "z": -0.1, "color": "#6E6B63", "detail": true}]	\N	111	2026-08-03 01:12:42.215446	2026-08-03 01:12:42.215446
113	medieval_well_house	우물 도브코트	MEDIEVAL	NORMAL	300	f	0.510	0.510	1.670	[{"d": 0.44, "k": "plinth", "w": 0.44, "color": "#6E6B63"}, {"h": 0.3, "k": "cyl", "y": 0.07, "rb": 0.19, "rt": 0.17, "seg": 12, "color": "#8C8A83"}, {"d": 0.04, "h": 0.44, "k": "box", "w": 0.04, "x": -0.13, "y": 0.37, "z": -0.13, "color": "#5A3E28"}, {"d": 0.04, "h": 0.44, "k": "box", "w": 0.04, "x": 0.13, "y": 0.37, "z": -0.13, "color": "#5A3E28"}, {"d": 0.04, "h": 0.44, "k": "box", "w": 0.04, "x": -0.13, "y": 0.37, "z": 0.13, "color": "#5A3E28"}, {"d": 0.04, "h": 0.44, "k": "box", "w": 0.04, "x": 0.13, "y": 0.37, "z": 0.13, "color": "#5A3E28"}, {"d": 0.34, "h": 0.5, "k": "box", "w": 0.34, "y": 0.81, "color": "#D8CDB8", "rough": 0.8}, {"h": 0.05, "k": "panel", "w": 0.05, "pos": [-0.08, 1.07, 0.17600000000000002], "color": "#2A1A0E"}, {"h": 0.05, "k": "panel", "w": 0.05, "pos": [0.08, 1.07, 0.17600000000000002], "color": "#2A1A0E"}, {"h": 0.05, "k": "panel", "w": 0.05, "pos": [0, 0.95, 0.17600000000000002], "color": "#2A1A0E"}, {"d": 0.44, "k": "roof", "w": 0.44, "y": 1.31, "type": "pyramid", "color": "#3E5B8C", "height": 0.24}, {"d": 0.02, "h": 0.12, "k": "box", "w": 0.02, "y": 1.55, "color": "#C9A24B", "detail": true}, {"d": 0.03, "h": 0.03, "k": "box", "w": 0.24, "y": 0.69, "z": 0.2, "color": "#5A3E28", "detail": true}]	\N	112	2026-08-03 01:12:42.216541	2026-08-03 01:12:42.216541
114	medieval_cottage_row	연립주택	MEDIEVAL	NORMAL	300	f	0.775	0.705	1.610	[{"d": 0.42, "k": "plinth", "w": 0.68, "color": "#6E6B63"}, {"d": 0.42, "h": 1, "k": "box", "w": 0.22, "x": -0.23, "y": 0.07, "color": "#D8CDB8", "rough": 0.8, "windows": {"to": 0.85, "from": 0.15, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.42, "h": 1.2, "k": "box", "w": 0.22, "x": 0, "y": 0.07, "color": "#8C8A83", "rough": 0.85, "windows": {"to": 0.88, "from": 0.12, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.42, "h": 1.1, "k": "box", "w": 0.22, "x": 0.23, "y": 0.07, "color": "#E4DAC6", "rough": 0.8, "windows": {"to": 0.86, "from": 0.14, "glow": 0.3, "color": "glassWarm"}}, {"d": 0.46, "h": 0.14, "k": "box", "w": 0.24, "x": -0.23, "y": 1.07, "color": "#7A2E2E"}, {"d": 0.46, "h": 0.16, "k": "box", "w": 0.24, "x": 0, "y": 1.27, "color": "#3E5B8C"}, {"d": 0.46, "h": 0.14, "k": "box", "w": 0.24, "x": 0.23, "y": 1.1700000000000002, "color": "#3E2A1C"}, {"d": 0.09, "h": 0.34, "k": "box", "w": 0.09, "x": 0.1, "y": 1.27, "z": -0.12, "color": "#6E6B63", "detail": true}, {"h": 0.03, "k": "panel", "w": 0.5, "pos": [0, 0.5700000000000001, 0.216], "color": "#3E2A1C"}]	\N	113	2026-08-03 01:12:42.217593	2026-08-03 01:12:42.217593
116	santorini_bluedome_church	블루돔 교회	SANTORINI	NORMAL	300	f	0.616	0.705	1.544	[{"d": 0.54, "k": "plinth", "w": 0.54, "color": "#E6E2D6"}, {"d": 0.48, "h": 0.8, "k": "box", "w": 0.48, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.6, "from": 0.2, "glow": 0.15, "color": "#1E5C99"}}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.24, "y": 0.07, "z": 0.37, "color": "#E6E2D6"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.19999999999999998, "y": 0.098, "z": 0.33, "color": "#E6E2D6"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.15999999999999998, "y": 0.126, "z": 0.29, "color": "#E6E2D6"}, {"h": 0.26, "k": "cyl", "y": 0.8700000000000001, "rb": 0.22, "rt": 0.2, "seg": 16, "color": "#F2F0EA"}, {"h": 0.03, "k": "cyl", "y": 0.97, "rb": 0.22, "rt": 0.22, "seg": 16, "color": "#1E5C99", "detail": true}, {"k": "roof", "w": 0.62, "y": 1.1300000000000001, "type": "dome", "color": "#2A6FB0"}, {"d": 0.02, "h": 0.16, "k": "box", "w": 0.02, "y": 1.35, "color": "#F2F0EA"}, {"k": "cross", "s": 0.4, "y": 1.51, "color": "#F2F0EA"}, {"d": 0.06, "h": 0.4, "k": "box", "w": 0.34, "y": 0.8700000000000001, "z": 0.24, "color": "#F2F0EA", "rough": 0.85}, {"h": 0.14, "k": "panel", "w": 0.08, "pos": [-0.1, 1.05, 0.276], "color": "#1E5C99"}, {"h": 0.14, "k": "panel", "w": 0.08, "pos": [0.1, 1.05, 0.276], "color": "#1E5C99"}, {"h": 0.3, "k": "panel", "w": 0.16, "pos": [0, 0.31, 0.246], "color": "#1E5C99"}, {"h": 0.12, "k": "panel", "w": 0.12, "pos": [0, 0.69, 0.246], "glow": 0.15, "color": "#3FA9C9"}]	\N	115	2026-08-03 01:12:42.219696	2026-08-03 01:12:42.219696
117	santorini_lighthouse	등대	SANTORINI	NORMAL	300	f	0.524	0.528	2.410	[{"d": 0.46, "k": "plinth", "w": 0.46, "color": "#E6E2D6"}, {"d": 0.38, "h": 0.4, "k": "box", "w": 0.38, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.7, "from": 0.3, "glow": 0.28, "color": "#3FA9C9"}}, {"h": 1.5, "k": "cyl", "y": 0.47000000000000003, "rb": 0.17, "rt": 0.1, "seg": 14, "color": "#F2F0EA"}, {"h": 0.05, "k": "cyl", "y": 0.97, "rb": 0.14, "rt": 0.14, "seg": 14, "color": "#2A6FB0", "detail": true}, {"h": 0.18, "k": "cyl", "y": 1.97, "rb": 0.11, "rt": 0.13, "seg": 12, "color": "#E6E2D6"}, {"d": 0.22, "h": 0.16, "k": "box", "w": 0.22, "y": 2.07, "color": "#C9A24B", "emissive": true}, {"k": "roof", "w": 0.32, "y": 2.23, "type": "cone", "color": "#2A6FB0", "height": 0.18}, {"h": 0.5, "k": "panel", "w": 0.12, "pos": [0, 1.02, 0.14600000000000002], "glow": 0.2, "color": "#3FA9C9"}, {"h": 0.26, "k": "panel", "w": 0.14, "pos": [0, 0.23, 0.196], "color": "#1E5C99"}]	\N	116	2026-08-03 01:12:42.220885	2026-08-03 01:12:42.220885
118	santorini_windmill	풍차	SANTORINI	NORMAL	300	f	1.060	0.528	1.800	[{"d": 0.44, "k": "plinth", "w": 0.44, "color": "#E6E2D6"}, {"h": 1.2, "k": "cyl", "y": 0.07, "rb": 0.24, "rt": 0.17, "seg": 14, "color": "#F2F0EA"}, {"h": 0.04, "k": "cyl", "y": 0.5700000000000001, "rb": 0.2, "rt": 0.2, "seg": 14, "color": "#E6E2D6", "detail": true}, {"h": 0.1, "k": "cyl", "y": 1.27, "rb": 0.19, "rt": 0.19, "seg": 14, "color": "#7A5A3A"}, {"k": "roof", "w": 0.44, "y": 1.37, "type": "cone", "color": "#2A6FB0", "height": 0.24}, {"k": "blades", "y": 1.27}, {"h": 0.12, "k": "panel", "w": 0.06, "pos": [0, 0.6699999999999999, 0.196], "color": "#1E5C99"}, {"h": 0.12, "k": "panel", "w": 0.06, "pos": [0, 0.97, 0.186], "color": "#1E5C99"}]	\N	117	2026-08-03 01:12:42.221926	2026-08-03 01:12:42.221926
119	santorini_three_bells	세 개의 종	SANTORINI	NORMAL	300	f	0.661	0.388	1.440	[{"d": 0.34, "k": "plinth", "w": 0.58, "color": "#E6E2D6"}, {"d": 0.2, "h": 0.7, "k": "box", "w": 0.52, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.6, "from": 0.2, "glow": 0.15, "color": "#1E5C99"}}, {"d": 0.16, "h": 0.4, "k": "box", "w": 0.52, "y": 0.77, "color": "#F2F0EA", "rough": 0.85}, {"d": 0.16, "h": 0.24, "k": "box", "w": 0.26, "y": 1.1700000000000002, "color": "#F2F0EA", "rough": 0.85}, {"h": 0.2, "k": "panel", "w": 0.1, "pos": [-0.17, 0.9299999999999999, 0.10600000000000001], "color": "#1E5C99"}, {"h": 0.2, "k": "panel", "w": 0.1, "pos": [0, 0.9299999999999999, 0.10600000000000001], "color": "#1E5C99"}, {"h": 0.2, "k": "panel", "w": 0.1, "pos": [0.17, 0.9299999999999999, 0.10600000000000001], "color": "#1E5C99"}, {"d": 0.03, "h": 0.07, "k": "box", "w": 0.05, "x": -0.17, "y": 0.9299999999999999, "color": "#7A5A3A", "detail": true}, {"d": 0.03, "h": 0.07, "k": "box", "w": 0.05, "x": 0, "y": 0.9299999999999999, "color": "#7A5A3A", "detail": true}, {"d": 0.03, "h": 0.07, "k": "box", "w": 0.05, "x": 0.17, "y": 0.9299999999999999, "color": "#7A5A3A", "detail": true}, {"k": "cross", "s": 0.35, "y": 1.4100000000000001, "z": 0, "color": "#7A5A3A"}, {"h": 0.28, "k": "panel", "w": 0.14, "pos": [0, 0.31, 0.10600000000000001], "color": "#1E5C99"}]	\N	118	2026-08-03 01:12:42.222919	2026-08-03 01:12:42.222919
120	santorini_boutique_hotel	부티크 호텔	SANTORINI	NORMAL	300	f	0.684	0.601	1.661	[{"d": 0.5, "k": "plinth", "w": 0.6, "color": "#E6E2D6"}, {"d": 0.5, "h": 0.5, "k": "box", "w": 0.6, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.8, "from": 0.3, "glow": 0.26, "color": "#3FA9C9"}}, {"d": 0.42, "h": 0.44, "k": "box", "w": 0.46, "y": 0.5700000000000001, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.8, "from": 0.25, "glow": 0.26, "color": "#3FA9C9"}}, {"d": 0.34, "h": 0.4, "k": "box", "w": 0.32, "y": 1.01, "color": "#E6E2D6", "rough": 0.85}, {"h": 0.1, "k": "cyl", "y": 1.4100000000000001, "rb": 0.14, "rt": 0.13, "seg": 14, "color": "#F2F0EA"}, {"k": "roof", "w": 0.42, "y": 1.51, "type": "dome", "color": "#2A6FB0"}, {"d": 0.5, "k": "parapet", "w": 0.6, "y": 0.5700000000000001, "color": "#F2F0EA"}, {"d": 0.42, "k": "parapet", "w": 0.46, "y": 1.01, "color": "#F2F0EA"}, {"k": "parasol", "pos": [0.2, 0.5700000000000001, 0.16], "color": "#3FA9C9"}, {"k": "parasol", "pos": [-0.16, 1.01, 0.1], "color": "#C56A3E"}, {"d": 0.514, "h": 0.028, "k": "box", "w": 0.614, "y": 0.32, "color": "#1E5C99"}, {"h": 0.24, "k": "panel", "w": 0.12, "pos": [0.16, 0.21000000000000002, 0.256], "color": "#1E5C99"}]	\N	119	2026-08-03 01:12:42.224451	2026-08-03 01:12:42.224451
140	scifi_hq_tower	콜로니 본사	SCIFI	NORMAL	300	f	0.547	0.586	2.445	[{"d": 0.44, "k": "plinth", "w": 0.48, "color": "#12203A"}, {"d": 0.44, "h": 1.8, "k": "box", "w": 0.48, "y": 0.07, "color": "#E8EEF2", "metal": 0.45, "rough": 0.3, "windows": {"to": 0.92, "from": 0.08, "glow": 0.4, "color": "#4FE3FF"}}, {"d": 0.016, "h": 1.8, "k": "box", "w": 0.016, "x": -0.2064, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"d": 0.016, "h": 1.8, "k": "box", "w": 0.016, "x": -0.12383999999999999, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"d": 0.016, "h": 1.8, "k": "box", "w": 0.016, "x": -0.04127999999999999, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"d": 0.016, "h": 1.8, "k": "box", "w": 0.016, "x": 0.04127999999999999, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"d": 0.016, "h": 1.8, "k": "box", "w": 0.016, "x": 0.12384000000000002, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"d": 0.016, "h": 1.8, "k": "box", "w": 0.016, "x": 0.2064, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"d": 0.46, "h": 0.02, "k": "box", "w": 0.5, "x": 0, "y": 0.6699999999999999, "z": 0, "color": "#4FE3FF", "emissive": true}, {"d": 0.46, "h": 0.02, "k": "box", "w": 0.5, "x": 0, "y": 1.27, "z": 0, "color": "#4FE3FF", "emissive": true}, {"h": 0.2, "k": "cyl", "y": 1.87, "rb": 0.22, "rt": 0.16, "seg": 14, "color": "#AEB8C2"}, {"k": "roof", "w": 0.4, "y": 2.07, "type": "dome", "color": "#8FD4E8"}, {"h": 0.35, "k": "antenna", "y": 2.07}, {"d": 0.44, "k": "storefront", "w": 0.48, "sign": "#4FE3FF", "faceH": 0.3, "awning": "#12203A"}]	\N	139	2026-08-03 01:12:42.250038	2026-08-03 01:12:42.250038
121	santorini_cliff_villa	절벽 빌라	SANTORINI	NORMAL	300	f	0.745	0.548	1.490	[{"d": 0.46, "k": "plinth", "w": 0.64, "color": "#E6E2D6"}, {"d": 0.46, "h": 0.4, "k": "box", "w": 0.64, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.8, "from": 0.35, "glow": 0.26, "color": "#3FA9C9"}}, {"d": 0.44, "h": 0.36, "k": "box", "w": 0.5, "x": -0.07, "y": 0.47000000000000003, "color": "#E6E2D6", "rough": 0.85, "windows": {"to": 0.8, "from": 0.35, "glow": 0.26, "color": "#3FA9C9"}}, {"d": 0.42, "h": 0.34, "k": "box", "w": 0.36, "x": -0.14, "y": 0.8300000000000001, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.8, "from": 0.35, "glow": 0.26, "color": "#3FA9C9"}}, {"d": 0.4, "h": 0.32, "k": "box", "w": 0.24, "x": -0.2, "y": 1.1700000000000002, "color": "#E6E2D6", "rough": 0.85}, {"d": 0.46, "k": "parapet", "w": 0.64, "y": 0.47000000000000003, "color": "#F2F0EA"}, {"d": 0.44, "h": 0.05, "k": "box", "w": 0.5, "x": -0.07, "y": 0.8300000000000001, "color": "#F2F0EA"}, {"d": 0.05, "h": 0.05, "k": "box", "w": 0.05, "x": 0.28, "y": 0.47000000000000003, "color": "#2A6FB0", "detail": true}, {"h": 0.2, "k": "panel", "w": 0.1, "pos": [0.24, 0.2, 0.23600000000000002], "color": "#1E5C99"}, {"h": 0.18, "k": "panel", "w": 0.1, "pos": [0.06, 0.5900000000000001, 0.226], "color": "#1E5C99"}, {"k": "parasol", "pos": [0.24, 0.47000000000000003, 0.14], "color": "#3FA9C9"}]	\N	120	2026-08-03 01:12:42.225493	2026-08-03 01:12:42.225493
122	santorini_cave_house	동굴집	SANTORINI	NORMAL	300	f	0.744	0.744	1.270	[{"d": 0.5, "k": "plinth", "w": 0.56, "color": "#E6E2D6"}, {"d": 0.5, "h": 0.44, "k": "box", "w": 0.56, "y": 0.07, "color": "#F2F0EA", "rough": 0.85}, {"d": 0.54, "k": "roof", "w": 0.6, "y": 0.51, "type": "round", "color": "#F2F0EA"}, {"d": 0.44, "h": 0.34, "k": "box", "w": 0.38, "x": -0.07, "y": 0.51, "color": "#F2F0EA", "rough": 0.85}, {"d": 0.48, "k": "roof", "w": 0.42, "y": 0.8500000000000001, "type": "round", "color": "#E6E2D6"}, {"d": 0.38, "h": 0.3, "k": "box", "w": 0.22, "x": -0.14, "y": 0.8500000000000001, "color": "#F2F0EA", "rough": 0.85}, {"d": 0.42, "k": "roof", "w": 0.26, "y": 1.1500000000000001, "type": "round", "color": "#F2F0EA"}, {"h": 0.26, "k": "panel", "w": 0.14, "pos": [0.16, 0.22, 0.256], "color": "#1E5C99"}, {"h": 0.16, "k": "panel", "w": 0.1, "pos": [-0.16, 0.25, 0.256], "glow": 0.15, "color": "#3FA9C9"}, {"h": 0.14, "k": "panel", "w": 0.08, "pos": [-0.02, 0.6300000000000001, 0.226], "color": "#1E5C99"}, {"k": "parasol", "pos": [0.2, 0.51, 0.16], "color": "#C56A3E"}]	\N	121	2026-08-03 01:12:42.226553	2026-08-03 01:12:42.226553
123	santorini_stepped_apartment	계단식 아파트	SANTORINI	NORMAL	300	f	0.730	0.539	1.710	[{"d": 0.42, "k": "plinth", "w": 0.64, "color": "#E6E2D6"}, {"d": 0.42, "h": 0.44, "k": "box", "w": 0.64, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.82, "from": 0.25, "glow": 0.26, "color": "#3FA9C9"}}, {"d": 0.36, "h": 0.42, "k": "box", "w": 0.56, "y": 0.51, "z": -0.03, "color": "#E6E2D6", "rough": 0.85, "windows": {"to": 0.82, "from": 0.25, "glow": 0.26, "color": "#3FA9C9"}}, {"d": 0.32, "h": 0.4, "k": "box", "w": 0.46, "y": 0.9299999999999999, "z": -0.05, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.82, "from": 0.25, "glow": 0.26, "color": "#3FA9C9"}}, {"d": 0.28, "h": 0.38, "k": "box", "w": 0.34, "y": 1.33, "z": -0.07, "color": "#E6E2D6", "rough": 0.85}, {"d": 0.42, "k": "parapet", "w": 0.64, "y": 0.51, "color": "#F2F0EA"}, {"d": 0.36, "h": 0.05, "k": "box", "w": 0.56, "y": 0.9299999999999999, "z": -0.03, "color": "#F2F0EA"}, {"d": 0.434, "h": 0.028, "k": "box", "w": 0.654, "y": 0.29000000000000004, "color": "#1E5C99"}, {"k": "parasol", "pos": [0.22, 0.51, 0.16], "color": "#3FA9C9"}, {"k": "parasol", "pos": [0.16, 0.9299999999999999, 0.1], "color": "#C56A3E"}]	\N	122	2026-08-03 01:12:42.227583	2026-08-03 01:12:42.227583
124	santorini_villa_pool	풀 빌라	SANTORINI	NORMAL	300	f	0.730	0.580	1.171	[{"d": 0.48, "k": "plinth", "w": 0.64, "color": "#E6E2D6"}, {"d": 0.48, "h": 0.5, "k": "box", "w": 0.4, "x": -0.11, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.8, "from": 0.3, "glow": 0.26, "color": "#3FA9C9"}}, {"d": 0.48, "h": 0.5, "k": "box", "w": 0.4, "x": -0.11, "y": 0.5700000000000001, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.8, "from": 0.3, "glow": 0.26, "color": "#3FA9C9"}}, {"d": 0.3, "h": 0.4, "k": "box", "w": 0.24, "x": 0.2, "y": 0.07, "z": -0.08, "color": "#E6E2D6", "rough": 0.85}, {"d": 0.48, "h": 0.05, "k": "box", "w": 0.4, "x": -0.11, "y": 0.5700000000000001, "color": "#F2F0EA"}, {"d": 0.48, "h": 0.05, "k": "box", "w": 0.4, "x": -0.11, "y": 1.07, "color": "#F2F0EA"}, {"k": "roof", "w": 0.28, "y": 1.07, "type": "dome", "color": "#2A6FB0"}, {"d": 0.42, "h": 0.05, "k": "box", "w": 0.26, "x": 0.22, "y": 0.07, "color": "#3FA9C9", "emissive": true}, {"k": "parasol", "pos": [0.22, 0.12000000000000001, 0.12], "color": "#F2F0EA"}, {"h": 0.22, "k": "panel", "w": 0.1, "pos": [-0.11, 0.21000000000000002, 0.256], "color": "#1E5C99"}, {"h": 0.18, "k": "panel", "w": 0.1, "pos": [-0.11, 0.71, 0.256], "color": "#1E5C99"}]	\N	123	2026-08-03 01:12:42.228595	2026-08-03 01:12:42.228595
188	nordic_rune_stone	룬스톤	NORDIC	NORMAL	300	f	0.572	0.479	1.710	[{"d": 0.42, "k": "plinth", "w": 0.46, "color": "#8A8681"}, {"d": 0.34, "h": 0.24, "k": "box", "w": 0.2, "y": 0.07, "color": "#6E6A64", "rough": 0.95}, {"d": 0.14, "h": 1.2, "k": "box", "w": 0.34, "y": 0.31, "color": "#7A766E", "rough": 0.95}, {"d": 0.16, "h": 0.2, "k": "box", "w": 0.28, "y": 1.51, "color": "#6E6A64", "rough": 0.95}, {"h": 0.7, "k": "panel", "w": 0.16, "pos": [0, 0.77, 0.07600000000000001], "glow": 0.4, "color": "#5FE0B0"}, {"h": 0.1, "k": "panel", "w": 0.1, "pos": [0, 1.51, 0.08600000000000001], "glow": 0.4, "color": "#5FA0E0"}, {"d": 0.1, "h": 0.6, "k": "box", "w": 0.14, "x": 0.24, "y": 0.07, "z": -0.06, "color": "#6E6A64", "rough": 0.95}]	\N	187	2026-08-03 01:12:42.298646	2026-08-03 01:12:42.298646
125	santorini_cityhall	시청	SANTORINI	NORMAL	300	f	0.707	0.703	1.740	[{"d": 0.5, "k": "plinth", "w": 0.62, "color": "#E6E2D6"}, {"d": 0.5, "h": 0.9, "k": "box", "w": 0.62, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.8, "from": 0.2, "glow": 0.26, "color": "#3FA9C9"}}, {"d": 0.5, "h": 0.66, "k": "columns", "w": 0.62, "y": 0.07, "color": "#E6E2D6", "count": 6}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.42, "y": 0.07, "z": 0.39, "color": "#E6E2D6"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.38, "y": 0.098, "z": 0.35000000000000003, "color": "#E6E2D6"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.33999999999999997, "y": 0.126, "z": 0.31, "color": "#E6E2D6"}, {"d": 0.54, "h": 0.06, "k": "box", "w": 0.66, "y": 0.97, "color": "#E6E2D6"}, {"d": 0.24, "h": 0.34, "k": "box", "w": 0.24, "y": 1.03, "color": "#F2F0EA", "rough": 0.85}, {"k": "clock", "w": 0.24, "y": 1.23, "color": "#1E5C99"}, {"h": 0.08, "k": "cyl", "y": 1.37, "rb": 0.14, "rt": 0.14, "seg": 14, "color": "#F2F0EA"}, {"k": "roof", "w": 0.36, "y": 1.45, "type": "dome", "color": "#2A6FB0"}, {"d": 0.02, "h": 0.12, "k": "box", "w": 0.02, "y": 1.62, "color": "#C9A24B", "detail": true, "emissive": true}, {"h": 0.08, "k": "panel", "w": 0.3, "pos": [0, 0.69, 0.268], "color": "#1E5C99"}]	\N	124	2026-08-03 01:12:42.229687	2026-08-03 01:12:42.229687
126	santorini_bell_tower	종탑	SANTORINI	NORMAL	300	f	0.433	0.471	2.300	[{"d": 0.36, "k": "plinth", "w": 0.38, "color": "#E6E2D6"}, {"d": 0.32, "h": 1.5, "k": "box", "w": 0.32, "y": 0.07, "color": "#F2F0EA", "rough": 0.85}, {"d": 0.334, "h": 0.028, "k": "box", "w": 0.334, "y": 0.5700000000000001, "color": "#E6E2D6"}, {"d": 0.334, "h": 0.028, "k": "box", "w": 0.334, "y": 1.07, "color": "#E6E2D6"}, {"d": 0.36, "h": 0.32, "k": "box", "w": 0.36, "y": 1.57, "color": "#F2F0EA", "rough": 0.85}, {"h": 0.22, "k": "panel", "w": 0.16, "pos": [0, 1.6900000000000002, 0.186], "color": "#1E5C99"}, {"h": 0.08, "k": "cyl", "y": 1.8900000000000001, "rb": 0.14, "rt": 0.13, "seg": 14, "color": "#F2F0EA"}, {"k": "roof", "w": 0.4, "y": 1.97, "type": "dome", "color": "#2A6FB0"}, {"d": 0.02, "h": 0.14, "k": "box", "w": 0.02, "y": 2.13, "color": "#F2F0EA"}, {"k": "cross", "s": 0.35, "y": 2.27, "color": "#F2F0EA"}, {"h": 0.5, "k": "panel", "w": 0.08, "pos": [0, 0.77, 0.166], "glow": 0.12, "color": "#3FA9C9"}, {"h": 0.22, "k": "panel", "w": 0.1, "pos": [0, 0.21000000000000002, 0.166], "color": "#1E5C99"}]	\N	125	2026-08-03 01:12:42.230717	2026-08-03 01:12:42.230717
127	santorini_chapel	예배당	SANTORINI	NORMAL	300	f	0.572	0.600	1.100	[{"d": 0.46, "k": "plinth", "w": 0.46, "color": "#E6E2D6"}, {"d": 0.42, "h": 0.6, "k": "box", "w": 0.42, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.7, "from": 0.25, "glow": 0.12, "color": "#1E5C99"}}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.22, "y": 0.07, "z": 0.31, "color": "#E6E2D6"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.18, "y": 0.098, "z": 0.27, "color": "#E6E2D6"}, {"h": 0.14, "k": "cyl", "y": 0.6699999999999999, "rb": 0.17, "rt": 0.15, "seg": 14, "color": "#F2F0EA"}, {"k": "roof", "w": 0.44, "y": 0.81, "type": "dome", "color": "#2A6FB0"}, {"k": "cross", "s": 0.35, "y": 1.07, "color": "#F2F0EA"}, {"d": 0.16, "h": 0.34, "k": "box", "w": 0.16, "x": 0.22, "y": 0.07, "z": 0.1, "color": "#F2F0EA", "rough": 0.85}, {"d": 0.18, "h": 0.08, "k": "box", "w": 0.18, "x": 0.22, "y": 0.41000000000000003, "z": 0.1, "color": "#2A6FB0"}, {"d": 0.05, "h": 0.28, "k": "box", "w": 0.28, "y": 0.6699999999999999, "z": 0.22, "color": "#F2F0EA", "rough": 0.85}, {"h": 0.12, "k": "panel", "w": 0.08, "pos": [0, 0.79, 0.256], "color": "#1E5C99"}, {"h": 0.24, "k": "panel", "w": 0.12, "pos": [0, 0.23, 0.226], "color": "#1E5C99"}]	\N	126	2026-08-03 01:12:42.231793	2026-08-03 01:12:42.231793
128	santorini_museum	미술관	SANTORINI	NORMAL	300	f	0.868	0.872	1.314	[{"d": 0.5, "k": "plinth", "w": 0.66, "color": "#E6E2D6"}, {"d": 0.5, "h": 0.8, "k": "box", "w": 0.66, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.75, "from": 0.3, "glow": 0.24, "color": "#3FA9C9"}}, {"d": 0.5, "h": 0.6, "k": "columns", "w": 0.66, "y": 0.07, "color": "#E6E2D6", "count": 7}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.44, "y": 0.07, "z": 0.39, "color": "#E6E2D6"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.4, "y": 0.098, "z": 0.35000000000000003, "color": "#E6E2D6"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.36, "y": 0.126, "z": 0.31, "color": "#E6E2D6"}, {"d": 0.4, "h": 0.2, "k": "box", "w": 0.4, "y": 0.8700000000000001, "color": "#F2F0EA", "rough": 0.85}, {"d": 0.54, "k": "roof", "w": 0.7, "y": 0.8700000000000001, "type": "round", "color": "#E6E2D6"}, {"h": 0.1, "k": "cyl", "y": 1.07, "rb": 0.16, "rt": 0.15, "seg": 14, "color": "#F2F0EA"}, {"k": "roof", "w": 0.4, "y": 1.1700000000000002, "type": "dome", "color": "#2A6FB0"}, {"h": 0.1, "k": "panel", "w": 0.34, "pos": [0, 0.69, 0.268], "color": "#1E5C99"}]	\N	127	2026-08-03 01:12:42.233729	2026-08-03 01:12:42.233729
141	scifi_control_tower	관제 타워	SCIFI	NORMAL	300	f	0.480	0.648	2.495	[{"d": 0.4, "k": "plinth", "w": 0.4, "color": "#12203A"}, {"d": 0.34, "h": 0.3, "k": "box", "w": 0.34, "y": 0.07, "color": "#AEB8C2", "rough": 0.4}, {"d": 0.2, "h": 1.3, "k": "box", "w": 0.2, "y": 0.37, "color": "#AEB8C2", "metal": 0.5, "rough": 0.4}, {"d": 0.46, "h": 0.3, "k": "box", "w": 0.46, "y": 1.6700000000000002, "color": "#E8EEF2", "rough": 0.35, "windows": {"to": 0.8, "from": 0.2, "glow": 0.5, "color": "#4FE3FF"}}, {"k": "roof", "w": 0.48, "y": 1.97, "type": "dome", "color": "#8FD4E8"}, {"h": 0.34, "k": "antenna", "y": 2.13}, {"d": 0.48, "h": 0.02, "k": "box", "w": 0.48, "x": 0, "y": 1.6500000000000001, "z": 0, "color": "#4FE3FF", "emissive": true}, {"h": 0.06, "k": "panel", "w": 0.34, "pos": [0, 1.79, 0.23800000000000002], "glow": 0.6, "color": "#4FE3FF"}]	\N	140	2026-08-03 01:12:42.251071	2026-08-03 01:12:42.251071
129	santorini_gallery	갤러리	SANTORINI	NORMAL	300	f	0.593	0.702	1.510	[{"d": 0.48, "k": "plinth", "w": 0.52, "color": "#E6E2D6"}, {"d": 0.48, "h": 0.9, "k": "box", "w": 0.52, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.78, "from": 0.3, "glow": 0.26, "color": "#3FA9C9"}}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.2236, "y": 0.07, "z": 0.244, "color": "#E6E2D6"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.1118, "y": 0.07, "z": 0.244, "color": "#E6E2D6"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0, "y": 0.07, "z": 0.244, "color": "#E6E2D6"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.1118, "y": 0.07, "z": 0.244, "color": "#E6E2D6"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.2236, "y": 0.07, "z": 0.244, "color": "#E6E2D6"}, {"h": 0.12, "k": "cyl", "y": 0.97, "rb": 0.18, "rt": 0.16, "seg": 14, "color": "#F2F0EA"}, {"k": "roof", "w": 0.44, "y": 1.09, "type": "dome", "color": "#2A6FB0"}, {"d": 0.02, "h": 0.12, "k": "box", "w": 0.02, "y": 1.3900000000000001, "color": "#F2F0EA"}, {"d": 0.48, "k": "storefront", "w": 0.52, "sign": "#F2F0EA", "faceH": 0.32, "awning": "#2A6FB0"}, {"h": 0.1, "k": "panel", "w": 0.36, "pos": [0, 0.77, 0.248], "color": "#1E5C99"}]	\N	128	2026-08-03 01:12:42.237907	2026-08-03 01:12:42.237907
130	santorini_winery	와이너리	SANTORINI	NORMAL	300	f	0.794	0.794	1.210	[{"d": 0.48, "k": "plinth", "w": 0.6, "color": "#E6E2D6"}, {"d": 0.48, "h": 0.56, "k": "box", "w": 0.6, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.75, "from": 0.3, "glow": 0.24, "color": "#3FA9C9"}}, {"d": 0.52, "k": "roof", "w": 0.64, "y": 0.6300000000000001, "type": "round", "color": "#C56A3E"}, {"d": 0.4, "h": 0.4, "k": "box", "w": 0.4, "y": 0.69, "color": "#F2F0EA", "rough": 0.85}, {"d": 0.44, "k": "roof", "w": 0.44, "y": 1.09, "type": "round", "color": "#C56A3E"}, {"h": 0.3, "k": "panel", "w": 0.2, "pos": [0, 0.25, 0.246], "color": "#4A2A18"}, {"d": 0.1, "h": 0.14, "k": "box", "w": 0.1, "x": -0.22, "y": 0.07, "z": 0.24, "color": "#6E3A28", "detail": true}, {"d": 0.1, "h": 0.14, "k": "box", "w": 0.1, "x": 0.22, "y": 0.07, "z": 0.24, "color": "#6E3A28", "detail": true}, {"d": 0.48, "k": "storefront", "w": 0.4, "sign": "#C9A24B", "faceH": 0.28, "awning": "#6E2A2A"}]	\N	129	2026-08-03 01:12:42.239126	2026-08-03 01:12:42.239126
131	santorini_taverna	타베르나	SANTORINI	NORMAL	300	f	0.585	0.693	1.110	[{"d": 0.44, "k": "plinth", "w": 0.5, "color": "#E6E2D6"}, {"d": 0.44, "h": 0.5, "k": "box", "w": 0.5, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.82, "from": 0.45, "glow": 0.28, "color": "#3FA9C9"}}, {"d": 0.4, "h": 0.42, "k": "box", "w": 0.42, "y": 0.5700000000000001, "z": -0.02, "color": "#E6E2D6", "rough": 0.85, "windows": {"to": 0.8, "from": 0.2, "glow": 0.28, "color": "#3FA9C9"}}, {"d": 0.44, "k": "roof", "w": 0.46, "y": 0.99, "type": "round", "color": "#3FA9C9"}, {"d": 0.44, "k": "parapet", "w": 0.5, "y": 0.5700000000000001, "color": "#F2F0EA"}, {"d": 0.44, "k": "storefront", "w": 0.5, "sign": "#F2F0EA", "faceH": 0.3, "awning": "#2A6FB0"}, {"k": "parasol", "pos": [0.16, 0.5700000000000001, 0.12], "color": "#2A6FB0"}, {"k": "parasol", "pos": [-0.14, 0.5700000000000001, -0.1], "color": "#C56A3E"}, {"h": 0.08, "k": "panel", "w": 0.34, "pos": [0, 0.47000000000000003, 0.23800000000000002], "color": "#1E5C99"}]	\N	130	2026-08-03 01:12:42.240259	2026-08-03 01:12:42.240259
132	santorini_bakery	베이커리	SANTORINI	NORMAL	300	f	0.524	0.581	1.240	[{"d": 0.44, "k": "plinth", "w": 0.46, "color": "#E6E2D6"}, {"d": 0.44, "h": 0.5, "k": "box", "w": 0.46, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.82, "from": 0.45, "glow": 0.28, "color": "#3FA9C9"}}, {"d": 0.4, "h": 0.44, "k": "box", "w": 0.4, "y": 0.5700000000000001, "color": "#E6E2D6", "rough": 0.85, "windows": {"to": 0.8, "from": 0.2, "glow": 0.28, "color": "#3FA9C9"}}, {"h": 0.1, "k": "cyl", "y": 1.01, "rb": 0.15, "rt": 0.14, "seg": 14, "color": "#F2F0EA"}, {"k": "roof", "w": 0.36, "y": 1.11, "type": "dome", "color": "#C56A3E"}, {"d": 0.44, "k": "parapet", "w": 0.46, "y": 0.5700000000000001, "color": "#F2F0EA"}, {"d": 0.44, "k": "storefront", "w": 0.46, "sign": "#1E5C99", "faceH": 0.32, "awning": "#C56A3E"}, {"h": 0.12, "k": "panel", "w": 0.12, "pos": [0, 0.6100000000000001, 0.23800000000000002], "glow": 0.2, "color": "#C9A24B"}]	\N	131	2026-08-03 01:12:42.241215	2026-08-03 01:12:42.241215
133	santorini_gift_shop	기념품점	SANTORINI	NORMAL	300	f	0.560	0.555	1.170	[{"d": 0.42, "k": "plinth", "w": 0.44, "color": "#E6E2D6"}, {"d": 0.42, "h": 0.5, "k": "box", "w": 0.44, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.82, "from": 0.45, "glow": 0.3, "color": "#3FA9C9"}}, {"d": 0.38, "h": 0.44, "k": "box", "w": 0.4, "y": 0.5700000000000001, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#3FA9C9"}}, {"d": 0.18, "h": 1, "k": "box", "w": 0.18, "x": 0.2, "y": 0.07, "z": 0.16, "color": "#E6E2D6", "rough": 0.85}, {"d": 0.2, "h": 0.1, "k": "box", "w": 0.2, "x": 0.2, "y": 1.07, "z": 0.16, "color": "#2A6FB0"}, {"d": 0.38, "k": "parapet", "w": 0.4, "y": 1.01, "color": "#F2F0EA"}, {"d": 0.42, "k": "storefront", "w": 0.44, "sign": "#C56A3E", "faceH": 0.3, "awning": "#3FA9C9"}, {"k": "parasol", "pos": [-0.12, 0.5700000000000001, 0.1], "color": "#C56A3E"}, {"h": 0.18, "k": "panel", "w": 0.08, "pos": [-0.14, 0.21000000000000002, 0.216], "color": "#1E5C99"}]	\N	132	2026-08-03 01:12:42.242215	2026-08-03 01:12:42.242215
134	santorini_gelato	돔 전망카페	SANTORINI	NORMAL	300	f	0.519	0.566	1.650	[{"d": 0.4, "k": "plinth", "w": 0.42, "color": "#E6E2D6"}, {"d": 0.4, "h": 0.5, "k": "box", "w": 0.42, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.82, "from": 0.4, "glow": 0.3, "color": "#3FA9C9"}}, {"d": 0.3, "h": 0.6, "k": "box", "w": 0.3, "y": 0.5700000000000001, "color": "#E6E2D6", "rough": 0.85, "windows": {"to": 0.85, "from": 0.15, "glow": 0.3, "color": "#3FA9C9"}}, {"h": 0.16, "k": "cyl", "y": 1.1700000000000002, "rb": 0.16, "rt": 0.18, "seg": 14, "color": "#F2F0EA"}, {"k": "roof", "w": 0.5, "y": 1.33, "type": "dome", "color": "#E48ABF"}, {"d": 0.02, "h": 0.12, "k": "box", "w": 0.02, "y": 1.53, "color": "#F2F0EA"}, {"d": 0.4, "k": "storefront", "w": 0.42, "sign": "#F2F0EA", "faceH": 0.28, "awning": "#E48ABF"}, {"k": "parasol", "pos": [0.14, 0.5700000000000001, 0.1], "color": "#E48ABF"}, {"h": 0.08, "k": "panel", "w": 0.24, "pos": [0, 0.47000000000000003, 0.218], "glow": 0.3, "color": "#3FA9C9"}]	\N	133	2026-08-03 01:12:42.243234	2026-08-03 01:12:42.243234
135	santorini_cafe_terrace	카페 테라스	SANTORINI	NORMAL	300	f	0.659	0.605	1.510	[{"d": 0.44, "k": "plinth", "w": 0.56, "color": "#E6E2D6"}, {"d": 0.44, "h": 0.5, "k": "box", "w": 0.56, "y": 0.07, "color": "#F2F0EA", "rough": 0.85, "windows": {"to": 0.82, "from": 0.45, "glow": 0.28, "color": "#3FA9C9"}}, {"d": 0.4, "h": 0.44, "k": "box", "w": 0.42, "x": -0.07, "y": 0.5700000000000001, "color": "#E6E2D6", "rough": 0.85, "windows": {"to": 0.8, "from": 0.2, "glow": 0.28, "color": "#3FA9C9"}}, {"d": 0.36, "h": 0.4, "k": "box", "w": 0.28, "x": -0.14, "y": 1.01, "color": "#F2F0EA", "rough": 0.85}, {"d": 0.44, "k": "parapet", "w": 0.56, "y": 0.5700000000000001, "color": "#F2F0EA"}, {"d": 0.4, "h": 0.05, "k": "box", "w": 0.42, "x": -0.07, "y": 1.01, "color": "#F2F0EA"}, {"d": 0.22, "h": 0.1, "k": "box", "w": 0.22, "x": -0.14, "y": 1.4100000000000001, "color": "#2A6FB0"}, {"d": 0.44, "k": "storefront", "w": 0.56, "sign": "#1E5C99", "faceH": 0.3, "awning": "#3FA9C9"}, {"k": "parasol", "pos": [0.2, 0.5700000000000001, 0.14], "color": "#C56A3E"}, {"k": "parasol", "pos": [0.1, 1.01, 0.08], "color": "#3FA9C9"}]	\N	134	2026-08-03 01:12:42.244238	2026-08-03 01:12:42.244238
136	scifi_arcology	아콜로지 초고층	SCIFI	NORMAL	300	f	0.775	0.846	3.515	[{"d": 0.68, "k": "plinth", "w": 0.68, "color": "#12203A"}, {"d": 0.68, "h": 0.12, "k": "box", "w": 0.68, "y": 0.07, "color": "#AEB8C2"}, {"d": 0.62, "h": 1, "k": "box", "w": 0.62, "y": 0.19, "color": "#E8EEF2", "metal": 0.4, "rough": 0.35, "windows": {"to": 0.95, "from": 0.1, "glow": 0.45, "color": "#4FE3FF"}}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": -0.2666, "y": 0.19, "z": 0.314, "color": "#8FD4E8"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": -0.17773333333333335, "y": 0.19, "z": 0.314, "color": "#8FD4E8"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": -0.08886666666666668, "y": 0.19, "z": 0.314, "color": "#8FD4E8"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": 0, "y": 0.19, "z": 0.314, "color": "#8FD4E8"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": 0.08886666666666665, "y": 0.19, "z": 0.314, "color": "#8FD4E8"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": 0.17773333333333335, "y": 0.19, "z": 0.314, "color": "#8FD4E8"}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": 0.2666, "y": 0.19, "z": 0.314, "color": "#8FD4E8"}, {"d": 0.64, "h": 0.02, "k": "box", "w": 0.64, "x": 0, "y": 0.69, "z": 0, "color": "#4FE3FF", "emissive": true}, {"d": 0.48, "h": 0.9, "k": "box", "w": 0.48, "y": 1.1900000000000002, "color": "#E8EEF2", "metal": 0.4, "rough": 0.35, "windows": {"to": 0.95, "from": 0.1, "glow": 0.45, "color": "#4FE3FF"}}, {"d": 0.5, "h": 0.02, "k": "box", "w": 0.5, "x": 0, "y": 1.6700000000000002, "z": 0, "color": "#4FE3FF", "emissive": true}, {"d": 0.32, "h": 0.85, "k": "box", "w": 0.32, "y": 2.09, "color": "#D2DAE2", "metal": 0.4, "rough": 0.35, "windows": {"to": 0.95, "from": 0.1, "glow": 0.45, "color": "#4FE3FF"}}, {"h": 0.2, "k": "cyl", "y": 2.94, "rb": 0.16, "rt": 0.1, "seg": 14, "color": "#AEB8C2"}, {"k": "roof", "w": 0.3, "y": 3.1399999999999997, "type": "dome", "color": "#8FD4E8"}, {"h": 0.35, "k": "antenna", "y": 3.1399999999999997}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": -0.3, "y": 0.19, "z": 0.3, "color": "#4FE3FF", "emissive": true}, {"d": 0.02, "h": 1, "k": "box", "w": 0.02, "x": 0.3, "y": 0.19, "z": 0.3, "color": "#4FE3FF", "emissive": true}, {"d": 0.62, "k": "storefront", "w": 0.62, "sign": "#4FE3FF", "faceH": 0.32, "awning": "#12203A"}]	\N	135	2026-08-03 01:12:42.245539	2026-08-03 01:12:42.245539
137	scifi_spaceport_control	스페이스포트 관제탑	SCIFI	NORMAL	300	f	0.720	0.720	2.835	[{"d": 0.5, "k": "plinth", "w": 0.5, "color": "#12203A"}, {"d": 0.4, "h": 0.3, "k": "box", "w": 0.4, "y": 0.07, "color": "#E8EEF2", "rough": 0.4, "windows": {"to": 0.8, "from": 0.2, "glow": 0.4, "color": "#4FE3FF"}}, {"h": 1.6, "k": "cyl", "y": 0.37, "rb": 0.16, "rt": 0.12, "seg": 14, "color": "#E8EEF2"}, {"h": 0.04, "k": "cyl", "y": 0.97, "rb": 0.18, "rt": 0.18, "seg": 14, "color": "#4FE3FF", "detail": true}, {"h": 0.24, "k": "cyl", "y": 1.97, "rb": 0.26, "rt": 0.34, "seg": 16, "color": "#E8EEF2"}, {"h": 0.12, "k": "cyl", "y": 2.21, "rb": 0.34, "rt": 0.3, "seg": 16, "color": "#12203A"}, {"h": 0.03, "k": "cyl", "y": 2.09, "rb": 0.36, "rt": 0.36, "seg": 16, "color": "#4FE3FF", "detail": true}, {"k": "roof", "w": 0.6, "y": 2.3299999999999996, "type": "dome", "color": "#8FD4E8"}, {"h": 0.3, "k": "antenna", "y": 2.51}, {"d": 0.06, "h": 1, "k": "box", "w": 0.06, "x": 0.16, "y": 0.37, "z": 0.1, "color": "#AEB8C2", "detail": true}]	\N	136	2026-08-03 01:12:42.246745	2026-08-03 01:12:42.246745
138	scifi_beacon_spire	비콘 스파이어	SCIFI	NORMAL	300	f	0.502	0.569	3.145	[{"d": 0.44, "k": "plinth", "w": 0.44, "color": "#12203A"}, {"d": 0.4, "h": 0.5, "k": "box", "w": 0.4, "y": 0.07, "color": "#E8EEF2", "rough": 0.4, "windows": {"to": 0.8, "from": 0.2, "glow": 0.4, "color": "#4FE3FF"}}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": -0.17200000000000001, "y": 0.07, "z": 0.20400000000000001, "color": "#8FD4E8"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": -0.05733333333333335, "y": 0.07, "z": 0.20400000000000001, "color": "#8FD4E8"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": 0.057333333333333326, "y": 0.07, "z": 0.20400000000000001, "color": "#8FD4E8"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.02, "x": 0.17200000000000001, "y": 0.07, "z": 0.20400000000000001, "color": "#8FD4E8"}, {"h": 2, "k": "cyl", "y": 0.5700000000000001, "rb": 0.14, "rt": 0.04, "seg": 10, "color": "#AEB8C2"}, {"h": 0.1, "k": "cyl", "y": 0.97, "rb": 0.08, "rt": 0.08, "seg": 12, "color": "#4FE3FF", "detail": true}, {"h": 0.1, "k": "cyl", "y": 1.57, "rb": 0.06, "rt": 0.06, "seg": 12, "color": "#4FE3FF", "detail": true}, {"h": 0.14, "k": "cyl", "y": 2.17, "rb": 0.05, "rt": 0.05, "seg": 12, "color": "#4FE3FF", "detail": true}, {"d": 0.2, "h": 0.2, "k": "box", "w": 0.2, "y": 2.57, "color": "#D2DAE2", "rough": 0.4}, {"h": 0.35, "k": "antenna", "y": 2.77}, {"h": 0.06, "k": "panel", "w": 0.3, "pos": [0, 0.97, 0.168], "glow": 0.6, "color": "#4FE3FF"}]	\N	137	2026-08-03 01:12:42.247742	2026-08-03 01:12:42.247742
139	scifi_ring_station	링 스테이션 타워	SCIFI	NORMAL	300	f	0.720	0.720	2.555	[{"d": 0.5, "k": "plinth", "w": 0.5, "color": "#12203A"}, {"h": 2, "k": "cyl", "y": 0.07, "rb": 0.18, "rt": 0.15, "seg": 14, "color": "#E8EEF2"}, {"h": 0.06, "k": "cyl", "y": 0.6699999999999999, "rb": 0.36, "rt": 0.36, "seg": 20, "color": "#4FE3FF", "detail": true}, {"h": 0.06, "k": "cyl", "y": 1.27, "rb": 0.36, "rt": 0.36, "seg": 20, "color": "#4FE3FF", "detail": true}, {"h": 0.06, "k": "cyl", "y": 1.77, "rb": 0.3, "rt": 0.3, "seg": 20, "color": "#4FE3FF", "detail": true}, {"h": 0.16, "k": "cyl", "y": 2.07, "rb": 0.15, "rt": 0.19, "seg": 14, "color": "#AEB8C2"}, {"k": "roof", "w": 0.32, "y": 2.23, "type": "dome", "color": "#8FD4E8"}, {"h": 0.3, "k": "antenna", "y": 2.23}, {"h": 0.4, "k": "panel", "w": 0.06, "pos": [0, 1.07, 0.166], "glow": 0.4, "color": "#4FE3FF"}]	\N	138	2026-08-03 01:12:42.248993	2026-08-03 01:12:42.248993
142	scifi_pod_tower	포드 타워	SCIFI	NORMAL	300	f	0.560	0.560	2.075	[{"d": 0.42, "k": "plinth", "w": 0.42, "color": "#12203A"}, {"h": 1.7, "k": "cyl", "y": 0.07, "rb": 0.16, "rt": 0.14, "seg": 14, "color": "#D2DAE2"}, {"h": 0.18, "k": "cyl", "y": 0.47000000000000003, "rb": 0.27, "rt": 0.27, "seg": 16, "color": "#E8EEF2"}, {"h": 0.18, "k": "cyl", "y": 0.97, "rb": 0.27, "rt": 0.27, "seg": 16, "color": "#E8EEF2"}, {"h": 0.18, "k": "cyl", "y": 1.47, "rb": 0.25, "rt": 0.25, "seg": 16, "color": "#E8EEF2"}, {"h": 0.03, "k": "cyl", "y": 0.6499999999999999, "rb": 0.28, "rt": 0.28, "seg": 16, "color": "#4FE3FF", "detail": true}, {"h": 0.03, "k": "cyl", "y": 1.1500000000000001, "rb": 0.28, "rt": 0.28, "seg": 16, "color": "#4FE3FF", "detail": true}, {"k": "roof", "w": 0.34, "y": 1.77, "type": "dome", "color": "#8FD4E8"}, {"h": 0.28, "k": "antenna", "y": 1.77}]	\N	141	2026-08-03 01:12:42.252083	2026-08-03 01:12:42.252083
143	scifi_capsule_housing	캡슐 주거	SCIFI	NORMAL	300	f	0.740	0.669	1.710	[{"d": 0.5, "k": "plinth", "w": 0.56, "color": "#12203A"}, {"d": 0.5, "h": 1.5, "k": "box", "w": 0.56, "y": 0.07, "color": "#D2DAE2", "metal": 0.3, "rough": 0.4, "windows": {"to": 0.95, "from": 0.08, "glow": 0.4, "color": "#4FE3FF"}}, {"d": 0.52, "h": 0.02, "k": "box", "w": 0.58, "x": 0, "y": 0.47000000000000003, "z": 0, "color": "#4FE3FF", "emissive": true}, {"d": 0.52, "h": 0.02, "k": "box", "w": 0.58, "x": 0, "y": 0.8700000000000001, "z": 0, "color": "#4FE3FF", "emissive": true}, {"d": 0.52, "h": 0.02, "k": "box", "w": 0.58, "x": 0, "y": 1.27, "z": 0, "color": "#4FE3FF", "emissive": true}, {"d": 0.1, "h": 0.14, "k": "box", "w": 0.14, "x": 0.30000000000000004, "y": 0.42, "z": 0.12, "color": "#AEB8C2"}, {"d": 0.1, "h": 0.14, "k": "box", "w": 0.14, "x": 0.30000000000000004, "y": 0.8200000000000001, "z": -0.14, "color": "#AEB8C2"}, {"d": 0.1, "h": 0.14, "k": "box", "w": 0.14, "x": -0.30000000000000004, "y": 0.6200000000000001, "z": 0.1, "color": "#AEB8C2"}, {"d": 0.1, "h": 0.14, "k": "box", "w": 0.14, "x": -0.30000000000000004, "y": 1.1700000000000002, "z": -0.14, "color": "#AEB8C2"}, {"d": 0.5, "k": "parapet", "w": 0.56, "y": 1.57, "color": "#12203A"}, {"k": "rooftopUnits", "w": 0.56, "y": 1.57}, {"d": 0.5, "k": "storefront", "w": 0.56, "sign": "#4FE3FF", "faceH": 0.3, "awning": "#12203A"}]	\N	142	2026-08-03 01:12:42.253144	2026-08-03 01:12:42.253144
144	scifi_fusion_plant	핵융합 발전소	SCIFI	NORMAL	300	f	0.798	0.841	1.430	[{"d": 0.62, "k": "plinth", "w": 0.7, "color": "#12203A"}, {"d": 0.62, "h": 0.5, "k": "box", "w": 0.7, "y": 0.07, "color": "#AEB8C2", "metal": 0.5, "rough": 0.4}, {"h": 0.5, "k": "cyl", "y": 0.5700000000000001, "rb": 0.28, "rt": 0.24, "seg": 16, "color": "#E8EEF2"}, {"h": 0.04, "k": "cyl", "y": 0.77, "rb": 0.28, "rt": 0.28, "seg": 16, "color": "#4FE3FF", "detail": true}, {"k": "roof", "w": 0.6, "y": 1.07, "type": "dome", "color": "#8FD4E8"}, {"d": 0.14, "h": 0.8, "k": "box", "w": 0.14, "x": -0.26, "y": 0.5700000000000001, "z": -0.18, "color": "#D2DAE2", "detail": true}, {"d": 0.14, "h": 0.8, "k": "box", "w": 0.14, "x": 0.26, "y": 0.5700000000000001, "z": -0.18, "color": "#D2DAE2", "detail": true}, {"d": 0.16, "h": 0.06, "k": "box", "w": 0.16, "x": -0.26, "y": 1.37, "z": -0.18, "color": "#AEB8C2", "detail": true}, {"d": 0.64, "h": 0.02, "k": "box", "w": 0.72, "x": 0, "y": 0.32, "z": 0, "color": "#4FE3FF", "emissive": true}, {"h": 0.12, "k": "panel", "w": 0.34, "pos": [0, 0.37, 0.318], "glow": 0.7, "color": "#4FE3FF"}]	\N	143	2026-08-03 01:12:42.254152	2026-08-03 01:12:42.254152
145	scifi_lab_cube	랩 큐브	SCIFI	NORMAL	300	f	0.661	0.638	1.875	[{"d": 0.56, "k": "plinth", "w": 0.58, "color": "#12203A"}, {"d": 0.5, "h": 0.9, "k": "box", "w": 0.5, "y": 0.07, "color": "#E8EEF2", "metal": 0.4, "rough": 0.3, "windows": {"to": 0.8, "from": 0.2, "glow": 0.4, "color": "#4FE3FF"}}, {"d": 0.34, "h": 0.14, "k": "box", "w": 0.34, "y": 0.97, "color": "#AEB8C2"}, {"d": 0.58, "h": 0.44, "k": "box", "w": 0.58, "y": 1.11, "color": "#D2DAE2", "metal": 0.4, "rough": 0.3, "windows": {"to": 0.8, "from": 0.2, "glow": 0.4, "color": "#4FE3FF"}}, {"d": 0.6, "h": 0.02, "k": "box", "w": 0.6, "x": 0, "y": 1.33, "z": 0, "color": "#4FE3FF", "emissive": true}, {"d": 0.58, "k": "parapet", "w": 0.58, "y": 1.55, "color": "#12203A"}, {"d": 0.52, "h": 0.04, "k": "box", "w": 0.52, "y": 0.51, "color": "#4FE3FF", "emissive": true}, {"h": 0.3, "k": "antenna", "y": 1.55}, {"d": 0.06, "h": 0.14, "k": "box", "w": 0.06, "x": 0.24, "y": 0.97, "z": 0.24, "color": "#AEB8C2", "detail": true}]	\N	144	2026-08-03 01:12:42.255158	2026-08-03 01:12:42.255158
146	scifi_media_cube	미디어 큐브	SCIFI	NORMAL	300	f	0.956	0.956	2.215	[{"d": 0.5, "k": "plinth", "w": 0.5, "color": "#12203A"}, {"d": 0.5, "h": 1.4, "k": "box", "w": 0.5, "y": 0.07, "color": "#12203A", "metal": 0.5, "rough": 0.35}, {"d": 0.34, "h": 0.3, "k": "box", "w": 0.34, "y": 1.47, "color": "#AEB8C2", "rough": 0.4}, {"k": "roof", "w": 0.38, "y": 1.77, "type": "pyramid", "color": "#AEB8C2", "height": 0.12}, {"h": 0.3, "k": "antenna", "y": 1.8900000000000001}, {"h": 1.2, "k": "panel", "w": 0.44, "pos": [0, 0.8200000000000001, 0.258], "glow": 0.7, "color": "#4FE3FF"}, {"h": 1.2, "k": "panel", "w": 0.44, "pos": [0, 0.8200000000000001, -0.258], "glow": 0.7, "rotY": 3.1416, "color": "#4FA0FF"}, {"h": 1.2, "k": "panel", "w": 0.44, "pos": [0.258, 0.8200000000000001, 0], "glow": 0.65, "rotY": 1.5708, "color": "#39FFB0"}, {"h": 1.2, "k": "panel", "w": 0.44, "pos": [-0.258, 0.8200000000000001, 0], "glow": 0.65, "rotY": 1.5708, "color": "#FF6AC0"}]	\N	145	2026-08-03 01:12:42.256115	2026-08-03 01:12:42.256115
147	scifi_academy	콜로니 아카데미	SCIFI	NORMAL	300	f	0.752	0.723	1.885	[{"d": 0.5, "k": "plinth", "w": 0.66, "color": "#12203A"}, {"d": 0.5, "h": 0.9, "k": "box", "w": 0.66, "y": 0.07, "color": "#E8EEF2", "rough": 0.4, "windows": {"to": 0.8, "from": 0.2, "glow": 0.36, "color": "#4FE3FF"}}, {"d": 0.5, "h": 0.66, "k": "columns", "w": 0.66, "y": 0.07, "color": "#AEB8C2", "count": 6}, {"d": 0.55, "h": 0.05, "k": "box", "w": 0.7100000000000001, "y": 0.97, "color": "#4FE3FF"}, {"d": 0.34, "h": 0.34, "k": "box", "w": 0.34, "y": 1.02, "color": "#D2DAE2", "rough": 0.4}, {"h": 0.1, "k": "cyl", "y": 1.36, "rb": 0.2, "rt": 0.18, "seg": 14, "color": "#E8EEF2"}, {"k": "roof", "w": 0.48, "y": 1.46, "type": "dome", "color": "#8FD4E8"}, {"h": 0.24, "k": "antenna", "y": 1.62}, {"h": 0.1, "k": "panel", "w": 0.34, "pos": [0, 0.77, 0.268], "glow": 0.4, "color": "#4FE3FF"}]	\N	146	2026-08-03 01:12:42.257053	2026-08-03 01:12:42.257053
148	scifi_hydro_tower	하이드로 타워	SCIFI	NORMAL	300	f	0.560	0.560	2.195	[{"d": 0.44, "k": "plinth", "w": 0.44, "color": "#12203A"}, {"d": 0.3, "h": 0.3, "k": "box", "w": 0.3, "y": 0.07, "color": "#AEB8C2", "rough": 0.4}, {"h": 0.9, "k": "cyl", "y": 0.37, "rb": 0.13, "rt": 0.11, "seg": 12, "color": "#AEB8C2"}, {"h": 0.24, "k": "cyl", "y": 1.27, "rb": 0.2, "rt": 0.26, "seg": 16, "color": "#E8EEF2"}, {"h": 0.2, "k": "cyl", "y": 1.51, "rb": 0.26, "rt": 0.24, "seg": 16, "color": "#E8EEF2"}, {"k": "roof", "w": 0.52, "y": 1.71, "type": "dome", "color": "#8FD4E8"}, {"h": 0.03, "k": "cyl", "y": 1.49, "rb": 0.28, "rt": 0.28, "seg": 16, "color": "#4FE3FF", "detail": true}, {"h": 0.24, "k": "antenna", "y": 1.9300000000000002}, {"d": 0.06, "h": 0.9, "k": "box", "w": 0.06, "x": 0.16, "y": 0.37, "z": 0.05, "color": "#D2DAE2", "detail": true}]	\N	147	2026-08-03 01:12:42.258332	2026-08-03 01:12:42.258332
149	scifi_terrace_hab	테라스 주거	SCIFI	NORMAL	300	f	0.730	0.524	1.796	[{"d": 0.46, "k": "plinth", "w": 0.64, "color": "#12203A"}, {"d": 0.46, "h": 0.44, "k": "box", "w": 0.64, "y": 0.07, "color": "#E8EEF2", "rough": 0.4, "windows": {"to": 0.85, "from": 0.3, "glow": 0.36, "color": "#4FE3FF"}}, {"d": 0.4, "h": 0.42, "k": "box", "w": 0.52, "y": 0.51, "z": -0.04, "color": "#E8EEF2", "rough": 0.4, "windows": {"to": 0.85, "from": 0.3, "glow": 0.36, "color": "#4FE3FF"}}, {"d": 0.34, "h": 0.4, "k": "box", "w": 0.4, "y": 0.9299999999999999, "z": -0.08, "color": "#D2DAE2", "rough": 0.4, "windows": {"to": 0.85, "from": 0.3, "glow": 0.36, "color": "#4FE3FF"}}, {"d": 0.28, "h": 0.38, "k": "box", "w": 0.28, "y": 1.33, "z": -0.1, "color": "#E8EEF2", "rough": 0.4}, {"d": 0.06, "h": 0.03, "k": "box", "w": 0.6, "y": 0.51, "z": 0.2, "color": "#39FFB0", "emissive": true}, {"d": 0.06, "h": 0.03, "k": "box", "w": 0.48, "y": 0.9299999999999999, "z": 0.14, "color": "#39FFB0", "emissive": true}, {"d": 0.06, "h": 0.03, "k": "box", "w": 0.36, "y": 1.33, "z": 0.08, "color": "#39FFB0", "emissive": true}, {"k": "roof", "w": 0.24, "y": 1.71, "type": "dome", "color": "#8FD4E8"}]	\N	148	2026-08-03 01:12:42.25933	2026-08-03 01:12:42.25933
150	scifi_observatory	천문대	SCIFI	NORMAL	300	f	0.570	0.693	1.620	[{"d": 0.5, "k": "plinth", "w": 0.5, "color": "#12203A"}, {"d": 0.44, "h": 0.9, "k": "box", "w": 0.44, "y": 0.07, "color": "#E8EEF2", "rough": 0.4, "windows": {"to": 0.75, "from": 0.2, "glow": 0.36, "color": "#4FE3FF"}}, {"d": 0.018, "h": 0.9, "k": "box", "w": 0.018, "x": -0.1892, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"d": 0.018, "h": 0.9, "k": "box", "w": 0.018, "x": -0.06306666666666667, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"d": 0.018, "h": 0.9, "k": "box", "w": 0.018, "x": 0.06306666666666666, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"d": 0.018, "h": 0.9, "k": "box", "w": 0.018, "x": 0.1892, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"h": 0.3, "k": "cyl", "y": 0.97, "rb": 0.26, "rt": 0.24, "seg": 16, "color": "#D2DAE2"}, {"k": "roof", "w": 0.66, "y": 1.27, "type": "dome", "color": "#AEB8C2"}, {"h": 0.3, "k": "panel", "w": 0.08, "pos": [0, 1.47, 0.246], "color": "#12203A"}, {"d": 0.46, "h": 0.02, "k": "box", "w": 0.46, "x": 0, "y": 0.52, "z": 0, "color": "#4FE3FF", "emissive": true}, {"h": 0.08, "k": "panel", "w": 0.34, "pos": [0, 0.77, 0.23800000000000002], "glow": 0.4, "color": "#4FE3FF"}]	\N	149	2026-08-03 01:12:42.260354	2026-08-03 01:12:42.260354
151	scifi_biodome	바이오돔 온실	SCIFI	NORMAL	300	f	0.870	0.956	1.495	[{"d": 0.72, "k": "plinth", "w": 0.72, "color": "#12203A"}, {"h": 0.7, "k": "cyl", "y": 0.07, "rb": 0.4, "rt": 0.36, "seg": 18, "color": "#AEB8C2"}, {"h": 0.04, "k": "cyl", "y": 0.37, "rb": 0.4, "rt": 0.4, "seg": 18, "color": "#4FE3FF", "detail": true}, {"k": "roof", "w": 1.06, "y": 0.77, "type": "dome", "color": "#7FE8C0"}, {"h": 0.04, "k": "cyl", "y": 0.75, "rb": 0.4, "rt": 0.4, "seg": 18, "color": "#39FFB0", "detail": true}, {"d": 0.18, "h": 0.3, "k": "box", "w": 0.16, "y": 0.07, "z": 0.4, "color": "#E8EEF2"}, {"d": 0.14, "h": 0.24, "k": "box", "w": 0.12, "x": 0.4, "y": 0.07, "z": 0, "color": "#E8EEF2"}, {"h": 0.14, "k": "panel", "w": 0.1, "pos": [0, 0.23, 0.496], "glow": 0.5, "color": "#4FE3FF"}, {"h": 0.3, "k": "antenna", "y": 1.1700000000000002}]	\N	150	2026-08-03 01:12:42.261423	2026-08-03 01:12:42.261423
219	egypt_great_pyramid	대피라미드	EGYPT	NORMAL	300	f	0.912	0.922	1.380	[{"d": 0.8, "k": "plinth", "w": 0.8, "color": "#C79A5B"}, {"d": 0.76, "h": 0.18, "k": "box", "w": 0.76, "y": 0.07, "color": "#C79A5B", "rough": 0.95}, {"d": 0.76, "k": "roof", "w": 0.76, "y": 0.25, "type": "pyramid", "color": "#D8B77A", "height": 1.1}, {"d": 0.18, "k": "roof", "w": 0.18, "y": 1.1700000000000002, "type": "pyramid", "color": "#D9B23A", "height": 0.16}, {"h": 0.24, "k": "panel", "w": 0.16, "pos": [0, 0.33, 0.386], "color": "#2B2723"}]	\N	218	2026-08-03 01:12:42.329816	2026-08-03 01:12:42.329816
152	scifi_habitat_dome	거주 돔	SCIFI	NORMAL	300	f	0.950	0.707	1.695	[{"d": 0.62, "k": "plinth", "w": 0.62, "color": "#12203A"}, {"h": 1, "k": "cyl", "y": 0.07, "rb": 0.32, "rt": 0.28, "seg": 16, "color": "#E8EEF2"}, {"h": 0.04, "k": "cyl", "y": 0.47000000000000003, "rb": 0.32, "rt": 0.32, "seg": 16, "color": "#4FE3FF", "detail": true}, {"h": 0.04, "k": "cyl", "y": 0.8700000000000001, "rb": 0.32, "rt": 0.32, "seg": 16, "color": "#4FE3FF", "detail": true}, {"k": "roof", "w": 0.8, "y": 1.07, "type": "dome", "color": "#8FD4E8"}, {"d": 0.16, "h": 0.14, "k": "box", "w": 0.2, "x": 0.34, "y": 0.5700000000000001, "z": 0, "color": "#AEB8C2"}, {"d": 0.16, "h": 0.14, "k": "box", "w": 0.2, "x": -0.34, "y": 0.77, "z": 0, "color": "#AEB8C2"}, {"h": 0.14, "k": "panel", "w": 0.14, "pos": [0.44, 0.6300000000000001, 0], "glow": 0.5, "rotY": 1.5708, "color": "#4FE3FF"}, {"h": 0.3, "k": "antenna", "y": 1.37}]	\N	151	2026-08-03 01:12:42.262657	2026-08-03 01:12:42.262657
153	scifi_market_pod	마켓 포드	SCIFI	NORMAL	300	f	0.593	0.692	1.815	[{"d": 0.48, "k": "plinth", "w": 0.52, "color": "#12203A"}, {"h": 0.5, "k": "cyl", "y": 0.07, "rb": 0.26, "rt": 0.24, "seg": 16, "color": "#E8EEF2"}, {"k": "roof", "w": 0.58, "y": 0.5700000000000001, "type": "dome", "color": "#8FD4E8"}, {"h": 0.6, "k": "cyl", "y": 0.79, "rb": 0.18, "rt": 0.16, "seg": 14, "color": "#D2DAE2"}, {"k": "roof", "w": 0.4, "y": 1.3900000000000001, "type": "dome", "color": "#8FD4E8"}, {"h": 0.24, "k": "antenna", "y": 1.55}, {"h": 0.03, "k": "cyl", "y": 0.31, "rb": 0.27, "rt": 0.27, "seg": 16, "color": "#4FE3FF", "detail": true}, {"d": 0.48, "k": "storefront", "w": 0.52, "sign": "#4FE3FF", "faceH": 0.28, "awning": "#12203A"}, {"h": 0.1, "k": "panel", "w": 0.3, "pos": [0, 0.41000000000000003, 0.268], "glow": 0.5, "color": "#4FE3FF"}]	\N	152	2026-08-03 01:12:42.263718	2026-08-03 01:12:42.263718
154	scifi_solar_farm	솔라 타워	SCIFI	NORMAL	300	f	0.660	0.660	2.055	[{"d": 0.5, "k": "plinth", "w": 0.5, "color": "#12203A"}, {"d": 0.32, "h": 1.4, "k": "box", "w": 0.32, "y": 0.07, "color": "#AEB8C2", "metal": 0.5, "rough": 0.4, "windows": {"to": 0.9, "from": 0.1, "glow": 0.36, "color": "#4FE3FF"}}, {"d": 0.2, "h": 0.03, "k": "box", "w": 0.66, "y": 0.47000000000000003, "color": "#0B1B3A"}, {"d": 0.66, "h": 0.03, "k": "box", "w": 0.2, "y": 0.77, "color": "#0B1B3A"}, {"d": 0.2, "h": 0.03, "k": "box", "w": 0.6, "y": 1.07, "color": "#0B1B3A"}, {"d": 0.04, "h": 0.02, "k": "box", "w": 0.66, "x": 0, "y": 0.49, "z": 0, "color": "#4FE3FF", "emissive": true}, {"d": 0.66, "h": 0.02, "k": "box", "w": 0.04, "x": 0, "y": 0.79, "z": 0, "color": "#4FE3FF", "emissive": true}, {"d": 0.36, "h": 0.16, "k": "box", "w": 0.36, "y": 1.47, "color": "#E8EEF2", "rough": 0.4}, {"k": "roof", "w": 0.4, "y": 1.6300000000000001, "type": "dome", "color": "#8FD4E8"}, {"h": 0.24, "k": "antenna", "y": 1.79}]	\N	153	2026-08-03 01:12:42.264692	2026-08-03 01:12:42.264692
155	scifi_medbay	메드베이	SCIFI	NORMAL	300	f	0.524	0.581	1.671	[{"d": 0.44, "k": "plinth", "w": 0.46, "color": "#12203A"}, {"d": 0.44, "h": 1.4, "k": "box", "w": 0.46, "y": 0.07, "color": "#E8EEF2", "rough": 0.35, "windows": {"to": 0.9, "from": 0.1, "glow": 0.4, "color": "#4FE3FF"}}, {"d": 0.016, "h": 1.4, "k": "box", "w": 0.016, "x": -0.1978, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"d": 0.016, "h": 1.4, "k": "box", "w": 0.016, "x": -0.0989, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"d": 0.016, "h": 1.4, "k": "box", "w": 0.016, "x": 0, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"d": 0.016, "h": 1.4, "k": "box", "w": 0.016, "x": 0.0989, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"d": 0.016, "h": 1.4, "k": "box", "w": 0.016, "x": 0.1978, "y": 0.07, "z": 0.224, "color": "#8FD4E8"}, {"d": 0.46, "h": 0.02, "k": "box", "w": 0.48, "x": 0, "y": 0.5700000000000001, "z": 0, "color": "#39FFB0", "emissive": true}, {"d": 0.46, "h": 0.02, "k": "box", "w": 0.48, "x": 0, "y": 1.07, "z": 0, "color": "#39FFB0", "emissive": true}, {"d": 0.44, "k": "parapet", "w": 0.46, "y": 1.47, "color": "#12203A"}, {"k": "rooftopUnits", "w": 0.46, "y": 1.47}, {"k": "cross", "s": 0.8, "y": 1.07, "z": 0.228, "color": "#39FFB0"}, {"k": "cross", "s": 0.6, "y": 1.62, "color": "#39FFB0"}, {"d": 0.44, "k": "storefront", "w": 0.46, "sign": "#39FFB0", "faceH": 0.3, "awning": "#0E2A2A"}]	\N	154	2026-08-03 01:12:42.265658	2026-08-03 01:12:42.265658
156	tropical_resort_tower	비치 리조트 타워	TROPICAL	NORMAL	300	f	0.768	0.768	2.130	[{"d": 0.5, "k": "plinth", "w": 0.56, "color": "#E8D6A8"}, {"d": 0.44, "h": 1.7, "k": "box", "w": 0.5, "y": 0.07, "color": "#F2ECDD", "rough": 0.7, "windows": {"to": 0.92, "from": 0.1, "glow": 0.28, "color": "#2FBFB3"}}, {"d": 0.44, "k": "balconies", "w": 0.5, "y0": 0.32, "y1": 1.62, "color": "#8A6A3A", "floors": 8}, {"d": 0.454, "h": 0.028, "k": "box", "w": 0.514, "y": 0.6699999999999999, "color": "#2E7D4F"}, {"d": 0.454, "h": 0.028, "k": "box", "w": 0.514, "y": 1.27, "color": "#2E7D4F"}, {"k": "roof", "w": 0.64, "y": 1.77, "type": "cone", "color": "#B98A4B", "height": 0.36}, {"h": 0.04, "k": "cyl", "y": 1.77, "rb": 0.2, "rt": 0.2, "seg": 12, "color": "#A5763A", "detail": true}, {"d": 0.44, "k": "storefront", "w": 0.5, "sign": "#F2ECDD", "faceH": 0.3, "awning": "#2FBFB3"}, {"d": 0.04, "h": 0.5, "k": "box", "w": 0.04, "x": -0.28, "y": 0.07, "z": 0.2, "color": "#2E7D4F", "detail": true}, {"d": 0.16, "h": 0.14, "k": "box", "w": 0.16, "x": -0.28, "y": 0.5700000000000001, "z": 0.2, "color": "#2E7D4F", "detail": true}]	\N	155	2026-08-03 01:12:42.266668	2026-08-03 01:12:42.266668
157	tropical_lighthouse	등대	TROPICAL	NORMAL	300	f	0.502	0.502	2.350	[{"d": 0.44, "k": "plinth", "w": 0.44, "color": "#E8D6A8"}, {"d": 0.36, "h": 0.34, "k": "box", "w": 0.36, "y": 0.07, "color": "#F2ECDD", "rough": 0.7, "windows": {"to": 0.7, "from": 0.3, "glow": 0.28, "color": "#2FBFB3"}}, {"h": 1.5, "k": "cyl", "y": 0.41000000000000003, "rb": 0.17, "rt": 0.1, "seg": 14, "color": "#F2ECDD"}, {"h": 0.05, "k": "cyl", "y": 0.8700000000000001, "rb": 0.14, "rt": 0.14, "seg": 14, "color": "#2FBFB3", "detail": true}, {"h": 0.05, "k": "cyl", "y": 1.37, "rb": 0.14, "rt": 0.14, "seg": 14, "color": "#2FBFB3", "detail": true}, {"h": 0.18, "k": "cyl", "y": 1.9100000000000001, "rb": 0.12, "rt": 0.14, "seg": 12, "color": "#8A6A3A"}, {"d": 0.22, "h": 0.14, "k": "box", "w": 0.22, "y": 2.01, "color": "#FFE08A", "emissive": true}, {"k": "roof", "w": 0.34, "y": 2.15, "type": "cone", "color": "#B98A4B", "height": 0.2}, {"h": 0.5, "k": "panel", "w": 0.1, "pos": [0, 0.97, 0.14600000000000002], "glow": 0.18, "color": "#2FBFB3"}]	\N	156	2026-08-03 01:12:42.267668	2026-08-03 01:12:42.267668
158	tropical_tiki_totem	티키 토템	TROPICAL	NORMAL	300	f	0.528	0.530	2.130	[{"d": 0.42, "k": "plinth", "w": 0.42, "color": "#E8D6A8"}, {"d": 0.3, "h": 0.44, "k": "box", "w": 0.3, "y": 0.07, "color": "#7A4A28", "rough": 0.85}, {"d": 0.34, "h": 0.34, "k": "box", "w": 0.34, "y": 0.51, "color": "#6E4224", "rough": 0.85}, {"d": 0.28, "h": 0.38, "k": "box", "w": 0.28, "y": 0.8500000000000001, "color": "#7A4A28", "rough": 0.85}, {"d": 0.32, "h": 0.34, "k": "box", "w": 0.32, "y": 1.23, "color": "#6E4224", "rough": 0.85}, {"d": 0.26, "h": 0.3, "k": "box", "w": 0.26, "y": 1.57, "color": "#7A4A28", "rough": 0.85}, {"k": "roof", "w": 0.44, "y": 1.87, "type": "cone", "color": "#B98A4B", "height": 0.26}, {"h": 0.06, "k": "panel", "w": 0.18, "pos": [0, 1.3900000000000001, 0.17600000000000002], "glow": 0.55, "color": "#E07A30"}, {"h": 0.05, "k": "panel", "w": 0.18, "pos": [0, 0.99, 0.156], "glow": 0.45, "color": "#FFCC66"}, {"h": 0.05, "k": "panel", "w": 0.16, "pos": [0, 0.6300000000000001, 0.186], "glow": 0.4, "color": "#E07A30"}, {"d": 0.04, "h": 0.06, "k": "box", "w": 0.06, "x": -0.09, "y": 1.4300000000000002, "z": 0.15, "color": "#3A2416", "detail": true}, {"d": 0.04, "h": 0.06, "k": "box", "w": 0.06, "x": 0.09, "y": 1.4300000000000002, "z": 0.15, "color": "#3A2416", "detail": true}]	\N	157	2026-08-03 01:12:42.268734	2026-08-03 01:12:42.268734
159	tropical_marina	마리나 오피스	TROPICAL	NORMAL	300	f	0.570	0.626	1.970	[{"d": 0.46, "k": "plinth", "w": 0.5, "color": "#E8D6A8"}, {"d": 0.46, "h": 1.3, "k": "box", "w": 0.5, "y": 0.07, "color": "#F2ECDD", "rough": 0.65, "windows": {"to": 0.9, "from": 0.12, "glow": 0.3, "color": "#2FBFB3"}}, {"d": 0.02, "h": 1.3, "k": "box", "w": 0.02, "x": -0.215, "y": 0.07, "z": 0.234, "color": "#8A6A3A"}, {"d": 0.02, "h": 1.3, "k": "box", "w": 0.02, "x": -0.1075, "y": 0.07, "z": 0.234, "color": "#8A6A3A"}, {"d": 0.02, "h": 1.3, "k": "box", "w": 0.02, "x": 0, "y": 0.07, "z": 0.234, "color": "#8A6A3A"}, {"d": 0.02, "h": 1.3, "k": "box", "w": 0.02, "x": 0.1075, "y": 0.07, "z": 0.234, "color": "#8A6A3A"}, {"d": 0.02, "h": 1.3, "k": "box", "w": 0.02, "x": 0.215, "y": 0.07, "z": 0.234, "color": "#8A6A3A"}, {"d": 0.34, "h": 0.34, "k": "box", "w": 0.34, "y": 1.37, "color": "#F2ECDD", "rough": 0.65}, {"k": "roof", "w": 0.46, "y": 1.71, "type": "cone", "color": "#B98A4B", "height": 0.26}, {"d": 0.46, "k": "balconies", "w": 0.5, "y0": 0.47000000000000003, "y1": 0.97, "color": "#8A6A3A", "floors": 2}, {"d": 0.02, "h": 0.03, "k": "box", "w": 0.5, "y": 0.73, "z": 0.24, "color": "#2FBFB3", "emissive": true}, {"d": 0.46, "k": "storefront", "w": 0.5, "sign": "#F2ECDD", "faceH": 0.3, "awning": "#1E7A72"}]	\N	158	2026-08-03 01:12:42.269707	2026-08-03 01:12:42.269707
160	tropical_atrium	로비 아트리움	TROPICAL	NORMAL	300	f	1.104	1.104	1.670	[{"d": 0.58, "k": "plinth", "w": 0.72, "color": "#E8D6A8"}, {"d": 0.58, "h": 0.6, "k": "box", "w": 0.72, "y": 0.07, "color": "#F2ECDD", "rough": 0.7, "windows": {"to": 0.85, "from": 0.3, "glow": 0.28, "color": "#2FBFB3"}}, {"d": 0.58, "h": 0.5, "k": "columns", "w": 0.72, "y": 0.07, "color": "#8A6A3A", "count": 7}, {"d": 0.44, "h": 0.4, "k": "box", "w": 0.44, "y": 0.6699999999999999, "color": "#F2ECDD", "rough": 0.7}, {"k": "roof", "w": 0.92, "y": 0.6699999999999999, "type": "cone", "color": "#A5763A", "height": 0.22}, {"k": "roof", "w": 0.62, "y": 1.07, "type": "cone", "color": "#B98A4B", "height": 0.44}, {"d": 0.03, "h": 0.16, "k": "box", "w": 0.03, "y": 1.51, "color": "#6E4A2A", "detail": true}, {"d": 0.58, "k": "storefront", "w": 0.72, "sign": "#F2ECDD", "faceH": 0.34, "awning": "#2E7D4F"}]	\N	159	2026-08-03 01:12:42.270794	2026-08-03 01:12:42.270794
161	tropical_treehouse	트리하우스	TROPICAL	NORMAL	300	f	0.630	0.600	1.630	[{"d": 0.4, "k": "plinth", "w": 0.4, "color": "#2E7D4F"}, {"h": 0.8, "k": "cyl", "y": 0.07, "rb": 0.13, "rt": 0.09, "seg": 8, "color": "#6E4A2A"}, {"d": 0.36, "h": 0.2, "k": "box", "w": 0.36, "x": -0.14, "y": 0.47000000000000003, "z": 0.1, "color": "#2E7D4F", "detail": true}, {"d": 0.3, "h": 0.2, "k": "box", "w": 0.3, "x": 0.16, "y": 0.6699999999999999, "z": -0.08, "color": "#256A42", "detail": true}, {"d": 0.44, "h": 0.06, "k": "box", "w": 0.44, "y": 0.8700000000000001, "color": "#8A6A3A"}, {"d": 0.34, "h": 0.4, "k": "box", "w": 0.34, "y": 0.9299999999999999, "color": "#F2ECDD", "rough": 0.7, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#2FBFB3"}}, {"k": "roof", "w": 0.5, "y": 1.33, "type": "cone", "color": "#B98A4B", "height": 0.3}, {"d": 0.03, "h": 0.5, "k": "box", "w": 0.03, "x": 0.14, "y": 0.9299999999999999, "z": 0.18, "color": "#6E4A2A", "detail": true}, {"h": 0.2, "k": "panel", "w": 0.1, "pos": [0, 1.03, 0.17600000000000002], "color": "#6E4A2A"}]	\N	160	2026-08-03 01:12:42.271807	2026-08-03 01:12:42.271807
162	tropical_watchtower	라이프가드 타워	TROPICAL	NORMAL	300	f	0.648	0.692	1.570	[{"d": 0.42, "k": "plinth", "w": 0.42, "color": "#E8D6A8"}, {"d": 0.05, "h": 0.9, "k": "box", "w": 0.05, "x": -0.15, "y": 0.07, "z": -0.15, "color": "#6E4A2A"}, {"d": 0.05, "h": 0.9, "k": "box", "w": 0.05, "x": 0.15, "y": 0.07, "z": -0.15, "color": "#6E4A2A"}, {"d": 0.05, "h": 0.9, "k": "box", "w": 0.05, "x": -0.15, "y": 0.07, "z": 0.15, "color": "#6E4A2A"}, {"d": 0.05, "h": 0.9, "k": "box", "w": 0.05, "x": 0.15, "y": 0.07, "z": 0.15, "color": "#6E4A2A"}, {"d": 0.03, "h": 0.03, "k": "box", "w": 0.34, "y": 0.5700000000000001, "z": 0.15, "color": "#6E4A2A"}, {"d": 0.42, "h": 0.34, "k": "box", "w": 0.42, "y": 0.97, "color": "#D94F4F", "rough": 0.7, "windows": {"to": 0.8, "from": 0.2, "glow": 0.2, "color": "#F2ECDD"}}, {"k": "roof", "w": 0.54, "y": 1.31, "type": "cone", "color": "#B98A4B", "height": 0.26}, {"d": 0.1, "h": 0.04, "k": "box", "w": 0.44, "y": 0.97, "z": 0.24, "color": "#6E4A2A"}, {"h": 0.08, "k": "panel", "w": 0.3, "pos": [0, 1.07, 0.218], "glow": 0.2, "color": "#F2ECDD"}]	\N	161	2026-08-03 01:12:42.272807	2026-08-03 01:12:42.272807
163	tropical_overwater_bungalow	오버워터 방갈로	TROPICAL	NORMAL	300	f	0.707	0.600	1.470	[{"d": 0.52, "k": "plinth", "w": 0.62, "color": "#2FBFB3"}, {"d": 0.54, "h": 0.05, "k": "box", "w": 0.64, "y": 0, "color": "#2FBFB3", "emissive": true}, {"d": 0.05, "h": 0.34, "k": "box", "w": 0.05, "x": -0.18, "y": 0.07, "z": -0.16, "color": "#6E4A2A"}, {"d": 0.05, "h": 0.34, "k": "box", "w": 0.05, "x": 0.18, "y": 0.07, "z": -0.16, "color": "#6E4A2A"}, {"d": 0.05, "h": 0.34, "k": "box", "w": 0.05, "x": -0.18, "y": 0.07, "z": 0.16, "color": "#6E4A2A"}, {"d": 0.05, "h": 0.34, "k": "box", "w": 0.05, "x": 0.18, "y": 0.07, "z": 0.16, "color": "#6E4A2A"}, {"d": 0.48, "h": 0.06, "k": "box", "w": 0.56, "y": 0.41000000000000003, "color": "#8A6A3A"}, {"d": 0.38, "h": 0.4, "k": "box", "w": 0.42, "y": 0.47000000000000003, "color": "#F2ECDD", "rough": 0.7, "windows": {"to": 0.8, "from": 0.25, "glow": 0.3, "color": "#2FBFB3"}}, {"d": 0.3, "h": 0.3, "k": "box", "w": 0.32, "y": 0.8700000000000001, "color": "#F2ECDD", "rough": 0.7}, {"k": "roof", "w": 0.5, "y": 1.1700000000000002, "type": "cone", "color": "#B98A4B", "height": 0.3}, {"h": 0.2, "k": "panel", "w": 0.12, "pos": [0, 0.5700000000000001, 0.196], "color": "#6E4A2A"}, {"d": 0.03, "h": 0.34, "k": "box", "w": 0.03, "x": 0.24, "y": 0.07, "z": 0.2, "color": "#6E4A2A", "detail": true}]	\N	162	2026-08-03 01:12:42.273847	2026-08-03 01:12:42.273847
164	tropical_villa	리조트 빌라	TROPICAL	NORMAL	300	f	0.745	0.696	1.310	[{"d": 0.48, "k": "plinth", "w": 0.64, "color": "#E8D6A8"}, {"d": 0.48, "h": 0.5, "k": "box", "w": 0.44, "x": -0.09, "y": 0.07, "color": "#F2ECDD", "rough": 0.7, "windows": {"to": 0.8, "from": 0.25, "glow": 0.28, "color": "#2FBFB3"}}, {"d": 0.44, "h": 0.44, "k": "box", "w": 0.44, "x": -0.09, "y": 0.5700000000000001, "color": "#F2ECDD", "rough": 0.7, "windows": {"to": 0.8, "from": 0.2, "glow": 0.28, "color": "#2FBFB3"}}, {"k": "roof", "w": 0.58, "y": 1.01, "type": "cone", "color": "#B98A4B", "height": 0.3}, {"d": 0.03, "h": 0.44, "k": "box", "w": 0.03, "x": -0.28, "y": 0.07, "z": 0.24, "color": "#8A6A3A"}, {"d": 0.03, "h": 0.44, "k": "box", "w": 0.03, "x": 0.1, "y": 0.07, "z": 0.24, "color": "#8A6A3A"}, {"d": 0.42, "h": 0.04, "k": "box", "w": 0.28, "x": 0.24, "y": 0.07, "color": "#2FBFB3", "emissive": true}, {"k": "parasol", "pos": [0.24, 0.11000000000000001, 0.14], "color": "#2FBFB3"}, {"h": 0.22, "k": "panel", "w": 0.12, "pos": [-0.09, 0.21000000000000002, 0.256], "color": "#6E4A2A"}]	\N	163	2026-08-03 01:12:42.274833	2026-08-03 01:12:42.274833
165	tropical_spa	스파 파빌리온	TROPICAL	NORMAL	300	f	0.768	0.768	1.310	[{"d": 0.54, "k": "plinth", "w": 0.56, "color": "#E8D6A8"}, {"d": 0.42, "h": 0.5, "k": "box", "w": 0.42, "y": 0.07, "color": "#F2ECDD", "rough": 0.7, "windows": {"to": 0.78, "from": 0.3, "glow": 0.28, "color": "#2FBFB3"}}, {"d": 0.42, "h": 0.44, "k": "columns", "w": 0.42, "y": 0.07, "color": "#8A6A3A", "count": 4}, {"h": 0.16, "k": "cyl", "y": 0.5700000000000001, "rb": 0.22, "rt": 0.18, "seg": 12, "color": "#8A6A3A"}, {"k": "roof", "w": 0.64, "y": 0.73, "type": "cone", "color": "#B98A4B", "height": 0.44}, {"d": 0.03, "h": 0.14, "k": "box", "w": 0.03, "y": 1.1700000000000002, "color": "#6E4A2A", "detail": true}, {"d": 0.12, "h": 0.03, "k": "box", "w": 0.5, "y": 0.07, "z": 0.26, "color": "#2FBFB3", "emissive": true}, {"d": 0.06, "h": 0.03, "k": "box", "w": 0.06, "y": 0.1, "z": 0.26, "color": "#2E7D4F", "detail": true}, {"h": 0.2, "k": "panel", "w": 0.14, "pos": [0, 0.23, 0.226], "color": "#6E4A2A"}]	\N	164	2026-08-03 01:12:42.275757	2026-08-03 01:12:42.275757
166	tropical_restaurant	짚지붕 레스토랑	TROPICAL	NORMAL	300	f	0.905	0.905	1.340	[{"d": 0.5, "k": "plinth", "w": 0.66, "color": "#E8D6A8"}, {"d": 0.46, "h": 0.5, "k": "box", "w": 0.6, "y": 0.07, "color": "#F2ECDD", "rough": 0.7, "windows": {"to": 0.8, "from": 0.35, "glow": 0.28, "color": "#2FBFB3"}}, {"d": 0.4, "h": 0.4, "k": "box", "w": 0.5, "y": 0.5700000000000001, "color": "#F2ECDD", "rough": 0.7, "windows": {"to": 0.8, "from": 0.2, "glow": 0.28, "color": "#2FBFB3"}}, {"d": 0.6, "k": "roof", "w": 0.78, "y": 0.97, "type": "pyramid", "color": "#B98A4B", "height": 0.34}, {"d": 0.46, "h": 0.44, "k": "columns", "w": 0.6, "y": 0.07, "color": "#8A6A3A", "count": 6}, {"d": 0.47, "h": 0.03, "k": "box", "w": 0.61, "y": 0.55, "color": "#A6824A"}, {"d": 0.46, "k": "storefront", "w": 0.6, "sign": "#F2ECDD", "faceH": 0.28, "awning": "#2E7D4F"}, {"k": "parasol", "pos": [0.24, 0.5700000000000001, 0.16], "color": "#E07A30"}]	\N	165	2026-08-03 01:12:42.276705	2026-08-03 01:12:42.276705
167	tropical_tiki_bar	티키 바	TROPICAL	NORMAL	300	f	0.792	0.792	1.330	[{"d": 0.46, "k": "plinth", "w": 0.5, "color": "#E8D6A8"}, {"d": 0.46, "h": 0.5, "k": "box", "w": 0.5, "y": 0.07, "color": "#8A6A3A", "rough": 0.8, "windows": {"to": 0.8, "from": 0.4, "glow": 0.35, "color": "#FFCC66"}}, {"d": 0.4, "h": 0.4, "k": "box", "w": 0.42, "y": 0.5700000000000001, "color": "#A6824A", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.35, "color": "#FFCC66"}}, {"k": "roof", "w": 0.66, "y": 0.97, "type": "cone", "color": "#B98A4B", "height": 0.36}, {"d": 0.46, "k": "storefront", "w": 0.5, "sign": "#FFCC66", "faceH": 0.28, "awning": "#8C3A2E"}, {"d": 0.03, "h": 0.4, "k": "box", "w": 0.03, "x": -0.22, "y": 0.07, "z": 0.18, "color": "#6E4A2A"}, {"h": 0.1, "k": "panel", "w": 0.06, "pos": [-0.22, 0.49, 0.18], "glow": 0.7, "color": "#E07A30"}, {"d": 0.03, "h": 0.4, "k": "box", "w": 0.03, "x": 0.22, "y": 0.07, "z": 0.18, "color": "#6E4A2A"}, {"h": 0.1, "k": "panel", "w": 0.06, "pos": [0.22, 0.49, 0.18], "glow": 0.7, "color": "#E07A30"}]	\N	166	2026-08-03 01:12:42.277642	2026-08-03 01:12:42.277642
168	tropical_dive_shop	다이브 상점	TROPICAL	NORMAL	300	f	0.648	0.712	1.330	[{"d": 0.44, "k": "plinth", "w": 0.46, "color": "#E8D6A8"}, {"d": 0.44, "h": 0.56, "k": "box", "w": 0.46, "y": 0.07, "color": "#2FBFB3", "rough": 0.65, "windows": {"to": 0.82, "from": 0.45, "glow": 0.3, "color": "#CFEFEA"}}, {"d": 0.4, "h": 0.44, "k": "box", "w": 0.4, "y": 0.6300000000000001, "color": "#3FA9C9", "rough": 0.65, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#CFEFEA"}}, {"k": "roof", "w": 0.54, "y": 1.07, "type": "cone", "color": "#B98A4B", "height": 0.26}, {"d": 0.02, "h": 0.56, "k": "box", "w": 0.02, "x": -0.1978, "y": 0.07, "z": 0.224, "color": "#F2ECDD"}, {"d": 0.02, "h": 0.56, "k": "box", "w": 0.02, "x": -0.06593333333333334, "y": 0.07, "z": 0.224, "color": "#F2ECDD"}, {"d": 0.02, "h": 0.56, "k": "box", "w": 0.02, "x": 0.06593333333333332, "y": 0.07, "z": 0.224, "color": "#F2ECDD"}, {"d": 0.02, "h": 0.56, "k": "box", "w": 0.02, "x": 0.1978, "y": 0.07, "z": 0.224, "color": "#F2ECDD"}, {"d": 0.44, "k": "storefront", "w": 0.46, "sign": "#F2ECDD", "faceH": 0.3, "awning": "#1E7A72"}, {"h": 0.1, "k": "panel", "w": 0.32, "pos": [0, 0.53, 0.228], "glow": 0.2, "color": "#F2ECDD"}, {"d": 0.05, "h": 0.16, "k": "box", "w": 0.05, "x": 0.18, "y": 0.07, "z": 0.24, "color": "#D9A24B", "detail": true}]	\N	167	2026-08-03 01:12:42.278635	2026-08-03 01:12:42.278635
169	tropical_cabana	카바나	TROPICAL	NORMAL	300	f	0.648	0.648	1.290	[{"d": 0.46, "k": "plinth", "w": 0.46, "color": "#E8D6A8"}, {"d": 0.05, "h": 0.5, "k": "box", "w": 0.05, "x": -0.17, "y": 0.07, "z": -0.17, "color": "#8A6A3A"}, {"d": 0.05, "h": 0.5, "k": "box", "w": 0.05, "x": 0.17, "y": 0.07, "z": -0.17, "color": "#8A6A3A"}, {"d": 0.05, "h": 0.5, "k": "box", "w": 0.05, "x": -0.17, "y": 0.07, "z": 0.17, "color": "#8A6A3A"}, {"d": 0.05, "h": 0.5, "k": "box", "w": 0.05, "x": 0.17, "y": 0.07, "z": 0.17, "color": "#8A6A3A"}, {"d": 0.06, "h": 0.44, "k": "box", "w": 0.38, "y": 0.07, "z": -0.17, "color": "#F2ECDD", "rough": 0.7}, {"d": 0.44, "h": 0.06, "k": "box", "w": 0.44, "y": 0.5700000000000001, "color": "#A6824A"}, {"d": 0.34, "h": 0.36, "k": "box", "w": 0.34, "y": 0.6300000000000001, "color": "#F2ECDD", "rough": 0.7, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#2FBFB3"}}, {"k": "roof", "w": 0.54, "y": 0.99, "type": "cone", "color": "#B98A4B", "height": 0.3}, {"d": 0.34, "h": 0.04, "k": "box", "w": 0.34, "y": 0.13, "color": "#6E4A2A", "detail": true}, {"h": 0.16, "k": "panel", "w": 0.12, "pos": [0, 0.71, 0.17600000000000002], "color": "#6E4A2A"}]	\N	168	2026-08-03 01:12:42.279594	2026-08-03 01:12:42.279594
170	tropical_chapel	비치 채플	TROPICAL	NORMAL	300	f	0.696	0.696	1.410	[{"d": 0.54, "k": "plinth", "w": 0.44, "color": "#E8D6A8"}, {"d": 0.52, "h": 0.8, "k": "box", "w": 0.42, "y": 0.07, "color": "#F2ECDD", "rough": 0.7, "windows": {"to": 0.7, "from": 0.25, "glow": 0.26, "color": "#2FBFB3"}}, {"d": 0.6, "k": "roof", "w": 0.5, "y": 0.8700000000000001, "type": "pyramid", "color": "#B98A4B", "height": 0.36}, {"d": 0.52, "h": 0.6, "k": "columns", "w": 0.42, "y": 0.07, "color": "#8A6A3A", "count": 4}, {"d": 0.02, "h": 0.18, "k": "box", "w": 0.02, "y": 1.23, "z": 0.26, "color": "#6E4A2A", "detail": true}, {"k": "cross", "s": 0.4, "y": 1.35, "z": 0.26, "color": "#6E4A2A"}, {"h": 0.3, "k": "panel", "w": 0.12, "pos": [0, 0.25, 0.276], "color": "#6E4A2A"}, {"h": 0.12, "k": "panel", "w": 0.12, "pos": [0, 0.6300000000000001, 0.276], "glow": 0.2, "color": "#2FBFB3"}]	\N	169	2026-08-03 01:12:42.280528	2026-08-03 01:12:42.280528
171	tropical_market	비치 마켓	TROPICAL	NORMAL	300	f	0.881	0.889	1.180	[{"d": 0.46, "k": "plinth", "w": 0.66, "color": "#E8D6A8"}, {"d": 0.46, "h": 0.4, "k": "box", "w": 0.66, "y": 0.07, "color": "#8A6A3A", "rough": 0.8}, {"d": 0.4, "h": 0.44, "k": "box", "w": 0.58, "y": 0.47000000000000003, "color": "#F2ECDD", "rough": 0.7, "windows": {"to": 0.8, "from": 0.2, "glow": 0.28, "color": "#2FBFB3"}}, {"d": 0.52, "k": "roof", "w": 0.76, "y": 0.9099999999999999, "type": "pyramid", "color": "#B98A4B", "height": 0.24}, {"d": 0.46, "k": "storefront", "w": 0.66, "sign": "#F2ECDD", "faceH": 0.24, "awning": "#E07A30"}, {"k": "parasol", "pos": [-0.24, 0.47000000000000003, 0.14], "color": "#2FBFB3"}, {"k": "parasol", "pos": [0.24, 0.47000000000000003, -0.1], "color": "#E07A30"}, {"h": 0.08, "k": "panel", "w": 0.46, "pos": [0, 0.79, 0.218], "glow": 0.2, "color": "#2E7D4F"}]	\N	170	2026-08-03 01:12:42.281513	2026-08-03 01:12:42.281513
172	tropical_juice_bar	주스 바	TROPICAL	NORMAL	300	f	0.528	0.602	1.370	[{"d": 0.38, "k": "plinth", "w": 0.4, "color": "#E8D6A8"}, {"d": 0.38, "h": 0.5, "k": "box", "w": 0.4, "y": 0.07, "color": "#FFB84D", "rough": 0.7, "windows": {"to": 0.82, "from": 0.4, "glow": 0.28, "color": "#F2ECDD"}}, {"d": 0.3, "h": 0.5, "k": "box", "w": 0.3, "y": 0.5700000000000001, "color": "#FF9A3D", "rough": 0.7, "windows": {"to": 0.8, "from": 0.2, "glow": 0.28, "color": "#F2ECDD"}}, {"k": "roof", "w": 0.44, "y": 1.07, "type": "cone", "color": "#B98A4B", "height": 0.24}, {"d": 0.38, "k": "storefront", "w": 0.4, "sign": "#F2ECDD", "faceH": 0.28, "awning": "#2E7D4F"}, {"d": 0.02, "h": 0.3, "k": "box", "w": 0.02, "x": 0.1, "y": 1.07, "color": "#E07A30", "detail": true}, {"h": 0.09, "k": "panel", "w": 0.26, "pos": [0, 0.47000000000000003, 0.20800000000000002], "glow": 0.3, "color": "#E0402A"}]	\N	171	2026-08-03 01:12:42.282673	2026-08-03 01:12:42.282673
173	tropical_surf_shack	서프 오두막	TROPICAL	NORMAL	300	f	0.580	0.596	1.160	[{"d": 0.4, "k": "plinth", "w": 0.44, "color": "#E8D6A8"}, {"d": 0.4, "h": 0.5, "k": "box", "w": 0.44, "y": 0.07, "color": "#3FA9C9", "rough": 0.75}, {"d": 0.36, "h": 0.4, "k": "box", "w": 0.38, "y": 0.5700000000000001, "color": "#5AB9D4", "rough": 0.75, "windows": {"to": 0.8, "from": 0.2, "glow": 0.28, "color": "#F2ECDD"}}, {"d": 0.46, "k": "roof", "w": 0.5, "y": 0.97, "type": "pyramid", "color": "#B98A4B", "height": 0.16}, {"d": 0.4, "k": "storefront", "w": 0.44, "sign": "#F2ECDD", "faceH": 0.28, "awning": "#E07A30"}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.06, "x": 0.2, "y": 0.07, "z": 0.2, "color": "#F2C84B", "detail": true}, {"d": 0.02, "h": 0.5, "k": "box", "w": 0.06, "x": 0.26, "y": 0.07, "z": 0.18, "color": "#E0402A", "detail": true}, {"d": 0.02, "h": 0.46, "k": "box", "w": 0.06, "x": -0.2, "y": 0.07, "z": 0.2, "color": "#2E7D4F", "detail": true}]	\N	172	2026-08-03 01:12:42.283748	2026-08-03 01:12:42.283748
174	tropical_ice_cream	아이스크림 가게	TROPICAL	NORMAL	300	f	0.504	0.590	1.370	[{"d": 0.38, "k": "plinth", "w": 0.4, "color": "#E8D6A8"}, {"d": 0.38, "h": 0.5, "k": "box", "w": 0.4, "y": 0.07, "color": "#F2ECDD", "rough": 0.7, "windows": {"to": 0.82, "from": 0.4, "glow": 0.3, "color": "#2FBFB3"}}, {"d": 0.3, "h": 0.44, "k": "box", "w": 0.3, "y": 0.5700000000000001, "color": "#FBE4EC", "rough": 0.7, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#2FBFB3"}}, {"k": "roof", "w": 0.42, "y": 1.01, "type": "cone", "color": "#F49AC1", "height": 0.3}, {"d": 0.05, "h": 0.06, "k": "box", "w": 0.05, "y": 1.31, "color": "#E0402A", "detail": true}, {"d": 0.38, "k": "storefront", "w": 0.4, "sign": "#F2ECDD", "faceH": 0.28, "awning": "#F49AC1"}, {"h": 0.08, "k": "panel", "w": 0.26, "pos": [0, 0.47000000000000003, 0.20800000000000002], "glow": 0.3, "color": "#2FBFB3"}]	\N	173	2026-08-03 01:12:42.284841	2026-08-03 01:12:42.284841
175	tropical_gazebo	해변 밴드스탠드	TROPICAL	NORMAL	300	f	0.768	0.768	1.550	[{"d": 0.5, "k": "plinth", "w": 0.5, "color": "#E8D6A8"}, {"h": 0.24, "k": "cyl", "y": 0.07, "rb": 0.26, "rt": 0.24, "seg": 12, "color": "#F2ECDD"}, {"d": 0.05, "h": 0.7, "k": "box", "w": 0.05, "x": -0.18, "y": 0.31, "z": -0.18, "color": "#F2ECDD"}, {"d": 0.05, "h": 0.7, "k": "box", "w": 0.05, "x": 0.18, "y": 0.31, "z": -0.18, "color": "#F2ECDD"}, {"d": 0.05, "h": 0.7, "k": "box", "w": 0.05, "x": -0.18, "y": 0.31, "z": 0.18, "color": "#F2ECDD"}, {"d": 0.05, "h": 0.7, "k": "box", "w": 0.05, "x": 0.18, "y": 0.31, "z": 0.18, "color": "#F2ECDD"}, {"d": 0.5, "h": 0.06, "k": "box", "w": 0.5, "y": 1.01, "color": "#A6824A"}, {"k": "roof", "w": 0.64, "y": 1.07, "type": "cone", "color": "#B98A4B", "height": 0.34}, {"d": 0.03, "h": 0.14, "k": "box", "w": 0.03, "y": 1.4100000000000001, "color": "#6E4A2A", "detail": true}, {"d": 0.03, "h": 0.03, "k": "box", "w": 0.44, "y": 0.77, "z": 0.18, "color": "#2FBFB3", "emissive": true}]	\N	174	2026-08-03 01:12:42.285757	2026-08-03 01:12:42.285757
176	nordic_stave_church	스테이브 교회	NORDIC	NORMAL	300	f	0.649	0.649	2.430	[{"d": 0.56, "k": "plinth", "w": 0.56, "color": "#8A8681"}, {"d": 0.46, "h": 0.4, "k": "box", "w": 0.46, "y": 0.07, "color": "#3A2E28", "rough": 0.8, "windows": {"to": 0.6, "from": 0.2, "glow": 0.4, "color": "#F2C879"}}, {"k": "roof", "w": 0.56, "y": 0.47000000000000003, "type": "pyramid", "color": "#3A2E28", "height": 0.24}, {"d": 0.34, "h": 0.34, "k": "box", "w": 0.34, "y": 0.71, "color": "#3A2E28", "rough": 0.8}, {"k": "roof", "w": 0.44, "y": 1.05, "type": "pyramid", "color": "#3A2E28", "height": 0.22}, {"d": 0.24, "h": 0.3, "k": "box", "w": 0.24, "y": 1.27, "color": "#3A2E28", "rough": 0.8, "windows": {"to": 0.7, "from": 0.2, "glow": 0.4, "color": "#F2C879"}}, {"k": "roof", "w": 0.32, "y": 1.57, "type": "pyramid", "color": "#3A2E28", "height": 0.24}, {"d": 0.14, "h": 0.24, "k": "box", "w": 0.14, "y": 1.81, "color": "#3A2E28", "rough": 0.8}, {"k": "roof", "w": 0.22, "y": 2.05, "type": "pyramid", "color": "#3A2E28", "height": 0.24}, {"d": 0.02, "h": 0.14, "k": "box", "w": 0.02, "y": 2.29, "color": "#F2C879", "detail": true, "emissive": true}, {"k": "cross", "s": 0.4, "y": 2.3699999999999997, "color": "#F2C879"}, {"d": 0.56, "h": 0.06, "k": "box", "w": 0.56, "y": 0.39, "color": "#3A2E28"}, {"h": 0.24, "k": "panel", "w": 0.14, "pos": [0, 0.21000000000000002, 0.23600000000000002], "color": "#5A3A28"}, {"d": 0.04, "h": 0.04, "k": "box", "w": 0.04, "x": -0.2, "y": 0.47000000000000003, "z": 0.2, "color": "#3A2E28", "detail": true}]	\N	175	2026-08-03 01:12:42.286746	2026-08-03 01:12:42.286746
177	nordic_aurora_tower	오로라 전망탑	NORDIC	NORMAL	300	f	0.580	0.580	2.935	[{"d": 0.46, "k": "plinth", "w": 0.46, "color": "#8A8681"}, {"d": 0.34, "h": 0.4, "k": "box", "w": 0.34, "y": 0.07, "color": "#3A2E28", "rough": 0.6, "windows": {"to": 0.8, "from": 0.2, "glow": 0.4, "color": "#F2C879"}}, {"d": 0.22, "h": 1.6, "k": "box", "w": 0.22, "y": 0.47000000000000003, "color": "#3A2E28", "metal": 0.3, "rough": 0.5}, {"d": 0.44, "h": 0.34, "k": "box", "w": 0.44, "y": 2.07, "color": "#EAF1F5", "rough": 0.4, "windows": {"to": 0.8, "from": 0.2, "glow": 0.4, "color": "#A8D8E8"}}, {"k": "roof", "w": 0.5, "y": 2.4099999999999997, "type": "pyramid", "color": "#EAF1F5", "height": 0.2}, {"h": 0.3, "k": "antenna", "y": 2.61}, {"d": 0.02, "h": 1.6, "k": "box", "w": 0.02, "x": -0.12, "y": 0.47000000000000003, "z": 0.12, "color": "#5FE0B0", "emissive": true}, {"d": 0.02, "h": 1.6, "k": "box", "w": 0.02, "x": 0.12, "y": 0.47000000000000003, "z": 0.12, "color": "#5FA0E0", "emissive": true}, {"d": 0.02, "h": 1.6, "k": "box", "w": 0.02, "x": 0.12, "y": 0.47000000000000003, "z": -0.12, "color": "#5FE0B0", "emissive": true}, {"d": 0.46, "h": 0.03, "k": "box", "w": 0.46, "y": 2.05, "color": "#A8D8E8", "emissive": true}]	\N	176	2026-08-03 01:12:42.287905	2026-08-03 01:12:42.287905
178	nordic_lighthouse	등대	NORDIC	NORMAL	300	f	0.502	0.502	2.210	[{"d": 0.44, "k": "plinth", "w": 0.44, "color": "#8A8681"}, {"d": 0.34, "h": 0.34, "k": "box", "w": 0.34, "y": 0.07, "color": "#8C3A2E", "rough": 0.7, "windows": {"to": 0.7, "from": 0.3, "glow": 0.4, "color": "#F2C879"}}, {"h": 1.4, "k": "cyl", "y": 0.41000000000000003, "rb": 0.16, "rt": 0.11, "seg": 14, "color": "#EAF1F5"}, {"h": 0.06, "k": "cyl", "y": 0.77, "rb": 0.17, "rt": 0.17, "seg": 14, "color": "#8C3A2E", "detail": true}, {"h": 0.06, "k": "cyl", "y": 1.27, "rb": 0.15, "rt": 0.15, "seg": 14, "color": "#8C3A2E", "detail": true}, {"h": 0.16, "k": "cyl", "y": 1.81, "rb": 0.12, "rt": 0.14, "seg": 12, "color": "#3A2E28"}, {"d": 0.2, "h": 0.12, "k": "box", "w": 0.2, "y": 1.9100000000000001, "color": "#F2C879", "emissive": true}, {"k": "roof", "w": 0.32, "y": 2.03, "type": "cone", "color": "#8C3A2E", "height": 0.18}, {"h": 0.4, "k": "panel", "w": 0.1, "pos": [0, 1.02, 0.14600000000000002], "glow": 0.2, "color": "#F2C879"}]	\N	177	2026-08-03 01:12:42.288943	2026-08-03 01:12:42.288943
179	nordic_bell_tower	종탑	NORDIC	NORMAL	300	f	0.510	0.511	2.330	[{"d": 0.38, "k": "plinth", "w": 0.38, "color": "#8A8681"}, {"d": 0.32, "h": 1.4, "k": "box", "w": 0.32, "y": 0.07, "color": "#8C3A2E", "rough": 0.75, "windows": {"to": 0.65, "from": 0.1, "glow": 0.4, "color": "#F2C879"}}, {"d": 0.334, "h": 0.028, "k": "box", "w": 0.334, "y": 0.5700000000000001, "color": "#DCE6EC"}, {"d": 0.334, "h": 0.028, "k": "box", "w": 0.334, "y": 1.07, "color": "#DCE6EC"}, {"d": 0.36, "h": 0.3, "k": "box", "w": 0.36, "y": 1.47, "color": "#3A2E28", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.4, "color": "#F2C879"}}, {"k": "roof", "w": 0.44, "y": 1.77, "type": "pyramid", "color": "#EAF1F5", "height": 0.42}, {"d": 0.02, "h": 0.14, "k": "box", "w": 0.02, "y": 2.19, "color": "#F2C879", "detail": true, "emissive": true}, {"h": 0.16, "k": "panel", "w": 0.14, "pos": [0, 1.57, 0.186], "color": "#3A2E28"}]	\N	178	2026-08-03 01:12:42.289934	2026-08-03 01:12:42.289934
180	nordic_ski_hotel	스키 리조트 호텔	NORDIC	NORMAL	300	f	0.835	0.835	1.960	[{"d": 0.5, "k": "plinth", "w": 0.64, "color": "#8A8681"}, {"d": 0.5, "h": 1.1, "k": "box", "w": 0.64, "y": 0.07, "color": "#6E4A32", "rough": 0.8, "windows": {"to": 0.9, "from": 0.12, "glow": 0.4, "color": "#F2C879"}}, {"d": 0.42, "h": 0.4, "k": "box", "w": 0.5, "y": 1.1700000000000002, "color": "#5A3A28", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.4, "color": "#F2C879"}}, {"d": 0.58, "k": "roof", "w": 0.72, "y": 1.1700000000000002, "type": "pyramid", "color": "#EAF1F5", "height": 0.16}, {"d": 0.5, "k": "roof", "w": 0.58, "y": 1.57, "type": "pyramid", "color": "#EAF1F5", "height": 0.36}, {"d": 0.5, "k": "balconies", "w": 0.64, "y0": 0.42, "y1": 0.9199999999999999, "color": "#5A3A28", "floors": 3}, {"d": 0.514, "h": 0.028, "k": "box", "w": 0.654, "y": 0.6200000000000001, "color": "#5A3A28"}, {"d": 0.08, "h": 0.4, "k": "box", "w": 0.08, "x": 0.24, "y": 1.1700000000000002, "z": -0.12, "color": "#8A8681", "detail": true}, {"d": 0.5, "k": "storefront", "w": 0.64, "sign": "#F2C879", "faceH": 0.3, "awning": "#8C3A2E"}]	\N	179	2026-08-03 01:12:42.290913	2026-08-03 01:12:42.290913
181	nordic_church	교회	NORDIC	NORMAL	300	f	0.742	0.742	1.844	[{"d": 0.56, "k": "plinth", "w": 0.46, "color": "#8A8681"}, {"d": 0.56, "h": 0.8, "k": "box", "w": 0.46, "y": 0.07, "color": "#EAF1F5", "rough": 0.6, "windows": {"to": 0.7, "from": 0.2, "glow": 0.4, "color": "#F2C879"}}, {"d": 0.64, "k": "roof", "w": 0.54, "y": 0.8700000000000001, "type": "pyramid", "color": "#8C3A2E", "height": 0.3}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": -0.1978, "y": 0.07, "z": 0.28400000000000003, "color": "#DCE6EC"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": 0, "y": 0.07, "z": 0.28400000000000003, "color": "#DCE6EC"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": 0.1978, "y": 0.07, "z": 0.28400000000000003, "color": "#DCE6EC"}, {"d": 0.22, "h": 1.2, "k": "box", "w": 0.22, "y": 0.07, "z": 0.22, "color": "#EAF1F5", "rough": 0.6, "windows": {"to": 0.7, "from": 0.5, "glow": 0.4, "color": "#F2C879"}}, {"d": 0.24, "h": 0.12, "k": "box", "w": 0.24, "y": 1.27, "z": 0.22, "color": "#8C3A2E"}, {"d": 0.14, "h": 0.16, "k": "box", "w": 0.14, "y": 1.3900000000000001, "z": 0.22, "color": "#8C3A2E"}, {"d": 0.06, "h": 0.2, "k": "box", "w": 0.06, "y": 1.55, "z": 0.22, "color": "#8C3A2E"}, {"k": "cross", "s": 0.4, "y": 1.81, "z": 0.22, "color": "#F2C879"}, {"h": 0.24, "k": "panel", "w": 0.1, "pos": [0, 0.21000000000000002, 0.28600000000000003], "color": "#5A3A28"}]	\N	180	2026-08-03 01:12:42.291851	2026-08-03 01:12:42.291851
187	nordic_ice_hotel	얼음 호텔	NORDIC	NORMAL	300	f	0.818	0.818	1.570	[{"d": 0.5, "k": "plinth", "w": 0.62, "color": "#C8DCE8"}, {"d": 0.5, "h": 0.6, "k": "box", "w": 0.62, "y": 0.07, "color": "#A8D8E8", "metal": 0.2, "rough": 0.25, "windows": {"to": 0.8, "from": 0.2, "glow": 0.4, "color": "#CFEFF8"}}, {"d": 0.54, "k": "roof", "w": 0.66, "y": 0.6699999999999999, "type": "round", "color": "#C8E8F2"}, {"d": 0.5, "h": 0.44, "k": "box", "w": 0.44, "y": 0.6699999999999999, "color": "#A8D8E8", "rough": 0.25}, {"d": 0.54, "k": "roof", "w": 0.48, "y": 1.11, "type": "round", "color": "#C8E8F2"}, {"d": 0.5, "h": 0.34, "k": "box", "w": 0.26, "y": 1.11, "color": "#A8D8E8", "rough": 0.25}, {"d": 0.54, "k": "roof", "w": 0.3, "y": 1.45, "type": "round", "color": "#C8E8F2"}, {"d": 0.52, "h": 0.04, "k": "box", "w": 0.64, "y": 0.32, "color": "#5FE0B0", "emissive": true}, {"d": 0.52, "h": 0.04, "k": "box", "w": 0.46, "y": 0.8899999999999999, "color": "#5FE0B0", "emissive": true}, {"h": 0.3, "k": "panel", "w": 0.18, "pos": [0, 0.23, 0.256], "glow": 0.4, "color": "#7FD8F0"}]	\N	186	2026-08-03 01:12:42.297661	2026-08-03 01:12:42.297661
182	nordic_town_hall	시청	NORDIC	NORMAL	300	f	0.789	0.802	1.870	[{"d": 0.48, "k": "plinth", "w": 0.6, "color": "#8A8681"}, {"d": 0.48, "h": 0.9, "k": "box", "w": 0.6, "y": 0.07, "color": "#8C3A2E", "rough": 0.75, "windows": {"to": 0.85, "from": 0.15, "glow": 0.38, "color": "#F2C879"}}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.258, "y": 0.07, "z": 0.244, "color": "#DCE6EC"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.129, "y": 0.07, "z": 0.244, "color": "#DCE6EC"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0, "y": 0.07, "z": 0.244, "color": "#DCE6EC"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.129, "y": 0.07, "z": 0.244, "color": "#DCE6EC"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.258, "y": 0.07, "z": 0.244, "color": "#DCE6EC"}, {"d": 0.56, "k": "roof", "w": 0.68, "y": 0.97, "type": "pyramid", "color": "#EAF1F5", "height": 0.18}, {"d": 0.22, "h": 0.44, "k": "box", "w": 0.22, "y": 0.97, "color": "#8C3A2E", "rough": 0.75}, {"k": "clock", "w": 0.22, "y": 1.21, "color": "#EAF1F5"}, {"k": "roof", "w": 0.3, "y": 1.4100000000000001, "type": "pyramid", "color": "#EAF1F5", "height": 0.34}, {"d": 0.02, "h": 0.12, "k": "box", "w": 0.02, "y": 1.75, "color": "#F2C879", "detail": true, "emissive": true}, {"h": 0.08, "k": "panel", "w": 0.3, "pos": [0, 0.77, 0.258], "glow": 0.15, "color": "#EAF1F5"}]	\N	181	2026-08-03 01:12:42.292837	2026-08-03 01:12:42.292837
183	nordic_lodge	통나무 롯지	NORDIC	NORMAL	300	f	0.858	0.858	1.630	[{"d": 0.48, "k": "plinth", "w": 0.62, "color": "#8A8681"}, {"d": 0.48, "h": 0.8, "k": "box", "w": 0.62, "y": 0.07, "color": "#6E4A32", "rough": 0.85, "windows": {"to": 0.75, "from": 0.2, "glow": 0.42, "color": "#F2C879"}}, {"d": 0.49, "h": 0.03, "k": "box", "w": 0.63, "y": 0.31, "color": "#5A3A28", "detail": true}, {"d": 0.49, "h": 0.03, "k": "box", "w": 0.63, "y": 0.5700000000000001, "color": "#5A3A28", "detail": true}, {"d": 0.4, "h": 0.32, "k": "box", "w": 0.48, "y": 0.8700000000000001, "color": "#5A3A28", "rough": 0.85, "windows": {"to": 0.8, "from": 0.2, "glow": 0.42, "color": "#F2C879"}}, {"d": 0.6, "k": "roof", "w": 0.74, "y": 1.1900000000000002, "type": "pyramid", "color": "#EAF1F5", "height": 0.4}, {"d": 0.09, "h": 0.44, "k": "box", "w": 0.09, "x": -0.2, "y": 1.1900000000000002, "z": -0.12, "color": "#8A8681", "detail": true}, {"d": 0.14, "h": 0.06, "k": "box", "w": 0.62, "y": 0.47000000000000003, "z": 0.22, "color": "#5A3A28"}, {"h": 0.26, "k": "panel", "w": 0.14, "pos": [0, 0.21000000000000002, 0.256], "color": "#5A3A28"}]	\N	182	2026-08-03 01:12:42.29385	2026-08-03 01:12:42.29385
184	nordic_museum	박물관	NORDIC	NORMAL	300	f	0.835	0.845	1.410	[{"d": 0.5, "k": "plinth", "w": 0.64, "color": "#8A8681"}, {"d": 0.5, "h": 0.9, "k": "box", "w": 0.64, "y": 0.07, "color": "#8A8681", "rough": 0.7, "windows": {"to": 0.8, "from": 0.2, "glow": 0.34, "color": "#F2C879"}}, {"d": 0.5, "h": 0.7, "k": "columns", "w": 0.64, "y": 0.07, "color": "#EAF1F5", "count": 6}, {"d": 0.54, "h": 0.08, "k": "box", "w": 0.68, "y": 0.97, "color": "#DCE6EC"}, {"d": 0.58, "k": "roof", "w": 0.72, "y": 1.05, "type": "pyramid", "color": "#EAF1F5", "height": 0.24}, {"d": 0.08, "h": 0.36, "k": "box", "w": 0.08, "x": 0.22, "y": 1.05, "z": -0.12, "color": "#8A8681", "detail": true}, {"h": 0.1, "k": "panel", "w": 0.32, "pos": [0, 0.6699999999999999, 0.268], "color": "#8C3A2E"}]	\N	183	2026-08-03 01:12:42.294821	2026-08-03 01:12:42.294821
185	nordic_chalet	샬레	NORDIC	NORMAL	300	f	0.765	0.765	1.690	[{"d": 0.46, "k": "plinth", "w": 0.5, "color": "#8A8681"}, {"d": 0.46, "h": 0.44, "k": "box", "w": 0.5, "y": 0.07, "color": "#8A8681", "rough": 0.85}, {"d": 0.48, "h": 0.44, "k": "box", "w": 0.52, "y": 0.51, "color": "#6E4A32", "rough": 0.82, "windows": {"to": 0.8, "from": 0.2, "glow": 0.44, "color": "#F2C879"}}, {"d": 0.44, "h": 0.34, "k": "box", "w": 0.5, "y": 0.95, "color": "#5A3A28", "rough": 0.82, "windows": {"to": 0.8, "from": 0.2, "glow": 0.44, "color": "#F2C879"}}, {"d": 0.58, "k": "roof", "w": 0.66, "y": 1.29, "type": "pyramid", "color": "#EAF1F5", "height": 0.36}, {"d": 0.48, "k": "balconies", "w": 0.52, "y0": 0.6699999999999999, "y1": 1.07, "color": "#5A3A28", "floors": 2}, {"d": 0.49, "h": 0.03, "k": "box", "w": 0.53, "y": 0.9299999999999999, "color": "#5A3A28"}, {"d": 0.08, "h": 0.4, "k": "box", "w": 0.08, "x": -0.18, "y": 1.29, "z": -0.12, "color": "#8A8681", "detail": true}]	\N	184	2026-08-03 01:12:42.295734	2026-08-03 01:12:42.295734
186	nordic_log_house	통나무 주택	NORDIC	NORMAL	300	f	0.649	0.649	1.410	[{"d": 0.44, "k": "plinth", "w": 0.48, "color": "#8A8681"}, {"d": 0.44, "h": 0.5, "k": "box", "w": 0.48, "y": 0.07, "color": "#6E4A32", "rough": 0.85, "windows": {"to": 0.78, "from": 0.28, "glow": 0.42, "color": "#F2C879"}}, {"d": 0.45, "h": 0.03, "k": "box", "w": 0.49, "y": 0.31, "color": "#5A3A28", "detail": true}, {"d": 0.4, "h": 0.44, "k": "box", "w": 0.44, "y": 0.5700000000000001, "color": "#5A3A28", "rough": 0.85, "windows": {"to": 0.8, "from": 0.2, "glow": 0.42, "color": "#F2C879"}}, {"d": 0.5, "k": "roof", "w": 0.56, "y": 1.01, "type": "pyramid", "color": "#EAF1F5", "height": 0.34}, {"d": 0.08, "h": 0.4, "k": "box", "w": 0.08, "x": -0.14, "y": 1.01, "z": -0.1, "color": "#8A8681", "detail": true}, {"h": 0.24, "k": "panel", "w": 0.12, "pos": [0, 0.21000000000000002, 0.23600000000000002], "color": "#5A3A28"}]	\N	185	2026-08-03 01:12:42.296732	2026-08-03 01:12:42.296732
189	nordic_trading_post	교역소	NORDIC	NORMAL	300	f	0.742	0.839	1.390	[{"d": 0.46, "k": "plinth", "w": 0.56, "color": "#8A8681"}, {"d": 0.46, "h": 0.6, "k": "box", "w": 0.56, "y": 0.07, "color": "#6E4A32", "rough": 0.82, "windows": {"to": 0.82, "from": 0.45, "glow": 0.4, "color": "#F2C879"}}, {"d": 0.4, "h": 0.44, "k": "box", "w": 0.5, "y": 0.6699999999999999, "color": "#5A3A28", "rough": 0.82, "windows": {"to": 0.8, "from": 0.2, "glow": 0.4, "color": "#F2C879"}}, {"d": 0.06, "h": 0.28, "k": "box", "w": 0.58, "y": 1.11, "z": 0.2, "color": "#5A3A28", "rough": 0.8}, {"d": 0.52, "k": "roof", "w": 0.64, "y": 1.11, "type": "pyramid", "color": "#EAF1F5", "height": 0.14}, {"d": 0.47400000000000003, "h": 0.028, "k": "box", "w": 0.5740000000000001, "y": 0.6499999999999999, "color": "#5A3A28"}, {"d": 0.46, "k": "storefront", "w": 0.56, "sign": "#F2C879", "faceH": 0.34, "awning": "#8C3A2E"}, {"h": 0.14, "k": "panel", "w": 0.44, "pos": [0, 1.23, 0.248], "glow": 0.3, "color": "#F2C879"}]	\N	188	2026-08-03 01:12:42.299619	2026-08-03 01:12:42.299619
190	nordic_red_cabin	붉은 오두막	NORDIC	NORMAL	300	f	0.626	0.626	1.390	[{"d": 0.44, "k": "plinth", "w": 0.46, "color": "#8A8681"}, {"d": 0.44, "h": 0.5, "k": "box", "w": 0.46, "y": 0.07, "color": "#8C3A2E", "rough": 0.78, "windows": {"to": 0.78, "from": 0.25, "glow": 0.45, "color": "#F2C879"}}, {"d": 0.4, "h": 0.42, "k": "box", "w": 0.42, "y": 0.5700000000000001, "color": "#7A3226", "rough": 0.78, "windows": {"to": 0.8, "from": 0.2, "glow": 0.45, "color": "#F2C879"}}, {"d": 0.5, "k": "roof", "w": 0.54, "y": 0.99, "type": "pyramid", "color": "#EAF1F5", "height": 0.34}, {"d": 0.08, "h": 0.4, "k": "box", "w": 0.08, "x": 0.14, "y": 0.99, "z": -0.1, "color": "#8A8681", "detail": true}, {"h": 0.14, "k": "panel", "w": 0.05, "pos": [-0.15, 0.39, 0.226], "color": "#EAF1F5"}, {"h": 0.14, "k": "panel", "w": 0.05, "pos": [0.15, 0.39, 0.226], "color": "#EAF1F5"}, {"h": 0.22, "k": "panel", "w": 0.1, "pos": [0, 0.2, 0.226], "color": "#EAF1F5"}]	\N	189	2026-08-03 01:12:42.300606	2026-08-03 01:12:42.300606
191	nordic_turf_house	잔디지붕 집	NORDIC	NORMAL	300	f	0.742	0.742	1.340	[{"d": 0.46, "k": "plinth", "w": 0.56, "color": "#8A8681"}, {"d": 0.46, "h": 0.5, "k": "box", "w": 0.56, "y": 0.07, "color": "#8A8681", "rough": 0.9, "windows": {"to": 0.78, "from": 0.3, "glow": 0.4, "color": "#F2C879"}}, {"d": 0.42, "h": 0.4, "k": "box", "w": 0.5, "y": 0.5700000000000001, "color": "#7A766E", "rough": 0.9, "windows": {"to": 0.8, "from": 0.2, "glow": 0.4, "color": "#F2C879"}}, {"d": 0.54, "k": "roof", "w": 0.64, "y": 0.97, "type": "pyramid", "color": "#4A7A4A", "height": 0.34}, {"d": 0.52, "h": 0.05, "k": "box", "w": 0.62, "y": 0.97, "color": "#3A5A34", "detail": true}, {"d": 0.06, "h": 0.3, "k": "box", "w": 0.06, "x": 0.16, "y": 0.97, "z": -0.1, "color": "#8A8681", "detail": true}, {"h": 0.2, "k": "panel", "w": 0.12, "pos": [0, 0.19, 0.246], "color": "#5A3A28"}]	\N	190	2026-08-03 01:12:42.301589	2026-08-03 01:12:42.301589
192	nordic_sauna	사우나 하우스	NORDIC	NORMAL	300	f	0.603	0.603	1.530	[{"d": 0.42, "k": "plinth", "w": 0.44, "color": "#8A8681"}, {"d": 0.42, "h": 0.5, "k": "box", "w": 0.44, "y": 0.07, "color": "#5A3A28", "rough": 0.85, "windows": {"to": 0.7, "from": 0.3, "glow": 0.5, "color": "#F2C879"}}, {"d": 0.38, "h": 0.4, "k": "box", "w": 0.4, "y": 0.5700000000000001, "color": "#6E4A32", "rough": 0.85, "windows": {"to": 0.8, "from": 0.2, "glow": 0.5, "color": "#F2C879"}}, {"d": 0.48, "k": "roof", "w": 0.52, "y": 0.97, "type": "pyramid", "color": "#EAF1F5", "height": 0.24}, {"d": 0.09, "h": 0.5, "k": "box", "w": 0.09, "x": 0.14, "y": 0.97, "z": -0.1, "color": "#8A8681"}, {"d": 0.11, "h": 0.06, "k": "box", "w": 0.11, "x": 0.14, "y": 1.47, "z": -0.1, "color": "#C8C4BE", "detail": true}, {"d": 0.43, "h": 0.03, "k": "box", "w": 0.45, "y": 0.55, "color": "#6E4A32"}, {"h": 0.18, "k": "panel", "w": 0.1, "pos": [0, 0.19, 0.226], "color": "#2A1E18"}]	\N	191	2026-08-03 01:12:42.302551	2026-08-03 01:12:42.302551
193	nordic_fish_market	어시장	NORDIC	NORMAL	300	f	0.812	0.812	1.370	[{"d": 0.44, "k": "plinth", "w": 0.62, "color": "#8A8681"}, {"d": 0.44, "h": 0.5, "k": "box", "w": 0.62, "y": 0.07, "color": "#3E6E8C", "rough": 0.75, "windows": {"to": 0.8, "from": 0.4, "glow": 0.35, "color": "#F2C879"}}, {"d": 0.4, "h": 0.4, "k": "box", "w": 0.5, "y": 0.5700000000000001, "color": "#4A7A98", "rough": 0.75, "windows": {"to": 0.8, "from": 0.2, "glow": 0.35, "color": "#F2C879"}}, {"d": 0.52, "k": "roof", "w": 0.7, "y": 0.97, "type": "pyramid", "color": "#EAF1F5", "height": 0.16}, {"d": 0.14, "h": 1.2, "k": "box", "w": 0.14, "x": 0.28, "y": 0.07, "z": -0.1, "color": "#5A3A28"}, {"d": 0.16, "h": 0.1, "k": "box", "w": 0.16, "x": 0.28, "y": 1.27, "z": -0.1, "color": "#8C3A2E"}, {"d": 0.44, "k": "storefront", "w": 0.62, "sign": "#F2C879", "faceH": 0.28, "awning": "#2E5A72"}, {"k": "parasol", "pos": [-0.22, 0.5700000000000001, 0.14], "color": "#3E6E8C"}]	\N	192	2026-08-03 01:12:42.303601	2026-08-03 01:12:42.303601
224	egypt_sun_temple	태양신전	EGYPT	NORMAL	300	f	0.752	0.787	1.740	[{"d": 0.56, "k": "plinth", "w": 0.66, "color": "#C79A5B"}, {"d": 0.5, "h": 0.6, "k": "box", "w": 0.6, "y": 0.07, "color": "#D8B77A", "rough": 0.9, "windows": {"to": 0.7, "from": 0.3, "glow": 0.15, "color": "#1F4E8C"}}, {"d": 0.5, "h": 0.5, "k": "columns", "w": 0.6, "y": 0.07, "color": "#B8894A", "count": 6}, {"d": 0.54, "h": 0.1, "k": "box", "w": 0.64, "y": 0.6699999999999999, "color": "#C79A5B"}, {"d": 0.2, "h": 0.8, "k": "box", "w": 0.2, "y": 0.77, "color": "#C79A5B", "rough": 0.88}, {"k": "roof", "w": 0.2, "y": 1.57, "type": "pyramid", "color": "#D9B23A", "height": 0.14}, {"h": 0.05, "k": "cyl", "y": 1.27, "rb": 0.16, "rt": 0.16, "seg": 16, "color": "#D9B23A", "detail": true}, {"h": 0.07, "k": "panel", "w": 0.4, "pos": [0, 0.55, 0.268], "glow": 0.15, "color": "#1F4E8C"}]	\N	223	2026-08-03 01:12:42.334804	2026-08-03 01:12:42.334804
194	nordic_bakery	베이커리	NORDIC	NORMAL	300	f	0.580	0.606	1.550	[{"d": 0.42, "k": "plinth", "w": 0.44, "color": "#8A8681"}, {"d": 0.42, "h": 0.5, "k": "box", "w": 0.44, "y": 0.07, "color": "#C89A5A", "rough": 0.8, "windows": {"to": 0.82, "from": 0.45, "glow": 0.45, "color": "#F2C879"}}, {"d": 0.38, "h": 0.42, "k": "box", "w": 0.4, "y": 0.5700000000000001, "color": "#D8AA6A", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.45, "color": "#F2C879"}}, {"d": 0.46, "k": "roof", "w": 0.5, "y": 0.99, "type": "pyramid", "color": "#EAF1F5", "height": 0.24}, {"d": 0.11, "h": 0.5, "k": "box", "w": 0.11, "x": -0.13, "y": 0.99, "z": -0.1, "color": "#B85A3A"}, {"d": 0.13, "h": 0.06, "k": "box", "w": 0.13, "x": -0.13, "y": 1.49, "z": -0.1, "color": "#C8C4BE", "detail": true}, {"d": 0.42, "k": "storefront", "w": 0.44, "sign": "#F2C879", "faceH": 0.3, "awning": "#8C3A2E"}, {"h": 0.12, "k": "panel", "w": 0.12, "pos": [0, 0.49, 0.228], "glow": 0.3, "color": "#F2C879"}]	\N	193	2026-08-03 01:12:42.304614	2026-08-03 01:12:42.304614
195	nordic_cafe	카페	NORDIC	NORMAL	300	f	0.557	0.579	1.350	[{"d": 0.4, "k": "plinth", "w": 0.42, "color": "#8A8681"}, {"d": 0.4, "h": 0.56, "k": "box", "w": 0.42, "y": 0.07, "color": "#6E4A32", "rough": 0.8, "windows": {"to": 0.85, "from": 0.5, "glow": 0.45, "color": "#F2C879"}}, {"d": 0.36, "h": 0.42, "k": "box", "w": 0.38, "y": 0.6300000000000001, "color": "#5A3A28", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.45, "color": "#F2C879"}}, {"d": 0.44, "k": "roof", "w": 0.48, "y": 1.05, "type": "pyramid", "color": "#EAF1F5", "height": 0.24}, {"d": 0.4, "k": "storefront", "w": 0.42, "sign": "#3A2E28", "faceH": 0.34, "awning": "#5FE0B0"}, {"k": "parasol", "pos": [0.12, 0.6300000000000001, 0.1], "color": "#8C3A2E"}, {"d": 0.06, "h": 0.3, "k": "box", "w": 0.06, "x": -0.12, "y": 1.05, "z": -0.08, "color": "#8A8681", "detail": true}]	\N	194	2026-08-03 01:12:42.305624	2026-08-03 01:12:42.305624
196	nordic_gift_shop	기념품점	NORDIC	NORMAL	300	f	0.533	0.595	1.220	[{"d": 0.38, "k": "plinth", "w": 0.4, "color": "#8A8681"}, {"d": 0.38, "h": 0.5, "k": "box", "w": 0.4, "y": 0.07, "color": "#8C3A2E", "rough": 0.78, "windows": {"to": 0.82, "from": 0.45, "glow": 0.45, "color": "#F2C879"}}, {"d": 0.34, "h": 0.4, "k": "box", "w": 0.36, "y": 0.5700000000000001, "color": "#7A3226", "rough": 0.78, "windows": {"to": 0.8, "from": 0.2, "glow": 0.45, "color": "#F2C879"}}, {"d": 0.44, "k": "roof", "w": 0.46, "y": 0.97, "type": "pyramid", "color": "#EAF1F5", "height": 0.22}, {"d": 0.38, "k": "storefront", "w": 0.4, "sign": "#F2C879", "faceH": 0.3, "awning": "#2E5A72"}, {"h": 0.08, "k": "panel", "w": 0.26, "pos": [0, 0.49, 0.198], "glow": 0.3, "color": "#5FE0B0"}]	\N	195	2026-08-03 01:12:42.306544	2026-08-03 01:12:42.306544
197	steampunk_airship_dock	비행선 도크타워	STEAMPUNK	NORMAL	300	f	0.638	0.638	2.995	[{"d": 0.56, "k": "plinth", "w": 0.56, "color": "#33302B"}, {"d": 0.5, "h": 0.9, "k": "box", "w": 0.5, "y": 0.07, "color": "#7A3E2E", "rough": 0.85, "windows": {"to": 0.85, "from": 0.15, "glow": 0.3, "color": "#8FB0A0"}}, {"d": 0.514, "h": 0.028, "k": "box", "w": 0.514, "y": 0.52, "color": "#B8863B"}, {"d": 0.38, "h": 0.7, "k": "box", "w": 0.38, "y": 0.97, "color": "#8E4A36", "rough": 0.85, "windows": {"to": 0.85, "from": 0.15, "glow": 0.3, "color": "#8FB0A0"}}, {"h": 1, "k": "cyl", "y": 1.6700000000000002, "rb": 0.16, "rt": 0.05, "seg": 10, "color": "#4A453E"}, {"h": 0.05, "k": "cyl", "y": 2.17, "rb": 0.18, "rt": 0.18, "seg": 14, "color": "#B8863B", "detail": true}, {"h": 0.05, "k": "cyl", "y": 2.4699999999999998, "rb": 0.1, "rt": 0.1, "seg": 14, "color": "#B8863B", "detail": true}, {"h": 0.3, "k": "antenna", "y": 2.67}, {"d": 0.07, "h": 0.9, "k": "box", "w": 0.07, "x": 0.24, "y": 0.07, "z": 0.18, "color": "#A65A2E", "detail": true}, {"d": 0.07, "h": 0.9, "k": "box", "w": 0.07, "x": -0.24, "y": 0.07, "z": 0.18, "color": "#A65A2E", "detail": true}, {"d": 0.06, "h": 0.06, "k": "box", "w": 0.2, "x": 0.2, "y": 0.5700000000000001, "z": 0.18, "color": "#A65A2E", "detail": true}]	\N	196	2026-08-03 01:12:42.307484	2026-08-03 01:12:42.307484
198	steampunk_telegraph_tower	전신탑	STEAMPUNK	NORMAL	300	f	0.502	0.502	2.895	[{"d": 0.44, "k": "plinth", "w": 0.44, "color": "#33302B"}, {"d": 0.34, "h": 0.5, "k": "box", "w": 0.34, "y": 0.07, "color": "#7A3E2E", "rough": 0.82, "windows": {"to": 0.8, "from": 0.2, "glow": 0.3, "color": "#8FB0A0"}}, {"h": 1.9, "k": "cyl", "y": 0.5700000000000001, "rb": 0.18, "rt": 0.08, "seg": 8, "color": "#4A453E"}, {"d": 0.04, "h": 0.04, "k": "box", "w": 0.44, "y": 1.37, "color": "#4A453E", "detail": true}, {"d": 0.04, "h": 0.04, "k": "box", "w": 0.36, "y": 1.77, "color": "#4A453E", "detail": true}, {"d": 0.04, "h": 0.04, "k": "box", "w": 0.28, "y": 2.17, "color": "#4A453E", "detail": true}, {"h": 0.05, "k": "cyl", "y": 2.4699999999999998, "rb": 0.1, "rt": 0.1, "seg": 12, "color": "#B8863B", "detail": true}, {"h": 0.35, "k": "antenna", "y": 2.52}, {"d": 0.03, "h": 0.03, "k": "box", "w": 0.03, "x": 0.2, "y": 1.3900000000000001, "color": "#E07A30", "detail": true, "emissive": true}, {"d": 0.03, "h": 0.03, "k": "box", "w": 0.03, "x": -0.2, "y": 1.3900000000000001, "color": "#E07A30", "detail": true, "emissive": true}, {"h": 0.3, "k": "panel", "w": 0.06, "pos": [0, 0.97, 0.10600000000000001], "glow": 0.35, "color": "#E07A30"}]	\N	197	2026-08-03 01:12:42.308458	2026-08-03 01:12:42.308458
199	steampunk_cog_monument	톱니 기념탑	STEAMPUNK	NORMAL	300	f	0.524	0.560	2.435	[{"d": 0.46, "k": "plinth", "w": 0.46, "color": "#33302B"}, {"d": 0.32, "h": 0.5, "k": "box", "w": 0.32, "y": 0.07, "color": "#4A453E", "rough": 0.7, "windows": {"to": 0.7, "from": 0.2, "glow": 0.4, "color": "#E07A30"}}, {"h": 1.5, "k": "cyl", "y": 0.5700000000000001, "rb": 0.1, "rt": 0.06, "seg": 10, "color": "#A65A2E"}, {"h": 0.06, "k": "cyl", "y": 0.77, "rb": 0.26, "rt": 0.26, "seg": 12, "color": "#B8863B", "detail": true}, {"h": 0.06, "k": "cyl", "y": 1.1700000000000002, "rb": 0.2, "rt": 0.2, "seg": 12, "color": "#A65A2E", "detail": true}, {"h": 0.06, "k": "cyl", "y": 1.57, "rb": 0.24, "rt": 0.24, "seg": 12, "color": "#B8863B", "detail": true}, {"h": 0.06, "k": "cyl", "y": 1.97, "rb": 0.16, "rt": 0.16, "seg": 12, "color": "#A65A2E", "detail": true}, {"h": 0.24, "k": "antenna", "y": 2.17}, {"h": 0.1, "k": "panel", "w": 0.24, "pos": [0, 0.43, 0.17800000000000002], "glow": 0.5, "color": "#E07A30"}]	\N	198	2026-08-03 01:12:42.30951	2026-08-03 01:12:42.30951
200	steampunk_clocktower	톱니 시계탑	STEAMPUNK	NORMAL	300	f	0.502	0.517	2.090	[{"d": 0.44, "k": "plinth", "w": 0.44, "color": "#33302B"}, {"d": 0.38, "h": 1.5, "k": "box", "w": 0.38, "y": 0.07, "color": "#7A3E2E", "rough": 0.85, "windows": {"to": 0.55, "from": 0.1, "glow": 0.28, "color": "#8FB0A0"}}, {"d": 0.394, "h": 0.028, "k": "box", "w": 0.394, "y": 0.5700000000000001, "color": "#B8863B"}, {"d": 0.394, "h": 0.028, "k": "box", "w": 0.394, "y": 1.07, "color": "#B8863B"}, {"k": "clock", "w": 0.38, "y": 1.35, "color": "#B8863B"}, {"h": 0.04, "k": "cyl", "y": 1.1700000000000002, "rb": 0.22, "rt": 0.22, "seg": 12, "color": "#B8863B", "detail": true}, {"h": 0.04, "k": "cyl", "y": 0.77, "rb": 0.16, "rt": 0.16, "seg": 12, "color": "#A65A2E", "detail": true}, {"d": 0.42, "h": 0.14, "k": "box", "w": 0.42, "y": 1.57, "color": "#33302B", "rough": 0.7}, {"k": "roof", "w": 0.44, "y": 1.71, "type": "dome", "color": "#A65A2E"}, {"d": 0.02, "h": 0.16, "k": "box", "w": 0.02, "y": 1.9300000000000002, "color": "#B8863B", "detail": true, "emissive": true}, {"h": 0.26, "k": "panel", "w": 0.14, "pos": [0, 0.27, 0.196], "color": "#33302B"}]	\N	199	2026-08-03 01:12:42.310588	2026-08-03 01:12:42.310588
201	steampunk_gasometer	가스탱크	STEAMPUNK	NORMAL	300	f	0.798	0.927	1.630	[{"d": 0.7, "k": "plinth", "w": 0.7, "color": "#33302B"}, {"h": 1.3, "k": "cyl", "y": 0.07, "rb": 0.36, "rt": 0.36, "seg": 16, "color": "#4A453E"}, {"h": 0.05, "k": "cyl", "y": 0.42, "rb": 0.37, "rt": 0.37, "seg": 16, "color": "#B8863B", "detail": true}, {"h": 0.05, "k": "cyl", "y": 0.8700000000000001, "rb": 0.37, "rt": 0.37, "seg": 16, "color": "#B8863B", "detail": true}, {"h": 0.12, "k": "cyl", "y": 1.37, "rb": 0.36, "rt": 0.34, "seg": 16, "color": "#33302B"}, {"h": 0.14, "k": "cyl", "y": 1.49, "rb": 0.24, "rt": 0.24, "seg": 16, "color": "#4A453E"}, {"d": 0.06, "h": 1.5, "k": "box", "w": 0.06, "x": 0.34, "y": 0.07, "z": 0.1, "color": "#4A453E", "detail": true}, {"d": 0.06, "h": 1.5, "k": "box", "w": 0.06, "x": -0.34, "y": 0.07, "z": 0.1, "color": "#4A453E", "detail": true}, {"d": 0.06, "h": 1.5, "k": "box", "w": 0.06, "x": 0.1, "y": 0.07, "z": 0.34, "color": "#4A453E", "detail": true}, {"h": 0.14, "k": "panel", "w": 0.3, "pos": [0, 0.6200000000000001, 0.378], "glow": 0.4, "color": "#E07A30"}]	\N	200	2026-08-03 01:12:42.311619	2026-08-03 01:12:42.311619
202	steampunk_factory	공장 굴뚝동	STEAMPUNK	NORMAL	300	f	0.893	0.893	2.010	[{"d": 0.5, "k": "plinth", "w": 0.68, "color": "#33302B"}, {"d": 0.5, "h": 0.8, "k": "box", "w": 0.68, "y": 0.07, "color": "#7A3E2E", "rough": 0.88, "windows": {"to": 0.8, "from": 0.2, "glow": 0.35, "color": "#E07A30"}}, {"d": 0.022, "h": 0.8, "k": "box", "w": 0.022, "x": -0.2924, "y": 0.07, "z": 0.254, "color": "#8E4A36"}, {"d": 0.022, "h": 0.8, "k": "box", "w": 0.022, "x": -0.19493333333333335, "y": 0.07, "z": 0.254, "color": "#8E4A36"}, {"d": 0.022, "h": 0.8, "k": "box", "w": 0.022, "x": -0.09746666666666667, "y": 0.07, "z": 0.254, "color": "#8E4A36"}, {"d": 0.022, "h": 0.8, "k": "box", "w": 0.022, "x": 0, "y": 0.07, "z": 0.254, "color": "#8E4A36"}, {"d": 0.022, "h": 0.8, "k": "box", "w": 0.022, "x": 0.09746666666666665, "y": 0.07, "z": 0.254, "color": "#8E4A36"}, {"d": 0.022, "h": 0.8, "k": "box", "w": 0.022, "x": 0.19493333333333335, "y": 0.07, "z": 0.254, "color": "#8E4A36"}, {"d": 0.022, "h": 0.8, "k": "box", "w": 0.022, "x": 0.2924, "y": 0.07, "z": 0.254, "color": "#8E4A36"}, {"d": 0.54, "k": "roof", "w": 0.72, "y": 0.8700000000000001, "type": "round", "color": "#4A453E"}, {"d": 0.12, "h": 1, "k": "box", "w": 0.12, "x": -0.22, "y": 0.8700000000000001, "z": -0.12, "color": "#8E4A36"}, {"d": 0.14, "h": 0.08, "k": "box", "w": 0.14, "x": -0.22, "y": 1.87, "z": -0.12, "color": "#A65A2E", "detail": true}, {"d": 0.12, "h": 0.8, "k": "box", "w": 0.12, "x": 0.1, "y": 0.8700000000000001, "z": -0.14, "color": "#8E4A36"}, {"d": 0.14, "h": 0.08, "k": "box", "w": 0.14, "x": 0.1, "y": 1.6700000000000002, "z": -0.14, "color": "#A65A2E", "detail": true}, {"d": 0.14, "h": 0.06, "k": "box", "w": 0.14, "x": -0.22, "y": 1.95, "z": -0.12, "color": "#C8C4BE", "detail": true}, {"d": 0.5, "k": "storefront", "w": 0.68, "sign": "#B8863B", "faceH": 0.34, "awning": "#4A453E"}]	\N	201	2026-08-03 01:12:42.312532	2026-08-03 01:12:42.312532
203	steampunk_foundry	주조소	STEAMPUNK	NORMAL	300	f	0.789	0.789	1.930	[{"d": 0.5, "k": "plinth", "w": 0.6, "color": "#33302B"}, {"d": 0.5, "h": 0.9, "k": "box", "w": 0.6, "y": 0.07, "color": "#4A453E", "metal": 0.3, "rough": 0.8, "windows": {"to": 0.75, "from": 0.3, "glow": 0.5, "color": "#E07A30"}}, {"d": 0.56, "k": "roof", "w": 0.68, "y": 0.97, "type": "pyramid", "color": "#33302B", "height": 0.12}, {"h": 0.9, "k": "cyl", "y": 0.97, "rb": 0.16, "rt": 0.13, "seg": 12, "color": "#8E4A36"}, {"h": 0.06, "k": "cyl", "y": 1.87, "rb": 0.16, "rt": 0.16, "seg": 12, "color": "#B8863B", "detail": true}, {"d": 0.16, "h": 0.16, "k": "box", "w": 0.16, "y": 1.27, "color": "#E07A30", "emissive": true}, {"d": 0.52, "h": 0.04, "k": "box", "w": 0.62, "y": 0.47000000000000003, "color": "#B8863B", "detail": true}, {"h": 0.3, "k": "panel", "w": 0.2, "pos": [-0.1, 0.37, 0.256], "color": "#241812"}, {"h": 0.14, "k": "panel", "w": 0.14, "pos": [0.12, 0.47000000000000003, 0.258], "glow": 0.7, "color": "#E07A30"}]	\N	202	2026-08-03 01:12:42.313599	2026-08-03 01:12:42.313599
204	steampunk_pipe_apartment	파이프 아파트	STEAMPUNK	NORMAL	300	f	0.580	0.502	1.910	[{"d": 0.44, "k": "plinth", "w": 0.5, "color": "#33302B"}, {"d": 0.44, "h": 1.7, "k": "box", "w": 0.5, "y": 0.07, "color": "#7A3E2E", "rough": 0.85, "windows": {"to": 0.92, "from": 0.1, "glow": 0.3, "color": "#8FB0A0"}}, {"d": 0.454, "h": 0.028, "k": "box", "w": 0.514, "y": 0.6699999999999999, "color": "#8E4A36"}, {"d": 0.454, "h": 0.028, "k": "box", "w": 0.514, "y": 1.27, "color": "#8E4A36"}, {"d": 0.44, "k": "parapet", "w": 0.5, "y": 1.77, "color": "#33302B"}, {"k": "rooftopUnits", "w": 0.5, "y": 1.77}, {"d": 0.06, "h": 1.6, "k": "box", "w": 0.06, "x": 0.26, "y": 0.07, "z": 0.14, "color": "#A65A2E", "detail": true}, {"d": 0.06, "h": 0.5, "k": "box", "w": 0.06, "x": 0.26, "y": 0.8700000000000001, "z": 0.14, "color": "#5E9E8A", "detail": true}, {"d": 0.06, "h": 0.06, "k": "box", "w": 0.24, "x": 0.16, "y": 1.37, "z": 0.14, "color": "#A65A2E", "detail": true}, {"d": 0.06, "h": 1.3, "k": "box", "w": 0.06, "x": -0.26, "y": 0.07, "z": 0.14, "color": "#A65A2E", "detail": true}, {"d": 0.06, "h": 0.06, "k": "box", "w": 0.06, "x": -0.26, "y": 0.77, "z": 0.14, "color": "#B8863B", "detail": true}]	\N	203	2026-08-03 01:12:42.314553	2026-08-03 01:12:42.314553
205	steampunk_brass_opera	놋쇠 돔 오페라	STEAMPUNK	NORMAL	300	f	0.752	0.767	1.550	[{"d": 0.56, "k": "plinth", "w": 0.66, "color": "#33302B"}, {"d": 0.52, "h": 0.9, "k": "box", "w": 0.6, "y": 0.07, "color": "#8E4A36", "rough": 0.8, "windows": {"to": 0.8, "from": 0.2, "glow": 0.32, "color": "#8FB0A0"}}, {"d": 0.52, "h": 0.6, "k": "columns", "w": 0.6, "y": 0.07, "color": "#B8863B", "count": 6}, {"h": 0.18, "k": "cyl", "y": 0.97, "rb": 0.26, "rt": 0.22, "seg": 14, "color": "#8E4A36"}, {"k": "roof", "w": 0.6, "y": 1.1500000000000001, "type": "dome", "color": "#B8863B"}, {"d": 0.02, "h": 0.18, "k": "box", "w": 0.02, "y": 1.37, "color": "#B8863B", "detail": true, "emissive": true}, {"d": 0.5700000000000001, "h": 0.05, "k": "box", "w": 0.65, "y": 0.97, "color": "#B8863B"}, {"h": 0.1, "k": "panel", "w": 0.34, "pos": [0, 0.6699999999999999, 0.278], "glow": 0.3, "color": "#B8863B"}]	\N	204	2026-08-03 01:12:42.315559	2026-08-03 01:12:42.315559
206	steampunk_cityhall	시청	STEAMPUNK	NORMAL	300	f	0.812	0.824	1.750	[{"d": 0.5, "k": "plinth", "w": 0.62, "color": "#33302B"}, {"d": 0.5, "h": 0.9, "k": "box", "w": 0.62, "y": 0.07, "color": "#7A3E2E", "rough": 0.82, "windows": {"to": 0.85, "from": 0.15, "glow": 0.3, "color": "#8FB0A0"}}, {"d": 0.5, "h": 0.5, "k": "columns", "w": 0.62, "y": 0.07, "color": "#B8863B", "count": 6}, {"d": 0.58, "k": "roof", "w": 0.7, "y": 0.97, "type": "pyramid", "color": "#4A453E", "height": 0.14}, {"d": 0.24, "h": 0.44, "k": "box", "w": 0.24, "y": 0.97, "color": "#8E4A36", "rough": 0.82}, {"k": "clock", "w": 0.24, "y": 1.21, "color": "#B8863B"}, {"k": "roof", "w": 0.34, "y": 1.4100000000000001, "type": "dome", "color": "#A65A2E"}, {"d": 0.02, "h": 0.12, "k": "box", "w": 0.02, "y": 1.6300000000000001, "color": "#B8863B", "detail": true, "emissive": true}, {"h": 0.08, "k": "panel", "w": 0.3, "pos": [0, 0.75, 0.268], "glow": 0.25, "color": "#B8863B"}]	\N	205	2026-08-03 01:12:42.31648	2026-08-03 01:12:42.31648
207	steampunk_tenement	공동주택	STEAMPUNK	NORMAL	300	f	0.638	0.531	2.070	[{"d": 0.44, "k": "plinth", "w": 0.56, "color": "#33302B"}, {"d": 0.44, "h": 1.6, "k": "box", "w": 0.56, "y": 0.07, "color": "#8E4A36", "rough": 0.85, "windows": {"to": 0.92, "from": 0.1, "glow": 0.3, "color": "#8FB0A0"}}, {"d": 0.454, "h": 0.028, "k": "box", "w": 0.5740000000000001, "y": 0.5700000000000001, "color": "#7A3E2E"}, {"d": 0.454, "h": 0.028, "k": "box", "w": 0.5740000000000001, "y": 1.07, "color": "#7A3E2E"}, {"d": 0.44, "k": "parapet", "w": 0.56, "y": 1.6700000000000002, "color": "#33302B"}, {"d": 0.44, "k": "balconies", "w": 0.56, "y0": 0.37, "y1": 1.47, "color": "#4A453E", "floors": 5}, {"d": 0.03, "h": 1.3, "k": "box", "w": 0.03, "x": 0.24, "y": 0.37, "z": 0.23, "color": "#4A453E"}, {"d": 0.03, "h": 1.3, "k": "box", "w": 0.03, "x": -0.24, "y": 0.37, "z": 0.23, "color": "#4A453E"}, {"d": 0.1, "h": 0.4, "k": "box", "w": 0.1, "x": -0.2, "y": 1.6700000000000002, "z": -0.1, "color": "#8E4A36"}, {"d": 0.06, "h": 1.4, "k": "box", "w": 0.06, "x": 0.28, "y": 0.07, "z": 0.1, "color": "#A65A2E", "detail": true}]	\N	206	2026-08-03 01:12:42.317408	2026-08-03 01:12:42.317408
208	steampunk_manor	발명가 저택	STEAMPUNK	NORMAL	300	f	0.835	0.835	1.570	[{"d": 0.48, "k": "plinth", "w": 0.64, "color": "#33302B"}, {"d": 0.48, "h": 0.9, "k": "box", "w": 0.64, "y": 0.07, "color": "#7A3E2E", "rough": 0.82, "windows": {"to": 0.82, "from": 0.18, "glow": 0.32, "color": "#8FB0A0"}}, {"d": 0.56, "k": "roof", "w": 0.72, "y": 0.97, "type": "pyramid", "color": "#4A453E", "height": 0.2}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.2752, "y": 0.07, "z": 0.244, "color": "#8E4A36"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.16512, "y": 0.07, "z": 0.244, "color": "#8E4A36"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.055039999999999985, "y": 0.07, "z": 0.244, "color": "#8E4A36"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.055039999999999985, "y": 0.07, "z": 0.244, "color": "#8E4A36"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.16512000000000002, "y": 0.07, "z": 0.244, "color": "#8E4A36"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.2752, "y": 0.07, "z": 0.244, "color": "#8E4A36"}, {"d": 0.22, "h": 1.2, "k": "box", "w": 0.22, "x": -0.28, "y": 0.07, "z": 0.06, "color": "#8E4A36", "rough": 0.82, "windows": {"to": 0.8, "from": 0.3, "glow": 0.32, "color": "#8FB0A0"}}, {"h": 0.1, "k": "cyl", "y": 1.27, "rb": 0.15, "rt": 0.13, "seg": 12, "color": "#33302B"}, {"d": 0.24, "h": 0.16, "k": "box", "w": 0.24, "x": -0.28, "y": 1.27, "z": 0.06, "color": "#33302B"}, {"d": 0.2, "h": 0.14, "k": "box", "w": 0.2, "x": -0.28, "y": 1.4300000000000002, "z": 0.06, "color": "#B8863B"}, {"d": 0.08, "h": 0.4, "k": "box", "w": 0.08, "x": 0.22, "y": 0.97, "z": -0.1, "color": "#8E4A36", "detail": true}, {"h": 0.26, "k": "panel", "w": 0.14, "pos": [0.05, 0.23, 0.246], "color": "#4A453E"}]	\N	207	2026-08-03 01:12:42.318381	2026-08-03 01:12:42.318381
235	egypt_pottery	도기공방	EGYPT	NORMAL	300	f	0.557	0.594	1.530	[{"d": 0.42, "k": "plinth", "w": 0.44, "color": "#C79A5B"}, {"d": 0.42, "h": 0.5, "k": "box", "w": 0.44, "y": 0.07, "color": "#D8B77A", "rough": 0.9}, {"d": 0.38, "h": 0.4, "k": "box", "w": 0.4, "y": 0.5700000000000001, "color": "#B8894A", "rough": 0.9, "windows": {"to": 0.8, "from": 0.2, "glow": 0, "color": "#2B2723"}}, {"d": 0.46, "k": "roof", "w": 0.48, "y": 0.97, "type": "pyramid", "color": "#9B4B2E", "height": 0.1}, {"d": 0.12, "h": 0.5, "k": "box", "w": 0.12, "x": 0.14, "y": 0.97, "z": -0.1, "color": "#9B4B2E"}, {"d": 0.14, "h": 0.06, "k": "box", "w": 0.14, "x": 0.14, "y": 1.47, "z": -0.1, "color": "#7A3A24", "detail": true}, {"d": 0.42, "k": "storefront", "w": 0.44, "sign": "#1F4E8C", "faceH": 0.26, "awning": "#2B2723"}, {"d": 0.08, "h": 0.1, "k": "box", "w": 0.08, "x": -0.16, "y": 0.07, "z": 0.24, "color": "#9B4B2E", "detail": true}]	\N	234	2026-08-03 01:12:42.345062	2026-08-03 01:12:42.345062
209	steampunk_townhouse	타운하우스	STEAMPUNK	NORMAL	300	f	0.557	0.564	1.830	[{"d": 0.42, "k": "plinth", "w": 0.42, "color": "#33302B"}, {"d": 0.42, "h": 1.3, "k": "box", "w": 0.42, "y": 0.07, "color": "#7A3E2E", "rough": 0.85, "windows": {"to": 0.9, "from": 0.12, "glow": 0.32, "color": "#8FB0A0"}}, {"d": 0.434, "h": 0.028, "k": "box", "w": 0.434, "y": 0.51, "color": "#8E4A36"}, {"d": 0.434, "h": 0.028, "k": "box", "w": 0.434, "y": 0.95, "color": "#8E4A36"}, {"d": 0.48, "k": "roof", "w": 0.48, "y": 1.37, "type": "pyramid", "color": "#4A453E", "height": 0.16}, {"d": 0.1, "h": 0.4, "k": "box", "w": 0.1, "x": 0.14, "y": 1.37, "z": -0.1, "color": "#8E4A36"}, {"d": 0.12, "h": 0.06, "k": "box", "w": 0.12, "x": 0.14, "y": 1.77, "z": -0.1, "color": "#A65A2E", "detail": true}, {"d": 0.06, "h": 1, "k": "box", "w": 0.06, "x": -0.22, "y": 0.07, "z": 0.14, "color": "#A65A2E", "detail": true}, {"h": 0.24, "k": "panel", "w": 0.12, "pos": [0, 0.21000000000000002, 0.226], "color": "#4A453E"}]	\N	208	2026-08-03 01:12:42.319469	2026-08-03 01:12:42.319469
210	steampunk_observatory	천문대	STEAMPUNK	NORMAL	300	f	0.570	0.673	1.770	[{"d": 0.5, "k": "plinth", "w": 0.5, "color": "#33302B"}, {"d": 0.44, "h": 0.9, "k": "box", "w": 0.44, "y": 0.07, "color": "#7A3E2E", "rough": 0.82, "windows": {"to": 0.75, "from": 0.2, "glow": 0.3, "color": "#8FB0A0"}}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.1892, "y": 0.07, "z": 0.224, "color": "#8E4A36"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.06306666666666667, "y": 0.07, "z": 0.224, "color": "#8E4A36"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.06306666666666666, "y": 0.07, "z": 0.224, "color": "#8E4A36"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.1892, "y": 0.07, "z": 0.224, "color": "#8E4A36"}, {"h": 0.28, "k": "cyl", "y": 0.97, "rb": 0.26, "rt": 0.24, "seg": 14, "color": "#8E4A36"}, {"k": "roof", "w": 0.62, "y": 1.25, "type": "dome", "color": "#A65A2E"}, {"d": 0.06, "h": 0.4, "k": "box", "w": 0.06, "x": 0.08, "y": 1.37, "color": "#B8863B", "detail": true}, {"d": 0.46, "h": 0.04, "k": "box", "w": 0.46, "y": 0.52, "color": "#B8863B", "detail": true}, {"h": 0.08, "k": "panel", "w": 0.3, "pos": [0, 0.73, 0.23800000000000002], "glow": 0.25, "color": "#B8863B"}]	\N	209	2026-08-03 01:12:42.320471	2026-08-03 01:12:42.320471
211	steampunk_pump_station	증기 펌프장	STEAMPUNK	NORMAL	300	f	0.694	0.694	1.630	[{"d": 0.48, "k": "plinth", "w": 0.52, "color": "#33302B"}, {"d": 0.48, "h": 0.9, "k": "box", "w": 0.52, "y": 0.07, "color": "#7A3E2E", "rough": 0.85, "windows": {"to": 0.75, "from": 0.3, "glow": 0.4, "color": "#E07A30"}}, {"d": 0.52, "k": "roof", "w": 0.56, "y": 0.97, "type": "round", "color": "#4A453E"}, {"h": 0.04, "k": "cyl", "y": 1.1700000000000002, "rb": 0.16, "rt": 0.16, "seg": 12, "color": "#B8863B", "detail": true}, {"d": 0.1, "h": 0.6, "k": "box", "w": 0.1, "x": 0.18, "y": 0.97, "z": -0.1, "color": "#A65A2E"}, {"d": 0.12, "h": 0.06, "k": "box", "w": 0.12, "x": 0.18, "y": 1.57, "z": -0.1, "color": "#C8C4BE", "detail": true}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.2236, "y": 0.07, "z": 0.244, "color": "#8E4A36"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": -0.1118, "y": 0.07, "z": 0.244, "color": "#8E4A36"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0, "y": 0.07, "z": 0.244, "color": "#8E4A36"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.1118, "y": 0.07, "z": 0.244, "color": "#8E4A36"}, {"d": 0.02, "h": 0.9, "k": "box", "w": 0.02, "x": 0.2236, "y": 0.07, "z": 0.244, "color": "#8E4A36"}, {"h": 0.16, "k": "panel", "w": 0.16, "pos": [0, 0.47000000000000003, 0.258], "glow": 0.5, "color": "#E07A30"}]	\N	210	2026-08-03 01:12:42.321418	2026-08-03 01:12:42.321418
212	steampunk_locomotive_shed	기관차고	STEAMPUNK	NORMAL	300	f	0.893	0.914	1.630	[{"d": 0.5, "k": "plinth", "w": 0.66, "color": "#33302B"}, {"d": 0.5, "h": 0.8, "k": "box", "w": 0.66, "y": 0.07, "color": "#8E4A36", "rough": 0.85}, {"d": 0.56, "k": "roof", "w": 0.72, "y": 0.8700000000000001, "type": "round", "color": "#4A453E"}, {"h": 0.5, "k": "panel", "w": 0.32, "pos": [0, 0.32, 0.256], "color": "#1E1A16"}, {"d": 0.06, "h": 0.06, "k": "box", "w": 0.34, "y": 0.5700000000000001, "z": 0.25, "color": "#B8863B"}, {"d": 0.12, "h": 0.7, "k": "box", "w": 0.12, "x": -0.22, "y": 0.8700000000000001, "z": -0.12, "color": "#8E4A36"}, {"d": 0.14, "h": 0.06, "k": "box", "w": 0.14, "x": -0.22, "y": 1.57, "z": -0.12, "color": "#A65A2E", "detail": true}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": -0.2838, "y": 0.07, "z": 0.254, "color": "#7A3E2E"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": -0.17028, "y": 0.07, "z": 0.254, "color": "#7A3E2E"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": -0.056759999999999984, "y": 0.07, "z": 0.254, "color": "#7A3E2E"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": 0.056759999999999984, "y": 0.07, "z": 0.254, "color": "#7A3E2E"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": 0.17028000000000001, "y": 0.07, "z": 0.254, "color": "#7A3E2E"}, {"d": 0.02, "h": 0.8, "k": "box", "w": 0.02, "x": 0.2838, "y": 0.07, "z": 0.254, "color": "#7A3E2E"}, {"h": 0.1, "k": "panel", "w": 0.4, "pos": [0, 0.73, 0.268], "glow": 0.28, "color": "#B8863B"}]	\N	211	2026-08-03 01:12:42.322383	2026-08-03 01:12:42.322383
213	steampunk_workshop	발명가 작업장	STEAMPUNK	NORMAL	300	f	0.670	0.685	1.270	[{"d": 0.46, "k": "plinth", "w": 0.5, "color": "#33302B"}, {"d": 0.46, "h": 0.9, "k": "box", "w": 0.5, "y": 0.07, "color": "#7A3E2E", "rough": 0.85, "windows": {"to": 0.8, "from": 0.4, "glow": 0.35, "color": "#8FB0A0"}}, {"d": 0.5, "k": "roof", "w": 0.54, "y": 0.97, "type": "round", "color": "#A65A2E"}, {"h": 0.04, "k": "cyl", "y": 1.23, "rb": 0.12, "rt": 0.12, "seg": 10, "color": "#B8863B", "detail": true}, {"d": 0.05, "h": 0.3, "k": "box", "w": 0.05, "x": 0.12, "y": 0.97, "z": -0.06, "color": "#A65A2E", "detail": true}, {"d": 0.47400000000000003, "h": 0.028, "k": "box", "w": 0.514, "y": 0.55, "color": "#8E4A36"}, {"d": 0.46, "k": "storefront", "w": 0.5, "sign": "#B8863B", "faceH": 0.32, "awning": "#4A453E"}, {"h": 0.12, "k": "panel", "w": 0.12, "pos": [0.14, 0.77, 0.248], "glow": 0.5, "color": "#E07A30"}]	\N	212	2026-08-03 01:12:42.323389	2026-08-03 01:12:42.323389
214	steampunk_tinker_shop	땜장이 상점	STEAMPUNK	NORMAL	300	f	0.580	0.596	1.370	[{"d": 0.4, "k": "plinth", "w": 0.44, "color": "#33302B"}, {"d": 0.4, "h": 0.56, "k": "box", "w": 0.44, "y": 0.07, "color": "#A65A2E", "metal": 0.3, "rough": 0.7, "windows": {"to": 0.82, "from": 0.45, "glow": 0.35, "color": "#8FB0A0"}}, {"d": 0.36, "h": 0.44, "k": "box", "w": 0.4, "y": 0.6300000000000001, "color": "#7A3E2E", "rough": 0.85, "windows": {"to": 0.8, "from": 0.2, "glow": 0.35, "color": "#8FB0A0"}}, {"d": 0.44, "k": "roof", "w": 0.5, "y": 1.07, "type": "pyramid", "color": "#4A453E", "height": 0.16}, {"h": 0.04, "k": "cyl", "y": 1.23, "rb": 0.1, "rt": 0.1, "seg": 10, "color": "#B8863B", "detail": true}, {"d": 0.08, "h": 0.3, "k": "box", "w": 0.08, "x": 0.14, "y": 1.07, "z": -0.08, "color": "#A65A2E"}, {"d": 0.4, "k": "storefront", "w": 0.44, "sign": "#B8863B", "faceH": 0.3, "awning": "#33302B"}, {"h": 0.1, "k": "panel", "w": 0.1, "pos": [0.14, 0.47000000000000003, 0.20800000000000002], "glow": 0.5, "color": "#E07A30"}]	\N	213	2026-08-03 01:12:42.324336	2026-08-03 01:12:42.324336
215	steampunk_pub	펍	STEAMPUNK	NORMAL	300	f	0.580	0.610	1.350	[{"d": 0.42, "k": "plinth", "w": 0.46, "color": "#33302B"}, {"d": 0.42, "h": 0.6, "k": "box", "w": 0.46, "y": 0.07, "color": "#7A3E2E", "rough": 0.85, "windows": {"to": 0.8, "from": 0.4, "glow": 0.4, "color": "#E07A30"}}, {"d": 0.38, "h": 0.44, "k": "box", "w": 0.42, "y": 0.6699999999999999, "color": "#8E4A36", "rough": 0.85, "windows": {"to": 0.8, "from": 0.2, "glow": 0.4, "color": "#E07A30"}}, {"d": 0.06, "h": 0.24, "k": "box", "w": 0.48, "y": 1.11, "z": 0.19, "color": "#8E4A36", "rough": 0.8}, {"d": 0.44, "k": "roof", "w": 0.5, "y": 1.11, "type": "pyramid", "color": "#4A453E", "height": 0.12}, {"d": 0.02, "h": 0.6, "k": "box", "w": 0.02, "x": -0.1978, "y": 0.07, "z": 0.214, "color": "#8E4A36"}, {"d": 0.02, "h": 0.6, "k": "box", "w": 0.02, "x": -0.06593333333333334, "y": 0.07, "z": 0.214, "color": "#8E4A36"}, {"d": 0.02, "h": 0.6, "k": "box", "w": 0.02, "x": 0.06593333333333332, "y": 0.07, "z": 0.214, "color": "#8E4A36"}, {"d": 0.02, "h": 0.6, "k": "box", "w": 0.02, "x": 0.1978, "y": 0.07, "z": 0.214, "color": "#8E4A36"}, {"d": 0.42, "k": "storefront", "w": 0.46, "sign": "#B8863B", "faceH": 0.34, "awning": "#5A2A1E"}, {"d": 0.1, "h": 0.14, "k": "box", "w": 0.02, "x": 0.22, "y": 0.6699999999999999, "z": 0.2, "color": "#4A453E"}, {"h": 0.12, "k": "panel", "w": 0.12, "pos": [0.22, 0.6300000000000001, 0.20800000000000002], "glow": 0.3, "color": "#B8863B"}]	\N	214	2026-08-03 01:12:42.325931	2026-08-03 01:12:42.325931
216	steampunk_museum	기계 박물관	STEAMPUNK	NORMAL	300	f	0.843	0.850	1.480	[{"d": 0.5, "k": "plinth", "w": 0.64, "color": "#33302B"}, {"d": 0.5, "h": 0.9, "k": "box", "w": 0.64, "y": 0.07, "color": "#8E4A36", "rough": 0.82, "windows": {"to": 0.78, "from": 0.25, "glow": 0.3, "color": "#8FB0A0"}}, {"d": 0.5, "h": 0.7, "k": "columns", "w": 0.64, "y": 0.07, "color": "#B8863B", "count": 7}, {"d": 0.54, "h": 0.08, "k": "box", "w": 0.68, "y": 0.97, "color": "#B8863B"}, {"d": 0.54, "k": "roof", "w": 0.68, "y": 1.05, "type": "round", "color": "#4A453E"}, {"h": 0.05, "k": "cyl", "y": 1.27, "rb": 0.18, "rt": 0.18, "seg": 12, "color": "#B8863B", "detail": true}, {"h": 0.05, "k": "cyl", "y": 1.4300000000000002, "rb": 0.12, "rt": 0.12, "seg": 12, "color": "#A65A2E", "detail": true}, {"h": 0.1, "k": "panel", "w": 0.32, "pos": [0, 0.69, 0.268], "glow": 0.3, "color": "#B8863B"}]	\N	215	2026-08-03 01:12:42.326954	2026-08-03 01:12:42.326954
217	egypt_obelisk	오벨리스크	EGYPT	NORMAL	300	f	0.502	0.518	2.690	[{"d": 0.44, "k": "plinth", "w": 0.44, "color": "#C79A5B"}, {"d": 0.3, "h": 0.24, "k": "box", "w": 0.3, "y": 0.07, "color": "#C79A5B", "rough": 0.9}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.18, "y": 0.07, "z": 0.24, "color": "#B8894A"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.13999999999999999, "y": 0.098, "z": 0.2, "color": "#B8894A"}, {"d": 0.18, "h": 2.1, "k": "box", "w": 0.18, "y": 0.31, "color": "#D8B77A", "rough": 0.88}, {"d": 0.15, "h": 0.05, "k": "box", "w": 0.15, "y": 2.4099999999999997, "color": "#C79A5B"}, {"k": "roof", "w": 0.14, "y": 2.46, "type": "pyramid", "color": "#D9B23A", "height": 0.2}, {"h": 1.6, "k": "panel", "w": 0.1, "pos": [0, 1.1700000000000002, 0.096], "glow": 0.08, "color": "#9B4B2E"}, {"h": 1.6, "k": "panel", "w": 0.1, "pos": [0.096, 1.1700000000000002, 0], "glow": 0.08, "rotY": 1.5708, "color": "#9B4B2E"}]	\N	216	2026-08-03 01:12:42.327879	2026-08-03 01:12:42.327879
218	egypt_step_pyramid	계단 피라미드	EGYPT	NORMAL	300	f	0.866	0.866	1.820	[{"d": 0.76, "k": "plinth", "w": 0.76, "color": "#C79A5B"}, {"d": 0.7, "h": 0.4, "k": "box", "w": 0.7, "y": 0.07, "color": "#D8B77A", "rough": 0.92}, {"d": 0.56, "h": 0.34, "k": "box", "w": 0.56, "y": 0.47000000000000003, "color": "#C79A5B", "rough": 0.92}, {"d": 0.44, "h": 0.3, "k": "box", "w": 0.44, "y": 0.81, "color": "#D8B77A", "rough": 0.92}, {"d": 0.32, "h": 0.28, "k": "box", "w": 0.32, "y": 1.11, "color": "#C79A5B", "rough": 0.92}, {"d": 0.2, "h": 0.26, "k": "box", "w": 0.2, "y": 1.3900000000000001, "color": "#D8B77A", "rough": 0.92}, {"k": "roof", "w": 0.22, "y": 1.6500000000000001, "type": "pyramid", "color": "#C79A5B", "height": 0.14}, {"h": 0.24, "k": "panel", "w": 0.14, "pos": [0, 0.23, 0.356], "color": "#2B2723"}, {"d": 0.08, "h": 0.16, "k": "box", "w": 0.08, "x": 0.34, "y": 0.07, "z": 0.34, "color": "#D9B23A", "detail": true, "emissive": true}]	\N	217	2026-08-03 01:12:42.328925	2026-08-03 01:12:42.328925
220	egypt_great_temple	대신전	EGYPT	NORMAL	300	f	0.844	0.748	1.470	[{"d": 0.6, "k": "plinth", "w": 0.74, "color": "#C79A5B"}, {"d": 0.36, "h": 1.1, "k": "box", "w": 0.24, "x": -0.24, "y": 0.07, "z": 0.14, "color": "#D8B77A", "rough": 0.9}, {"d": 0.32, "h": 0.14, "k": "box", "w": 0.2, "x": -0.24, "y": 1.1700000000000002, "z": 0.14, "color": "#C79A5B", "rough": 0.9}, {"d": 0.36, "h": 1.1, "k": "box", "w": 0.24, "x": 0.24, "y": 0.07, "z": 0.14, "color": "#D8B77A", "rough": 0.9}, {"d": 0.32, "h": 0.14, "k": "box", "w": 0.2, "x": 0.24, "y": 1.1700000000000002, "z": 0.14, "color": "#C79A5B", "rough": 0.9}, {"d": 0.34, "h": 0.8, "k": "box", "w": 0.6, "y": 0.07, "z": -0.12, "color": "#C79A5B", "rough": 0.9, "windows": {"to": 0.75, "from": 0.4, "glow": 0.15, "color": "#1F4E8C"}}, {"d": 0.38, "h": 0.12, "k": "box", "w": 0.64, "y": 0.8700000000000001, "z": -0.12, "color": "#D8B77A", "rough": 0.9}, {"h": 0.6, "k": "panel", "w": 0.16, "pos": [0, 0.41000000000000003, 0.326], "color": "#2B2723"}, {"h": 0.08, "k": "panel", "w": 0.4, "pos": [0, 1.23, 0.156], "glow": 0.15, "color": "#1F4E8C"}, {"d": 0.06, "h": 0.16, "k": "box", "w": 0.06, "x": -0.24, "y": 1.31, "z": 0.24, "color": "#D9B23A", "detail": true, "emissive": true}, {"d": 0.06, "h": 0.16, "k": "box", "w": 0.06, "x": 0.24, "y": 1.31, "z": 0.24, "color": "#D9B23A", "detail": true, "emissive": true}]	\N	219	2026-08-03 01:12:42.330678	2026-08-03 01:12:42.330678
221	egypt_pharaoh_palace	파라오 궁	EGYPT	NORMAL	300	f	0.844	0.807	1.470	[{"d": 0.56, "k": "plinth", "w": 0.74, "color": "#C79A5B"}, {"d": 0.5, "h": 0.16, "k": "box", "w": 0.7, "y": 0.07, "color": "#B8894A", "rough": 0.9}, {"d": 0.44, "h": 0.7, "k": "box", "w": 0.62, "y": 0.23, "color": "#D8B77A", "rough": 0.88, "windows": {"to": 0.75, "from": 0.3, "glow": 0.2, "color": "#1F4E8C"}}, {"d": 0.44, "h": 0.7, "k": "columns", "w": 0.62, "y": 0.23, "color": "#D9B23A", "count": 7}, {"d": 0.48, "h": 0.12, "k": "box", "w": 0.66, "y": 0.9299999999999999, "color": "#1F4E8C", "rough": 0.7}, {"d": 0.36, "h": 0.34, "k": "box", "w": 0.5, "y": 1.05, "color": "#D8B77A", "rough": 0.88, "windows": {"to": 0.8, "from": 0.2, "glow": 0.2, "color": "#1F4E8C"}}, {"d": 0.4, "h": 0.08, "k": "box", "w": 0.54, "y": 1.3900000000000001, "color": "#D9B23A"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.4, "y": 0.07, "z": 0.37, "color": "#B8894A"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.36000000000000004, "y": 0.098, "z": 0.33, "color": "#B8894A"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.32, "y": 0.126, "z": 0.29, "color": "#B8894A"}, {"h": 0.08, "k": "panel", "w": 0.5, "pos": [0, 0.8500000000000001, 0.23800000000000002], "glow": 0.3, "color": "#D9B23A"}, {"h": 0.34, "k": "panel", "w": 0.16, "pos": [0, 0.4, 0.23600000000000002], "color": "#2B2723"}]	\N	220	2026-08-03 01:12:42.331715	2026-08-03 01:12:42.331715
222	egypt_pylon_gate	파일런 대문	EGYPT	NORMAL	300	f	0.821	0.625	1.970	[{"d": 0.42, "k": "plinth", "w": 0.72, "color": "#C79A5B"}, {"d": 0.38, "h": 1.4, "k": "box", "w": 0.3, "x": -0.2, "y": 0.07, "color": "#D8B77A", "rough": 0.9}, {"d": 0.32, "h": 0.18, "k": "box", "w": 0.24, "x": -0.2, "y": 1.47, "color": "#C79A5B", "rough": 0.9}, {"d": 0.38, "h": 1.4, "k": "box", "w": 0.3, "x": 0.2, "y": 0.07, "color": "#D8B77A", "rough": 0.9}, {"d": 0.32, "h": 0.18, "k": "box", "w": 0.24, "x": 0.2, "y": 1.47, "color": "#C79A5B", "rough": 0.9}, {"d": 0.3, "h": 0.9, "k": "box", "w": 0.16, "y": 0.07, "color": "#2B2723", "rough": 0.8}, {"d": 0.34, "h": 0.14, "k": "box", "w": 0.5, "y": 0.97, "color": "#C79A5B", "rough": 0.9}, {"h": 0.7, "k": "panel", "w": 0.26, "pos": [-0.2, 0.5700000000000001, 0.20600000000000002], "glow": 0.1, "color": "#9B4B2E"}, {"h": 0.7, "k": "panel", "w": 0.26, "pos": [0.2, 0.5700000000000001, 0.20600000000000002], "glow": 0.1, "color": "#9B4B2E"}, {"h": 0.08, "k": "panel", "w": 0.4, "pos": [0, 1.05, 0.186], "glow": 0.15, "color": "#1F4E8C"}, {"d": 0.03, "h": 0.5, "k": "box", "w": 0.03, "x": -0.2, "y": 1.47, "z": 0.2, "color": "#9B4B2E", "detail": true}, {"d": 0.03, "h": 0.5, "k": "box", "w": 0.03, "x": 0.2, "y": 1.47, "z": 0.2, "color": "#9B4B2E", "detail": true}]	\N	221	2026-08-03 01:12:42.332687	2026-08-03 01:12:42.332687
223	egypt_sphinx_gate	스핑크스 게이트	EGYPT	NORMAL	300	f	0.821	0.765	1.330	[{"d": 0.5, "k": "plinth", "w": 0.72, "color": "#C79A5B"}, {"d": 0.4, "h": 1.1, "k": "box", "w": 0.26, "x": -0.22, "y": 0.07, "color": "#D8B77A", "rough": 0.9}, {"d": 0.36, "h": 0.16, "k": "box", "w": 0.22, "x": -0.22, "y": 1.1700000000000002, "color": "#C79A5B", "rough": 0.9}, {"d": 0.4, "h": 1.1, "k": "box", "w": 0.26, "x": 0.22, "y": 0.07, "color": "#D8B77A", "rough": 0.9}, {"d": 0.36, "h": 0.16, "k": "box", "w": 0.22, "x": 0.22, "y": 1.1700000000000002, "color": "#C79A5B", "rough": 0.9}, {"h": 0.6, "k": "panel", "w": 0.16, "pos": [0, 0.37, 0.20600000000000002], "color": "#2B2723"}, {"d": 0.4, "h": 0.12, "k": "box", "w": 0.5, "y": 0.97, "color": "#C79A5B", "rough": 0.9}, {"d": 0.3, "h": 0.12, "k": "box", "w": 0.14, "x": -0.3, "y": 0.07, "z": 0.3, "color": "#B8894A"}, {"d": 0.12, "h": 0.14, "k": "box", "w": 0.12, "x": -0.3, "y": 0.19, "z": 0.42, "color": "#D9B23A"}, {"d": 0.3, "h": 0.12, "k": "box", "w": 0.14, "x": 0.3, "y": 0.07, "z": 0.3, "color": "#B8894A"}, {"d": 0.12, "h": 0.14, "k": "box", "w": 0.12, "x": 0.3, "y": 0.19, "z": 0.42, "color": "#D9B23A"}, {"h": 0.06, "k": "panel", "w": 0.34, "pos": [0, 1.01, 0.156], "glow": 0.15, "color": "#1F4E8C"}]	\N	222	2026-08-03 01:12:42.333742	2026-08-03 01:12:42.333742
225	egypt_mortuary_temple	장제전	EGYPT	NORMAL	300	f	0.866	0.865	1.820	[{"d": 0.56, "k": "plinth", "w": 0.76, "color": "#C79A5B"}, {"d": 0.56, "h": 0.34, "k": "box", "w": 0.76, "y": 0.07, "color": "#D8B77A", "rough": 0.9}, {"d": 0.56, "h": 0.28, "k": "columns", "w": 0.76, "y": 0.07, "color": "#B8894A", "count": 8}, {"d": 0.46, "h": 0.06, "k": "box", "w": 0.62, "y": 0.41000000000000003, "color": "#C79A5B"}, {"d": 0.42, "h": 0.34, "k": "box", "w": 0.6, "y": 0.47000000000000003, "z": -0.04, "color": "#D8B77A", "rough": 0.9}, {"d": 0.32, "h": 0.06, "k": "box", "w": 0.46, "y": 0.81, "color": "#C79A5B"}, {"d": 0.3, "h": 0.34, "k": "box", "w": 0.44, "y": 0.8700000000000001, "z": -0.08, "color": "#D8B77A", "rough": 0.9}, {"d": 0.24, "h": 0.06, "k": "box", "w": 0.3, "y": 1.21, "z": -0.08, "color": "#C79A5B"}, {"d": 0.14, "h": 0.4, "k": "box", "w": 0.14, "y": 1.27, "z": -0.08, "color": "#C79A5B"}, {"k": "roof", "w": 0.14, "y": 1.6700000000000002, "type": "pyramid", "color": "#D9B23A", "height": 0.12}, {"h": 0.06, "k": "panel", "w": 0.5, "pos": [0, 0.39, 0.296], "glow": 0.12, "color": "#1F4E8C"}, {"h": 0.16, "k": "panel", "w": 0.14, "pos": [0, 0.31, 0.296], "color": "#2B2723"}]	\N	224	2026-08-03 01:12:42.335722	2026-08-03 01:12:42.335722
226	egypt_colossus	거상	EGYPT	NORMAL	300	f	0.570	0.570	1.630	[{"d": 0.5, "k": "plinth", "w": 0.5, "color": "#C79A5B"}, {"d": 0.36, "h": 0.4, "k": "box", "w": 0.42, "y": 0.07, "color": "#D8B77A", "rough": 0.9}, {"d": 0.3, "h": 0.6, "k": "box", "w": 0.36, "y": 0.47000000000000003, "z": -0.04, "color": "#C79A5B", "rough": 0.9}, {"d": 0.16, "h": 0.5, "k": "box", "w": 0.1, "x": -0.22, "y": 0.49, "z": 0.02, "color": "#D8B77A"}, {"d": 0.16, "h": 0.5, "k": "box", "w": 0.1, "x": 0.22, "y": 0.49, "z": 0.02, "color": "#D8B77A"}, {"d": 0.22, "h": 0.24, "k": "box", "w": 0.24, "y": 1.07, "z": -0.04, "color": "#D8B77A", "rough": 0.9}, {"d": 0.26, "h": 0.16, "k": "box", "w": 0.3, "y": 1.31, "z": -0.04, "color": "#D9B23A", "rough": 0.6}, {"d": 0.28, "h": 0.05, "k": "box", "w": 0.32, "y": 1.29, "z": -0.04, "color": "#1F4E8C", "rough": 0.6}, {"d": 0.04, "h": 0.16, "k": "box", "w": 0.06, "y": 1.47, "z": 0.06, "color": "#D9B23A", "detail": true}, {"h": 0.16, "k": "panel", "w": 0.12, "pos": [0, 1.1300000000000001, 0.10600000000000001], "color": "#2B2723"}, {"h": 0.24, "k": "panel", "w": 0.3, "pos": [0, 0.6300000000000001, 0.126], "color": "#2B2723"}]	\N	225	2026-08-03 01:12:42.336761	2026-08-03 01:12:42.336761
227	egypt_watchtower	감시탑	EGYPT	NORMAL	300	f	0.502	0.537	1.810	[{"d": 0.44, "k": "plinth", "w": 0.44, "color": "#C79A5B"}, {"d": 0.4, "h": 0.6, "k": "box", "w": 0.4, "y": 0.07, "color": "#D8B77A", "rough": 0.9}, {"d": 0.32, "h": 0.5, "k": "box", "w": 0.32, "y": 0.6699999999999999, "color": "#C79A5B", "rough": 0.9, "windows": {"to": 0.8, "from": 0.2, "glow": 0, "color": "#2B2723"}}, {"d": 0.24, "h": 0.44, "k": "box", "w": 0.24, "y": 1.1700000000000002, "color": "#D8B77A", "rough": 0.9}, {"d": 0.34, "h": 0.12, "k": "box", "w": 0.34, "y": 1.61, "color": "#C79A5B", "rough": 0.9}, {"d": 0.06, "h": 0.08, "k": "box", "w": 0.06, "x": -0.13, "y": 1.73, "z": 0.13, "color": "#C79A5B", "detail": true}, {"d": 0.06, "h": 0.08, "k": "box", "w": 0.06, "x": 0.13, "y": 1.73, "z": 0.13, "color": "#C79A5B", "detail": true}, {"d": 0.06, "h": 0.08, "k": "box", "w": 0.06, "x": -0.13, "y": 1.73, "z": -0.13, "color": "#C79A5B", "detail": true}, {"d": 0.06, "h": 0.08, "k": "box", "w": 0.06, "x": 0.13, "y": 1.73, "z": -0.13, "color": "#C79A5B", "detail": true}, {"h": 0.06, "k": "panel", "w": 0.24, "pos": [0, 1.05, 0.166], "glow": 0.15, "color": "#1F4E8C"}]	\N	226	2026-08-03 01:12:42.337693	2026-08-03 01:12:42.337693
228	egypt_library	서기관 도서관	EGYPT	NORMAL	300	f	0.730	0.803	1.430	[{"d": 0.5, "k": "plinth", "w": 0.64, "color": "#C79A5B"}, {"d": 0.5, "h": 0.9, "k": "box", "w": 0.64, "y": 0.07, "color": "#D8B77A", "rough": 0.9, "windows": {"to": 0.75, "from": 0.3, "glow": 0.2, "color": "#1F4E8C"}}, {"d": 0.5, "h": 0.7, "k": "columns", "w": 0.64, "y": 0.07, "color": "#B8894A", "count": 7}, {"d": 0.54, "h": 0.1, "k": "box", "w": 0.68, "y": 0.97, "color": "#C79A5B", "rough": 0.9}, {"d": 0.4, "h": 0.3, "k": "box", "w": 0.5, "y": 1.07, "color": "#9B4B2E", "rough": 0.85}, {"d": 0.44, "h": 0.06, "k": "box", "w": 0.54, "y": 1.37, "color": "#C79A5B"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.4, "y": 0.07, "z": 0.37, "color": "#B8894A"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.36000000000000004, "y": 0.098, "z": 0.33, "color": "#B8894A"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.32, "y": 0.126, "z": 0.29, "color": "#B8894A"}, {"h": 0.08, "k": "panel", "w": 0.5, "pos": [0, 0.8500000000000001, 0.268], "glow": 0.15, "color": "#1F4E8C"}, {"h": 0.3, "k": "panel", "w": 0.14, "pos": [0, 0.25, 0.266], "color": "#2B2723"}]	\N	227	2026-08-03 01:12:42.338645	2026-08-03 01:12:42.338645
229	egypt_granary	나일 창고	EGYPT	NORMAL	300	f	0.730	0.753	1.450	[{"d": 0.5, "k": "plinth", "w": 0.64, "color": "#C79A5B"}, {"d": 0.5, "h": 0.4, "k": "box", "w": 0.64, "y": 0.07, "color": "#B8894A", "rough": 0.92}, {"h": 0.8, "k": "cyl", "y": 0.47000000000000003, "rb": 0.17, "rt": 0.14, "seg": 12, "color": "#D8B77A"}, {"k": "roof", "w": 0.3, "y": 1.27, "type": "cone", "color": "#C79A5B", "height": 0.18}, {"d": 0.18, "h": 0.6, "k": "box", "w": 0.18, "x": -0.24, "y": 0.47000000000000003, "z": 0.06, "color": "#D8B77A"}, {"d": 0.2, "h": 0.12, "k": "box", "w": 0.2, "x": -0.24, "y": 1.07, "z": 0.06, "color": "#C79A5B"}, {"d": 0.18, "h": 0.6, "k": "box", "w": 0.18, "x": 0.24, "y": 0.47000000000000003, "z": 0.06, "color": "#D8B77A"}, {"d": 0.2, "h": 0.12, "k": "box", "w": 0.2, "x": 0.24, "y": 1.07, "z": 0.06, "color": "#C79A5B"}, {"h": 0.06, "k": "panel", "w": 0.4, "pos": [0, 0.35000000000000003, 0.268], "glow": 0.12, "color": "#1F4E8C"}]	\N	228	2026-08-03 01:12:42.339579	2026-08-03 01:12:42.339579
230	egypt_noble_house	귀족 저택	EGYPT	NORMAL	300	f	0.684	0.782	1.530	[{"d": 0.48, "k": "plinth", "w": 0.6, "color": "#C79A5B"}, {"d": 0.48, "h": 0.56, "k": "box", "w": 0.6, "y": 0.07, "color": "#D8B77A", "rough": 0.9, "windows": {"to": 0.7, "from": 0.3, "glow": 0, "color": "#2B2723"}}, {"d": 0.42, "h": 0.44, "k": "box", "w": 0.52, "y": 0.6300000000000001, "color": "#B8894A", "rough": 0.9, "windows": {"to": 0.8, "from": 0.2, "glow": 0, "color": "#2B2723"}}, {"d": 0.42, "k": "parapet", "w": 0.52, "y": 1.07, "color": "#B8895A"}, {"d": 0.24, "h": 0.4, "k": "box", "w": 0.24, "y": 1.07, "color": "#D8B77A", "rough": 0.9}, {"d": 0.14, "h": 0.06, "k": "box", "w": 0.28, "y": 1.47, "z": 0.02, "color": "#9B4B2E"}, {"d": 0.24, "h": 0.4, "k": "columns", "w": 0.24, "y": 1.07, "color": "#D9B23A", "count": 3}, {"h": 0.06, "k": "panel", "w": 0.5, "pos": [0, 0.51, 0.258], "glow": 0.12, "color": "#1F4E8C"}, {"h": 0.24, "k": "panel", "w": 0.12, "pos": [0, 0.21000000000000002, 0.256], "color": "#2B2723"}]	\N	229	2026-08-03 01:12:42.340499	2026-08-03 01:12:42.340499
231	egypt_scribe_school	서기관 학교	EGYPT	NORMAL	300	f	0.638	0.710	1.260	[{"d": 0.46, "k": "plinth", "w": 0.56, "color": "#C79A5B"}, {"d": 0.46, "h": 0.6, "k": "box", "w": 0.56, "y": 0.07, "color": "#B8894A", "rough": 0.9, "windows": {"to": 0.72, "from": 0.35, "glow": 0, "color": "#2B2723"}}, {"d": 0.46, "h": 0.5, "k": "columns", "w": 0.56, "y": 0.07, "color": "#D8B77A", "count": 5}, {"d": 0.5, "h": 0.08, "k": "box", "w": 0.6, "y": 0.6699999999999999, "color": "#C79A5B"}, {"d": 0.4, "h": 0.44, "k": "box", "w": 0.48, "y": 0.75, "color": "#D8B77A", "rough": 0.9, "windows": {"to": 0.8, "from": 0.2, "glow": 0, "color": "#2B2723"}}, {"d": 0.4, "k": "parapet", "w": 0.48, "y": 1.1900000000000002, "color": "#C79A5B"}, {"h": 0.07, "k": "panel", "w": 0.4, "pos": [0, 0.53, 0.248], "glow": 0.12, "color": "#1F4E8C"}, {"d": 0.06, "h": 0.06, "k": "box", "w": 0.5, "y": 1.1300000000000001, "z": 0.2, "color": "#9B4B2E", "detail": true}]	\N	230	2026-08-03 01:12:42.341431	2026-08-03 01:12:42.341431
232	egypt_priest_house	사제관	EGYPT	NORMAL	300	f	0.570	0.669	1.240	[{"d": 0.44, "k": "plinth", "w": 0.5, "color": "#C79A5B"}, {"d": 0.44, "h": 0.6, "k": "box", "w": 0.5, "y": 0.07, "color": "#D8B77A", "rough": 0.9, "windows": {"to": 0.72, "from": 0.3, "glow": 0, "color": "#2B2723"}}, {"d": 0.4, "h": 0.5, "k": "box", "w": 0.44, "y": 0.6699999999999999, "color": "#B8894A", "rough": 0.9, "windows": {"to": 0.8, "from": 0.2, "glow": 0, "color": "#2B2723"}}, {"d": 0.4, "k": "parapet", "w": 0.44, "y": 1.1700000000000002, "color": "#C79A5B"}, {"d": 0.06, "h": 0.06, "k": "box", "w": 0.44, "y": 0.5700000000000001, "z": 0.22, "color": "#9B4B2E", "detail": true}, {"d": 0.06, "h": 0.06, "k": "box", "w": 0.44, "y": 1.07, "z": 0.2, "color": "#9B4B2E", "detail": true}, {"h": 0.26, "k": "panel", "w": 0.14, "pos": [0, 0.22, 0.23600000000000002], "color": "#2B2723"}, {"h": 0.06, "k": "panel", "w": 0.4, "pos": [0, 1.01, 0.218], "glow": 0.12, "color": "#1F4E8C"}]	\N	231	2026-08-03 01:12:42.342356	2026-08-03 01:12:42.342356
233	egypt_market	시장	EGYPT	NORMAL	300	f	0.760	0.651	1.030	[{"d": 0.46, "k": "plinth", "w": 0.66, "color": "#C79A5B"}, {"d": 0.46, "h": 0.4, "k": "box", "w": 0.66, "y": 0.07, "color": "#D8B77A", "rough": 0.9}, {"d": 0.46, "h": 0.34, "k": "columns", "w": 0.66, "y": 0.07, "color": "#B8894A", "count": 7}, {"d": 0.5, "h": 0.06, "k": "box", "w": 0.72, "y": 0.47000000000000003, "color": "#C79A5B"}, {"d": 0.4, "h": 0.44, "k": "box", "w": 0.56, "y": 0.53, "color": "#B8894A", "rough": 0.9, "windows": {"to": 0.8, "from": 0.2, "glow": 0, "color": "#2B2723"}}, {"d": 0.44, "h": 0.06, "k": "box", "w": 0.6, "y": 0.97, "color": "#9B4B2E"}, {"d": 0.46, "k": "storefront", "w": 0.66, "sign": "#1F4E8C", "faceH": 0.26, "awning": "#9B4B2E"}, {"k": "parasol", "pos": [-0.24, 0.47000000000000003, 0.14], "color": "#1F4E8C"}, {"k": "parasol", "pos": [0.24, 0.47000000000000003, -0.12], "color": "#9B4B2E"}]	\N	232	2026-08-03 01:12:42.34329	2026-08-03 01:12:42.34329
234	egypt_bakery	제빵소	EGYPT	NORMAL	300	f	0.524	0.581	1.336	[{"d": 0.44, "k": "plinth", "w": 0.46, "color": "#C79A5B"}, {"d": 0.44, "h": 0.56, "k": "box", "w": 0.46, "y": 0.07, "color": "#B8894A", "rough": 0.9, "windows": {"to": 0.78, "from": 0.4, "glow": 0.4, "color": "#E07A30"}}, {"d": 0.4, "h": 0.42, "k": "box", "w": 0.4, "y": 0.6300000000000001, "color": "#D8B77A", "rough": 0.9, "windows": {"to": 0.8, "from": 0.2, "glow": 0, "color": "#2B2723"}}, {"d": 0.4, "k": "parapet", "w": 0.4, "y": 1.05, "color": "#C79A5B"}, {"h": 0.2, "k": "cyl", "y": 1.05, "rb": 0.13, "rt": 0.1, "seg": 12, "color": "#9B4B2E"}, {"k": "roof", "w": 0.24, "y": 1.25, "type": "dome", "color": "#9B4B2E"}, {"d": 0.44, "k": "storefront", "w": 0.46, "sign": "#D8B77A", "faceH": 0.28, "awning": "#9B4B2E"}, {"h": 0.1, "k": "panel", "w": 0.12, "pos": [0.14, 0.51, 0.23800000000000002], "glow": 0.4, "color": "#E07A30"}]	\N	233	2026-08-03 01:12:42.344179	2026-08-03 01:12:42.344179
236	egypt_shrine	소신당	EGYPT	NORMAL	300	f	0.560	0.549	1.480	[{"d": 0.44, "k": "plinth", "w": 0.46, "color": "#C79A5B"}, {"d": 0.34, "h": 0.2, "k": "box", "w": 0.24, "x": -0.16, "y": 0.07, "color": "#D8B77A", "rough": 0.9}, {"d": 0.34, "h": 0.2, "k": "box", "w": 0.24, "x": 0.16, "y": 0.07, "color": "#D8B77A", "rough": 0.9}, {"d": 0.3, "h": 0.9, "k": "box", "w": 0.26, "y": 0.07, "color": "#C79A5B", "rough": 0.9, "windows": {"to": 0.7, "from": 0.3, "glow": 0, "color": "#2B2723"}}, {"d": 0.38, "h": 0.12, "k": "box", "w": 0.34, "y": 0.97, "color": "#D8B77A", "rough": 0.9}, {"d": 0.16, "h": 0.24, "k": "box", "w": 0.16, "y": 1.09, "color": "#D9B23A", "detail": true, "emissive": true}, {"k": "roof", "w": 0.2, "y": 1.33, "type": "pyramid", "color": "#C79A5B", "height": 0.12}, {"h": 0.4, "k": "panel", "w": 0.14, "pos": [0, 0.47000000000000003, 0.166], "color": "#2B2723"}, {"h": 0.06, "k": "panel", "w": 0.26, "pos": [0, 0.8899999999999999, 0.168], "glow": 0.15, "color": "#1F4E8C"}]	\N	235	2026-08-03 01:12:42.34601	2026-08-03 01:12:42.34601
237	artdeco_empire_tower	엠파이어 타워	ARTDECO	NORMAL	300	f	0.752	0.707	3.465	[{"d": 0.62, "k": "plinth", "w": 0.66, "color": "#7A5A2E"}, {"d": 0.62, "h": 0.9, "k": "box", "w": 0.66, "y": 0.07, "color": "#EDE3CC", "rough": 0.6, "windows": {"to": 0.95, "from": 0.1, "glow": 0.35, "color": "#7FA8C9"}}, {"d": 0.67, "h": 0.05, "k": "box", "w": 0.7100000000000001, "y": 0.97, "color": "#C9A24B"}, {"d": 0.48, "h": 0.8, "k": "box", "w": 0.5, "y": 1.02, "color": "#EDE3CC", "rough": 0.6, "windows": {"to": 0.95, "from": 0.1, "glow": 0.35, "color": "#7FA8C9"}}, {"d": 0.53, "h": 0.05, "k": "box", "w": 0.55, "y": 1.82, "color": "#C9A24B"}, {"d": 0.34, "h": 0.75, "k": "box", "w": 0.34, "y": 1.87, "color": "#DDD0B4", "rough": 0.6, "windows": {"to": 0.95, "from": 0.1, "glow": 0.35, "color": "#7FA8C9"}}, {"d": 0.2, "h": 0.3, "k": "box", "w": 0.2, "y": 2.6199999999999997, "color": "#DDD0B4", "rough": 0.6}, {"k": "roof", "w": 0.24, "y": 2.92, "type": "pyramid", "color": "#C9A24B", "height": 0.12}, {"h": 0.4, "k": "antenna", "y": 3.04}, {"d": 0.03, "h": 0.9, "k": "box", "w": 0.03, "x": -0.2, "y": 0.07, "z": 0.31, "color": "#C9A24B"}, {"d": 0.03, "h": 0.9, "k": "box", "w": 0.03, "x": 0.2, "y": 0.07, "z": 0.31, "color": "#C9A24B"}, {"d": 0.016, "h": 0.75, "k": "box", "w": 0.016, "x": -0.1462, "y": 1.87, "z": 0.17400000000000002, "color": "#C9A24B"}, {"d": 0.016, "h": 0.75, "k": "box", "w": 0.016, "x": -0.04873333333333334, "y": 1.87, "z": 0.17400000000000002, "color": "#C9A24B"}, {"d": 0.016, "h": 0.75, "k": "box", "w": 0.016, "x": 0.04873333333333332, "y": 1.87, "z": 0.17400000000000002, "color": "#C9A24B"}, {"d": 0.016, "h": 0.75, "k": "box", "w": 0.016, "x": 0.1462, "y": 1.87, "z": 0.17400000000000002, "color": "#C9A24B"}]	\N	236	2026-08-03 01:12:42.346996	2026-08-03 01:12:42.346996
238	artdeco_chrysler_tower	크라이슬러 타워	ARTDECO	NORMAL	300	f	0.661	0.661	3.195	[{"d": 0.58, "k": "plinth", "w": 0.58, "color": "#7A5A2E"}, {"d": 0.54, "h": 1.6, "k": "box", "w": 0.54, "y": 0.07, "color": "#EDE3CC", "rough": 0.55, "windows": {"to": 0.95, "from": 0.08, "glow": 0.38, "color": "#7FA8C9"}}, {"d": 0.016, "h": 1.6, "k": "box", "w": 0.016, "x": -0.23220000000000002, "y": 0.07, "z": 0.274, "color": "#C9A24B"}, {"d": 0.016, "h": 1.6, "k": "box", "w": 0.016, "x": -0.13932, "y": 0.07, "z": 0.274, "color": "#C9A24B"}, {"d": 0.016, "h": 1.6, "k": "box", "w": 0.016, "x": -0.046439999999999995, "y": 0.07, "z": 0.274, "color": "#C9A24B"}, {"d": 0.016, "h": 1.6, "k": "box", "w": 0.016, "x": 0.046439999999999995, "y": 0.07, "z": 0.274, "color": "#C9A24B"}, {"d": 0.016, "h": 1.6, "k": "box", "w": 0.016, "x": 0.13932000000000003, "y": 0.07, "z": 0.274, "color": "#C9A24B"}, {"d": 0.016, "h": 1.6, "k": "box", "w": 0.016, "x": 0.23220000000000002, "y": 0.07, "z": 0.274, "color": "#C9A24B"}, {"d": 0.46, "h": 0.2, "k": "box", "w": 0.46, "y": 1.6700000000000002, "color": "#C9A24B", "metal": 0.5, "rough": 0.4}, {"d": 0.36, "h": 0.2, "k": "box", "w": 0.36, "y": 1.87, "color": "#C9A24B", "metal": 0.5, "rough": 0.4}, {"d": 0.26, "h": 0.2, "k": "box", "w": 0.26, "y": 2.07, "color": "#C9A24B", "metal": 0.5, "rough": 0.4}, {"d": 0.16, "h": 0.2, "k": "box", "w": 0.16, "y": 2.27, "color": "#C9A24B", "metal": 0.5, "rough": 0.4}, {"k": "roof", "w": 0.16, "y": 2.4699999999999998, "type": "cone", "color": "#C9A24B", "height": 0.3}, {"h": 0.4, "k": "antenna", "y": 2.77}]	\N	237	2026-08-03 01:12:42.348107	2026-08-03 01:12:42.348107
239	artdeco_radio_tower	라디오 타워	ARTDECO	NORMAL	300	f	0.570	0.570	3.345	[{"d": 0.5, "k": "plinth", "w": 0.5, "color": "#7A5A2E"}, {"d": 0.46, "h": 0.9, "k": "box", "w": 0.46, "y": 0.07, "color": "#EDE3CC", "rough": 0.6, "windows": {"to": 0.85, "from": 0.15, "glow": 0.34, "color": "#7FA8C9"}}, {"d": 0.51, "h": 0.05, "k": "box", "w": 0.51, "y": 0.97, "color": "#C9A24B"}, {"d": 0.32, "h": 0.5, "k": "box", "w": 0.32, "y": 1.02, "color": "#DDD0B4", "rough": 0.6, "windows": {"to": 0.85, "from": 0.15, "glow": 0.34, "color": "#7FA8C9"}}, {"h": 1.4, "k": "cyl", "y": 1.52, "rb": 0.16, "rt": 0.06, "seg": 8, "color": "#DDD0B4"}, {"h": 0.04, "k": "cyl", "y": 1.97, "rb": 0.14, "rt": 0.14, "seg": 12, "color": "#C9A24B", "detail": true}, {"h": 0.04, "k": "cyl", "y": 2.4699999999999998, "rb": 0.1, "rt": 0.1, "seg": 12, "color": "#C9A24B", "detail": true}, {"h": 0.4, "k": "antenna", "y": 2.92}, {"d": 0.02, "h": 0.02, "k": "box", "w": 0.02, "y": 2.92, "color": "#FF4A4A", "detail": true, "emissive": true}, {"d": 0.016, "h": 0.9, "k": "box", "w": 0.016, "x": -0.1978, "y": 0.07, "z": 0.234, "color": "#C9A24B"}, {"d": 0.016, "h": 0.9, "k": "box", "w": 0.016, "x": -0.06593333333333334, "y": 0.07, "z": 0.234, "color": "#C9A24B"}, {"d": 0.016, "h": 0.9, "k": "box", "w": 0.016, "x": 0.06593333333333332, "y": 0.07, "z": 0.234, "color": "#C9A24B"}, {"d": 0.016, "h": 0.9, "k": "box", "w": 0.016, "x": 0.1978, "y": 0.07, "z": 0.234, "color": "#C9A24B"}]	\N	238	2026-08-03 01:12:42.3492	2026-08-03 01:12:42.3492
240	artdeco_fountain_tower	분수 기념탑	ARTDECO	NORMAL	300	f	0.661	0.661	2.130	[{"d": 0.58, "k": "plinth", "w": 0.58, "color": "#7A5A2E"}, {"h": 0.16, "k": "cyl", "y": 0.07, "rb": 0.28, "rt": 0.26, "seg": 16, "color": "#DDD0B4"}, {"h": 0.03, "k": "cyl", "y": 0.23, "rb": 0.24, "rt": 0.24, "seg": 16, "color": "#7FA8C9", "detail": true}, {"d": 0.24, "h": 0.4, "k": "box", "w": 0.24, "y": 0.23, "color": "#EDE3CC", "rough": 0.6}, {"d": 0.16, "h": 1, "k": "box", "w": 0.16, "y": 0.6300000000000001, "color": "#EDE3CC", "rough": 0.6}, {"d": 0.014, "h": 1, "k": "box", "w": 0.014, "x": -0.0688, "y": 0.6300000000000001, "z": 0.084, "color": "#C9A24B"}, {"d": 0.014, "h": 1, "k": "box", "w": 0.014, "x": 0, "y": 0.6300000000000001, "z": 0.084, "color": "#C9A24B"}, {"d": 0.014, "h": 1, "k": "box", "w": 0.014, "x": 0.0688, "y": 0.6300000000000001, "z": 0.084, "color": "#C9A24B"}, {"d": 0.22, "h": 0.14, "k": "box", "w": 0.22, "y": 1.6300000000000001, "color": "#C9A24B"}, {"d": 0.14, "h": 0.12, "k": "box", "w": 0.14, "y": 1.77, "color": "#DDD0B4"}, {"k": "roof", "w": 0.14, "y": 1.8900000000000001, "type": "cone", "color": "#C9A24B", "height": 0.24}, {"d": 0.06, "h": 0.16, "k": "box", "w": 0.06, "y": 1.49, "color": "#7A5A2E", "detail": true}, {"h": 0.3, "k": "panel", "w": 0.02, "pos": [-0.16, 0.43, 0.06], "glow": 0.3, "color": "#7FA8C9"}, {"h": 0.3, "k": "panel", "w": 0.02, "pos": [0.16, 0.43, 0.06], "glow": 0.3, "color": "#7FA8C9"}]	\N	239	2026-08-03 01:12:42.350335	2026-08-03 01:12:42.350335
241	artdeco_clock_pylon	시계 파일런	ARTDECO	NORMAL	300	f	0.479	0.479	2.335	[{"d": 0.42, "k": "plinth", "w": 0.42, "color": "#7A5A2E"}, {"d": 0.34, "h": 0.3, "k": "box", "w": 0.34, "y": 0.07, "color": "#DDD0B4", "rough": 0.6}, {"d": 0.28, "h": 1.3, "k": "box", "w": 0.28, "y": 0.37, "color": "#EDE3CC", "rough": 0.6, "windows": {"to": 0.7, "from": 0.1, "glow": 0.3, "color": "#7FA8C9"}}, {"d": 0.016, "h": 1.3, "k": "box", "w": 0.016, "x": -0.12040000000000001, "y": 0.37, "z": 0.14400000000000002, "color": "#C9A24B"}, {"d": 0.016, "h": 1.3, "k": "box", "w": 0.016, "x": 0, "y": 0.37, "z": 0.14400000000000002, "color": "#C9A24B"}, {"d": 0.016, "h": 1.3, "k": "box", "w": 0.016, "x": 0.12040000000000001, "y": 0.37, "z": 0.14400000000000002, "color": "#C9A24B"}, {"k": "clock", "w": 0.28, "y": 1.37, "color": "#C9A24B"}, {"d": 0.32, "h": 0.12, "k": "box", "w": 0.32, "y": 1.6700000000000002, "color": "#DDD0B4"}, {"d": 0.22, "h": 0.12, "k": "box", "w": 0.22, "y": 1.79, "color": "#C9A24B"}, {"k": "roof", "w": 0.2, "y": 1.9100000000000001, "type": "pyramid", "color": "#1F4A3A", "height": 0.16}, {"h": 0.24, "k": "antenna", "y": 2.07}]	\N	240	2026-08-03 01:12:42.351345	2026-08-03 01:12:42.351345
242	artdeco_hotel	그랜드 호텔	ARTDECO	NORMAL	300	f	0.638	0.669	2.100	[{"d": 0.5, "k": "plinth", "w": 0.56, "color": "#7A5A2E"}, {"d": 0.5, "h": 1.3, "k": "box", "w": 0.56, "y": 0.07, "color": "#EDE3CC", "rough": 0.6, "windows": {"to": 0.9, "from": 0.1, "glow": 0.34, "color": "#7FA8C9"}}, {"d": 0.55, "h": 0.05, "k": "box", "w": 0.6100000000000001, "y": 1.37, "color": "#C9A24B"}, {"d": 0.36, "h": 0.34, "k": "box", "w": 0.4, "y": 1.4200000000000002, "color": "#DDD0B4", "rough": 0.6, "windows": {"to": 0.9, "from": 0.1, "glow": 0.34, "color": "#7FA8C9"}}, {"k": "roof", "w": 0.44, "y": 1.76, "type": "pyramid", "color": "#1F4A3A", "height": 0.18}, {"d": 0.02, "h": 0.16, "k": "box", "w": 0.02, "y": 1.9400000000000002, "color": "#C9A24B", "detail": true, "emissive": true}, {"d": 0.03, "h": 1.3, "k": "box", "w": 0.03, "x": -0.24, "y": 0.07, "z": 0.25, "color": "#C9A24B"}, {"d": 0.03, "h": 1.3, "k": "box", "w": 0.03, "x": 0.24, "y": 0.07, "z": 0.25, "color": "#C9A24B"}, {"d": 0.514, "h": 0.028, "k": "box", "w": 0.5740000000000001, "y": 0.5700000000000001, "color": "#C9A24B"}, {"d": 0.514, "h": 0.028, "k": "box", "w": 0.5740000000000001, "y": 0.97, "color": "#C9A24B"}, {"d": 0.5, "k": "storefront", "w": 0.56, "sign": "#C9A24B", "faceH": 0.3, "awning": "#1F4A3A"}]	\N	241	2026-08-03 01:12:42.352327	2026-08-03 01:12:42.352327
243	artdeco_luxury_apartment	고급 아파트	ARTDECO	NORMAL	300	f	0.684	0.552	2.110	[{"d": 0.46, "k": "plinth", "w": 0.6, "color": "#7A5A2E"}, {"d": 0.46, "h": 1, "k": "box", "w": 0.6, "y": 0.07, "color": "#DDD0B4", "rough": 0.6, "windows": {"to": 0.9, "from": 0.1, "glow": 0.34, "color": "#7FA8C9"}}, {"d": 0.51, "h": 0.05, "k": "box", "w": 0.65, "y": 1.07, "color": "#C9A24B"}, {"d": 0.38, "h": 0.5, "k": "box", "w": 0.46, "y": 1.12, "color": "#EDE3CC", "rough": 0.6, "windows": {"to": 0.9, "from": 0.1, "glow": 0.34, "color": "#7FA8C9"}}, {"d": 0.26, "h": 0.3, "k": "box", "w": 0.3, "y": 1.62, "color": "#DDD0B4", "rough": 0.6}, {"k": "roof", "w": 0.34, "y": 1.9200000000000002, "type": "pyramid", "color": "#1F4A3A", "height": 0.16}, {"d": 0.46, "k": "balconies", "w": 0.6, "y0": 0.37, "y1": 0.8700000000000001, "color": "#C9A24B", "floors": 3}, {"d": 0.03, "h": 1, "k": "box", "w": 0.03, "x": 0, "y": 0.07, "z": 0.24, "color": "#C9A24B"}, {"d": 0.016, "h": 0.5, "k": "box", "w": 0.016, "x": -0.1978, "y": 1.12, "z": 0.194, "color": "#C9A24B"}, {"d": 0.016, "h": 0.5, "k": "box", "w": 0.016, "x": 0, "y": 1.12, "z": 0.194, "color": "#C9A24B"}, {"d": 0.016, "h": 0.5, "k": "box", "w": 0.016, "x": 0.1978, "y": 1.12, "z": 0.194, "color": "#C9A24B"}]	\N	242	2026-08-03 01:12:42.353295	2026-08-03 01:12:42.353295
244	artdeco_cityhall	시청	ARTDECO	NORMAL	300	f	0.752	0.774	2.050	[{"d": 0.52, "k": "plinth", "w": 0.66, "color": "#7A5A2E"}, {"d": 0.52, "h": 0.8, "k": "box", "w": 0.66, "y": 0.07, "color": "#DDD0B4", "rough": 0.6, "windows": {"to": 0.85, "from": 0.2, "glow": 0.3, "color": "#7FA8C9"}}, {"d": 0.52, "h": 0.6, "k": "columns", "w": 0.66, "y": 0.07, "color": "#EDE3CC", "count": 6}, {"d": 0.07, "h": 0.05, "k": "box", "w": 0.6204, "y": 0.7, "z": 0.29000000000000004, "color": "#C9A24B"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.44, "y": 0.07, "z": 0.39, "color": "#DDD0B4"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.4, "y": 0.098, "z": 0.35000000000000003, "color": "#DDD0B4"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.36, "y": 0.126, "z": 0.31, "color": "#DDD0B4"}, {"d": 0.34, "h": 0.5, "k": "box", "w": 0.34, "y": 0.8700000000000001, "color": "#EDE3CC", "rough": 0.6, "windows": {"to": 0.8, "from": 0.2, "glow": 0.32, "color": "#7FA8C9"}}, {"d": 0.24, "h": 0.3, "k": "box", "w": 0.24, "y": 1.37, "color": "#DDD0B4", "rough": 0.6}, {"k": "roof", "w": 0.28, "y": 1.6700000000000002, "type": "pyramid", "color": "#1F4A3A", "height": 0.2}, {"d": 0.02, "h": 0.18, "k": "box", "w": 0.02, "y": 1.87, "color": "#C9A24B", "detail": true, "emissive": true}, {"h": 0.08, "k": "panel", "w": 0.4, "pos": [0, 0.75, 0.278], "glow": 0.3, "color": "#C9A24B"}]	\N	243	2026-08-03 01:12:42.354334	2026-08-03 01:12:42.354334
245	artdeco_penthouse	펜트하우스	ARTDECO	NORMAL	300	f	0.570	0.524	2.295	[{"d": 0.46, "k": "plinth", "w": 0.5, "color": "#7A5A2E"}, {"d": 0.46, "h": 1.5, "k": "box", "w": 0.5, "y": 0.07, "color": "#EDE3CC", "rough": 0.6, "windows": {"to": 0.92, "from": 0.1, "glow": 0.34, "color": "#7FA8C9"}}, {"d": 0.016, "h": 1.5, "k": "box", "w": 0.016, "x": -0.215, "y": 0.07, "z": 0.234, "color": "#C9A24B"}, {"d": 0.016, "h": 1.5, "k": "box", "w": 0.016, "x": -0.1075, "y": 0.07, "z": 0.234, "color": "#C9A24B"}, {"d": 0.016, "h": 1.5, "k": "box", "w": 0.016, "x": 0, "y": 0.07, "z": 0.234, "color": "#C9A24B"}, {"d": 0.016, "h": 1.5, "k": "box", "w": 0.016, "x": 0.1075, "y": 0.07, "z": 0.234, "color": "#C9A24B"}, {"d": 0.016, "h": 1.5, "k": "box", "w": 0.016, "x": 0.215, "y": 0.07, "z": 0.234, "color": "#C9A24B"}, {"d": 0.51, "h": 0.05, "k": "box", "w": 0.55, "y": 1.57, "color": "#C9A24B"}, {"d": 0.4, "h": 0.34, "k": "box", "w": 0.44, "y": 1.6300000000000001, "color": "#7FA8C9", "metal": 0.4, "rough": 0.3, "windows": {"to": 0.85, "from": 0.15, "glow": 0.4, "color": "#7FA8C9"}}, {"d": 0.46, "k": "parapet", "w": 0.5, "y": 1.57, "color": "#C9A24B"}, {"d": 0.03, "h": 1.5, "k": "box", "w": 0.03, "x": -0.2, "y": 0.07, "z": 0.24, "color": "#C9A24B"}, {"d": 0.03, "h": 1.5, "k": "box", "w": 0.03, "x": 0.2, "y": 0.07, "z": 0.24, "color": "#C9A24B"}, {"h": 0.3, "k": "antenna", "y": 1.97}]	\N	244	2026-08-03 01:12:42.355247	2026-08-03 01:12:42.355247
246	artdeco_apartment	아파트	ARTDECO	NORMAL	300	f	0.616	0.502	1.940	[{"d": 0.44, "k": "plinth", "w": 0.54, "color": "#7A5A2E"}, {"d": 0.44, "h": 1.4, "k": "box", "w": 0.54, "y": 0.07, "color": "#EDE3CC", "rough": 0.65, "windows": {"to": 0.92, "from": 0.1, "glow": 0.32, "color": "#7FA8C9"}}, {"d": 0.49, "h": 0.05, "k": "box", "w": 0.5900000000000001, "y": 1.47, "color": "#C9A24B"}, {"d": 0.32, "h": 0.3, "k": "box", "w": 0.4, "y": 1.52, "color": "#DDD0B4", "rough": 0.65, "windows": {"to": 0.9, "from": 0.1, "glow": 0.32, "color": "#7FA8C9"}}, {"d": 0.37, "h": 0.05, "k": "box", "w": 0.45, "y": 1.82, "color": "#C9A24B"}, {"d": 0.32, "k": "parapet", "w": 0.4, "y": 1.87, "color": "#DDD0B4"}, {"d": 0.03, "h": 1.4, "k": "box", "w": 0.03, "x": -0.18, "y": 0.07, "z": 0.22, "color": "#C9A24B"}, {"d": 0.03, "h": 1.4, "k": "box", "w": 0.03, "x": 0, "y": 0.07, "z": 0.22, "color": "#C9A24B"}, {"d": 0.03, "h": 1.4, "k": "box", "w": 0.03, "x": 0.18, "y": 0.07, "z": 0.22, "color": "#C9A24B"}]	\N	245	2026-08-03 01:12:42.356257	2026-08-03 01:12:42.356257
247	artdeco_bank	은행 본점	ARTDECO	NORMAL	300	f	0.730	0.794	1.510	[{"d": 0.52, "k": "plinth", "w": 0.64, "color": "#7A5A2E"}, {"d": 0.52, "h": 1, "k": "box", "w": 0.64, "y": 0.07, "color": "#DDD0B4", "rough": 0.6, "windows": {"to": 0.85, "from": 0.3, "glow": 0.3, "color": "#7FA8C9"}}, {"d": 0.52, "h": 0.8, "k": "columns", "w": 0.64, "y": 0.07, "color": "#EDE3CC", "count": 6}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.44, "y": 0.07, "z": 0.39, "color": "#DDD0B4"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.4, "y": 0.098, "z": 0.35000000000000003, "color": "#DDD0B4"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.36, "y": 0.126, "z": 0.31, "color": "#DDD0B4"}, {"d": 0.5700000000000001, "h": 0.05, "k": "box", "w": 0.6900000000000001, "y": 1.07, "color": "#C9A24B"}, {"d": 0.3, "h": 0.2, "k": "box", "w": 0.4, "y": 1.12, "color": "#EDE3CC", "rough": 0.6}, {"k": "roof", "w": 0.44, "y": 1.32, "type": "pyramid", "color": "#1F4A3A", "height": 0.16}, {"h": 0.1, "k": "panel", "w": 0.44, "pos": [0, 0.97, 0.278], "glow": 0.3, "color": "#C9A24B"}]	\N	246	2026-08-03 01:12:42.35713	2026-08-03 01:12:42.35713
248	artdeco_department	백화점	ARTDECO	NORMAL	300	f	0.775	0.741	1.320	[{"d": 0.54, "k": "plinth", "w": 0.68, "color": "#7A5A2E"}, {"d": 0.54, "h": 1.1, "k": "box", "w": 0.68, "y": 0.07, "color": "#EDE3CC", "rough": 0.6, "windows": {"to": 0.9, "from": 0.2, "glow": 0.32, "color": "#7FA8C9"}}, {"d": 0.5900000000000001, "h": 0.05, "k": "box", "w": 0.7300000000000001, "y": 1.1700000000000002, "color": "#C9A24B"}, {"d": 0.54, "k": "parapet", "w": 0.68, "y": 1.25, "color": "#DDD0B4"}, {"d": 0.03, "h": 0.9, "k": "box", "w": 0.03, "x": -0.28, "y": 0.17, "z": 0.27, "color": "#C9A24B"}, {"d": 0.03, "h": 0.9, "k": "box", "w": 0.03, "x": 0, "y": 0.17, "z": 0.27, "color": "#C9A24B"}, {"d": 0.03, "h": 0.9, "k": "box", "w": 0.03, "x": 0.28, "y": 0.17, "z": 0.27, "color": "#C9A24B"}, {"d": 0.03, "h": 0.9, "k": "box", "w": 0.03, "x": -0.14, "y": 0.17, "z": 0.27, "color": "#C9A24B"}, {"d": 0.03, "h": 0.9, "k": "box", "w": 0.03, "x": 0.14, "y": 0.17, "z": 0.27, "color": "#C9A24B"}, {"d": 0.54, "k": "storefront", "w": 0.68, "sign": "#C9A24B", "faceH": 0.4, "awning": "#1F4A3A"}]	\N	247	2026-08-03 01:12:42.35805	2026-08-03 01:12:42.35805
249	artdeco_theater	라디오시티 극장	ARTDECO	NORMAL	300	f	0.775	0.824	1.320	[{"d": 0.52, "k": "plinth", "w": 0.68, "color": "#7A5A2E"}, {"d": 0.52, "h": 1, "k": "box", "w": 0.68, "y": 0.07, "color": "#EDE3CC", "rough": 0.6, "windows": {"to": 0.85, "from": 0.55, "glow": 0.32, "color": "#7FA8C9"}}, {"d": 0.03, "h": 0.7, "k": "box", "w": 0.03, "x": -0.24, "y": 0.17, "z": 0.26, "color": "#C9A24B"}, {"d": 0.03, "h": 0.7, "k": "box", "w": 0.03, "x": -0.08, "y": 0.17, "z": 0.26, "color": "#C9A24B"}, {"d": 0.03, "h": 0.7, "k": "box", "w": 0.03, "x": 0.08, "y": 0.17, "z": 0.26, "color": "#C9A24B"}, {"d": 0.03, "h": 0.7, "k": "box", "w": 0.03, "x": 0.24, "y": 0.17, "z": 0.26, "color": "#C9A24B"}, {"d": 0.5700000000000001, "h": 0.05, "k": "box", "w": 0.7300000000000001, "y": 1.07, "color": "#C9A24B"}, {"d": 0.3, "h": 0.2, "k": "box", "w": 0.4, "y": 1.12, "color": "#DDD0B4", "rough": 0.6}, {"d": 0.52, "k": "storefront", "w": 0.68, "sign": "#C9A24B", "faceH": 0.36, "awning": "#1F4A3A"}, {"h": 0.6, "k": "panel", "w": 0.14, "pos": [0.3, 0.5700000000000001, 0.266], "glow": 0.5, "color": "#B03A48"}, {"h": 0.12, "k": "panel", "w": 0.5, "pos": [0, 0.8700000000000001, 0.278], "glow": 0.35, "color": "#C9A24B"}]	\N	248	2026-08-03 01:12:42.359053	2026-08-03 01:12:42.359053
250	artdeco_cinema	시네마	ARTDECO	NORMAL	300	f	0.593	0.709	1.570	[{"d": 0.44, "k": "plinth", "w": 0.52, "color": "#7A5A2E"}, {"d": 0.44, "h": 0.9, "k": "box", "w": 0.52, "y": 0.07, "color": "#EDE3CC", "rough": 0.6, "windows": {"to": 0.85, "from": 0.55, "glow": 0.3, "color": "#7FA8C9"}}, {"d": 0.016, "h": 0.9, "k": "box", "w": 0.016, "x": -0.2236, "y": 0.07, "z": 0.224, "color": "#C9A24B"}, {"d": 0.016, "h": 0.9, "k": "box", "w": 0.016, "x": -0.07453333333333334, "y": 0.07, "z": 0.224, "color": "#C9A24B"}, {"d": 0.016, "h": 0.9, "k": "box", "w": 0.016, "x": 0.07453333333333331, "y": 0.07, "z": 0.224, "color": "#C9A24B"}, {"d": 0.016, "h": 0.9, "k": "box", "w": 0.016, "x": 0.2236, "y": 0.07, "z": 0.224, "color": "#C9A24B"}, {"d": 0.44, "h": 0.16, "k": "box", "w": 0.4, "y": 0.97, "color": "#DDD0B4"}, {"d": 0.4, "h": 0.14, "k": "box", "w": 0.28, "y": 1.1300000000000001, "color": "#C9A24B"}, {"d": 0.36, "h": 0.12, "k": "box", "w": 0.18, "y": 1.27, "color": "#DDD0B4"}, {"d": 0.44, "k": "storefront", "w": 0.52, "sign": "#C9A24B", "faceH": 0.34, "awning": "#7A1F3A"}, {"h": 0.14, "k": "panel", "w": 0.44, "pos": [0, 0.6300000000000001, 0.23800000000000002], "glow": 0.4, "color": "#C9A24B"}, {"h": 0.8, "k": "panel", "w": 0.12, "pos": [0, 1.1700000000000002, 0.246], "glow": 0.5, "color": "#B03A48"}]	\N	249	2026-08-03 01:12:42.360094	2026-08-03 01:12:42.360094
251	artdeco_museum	미술관	ARTDECO	NORMAL	300	f	0.775	0.774	1.720	[{"d": 0.52, "k": "plinth", "w": 0.68, "color": "#7A5A2E"}, {"d": 0.52, "h": 0.8, "k": "box", "w": 0.68, "y": 0.07, "color": "#DDD0B4", "rough": 0.6, "windows": {"to": 0.78, "from": 0.3, "glow": 0.28, "color": "#7FA8C9"}}, {"d": 0.52, "h": 0.64, "k": "columns", "w": 0.68, "y": 0.07, "color": "#EDE3CC", "count": 7}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.46, "y": 0.07, "z": 0.4, "color": "#DDD0B4"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.42000000000000004, "y": 0.098, "z": 0.36000000000000004, "color": "#DDD0B4"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.38, "y": 0.126, "z": 0.32, "color": "#DDD0B4"}, {"d": 0.5700000000000001, "h": 0.05, "k": "box", "w": 0.7300000000000001, "y": 0.8700000000000001, "color": "#C9A24B"}, {"d": 0.5, "h": 0.4, "k": "box", "w": 0.28, "x": -0.19, "y": 0.9299999999999999, "color": "#EDE3CC", "rough": 0.6}, {"d": 0.5, "h": 0.4, "k": "box", "w": 0.28, "x": 0.19, "y": 0.9299999999999999, "color": "#EDE3CC", "rough": 0.6}, {"d": 0.4, "h": 0.6, "k": "box", "w": 0.18, "y": 0.9299999999999999, "color": "#DDD0B4", "rough": 0.6}, {"k": "roof", "w": 0.22, "y": 1.53, "type": "pyramid", "color": "#1F4A3A", "height": 0.16}, {"h": 0.1, "k": "panel", "w": 0.4, "pos": [0, 0.6699999999999999, 0.278], "glow": 0.3, "color": "#C9A24B"}]	\N	250	2026-08-03 01:12:42.361094	2026-08-03 01:12:42.361094
252	artdeco_library	도서관	ARTDECO	NORMAL	300	f	0.684	0.653	1.280	[{"d": 0.5, "k": "plinth", "w": 0.6, "color": "#7A5A2E"}, {"d": 0.5, "h": 1, "k": "box", "w": 0.6, "y": 0.07, "color": "#EDE3CC", "rough": 0.6, "windows": {"to": 0.85, "from": 0.25, "glow": 0.3, "color": "#7FA8C9"}}, {"d": 0.03, "h": 0.8, "k": "box", "w": 0.03, "x": -0.22, "y": 0.17, "z": 0.26, "color": "#C9A24B"}, {"d": 0.03, "h": 0.8, "k": "box", "w": 0.03, "x": -0.075, "y": 0.17, "z": 0.26, "color": "#C9A24B"}, {"d": 0.03, "h": 0.8, "k": "box", "w": 0.03, "x": 0.075, "y": 0.17, "z": 0.26, "color": "#C9A24B"}, {"d": 0.03, "h": 0.8, "k": "box", "w": 0.03, "x": 0.22, "y": 0.17, "z": 0.26, "color": "#C9A24B"}, {"d": 0.55, "h": 0.05, "k": "box", "w": 0.65, "y": 1.07, "color": "#C9A24B"}, {"d": 0.3, "h": 0.16, "k": "box", "w": 0.4, "y": 1.12, "color": "#DDD0B4", "rough": 0.6}, {"d": 0.5, "k": "parapet", "w": 0.6, "y": 1.1500000000000001, "color": "#DDD0B4"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.4, "y": 0.07, "z": 0.34, "color": "#DDD0B4"}, {"d": 0.055, "h": 0.028, "k": "box", "w": 0.36000000000000004, "y": 0.098, "z": 0.3, "color": "#DDD0B4"}, {"h": 0.3, "k": "panel", "w": 0.16, "pos": [0, 0.25, 0.266], "color": "#7A5A2E"}]	\N	251	2026-08-03 01:12:42.362092	2026-08-03 01:12:42.362092
253	artdeco_subway_station	지하철 역사	ARTDECO	NORMAL	300	f	0.638	0.672	1.810	[{"d": 0.48, "k": "plinth", "w": 0.56, "color": "#7A5A2E"}, {"d": 0.48, "h": 0.5, "k": "box", "w": 0.56, "y": 0.07, "color": "#DDD0B4", "rough": 0.6, "windows": {"to": 0.8, "from": 0.35, "glow": 0.32, "color": "#7FA8C9"}}, {"d": 0.53, "h": 0.05, "k": "box", "w": 0.6100000000000001, "y": 0.5700000000000001, "color": "#C9A24B"}, {"d": 0.38, "h": 0.9, "k": "box", "w": 0.42, "y": 0.6200000000000001, "color": "#EDE3CC", "rough": 0.6, "windows": {"to": 0.9, "from": 0.1, "glow": 0.32, "color": "#7FA8C9"}}, {"d": 0.016, "h": 0.9, "k": "box", "w": 0.016, "x": -0.18059999999999998, "y": 0.6200000000000001, "z": 0.194, "color": "#C9A24B"}, {"d": 0.016, "h": 0.9, "k": "box", "w": 0.016, "x": -0.060200000000000004, "y": 0.6200000000000001, "z": 0.194, "color": "#C9A24B"}, {"d": 0.016, "h": 0.9, "k": "box", "w": 0.016, "x": 0.06019999999999998, "y": 0.6200000000000001, "z": 0.194, "color": "#C9A24B"}, {"d": 0.016, "h": 0.9, "k": "box", "w": 0.016, "x": 0.18059999999999998, "y": 0.6200000000000001, "z": 0.194, "color": "#C9A24B"}, {"d": 0.4, "h": 0.12, "k": "box", "w": 0.44, "y": 1.52, "color": "#C9A24B"}, {"k": "roof", "w": 0.34, "y": 1.6400000000000001, "type": "pyramid", "color": "#1F4A3A", "height": 0.14}, {"h": 0.34, "k": "panel", "w": 0.24, "pos": [0, 0.25, 0.246], "color": "#1E1A16"}, {"d": 0.06, "h": 0.06, "k": "box", "w": 0.3, "y": 0.43, "z": 0.24, "color": "#C9A24B"}, {"h": 0.1, "k": "panel", "w": 0.3, "pos": [0, 0.51, 0.248], "glow": 0.35, "color": "#C9A24B"}]	\N	252	2026-08-03 01:12:42.363037	2026-08-03 01:12:42.363037
254	artdeco_diner	다이너	ARTDECO	NORMAL	300	f	0.575	0.615	1.670	[{"d": 0.42, "k": "plinth", "w": 0.5, "color": "#7A5A2E"}, {"d": 0.42, "h": 0.5, "k": "box", "w": 0.5, "y": 0.07, "color": "#C8CDD2", "metal": 0.4, "rough": 0.4, "windows": {"to": 0.82, "from": 0.35, "glow": 0.36, "color": "#7FA8C9"}}, {"d": 0.44, "h": 0.05, "k": "box", "w": 0.52, "y": 0.31, "color": "#B03A48"}, {"d": 0.38, "h": 0.4, "k": "box", "w": 0.42, "y": 0.5700000000000001, "color": "#D2D7DC", "metal": 0.4, "rough": 0.4, "windows": {"to": 0.8, "from": 0.2, "glow": 0.36, "color": "#7FA8C9"}}, {"d": 0.42, "k": "roof", "w": 0.46, "y": 0.97, "type": "round", "color": "#C8CDD2"}, {"d": 0.39, "h": 0.04, "k": "box", "w": 0.43, "y": 0.81, "color": "#B03A48"}, {"d": 0.42, "k": "storefront", "w": 0.5, "sign": "#C9A24B", "faceH": 0.28, "awning": "#B03A48"}, {"d": 0.08, "h": 0.7, "k": "box", "w": 0.08, "x": 0.24, "y": 0.97, "z": 0.14, "color": "#C8CDD2"}, {"h": 0.6, "k": "panel", "w": 0.1, "pos": [0.24, 1.12, 0.2], "glow": 0.55, "color": "#B03A48"}]	\N	253	2026-08-03 01:12:42.364114	2026-08-03 01:12:42.364114
255	artdeco_boutique	부티크	ARTDECO	NORMAL	300	f	0.502	0.534	1.240	[{"d": 0.4, "k": "plinth", "w": 0.44, "color": "#7A5A2E"}, {"d": 0.4, "h": 0.56, "k": "box", "w": 0.44, "y": 0.07, "color": "#1F4A3A", "rough": 0.55, "windows": {"to": 0.82, "from": 0.45, "glow": 0.34, "color": "#7FA8C9"}}, {"d": 0.45, "h": 0.05, "k": "box", "w": 0.49, "y": 0.6300000000000001, "color": "#C9A24B"}, {"d": 0.36, "h": 0.44, "k": "box", "w": 0.4, "y": 0.6799999999999999, "color": "#2E5A46", "rough": 0.55, "windows": {"to": 0.8, "from": 0.2, "glow": 0.34, "color": "#7FA8C9"}}, {"d": 0.38, "h": 0.12, "k": "box", "w": 0.42, "y": 1.12, "color": "#C9A24B"}, {"d": 0.36, "k": "parapet", "w": 0.4, "y": 1.12, "color": "#2E5A46"}, {"d": 0.4, "k": "storefront", "w": 0.44, "sign": "#EDE3CC", "faceH": 0.32, "awning": "#C9A24B"}, {"d": 0.03, "h": 0.4, "k": "box", "w": 0.03, "x": -0.16, "y": 0.15000000000000002, "z": 0.21, "color": "#C9A24B"}, {"d": 0.03, "h": 0.4, "k": "box", "w": 0.03, "x": 0.16, "y": 0.15000000000000002, "z": 0.21, "color": "#C9A24B"}]	\N	254	2026-08-03 01:12:42.365145	2026-08-03 01:12:42.365145
256	artdeco_cafe	카페	ARTDECO	NORMAL	300	f	0.499	0.529	1.280	[{"d": 0.4, "k": "plinth", "w": 0.42, "color": "#7A5A2E"}, {"d": 0.4, "h": 0.6, "k": "box", "w": 0.42, "y": 0.07, "color": "#EDE3CC", "rough": 0.6, "windows": {"to": 0.85, "from": 0.5, "glow": 0.32, "color": "#7FA8C9"}}, {"d": 0.45, "h": 0.05, "k": "box", "w": 0.47, "y": 0.6699999999999999, "color": "#C9A24B"}, {"d": 0.36, "h": 0.44, "k": "box", "w": 0.38, "y": 0.72, "color": "#DDD0B4", "rough": 0.6, "windows": {"to": 0.8, "from": 0.2, "glow": 0.32, "color": "#7FA8C9"}}, {"d": 0.38, "h": 0.12, "k": "box", "w": 0.4, "y": 1.1600000000000001, "color": "#C9A24B"}, {"d": 0.36, "k": "parapet", "w": 0.38, "y": 1.1600000000000001, "color": "#DDD0B4"}, {"d": 0.016, "h": 0.6, "k": "box", "w": 0.016, "x": -0.18059999999999998, "y": 0.07, "z": 0.20400000000000001, "color": "#C9A24B"}, {"d": 0.016, "h": 0.6, "k": "box", "w": 0.016, "x": 0, "y": 0.07, "z": 0.20400000000000001, "color": "#C9A24B"}, {"d": 0.016, "h": 0.6, "k": "box", "w": 0.016, "x": 0.18059999999999998, "y": 0.07, "z": 0.20400000000000001, "color": "#C9A24B"}, {"d": 0.4, "k": "storefront", "w": 0.42, "sign": "#C9A24B", "faceH": 0.34, "awning": "#1F4A3A"}, {"k": "parasol", "pos": [0.12, 0.6699999999999999, 0.1], "color": "#1F4A3A"}]	\N	255	2026-08-03 01:12:42.366184	2026-08-03 01:12:42.366184
257	lm_worldcup_stadium	월드컵 대경기장	LANDMARK	LANDMARK	0	f	3.000	2.980	2.220	[{"d": 2.96, "h": 0.06, "k": "box", "w": 2.96, "y": 0, "st": 1, "color": "#B7B1A2", "rough": 0.95}, {"d": 1.16, "h": 0.02, "k": "box", "w": 1.66, "y": 0.06, "st": 1, "color": "#3E7A43", "rough": 1}, {"d": 1, "h": 0.012, "k": "box", "w": 1.5, "y": 0.08, "st": 1, "color": "#33683A", "rough": 1}, {"h": 0.3, "k": "ring", "y": 0.06, "ri": 0.98, "ro": 1.44, "st": 2, "sx": 1, "sz": 0.76, "seg": 32, "color": "#CFCabb"}, {"h": 0.34, "k": "bowl", "y": 0.34, "ri": 0.92, "ro": 1.4, "st": 3, "sx": 1, "sz": 0.76, "seg": 32, "color": "#2F6FA8"}, {"h": 0.62, "k": "ring", "y": 0.36, "ri": 1.3, "ro": 1.42, "st": 4, "sx": 1, "sz": 0.76, "seg": 32, "color": "#CFCabb"}, {"h": 0.3, "k": "bowl", "y": 0.7, "ri": 0.96, "ro": 1.34, "st": 4, "sx": 1, "sz": 0.76, "seg": 32, "color": "#D24B3E"}, {"h": 0.34, "k": "ring", "y": 0.98, "ri": 1.32, "ro": 1.42, "st": 5, "sx": 1, "sz": 0.76, "seg": 32, "color": "#B7B1A2"}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": 1.44, "y": 0.06, "z": 0, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": 1.330386526816253, "y": 0.06, "z": 0.4209517756015988, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": 1.0182337649086284, "y": 0.06, "z": 0.7778174593052023, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": 0.5510641426057293, "y": 0.06, "z": 1.0162674857624154, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": 0.00000000000000008817456953860943, "y": 0.06, "z": 1.1, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": -0.5510641426057292, "y": 0.06, "z": 1.0162674857624154, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": -1.0182337649086284, "y": 0.06, "z": 0.7778174593052024, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": -1.330386526816253, "y": 0.06, "z": 0.4209517756015989, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": -1.44, "y": 0.06, "z": 0.00000000000000013471114790620887, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": -1.330386526816253, "y": 0.06, "z": -0.4209517756015987, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": -1.0182337649086286, "y": 0.06, "z": -0.7778174593052023, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": -0.5510641426057301, "y": 0.06, "z": -1.0162674857624152, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": -0.00000000000000026452370861582825, "y": 0.06, "z": -1.1, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": 0.5510641426057296, "y": 0.06, "z": -1.0162674857624154, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": 1.0182337649086282, "y": 0.06, "z": -0.7778174593052025, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"d": 0.1, "h": 1.3, "k": "box", "w": 0.1, "x": 1.3303865268162525, "y": 0.06, "z": -0.42095177560159946, "st": 5, "color": "#8C949B", "metal": 0.4, "rough": 0.5}, {"h": 0.09, "k": "ring", "y": 1.32, "ri": 0.86, "ro": 1.46, "st": 6, "sx": 1, "sz": 0.76, "seg": 32, "color": "#E9E6DE"}, {"h": 0.14, "k": "ring", "y": 1.41, "ri": 1.42, "ro": 1.5, "st": 6, "sx": 1, "sz": 0.76, "seg": 32, "color": "#8C949B"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [1.4074268773786358, 0.62, 0.2126484509975798], "glow": 0.3, "rotY": 1.3744467859455345, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [1.1931588936541524, 0.62, 0.6055715539913664], "glow": 0.3, "rotY": 0.9817477042468103, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [0.7972432843831293, 0.62, 0.9063018774097744], "glow": 0.3, "rotY": 0.5890486225480862, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [0.27995461209314415, 0.62, 1.0690559556395212], "glow": 0.3, "rotY": 0.19634954084936207, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [-0.279954612093144, 0.62, 1.0690559556395212], "glow": 0.3, "rotY": -0.19634954084936207, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [-0.7972432843831289, 0.62, 0.9063018774097745], "glow": 0.3, "rotY": -0.589048622548086, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [-1.1931588936541526, 0.62, 0.6055715539913664], "glow": 0.3, "rotY": -0.9817477042468106, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [-1.4074268773786358, 0.62, 0.2126484509975802], "glow": 0.3, "rotY": -1.3744467859455343, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [-1.4074268773786358, 0.62, -0.21264845099757992], "glow": 0.3, "rotY": -1.7671458676442588, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [-1.1931588936541528, 0.62, -0.6055715539913662], "glow": 0.3, "rotY": -2.1598449493429825, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [-0.7972432843831292, 0.62, -0.9063018774097744], "glow": 0.3, "rotY": -2.552544031041707, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [-0.27995461209314465, 0.62, -1.0690559556395212], "glow": 0.3, "rotY": -2.945243112740431, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [0.27995461209314415, 0.62, -1.0690559556395212], "glow": 0.3, "rotY": -3.3379421944391554, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [0.7972432843831297, 0.62, -0.9063018774097741], "glow": 0.3, "rotY": -3.73064127613788, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [1.1931588936541524, 0.62, -0.6055715539913664], "glow": 0.3, "rotY": -4.123340357836604, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.14, "st": 6, "pos": [1.4074268773786356, 0.62, -0.2126484509975803], "glow": 0.3, "rotY": -4.516039439535327, "color": "#7FA6C4"}, {"h": 0.5, "k": "floodlight", "st": 7, "pos": [1.16, 1.46, 0.72]}, {"h": 0.5, "k": "floodlight", "st": 7, "pos": [-1.16, 1.46, 0.72]}, {"h": 0.5, "k": "floodlight", "st": 7, "pos": [1.16, 1.46, -0.72]}, {"h": 0.5, "k": "floodlight", "st": 7, "pos": [-1.16, 1.46, -0.72]}, {"d": 0.38, "h": 0.05, "k": "box", "w": 0.9, "y": 0.06, "z": 1.3, "st": 7, "color": "#CFCabb", "rough": 0.9}, {"d": 0.38, "h": 0.05, "k": "box", "w": 0.9, "y": 0.06, "z": -1.3, "st": 7, "color": "#CFCabb", "rough": 0.9}, {"d": 0.06, "h": 0.28, "k": "box", "w": 0.62, "y": 1.16, "z": 0.62, "st": 8, "color": "#12161B", "rough": 0.4, "emissive": true}, {"d": 0.06, "h": 0.28, "k": "box", "w": 0.62, "y": 1.16, "z": -0.62, "st": 8, "color": "#12161B", "rough": 0.4, "emissive": true}, {"h": 0.5, "k": "polyPrism", "r": 0.12, "x": 0, "y": 1.41, "z": -1.02, "st": 8, "color": "#B7B1A2", "rough": 0.7, "sides": 8}, {"h": 0.12, "k": "polyPrism", "r": 0.17, "x": 0, "y": 1.91, "z": -1.02, "st": 8, "color": "accent", "rough": 0.5, "sides": 8}, {"h": 0.24, "k": "panel", "w": 0.22, "st": 8, "pos": [0, 2.1, -1.02], "glow": 1, "color": "accent"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [1.422138656584684, 1.3, 0.2145993542177411], "glow": 0.85, "rotY": 1.3744467859455345, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [1.2056309378386905, 1.3, 0.6111272563215624], "glow": 0.85, "rotY": 0.9817477042468103, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [0.8055768378784233, 1.3, 0.9146165735327998], "glow": 0.85, "rotY": 0.5890486225480862, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [0.28288096692338605, 1.3, 1.0788638084435536], "glow": 0.85, "rotY": 0.19634954084936207, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.2828809669233859, 1.3, 1.0788638084435536], "glow": 0.85, "rotY": -0.19634954084936207, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.8055768378784228, 1.3, 0.9146165735327999], "glow": 0.85, "rotY": -0.589048622548086, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [-1.2056309378386907, 1.3, 0.6111272563215624], "glow": 0.85, "rotY": -0.9817477042468106, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [-1.422138656584684, 1.3, 0.21459935421774148], "glow": 0.85, "rotY": -1.3744467859455343, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [-1.422138656584684, 1.3, -0.2145993542177412], "glow": 0.85, "rotY": -1.7671458676442588, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [-1.205630937838691, 1.3, -0.6111272563215622], "glow": 0.85, "rotY": -2.1598449493429825, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.8055768378784232, 1.3, -0.9146165735327998], "glow": 0.85, "rotY": -2.552544031041707, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.28288096692338655, 1.3, -1.0788638084435533], "glow": 0.85, "rotY": -2.945243112740431, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [0.28288096692338605, 1.3, -1.0788638084435536], "glow": 0.85, "rotY": -3.3379421944391554, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [0.8055768378784238, 1.3, -0.9146165735327996], "glow": 0.85, "rotY": -3.73064127613788, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [1.2056309378386905, 1.3, -0.6111272563215624], "glow": 0.85, "rotY": -4.123340357836604, "color": "glassWarm"}, {"h": 0.06, "k": "panel", "w": 0.1, "st": 8, "pos": [1.4221386565846839, 1.3, -0.21459935421774162], "glow": 0.85, "rotY": -4.516039439535327, "color": "glassWarm"}]	\N	256	2026-08-03 01:12:42.367863	2026-08-08 01:48:25.420931
258	lm_colosseum	원형 대투기장	LANDMARK	LANDMARK	0	f	2.970	2.950	1.980	[{"d": 2.92, "h": 0.05, "k": "box", "w": 2.92, "y": 0, "st": 1, "color": "#C4B291", "rough": 0.9}, {"d": 2.7199999999999998, "h": 0.05, "k": "box", "w": 2.7199999999999998, "y": 0.05, "st": 1, "color": "#C4B291", "rough": 0.9}, {"d": 0.96, "h": 0.02, "k": "box", "w": 1.3, "y": 0.1, "st": 1, "color": "#C9A96B", "rough": 1}, {"d": 0.16, "h": 0.03, "k": "box", "w": 1.1, "y": 0.12, "st": 1, "color": "#B5A484", "rough": 1}, {"d": 0.8, "h": 0.03, "k": "box", "w": 0.16, "y": 0.12, "st": 1, "color": "#B5A484", "rough": 1}, {"h": 0.42, "k": "ring", "y": 0.1, "ri": 1.16, "ro": 1.42, "st": 2, "sx": 1, "sz": 0.86, "seg": 28, "color": "#D8C9A6"}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": 1.31, "y": 0.1, "z": 0, "st": 2, "rotY": 1.5707963267948966, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": 1.2458840363466512, "y": 0.1, "z": 0.34918920364369055, "st": 2, "rotY": 1.2566370614359172, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": 1.0598122626311812, "y": 0.1, "z": 0.6641973350904946, "st": 2, "rotY": 0.9424777960769379, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": 0.7699986805031398, "y": 0.1, "z": 0.9141892036436905, "st": 2, "rotY": 0.6283185307179586, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": 0.4048122626311812, "y": 0.1, "z": 1.0746938634135235, "st": 2, "rotY": 0.3141592653589793, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": 0.00000000000000008021436534415164, "y": 0.1, "z": 1.13, "st": 2, "rotY": 0, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": -0.40481226263118103, "y": 0.1, "z": 1.0746938634135235, "st": 2, "rotY": -0.3141592653589793, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": -0.7699986805031397, "y": 0.1, "z": 0.9141892036436905, "st": 2, "rotY": -0.6283185307179586, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": -1.059812262631181, "y": 0.1, "z": 0.6641973350904947, "st": 2, "rotY": -0.9424777960769379, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": -1.2458840363466512, "y": 0.1, "z": 0.34918920364369066, "st": 2, "rotY": -1.2566370614359172, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": -1.31, "y": 0.1, "z": 0.0000000000000001383850883036509, "st": 2, "rotY": -1.5707963267948966, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": -1.2458840363466512, "y": 0.1, "z": -0.3491892036436909, "st": 2, "rotY": -1.8849555921538763, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": -1.0598122626311812, "y": 0.1, "z": -0.6641973350904945, "st": 2, "rotY": -2.199114857512855, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": -0.76999868050314, "y": 0.1, "z": -0.9141892036436904, "st": 2, "rotY": -2.5132741228718345, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": -0.4048122626311813, "y": 0.1, "z": -1.0746938634135235, "st": 2, "rotY": -2.827433388230814, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": -0.0000000000000002406430960324549, "y": 0.1, "z": -1.13, "st": 2, "rotY": -3.141592653589793, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": 0.40481226263118086, "y": 0.1, "z": -1.0746938634135235, "st": 2, "rotY": -3.4557519189487724, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": 0.7699986805031396, "y": 0.1, "z": -0.9141892036436906, "st": 2, "rotY": -3.7699111843077517, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": 1.059812262631181, "y": 0.1, "z": -0.6641973350904948, "st": 2, "rotY": -4.084070449666731, "color": "#C4B291", "thick": 0.05}, {"d": 0.3, "h": 0.34, "k": "arch", "w": 0.13, "x": 1.2458840363466512, "y": 0.1, "z": -0.34918920364369077, "st": 2, "rotY": -4.39822971502571, "color": "#C4B291", "thick": 0.05}, {"h": 0.34, "k": "bowl", "y": 0.14, "ri": 0.7, "ro": 1.14, "st": 3, "sx": 1, "sz": 0.86, "seg": 28, "color": "#C4B291"}, {"h": 0.4, "k": "ring", "y": 0.52, "ri": 1.16, "ro": 1.4, "st": 4, "sx": 1, "sz": 0.86, "seg": 28, "color": "#D8C9A6"}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": 1.3, "y": 0.54, "z": 0, "st": 4, "rotY": 1.5707963267948966, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": 1.2363734711836996, "y": 0.54, "z": 0.3460990336999411, "st": 4, "rotY": 1.2566370614359172, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": 1.0517220926874318, "y": 0.54, "z": 0.65831948256757, "st": 4, "rotY": 0.9424777960769379, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": 0.7641208279802151, "y": 0.54, "z": 0.9060990336999413, "st": 4, "rotY": 0.6283185307179586, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": 0.4017220926874317, "y": 0.54, "z": 1.065183298250572, "st": 4, "rotY": 0.3141592653589793, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": 0.00000000000000007960204194457797, "y": 0.54, "z": 1.12, "st": 4, "rotY": 0, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": -0.40172209268743153, "y": 0.54, "z": 1.0651832982505722, "st": 4, "rotY": -0.3141592653589793, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": -0.764120827980215, "y": 0.54, "z": 0.9060990336999413, "st": 4, "rotY": -0.6283185307179586, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": -1.0517220926874316, "y": 0.54, "z": 0.6583194825675701, "st": 4, "rotY": -0.9424777960769379, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": -1.2363734711836996, "y": 0.54, "z": 0.3460990336999412, "st": 4, "rotY": -1.2566370614359172, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": -1.3, "y": 0.54, "z": 0.00000000000000013716044150450358, "st": 4, "rotY": -1.5707963267948966, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": -1.2363734711836996, "y": 0.54, "z": -0.3460990336999415, "st": 4, "rotY": -1.8849555921538763, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": -1.0517220926874318, "y": 0.54, "z": -0.6583194825675699, "st": 4, "rotY": -2.199114857512855, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": -0.7641208279802153, "y": 0.54, "z": -0.9060990336999412, "st": 4, "rotY": -2.5132741228718345, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": -0.40172209268743186, "y": 0.54, "z": -1.065183298250572, "st": 4, "rotY": -2.827433388230814, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": -0.00000000000000023880612583373386, "y": 0.54, "z": -1.12, "st": 4, "rotY": -3.141592653589793, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": 0.4017220926874314, "y": 0.54, "z": -1.0651832982505722, "st": 4, "rotY": -3.4557519189487724, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": 0.7641208279802149, "y": 0.54, "z": -0.9060990336999414, "st": 4, "rotY": -3.7699111843077517, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": 1.0517220926874316, "y": 0.54, "z": -0.6583194825675702, "st": 4, "rotY": -4.084070449666731, "color": "#C4B291", "thick": 0.05}, {"d": 0.28, "h": 0.32, "k": "arch", "w": 0.13, "x": 1.2363734711836996, "y": 0.54, "z": -0.3460990336999414, "st": 4, "rotY": -4.39822971502571, "color": "#C4B291", "thick": 0.05}, {"h": 0.38, "k": "ring", "y": 0.92, "ri": 1.16, "ro": 1.38, "st": 5, "sx": 1, "sz": 0.86, "seg": 28, "color": "#D8C9A6"}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": 1.28, "y": 0.94, "z": 0, "st": 5, "rotY": 1.5707963267948966, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": 1.2173523408577966, "y": 0.94, "z": 0.33991869381244216, "st": 5, "rotY": 1.2566370614359172, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": 1.0355417527999327, "y": 0.94, "z": 0.6465637775217205, "st": 5, "rotY": 0.9424777960769379, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": 0.7523651229343656, "y": 0.94, "z": 0.8899186938124423, "st": 5, "rotY": 0.6283185307179586, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": 0.39554175279993276, "y": 0.94, "z": 1.0461621679246689, "st": 5, "rotY": 0.3141592653589793, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": 0.0000000000000000783773951454306, "y": 0.94, "z": 1.1, "st": 5, "rotY": 0, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": -0.3955417527999326, "y": 0.94, "z": 1.046162167924669, "st": 5, "rotY": -0.3141592653589793, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": -0.7523651229343655, "y": 0.94, "z": 0.8899186938124423, "st": 5, "rotY": -0.6283185307179586, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": -1.0355417527999327, "y": 0.94, "z": 0.6465637775217207, "st": 5, "rotY": -0.9424777960769379, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": -1.2173523408577966, "y": 0.94, "z": 0.3399186938124423, "st": 5, "rotY": -1.2566370614359172, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": -1.28, "y": 0.94, "z": 0.00000000000000013471114790620887, "st": 5, "rotY": -1.5707963267948966, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": -1.2173523408577966, "y": 0.94, "z": -0.33991869381244255, "st": 5, "rotY": -1.8849555921538763, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": -1.0355417527999327, "y": 0.94, "z": -0.6465637775217203, "st": 5, "rotY": -2.199114857512855, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": -0.7523651229343657, "y": 0.94, "z": -0.8899186938124422, "st": 5, "rotY": -2.5132741228718345, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": -0.39554175279993287, "y": 0.94, "z": -1.0461621679246689, "st": 5, "rotY": -2.827433388230814, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": -0.0000000000000002351321854362918, "y": 0.94, "z": -1.1, "st": 5, "rotY": -3.141592653589793, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": 0.3955417527999325, "y": 0.94, "z": -1.046162167924669, "st": 5, "rotY": -3.4557519189487724, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": 0.7523651229343653, "y": 0.94, "z": -0.8899186938124424, "st": 5, "rotY": -3.7699111843077517, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": 1.0355417527999327, "y": 0.94, "z": -0.6465637775217208, "st": 5, "rotY": -4.084070449666731, "color": "#C4B291", "thick": 0.05}, {"d": 0.26, "h": 0.3, "k": "arch", "w": 0.12, "x": 1.2173523408577966, "y": 0.94, "z": -0.3399186938124424, "st": 5, "rotY": -4.39822971502571, "color": "#C4B291", "thick": 0.05}, {"h": 0.3, "k": "bowl", "y": 0.5, "ri": 0.82, "ro": 1.12, "st": 5, "sx": 1, "sz": 0.86, "seg": 28, "color": "#B5A484"}, {"h": 0.34, "k": "ring", "y": 1.3, "ri": 1.18, "ro": 1.36, "st": 6, "sx": 1, "sz": 0.86, "seg": 28, "color": "#C4B291"}, {"d": 0.12, "h": 0.3, "k": "box", "w": 0.12, "x": 1.28, "y": 1.3, "z": 0, "st": 6, "color": "#D8C9A6", "rough": 0.95}, {"d": 0.12, "h": 0.3, "k": "box", "w": 0.12, "x": 1.0355417527999327, "y": 1.3, "z": 0.6465637775217205, "st": 6, "color": "#D8C9A6", "rough": 0.95}, {"d": 0.12, "h": 0.3, "k": "box", "w": 0.12, "x": 0.39554175279993276, "y": 1.3, "z": 1.0461621679246689, "st": 6, "color": "#D8C9A6", "rough": 0.95}, {"d": 0.12, "h": 0.3, "k": "box", "w": 0.12, "x": -0.3955417527999326, "y": 1.3, "z": 1.046162167924669, "st": 6, "color": "#D8C9A6", "rough": 0.95}, {"d": 0.12, "h": 0.3, "k": "box", "w": 0.12, "x": -1.0355417527999327, "y": 1.3, "z": 0.6465637775217207, "st": 6, "color": "#D8C9A6", "rough": 0.95}, {"d": 0.12, "h": 0.3, "k": "box", "w": 0.12, "x": -1.28, "y": 1.3, "z": 0.00000000000000013471114790620887, "st": 6, "color": "#D8C9A6", "rough": 0.95}, {"d": 0.12, "h": 0.3, "k": "box", "w": 0.12, "x": -1.0355417527999327, "y": 1.3, "z": -0.6465637775217203, "st": 6, "color": "#B5A484", "rough": 0.95}, {"d": 0.12, "h": 0.3, "k": "box", "w": 0.12, "x": -0.39554175279993287, "y": 1.3, "z": -1.0461621679246689, "st": 6, "color": "#B5A484", "rough": 0.95}, {"d": 0.12, "h": 0.3, "k": "box", "w": 0.12, "x": 0.3955417527999325, "y": 1.3, "z": -1.046162167924669, "st": 6, "color": "#B5A484", "rough": 0.95}, {"d": 0.12, "h": 0.3, "k": "box", "w": 0.12, "x": 1.0355417527999327, "y": 1.3, "z": -0.6465637775217208, "st": 6, "color": "#B5A484", "rough": 0.95}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [1.4, 1.16, 0], "rotY": 1.5707963267948966, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [1.3314791228132148, 1.16, 0.3708203932499369], "rotY": 1.2566370614359172, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [1.1326237921249263, 1.16, 0.7053423027509678], "rotY": 0.9424777960769379, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [0.8228993532094624, 1.16, 0.9708203932499369], "rotY": 0.6283185307179586, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [0.4326237921249264, 1.16, 1.141267819554184], "rotY": 0.3141592653589793, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [0.00000000000000008572527594031472, 1.16, 1.2], "rotY": 0, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [-0.43262379212492624, 1.16, 1.1412678195541843], "rotY": -0.3141592653589793, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [-0.8228993532094622, 1.16, 0.9708203932499369], "rotY": -0.6283185307179586, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [-1.1326237921249263, 1.16, 0.7053423027509679], "rotY": -0.9424777960769379, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [-1.3314791228132148, 1.16, 0.370820393249937], "rotY": -1.2566370614359172, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [-1.4, 1.16, 0.00000000000000014695761589768238], "rotY": -1.5707963267948966, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [-1.3314791228132148, 1.16, -0.37082039324993726], "rotY": -1.8849555921538763, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [-1.1326237921249263, 1.16, -0.7053423027509677], "rotY": -2.199114857512855, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [-0.8228993532094625, 1.16, -0.9708203932499367], "rotY": -2.5132741228718345, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [-0.4326237921249266, 1.16, -1.141267819554184], "rotY": -2.827433388230814, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [-0.00000000000000025717582782094415, 1.16, -1.2], "rotY": -3.141592653589793, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [0.4326237921249261, 1.16, -1.1412678195541843], "rotY": -3.4557519189487724, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [0.8228993532094621, 1.16, -0.9708203932499371], "rotY": -3.7699111843077517, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [1.1326237921249263, 1.16, -0.705342302750968], "rotY": -4.084070449666731, "color": "#C9A96B"}, {"h": 0.16, "k": "panel", "w": 0.1, "st": 7, "pos": [1.3314791228132148, 1.16, -0.37082039324993715], "rotY": -4.39822971502571, "color": "#C9A96B"}, {"d": 0.3, "h": 0.04, "k": "box", "w": 0.7, "y": 0.06, "z": 1.34, "st": 7, "color": "#D8C9A6", "rough": 0.95}, {"d": 0.24, "h": 0.14, "k": "box", "w": 0.3, "x": -1.16, "y": 0.1, "z": 1.02, "st": 7, "color": "#B5A484", "rough": 1}, {"d": 0.2, "h": 0.1, "k": "box", "w": 0.2, "x": 1.2, "y": 0.1, "z": -0.96, "st": 7, "color": "#B5A484", "rough": 1}, {"d": 0.04, "h": 0.34, "k": "box", "w": 0.04, "x": 1.3, "y": 1.64, "z": 0, "st": 8, "color": "#6E5B3E", "rough": 0.9}, {"d": 0.04, "h": 0.34, "k": "box", "w": 0.04, "x": 1.1712595282731448, "y": 1.64, "z": 0.48594978781166515, "st": 8, "color": "#6E5B3E", "rough": 0.9}, {"d": 0.04, "h": 0.34, "k": "box", "w": 0.04, "x": 0.8105367424163537, "y": 1.64, "z": 0.8756512603641935, "st": 8, "color": "#6E5B3E", "rough": 0.9}, {"d": 0.04, "h": 0.34, "k": "box", "w": 0.04, "x": 0.2892772141432088, "y": 1.64, "z": 1.0919192616436426, "st": 8, "color": "#6E5B3E", "rough": 0.9}, {"d": 0.04, "h": 0.34, "k": "box", "w": 0.04, "x": -0.28927721414320867, "y": 1.64, "z": 1.0919192616436426, "st": 8, "color": "#6E5B3E", "rough": 0.9}, {"d": 0.04, "h": 0.34, "k": "box", "w": 0.04, "x": -0.8105367424163535, "y": 1.64, "z": 0.8756512603641936, "st": 8, "color": "#6E5B3E", "rough": 0.9}, {"d": 0.04, "h": 0.34, "k": "box", "w": 0.04, "x": -1.1712595282731448, "y": 1.64, "z": 0.48594978781166526, "st": 8, "color": "#6E5B3E", "rough": 0.9}, {"d": 0.04, "h": 0.34, "k": "box", "w": 0.04, "x": -1.3, "y": 1.64, "z": 0.00000000000000013716044150450358, "st": 8, "color": "#6E5B3E", "rough": 0.9}, {"d": 0.04, "h": 0.34, "k": "box", "w": 0.04, "x": -1.1712595282731448, "y": 1.64, "z": -0.48594978781166503, "st": 8, "color": "#6E5B3E", "rough": 0.9}, {"d": 0.04, "h": 0.34, "k": "box", "w": 0.04, "x": -0.8105367424163539, "y": 1.64, "z": -0.8756512603641934, "st": 8, "color": "#6E5B3E", "rough": 0.9}, {"d": 0.04, "h": 0.34, "k": "box", "w": 0.04, "x": -0.28927721414320895, "y": 1.64, "z": -1.0919192616436426, "st": 8, "color": "#6E5B3E", "rough": 0.9}, {"d": 0.04, "h": 0.34, "k": "box", "w": 0.04, "x": 0.2892772141432085, "y": 1.64, "z": -1.0919192616436426, "st": 8, "color": "#6E5B3E", "rough": 0.9}, {"d": 0.04, "h": 0.34, "k": "box", "w": 0.04, "x": 0.8105367424163534, "y": 1.64, "z": -0.8756512603641936, "st": 8, "color": "#6E5B3E", "rough": 0.9}, {"d": 0.04, "h": 0.34, "k": "box", "w": 0.04, "x": 1.1712595282731448, "y": 1.64, "z": -0.48594978781166537, "st": 8, "color": "#6E5B3E", "rough": 0.9}, {"d": 0.07, "h": 0.18, "k": "box", "w": 0.07, "x": 1.3, "y": 0.54, "z": 0, "st": 8, "color": "#EDE6D2", "rough": 0.8}, {"d": 0.07, "h": 0.18, "k": "box", "w": 0.07, "x": 1.0517220926874318, "y": 0.54, "z": 0.65831948256757, "st": 8, "color": "#EDE6D2", "rough": 0.8}, {"d": 0.07, "h": 0.18, "k": "box", "w": 0.07, "x": 0.4017220926874317, "y": 0.54, "z": 1.065183298250572, "st": 8, "color": "#EDE6D2", "rough": 0.8}, {"d": 0.07, "h": 0.18, "k": "box", "w": 0.07, "x": -0.40172209268743153, "y": 0.54, "z": 1.0651832982505722, "st": 8, "color": "#EDE6D2", "rough": 0.8}, {"d": 0.07, "h": 0.18, "k": "box", "w": 0.07, "x": -1.0517220926874316, "y": 0.54, "z": 0.6583194825675701, "st": 8, "color": "#EDE6D2", "rough": 0.8}, {"d": 0.07, "h": 0.18, "k": "box", "w": 0.07, "x": -1.3, "y": 0.54, "z": 0.00000000000000013716044150450358, "st": 8, "color": "#EDE6D2", "rough": 0.8}, {"d": 0.07, "h": 0.18, "k": "box", "w": 0.07, "x": -1.0517220926874318, "y": 0.54, "z": -0.6583194825675699, "st": 8, "color": "#EDE6D2", "rough": 0.8}, {"d": 0.07, "h": 0.18, "k": "box", "w": 0.07, "x": -0.40172209268743186, "y": 0.54, "z": -1.065183298250572, "st": 8, "color": "#EDE6D2", "rough": 0.8}, {"d": 0.07, "h": 0.18, "k": "box", "w": 0.07, "x": 0.4017220926874314, "y": 0.54, "z": -1.0651832982505722, "st": 8, "color": "#EDE6D2", "rough": 0.8}, {"d": 0.07, "h": 0.18, "k": "box", "w": 0.07, "x": 1.0517220926874316, "y": 0.54, "z": -0.6583194825675702, "st": 8, "color": "#EDE6D2", "rough": 0.8}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [1.44, 0.24, 0], "glow": 0.7, "rotY": 1.5707963267948966, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [1.330386526816253, 0.24, 0.4745274561327113], "glow": 0.7, "rotY": 1.1780972450961724, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [1.0182337649086284, 0.24, 0.8768124086713188], "glow": 0.7, "rotY": 0.7853981633974483, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [0.5510641426057293, 0.24, 1.1456106203139955], "glow": 0.7, "rotY": 0.39269908169872414, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [0.00000000000000008817456953860943, 0.24, 1.24], "glow": 0.7, "rotY": 0, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-0.5510641426057292, 0.24, 1.1456106203139955], "glow": 0.7, "rotY": -0.39269908169872414, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-1.0182337649086284, 0.24, 0.8768124086713189], "glow": 0.7, "rotY": -0.7853981633974483, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-1.330386526816253, 0.24, 0.47452745613271147], "glow": 0.7, "rotY": -1.1780972450961724, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-1.44, 0.24, 0.0000000000000001518562030942718], "glow": 0.7, "rotY": -1.5707963267948966, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-1.330386526816253, 0.24, -0.4745274561327112], "glow": 0.7, "rotY": -1.9634954084936207, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-1.0182337649086286, 0.24, -0.8768124086713188], "glow": 0.7, "rotY": -2.356194490192345, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-0.5510641426057301, 0.24, -1.1456106203139953], "glow": 0.7, "rotY": -2.7488935718910685, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-0.00000000000000026452370861582825, 0.24, -1.24], "glow": 0.7, "rotY": -3.141592653589793, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [0.5510641426057296, 0.24, -1.1456106203139955], "glow": 0.7, "rotY": -3.5342917352885177, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [1.0182337649086282, 0.24, -0.8768124086713192], "glow": 0.7, "rotY": -3.9269908169872414, "color": "accent"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [1.3303865268162525, 0.24, -0.4745274561327121], "glow": 0.7, "rotY": -4.319689898685965, "color": "accent"}]	\N	257	2026-08-03 01:12:42.369998	2026-08-08 01:48:25.430747
259	lm_pentagon_hq	오각 국방청사	LANDMARK	LANDMARK	0	f	2.960	2.970	1.290	[{"h": 0.05, "k": "polyPrism", "r": 1.48, "st": 1, "color": "#A9A79E", "rough": 0.95, "sides": 5}, {"h": 0.02, "k": "polyPrism", "r": 0.52, "y": 0.05, "st": 1, "color": "#4C7A46", "rough": 1, "sides": 5}, {"h": 0.44, "k": "polyPrism", "r": 1.44, "y": 0.05, "st": 2, "color": "#D9D3C4", "rough": 0.85, "sides": 5, "hollow": 0.86}, {"h": 0.4, "k": "polyPrism", "r": 1.2, "y": 0.05, "st": 3, "color": "#C3BCAA", "rough": 0.85, "sides": 5, "hollow": 0.84}, {"h": 0.4, "k": "polyPrism", "r": 0.98, "y": 0.05, "st": 3, "color": "#C3BCAA", "rough": 0.85, "sides": 5, "hollow": 0.82}, {"h": 0.38, "k": "polyPrism", "r": 0.78, "y": 0.05, "st": 4, "color": "#C3BCAA", "rough": 0.85, "sides": 5, "hollow": 0.8}, {"h": 0.38, "k": "polyPrism", "r": 0.6, "y": 0.05, "st": 4, "color": "#C3BCAA", "rough": 0.85, "sides": 5, "hollow": 0.76}, {"d": 0.9, "h": 0.36, "k": "box", "w": 0.16, "x": 1, "y": 0.05, "z": 0, "st": 4, "color": "#C3BCAA", "rough": 0.85}, {"d": 0.9, "h": 0.36, "k": "box", "w": 0.16, "x": 0.30901699437494745, "y": 0.05, "z": 0.9510565162951535, "st": 4, "color": "#C3BCAA", "rough": 0.85}, {"d": 0.9, "h": 0.36, "k": "box", "w": 0.16, "x": -0.8090169943749473, "y": 0.05, "z": 0.5877852522924732, "st": 4, "color": "#C3BCAA", "rough": 0.85}, {"d": 0.9, "h": 0.36, "k": "box", "w": 0.16, "x": -0.8090169943749475, "y": 0.05, "z": -0.587785252292473, "st": 4, "color": "#C3BCAA", "rough": 0.85}, {"d": 0.9, "h": 0.36, "k": "box", "w": 0.16, "x": 0.30901699437494723, "y": 0.05, "z": -0.9510565162951536, "st": 4, "color": "#C3BCAA", "rough": 0.85}, {"h": 0.4, "k": "polyPrism", "r": 1.42, "y": 0.49, "st": 5, "color": "#D9D3C4", "rough": 0.85, "sides": 5, "hollow": 0.86}, {"h": 0.36, "k": "polyPrism", "r": 1.18, "y": 0.45, "st": 5, "color": "#C3BCAA", "rough": 0.85, "sides": 5, "hollow": 0.84}, {"h": 0.34, "k": "polyPrism", "r": 1.4, "y": 0.89, "st": 6, "color": "#D9D3C4", "rough": 0.85, "sides": 5, "hollow": 0.86}, {"h": 0.06, "k": "polyPrism", "r": 1.46, "y": 1.23, "st": 6, "color": "#A9A79E", "rough": 0.8, "sides": 5, "hollow": 0.9}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [-0.6, 0.62, 1.18], "glow": 0.2, "rotY": 0, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [-0.2, 0.62, 1.18], "glow": 0.2, "rotY": 0, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [0.19999999999999996, 0.62, 1.18], "glow": 0.2, "rotY": 0, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [0.6, 0.62, 1.18], "glow": 0.2, "rotY": 0, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [0.9368364926033127, 0.62, 0.93527396313953], "glow": 0.2, "rotY": 1.2566370614359172, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [1.0604432903532917, 0.62, 0.5548513566214687], "glow": 0.2, "rotY": 1.2566370614359172, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [1.1840500881032707, 0.62, 0.17442875010340733], "glow": 0.2, "rotY": 1.2566370614359172, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [1.3076568858532496, 0.62, -0.20599385641465406], "glow": 0.2, "rotY": 1.2566370614359172, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [1.1789967943300868, 0.62, -0.6019689019869539], "glow": 0.2, "rotY": 2.5132741228718345, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [0.855389996580108, 0.62, -0.8370830029039432], "glow": 0.2, "rotY": 2.5132741228718345, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [0.531783198830129, 0.62, -1.0721971038209324], "glow": 0.2, "rotY": 2.5132741228718345, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [0.20817640108015006, 0.62, -1.3073112047379218], "glow": 0.2, "rotY": 2.5132741228718345, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [-0.20817640108014968, 0.62, -1.3073112047379218], "glow": 0.2, "rotY": 3.7699111843077517, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [-0.5317831988301286, 0.62, -1.0721971038209326], "glow": 0.2, "rotY": 3.7699111843077517, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [-0.8553899965801075, 0.62, -0.8370830029039433], "glow": 0.2, "rotY": 3.7699111843077517, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [-1.1789967943300865, 0.62, -0.6019689019869541], "glow": 0.2, "rotY": 3.7699111843077517, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [-1.3076568858532496, 0.62, -0.20599385641465445], "glow": 0.2, "rotY": 5.026548245743669, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [-1.1840500881032707, 0.62, 0.17442875010340697], "glow": 0.2, "rotY": 5.026548245743669, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [-1.0604432903532917, 0.62, 0.5548513566214683], "glow": 0.2, "rotY": 5.026548245743669, "color": "#7FA6C4"}, {"h": 0.5, "k": "panel", "w": 0.13, "st": 6, "pos": [-0.9368364926033128, 0.62, 0.9352739631395299], "glow": 0.2, "rotY": 5.026548245743669, "color": "#7FA6C4"}, {"d": 0.5, "h": 0.05, "k": "box", "w": 0.9, "y": 0.05, "z": 1.24, "st": 7, "color": "#A9A79E", "rough": 0.95}, {"d": 0.1, "h": 0.4, "k": "box", "w": 0.1, "x": -0.4, "y": 0.1, "z": 1.24, "st": 7, "color": "#EFEAE0", "rough": 0.85}, {"d": 0.1, "h": 0.4, "k": "box", "w": 0.1, "x": -0.24, "y": 0.1, "z": 1.24, "st": 7, "color": "#EFEAE0", "rough": 0.85}, {"d": 0.1, "h": 0.4, "k": "box", "w": 0.1, "x": -0.07999999999999999, "y": 0.1, "z": 1.24, "st": 7, "color": "#EFEAE0", "rough": 0.85}, {"d": 0.1, "h": 0.4, "k": "box", "w": 0.1, "x": 0.07999999999999999, "y": 0.1, "z": 1.24, "st": 7, "color": "#EFEAE0", "rough": 0.85}, {"d": 0.1, "h": 0.4, "k": "box", "w": 0.1, "x": 0.24000000000000005, "y": 0.1, "z": 1.24, "st": 7, "color": "#EFEAE0", "rough": 0.85}, {"d": 0.1, "h": 0.4, "k": "box", "w": 0.1, "x": 0.4, "y": 0.1, "z": 1.24, "st": 7, "color": "#EFEAE0", "rough": 0.85}, {"d": 0.14, "h": 0.04, "k": "box", "w": 0.9, "y": 0.5, "z": 1.24, "st": 7, "color": "#EFEAE0", "rough": 0.8}, {"h": 0.03, "k": "cyl", "y": 0.07, "rb": 0.24, "rt": 0.24, "st": 7, "seg": 16, "color": "#4A5058"}, {"d": 0.03, "h": 0.7, "k": "box", "w": 0.03, "y": 0.1, "z": 1.36, "st": 8, "color": "#EFEAE0"}, {"h": 0.15, "k": "panel", "w": 0.24, "st": 8, "pos": [0.13, 0.72, 1.36], "glow": 0.4, "color": "beaconRed"}, {"h": 0.34, "k": "polyPrism", "r": 0.16, "y": 0.07, "st": 8, "color": "#7A6A4F", "metal": 0.5, "rough": 0.5, "sides": 5}, {"k": "roof", "w": 0.3, "y": 0.41, "st": 8, "type": "cone", "color": "#C9A227", "height": 0.2}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.5, 1.06, 1.15], "glow": 0.8, "rotY": 0, "color": "glassWarm"}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [0, 1.06, 1.15], "glow": 0.8, "rotY": 0, "color": "glassWarm"}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [0.5, 1.06, 1.15], "glow": 0.8, "rotY": 0, "color": "glassWarm"}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [0.9392064965519527, 1.06, 0.8308978016787663], "glow": 0.8, "rotY": 1.2566370614359172, "color": "glassWarm"}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [1.0937149937394264, 1.06, 0.35536954353118955], "glow": 0.8, "rotY": 1.2566370614359172, "color": "glassWarm"}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [1.2482234909269, 1.06, -0.12015871461638722], "glow": 0.8, "rotY": 1.2566370614359172, "color": "glassWarm"}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [1.0804615373238178, 1.06, -0.6364769173849527], "glow": 0.8, "rotY": 2.5132741228718345, "color": "glassWarm"}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [0.6759530401363442, 1.06, -0.9303695435311894], "glow": 0.8, "rotY": 2.5132741228718345, "color": "glassWarm"}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [0.2714445429488705, 1.06, -1.224262169677426], "glow": 0.8, "rotY": 2.5132741228718345, "color": "glassWarm"}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.2714445429488702, 1.06, -1.224262169677426], "glow": 0.8, "rotY": 3.7699111843077517, "color": "glassWarm"}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.6759530401363439, 1.06, -0.9303695435311895], "glow": 0.8, "rotY": 3.7699111843077517, "color": "glassWarm"}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [-1.0804615373238176, 1.06, -0.6364769173849529], "glow": 0.8, "rotY": 3.7699111843077517, "color": "glassWarm"}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [-1.2482234909269003, 1.06, -0.12015871461638755], "glow": 0.8, "rotY": 5.026548245743669, "color": "glassWarm"}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [-1.0937149937394266, 1.06, 0.35536954353118927], "glow": 0.8, "rotY": 5.026548245743669, "color": "glassWarm"}, {"h": 0.08, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.939206496551953, 1.06, 0.830897801678766], "glow": 0.8, "rotY": 5.026548245743669, "color": "glassWarm"}]	\N	258	2026-08-03 01:12:42.372687	2026-08-08 01:48:25.43102
260	lm_capitol_dome	대의회 의사당	LANDMARK	LANDMARK	0	f	2.900	2.530	2.630	[{"d": 2.1, "h": 0.06, "k": "box", "w": 2.9, "y": 0, "st": 1, "color": "#CFC6B4", "rough": 0.9}, {"d": 1.86, "h": 0.06, "k": "box", "w": 2.66, "y": 0.06, "st": 1, "color": "#CFC6B4", "rough": 0.9}, {"d": 1.62, "h": 0.06, "k": "box", "w": 2.42, "y": 0.12, "st": 1, "color": "#CFC6B4", "rough": 0.9}, {"d": 0.66, "h": 0.03, "k": "box", "w": 2.9, "y": 0, "z": 1.15, "st": 1, "color": "#C3BCAA", "rough": 0.95}, {"d": 1.2, "h": 0.44, "k": "box", "w": 0.92, "x": 0.98, "y": 0.18, "st": 2, "color": "#EFEAE0", "rough": 0.8, "windows": {"to": 0.85, "from": 0.2, "glow": 0.18, "color": "#7FA6C4"}}, {"d": 1.2, "h": 0.44, "k": "box", "w": 0.92, "x": -0.98, "y": 0.18, "st": 2, "color": "#EFEAE0", "rough": 0.8, "windows": {"to": 0.85, "from": 0.2, "glow": 0.18, "color": "#7FA6C4"}}, {"d": 1.3, "h": 0.6, "k": "box", "w": 1.1, "y": 0.18, "st": 3, "color": "#EFEAE0", "rough": 0.8}, {"d": 0.1, "h": 0.56, "k": "box", "w": 0.1, "x": -0.5, "y": 0.18, "z": 0.66, "st": 3, "color": "#DED7C9", "rough": 0.85}, {"d": 0.1, "h": 0.56, "k": "box", "w": 0.1, "x": -0.35714285714285715, "y": 0.18, "z": 0.66, "st": 3, "color": "#DED7C9", "rough": 0.85}, {"d": 0.1, "h": 0.56, "k": "box", "w": 0.1, "x": -0.2142857142857143, "y": 0.18, "z": 0.66, "st": 3, "color": "#DED7C9", "rough": 0.85}, {"d": 0.1, "h": 0.56, "k": "box", "w": 0.1, "x": -0.07142857142857145, "y": 0.18, "z": 0.66, "st": 3, "color": "#DED7C9", "rough": 0.85}, {"d": 0.1, "h": 0.56, "k": "box", "w": 0.1, "x": 0.0714285714285714, "y": 0.18, "z": 0.66, "st": 3, "color": "#DED7C9", "rough": 0.85}, {"d": 0.1, "h": 0.56, "k": "box", "w": 0.1, "x": 0.2142857142857143, "y": 0.18, "z": 0.66, "st": 3, "color": "#DED7C9", "rough": 0.85}, {"d": 0.1, "h": 0.56, "k": "box", "w": 0.1, "x": 0.3571428571428571, "y": 0.18, "z": 0.66, "st": 3, "color": "#DED7C9", "rough": 0.85}, {"d": 0.1, "h": 0.56, "k": "box", "w": 0.1, "x": 0.5, "y": 0.18, "z": 0.66, "st": 3, "color": "#DED7C9", "rough": 0.85}, {"d": 1.14, "h": 0.36, "k": "box", "w": 0.86, "x": 0.98, "y": 0.62, "st": 4, "color": "#EFEAE0", "rough": 0.8, "windows": {"to": 0.85, "from": 0.2, "glow": 0.18, "color": "#7FA6C4"}}, {"d": 1.14, "h": 0.36, "k": "box", "w": 0.86, "x": -0.98, "y": 0.62, "st": 4, "color": "#EFEAE0", "rough": 0.8, "windows": {"to": 0.85, "from": 0.2, "glow": 0.18, "color": "#7FA6C4"}}, {"d": 1.26, "h": 0.06, "k": "box", "w": 2.86, "y": 0.98, "st": 4, "color": "#DED7C9", "rough": 0.8}, {"d": 1.36, "h": 0.28, "k": "box", "w": 1.16, "y": 0.78, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"h": 0.4, "k": "cyl", "y": 1.06, "rb": 0.48, "rt": 0.44, "st": 5, "seg": 20, "color": "#DED7C9"}, {"d": 0.06, "h": 0.38, "k": "box", "w": 0.06, "x": 0.5, "y": 1.06, "z": 0, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"d": 0.06, "h": 0.38, "k": "box", "w": 0.06, "x": 0.4504844339512096, "y": 1.06, "z": 0.21694186955877906, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"d": 0.06, "h": 0.38, "k": "box", "w": 0.06, "x": 0.3117449009293668, "y": 1.06, "z": 0.3909157412340149, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"d": 0.06, "h": 0.38, "k": "box", "w": 0.06, "x": 0.11126046697815722, "y": 1.06, "z": 0.4874639560909118, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"d": 0.06, "h": 0.38, "k": "box", "w": 0.06, "x": -0.11126046697815717, "y": 1.06, "z": 0.4874639560909118, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"d": 0.06, "h": 0.38, "k": "box", "w": 0.06, "x": -0.31174490092936674, "y": 1.06, "z": 0.39091574123401496, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"d": 0.06, "h": 0.38, "k": "box", "w": 0.06, "x": -0.4504844339512095, "y": 1.06, "z": 0.21694186955877912, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"d": 0.06, "h": 0.38, "k": "box", "w": 0.06, "x": -0.5, "y": 1.06, "z": 0.00000000000000006123233995736766, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"d": 0.06, "h": 0.38, "k": "box", "w": 0.06, "x": -0.4504844339512096, "y": 1.06, "z": -0.216941869558779, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"d": 0.06, "h": 0.38, "k": "box", "w": 0.06, "x": -0.31174490092936685, "y": 1.06, "z": -0.39091574123401485, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"d": 0.06, "h": 0.38, "k": "box", "w": 0.06, "x": -0.1112604669781573, "y": 1.06, "z": -0.4874639560909118, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"d": 0.06, "h": 0.38, "k": "box", "w": 0.06, "x": 0.11126046697815711, "y": 1.06, "z": -0.4874639560909118, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"d": 0.06, "h": 0.38, "k": "box", "w": 0.06, "x": 0.3117449009293667, "y": 1.06, "z": -0.39091574123401496, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"d": 0.06, "h": 0.38, "k": "box", "w": 0.06, "x": 0.4504844339512095, "y": 1.06, "z": -0.21694186955877917, "st": 5, "color": "#EFEAE0", "rough": 0.8}, {"h": 0.2, "k": "cyl", "y": 1.46, "rb": 0.44, "rt": 0.38, "st": 6, "seg": 20, "color": "#DED7C9"}, {"k": "roof", "w": 1.1, "y": 1.66, "st": 6, "type": "dome", "color": "#EFEAE0"}, {"d": 1.18, "h": 0.05, "k": "box", "w": 0.9, "x": 0.98, "y": 1.04, "st": 6, "color": "#4A5058", "rough": 0.85}, {"d": 1.18, "h": 0.05, "k": "box", "w": 0.9, "x": -0.98, "y": 1.04, "st": 6, "color": "#4A5058", "rough": 0.85}, {"d": 0.16, "h": 0.06, "k": "box", "w": 1.06, "y": 0.76, "z": 0.7, "st": 7, "color": "#DED7C9", "rough": 0.8}, {"d": 0.2, "h": 0.07, "k": "box", "w": 0.92, "y": 0.82, "z": 0.7, "st": 7, "color": "#DED7C9", "rough": 0.8}, {"d": 0.16, "h": 0.06, "k": "box", "w": 0.62, "y": 0.89, "z": 0.72, "st": 7, "color": "#DED7C9", "rough": 0.8}, {"d": 0.4, "h": 0.05, "k": "box", "w": 1.2, "y": 0.06, "z": 1.05, "st": 7, "color": "#CFC6B4", "rough": 0.9}, {"d": 0.34, "h": 0.05, "k": "box", "w": 1.1, "y": 0.02, "z": 1.2, "st": 7, "color": "#CFC6B4", "rough": 0.9}, {"d": 0.3, "k": "pool", "w": 1.1, "y": 0.03, "z": 1.29, "st": 7, "color": "water"}, {"h": 0.22, "k": "cyl", "y": 2.06, "rb": 0.13, "rt": 0.1, "st": 8, "seg": 12, "color": "#EFEAE0"}, {"k": "roof", "w": 0.3, "y": 2.28, "st": 8, "type": "dome", "color": "#C9A227"}, {"d": 0.05, "h": 0.24, "k": "box", "w": 0.05, "y": 2.39, "st": 8, "color": "#C9A227", "emissive": true}, {"d": 0.03, "h": 0.5, "k": "box", "w": 0.03, "x": -0.62, "y": 0.03, "z": 1.24, "st": 8, "color": "#EFEAE0"}, {"h": 0.13, "k": "panel", "w": 0.2, "st": 8, "pos": [-0.5, 0.45, 1.24], "glow": 0.4, "color": "beaconRed"}, {"h": 0.1, "k": "panel", "w": 0.08, "st": 8, "pos": [0.52, 1.24, 0], "glow": 0.75, "rotY": 1.5707963267948966, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.08, "st": 8, "pos": [0.45033320996790815, 1.24, 0.25999999999999995], "glow": 0.75, "rotY": 1.0471975511965979, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.08, "st": 8, "pos": [0.26000000000000006, 1.24, 0.4503332099679081], "glow": 0.75, "rotY": 0.5235987755982989, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.08, "st": 8, "pos": [0.000000000000000031840816777831187, 1.24, 0.52], "glow": 0.75, "rotY": 0, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.08, "st": 8, "pos": [-0.2599999999999999, 1.24, 0.45033320996790815], "glow": 0.75, "rotY": -0.5235987755982987, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.08, "st": 8, "pos": [-0.45033320996790815, 1.24, 0.25999999999999995], "glow": 0.75, "rotY": -1.0471975511965979, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.08, "st": 8, "pos": [-0.52, 1.24, 0.00000000000000006368163355566237], "glow": 0.75, "rotY": -1.5707963267948966, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.08, "st": 8, "pos": [-0.4503332099679081, 1.24, -0.26000000000000006], "glow": 0.75, "rotY": -2.0943951023931957, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.08, "st": 8, "pos": [-0.26000000000000023, 1.24, -0.45033320996790804], "glow": 0.75, "rotY": -2.617993877991494, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.08, "st": 8, "pos": [-0.00000000000000009552245033349355, 1.24, -0.52], "glow": 0.75, "rotY": -3.141592653589793, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.08, "st": 8, "pos": [0.26000000000000006, 1.24, -0.4503332099679081], "glow": 0.75, "rotY": -3.6651914291880923, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.08, "st": 8, "pos": [0.450333209967908, 1.24, -0.26000000000000023], "glow": 0.75, "rotY": -4.1887902047863905, "color": "glassWarm"}]	\N	259	2026-08-03 01:12:42.374453	2026-08-08 01:48:25.431185
262	lm_civic_plaza	중앙 시청 광장	LANDMARK	LANDMARK	0	t	2.900	2.900	2.250	[{"d": 2.9, "h": 0.05, "k": "box", "w": 2.9, "y": 0, "st": 1, "color": "#A9A79E", "rough": 0.95}, {"d": 1.9, "h": 0.02, "k": "box", "w": 1.9, "y": 0.05, "st": 1, "color": "#C3BCAA", "rough": 0.95}, {"d": 0.9, "h": 0.4, "k": "box", "w": 1.7, "y": 0.05, "st": 2, "color": "#EFEAE0", "rough": 0.8, "windows": {"to": 0.85, "from": 0.2, "glow": 0.2, "color": "#7FA6C4"}}, {"d": 0.8, "h": 0.34, "k": "box", "w": 0.5, "x": 1.06, "y": 0.05, "st": 3, "color": "#DED7C9", "rough": 0.85}, {"d": 0.8, "h": 0.34, "k": "box", "w": 0.5, "x": -1.06, "y": 0.05, "st": 3, "color": "#DED7C9", "rough": 0.85}, {"d": 0.66, "h": 0.66, "k": "box", "w": 0.66, "y": 0.45, "st": 4, "color": "#EFEAE0", "rough": 0.8, "windows": {"to": 0.9, "from": 0.15, "glow": 0.25, "color": "#7FA6C4"}}, {"d": 0.52, "h": 0.6, "k": "box", "w": 0.52, "y": 1.11, "st": 5, "color": "#EFEAE0", "rough": 0.8, "windows": {"to": 0.9, "from": 0.15, "glow": 0.25, "color": "#7FA6C4"}}, {"k": "clock", "w": 0.52, "y": 1.55, "st": 6, "color": "#DED7C9"}, {"k": "roof", "w": 0.56, "y": 1.71, "st": 6, "type": "pyramid", "color": "#4A5058", "height": 0.34}, {"d": 0.84, "h": 0.05, "k": "box", "w": 0.54, "x": 1.06, "y": 0.39, "st": 6, "color": "#4A5058", "rough": 0.85}, {"d": 0.84, "h": 0.05, "k": "box", "w": 0.54, "x": -1.06, "y": 0.39, "st": 6, "color": "#4A5058", "rough": 0.85}, {"d": 0.7, "k": "pool", "w": 0.7, "y": 0.05, "z": 1.06, "st": 7, "color": "water"}, {"h": 0.2, "k": "polyPrism", "r": 0.08, "y": 0.07, "z": 1.06, "st": 7, "color": "#DED7C9", "rough": 0.7, "sides": 10}, {"d": 0.1, "h": 0.22, "k": "box", "w": 0.1, "x": 1.38, "y": 0.05, "z": 0, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.22, "k": "box", "w": 0.1, "x": 0.6900000000000001, "y": 0.05, "z": 1.0392304845413263, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.22, "k": "box", "w": 0.1, "x": -0.6899999999999996, "y": 0.05, "z": 1.0392304845413265, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.22, "k": "box", "w": 0.1, "x": -1.38, "y": 0.05, "z": 0.00000000000000014695761589768238, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.22, "k": "box", "w": 0.1, "x": -0.6900000000000006, "y": 0.05, "z": -1.039230484541326, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.22, "k": "box", "w": 0.1, "x": 0.6900000000000001, "y": 0.05, "z": -1.0392304845413263, "st": 7, "color": "bush", "rough": 1}, {"d": 0.03, "h": 0.6, "k": "box", "w": 0.03, "x": -0.7, "y": 0.07, "z": 1.16, "st": 8, "color": "#EFEAE0"}, {"h": 0.14, "k": "panel", "w": 0.22, "st": 8, "pos": [-0.58, 0.6, 1.16], "glow": 0.35, "color": "accent"}, {"d": 0.05, "h": 0.2, "k": "box", "w": 0.05, "y": 2.05, "st": 8, "color": "#C9A227", "emissive": true}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [1.3, 0.12, 0], "glow": 0.7, "rotY": 1.5707963267948966, "color": "glassWarm"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [0.9192388155425119, 0.12, 0.9192388155425117], "glow": 0.7, "rotY": 0.7853981633974483, "color": "glassWarm"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [0.00000000000000007960204194457797, 0.12, 1.3], "glow": 0.7, "rotY": 0, "color": "glassWarm"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-0.9192388155425117, 0.12, 0.9192388155425119], "glow": 0.7, "rotY": -0.7853981633974483, "color": "glassWarm"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-1.3, 0.12, 0.00000000000000015920408388915593], "glow": 0.7, "rotY": -1.5707963267948966, "color": "glassWarm"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-0.919238815542512, 0.12, -0.9192388155425117], "glow": 0.7, "rotY": -2.356194490192345, "color": "glassWarm"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-0.00000000000000023880612583373386, 0.12, -1.3], "glow": 0.7, "rotY": -3.141592653589793, "color": "glassWarm"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [0.9192388155425116, 0.12, -0.919238815542512], "glow": 0.7, "rotY": -3.9269908169872414, "color": "glassWarm"}]	\N	261	2026-08-03 01:12:42.378144	2026-08-08 01:48:25.431347
264	lm_great_hall	대전각	LANDMARK	LANDMARK	0	f	2.880	2.920	2.220	[{"d": 2.88, "h": 0.04, "k": "box", "w": 2.88, "y": 0, "st": 1, "color": "#C9C2B6", "rough": 0.95}, {"d": 1.9, "h": 0.1, "k": "box", "w": 2.3, "y": 0.04, "st": 1, "color": "#C9C2B6", "rough": 0.9}, {"d": 1.5599999999999998, "h": 0.1, "k": "box", "w": 1.9599999999999997, "y": 0.14, "st": 1, "color": "#C9C2B6", "rough": 0.9}, {"d": 1.2199999999999998, "h": 0.1, "k": "box", "w": 1.6199999999999997, "y": 0.24000000000000002, "st": 1, "color": "#C9C2B6", "rough": 0.9}, {"d": 1.16, "h": 0.44, "k": "box", "w": 1.66, "y": 0.34, "st": 2, "color": "#EFEAE0", "rough": 0.9}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": -0.75, "y": 0.34, "z": 0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": -0.5357142857142857, "y": 0.34, "z": 0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": -0.32142857142857145, "y": 0.34, "z": 0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": -0.10714285714285718, "y": 0.34, "z": 0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": 0.1071428571428571, "y": 0.34, "z": 0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": 0.32142857142857145, "y": 0.34, "z": 0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": 0.5357142857142856, "y": 0.34, "z": 0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": 0.75, "y": 0.34, "z": 0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": -0.75, "y": 0.34, "z": -0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": -0.5357142857142857, "y": 0.34, "z": -0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": -0.32142857142857145, "y": 0.34, "z": -0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": -0.10714285714285718, "y": 0.34, "z": -0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": 0.1071428571428571, "y": 0.34, "z": -0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": 0.32142857142857145, "y": 0.34, "z": -0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": 0.5357142857142856, "y": 0.34, "z": -0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": 0.75, "y": 0.34, "z": -0.56, "st": 3, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": 0.78, "y": 0.34, "z": 0.28, "st": 3, "color": "#8C3B2E"}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": -0.78, "y": 0.34, "z": 0.28, "st": 3, "color": "#8C3B2E"}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": 0.78, "y": 0.34, "z": -0.28, "st": 3, "color": "#8C3B2E"}, {"d": 0.11, "h": 0.46, "k": "box", "w": 0.11, "x": -0.78, "y": 0.34, "z": -0.28, "st": 3, "color": "#8C3B2E"}, {"d": 1.24, "h": 0.09, "k": "box", "w": 1.74, "y": 0.8, "st": 4, "color": "#6E2B22", "rough": 0.85}, {"d": 1.36, "h": 0.06, "k": "box", "w": 1.86, "y": 0.89, "st": 4, "color": "#2E6E4B", "rough": 0.85}, {"d": 1.46, "k": "roof", "w": 1.98, "y": 0.95, "st": 4, "type": "pyramid", "color": "#3B4048", "height": 0.3}, {"d": 0.86, "h": 0.36, "k": "box", "w": 1.24, "y": 1.25, "st": 5, "color": "#EFEAE0", "rough": 0.9}, {"d": 0.1, "h": 0.36, "k": "box", "w": 0.1, "x": -0.55, "y": 1.25, "z": 0.41, "st": 5, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.1, "h": 0.36, "k": "box", "w": 0.1, "x": -0.33, "y": 1.25, "z": 0.41, "st": 5, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.1, "h": 0.36, "k": "box", "w": 0.1, "x": -0.10999999999999999, "y": 1.25, "z": 0.41, "st": 5, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.1, "h": 0.36, "k": "box", "w": 0.1, "x": 0.10999999999999999, "y": 1.25, "z": 0.41, "st": 5, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.1, "h": 0.36, "k": "box", "w": 0.1, "x": 0.33000000000000007, "y": 1.25, "z": 0.41, "st": 5, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.1, "h": 0.36, "k": "box", "w": 0.1, "x": 0.55, "y": 1.25, "z": 0.41, "st": 5, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.1, "h": 0.36, "k": "box", "w": 0.1, "x": -0.55, "y": 1.25, "z": -0.41, "st": 5, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.1, "h": 0.36, "k": "box", "w": 0.1, "x": -0.33, "y": 1.25, "z": -0.41, "st": 5, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.1, "h": 0.36, "k": "box", "w": 0.1, "x": -0.10999999999999999, "y": 1.25, "z": -0.41, "st": 5, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.1, "h": 0.36, "k": "box", "w": 0.1, "x": 0.10999999999999999, "y": 1.25, "z": -0.41, "st": 5, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.1, "h": 0.36, "k": "box", "w": 0.1, "x": 0.33000000000000007, "y": 1.25, "z": -0.41, "st": 5, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.1, "h": 0.36, "k": "box", "w": 0.1, "x": 0.55, "y": 1.25, "z": -0.41, "st": 5, "color": "#8C3B2E", "rough": 0.85}, {"d": 0.96, "h": 0.08, "k": "box", "w": 1.34, "y": 1.61, "st": 6, "color": "#6E2B22", "rough": 0.85}, {"d": 1.06, "h": 0.05, "k": "box", "w": 1.44, "y": 1.69, "st": 6, "color": "#2E6E4B", "rough": 0.85}, {"d": 1.16, "k": "roof", "w": 1.56, "y": 1.74, "st": 6, "type": "pyramid", "color": "#3B4048", "height": 0.34}, {"d": 0.08, "h": 0.16, "k": "box", "w": 0.08, "x": 1.08, "y": 0.14, "z": 0, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.08, "h": 0.16, "k": "box", "w": 0.08, "x": 0.9353074360871939, "y": 0.14, "z": 0.43999999999999995, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.08, "h": 0.16, "k": "box", "w": 0.08, "x": 0.5400000000000001, "y": 0.14, "z": 0.762102355330306, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.08, "h": 0.16, "k": "box", "w": 0.08, "x": 0.00000000000000006613092715395707, "y": 0.14, "z": 0.88, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.08, "h": 0.16, "k": "box", "w": 0.08, "x": -0.5399999999999998, "y": 0.14, "z": 0.762102355330306, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.08, "h": 0.16, "k": "box", "w": 0.08, "x": -0.9353074360871939, "y": 0.14, "z": 0.43999999999999995, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.08, "h": 0.16, "k": "box", "w": 0.08, "x": -1.08, "y": 0.14, "z": 0.00000000000000010776891832496708, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.08, "h": 0.16, "k": "box", "w": 0.08, "x": -0.9353074360871938, "y": 0.14, "z": -0.4400000000000001, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.08, "h": 0.16, "k": "box", "w": 0.08, "x": -0.5400000000000005, "y": 0.14, "z": -0.7621023553303059, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.08, "h": 0.16, "k": "box", "w": 0.08, "x": -0.00000000000000019839278146187122, "y": 0.14, "z": -0.88, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.08, "h": 0.16, "k": "box", "w": 0.08, "x": 0.5400000000000001, "y": 0.14, "z": -0.762102355330306, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.08, "h": 0.16, "k": "box", "w": 0.08, "x": 0.9353074360871935, "y": 0.14, "z": -0.4400000000000004, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.68, "h": 0.04, "k": "box", "w": 0.44, "y": 0.04, "z": 1.14, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.12, "h": 0.2, "k": "box", "w": 0.12, "x": 0.62, "y": 0.04, "z": 1, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"d": 0.12, "h": 0.2, "k": "box", "w": 0.12, "x": -0.62, "y": 0.04, "z": 1, "st": 7, "color": "#C9C2B6", "rough": 0.95}, {"h": 0.2, "k": "polyPrism", "r": 0.11, "x": 0.44, "y": 0.24, "z": 0.68, "st": 7, "color": "#6E6A62", "metal": 0.3, "rough": 0.6, "sides": 8}, {"h": 0.2, "k": "polyPrism", "r": 0.11, "x": -0.44, "y": 0.24, "z": 0.68, "st": 7, "color": "#6E6A62", "metal": 0.3, "rough": 0.6, "sides": 8}, {"d": 0.1, "h": 0.07, "k": "box", "w": 1.1, "y": 2.06, "st": 8, "color": "#3B4048", "rough": 0.8}, {"d": 0.1, "h": 0.14, "k": "box", "w": 0.1, "x": 0.52, "y": 2.08, "st": 8, "color": "#C9A227", "metal": 0.6, "rough": 0.4}, {"d": 0.1, "h": 0.14, "k": "box", "w": 0.1, "x": -0.52, "y": 2.08, "st": 8, "color": "#C9A227", "metal": 0.6, "rough": 0.4}, {"h": 0.16, "k": "panel", "w": 0.5, "st": 8, "pos": [0, 1.52, 0.44], "color": "#6E2B22"}, {"h": 0.1, "k": "panel", "w": 0.44, "st": 8, "pos": [0, 1.52, 0.45], "glow": 0.3, "color": "#C9A227"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [1.06, 0.62, 0], "glow": 0.8, "rotY": 1.5707963267948966, "color": "accent"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [0.7495331880577405, 0.62, 0.6081118318204308], "glow": 0.8, "rotY": 0.7853981633974483, "color": "accent"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [0.00000000000000006490628035480972, 0.62, 0.86], "glow": 0.8, "rotY": 0, "color": "accent"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.7495331880577404, 0.62, 0.6081118318204309], "glow": 0.8, "rotY": -0.7853981633974483, "color": "accent"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-1.06, 0.62, 0.00000000000000010531962472667238], "glow": 0.8, "rotY": -1.5707963267948966, "color": "accent"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.7495331880577406, 0.62, -0.6081118318204308], "glow": 0.8, "rotY": -2.356194490192345, "color": "accent"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.00000000000000019471884106442915, 0.62, -0.86], "glow": 0.8, "rotY": -3.141592653589793, "color": "accent"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [0.7495331880577403, 0.62, -0.608111831820431], "glow": 0.8, "rotY": -3.9269908169872414, "color": "accent"}]	\N	263	2026-08-03 01:12:42.381286	2026-08-08 01:48:25.431651
265	lm_taj_mausoleum	백대리석 영묘	LANDMARK	LANDMARK	0	f	2.980	2.980	2.190	[{"d": 2.9, "h": 0.05, "k": "box", "w": 2.9, "y": 0, "st": 1, "color": "#9E5A45", "rough": 0.95}, {"d": 1.1, "h": 0.02, "k": "box", "w": 2.6, "y": 0.05, "z": 0.86, "st": 1, "color": "#4C7A46", "rough": 1}, {"d": 2, "h": 0.09, "k": "box", "w": 2, "y": 0.05, "st": 2, "color": "#E0DACE", "rough": 0.9}, {"d": 1.76, "h": 0.09, "k": "box", "w": 1.76, "y": 0.14, "st": 2, "color": "#E0DACE", "rough": 0.9}, {"d": 1.3, "h": 0.6, "k": "box", "w": 1.3, "y": 0.23, "st": 3, "color": "#F2EEE6", "rough": 0.7}, {"h": 0.6, "k": "polyPrism", "r": 0.78, "y": 0.23, "st": 3, "color": "#E0DACE", "rough": 0.7, "sides": 8}, {"d": 1.36, "h": 0.52, "k": "arch", "w": 0.4, "y": 0.23, "st": 4, "color": "#E0DACE", "thick": 0.14}, {"d": 1.36, "h": 0.52, "k": "arch", "w": 0.4, "y": 0.23, "st": 4, "rotY": 1.5707963267948966, "color": "#E0DACE", "thick": 0.14}, {"d": 1.34, "h": 0.06, "k": "box", "w": 1.34, "y": 0.83, "st": 4, "color": "#E0DACE", "rough": 0.7}, {"h": 0.24, "k": "cyl", "y": 0.89, "rb": 0.46, "rt": 0.42, "st": 5, "seg": 16, "color": "#F2EEE6"}, {"d": 0.16, "h": 1.08, "k": "box", "w": 0.16, "x": 1.16, "y": 0.05, "z": 0, "st": 5, "color": "#F2EEE6", "rough": 0.7}, {"d": 0.16, "h": 1.08, "k": "box", "w": 0.16, "x": 0.00000000000000007102951435054648, "y": 0.05, "z": 1.16, "st": 5, "color": "#F2EEE6", "rough": 0.7}, {"d": 0.16, "h": 1.08, "k": "box", "w": 0.16, "x": -1.16, "y": 0.05, "z": 0.00000000000000014205902870109295, "st": 5, "color": "#F2EEE6", "rough": 0.7}, {"d": 0.16, "h": 1.08, "k": "box", "w": 0.16, "x": -0.00000000000000021308854305163943, "y": 0.05, "z": -1.16, "st": 5, "color": "#F2EEE6", "rough": 0.7}, {"k": "roof", "w": 1.24, "y": 1.13, "st": 6, "type": "dome", "color": "#F2EEE6"}, {"h": 0.2, "k": "cyl", "y": 1.55, "rb": 0.3, "rt": 0.2, "st": 6, "color": "#F2EEE6"}, {"d": 0.13, "h": 0.4, "k": "box", "w": 0.13, "x": 1.16, "y": 1.13, "z": 0, "st": 6, "color": "#F2EEE6", "rough": 0.7}, {"d": 0.13, "h": 0.4, "k": "box", "w": 0.13, "x": 0.00000000000000007102951435054648, "y": 1.13, "z": 1.16, "st": 6, "color": "#F2EEE6", "rough": 0.7}, {"d": 0.13, "h": 0.4, "k": "box", "w": 0.13, "x": -1.16, "y": 1.13, "z": 0.00000000000000014205902870109295, "st": 6, "color": "#F2EEE6", "rough": 0.7}, {"d": 0.13, "h": 0.4, "k": "box", "w": 0.13, "x": -0.00000000000000021308854305163943, "y": 1.13, "z": -1.16, "st": 6, "color": "#F2EEE6", "rough": 0.7}, {"d": 1, "k": "pool", "w": 0.34, "y": 0.05, "z": 0.94, "st": 7, "color": "water"}, {"d": 0.26, "k": "pool", "w": 1.2, "y": 0.05, "z": 0.44, "st": 7, "color": "water"}, {"d": 0.24, "h": 0.04, "k": "box", "w": 0.24, "x": 1.16, "y": 0.78, "z": 0, "st": 7, "color": "#E0DACE", "rough": 0.7}, {"d": 0.24, "h": 0.04, "k": "box", "w": 0.24, "x": 0.00000000000000007102951435054648, "y": 0.78, "z": 1.16, "st": 7, "color": "#E0DACE", "rough": 0.7}, {"d": 0.24, "h": 0.04, "k": "box", "w": 0.24, "x": -1.16, "y": 0.78, "z": 0.00000000000000014205902870109295, "st": 7, "color": "#E0DACE", "rough": 0.7}, {"d": 0.24, "h": 0.04, "k": "box", "w": 0.24, "x": -0.00000000000000021308854305163943, "y": 0.78, "z": -1.16, "st": 7, "color": "#E0DACE", "rough": 0.7}, {"d": 0.11, "h": 0.2, "k": "box", "w": 0.11, "x": 1.3, "y": 0.05, "z": 0, "st": 7, "color": "#3C6B3E", "rough": 1}, {"d": 0.11, "h": 0.2, "k": "box", "w": 0.11, "x": 0.6500000000000001, "y": 0.05, "z": 1.12583302491977, "st": 7, "color": "#3C6B3E", "rough": 1}, {"d": 0.11, "h": 0.2, "k": "box", "w": 0.11, "x": -0.6499999999999997, "y": 0.05, "z": 1.1258330249197703, "st": 7, "color": "#3C6B3E", "rough": 1}, {"d": 0.11, "h": 0.2, "k": "box", "w": 0.11, "x": -1.3, "y": 0.05, "z": 0.00000000000000015920408388915593, "st": 7, "color": "#3C6B3E", "rough": 1}, {"d": 0.11, "h": 0.2, "k": "box", "w": 0.11, "x": -0.6500000000000006, "y": 0.05, "z": -1.12583302491977, "st": 7, "color": "#3C6B3E", "rough": 1}, {"d": 0.11, "h": 0.2, "k": "box", "w": 0.11, "x": 0.6500000000000001, "y": 0.05, "z": -1.12583302491977, "st": 7, "color": "#3C6B3E", "rough": 1}, {"h": 0.3, "k": "cyl", "y": 1.75, "rb": 0.07, "rt": 0.03, "st": 8, "seg": 8, "color": "#C9A227"}, {"k": "roof", "w": 0.14, "y": 2.05, "st": 8, "type": "cone", "color": "#C9A227", "height": 0.14}, {"d": 0.1, "h": 0.1, "k": "box", "w": 0.1, "x": 1.16, "y": 1.53, "z": 0, "st": 8, "color": "#C9A227", "metal": 0.6, "rough": 0.4}, {"d": 0.05, "h": 0.12, "k": "box", "w": 0.05, "x": 1.16, "y": 1.63, "z": 0, "st": 8, "color": "#C9A227", "metal": 0.6, "rough": 0.4}, {"d": 0.1, "h": 0.1, "k": "box", "w": 0.1, "x": 0.00000000000000007102951435054648, "y": 1.53, "z": 1.16, "st": 8, "color": "#C9A227", "metal": 0.6, "rough": 0.4}, {"d": 0.05, "h": 0.12, "k": "box", "w": 0.05, "x": 0.00000000000000007102951435054648, "y": 1.63, "z": 1.16, "st": 8, "color": "#C9A227", "metal": 0.6, "rough": 0.4}, {"d": 0.1, "h": 0.1, "k": "box", "w": 0.1, "x": -1.16, "y": 1.53, "z": 0.00000000000000014205902870109295, "st": 8, "color": "#C9A227", "metal": 0.6, "rough": 0.4}, {"d": 0.05, "h": 0.12, "k": "box", "w": 0.05, "x": -1.16, "y": 1.63, "z": 0.00000000000000014205902870109295, "st": 8, "color": "#C9A227", "metal": 0.6, "rough": 0.4}, {"d": 0.1, "h": 0.1, "k": "box", "w": 0.1, "x": -0.00000000000000021308854305163943, "y": 1.53, "z": -1.16, "st": 8, "color": "#C9A227", "metal": 0.6, "rough": 0.4}, {"d": 0.05, "h": 0.12, "k": "box", "w": 0.05, "x": -0.00000000000000021308854305163943, "y": 1.63, "z": -1.16, "st": 8, "color": "#C9A227", "metal": 0.6, "rough": 0.4}, {"h": 0.3, "k": "panel", "w": 0.3, "st": 8, "pos": [0, 0.52, 0.74], "glow": 0.14, "color": "#2F5D7C"}, {"h": 0.3, "k": "panel", "w": 0.3, "st": 8, "pos": [0, 0.52, -0.74], "glow": 0.14, "color": "#2F5D7C"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [1.44, 0.12, 0], "glow": 0.8, "rotY": 1.5707963267948966, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [1.0182337649086284, 0.12, 1.0182337649086284], "glow": 0.8, "rotY": 0.7853981633974483, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [0.00000000000000008817456953860943, 0.12, 1.44], "glow": 0.8, "rotY": 0, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-1.0182337649086284, 0.12, 1.0182337649086284], "glow": 0.8, "rotY": -0.7853981633974483, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-1.44, 0.12, 0.00000000000000017634913907721887], "glow": 0.8, "rotY": -1.5707963267948966, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-1.0182337649086286, 0.12, -1.0182337649086284], "glow": 0.8, "rotY": -2.356194490192345, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.00000000000000026452370861582825, 0.12, -1.44], "glow": 0.8, "rotY": -3.141592653589793, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [1.0182337649086282, 0.12, -1.0182337649086286], "glow": 0.8, "rotY": -3.9269908169872414, "color": "glassWarm"}]	\N	264	2026-08-03 01:12:42.384201	2026-08-08 01:48:25.431837
268	lm_harbor_opera	항만 오페라하우스	LANDMARK	LANDMARK	0	f	2.900	2.900	1.660	[{"d": 2.9, "h": 0.03, "k": "box", "w": 2.9, "y": 0, "st": 1, "color": "#3E7C9B", "metal": 0.5, "rough": 0.15}, {"d": 2, "h": 0.08, "k": "box", "w": 2.1, "y": 0.03, "z": -0.05, "st": 1, "color": "#B9AE99", "rough": 0.95}, {"d": 1.5, "h": 0.07, "k": "box", "w": 1.9, "y": 0.11, "st": 2, "color": "#B9AE99", "rough": 0.9}, {"d": 1.22, "h": 0.07, "k": "box", "w": 1.6199999999999999, "y": 0.18, "st": 2, "color": "#B9AE99", "rough": 0.9}, {"d": 0.94, "h": 0.07, "k": "box", "w": 1.3399999999999999, "y": 0.25, "st": 2, "color": "#B9AE99", "rough": 0.9}, {"d": 0.34, "h": 0.05, "k": "box", "w": 0.5, "x": -0.78, "y": 0.11, "z": 0.78, "st": 2, "color": "#B9AE99", "rough": 0.95}, {"d": 1.1, "h": 0.34, "k": "box", "w": 1.5, "y": 0.32, "z": -0.2, "st": 3, "color": "#E3DFD4", "rough": 0.6, "windows": {"to": 0.85, "from": 0.2, "glow": 0.3, "color": "#8FB4D0"}}, {"d": 0.9, "h": 1, "k": "shell", "w": 1, "st": 4, "pos": [-0.34, 0.66, -0.3], "rotY": 0.25132741228718347, "color": "#F4F1E9"}, {"d": 0.82, "h": 0.86, "k": "shell", "w": 0.92, "st": 4, "pos": [0.36, 0.66, -0.38], "rotY": -0.25132741228718347, "color": "#F4F1E9"}, {"d": 0.7, "h": 0.72, "k": "shell", "w": 0.76, "st": 5, "pos": [-0.28, 0.66, -0.02], "rotY": 0.4398229715025711, "color": "#F4F1E9"}, {"d": 0.64, "h": 0.64, "k": "shell", "w": 0.7, "st": 5, "pos": [0.3, 0.66, 0], "rotY": -0.4398229715025711, "color": "#F4F1E9"}, {"d": 0.62, "h": 0.21, "k": "box", "w": 0.7, "y": 0.11, "z": 0.56, "st": 6, "color": "#B9AE99", "rough": 0.95}, {"d": 0.46, "h": 0.44, "k": "shell", "w": 0.5, "st": 6, "pos": [0.02, 0.32, 0.6], "rotY": 1.5707963267948966, "color": "#F4F1E9"}, {"h": 0.3, "k": "panel", "w": 1.3, "st": 6, "pos": [0, 0.5, 0.36], "glow": 0.34, "color": "#8FB4D0"}, {"d": 1.66, "h": 0.06, "k": "box", "w": 0.22, "x": 1.16, "y": 0.03, "z": -0.12, "st": 7, "color": "#B9AE99", "rough": 0.95}, {"d": 1.66, "h": 0.06, "k": "box", "w": 0.22, "x": -1.16, "y": 0.03, "z": -0.12, "st": 7, "color": "#B9AE99", "rough": 0.95}, {"d": 0.09, "h": 0.24, "k": "box", "w": 0.09, "x": 1.16, "y": 0.09, "z": 0.62, "st": 7, "color": "wood", "rough": 0.9}, {"d": 0.09, "h": 0.24, "k": "box", "w": 0.09, "x": -1.16, "y": 0.09, "z": 0.62, "st": 7, "color": "wood", "rough": 0.9}, {"d": 0.1, "h": 0.2, "k": "box", "w": 0.1, "x": 1, "y": 0.11, "z": 0.34, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.2, "k": "box", "w": 0.1, "x": -1, "y": 0.11, "z": 0.34, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.2, "k": "box", "w": 0.1, "x": 1, "y": 0.11, "z": -0.34, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.2, "k": "box", "w": 0.1, "x": -1, "y": 0.11, "z": -0.34, "st": 7, "color": "bush", "rough": 1}, {"d": 0.16, "h": 0.09, "k": "box", "w": 0.34, "x": -1.2, "y": 0.03, "z": 1.06, "st": 8, "color": "#F4F1E9", "rough": 0.6}, {"d": 0.05, "h": 0.3, "k": "box", "w": 0.05, "x": -1.2, "y": 0.12, "z": 1.06, "st": 8, "color": "wood"}, {"h": 0.14, "k": "panel", "w": 0.14, "st": 8, "pos": [0.8, 0.2, 0], "glow": 0.85, "rotY": 1.5707963267948966, "color": "glassWarm"}, {"h": 0.14, "k": "panel", "w": 0.14, "st": 8, "pos": [0.40000000000000013, 0.2, 0.6928203230275509], "glow": 0.85, "rotY": 0.5235987755982989, "color": "glassWarm"}, {"h": 0.14, "k": "panel", "w": 0.14, "st": 8, "pos": [-0.39999999999999986, 0.2, 0.692820323027551], "glow": 0.85, "rotY": -0.5235987755982987, "color": "glassWarm"}, {"h": 0.14, "k": "panel", "w": 0.14, "st": 8, "pos": [-0.8, 0.2, 0.00000000000000009797174393178826], "glow": 0.85, "rotY": -1.5707963267948966, "color": "glassWarm"}, {"h": 0.14, "k": "panel", "w": 0.14, "st": 8, "pos": [-0.40000000000000036, 0.2, -0.6928203230275508], "glow": 0.85, "rotY": -2.617993877991494, "color": "glassWarm"}, {"h": 0.14, "k": "panel", "w": 0.14, "st": 8, "pos": [0.40000000000000013, 0.2, -0.6928203230275509], "glow": 0.85, "rotY": -3.6651914291880923, "color": "glassWarm"}, {"h": 0.26, "k": "panel", "w": 1.2, "st": 8, "pos": [0, 0.46, 0.38], "glow": 0.5, "color": "accent"}]	\N	267	2026-08-03 01:12:42.388263	2026-08-08 01:48:25.431989
263	lm_grand_palace	대궁전	LANDMARK	LANDMARK	0	f	2.920	2.940	1.820	[{"d": 2.92, "h": 0.05, "k": "box", "w": 2.92, "y": 0, "st": 1, "color": "#C6BCA6", "rough": 0.98}, {"d": 0.9, "h": 0.02, "k": "box", "w": 2.4, "y": 0.05, "z": 1, "st": 1, "color": "#4C7A46", "rough": 1}, {"d": 0.72, "h": 0.42, "k": "box", "w": 1.5, "y": 0.05, "z": -0.7, "st": 2, "color": "#E3D9C0", "rough": 0.85, "windows": {"to": 0.85, "from": 0.2, "glow": 0.2, "color": "glassWarm"}}, {"d": 1.9, "h": 0.4, "k": "box", "w": 0.56, "x": 1.06, "y": 0.05, "z": 0.14, "st": 3, "color": "#E3D9C0", "rough": 0.85, "windows": {"to": 0.85, "from": 0.2, "glow": 0.2, "color": "glassWarm"}}, {"d": 1.9, "h": 0.4, "k": "box", "w": 0.56, "x": -1.06, "y": 0.05, "z": 0.14, "st": 3, "color": "#E3D9C0", "rough": 0.85, "windows": {"to": 0.85, "from": 0.2, "glow": 0.2, "color": "glassWarm"}}, {"d": 0.68, "h": 0.38, "k": "box", "w": 1.46, "y": 0.47, "z": -0.7, "st": 4, "color": "#E3D9C0", "rough": 0.85, "windows": {"to": 0.85, "from": 0.2, "glow": 0.22, "color": "glassWarm"}}, {"d": 1.86, "h": 0.36, "k": "box", "w": 0.52, "x": 1.06, "y": 0.45, "z": 0.14, "st": 4, "color": "#E3D9C0", "rough": 0.85, "windows": {"to": 0.85, "from": 0.2, "glow": 0.22, "color": "glassWarm"}}, {"d": 1.86, "h": 0.36, "k": "box", "w": 0.52, "x": -1.06, "y": 0.45, "z": 0.14, "st": 4, "color": "#E3D9C0", "rough": 0.85, "windows": {"to": 0.85, "from": 0.2, "glow": 0.22, "color": "glassWarm"}}, {"d": 0.78, "h": 0.05, "k": "box", "w": 1.56, "y": 0.85, "z": -0.7, "st": 4, "color": "#CFC3A6", "rough": 0.8}, {"d": 0.8, "h": 0.36, "k": "box", "w": 0.72, "y": 0.9, "z": -0.66, "st": 5, "color": "#E3D9C0", "rough": 0.85, "windows": {"to": 0.9, "from": 0.15, "glow": 0.24, "color": "glassWarm"}}, {"d": 0.09, "h": 0.34, "k": "box", "w": 0.09, "x": -0.3, "y": 0.9, "z": -0.28, "st": 5, "color": "#CFC3A6", "rough": 0.85}, {"d": 0.09, "h": 0.34, "k": "box", "w": 0.09, "x": -0.18, "y": 0.9, "z": -0.28, "st": 5, "color": "#CFC3A6", "rough": 0.85}, {"d": 0.09, "h": 0.34, "k": "box", "w": 0.09, "x": -0.059999999999999984, "y": 0.9, "z": -0.28, "st": 5, "color": "#CFC3A6", "rough": 0.85}, {"d": 0.09, "h": 0.34, "k": "box", "w": 0.09, "x": 0.059999999999999984, "y": 0.9, "z": -0.28, "st": 5, "color": "#CFC3A6", "rough": 0.85}, {"d": 0.09, "h": 0.34, "k": "box", "w": 0.09, "x": 0.18000000000000002, "y": 0.9, "z": -0.28, "st": 5, "color": "#CFC3A6", "rough": 0.85}, {"d": 0.09, "h": 0.34, "k": "box", "w": 0.09, "x": 0.3, "y": 0.9, "z": -0.28, "st": 5, "color": "#CFC3A6", "rough": 0.85}, {"d": 0.86, "h": 0.18, "k": "box", "w": 0.8, "y": 1.26, "z": -0.66, "st": 6, "color": "#4B5560", "rough": 0.85}, {"d": 0.58, "h": 0.14, "k": "box", "w": 0.52, "y": 1.44, "z": -0.66, "st": 6, "color": "#4B5560", "rough": 0.85}, {"d": 1.9, "h": 0.06, "k": "box", "w": 0.56, "x": 1.06, "y": 0.81, "z": 0.14, "st": 6, "color": "#4B5560", "rough": 0.85}, {"d": 1.9, "h": 0.06, "k": "box", "w": 0.56, "x": -1.06, "y": 0.81, "z": 0.14, "st": 6, "color": "#4B5560", "rough": 0.85}, {"d": 0.74, "h": 0.06, "k": "box", "w": 1.52, "y": 0.85, "z": -0.7, "st": 6, "color": "#4B5560", "rough": 0.85}, {"d": 0.84, "k": "pool", "w": 0.44, "y": 0.05, "z": 1, "st": 7, "color": "water"}, {"d": 0.8, "h": 0.03, "k": "box", "w": 0.5, "x": 0.72, "y": 0.06, "z": 1.06, "st": 7, "color": "#3C6B3E", "rough": 1}, {"d": 0.8, "h": 0.03, "k": "box", "w": 0.5, "x": -0.72, "y": 0.06, "z": 1.06, "st": 7, "color": "#3C6B3E", "rough": 1}, {"d": 0.12, "h": 0.2, "k": "box", "w": 0.12, "x": 1.18, "y": 0.05, "z": 0, "st": 7, "color": "#3C6B3E", "rough": 1}, {"d": 0.12, "h": 0.2, "k": "box", "w": 0.12, "x": 0.5900000000000001, "y": 0.05, "z": 1.0219099764656374, "st": 7, "color": "#3C6B3E", "rough": 1}, {"d": 0.12, "h": 0.2, "k": "box", "w": 0.12, "x": -0.5899999999999997, "y": 0.05, "z": 1.0219099764656376, "st": 7, "color": "#3C6B3E", "rough": 1}, {"d": 0.12, "h": 0.2, "k": "box", "w": 0.12, "x": -1.18, "y": 0.05, "z": 0.00000000000000014450832229938768, "st": 7, "color": "#3C6B3E", "rough": 1}, {"d": 0.12, "h": 0.2, "k": "box", "w": 0.12, "x": -0.5900000000000005, "y": 0.05, "z": -1.0219099764656374, "st": 7, "color": "#3C6B3E", "rough": 1}, {"d": 0.12, "h": 0.2, "k": "box", "w": 0.12, "x": 0.5900000000000001, "y": 0.05, "z": -1.0219099764656374, "st": 7, "color": "#3C6B3E", "rough": 1}, {"d": 0.2, "h": 0.05, "k": "box", "w": 0.9, "y": 0.05, "z": 0.44, "st": 7, "color": "#C6BCA6", "rough": 0.95}, {"d": 0.9, "h": 0.05, "k": "box", "w": 0.84, "y": 1.24, "z": -0.66, "st": 8, "color": "#C9A227", "metal": 0.6, "rough": 0.4}, {"d": 0.05, "h": 0.26, "k": "box", "w": 0.05, "y": 1.56, "z": -0.66, "st": 8, "color": "#C9A227", "emissive": true}, {"d": 0.08, "h": 0.26, "k": "box", "w": 0.08, "x": 0.3, "y": 0.05, "z": 1.44, "st": 8, "color": "#C9A227", "metal": 0.6, "rough": 0.4}, {"d": 0.08, "h": 0.26, "k": "box", "w": 0.08, "x": -0.3, "y": 0.05, "z": 1.44, "st": 8, "color": "#C9A227", "metal": 0.6, "rough": 0.4}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-0.6, 0.12, 1.2], "glow": 0.75, "color": "glassWarm"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-0.36, 0.12, 1.2], "glow": 0.75, "color": "glassWarm"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [-0.12, 0.12, 1.2], "glow": 0.75, "color": "glassWarm"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [0.12, 0.12, 1.2], "glow": 0.75, "color": "glassWarm"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [0.36, 0.12, 1.2], "glow": 0.75, "color": "glassWarm"}, {"h": 0.09, "k": "panel", "w": 0.09, "st": 8, "pos": [0.6, 0.12, 1.2], "glow": 0.75, "color": "glassWarm"}]	\N	262	2026-08-03 01:12:42.379398	2026-08-08 01:48:25.431501
269	lm_giza_pyramids	대피라미드 군	LANDMARK	LANDMARK	0	f	2.940	2.920	1.610	[{"d": 2.9, "h": 0.05, "k": "box", "w": 2.9, "y": 0, "st": 1, "color": "#CBB27E", "rough": 1}, {"d": 1.8, "h": 0.03, "k": "box", "w": 1.8, "x": -0.3, "y": 0.05, "z": -0.3, "st": 1, "color": "#C6B182", "rough": 1}, {"d": 1.7, "h": 0.16, "k": "box", "w": 1.7, "y": 0.05, "st": 2, "color": "#D9C79A", "rough": 0.9}, {"d": 1.2999999999999998, "h": 0.16, "k": "box", "w": 1.2999999999999998, "y": 0.21000000000000002, "st": 2, "color": "#D9C79A", "rough": 0.9}, {"d": 0.8999999999999999, "h": 0.16, "k": "box", "w": 0.8999999999999999, "y": 0.37, "st": 2, "color": "#D9C79A", "rough": 0.9}, {"d": 1.34, "k": "roof", "w": 1.34, "y": 0.53, "st": 3, "type": "pyramid", "color": "#D9C79A", "height": 0.95}, {"d": 0.98, "h": 0.12, "k": "box", "w": 0.98, "x": 1, "y": 0.05, "z": 0.72, "st": 4, "color": "#C6B182", "rough": 1}, {"d": 0.8, "h": 0.5, "k": "box", "w": 0.8, "x": 1, "y": 0.17, "z": 0.72, "st": 4, "color": "#C6B182", "rough": 1}, {"d": 0.5, "h": 0.34, "k": "box", "w": 0.5, "x": 1, "y": 0.67, "z": 0.72, "st": 4, "color": "#C6B182", "rough": 1}, {"d": 0.22, "h": 0.2, "k": "box", "w": 0.22, "x": 1, "y": 1.01, "z": 0.72, "st": 4, "color": "#C6B182", "rough": 1}, {"d": 0.56, "h": 0.3, "k": "box", "w": 0.56, "x": -1.06, "y": 0.05, "z": 0.9, "st": 5, "color": "#C6B182", "rough": 1}, {"d": 0.34, "h": 0.24, "k": "box", "w": 0.34, "x": -1.06, "y": 0.35, "z": 0.9, "st": 5, "color": "#C6B182", "rough": 1}, {"d": 0.14, "h": 0.12, "k": "box", "w": 0.14, "x": -1.06, "y": 0.59, "z": 0.9, "st": 5, "color": "#C6B182", "rough": 1}, {"d": 0.2, "h": 0.16, "k": "box", "w": 0.2, "x": 0.5, "y": 0.05, "z": 1.24, "st": 5, "color": "#C6B182", "rough": 1}, {"d": 0.2, "h": 0.16, "k": "box", "w": 0.2, "x": -0.5, "y": 0.05, "z": 1.24, "st": 5, "color": "#C6B182", "rough": 1}, {"d": 0.26, "h": 0.18, "k": "box", "w": 0.7, "x": 0.1, "y": 0.05, "z": 1.16, "st": 6, "color": "#D9C79A", "rough": 1}, {"d": 0.24, "h": 0.24, "k": "box", "w": 0.2, "x": 0.46, "y": 0.23, "z": 1.16, "st": 6, "color": "#D9C79A", "rough": 1}, {"d": 0.2, "h": 0.1, "k": "box", "w": 0.16, "x": 0.56, "y": 0.31, "z": 1.16, "st": 6, "color": "#D9B04A", "rough": 0.8}, {"d": 0.4, "h": 0.22, "k": "box", "w": 0.5, "x": -0.66, "y": 0.05, "z": 1.2, "st": 6, "color": "#C6B182", "rough": 1}, {"d": 1.1, "h": 0.03, "k": "box", "w": 0.36, "x": 0.1, "y": 0.05, "z": 0.5, "st": 7, "color": "#D9C79A", "rough": 1}, {"d": 0.1, "h": 0.5, "k": "box", "w": 0.1, "x": 0.42, "y": 0.05, "z": 1.42, "st": 7, "color": "#D9C79A", "rough": 0.95}, {"d": 0.1, "h": 0.5, "k": "box", "w": 0.1, "x": -0.42, "y": 0.05, "z": 1.42, "st": 7, "color": "#D9C79A", "rough": 0.95}, {"d": 0.05, "h": 0.12, "k": "box", "w": 0.05, "x": 0.42, "y": 0.55, "z": 1.42, "st": 7, "color": "#D9B04A", "metal": 0.5, "rough": 0.5}, {"d": 0.05, "h": 0.12, "k": "box", "w": 0.05, "x": -0.42, "y": 0.55, "z": 1.42, "st": 7, "color": "#D9B04A", "metal": 0.5, "rough": 0.5}, {"d": 0.22, "h": 0.1, "k": "box", "w": 0.22, "x": -1.3, "y": 0.05, "z": -0.9, "st": 7, "color": "#C6B182", "rough": 1}, {"d": 0.3, "k": "roof", "w": 0.3, "y": 1.36, "st": 8, "type": "pyramid", "color": "#D9B04A", "height": 0.22}, {"d": 0.1, "h": 0.1, "k": "box", "w": 0.1, "x": 1, "y": 1.21, "z": 0.72, "st": 8, "color": "#D9B04A", "metal": 0.6, "rough": 0.4}, {"h": 0.16, "k": "polyPrism", "r": 0.07, "x": 1.06, "y": 0.05, "z": 0, "st": 8, "color": "#6E6A62", "rough": 0.9, "sides": 6}, {"h": 0.14, "k": "panel", "w": 0.14, "st": 8, "pos": [1.06, 0.26, 0], "glow": 1, "rotY": 1.5707963267948966, "color": "accent"}, {"h": 0.16, "k": "polyPrism", "r": 0.07, "x": 0.5300000000000001, "y": 0.05, "z": 0.9179869280115049, "st": 8, "color": "#6E6A62", "rough": 0.9, "sides": 6}, {"h": 0.14, "k": "panel", "w": 0.14, "st": 8, "pos": [0.5300000000000001, 0.26, 0.9179869280115049], "glow": 1, "rotY": 0.5235987755982989, "color": "accent"}, {"h": 0.16, "k": "polyPrism", "r": 0.07, "x": -0.5299999999999998, "y": 0.05, "z": 0.917986928011505, "st": 8, "color": "#6E6A62", "rough": 0.9, "sides": 6}, {"h": 0.14, "k": "panel", "w": 0.14, "st": 8, "pos": [-0.5299999999999998, 0.26, 0.917986928011505], "glow": 1, "rotY": -0.5235987755982987, "color": "accent"}, {"h": 0.16, "k": "polyPrism", "r": 0.07, "x": -1.06, "y": 0.05, "z": 0.00000000000000012981256070961945, "st": 8, "color": "#6E6A62", "rough": 0.9, "sides": 6}, {"h": 0.14, "k": "panel", "w": 0.14, "st": 8, "pos": [-1.06, 0.26, 0.00000000000000012981256070961945], "glow": 1, "rotY": -1.5707963267948966, "color": "accent"}, {"h": 0.16, "k": "polyPrism", "r": 0.07, "x": -0.5300000000000005, "y": 0.05, "z": -0.9179869280115048, "st": 8, "color": "#6E6A62", "rough": 0.9, "sides": 6}, {"h": 0.14, "k": "panel", "w": 0.14, "st": 8, "pos": [-0.5300000000000005, 0.26, -0.9179869280115048], "glow": 1, "rotY": -2.617993877991494, "color": "accent"}, {"h": 0.16, "k": "polyPrism", "r": 0.07, "x": 0.5300000000000001, "y": 0.05, "z": -0.9179869280115049, "st": 8, "color": "#6E6A62", "rough": 0.9, "sides": 6}, {"h": 0.14, "k": "panel", "w": 0.14, "st": 8, "pos": [0.5300000000000001, 0.26, -0.9179869280115049], "glow": 1, "rotY": -3.6651914291880923, "color": "accent"}]	\N	268	2026-08-03 01:12:42.389406	2026-08-08 01:48:25.432159
261	lm_triumph_arch	개선문 광장	LANDMARK	LANDMARK	0	f	2.920	2.920	2.230	[{"h": 0.05, "k": "cyl", "y": 0, "rb": 1.46, "rt": 1.46, "st": 1, "seg": 24, "color": "#A9A79E"}, {"h": 0.02, "k": "cyl", "y": 0.05, "rb": 0.92, "rt": 0.92, "st": 1, "seg": 24, "color": "#C3BCAA"}, {"d": 1.24, "h": 0.07, "k": "box", "w": 1.5, "y": 0.05, "st": 2, "color": "#CFC6B4", "rough": 0.9}, {"d": 1.04, "h": 0.07, "k": "box", "w": 1.3, "y": 0.12000000000000001, "st": 2, "color": "#CFC6B4", "rough": 0.9}, {"d": 1, "h": 1.2, "k": "arch", "w": 0.6, "y": 0.19, "st": 3, "color": "#DED7C9", "thick": 0.32}, {"d": 1.34, "h": 0.66, "k": "arch", "w": 0.34, "y": 0.19, "st": 4, "rotY": 1.5707963267948966, "color": "#DED7C9", "thick": 0.24}, {"d": 1, "h": 1.24, "k": "box", "w": 0.16, "x": 0.55, "y": 0.19, "st": 4, "color": "#EFEAE0", "rough": 0.85}, {"d": 1, "h": 1.24, "k": "box", "w": 0.16, "x": -0.55, "y": 0.19, "st": 4, "color": "#EFEAE0", "rough": 0.85}, {"d": 1.02, "h": 0.44, "k": "box", "w": 1.28, "y": 1.39, "st": 5, "color": "#EFEAE0", "rough": 0.85}, {"d": 1.12, "h": 0.08, "k": "box", "w": 1.4, "y": 1.83, "st": 6, "color": "#DED7C9", "rough": 0.8}, {"d": 0.98, "h": 0.06, "k": "box", "w": 1.24, "y": 1.91, "st": 6, "color": "#4A5058", "rough": 0.85}, {"h": 0.5, "k": "panel", "w": 0.34, "st": 7, "pos": [0.55, 0.66, 0.52], "color": "#CFC6B4"}, {"h": 0.5, "k": "panel", "w": 0.34, "st": 7, "pos": [-0.55, 0.66, 0.52], "color": "#CFC6B4"}, {"h": 0.22, "k": "panel", "w": 0.9, "st": 7, "pos": [0, 1.6, 0.52], "color": "#CFC6B4"}, {"h": 0.22, "k": "panel", "w": 0.9, "st": 7, "pos": [0, 1.6, -0.52], "color": "#CFC6B4"}, {"d": 0.34, "h": 0.02, "k": "box", "w": 0.34, "x": 1.24, "y": 0.05, "z": 0, "st": 7, "color": "#4A5058", "rough": 0.9}, {"d": 0.34, "h": 0.02, "k": "box", "w": 0.34, "x": 0.8768124086713189, "y": 0.05, "z": 0.8768124086713188, "st": 7, "color": "#4A5058", "rough": 0.9}, {"d": 0.34, "h": 0.02, "k": "box", "w": 0.34, "x": 0.0000000000000000759281015471359, "y": 0.05, "z": 1.24, "st": 7, "color": "#4A5058", "rough": 0.9}, {"d": 0.34, "h": 0.02, "k": "box", "w": 0.34, "x": -0.8768124086713188, "y": 0.05, "z": 0.8768124086713189, "st": 7, "color": "#4A5058", "rough": 0.9}, {"d": 0.34, "h": 0.02, "k": "box", "w": 0.34, "x": -1.24, "y": 0.05, "z": 0.0000000000000001518562030942718, "st": 7, "color": "#4A5058", "rough": 0.9}, {"d": 0.34, "h": 0.02, "k": "box", "w": 0.34, "x": -0.8768124086713192, "y": 0.05, "z": -0.8768124086713188, "st": 7, "color": "#4A5058", "rough": 0.9}, {"d": 0.34, "h": 0.02, "k": "box", "w": 0.34, "x": -0.0000000000000002277843046414077, "y": 0.05, "z": -1.24, "st": 7, "color": "#4A5058", "rough": 0.9}, {"d": 0.34, "h": 0.02, "k": "box", "w": 0.34, "x": 0.8768124086713187, "y": 0.05, "z": -0.8768124086713192, "st": 7, "color": "#4A5058", "rough": 0.9}, {"d": 0.1, "h": 0.24, "k": "box", "w": 0.1, "x": 1.02, "y": 0.07, "z": 0, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.24, "k": "box", "w": 0.1, "x": 0.7212489168102786, "y": 0.07, "z": 0.7212489168102785, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.24, "k": "box", "w": 0.1, "x": 0.00000000000000006245698675651501, "y": 0.07, "z": 1.02, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.24, "k": "box", "w": 0.1, "x": -0.7212489168102785, "y": 0.07, "z": 0.7212489168102786, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.24, "k": "box", "w": 0.1, "x": -1.02, "y": 0.07, "z": 0.00000000000000012491397351303002, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.24, "k": "box", "w": 0.1, "x": -0.7212489168102787, "y": 0.07, "z": -0.7212489168102785, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.24, "k": "box", "w": 0.1, "x": -0.00000000000000018737096026954502, "y": 0.07, "z": -1.02, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.24, "k": "box", "w": 0.1, "x": 0.7212489168102784, "y": 0.07, "z": -0.7212489168102787, "st": 7, "color": "bush", "rough": 1}, {"d": 0.24, "h": 0.16, "k": "box", "w": 0.44, "y": 1.97, "st": 8, "color": "#7A6A4F", "metal": 0.5, "rough": 0.5}, {"d": 0.1, "h": 0.2, "k": "box", "w": 0.12, "x": -0.22, "y": 2.03, "st": 8, "color": "#7A6A4F", "metal": 0.5, "rough": 0.5}, {"d": 0.1, "h": 0.2, "k": "box", "w": 0.12, "x": 0.22, "y": 2.03, "st": 8, "color": "#7A6A4F", "metal": 0.5, "rough": 0.5}, {"h": 0.06, "k": "cyl", "y": 0.07, "rb": 0.2, "rt": 0.16, "st": 8, "seg": 12, "color": "#7A6A4F"}, {"h": 0.16, "k": "panel", "w": 0.16, "st": 8, "pos": [0, 0.2, 0], "glow": 1, "color": "accent"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [1.34, 0.1, 0], "glow": 0.7, "rotY": 1.5707963267948966, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [1.0840827724624296, 0.1, 0.7876322380719141], "glow": 0.7, "rotY": 0.9424777960769379, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [0.4140827724624296, 0.1, 1.2744157318355058], "glow": 0.7, "rotY": 0.3141592653589793, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.41408277246242947, 0.1, 1.274415731835506], "glow": 0.7, "rotY": -0.3141592653589793, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-1.0840827724624296, 0.1, 0.7876322380719142], "glow": 0.7, "rotY": -0.9424777960769379, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-1.34, 0.1, 0.00000000000000016410267108574534], "glow": 0.7, "rotY": -1.5707963267948966, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-1.0840827724624296, 0.1, -0.7876322380719138], "glow": 0.7, "rotY": -2.199114857512855, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.41408277246242975, 0.1, -1.2744157318355058], "glow": 0.7, "rotY": -2.827433388230814, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [0.4140827724624293, 0.1, -1.274415731835506], "glow": 0.7, "rotY": -3.4557519189487724, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [1.0840827724624296, 0.1, -0.7876322380719144], "glow": 0.7, "rotY": -4.084070449666731, "color": "glassWarm"}]	\N	260	2026-08-03 01:12:42.376136	2026-08-08 01:48:25.43232
266	lm_iron_tower	격자 철탑	LANDMARK	LANDMARK	0	f	2.900	2.920	5.815	[{"d": 2.9, "h": 0.05, "k": "box", "w": 2.9, "y": 0, "st": 1, "color": "#C3BCAA", "rough": 0.95}, {"d": 0.44, "h": 0.14, "k": "box", "w": 0.44, "x": 0.98, "y": 0.05, "z": 0.98, "st": 1, "color": "concrete", "rough": 0.95}, {"d": 0.44, "h": 0.14, "k": "box", "w": 0.44, "x": -0.98, "y": 0.05, "z": 0.98, "st": 1, "color": "concrete", "rough": 0.95}, {"d": 0.44, "h": 0.14, "k": "box", "w": 0.44, "x": 0.98, "y": 0.05, "z": -0.98, "st": 1, "color": "concrete", "rough": 0.95}, {"d": 0.44, "h": 0.14, "k": "box", "w": 0.44, "x": -0.98, "y": 0.05, "z": -0.98, "st": 1, "color": "concrete", "rough": 0.95}, {"h": 0.9, "k": "lattice", "w": 2.1, "y": 0.19, "st": 2, "color": "#6E5A46", "rungs": 3, "taper": 0.62}, {"d": 1.9, "h": 0.78, "k": "arch", "w": 1.5, "y": 0.19, "st": 3, "color": "#8A7259", "thick": 0.16}, {"d": 1.9, "h": 0.78, "k": "arch", "w": 1.5, "y": 0.19, "st": 3, "rotY": 1.5707963267948966, "color": "#8A7259", "thick": 0.16}, {"d": 1.5, "h": 0.09, "k": "box", "w": 1.5, "y": 1.09, "st": 3, "color": "#8A7259", "metal": 0.35, "rough": 0.6}, {"d": 1.3, "h": 0.22, "k": "box", "w": 1.3, "y": 1.18, "st": 4, "color": "#8A7259", "metal": 0.4, "rough": 0.55, "windows": {"to": 0.85, "from": 0.2, "glow": 0.32, "color": "glassWarm"}}, {"h": 1.1, "k": "lattice", "w": 1.2, "y": 1.4, "st": 4, "color": "#6E5A46", "rungs": 4, "taper": 0.6}, {"d": 0.86, "h": 0.09, "k": "box", "w": 0.86, "y": 2.5, "st": 5, "color": "#8A7259", "metal": 0.35, "rough": 0.6}, {"d": 0.76, "h": 0.2, "k": "box", "w": 0.76, "y": 2.59, "st": 5, "color": "#8A7259", "metal": 0.4, "rough": 0.55, "windows": {"to": 0.85, "from": 0.2, "glow": 0.32, "color": "glassWarm"}}, {"h": 1.3, "k": "lattice", "w": 0.7, "y": 2.79, "st": 5, "color": "#6E5A46", "rungs": 5, "taper": 0.5}, {"d": 0.42, "h": 0.06, "k": "box", "w": 0.42, "y": 4.09, "st": 6, "color": "#8A7259", "metal": 0.35, "rough": 0.6}, {"d": 0.36, "h": 0.22, "k": "box", "w": 0.36, "y": 4.15, "st": 6, "color": "#E3DFD4", "metal": 0.3, "rough": 0.4, "windows": {"to": 0.85, "from": 0.2, "glow": 0.42, "color": "glass"}}, {"h": 0.7, "k": "cyl", "y": 4.37, "rb": 0.12, "rt": 0.05, "st": 6, "seg": 8, "color": "#8A7259"}, {"d": 0.12, "h": 0.24, "k": "box", "w": 0.12, "x": 1.24, "y": 0.05, "z": 0, "st": 7, "color": "bush", "rough": 1}, {"d": 0.12, "h": 0.24, "k": "box", "w": 0.12, "x": 0.6200000000000001, "y": 0.05, "z": 1.0738715006927038, "st": 7, "color": "bush", "rough": 1}, {"d": 0.12, "h": 0.24, "k": "box", "w": 0.12, "x": -0.6199999999999998, "y": 0.05, "z": 1.073871500692704, "st": 7, "color": "bush", "rough": 1}, {"d": 0.12, "h": 0.24, "k": "box", "w": 0.12, "x": -1.24, "y": 0.05, "z": 0.0000000000000001518562030942718, "st": 7, "color": "bush", "rough": 1}, {"d": 0.12, "h": 0.24, "k": "box", "w": 0.12, "x": -0.6200000000000006, "y": 0.05, "z": -1.0738715006927038, "st": 7, "color": "bush", "rough": 1}, {"d": 0.12, "h": 0.24, "k": "box", "w": 0.12, "x": 0.6200000000000001, "y": 0.05, "z": -1.0738715006927038, "st": 7, "color": "bush", "rough": 1}, {"d": 0.24, "h": 0.2, "k": "box", "w": 0.34, "x": 1.12, "y": 0.05, "z": 0.9, "st": 7, "color": "#E3DFD4", "rough": 0.7}, {"d": 0.24, "h": 0.2, "k": "box", "w": 0.34, "x": -1.12, "y": 0.05, "z": 0.9, "st": 7, "color": "#E3DFD4", "rough": 0.7}, {"d": 0.46, "h": 0.02, "k": "box", "w": 1.9, "y": 0.05, "z": 1.24, "st": 7, "color": "#4C7A46", "rough": 1}, {"h": 0.14, "k": "panel", "w": 0.7, "st": 7, "pos": [0, 1, 0.76], "glow": 0.25, "color": "#D9B04A"}, {"h": 0.22, "k": "cyl", "y": 5.07, "rb": 0.075, "rt": 0.028, "st": 8, "seg": 6, "color": "#8A7259"}, {"h": 0.5, "k": "antenna", "y": 5.29, "st": 8}, {"h": 0.3, "k": "panel", "w": 0.3, "st": 8, "pos": [0, 1.28, 0.66], "glow": 0.6, "color": "glassWarm"}, {"h": 0.12, "k": "panel", "w": 0.12, "st": 8, "pos": [0.9, 0.3, 0], "glow": 0.9, "rotY": 1.5707963267948966, "color": "accent"}, {"h": 0.12, "k": "panel", "w": 0.12, "st": 8, "pos": [0.6363961030678928, 0.3, 0.6363961030678927], "glow": 0.9, "rotY": 0.7853981633974483, "color": "accent"}, {"h": 0.12, "k": "panel", "w": 0.12, "st": 8, "pos": [0.000000000000000055109105961630896, 0.3, 0.9], "glow": 0.9, "rotY": 0, "color": "accent"}, {"h": 0.12, "k": "panel", "w": 0.12, "st": 8, "pos": [-0.6363961030678927, 0.3, 0.6363961030678928], "glow": 0.9, "rotY": -0.7853981633974483, "color": "accent"}, {"h": 0.12, "k": "panel", "w": 0.12, "st": 8, "pos": [-0.9, 0.3, 0.00000000000000011021821192326179], "glow": 0.9, "rotY": -1.5707963267948966, "color": "accent"}, {"h": 0.12, "k": "panel", "w": 0.12, "st": 8, "pos": [-0.636396103067893, 0.3, -0.6363961030678927], "glow": 0.9, "rotY": -2.356194490192345, "color": "accent"}, {"h": 0.12, "k": "panel", "w": 0.12, "st": 8, "pos": [-0.00000000000000016532731788489269, 0.3, -0.9], "glow": 0.9, "rotY": -3.141592653589793, "color": "accent"}, {"h": 0.12, "k": "panel", "w": 0.12, "st": 8, "pos": [0.6363961030678926, 0.3, -0.636396103067893], "glow": 0.9, "rotY": -3.9269908169872414, "color": "accent"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [0.5, 2.4, 0], "glow": 0.85, "rotY": 1.5707963267948966, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [0.00000000000000003061616997868383, 2.4, 0.5], "glow": 0.85, "rotY": 0, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.5, 2.4, 0.00000000000000006123233995736766], "glow": 0.85, "rotY": -1.5707963267948966, "color": "glassWarm"}, {"h": 0.1, "k": "panel", "w": 0.1, "st": 8, "pos": [-0.00000000000000009184850993605148, 2.4, -0.5], "glow": 0.85, "rotY": -3.141592653589793, "color": "glassWarm"}]	\N	265	2026-08-03 01:12:42.3857	2026-08-08 01:48:25.432516
267	lm_spire_tower	삼엽 초고층	LANDMARK	LANDMARK	0	f	2.900	2.920	6.825	[{"d": 2.9, "h": 0.05, "k": "box", "w": 2.9, "y": 0, "st": 1, "color": "#C3BCAA", "rough": 0.95}, {"d": 0.8, "k": "pool", "w": 2.2, "y": 0.05, "z": 1, "st": 1, "color": "water"}, {"d": 1.5, "h": 0.3, "k": "box", "w": 2, "y": 0.05, "z": -0.4, "st": 2, "color": "#B9C3CC", "metal": 0.3, "rough": 0.5, "windows": {"to": 0.85, "from": 0.2, "glow": 0.3, "color": "#8FB4D0"}}, {"d": 1.6, "h": 0.05, "k": "box", "w": 2.1, "y": 0.35, "z": -0.4, "st": 2, "color": "#E3DFD4", "rough": 0.6}, {"h": 1.2, "k": "polyPrism", "r": 0.62, "y": 0.4, "st": 3, "color": "#8FB4D0", "metal": 0.6, "rough": 0.2, "sides": 6}, {"d": 0.44, "h": 1.2, "k": "box", "w": 0.44, "x": 0.5, "y": 0.4, "z": 0, "st": 3, "color": "#6E97B8", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.95, "from": 0.08, "glow": 0.4, "color": "#8FB4D0"}}, {"d": 0.44, "h": 1.2, "k": "box", "w": 0.44, "x": -0.2499999999999999, "y": 0.4, "z": 0.43301270189221935, "st": 3, "color": "#6E97B8", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.95, "from": 0.08, "glow": 0.4, "color": "#8FB4D0"}}, {"d": 0.44, "h": 1.2, "k": "box", "w": 0.44, "x": -0.2500000000000002, "y": 0.4, "z": -0.43301270189221924, "st": 3, "color": "#6E97B8", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.95, "from": 0.08, "glow": 0.4, "color": "#8FB4D0"}}, {"h": 1.1, "k": "polyPrism", "r": 0.52, "y": 1.6, "st": 4, "color": "#8FB4D0", "metal": 0.6, "rough": 0.2, "sides": 6}, {"d": 0.34, "h": 1.1, "k": "box", "w": 0.34, "x": 0.4, "y": 1.6, "z": 0, "st": 4, "color": "#6E97B8", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.95, "from": 0.08, "glow": 0.4, "color": "#8FB4D0"}}, {"d": 0.34, "h": 1.1, "k": "box", "w": 0.34, "x": -0.19999999999999993, "y": 1.6, "z": 0.3464101615137755, "st": 4, "color": "#6E97B8", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.95, "from": 0.08, "glow": 0.4, "color": "#8FB4D0"}}, {"d": 0.34, "h": 1.1, "k": "box", "w": 0.34, "x": -0.20000000000000018, "y": 1.6, "z": -0.3464101615137754, "st": 4, "color": "#6E97B8", "metal": 0.6, "rough": 0.2, "windows": {"to": 0.95, "from": 0.08, "glow": 0.4, "color": "#8FB4D0"}}, {"h": 1, "k": "polyPrism", "r": 0.42, "y": 2.7, "st": 5, "color": "#8FB4D0", "metal": 0.6, "rough": 0.2, "sides": 6}, {"d": 0.26, "h": 0.8, "k": "box", "w": 0.26, "x": 0.3, "y": 2.7, "z": 0, "st": 5, "color": "#6E97B8", "metal": 0.6, "rough": 0.2}, {"d": 0.26, "h": 0.8, "k": "box", "w": 0.26, "x": -0.14999999999999994, "y": 2.7, "z": 0.2598076211353316, "st": 5, "color": "#6E97B8", "metal": 0.6, "rough": 0.2}, {"d": 0.26, "h": 0.8, "k": "box", "w": 0.26, "x": -0.15000000000000013, "y": 2.7, "z": -0.2598076211353315, "st": 5, "color": "#6E97B8", "metal": 0.6, "rough": 0.2}, {"h": 0.9, "k": "polyPrism", "r": 0.3, "y": 3.7, "st": 6, "color": "#8FB4D0", "metal": 0.6, "rough": 0.2, "sides": 6}, {"h": 0.12, "k": "polyPrism", "r": 0.36, "y": 4.24, "st": 6, "color": "#B9C3CC", "metal": 0.5, "rough": 0.4, "sides": 6}, {"h": 0.6, "k": "polyPrism", "r": 0.2, "y": 4.6, "st": 6, "color": "#6E97B8", "metal": 0.6, "rough": 0.2, "sides": 6}, {"h": 1, "k": "cyl", "y": 5.2, "rb": 0.11, "rt": 0.02, "st": 7, "seg": 8, "color": "#B9C3CC"}, {"d": 0.3, "h": 0.04, "k": "box", "w": 1, "y": 0.32, "z": 0.42, "st": 7, "color": "#B9C3CC", "metal": 0.5, "rough": 0.4}, {"d": 0.1, "h": 0.22, "k": "box", "w": 0.1, "x": 1.22, "y": 0.05, "z": 0, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.22, "k": "box", "w": 0.1, "x": 0.6100000000000001, "y": 0.05, "z": 1.0565509926170151, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.22, "k": "box", "w": 0.1, "x": -0.6099999999999998, "y": 0.05, "z": 1.0565509926170151, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.22, "k": "box", "w": 0.1, "x": -1.22, "y": 0.05, "z": 0.00000000000000014940690949597708, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.22, "k": "box", "w": 0.1, "x": -0.6100000000000005, "y": 0.05, "z": -1.056550992617015, "st": 7, "color": "bush", "rough": 1}, {"d": 0.1, "h": 0.22, "k": "box", "w": 0.1, "x": 0.6100000000000001, "y": 0.05, "z": -1.0565509926170151, "st": 7, "color": "bush", "rough": 1}, {"h": 0.2, "k": "cyl", "y": 6.2, "rb": 0.055, "rt": 0.014, "st": 8, "seg": 8, "color": "#B9C3CC"}, {"h": 0.4, "k": "antenna", "y": 6.4, "st": 8}, {"h": 1, "k": "panel", "w": 0.3, "st": 8, "pos": [0.8, 1, 0], "glow": 0.55, "rotY": 1.5707963267948966, "color": "#8FB4D0"}, {"h": 1, "k": "panel", "w": 0.3, "st": 8, "pos": [-0.39999999999999986, 1, 0.692820323027551], "glow": 0.55, "rotY": -0.5235987755982987, "color": "#8FB4D0"}, {"h": 1, "k": "panel", "w": 0.3, "st": 8, "pos": [-0.40000000000000036, 1, -0.6928203230275508], "glow": 0.55, "rotY": -2.617993877991494, "color": "#8FB4D0"}, {"h": 0.12, "k": "panel", "w": 0.12, "st": 8, "pos": [1.0825317547305484, 0.12, 0.6999999999999998], "glow": 0.85, "rotY": 1.0471975511965979, "color": "glassWarm"}, {"h": 0.12, "k": "panel", "w": 0.12, "st": 8, "pos": [0.00000000000000007654042494670958, 0.12, 1.4], "glow": 0.85, "rotY": 0, "color": "glassWarm"}, {"h": 0.12, "k": "panel", "w": 0.12, "st": 8, "pos": [-1.0825317547305482, 0.12, 0.7000000000000004], "glow": 0.85, "rotY": -1.0471975511965974, "color": "glassWarm"}, {"h": 0.12, "k": "panel", "w": 0.12, "st": 8, "pos": [-1.0825317547305486, 0.12, -0.6999999999999996], "glow": 0.85, "rotY": -2.0943951023931953, "color": "glassWarm"}, {"h": 0.12, "k": "panel", "w": 0.12, "st": 8, "pos": [-0.0000000000000002296212748401287, 0.12, -1.4], "glow": 0.85, "rotY": -3.141592653589793, "color": "glassWarm"}, {"h": 0.12, "k": "panel", "w": 0.12, "st": 8, "pos": [1.0825317547305486, 0.12, -0.6999999999999995], "glow": 0.85, "rotY": -4.188790204786391, "color": "glassWarm"}]	\N	266	2026-08-03 01:12:42.386993	2026-08-08 01:48:25.432721
\.


--
-- Data for Name: domain; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.domain (id, sheet_id, title, "position", subject_count, created_at) FROM stdin;
4	1	관계	3	0	2026-08-03 01:40:30.954852
5	1	재정	4	0	2026-08-03 01:40:30.96335
6	1	취미	5	0	2026-08-03 01:40:30.972051
10	2	커리어	1	0	2026-08-03 01:43:07.485922
241	31	알고리즘	0	0	2026-08-10 02:23:22.456586
12	2	관계	3	0	2026-08-03 01:43:07.500232
14	2	취미	5	0	2026-08-03 01:43:07.515414
242	31	백엔드	1	0	2026-08-10 02:23:22.475236
243	31	프론트엔드	2	0	2026-08-10 02:23:22.486638
244	31	인프라	3	0	2026-08-10 02:23:22.496557
245	31	CS 기초	4	0	2026-08-10 02:23:22.507129
246	31	협업	5	0	2026-08-10 02:23:22.517459
247	31	기록	6	0	2026-08-10 02:23:22.527566
248	31	건강	7	0	2026-08-10 02:23:22.537238
249	32	운동	0	0	2026-08-10 02:23:22.790873
250	32	식습관	1	0	2026-08-10 02:23:22.800544
251	32	수면	2	0	2026-08-10 02:23:22.80991
252	32	독서	3	0	2026-08-10 02:23:22.818973
253	32	정리	4	0	2026-08-10 02:23:22.828942
254	32	재정	5	0	2026-08-10 02:23:22.838011
255	32	관계	6	0	2026-08-10 02:23:22.848663
256	32	취미	7	0	2026-08-10 02:23:22.857622
257	33	알고리즘	0	0	2026-08-10 02:23:23.0841
16	2	환경	7	1	2026-08-03 01:43:07.532017
42	6	지적 성장	1	0	2026-08-04 04:01:28.409422
43	6	커리어	2	0	2026-08-04 04:01:28.420215
44	6	자산 관리	3	0	2026-08-04 04:01:28.431114
45	6	취미 & 휴식	4	0	2026-08-04 04:01:28.442379
46	6	미래 계획	5	0	2026-08-04 04:01:28.453252
47	6	루틴	6	0	2026-08-04 04:01:28.463445
48	6	마인드셋	7	0	2026-08-04 04:01:28.473458
258	33	백엔드	1	0	2026-08-10 02:23:23.093382
259	33	프론트엔드	2	0	2026-08-10 02:23:23.101907
260	33	인프라	3	0	2026-08-10 02:23:23.111349
261	33	CS 기초	4	0	2026-08-10 02:23:23.119561
262	33	협업	5	0	2026-08-10 02:23:23.12669
263	33	기록	6	0	2026-08-10 02:23:23.134071
264	33	건강	7	0	2026-08-10 02:23:23.143379
265	34	운동	0	0	2026-08-10 02:23:23.267922
266	34	식습관	1	0	2026-08-10 02:23:23.275199
267	34	수면	2	0	2026-08-10 02:23:23.28227
268	34	독서	3	0	2026-08-10 02:23:23.289178
269	34	정리	4	0	2026-08-10 02:23:23.296093
270	34	재정	5	0	2026-08-10 02:23:23.303324
271	34	관계	6	0	2026-08-10 02:23:23.310266
272	34	취미	7	0	2026-08-10 02:23:23.317183
273	35	알고리즘	0	0	2026-08-10 02:23:23.487515
73	10	운동	0	0	2026-08-04 04:57:12.035272
74	10	공부	1	0	2026-08-04 04:57:12.045674
75	10	데이터	2	0	2026-08-04 04:57:12.055498
76	10	코딩	3	0	2026-08-04 04:57:12.068419
77	10	ncs	4	0	2026-08-04 04:57:12.075558
78	10	필기	5	0	2026-08-04 04:57:12.082769
79	10	면접	6	0	2026-08-04 04:57:12.09062
80	10	포폴	7	0	2026-08-04 04:57:12.097511
98	13	.	1	0	2026-08-04 07:11:36.07041
274	35	백엔드	1	0	2026-08-10 02:23:23.494963
99	13	.	2	0	2026-08-04 07:11:36.075372
15	2	멘탈	6	2	2026-08-03 01:43:07.523164
13	2	재정	4	1	2026-08-03 01:43:07.507947
97	13	.	0	0	2026-08-04 07:11:36.064161
100	13	.	3	0	2026-08-04 07:11:36.079888
101	13	.	4	0	2026-08-04 07:11:36.084418
102	13	.	5	0	2026-08-04 07:11:36.089298
103	13	.	6	0	2026-08-04 07:11:36.094663
104	13	.	7	0	2026-08-04 07:11:36.099697
2	1	커리어	1	5	2026-08-03 01:40:30.936634
275	35	프론트엔드	2	0	2026-08-10 02:23:23.500815
276	35	인프라	3	0	2026-08-10 02:23:23.506861
277	35	CS 기초	4	0	2026-08-10 02:23:23.513655
278	35	협업	5	0	2026-08-10 02:23:23.520391
279	35	기록	6	0	2026-08-10 02:23:23.526504
280	35	건강	7	0	2026-08-10 02:23:23.534354
281	36	운동	0	0	2026-08-10 02:23:23.638057
282	36	식습관	1	0	2026-08-10 02:23:23.643979
41	6	신체 건강	0	1	2026-08-04 04:01:28.389587
9	2	건강	0	3	2026-08-03 01:43:07.477205
283	36	수면	2	0	2026-08-10 02:23:23.649757
8	1	환경	7	1	2026-08-03 01:40:30.9886
7	1	멘탈	6	2	2026-08-03 01:40:30.980418
1	1	건강	0	3	2026-08-03 01:40:30.920832
3	1	학습	2	5	2026-08-03 01:40:30.945724
284	36	독서	3	0	2026-08-10 02:23:23.655371
285	36	정리	4	0	2026-08-10 02:23:23.661955
286	36	재정	5	0	2026-08-10 02:23:23.670404
287	36	관계	6	0	2026-08-10 02:23:23.676317
288	36	취미	7	0	2026-08-10 02:23:23.68181
201	26	취업 준비	0	0	2026-08-07 12:27:02.316041
202	26	면접 준비	1	0	2026-08-07 12:27:02.323439
203	26	건강	2	0	2026-08-07 12:27:02.328645
204	26	5	3	0	2026-08-07 12:27:02.333536
205	26	1	4	0	2026-08-07 12:27:02.338469
206	26	4	5	0	2026-08-07 12:27:02.343447
207	26	321	6	0	2026-08-07 12:27:02.348212
208	26	2	7	0	2026-08-07 12:27:02.352959
209	27	독서	0	0	2026-08-07 16:27:21.397086
169	22	건강	0	0	2026-08-06 05:24:47.233753
170	22	학습	1	0	2026-08-06 05:24:47.239753
171	22	돈모으기	2	0	2026-08-06 05:24:47.244473
210	27	건강	1	0	2026-08-07 16:27:21.405103
172	22	취미	3	0	2026-08-06 05:24:47.248521
173	22	여유로워지기	4	0	2026-08-06 05:24:47.25296
174	22	취준	5	0	2026-08-06 05:24:47.257367
175	22	인간관계	6	0	2026-08-06 05:24:47.262123
211	27	여행	2	0	2026-08-07 16:27:21.410068
212	27	0	3	0	2026-08-07 16:27:21.415011
213	27	55	4	0	2026-08-07 16:27:21.419507
214	27	442142	5	0	2026-08-07 16:27:21.424206
215	27	125	6	0	2026-08-07 16:27:21.429366
216	27	gg	7	0	2026-08-07 16:27:21.434132
176	22	할거없다	7	8	2026-08-06 05:24:47.266906
11	2	학습	2	1	2026-08-03 01:43:07.493136
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	create auth schema	SQL	V1__create_auth_schema.sql	1167274135	mandarin_user	2026-08-03 01:12:34.769396	59	t
2	2	create building catalog	SQL	V2__create_building_catalog.sql	1668792779	mandarin_user	2026-08-03 01:12:34.883483	37	t
3	3	create friend schema	SQL	V3__create_friend_schema.sql	-2147198783	mandarin_user	2026-08-03 01:12:34.950115	25	t
5	5	create user village	SQL	V5__create_user_village.sql	-963819135	mandarin_user	2026-08-03 01:12:35.047857	10	t
6	6	create item spot	SQL	V6__create_item_spot.sql	-1546989725	mandarin_user	2026-08-03 01:12:35.068639	15	t
7	7	create subject log	SQL	V7__create_subject_log.sql	527913018	mandarin_user	2026-08-03 01:12:35.092862	14	t
8	8	create group schema	SQL	V8__create_group_schema.sql	-2019788262	mandarin_user	2026-08-03 01:12:35.115146	60	t
4	4	create domain schema	SQL	V4__create_domain_schema.sql	-1935852731	mandarin_user	2026-08-03 01:12:34.990024	44	t
9	9	create reward claim	SQL	V9__create_reward_claim.sql	-352647918	mandarin_user	2026-08-06 09:05:48.19853	40	t
\.


--
-- Data for Name: friends; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.friends (id, user_id1, user_id2, created_at) FROM stdin;
1	2	6	2026-08-04 04:05:15.249844
2	4	6	2026-08-04 04:11:18.446975
3	1	3	2026-08-04 05:25:09.939577
4	1	6	2026-08-04 05:25:10.662723
5	1	4	2026-08-04 05:25:10.999297
6	3	6	2026-08-04 05:30:42.755716
7	7	8	2026-08-04 06:04:08.632948
8	5	8	2026-08-04 06:04:09.421714
9	2	8	2026-08-04 06:04:09.872961
10	1	8	2026-08-04 06:04:10.302178
14	13	14	2026-08-10 02:23:23.778591
15	13	15	2026-08-10 02:23:23.784607
16	14	15	2026-08-10 02:23:23.788932
17	4	8	2026-08-10 10:53:08.065913
\.


--
-- Data for Name: group_request; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_request (id, group_id, creator_id, receiver_id, progress, created_at) FROM stdin;
\.


--
-- Data for Name: group_sheet; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.group_sheet (id, domain_id1, domain_id2, domain_id3, domain_id4, domain_id5, domain_id6, domain_id7, domain_id8, created_at) FROM stdin;
\.


--
-- Data for Name: groups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.groups (id, title, creator_id, group_sheet_id, user_id1, user_id2, user_id3, inven_id, created_at) FROM stdin;
\.


--
-- Data for Name: item_spot; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.item_spot (id, sheet_id, inven_id, domain_position, item_position, dir, created_at) FROM stdin;
2	1	\N	1	2	DEG_0	2026-08-03 01:40:30.999467
3	1	\N	1	3	DEG_0	2026-08-03 01:40:31.000367
4	1	\N	1	4	DEG_0	2026-08-03 01:40:31.001365
5	1	\N	1	5	DEG_0	2026-08-03 01:40:31.002294
6	1	\N	1	6	DEG_0	2026-08-03 01:40:31.00325
7	1	\N	1	7	DEG_0	2026-08-03 01:40:31.004154
8	1	\N	1	8	DEG_0	2026-08-03 01:40:31.005003
9	1	\N	1	9	DEG_0	2026-08-03 01:40:31.00585
10	1	\N	2	1	DEG_0	2026-08-03 01:40:31.006662
11	1	\N	2	2	DEG_0	2026-08-03 01:40:31.007447
12	1	\N	2	3	DEG_0	2026-08-03 01:40:31.008215
13	1	\N	2	4	DEG_0	2026-08-03 01:40:31.009037
14	1	\N	2	5	DEG_0	2026-08-03 01:40:31.009905
15	1	\N	2	6	DEG_0	2026-08-03 01:40:31.010682
16	1	\N	2	7	DEG_0	2026-08-03 01:40:31.011515
17	1	\N	2	8	DEG_0	2026-08-03 01:40:31.012306
18	1	\N	2	9	DEG_0	2026-08-03 01:40:31.013239
19	1	\N	3	1	DEG_0	2026-08-03 01:40:31.014095
20	1	\N	3	2	DEG_0	2026-08-03 01:40:31.01486
21	1	\N	3	3	DEG_0	2026-08-03 01:40:31.015644
22	1	\N	3	4	DEG_0	2026-08-03 01:40:31.016502
23	1	\N	3	5	DEG_0	2026-08-03 01:40:31.017266
24	1	\N	3	6	DEG_0	2026-08-03 01:40:31.017999
25	1	\N	3	7	DEG_0	2026-08-03 01:40:31.018815
26	1	\N	3	8	DEG_0	2026-08-03 01:40:31.019631
27	1	\N	3	9	DEG_0	2026-08-03 01:40:31.020459
28	1	\N	4	1	DEG_0	2026-08-03 01:40:31.021324
29	1	\N	4	2	DEG_0	2026-08-03 01:40:31.022313
30	1	\N	4	3	DEG_0	2026-08-03 01:40:31.023172
31	1	\N	4	4	DEG_0	2026-08-03 01:40:31.024085
32	1	\N	4	5	DEG_0	2026-08-03 01:40:31.024886
33	1	\N	4	6	DEG_0	2026-08-03 01:40:31.025666
34	1	\N	4	7	DEG_0	2026-08-03 01:40:31.02643
35	1	\N	4	8	DEG_0	2026-08-03 01:40:31.027257
36	1	\N	4	9	DEG_0	2026-08-03 01:40:31.028031
38	1	\N	6	1	DEG_0	2026-08-03 01:40:31.029754
39	1	\N	6	2	DEG_0	2026-08-03 01:40:31.030684
40	1	\N	6	3	DEG_0	2026-08-03 01:40:31.031507
41	1	\N	6	4	DEG_0	2026-08-03 01:40:31.032348
42	1	\N	6	5	DEG_0	2026-08-03 01:40:31.03323
43	1	\N	6	6	DEG_0	2026-08-03 01:40:31.034126
44	1	\N	6	7	DEG_0	2026-08-03 01:40:31.034978
45	1	\N	6	8	DEG_0	2026-08-03 01:40:31.035832
46	1	\N	6	9	DEG_0	2026-08-03 01:40:31.036979
47	1	\N	7	1	DEG_0	2026-08-03 01:40:31.037765
48	1	\N	7	2	DEG_0	2026-08-03 01:40:31.038663
49	1	\N	7	3	DEG_0	2026-08-03 01:40:31.039414
50	1	\N	7	4	DEG_0	2026-08-03 01:40:31.040195
51	1	\N	7	5	DEG_0	2026-08-03 01:40:31.040962
52	1	\N	7	6	DEG_0	2026-08-03 01:40:31.041867
53	1	\N	7	7	DEG_0	2026-08-03 01:40:31.04264
54	1	\N	7	8	DEG_0	2026-08-03 01:40:31.043356
55	1	\N	7	9	DEG_0	2026-08-03 01:40:31.044085
56	1	\N	8	1	DEG_0	2026-08-03 01:40:31.044799
57	1	\N	8	2	DEG_0	2026-08-03 01:40:31.045546
58	1	\N	8	3	DEG_0	2026-08-03 01:40:31.046262
59	1	\N	8	4	DEG_0	2026-08-03 01:40:31.047011
60	1	\N	8	5	DEG_0	2026-08-03 01:40:31.047763
61	1	\N	8	6	DEG_0	2026-08-03 01:40:31.048618
62	1	\N	8	7	DEG_0	2026-08-03 01:40:31.049385
63	1	\N	8	8	DEG_0	2026-08-03 01:40:31.050085
64	1	\N	8	9	DEG_0	2026-08-03 01:40:31.051118
65	1	\N	9	1	DEG_0	2026-08-03 01:40:31.05189
66	1	\N	9	2	DEG_0	2026-08-03 01:40:31.052604
67	1	\N	9	3	DEG_0	2026-08-03 01:40:31.053316
68	1	\N	9	4	DEG_0	2026-08-03 01:40:31.054063
69	1	\N	9	5	DEG_0	2026-08-03 01:40:31.054873
70	1	\N	9	6	DEG_0	2026-08-03 01:40:31.055687
71	1	\N	9	7	DEG_0	2026-08-03 01:40:31.056555
72	1	\N	9	8	DEG_0	2026-08-03 01:40:31.057345
73	1	\N	9	9	DEG_0	2026-08-03 01:40:31.058091
74	2	\N	1	1	DEG_0	2026-08-03 01:43:07.539989
75	2	\N	1	2	DEG_0	2026-08-03 01:43:07.541391
76	2	\N	1	3	DEG_0	2026-08-03 01:43:07.542157
77	2	\N	1	4	DEG_0	2026-08-03 01:43:07.542913
78	2	\N	1	5	DEG_0	2026-08-03 01:43:07.54374
79	2	\N	1	6	DEG_0	2026-08-03 01:43:07.544567
80	2	\N	1	7	DEG_0	2026-08-03 01:43:07.54534
81	2	\N	1	8	DEG_0	2026-08-03 01:43:07.546157
82	2	\N	1	9	DEG_0	2026-08-03 01:43:07.546947
84	2	\N	2	2	DEG_0	2026-08-03 01:43:07.548411
85	2	\N	2	3	DEG_0	2026-08-03 01:43:07.549127
86	2	\N	2	4	DEG_0	2026-08-03 01:43:07.549886
87	2	\N	2	5	DEG_0	2026-08-03 01:43:07.550574
88	2	\N	2	6	DEG_0	2026-08-03 01:43:07.55128
89	2	\N	2	7	DEG_0	2026-08-03 01:43:07.551986
90	2	\N	2	8	DEG_0	2026-08-03 01:43:07.552711
92	2	\N	3	1	DEG_0	2026-08-03 01:43:07.554201
93	2	\N	3	2	DEG_0	2026-08-03 01:43:07.554992
94	2	\N	3	3	DEG_0	2026-08-03 01:43:07.55572
95	2	\N	3	4	DEG_0	2026-08-03 01:43:07.556439
96	2	\N	3	5	DEG_0	2026-08-03 01:43:07.557179
97	2	\N	3	6	DEG_0	2026-08-03 01:43:07.557931
98	2	\N	3	7	DEG_0	2026-08-03 01:43:07.55866
99	2	\N	3	8	DEG_0	2026-08-03 01:43:07.559411
37	1	21	5	5	DEG_0	2026-08-03 01:40:31.028947
101	2	\N	4	1	DEG_0	2026-08-03 01:43:07.561025
102	2	\N	4	2	DEG_0	2026-08-03 01:43:07.561759
103	2	\N	4	3	DEG_0	2026-08-03 01:43:07.562434
104	2	\N	4	4	DEG_0	2026-08-03 01:43:07.563095
105	2	\N	4	5	DEG_0	2026-08-03 01:43:07.563763
106	2	\N	4	6	DEG_0	2026-08-03 01:43:07.564461
107	2	\N	4	7	DEG_0	2026-08-03 01:43:07.565341
108	2	\N	4	8	DEG_0	2026-08-03 01:43:07.566235
111	2	\N	6	1	DEG_0	2026-08-03 01:43:07.568333
112	2	\N	6	2	DEG_0	2026-08-03 01:43:07.569061
113	2	\N	6	3	DEG_0	2026-08-03 01:43:07.569858
114	2	\N	6	4	DEG_0	2026-08-03 01:43:07.570531
115	2	\N	6	5	DEG_0	2026-08-03 01:43:07.571266
116	2	\N	6	6	DEG_0	2026-08-03 01:43:07.572027
117	2	\N	6	7	DEG_0	2026-08-03 01:43:07.57282
118	2	\N	6	8	DEG_0	2026-08-03 01:43:07.573588
120	2	\N	7	1	DEG_0	2026-08-03 01:43:07.574972
100	2	1048	3	9	DEG_0	2026-08-03 01:43:07.560226
91	2	1046	2	9	DEG_0	2026-08-03 01:43:07.553454
121	2	\N	7	2	DEG_0	2026-08-03 01:43:07.575755
122	2	\N	7	3	DEG_0	2026-08-03 01:43:07.576919
123	2	\N	7	4	DEG_0	2026-08-03 01:43:07.577661
124	2	\N	7	5	DEG_0	2026-08-03 01:43:07.57834
125	2	\N	7	6	DEG_0	2026-08-03 01:43:07.579116
126	2	\N	7	7	DEG_0	2026-08-03 01:43:07.579803
127	2	\N	7	8	DEG_0	2026-08-03 01:43:07.580433
129	2	\N	8	1	DEG_0	2026-08-03 01:43:07.582304
130	2	\N	8	2	DEG_0	2026-08-03 01:43:07.583005
131	2	\N	8	3	DEG_0	2026-08-03 01:43:07.583668
132	2	\N	8	4	DEG_0	2026-08-03 01:43:07.584321
133	2	\N	8	5	DEG_0	2026-08-03 01:43:07.585014
134	2	\N	8	6	DEG_0	2026-08-03 01:43:07.585683
135	2	\N	8	7	DEG_0	2026-08-03 01:43:07.586343
136	2	\N	8	8	DEG_0	2026-08-03 01:43:07.587005
138	2	\N	9	1	DEG_0	2026-08-03 01:43:07.588431
139	2	\N	9	2	DEG_0	2026-08-03 01:43:07.589142
140	2	\N	9	3	DEG_0	2026-08-03 01:43:07.589883
141	2	\N	9	4	DEG_0	2026-08-03 01:43:07.590514
142	2	\N	9	5	DEG_0	2026-08-03 01:43:07.591163
143	2	\N	9	6	DEG_0	2026-08-03 01:43:07.591923
144	2	\N	9	7	DEG_0	2026-08-03 01:43:07.592594
145	2	\N	9	8	DEG_0	2026-08-03 01:43:07.593439
137	2	1051	8	9	DEG_0	2026-08-03 01:43:07.587679
128	2	1052	7	9	DEG_0	2026-08-03 01:43:07.581437
1826	26	197	1	1	DEG_0	2026-08-07 12:27:02.357803
1899	27	\N	1	1	DEG_0	2026-08-07 16:27:21.439353
1900	27	\N	1	2	DEG_0	2026-08-07 16:27:21.440385
1901	27	\N	1	3	DEG_0	2026-08-07 16:27:21.440871
1902	27	\N	1	4	DEG_0	2026-08-07 16:27:21.441334
1903	27	\N	1	5	DEG_0	2026-08-07 16:27:21.441835
1904	27	\N	1	6	DEG_0	2026-08-07 16:27:21.442326
1905	27	\N	1	7	DEG_0	2026-08-07 16:27:21.442897
1906	27	\N	1	8	DEG_0	2026-08-07 16:27:21.443421
1907	27	\N	1	9	DEG_0	2026-08-07 16:27:21.44406
1908	27	\N	2	1	DEG_0	2026-08-07 16:27:21.444609
1909	27	\N	2	2	DEG_0	2026-08-07 16:27:21.445056
1910	27	\N	2	3	DEG_0	2026-08-07 16:27:21.445538
1911	27	\N	2	4	DEG_0	2026-08-07 16:27:21.446079
1912	27	\N	2	5	DEG_0	2026-08-07 16:27:21.446507
1913	27	\N	2	6	DEG_0	2026-08-07 16:27:21.447045
1914	27	\N	2	7	DEG_0	2026-08-07 16:27:21.447507
1915	27	\N	2	8	DEG_0	2026-08-07 16:27:21.447941
1916	27	\N	2	9	DEG_0	2026-08-07 16:27:21.44834
1917	27	\N	3	1	DEG_0	2026-08-07 16:27:21.448758
1918	27	\N	3	2	DEG_0	2026-08-07 16:27:21.449177
1919	27	\N	3	3	DEG_0	2026-08-07 16:27:21.449557
1920	27	\N	3	4	DEG_0	2026-08-07 16:27:21.450101
1921	27	\N	3	5	DEG_0	2026-08-07 16:27:21.450599
1922	27	\N	3	6	DEG_0	2026-08-07 16:27:21.451038
1923	27	\N	3	7	DEG_0	2026-08-07 16:27:21.451454
1924	27	\N	3	8	DEG_0	2026-08-07 16:27:21.451873
1925	27	\N	3	9	DEG_0	2026-08-07 16:27:21.452264
1926	27	\N	4	1	DEG_0	2026-08-07 16:27:21.4528
1927	27	\N	4	2	DEG_0	2026-08-07 16:27:21.453205
1928	27	\N	4	3	DEG_0	2026-08-07 16:27:21.4536
1929	27	\N	4	4	DEG_0	2026-08-07 16:27:21.454031
1930	27	\N	4	5	DEG_0	2026-08-07 16:27:21.454421
1931	27	\N	4	6	DEG_0	2026-08-07 16:27:21.454864
1932	27	\N	4	7	DEG_0	2026-08-07 16:27:21.455248
1933	27	\N	4	8	DEG_0	2026-08-07 16:27:21.455809
1934	27	\N	4	9	DEG_0	2026-08-07 16:27:21.456326
1935	27	\N	5	5	DEG_0	2026-08-07 16:27:21.456837
1936	27	\N	6	1	DEG_0	2026-08-07 16:27:21.457331
1937	27	\N	6	2	DEG_0	2026-08-07 16:27:21.457847
1938	27	\N	6	3	DEG_0	2026-08-07 16:27:21.458354
1939	27	\N	6	4	DEG_0	2026-08-07 16:27:21.45886
1940	27	\N	6	5	DEG_0	2026-08-07 16:27:21.459274
1941	27	\N	6	6	DEG_0	2026-08-07 16:27:21.459716
1942	27	\N	6	7	DEG_0	2026-08-07 16:27:21.460149
1943	27	\N	6	8	DEG_0	2026-08-07 16:27:21.46054
1944	27	\N	6	9	DEG_0	2026-08-07 16:27:21.46109
1945	27	\N	7	1	DEG_0	2026-08-07 16:27:21.46154
1946	27	\N	7	2	DEG_0	2026-08-07 16:27:21.462057
1947	27	\N	7	3	DEG_0	2026-08-07 16:27:21.462459
1948	27	\N	7	4	DEG_0	2026-08-07 16:27:21.462966
1949	27	\N	7	5	DEG_0	2026-08-07 16:27:21.46336
1950	27	\N	7	6	DEG_0	2026-08-07 16:27:21.463812
1951	27	\N	7	7	DEG_0	2026-08-07 16:27:21.464223
1952	27	\N	7	8	DEG_0	2026-08-07 16:27:21.464598
1953	27	\N	7	9	DEG_0	2026-08-07 16:27:21.464995
1954	27	\N	8	1	DEG_0	2026-08-07 16:27:21.465361
1955	27	\N	8	2	DEG_0	2026-08-07 16:27:21.465727
1956	27	\N	8	3	DEG_0	2026-08-07 16:27:21.466107
1957	27	\N	8	4	DEG_0	2026-08-07 16:27:21.466478
1958	27	\N	8	5	DEG_0	2026-08-07 16:27:21.466864
1959	27	\N	8	6	DEG_0	2026-08-07 16:27:21.467314
1960	27	\N	8	7	DEG_0	2026-08-07 16:27:21.467754
1961	27	\N	8	8	DEG_0	2026-08-07 16:27:21.468281
1962	27	\N	8	9	DEG_0	2026-08-07 16:27:21.468691
2191	31	643	1	1	DEG_0	2026-08-10 02:23:22.548297
2192	31	644	1	2	DEG_0	2026-08-10 02:23:22.550321
2193	31	645	1	3	DEG_0	2026-08-10 02:23:22.551353
2194	31	646	1	4	DEG_0	2026-08-10 02:23:22.552409
2195	31	\N	1	5	DEG_0	2026-08-10 02:23:22.553468
2196	31	647	1	6	DEG_0	2026-08-10 02:23:22.554571
2197	31	648	1	7	DEG_0	2026-08-10 02:23:22.555877
2198	31	649	1	8	DEG_0	2026-08-10 02:23:22.558481
2199	31	650	1	9	DEG_0	2026-08-10 02:23:22.559487
2200	31	652	2	1	DEG_0	2026-08-10 02:23:22.560798
2201	31	653	2	2	DEG_0	2026-08-10 02:23:22.561753
2202	31	654	2	3	DEG_0	2026-08-10 02:23:22.562885
2203	31	655	2	4	DEG_0	2026-08-10 02:23:22.56394
2204	31	\N	2	5	DEG_0	2026-08-10 02:23:22.564951
2205	31	656	2	6	DEG_0	2026-08-10 02:23:22.566341
2206	31	657	2	7	DEG_0	2026-08-10 02:23:22.567373
2207	31	658	2	8	DEG_0	2026-08-10 02:23:22.568394
2208	31	659	2	9	DEG_0	2026-08-10 02:23:22.57056
2209	31	661	3	1	DEG_0	2026-08-10 02:23:22.571488
2210	31	662	3	2	DEG_0	2026-08-10 02:23:22.573511
2211	31	663	3	3	DEG_0	2026-08-10 02:23:22.575065
2212	31	664	3	4	DEG_0	2026-08-10 02:23:22.576066
2213	31	\N	3	5	DEG_0	2026-08-10 02:23:22.577141
2214	31	665	3	6	DEG_0	2026-08-10 02:23:22.578108
2215	31	666	3	7	DEG_0	2026-08-10 02:23:22.578984
2216	31	667	3	8	DEG_0	2026-08-10 02:23:22.579931
2217	31	668	3	9	DEG_0	2026-08-10 02:23:22.580841
2218	31	670	4	1	DEG_0	2026-08-10 02:23:22.581676
2219	31	671	4	2	DEG_0	2026-08-10 02:23:22.582541
2220	31	672	4	3	DEG_0	2026-08-10 02:23:22.583564
2221	31	673	4	4	DEG_0	2026-08-10 02:23:22.584503
2222	31	\N	4	5	DEG_0	2026-08-10 02:23:22.585605
2223	31	674	4	6	DEG_0	2026-08-10 02:23:22.5866
2224	31	675	4	7	DEG_0	2026-08-10 02:23:22.587491
2225	31	676	4	8	DEG_0	2026-08-10 02:23:22.588584
2226	31	677	4	9	DEG_0	2026-08-10 02:23:22.589627
2227	31	751	5	5	DEG_0	2026-08-10 02:23:22.590571
2228	31	679	6	1	DEG_0	2026-08-10 02:23:22.591567
2229	31	680	6	2	DEG_0	2026-08-10 02:23:22.592492
2230	31	681	6	3	DEG_0	2026-08-10 02:23:22.593351
2231	31	682	6	4	DEG_0	2026-08-10 02:23:22.594241
2232	31	\N	6	5	DEG_0	2026-08-10 02:23:22.595657
2233	31	683	6	6	DEG_0	2026-08-10 02:23:22.597212
2234	31	684	6	7	DEG_0	2026-08-10 02:23:22.598142
2235	31	685	6	8	DEG_0	2026-08-10 02:23:22.599084
2236	31	686	6	9	DEG_0	2026-08-10 02:23:22.599999
2237	31	688	7	1	DEG_0	2026-08-10 02:23:22.601663
2238	31	689	7	2	DEG_0	2026-08-10 02:23:22.602632
2239	31	690	7	3	DEG_0	2026-08-10 02:23:22.603585
2240	31	691	7	4	DEG_0	2026-08-10 02:23:22.604514
2241	31	\N	7	5	DEG_0	2026-08-10 02:23:22.6056
2242	31	692	7	6	DEG_0	2026-08-10 02:23:22.607388
2243	31	693	7	7	DEG_0	2026-08-10 02:23:22.60911
2244	31	694	7	8	DEG_0	2026-08-10 02:23:22.611058
2245	31	695	7	9	DEG_0	2026-08-10 02:23:22.612342
2246	31	697	8	1	DEG_0	2026-08-10 02:23:22.613696
2247	31	698	8	2	DEG_0	2026-08-10 02:23:22.61491
2248	31	699	8	3	DEG_0	2026-08-10 02:23:22.616517
2249	31	700	8	4	DEG_0	2026-08-10 02:23:22.617493
2250	31	\N	8	5	DEG_0	2026-08-10 02:23:22.618388
2251	31	701	8	6	DEG_0	2026-08-10 02:23:22.619222
2252	31	702	8	7	DEG_0	2026-08-10 02:23:22.620083
2253	31	703	8	8	DEG_0	2026-08-10 02:23:22.620986
2254	31	704	8	9	DEG_0	2026-08-10 02:23:22.622132
367	6	\N	1	2	DEG_0	2026-08-04 04:01:28.486398
368	6	\N	1	3	DEG_0	2026-08-04 04:01:28.487364
366	6	64	1	1	DEG_0	2026-08-04 04:01:28.484905
370	6	\N	1	5	DEG_0	2026-08-04 04:01:28.489378
371	6	\N	1	6	DEG_0	2026-08-04 04:01:28.490478
372	6	\N	1	7	DEG_0	2026-08-04 04:01:28.491524
373	6	\N	1	8	DEG_0	2026-08-04 04:01:28.492462
374	6	\N	1	9	DEG_0	2026-08-04 04:01:28.49341
375	6	\N	2	1	DEG_0	2026-08-04 04:01:28.494472
376	6	\N	2	2	DEG_0	2026-08-04 04:01:28.495442
377	6	\N	2	3	DEG_0	2026-08-04 04:01:28.496461
378	6	\N	2	4	DEG_0	2026-08-04 04:01:28.49749
379	6	\N	2	5	DEG_0	2026-08-04 04:01:28.498499
380	6	\N	2	6	DEG_0	2026-08-04 04:01:28.499382
381	6	\N	2	7	DEG_0	2026-08-04 04:01:28.500292
382	6	\N	2	8	DEG_0	2026-08-04 04:01:28.501193
383	6	\N	2	9	DEG_0	2026-08-04 04:01:28.502036
384	6	\N	3	1	DEG_0	2026-08-04 04:01:28.502933
385	6	\N	3	2	DEG_0	2026-08-04 04:01:28.503811
386	6	\N	3	3	DEG_0	2026-08-04 04:01:28.50468
387	6	\N	3	4	DEG_0	2026-08-04 04:01:28.505573
388	6	\N	3	5	DEG_0	2026-08-04 04:01:28.506476
389	6	\N	3	6	DEG_0	2026-08-04 04:01:28.507391
390	6	\N	3	7	DEG_0	2026-08-04 04:01:28.508267
391	6	\N	3	8	DEG_0	2026-08-04 04:01:28.509226
392	6	\N	3	9	DEG_0	2026-08-04 04:01:28.510099
393	6	\N	4	1	DEG_0	2026-08-04 04:01:28.511007
394	6	\N	4	2	DEG_0	2026-08-04 04:01:28.51187
395	6	\N	4	3	DEG_0	2026-08-04 04:01:28.51282
396	6	\N	4	4	DEG_0	2026-08-04 04:01:28.513688
397	6	\N	4	5	DEG_0	2026-08-04 04:01:28.514693
398	6	\N	4	6	DEG_0	2026-08-04 04:01:28.515687
399	6	\N	4	7	DEG_0	2026-08-04 04:01:28.516605
400	6	\N	4	8	DEG_0	2026-08-04 04:01:28.517524
401	6	\N	4	9	DEG_0	2026-08-04 04:01:28.518428
402	6	\N	5	5	DEG_0	2026-08-04 04:01:28.519297
403	6	\N	6	1	DEG_0	2026-08-04 04:01:28.520157
404	6	\N	6	2	DEG_0	2026-08-04 04:01:28.521052
405	6	\N	6	3	DEG_0	2026-08-04 04:01:28.521937
406	6	\N	6	4	DEG_0	2026-08-04 04:01:28.522918
407	6	\N	6	5	DEG_0	2026-08-04 04:01:28.523762
408	6	\N	6	6	DEG_0	2026-08-04 04:01:28.524833
409	6	\N	6	7	DEG_0	2026-08-04 04:01:28.525731
410	6	\N	6	8	DEG_0	2026-08-04 04:01:28.526646
411	6	\N	6	9	DEG_0	2026-08-04 04:01:28.527552
412	6	\N	7	1	DEG_0	2026-08-04 04:01:28.52845
413	6	\N	7	2	DEG_0	2026-08-04 04:01:28.529389
414	6	\N	7	3	DEG_0	2026-08-04 04:01:28.530331
415	6	\N	7	4	DEG_0	2026-08-04 04:01:28.531307
416	6	\N	7	5	DEG_0	2026-08-04 04:01:28.532188
419	6	\N	7	8	DEG_0	2026-08-04 04:01:28.535632
420	6	\N	7	9	DEG_0	2026-08-04 04:01:28.537094
421	6	\N	8	1	DEG_0	2026-08-04 04:01:28.538747
422	6	\N	8	2	DEG_0	2026-08-04 04:01:28.539656
423	6	\N	8	3	DEG_0	2026-08-04 04:01:28.540589
424	6	\N	8	4	DEG_0	2026-08-04 04:01:28.541519
425	6	\N	8	5	DEG_0	2026-08-04 04:01:28.542458
426	6	\N	8	6	DEG_0	2026-08-04 04:01:28.543376
427	6	\N	8	7	DEG_0	2026-08-04 04:01:28.54439
428	6	\N	8	8	DEG_0	2026-08-04 04:01:28.545324
429	6	\N	8	9	DEG_0	2026-08-04 04:01:28.546431
430	6	\N	9	1	DEG_0	2026-08-04 04:01:28.547357
431	6	\N	9	2	DEG_0	2026-08-04 04:01:28.548278
432	6	\N	9	3	DEG_0	2026-08-04 04:01:28.549179
433	6	\N	9	4	DEG_0	2026-08-04 04:01:28.550064
434	6	\N	9	5	DEG_0	2026-08-04 04:01:28.550926
435	6	\N	9	6	DEG_0	2026-08-04 04:01:28.551736
436	6	\N	9	7	DEG_0	2026-08-04 04:01:28.55259
437	6	\N	9	8	DEG_0	2026-08-04 04:01:28.553459
438	6	\N	9	9	DEG_0	2026-08-04 04:01:28.554352
417	6	72	7	6	DEG_0	2026-08-04 04:01:28.533066
418	6	67	7	7	DEG_0	2026-08-04 04:01:28.534159
2255	31	706	9	1	DEG_0	2026-08-10 02:23:22.623029
2256	31	707	9	2	DEG_0	2026-08-10 02:23:22.62392
2257	31	708	9	3	DEG_0	2026-08-10 02:23:22.624739
2258	31	709	9	4	DEG_0	2026-08-10 02:23:22.625647
2259	31	\N	9	5	DEG_0	2026-08-10 02:23:22.626526
2260	31	710	9	6	DEG_0	2026-08-10 02:23:22.627428
2261	31	711	9	7	DEG_0	2026-08-10 02:23:22.628316
2262	31	712	9	8	DEG_0	2026-08-10 02:23:22.629193
2263	31	713	9	9	DEG_0	2026-08-10 02:23:22.630045
2264	32	643	1	1	DEG_0	2026-08-10 02:23:22.866732
2265	32	644	1	2	DEG_0	2026-08-10 02:23:22.867599
1963	27	\N	9	1	DEG_0	2026-08-07 16:27:21.469057
1964	27	\N	9	2	DEG_0	2026-08-07 16:27:21.46951
1965	27	\N	9	3	DEG_0	2026-08-07 16:27:21.46995
1966	27	\N	9	4	DEG_0	2026-08-07 16:27:21.470342
1967	27	\N	9	5	DEG_0	2026-08-07 16:27:21.470755
1968	27	\N	9	6	DEG_0	2026-08-07 16:27:21.47117
1969	27	\N	9	7	DEG_0	2026-08-07 16:27:21.471554
1970	27	\N	9	8	DEG_0	2026-08-07 16:27:21.472048
1971	27	\N	9	9	DEG_0	2026-08-07 16:27:21.472468
2266	32	645	1	3	DEG_0	2026-08-10 02:23:22.868436
2267	32	646	1	4	DEG_0	2026-08-10 02:23:22.869309
2268	32	\N	1	5	DEG_0	2026-08-10 02:23:22.870171
2269	32	647	1	6	DEG_0	2026-08-10 02:23:22.871121
2270	32	648	1	7	DEG_0	2026-08-10 02:23:22.871963
2271	32	649	1	8	DEG_0	2026-08-10 02:23:22.872807
83	2	47	2	1	DEG_0	2026-08-03 01:43:07.547692
658	10	\N	1	1	DEG_0	2026-08-04 04:57:12.10688
659	10	\N	1	2	DEG_0	2026-08-04 04:57:12.108182
660	10	\N	1	3	DEG_0	2026-08-04 04:57:12.108971
661	10	\N	1	4	DEG_0	2026-08-04 04:57:12.109698
662	10	\N	1	5	DEG_0	2026-08-04 04:57:12.110434
663	10	\N	1	6	DEG_0	2026-08-04 04:57:12.111232
664	10	\N	1	7	DEG_0	2026-08-04 04:57:12.111965
665	10	\N	1	8	DEG_0	2026-08-04 04:57:12.112638
666	10	\N	1	9	DEG_0	2026-08-04 04:57:12.113315
667	10	\N	2	1	DEG_0	2026-08-04 04:57:12.113962
668	10	\N	2	2	DEG_0	2026-08-04 04:57:12.114597
669	10	\N	2	3	DEG_0	2026-08-04 04:57:12.115227
670	10	\N	2	4	DEG_0	2026-08-04 04:57:12.115864
671	10	\N	2	5	DEG_0	2026-08-04 04:57:12.116543
672	10	\N	2	6	DEG_0	2026-08-04 04:57:12.11719
673	10	\N	2	7	DEG_0	2026-08-04 04:57:12.117812
674	10	\N	2	8	DEG_0	2026-08-04 04:57:12.118457
675	10	\N	2	9	DEG_0	2026-08-04 04:57:12.11915
676	10	\N	3	1	DEG_0	2026-08-04 04:57:12.119789
677	10	\N	3	2	DEG_0	2026-08-04 04:57:12.120653
678	10	\N	3	3	DEG_0	2026-08-04 04:57:12.121327
679	10	\N	3	4	DEG_0	2026-08-04 04:57:12.122007
680	10	\N	3	5	DEG_0	2026-08-04 04:57:12.122625
681	10	\N	3	6	DEG_0	2026-08-04 04:57:12.123253
682	10	\N	3	7	DEG_0	2026-08-04 04:57:12.123875
683	10	\N	3	8	DEG_0	2026-08-04 04:57:12.12447
684	10	\N	3	9	DEG_0	2026-08-04 04:57:12.125095
685	10	\N	4	1	DEG_0	2026-08-04 04:57:12.125697
686	10	\N	4	2	DEG_0	2026-08-04 04:57:12.126322
687	10	\N	4	3	DEG_0	2026-08-04 04:57:12.126945
688	10	\N	4	4	DEG_0	2026-08-04 04:57:12.127545
689	10	\N	4	5	DEG_0	2026-08-04 04:57:12.12821
690	10	\N	4	6	DEG_0	2026-08-04 04:57:12.128858
691	10	\N	4	7	DEG_0	2026-08-04 04:57:12.129506
692	10	\N	4	8	DEG_0	2026-08-04 04:57:12.130204
693	10	\N	4	9	DEG_0	2026-08-04 04:57:12.130849
694	10	\N	5	5	DEG_0	2026-08-04 04:57:12.131457
695	10	\N	6	1	DEG_0	2026-08-04 04:57:12.13212
696	10	\N	6	2	DEG_0	2026-08-04 04:57:12.132821
697	10	\N	6	3	DEG_0	2026-08-04 04:57:12.133446
698	10	\N	6	4	DEG_0	2026-08-04 04:57:12.134065
699	10	\N	6	5	DEG_0	2026-08-04 04:57:12.134657
700	10	\N	6	6	DEG_0	2026-08-04 04:57:12.135339
701	10	\N	6	7	DEG_0	2026-08-04 04:57:12.135969
702	10	\N	6	8	DEG_0	2026-08-04 04:57:12.136588
703	10	\N	6	9	DEG_0	2026-08-04 04:57:12.137238
704	10	\N	7	1	DEG_0	2026-08-04 04:57:12.137853
705	10	\N	7	2	DEG_0	2026-08-04 04:57:12.138446
706	10	\N	7	3	DEG_0	2026-08-04 04:57:12.139141
707	10	\N	7	4	DEG_0	2026-08-04 04:57:12.139728
708	10	\N	7	5	DEG_0	2026-08-04 04:57:12.140377
709	10	\N	7	6	DEG_0	2026-08-04 04:57:12.140979
710	10	\N	7	7	DEG_0	2026-08-04 04:57:12.141577
711	10	\N	7	8	DEG_0	2026-08-04 04:57:12.142188
712	10	\N	7	9	DEG_0	2026-08-04 04:57:12.143096
713	10	\N	8	1	DEG_0	2026-08-04 04:57:12.143719
714	10	\N	8	2	DEG_0	2026-08-04 04:57:12.144362
715	10	\N	8	3	DEG_0	2026-08-04 04:57:12.144975
716	10	\N	8	4	DEG_0	2026-08-04 04:57:12.14557
717	10	\N	8	5	DEG_0	2026-08-04 04:57:12.146214
718	10	\N	8	6	DEG_0	2026-08-04 04:57:12.146866
719	10	\N	8	7	DEG_0	2026-08-04 04:57:12.147445
720	10	\N	8	8	DEG_0	2026-08-04 04:57:12.14816
721	10	\N	8	9	DEG_0	2026-08-04 04:57:12.148809
722	10	\N	9	1	DEG_0	2026-08-04 04:57:12.149398
723	10	\N	9	2	DEG_0	2026-08-04 04:57:12.150012
724	10	\N	9	3	DEG_0	2026-08-04 04:57:12.150748
725	10	\N	9	4	DEG_0	2026-08-04 04:57:12.151722
726	10	\N	9	5	DEG_0	2026-08-04 04:57:12.152364
727	10	\N	9	6	DEG_0	2026-08-04 04:57:12.153212
728	10	\N	9	7	DEG_0	2026-08-04 04:57:12.153914
729	10	\N	9	8	DEG_0	2026-08-04 04:57:12.154573
730	10	\N	9	9	DEG_0	2026-08-04 04:57:12.155194
369	6	161	1	4	DEG_0	2026-08-04 04:01:28.48837
877	13	\N	1	1	DEG_0	2026-08-04 07:11:36.104303
878	13	\N	1	2	DEG_0	2026-08-04 07:11:36.105361
879	13	\N	1	3	DEG_0	2026-08-04 07:11:36.105903
880	13	\N	1	4	DEG_0	2026-08-04 07:11:36.106402
881	13	\N	1	5	DEG_0	2026-08-04 07:11:36.106946
882	13	\N	1	6	DEG_0	2026-08-04 07:11:36.107445
883	13	\N	1	7	DEG_0	2026-08-04 07:11:36.107963
884	13	\N	1	8	DEG_0	2026-08-04 07:11:36.108403
885	13	\N	1	9	DEG_0	2026-08-04 07:11:36.108889
886	13	\N	2	1	DEG_0	2026-08-04 07:11:36.109324
887	13	\N	2	2	DEG_0	2026-08-04 07:11:36.10975
888	13	\N	2	3	DEG_0	2026-08-04 07:11:36.110189
889	13	\N	2	4	DEG_0	2026-08-04 07:11:36.110599
890	13	\N	2	5	DEG_0	2026-08-04 07:11:36.111026
891	13	\N	2	6	DEG_0	2026-08-04 07:11:36.111422
892	13	\N	2	7	DEG_0	2026-08-04 07:11:36.111846
893	13	\N	2	8	DEG_0	2026-08-04 07:11:36.112241
894	13	\N	2	9	DEG_0	2026-08-04 07:11:36.112637
895	13	\N	3	1	DEG_0	2026-08-04 07:11:36.113052
896	13	\N	3	2	DEG_0	2026-08-04 07:11:36.113738
897	13	\N	3	3	DEG_0	2026-08-04 07:11:36.11429
898	13	\N	3	4	DEG_0	2026-08-04 07:11:36.114799
899	13	\N	3	5	DEG_0	2026-08-04 07:11:36.115225
900	13	\N	3	6	DEG_0	2026-08-04 07:11:36.115679
901	13	\N	3	7	DEG_0	2026-08-04 07:11:36.11614
902	13	\N	3	8	DEG_0	2026-08-04 07:11:36.116761
903	13	\N	3	9	DEG_0	2026-08-04 07:11:36.117377
904	13	\N	4	1	DEG_0	2026-08-04 07:11:36.117951
905	13	\N	4	2	DEG_0	2026-08-04 07:11:36.118504
906	13	\N	4	3	DEG_0	2026-08-04 07:11:36.119006
907	13	\N	4	4	DEG_0	2026-08-04 07:11:36.119413
908	13	\N	4	5	DEG_0	2026-08-04 07:11:36.119836
909	13	\N	4	6	DEG_0	2026-08-04 07:11:36.120232
910	13	\N	4	7	DEG_0	2026-08-04 07:11:36.120631
911	13	\N	4	8	DEG_0	2026-08-04 07:11:36.121022
912	13	\N	4	9	DEG_0	2026-08-04 07:11:36.121448
913	13	\N	5	5	DEG_0	2026-08-04 07:11:36.12189
914	13	\N	6	1	DEG_0	2026-08-04 07:11:36.122272
915	13	\N	6	2	DEG_0	2026-08-04 07:11:36.122762
916	13	\N	6	3	DEG_0	2026-08-04 07:11:36.123193
917	13	\N	6	4	DEG_0	2026-08-04 07:11:36.123666
918	13	\N	6	5	DEG_0	2026-08-04 07:11:36.124068
919	13	\N	6	6	DEG_0	2026-08-04 07:11:36.12445
920	13	\N	6	7	DEG_0	2026-08-04 07:11:36.124874
921	13	\N	6	8	DEG_0	2026-08-04 07:11:36.125252
922	13	\N	6	9	DEG_0	2026-08-04 07:11:36.125627
923	13	\N	7	1	DEG_0	2026-08-04 07:11:36.126005
924	13	\N	7	2	DEG_0	2026-08-04 07:11:36.126375
926	13	\N	7	4	DEG_0	2026-08-04 07:11:36.127147
927	13	\N	7	5	DEG_0	2026-08-04 07:11:36.127518
928	13	\N	7	6	DEG_0	2026-08-04 07:11:36.127903
929	13	\N	7	7	DEG_0	2026-08-04 07:11:36.128492
930	13	\N	7	8	DEG_0	2026-08-04 07:11:36.129033
931	13	\N	7	9	DEG_0	2026-08-04 07:11:36.129532
932	13	\N	8	1	DEG_0	2026-08-04 07:11:36.129983
933	13	\N	8	2	DEG_0	2026-08-04 07:11:36.130535
934	13	\N	8	3	DEG_0	2026-08-04 07:11:36.131058
935	13	\N	8	4	DEG_0	2026-08-04 07:11:36.131528
936	13	\N	8	5	DEG_0	2026-08-04 07:11:36.132005
937	13	\N	8	6	DEG_0	2026-08-04 07:11:36.132428
938	13	\N	8	7	DEG_0	2026-08-04 07:11:36.132885
939	13	\N	8	8	DEG_0	2026-08-04 07:11:36.13329
940	13	\N	8	9	DEG_0	2026-08-04 07:11:36.133676
941	13	\N	9	1	DEG_0	2026-08-04 07:11:36.134072
942	13	\N	9	2	DEG_0	2026-08-04 07:11:36.134455
943	13	\N	9	3	DEG_0	2026-08-04 07:11:36.134899
944	13	\N	9	4	DEG_0	2026-08-04 07:11:36.135298
945	13	\N	9	5	DEG_0	2026-08-04 07:11:36.13571
946	13	\N	9	6	DEG_0	2026-08-04 07:11:36.13612
947	13	\N	9	7	DEG_0	2026-08-04 07:11:36.136726
948	13	\N	9	8	DEG_0	2026-08-04 07:11:36.137219
949	13	\N	9	9	DEG_0	2026-08-04 07:11:36.137662
2272	32	650	1	9	DEG_0	2026-08-10 02:23:22.873583
2273	32	652	2	1	DEG_0	2026-08-10 02:23:22.874411
2274	32	653	2	2	DEG_0	2026-08-10 02:23:22.87527
2275	32	654	2	3	DEG_0	2026-08-10 02:23:22.876233
2276	32	655	2	4	DEG_0	2026-08-10 02:23:22.877121
2277	32	\N	2	5	DEG_0	2026-08-10 02:23:22.877987
2278	32	656	2	6	DEG_0	2026-08-10 02:23:22.878852
2279	32	657	2	7	DEG_0	2026-08-10 02:23:22.879634
2280	32	658	2	8	DEG_0	2026-08-10 02:23:22.880446
2281	32	659	2	9	DEG_0	2026-08-10 02:23:22.881322
2282	32	661	3	1	DEG_0	2026-08-10 02:23:22.882179
2283	32	662	3	2	DEG_0	2026-08-10 02:23:22.883043
2284	32	663	3	3	DEG_0	2026-08-10 02:23:22.883857
2285	32	664	3	4	DEG_0	2026-08-10 02:23:22.884608
2286	32	\N	3	5	DEG_0	2026-08-10 02:23:22.885446
2287	32	665	3	6	DEG_0	2026-08-10 02:23:22.886365
2288	32	666	3	7	DEG_0	2026-08-10 02:23:22.887171
2289	32	667	3	8	DEG_0	2026-08-10 02:23:22.887964
2290	32	668	3	9	DEG_0	2026-08-10 02:23:22.888929
2291	32	670	4	1	DEG_0	2026-08-10 02:23:22.889816
2292	32	671	4	2	DEG_0	2026-08-10 02:23:22.8906
2293	32	672	4	3	DEG_0	2026-08-10 02:23:22.891384
2294	32	673	4	4	DEG_0	2026-08-10 02:23:22.892247
2295	32	\N	4	5	DEG_0	2026-08-10 02:23:22.893088
2296	32	674	4	6	DEG_0	2026-08-10 02:23:22.893964
2297	32	675	4	7	DEG_0	2026-08-10 02:23:22.894739
2298	32	676	4	8	DEG_0	2026-08-10 02:23:22.895531
2299	32	677	4	9	DEG_0	2026-08-10 02:23:22.896257
2300	32	751	5	5	DEG_0	2026-08-10 02:23:22.897095
2301	32	679	6	1	DEG_0	2026-08-10 02:23:22.897977
2302	32	680	6	2	DEG_0	2026-08-10 02:23:22.898873
2303	32	681	6	3	DEG_0	2026-08-10 02:23:22.899724
2304	32	682	6	4	DEG_0	2026-08-10 02:23:22.900525
2305	32	\N	6	5	DEG_0	2026-08-10 02:23:22.901247
2306	32	683	6	6	DEG_0	2026-08-10 02:23:22.902948
2307	32	684	6	7	DEG_0	2026-08-10 02:23:22.903877
2308	32	685	6	8	DEG_0	2026-08-10 02:23:22.904677
2309	32	686	6	9	DEG_0	2026-08-10 02:23:22.905389
2310	32	688	7	1	DEG_0	2026-08-10 02:23:22.906146
2311	32	689	7	2	DEG_0	2026-08-10 02:23:22.906911
2312	32	690	7	3	DEG_0	2026-08-10 02:23:22.907637
2313	32	691	7	4	DEG_0	2026-08-10 02:23:22.908378
2314	32	\N	7	5	DEG_0	2026-08-10 02:23:22.90913
2315	32	692	7	6	DEG_0	2026-08-10 02:23:22.909879
2316	32	693	7	7	DEG_0	2026-08-10 02:23:22.910818
2317	32	694	7	8	DEG_0	2026-08-10 02:23:22.911632
2318	32	695	7	9	DEG_0	2026-08-10 02:23:22.912726
2319	32	697	8	1	DEG_0	2026-08-10 02:23:22.913682
2320	32	698	8	2	DEG_0	2026-08-10 02:23:22.914662
2321	32	699	8	3	DEG_0	2026-08-10 02:23:22.915481
2322	32	700	8	4	DEG_0	2026-08-10 02:23:22.916229
2323	32	\N	8	5	DEG_0	2026-08-10 02:23:22.917062
2324	32	701	8	6	DEG_0	2026-08-10 02:23:22.917942
2325	32	702	8	7	DEG_0	2026-08-10 02:23:22.918744
2326	32	703	8	8	DEG_0	2026-08-10 02:23:22.919582
2327	32	704	8	9	DEG_0	2026-08-10 02:23:22.920486
2328	32	706	9	1	DEG_0	2026-08-10 02:23:22.921341
2329	32	707	9	2	DEG_0	2026-08-10 02:23:22.922132
2330	32	708	9	3	DEG_0	2026-08-10 02:23:22.922903
2331	32	709	9	4	DEG_0	2026-08-10 02:23:22.923923
2332	32	\N	9	5	DEG_0	2026-08-10 02:23:22.924685
2333	32	710	9	6	DEG_0	2026-08-10 02:23:22.925452
2334	32	711	9	7	DEG_0	2026-08-10 02:23:22.926266
2335	32	712	9	8	DEG_0	2026-08-10 02:23:22.927072
2336	32	713	9	9	DEG_0	2026-08-10 02:23:22.927878
2337	33	769	1	1	DEG_0	2026-08-10 02:23:23.151084
2338	33	770	1	2	DEG_0	2026-08-10 02:23:23.151904
2339	33	771	1	3	DEG_0	2026-08-10 02:23:23.153011
2340	33	772	1	4	DEG_0	2026-08-10 02:23:23.153735
2341	33	\N	1	5	DEG_0	2026-08-10 02:23:23.154452
2342	33	773	1	6	DEG_0	2026-08-10 02:23:23.155211
2343	33	774	1	7	DEG_0	2026-08-10 02:23:23.155897
2344	33	775	1	8	DEG_0	2026-08-10 02:23:23.156575
2345	33	776	1	9	DEG_0	2026-08-10 02:23:23.157306
2346	33	778	2	1	DEG_0	2026-08-10 02:23:23.157982
2347	33	779	2	2	DEG_0	2026-08-10 02:23:23.158626
2348	33	780	2	3	DEG_0	2026-08-10 02:23:23.159312
2349	33	781	2	4	DEG_0	2026-08-10 02:23:23.160049
2350	33	\N	2	5	DEG_0	2026-08-10 02:23:23.160716
2351	33	782	2	6	DEG_0	2026-08-10 02:23:23.161465
2352	33	783	2	7	DEG_0	2026-08-10 02:23:23.162174
2353	33	784	2	8	DEG_0	2026-08-10 02:23:23.162906
2354	33	785	2	9	DEG_0	2026-08-10 02:23:23.163661
2355	33	787	3	1	DEG_0	2026-08-10 02:23:23.164404
2356	33	788	3	2	DEG_0	2026-08-10 02:23:23.16747
2357	33	789	3	3	DEG_0	2026-08-10 02:23:23.168402
2358	33	790	3	4	DEG_0	2026-08-10 02:23:23.16932
2359	33	\N	3	5	DEG_0	2026-08-10 02:23:23.170113
2360	33	791	3	6	DEG_0	2026-08-10 02:23:23.170861
2361	33	792	3	7	DEG_0	2026-08-10 02:23:23.171561
2362	33	793	3	8	DEG_0	2026-08-10 02:23:23.1723
2363	33	794	3	9	DEG_0	2026-08-10 02:23:23.172986
2364	33	796	4	1	DEG_0	2026-08-10 02:23:23.173708
2365	33	797	4	2	DEG_0	2026-08-10 02:23:23.174423
2366	33	798	4	3	DEG_0	2026-08-10 02:23:23.175227
2367	33	799	4	4	DEG_0	2026-08-10 02:23:23.175963
2368	33	\N	4	5	DEG_0	2026-08-10 02:23:23.176662
2369	33	800	4	6	DEG_0	2026-08-10 02:23:23.17731
2370	33	801	4	7	DEG_0	2026-08-10 02:23:23.177972
2371	33	802	4	8	DEG_0	2026-08-10 02:23:23.178613
2372	33	803	4	9	DEG_0	2026-08-10 02:23:23.180317
2373	33	877	5	5	DEG_0	2026-08-10 02:23:23.181017
2374	33	805	6	1	DEG_0	2026-08-10 02:23:23.181716
2375	33	806	6	2	DEG_0	2026-08-10 02:23:23.182399
2376	33	807	6	3	DEG_0	2026-08-10 02:23:23.183076
2377	33	808	6	4	DEG_0	2026-08-10 02:23:23.183726
2378	33	\N	6	5	DEG_0	2026-08-10 02:23:23.184399
2379	33	809	6	6	DEG_0	2026-08-10 02:23:23.185082
2380	33	810	6	7	DEG_0	2026-08-10 02:23:23.185737
2381	33	811	6	8	DEG_0	2026-08-10 02:23:23.186485
2382	33	812	6	9	DEG_0	2026-08-10 02:23:23.187194
2383	33	814	7	1	DEG_0	2026-08-10 02:23:23.187872
2384	33	815	7	2	DEG_0	2026-08-10 02:23:23.188497
2385	33	816	7	3	DEG_0	2026-08-10 02:23:23.18922
2386	33	817	7	4	DEG_0	2026-08-10 02:23:23.189908
2387	33	\N	7	5	DEG_0	2026-08-10 02:23:23.190597
2388	33	818	7	6	DEG_0	2026-08-10 02:23:23.191432
2389	33	819	7	7	DEG_0	2026-08-10 02:23:23.193117
2390	33	820	7	8	DEG_0	2026-08-10 02:23:23.196307
2391	33	821	7	9	DEG_0	2026-08-10 02:23:23.197141
2392	33	823	8	1	DEG_0	2026-08-10 02:23:23.197906
2393	33	824	8	2	DEG_0	2026-08-10 02:23:23.198538
2394	33	825	8	3	DEG_0	2026-08-10 02:23:23.199184
2395	33	826	8	4	DEG_0	2026-08-10 02:23:23.199804
2396	33	\N	8	5	DEG_0	2026-08-10 02:23:23.200397
2397	33	827	8	6	DEG_0	2026-08-10 02:23:23.201056
2398	33	828	8	7	DEG_0	2026-08-10 02:23:23.201733
2399	33	829	8	8	DEG_0	2026-08-10 02:23:23.202396
2400	33	830	8	9	DEG_0	2026-08-10 02:23:23.20317
2401	33	832	9	1	DEG_0	2026-08-10 02:23:23.203875
2402	33	833	9	2	DEG_0	2026-08-10 02:23:23.204524
2403	33	834	9	3	DEG_0	2026-08-10 02:23:23.205147
2404	33	835	9	4	DEG_0	2026-08-10 02:23:23.205755
2405	33	\N	9	5	DEG_0	2026-08-10 02:23:23.206451
2406	33	836	9	6	DEG_0	2026-08-10 02:23:23.207122
2407	33	837	9	7	DEG_0	2026-08-10 02:23:23.207737
2408	33	838	9	8	DEG_0	2026-08-10 02:23:23.208366
2409	33	839	9	9	DEG_0	2026-08-10 02:23:23.208996
2410	34	769	1	1	DEG_0	2026-08-10 02:23:23.324184
2411	34	770	1	2	DEG_0	2026-08-10 02:23:23.324944
2412	34	771	1	3	DEG_0	2026-08-10 02:23:23.325587
2413	34	772	1	4	DEG_0	2026-08-10 02:23:23.326387
2414	34	\N	1	5	DEG_0	2026-08-10 02:23:23.327051
2415	34	773	1	6	DEG_0	2026-08-10 02:23:23.32766
2416	34	774	1	7	DEG_0	2026-08-10 02:23:23.328308
2417	34	775	1	8	DEG_0	2026-08-10 02:23:23.329018
2418	34	776	1	9	DEG_0	2026-08-10 02:23:23.329885
2419	34	778	2	1	DEG_0	2026-08-10 02:23:23.330598
2420	34	779	2	2	DEG_0	2026-08-10 02:23:23.331255
2421	34	780	2	3	DEG_0	2026-08-10 02:23:23.331911
2422	34	781	2	4	DEG_0	2026-08-10 02:23:23.332596
2423	34	\N	2	5	DEG_0	2026-08-10 02:23:23.333242
2424	34	782	2	6	DEG_0	2026-08-10 02:23:23.333818
2425	34	783	2	7	DEG_0	2026-08-10 02:23:23.334422
2426	34	784	2	8	DEG_0	2026-08-10 02:23:23.335035
2427	34	785	2	9	DEG_0	2026-08-10 02:23:23.335623
2428	34	787	3	1	DEG_0	2026-08-10 02:23:23.336242
2429	34	788	3	2	DEG_0	2026-08-10 02:23:23.336859
2430	34	789	3	3	DEG_0	2026-08-10 02:23:23.337446
2431	34	790	3	4	DEG_0	2026-08-10 02:23:23.338055
2432	34	\N	3	5	DEG_0	2026-08-10 02:23:23.338628
2433	34	791	3	6	DEG_0	2026-08-10 02:23:23.339235
2434	34	792	3	7	DEG_0	2026-08-10 02:23:23.339835
2435	34	793	3	8	DEG_0	2026-08-10 02:23:23.340408
2436	34	794	3	9	DEG_0	2026-08-10 02:23:23.341012
2437	34	796	4	1	DEG_0	2026-08-10 02:23:23.341586
2438	34	797	4	2	DEG_0	2026-08-10 02:23:23.342199
2439	34	798	4	3	DEG_0	2026-08-10 02:23:23.342793
2440	34	799	4	4	DEG_0	2026-08-10 02:23:23.343379
2441	34	\N	4	5	DEG_0	2026-08-10 02:23:23.344009
2442	34	800	4	6	DEG_0	2026-08-10 02:23:23.344605
2443	34	801	4	7	DEG_0	2026-08-10 02:23:23.345238
2444	34	802	4	8	DEG_0	2026-08-10 02:23:23.345845
2445	34	803	4	9	DEG_0	2026-08-10 02:23:23.346427
2446	34	877	5	5	DEG_0	2026-08-10 02:23:23.347097
2447	34	805	6	1	DEG_0	2026-08-10 02:23:23.347761
2448	34	806	6	2	DEG_0	2026-08-10 02:23:23.348413
2449	34	807	6	3	DEG_0	2026-08-10 02:23:23.34902
2450	34	808	6	4	DEG_0	2026-08-10 02:23:23.349636
2451	34	\N	6	5	DEG_0	2026-08-10 02:23:23.350268
2452	34	809	6	6	DEG_0	2026-08-10 02:23:23.350852
2453	34	810	6	7	DEG_0	2026-08-10 02:23:23.351453
2454	34	811	6	8	DEG_0	2026-08-10 02:23:23.352068
2455	34	812	6	9	DEG_0	2026-08-10 02:23:23.352662
2456	34	814	7	1	DEG_0	2026-08-10 02:23:23.353287
2457	34	815	7	2	DEG_0	2026-08-10 02:23:23.353888
2458	34	816	7	3	DEG_0	2026-08-10 02:23:23.354466
2459	34	817	7	4	DEG_0	2026-08-10 02:23:23.355063
2460	34	\N	7	5	DEG_0	2026-08-10 02:23:23.355675
2461	34	818	7	6	DEG_0	2026-08-10 02:23:23.356276
2462	34	819	7	7	DEG_0	2026-08-10 02:23:23.356879
2463	34	820	7	8	DEG_0	2026-08-10 02:23:23.357507
2464	34	821	7	9	DEG_0	2026-08-10 02:23:23.358121
2465	34	823	8	1	DEG_0	2026-08-10 02:23:23.358691
2466	34	824	8	2	DEG_0	2026-08-10 02:23:23.359285
2467	34	825	8	3	DEG_0	2026-08-10 02:23:23.359887
2468	34	826	8	4	DEG_0	2026-08-10 02:23:23.360457
2469	34	\N	8	5	DEG_0	2026-08-10 02:23:23.361072
2470	34	827	8	6	DEG_0	2026-08-10 02:23:23.361632
2471	34	828	8	7	DEG_0	2026-08-10 02:23:23.362249
2472	34	829	8	8	DEG_0	2026-08-10 02:23:23.362844
2473	34	830	8	9	DEG_0	2026-08-10 02:23:23.363424
2474	34	832	9	1	DEG_0	2026-08-10 02:23:23.364025
2475	34	833	9	2	DEG_0	2026-08-10 02:23:23.364594
2476	34	834	9	3	DEG_0	2026-08-10 02:23:23.365196
2477	34	835	9	4	DEG_0	2026-08-10 02:23:23.365769
2478	34	\N	9	5	DEG_0	2026-08-10 02:23:23.366372
2479	34	836	9	6	DEG_0	2026-08-10 02:23:23.366956
2480	34	837	9	7	DEG_0	2026-08-10 02:23:23.367542
2481	34	838	9	8	DEG_0	2026-08-10 02:23:23.368143
2482	34	839	9	9	DEG_0	2026-08-10 02:23:23.368719
2483	35	895	1	1	DEG_0	2026-08-10 02:23:23.540514
2484	35	896	1	2	DEG_0	2026-08-10 02:23:23.541458
2485	35	897	1	3	DEG_0	2026-08-10 02:23:23.542047
2486	35	898	1	4	DEG_0	2026-08-10 02:23:23.542628
2487	35	\N	1	5	DEG_0	2026-08-10 02:23:23.54316
2488	35	899	1	6	DEG_0	2026-08-10 02:23:23.54367
2489	35	900	1	7	DEG_0	2026-08-10 02:23:23.544236
2490	35	901	1	8	DEG_0	2026-08-10 02:23:23.544738
2491	35	902	1	9	DEG_0	2026-08-10 02:23:23.5453
2492	35	904	2	1	DEG_0	2026-08-10 02:23:23.545864
2493	35	905	2	2	DEG_0	2026-08-10 02:23:23.546396
2494	35	906	2	3	DEG_0	2026-08-10 02:23:23.546937
2495	35	907	2	4	DEG_0	2026-08-10 02:23:23.549278
2496	35	\N	2	5	DEG_0	2026-08-10 02:23:23.549853
2497	35	908	2	6	DEG_0	2026-08-10 02:23:23.550404
2498	35	909	2	7	DEG_0	2026-08-10 02:23:23.550955
2499	35	910	2	8	DEG_0	2026-08-10 02:23:23.551499
2500	35	911	2	9	DEG_0	2026-08-10 02:23:23.552054
2501	35	913	3	1	DEG_0	2026-08-10 02:23:23.552762
2502	35	914	3	2	DEG_0	2026-08-10 02:23:23.553326
2503	35	915	3	3	DEG_0	2026-08-10 02:23:23.553888
2504	35	916	3	4	DEG_0	2026-08-10 02:23:23.554424
2505	35	\N	3	5	DEG_0	2026-08-10 02:23:23.55498
2506	35	917	3	6	DEG_0	2026-08-10 02:23:23.555523
2507	35	918	3	7	DEG_0	2026-08-10 02:23:23.556077
2508	35	919	3	8	DEG_0	2026-08-10 02:23:23.556614
2509	35	920	3	9	DEG_0	2026-08-10 02:23:23.55716
2510	35	922	4	1	DEG_0	2026-08-10 02:23:23.557742
2511	35	923	4	2	DEG_0	2026-08-10 02:23:23.558329
2512	35	924	4	3	DEG_0	2026-08-10 02:23:23.558894
2513	35	925	4	4	DEG_0	2026-08-10 02:23:23.559574
2514	35	\N	4	5	DEG_0	2026-08-10 02:23:23.560132
2515	35	926	4	6	DEG_0	2026-08-10 02:23:23.560738
2516	35	927	4	7	DEG_0	2026-08-10 02:23:23.561333
2517	35	928	4	8	DEG_0	2026-08-10 02:23:23.561907
2518	35	929	4	9	DEG_0	2026-08-10 02:23:23.562453
2519	35	1003	5	5	DEG_0	2026-08-10 02:23:23.563023
2520	35	931	6	1	DEG_0	2026-08-10 02:23:23.56368
2521	35	932	6	2	DEG_0	2026-08-10 02:23:23.564322
2522	35	933	6	3	DEG_0	2026-08-10 02:23:23.564927
2523	35	934	6	4	DEG_0	2026-08-10 02:23:23.565485
2524	35	\N	6	5	DEG_0	2026-08-10 02:23:23.566049
2525	35	935	6	6	DEG_0	2026-08-10 02:23:23.566576
2526	35	936	6	7	DEG_0	2026-08-10 02:23:23.567143
2527	35	937	6	8	DEG_0	2026-08-10 02:23:23.567889
2528	35	938	6	9	DEG_0	2026-08-10 02:23:23.5684
2529	35	940	7	1	DEG_0	2026-08-10 02:23:23.568909
2530	35	941	7	2	DEG_0	2026-08-10 02:23:23.56939
2531	35	942	7	3	DEG_0	2026-08-10 02:23:23.569935
2532	35	943	7	4	DEG_0	2026-08-10 02:23:23.570429
2533	35	\N	7	5	DEG_0	2026-08-10 02:23:23.570932
2534	35	944	7	6	DEG_0	2026-08-10 02:23:23.571418
2535	35	945	7	7	DEG_0	2026-08-10 02:23:23.57325
2536	35	946	7	8	DEG_0	2026-08-10 02:23:23.5738
2537	35	947	7	9	DEG_0	2026-08-10 02:23:23.574312
2538	35	949	8	1	DEG_0	2026-08-10 02:23:23.575522
2539	35	950	8	2	DEG_0	2026-08-10 02:23:23.57613
2540	35	951	8	3	DEG_0	2026-08-10 02:23:23.576761
2541	35	952	8	4	DEG_0	2026-08-10 02:23:23.577368
2542	35	\N	8	5	DEG_0	2026-08-10 02:23:23.577929
2543	35	953	8	6	DEG_0	2026-08-10 02:23:23.578427
2544	35	954	8	7	DEG_0	2026-08-10 02:23:23.578931
2545	35	955	8	8	DEG_0	2026-08-10 02:23:23.579469
2546	35	956	8	9	DEG_0	2026-08-10 02:23:23.579961
2547	35	958	9	1	DEG_0	2026-08-10 02:23:23.580442
2548	35	959	9	2	DEG_0	2026-08-10 02:23:23.58093
2549	35	960	9	3	DEG_0	2026-08-10 02:23:23.581402
2550	35	961	9	4	DEG_0	2026-08-10 02:23:23.581997
2551	35	\N	9	5	DEG_0	2026-08-10 02:23:23.582573
2552	35	962	9	6	DEG_0	2026-08-10 02:23:23.583123
2553	35	963	9	7	DEG_0	2026-08-10 02:23:23.583671
2554	35	964	9	8	DEG_0	2026-08-10 02:23:23.584175
2555	35	965	9	9	DEG_0	2026-08-10 02:23:23.584665
2556	36	895	1	1	DEG_0	2026-08-10 02:23:23.688268
2557	36	896	1	2	DEG_0	2026-08-10 02:23:23.688865
2558	36	897	1	3	DEG_0	2026-08-10 02:23:23.689362
2559	36	898	1	4	DEG_0	2026-08-10 02:23:23.689889
2560	36	\N	1	5	DEG_0	2026-08-10 02:23:23.690371
2561	36	899	1	6	DEG_0	2026-08-10 02:23:23.690889
2562	36	900	1	7	DEG_0	2026-08-10 02:23:23.691399
2563	36	901	1	8	DEG_0	2026-08-10 02:23:23.692004
2564	36	902	1	9	DEG_0	2026-08-10 02:23:23.692543
2565	36	904	2	1	DEG_0	2026-08-10 02:23:23.693057
2566	36	905	2	2	DEG_0	2026-08-10 02:23:23.693533
2567	36	906	2	3	DEG_0	2026-08-10 02:23:23.694031
2568	36	907	2	4	DEG_0	2026-08-10 02:23:23.694512
2569	36	\N	2	5	DEG_0	2026-08-10 02:23:23.695053
2570	36	908	2	6	DEG_0	2026-08-10 02:23:23.695524
2571	36	909	2	7	DEG_0	2026-08-10 02:23:23.696019
2572	36	910	2	8	DEG_0	2026-08-10 02:23:23.696493
2573	36	911	2	9	DEG_0	2026-08-10 02:23:23.697012
2574	36	913	3	1	DEG_0	2026-08-10 02:23:23.697659
2575	36	914	3	2	DEG_0	2026-08-10 02:23:23.698163
2576	36	915	3	3	DEG_0	2026-08-10 02:23:23.698651
2577	36	916	3	4	DEG_0	2026-08-10 02:23:23.699132
2578	36	\N	3	5	DEG_0	2026-08-10 02:23:23.699597
2579	36	917	3	6	DEG_0	2026-08-10 02:23:23.70007
2580	36	918	3	7	DEG_0	2026-08-10 02:23:23.700545
2581	36	919	3	8	DEG_0	2026-08-10 02:23:23.701042
2582	36	920	3	9	DEG_0	2026-08-10 02:23:23.701542
2583	36	922	4	1	DEG_0	2026-08-10 02:23:23.702107
2584	36	923	4	2	DEG_0	2026-08-10 02:23:23.702621
2585	36	924	4	3	DEG_0	2026-08-10 02:23:23.703125
2586	36	925	4	4	DEG_0	2026-08-10 02:23:23.703636
2587	36	\N	4	5	DEG_0	2026-08-10 02:23:23.704131
2588	36	926	4	6	DEG_0	2026-08-10 02:23:23.704686
2589	36	927	4	7	DEG_0	2026-08-10 02:23:23.705179
2590	36	928	4	8	DEG_0	2026-08-10 02:23:23.70566
2591	36	929	4	9	DEG_0	2026-08-10 02:23:23.706133
2592	36	1003	5	5	DEG_0	2026-08-10 02:23:23.706592
2593	36	931	6	1	DEG_0	2026-08-10 02:23:23.707062
2594	36	932	6	2	DEG_0	2026-08-10 02:23:23.70755
2595	36	933	6	3	DEG_0	2026-08-10 02:23:23.70804
2596	36	934	6	4	DEG_0	2026-08-10 02:23:23.70882
2597	36	\N	6	5	DEG_0	2026-08-10 02:23:23.709362
2598	36	935	6	6	DEG_0	2026-08-10 02:23:23.709908
2599	36	936	6	7	DEG_0	2026-08-10 02:23:23.710408
2600	36	937	6	8	DEG_0	2026-08-10 02:23:23.710937
2601	36	938	6	9	DEG_0	2026-08-10 02:23:23.711428
2602	36	940	7	1	DEG_0	2026-08-10 02:23:23.711986
2603	36	941	7	2	DEG_0	2026-08-10 02:23:23.712547
2604	36	942	7	3	DEG_0	2026-08-10 02:23:23.713066
2605	36	943	7	4	DEG_0	2026-08-10 02:23:23.713659
2606	36	\N	7	5	DEG_0	2026-08-10 02:23:23.714244
2607	36	944	7	6	DEG_0	2026-08-10 02:23:23.714739
2608	36	945	7	7	DEG_0	2026-08-10 02:23:23.715251
2609	36	946	7	8	DEG_0	2026-08-10 02:23:23.715842
2610	36	947	7	9	DEG_0	2026-08-10 02:23:23.716425
2611	36	949	8	1	DEG_0	2026-08-10 02:23:23.71703
2612	36	950	8	2	DEG_0	2026-08-10 02:23:23.717617
2613	36	951	8	3	DEG_0	2026-08-10 02:23:23.718125
2614	36	952	8	4	DEG_0	2026-08-10 02:23:23.718626
2615	36	\N	8	5	DEG_0	2026-08-10 02:23:23.719109
2616	36	953	8	6	DEG_0	2026-08-10 02:23:23.719588
2617	36	954	8	7	DEG_0	2026-08-10 02:23:23.720115
2618	36	955	8	8	DEG_0	2026-08-10 02:23:23.720617
2619	36	956	8	9	DEG_0	2026-08-10 02:23:23.721079
2620	36	958	9	1	DEG_0	2026-08-10 02:23:23.721639
2621	36	959	9	2	DEG_0	2026-08-10 02:23:23.722239
2622	36	960	9	3	DEG_0	2026-08-10 02:23:23.72293
2623	36	961	9	4	DEG_0	2026-08-10 02:23:23.723511
2624	36	\N	9	5	DEG_0	2026-08-10 02:23:23.724107
2625	36	962	9	6	DEG_0	2026-08-10 02:23:23.724667
2626	36	963	9	7	DEG_0	2026-08-10 02:23:23.725301
2627	36	964	9	8	DEG_0	2026-08-10 02:23:23.725879
2628	36	965	9	9	DEG_0	2026-08-10 02:23:23.7264
925	13	96	7	3	DEG_0	2026-08-04 07:11:36.126745
146	2	1031	9	9	DEG_0	2026-08-03 01:43:07.594103
119	2	609	6	9	DEG_0	2026-08-03 01:43:07.57429
1827	26	\N	1	2	DEG_0	2026-08-07 12:27:02.359898
1828	26	\N	1	3	DEG_0	2026-08-07 12:27:02.360493
1829	26	\N	1	4	DEG_0	2026-08-07 12:27:02.361243
1830	26	\N	1	5	DEG_0	2026-08-07 12:27:02.36407
1831	26	\N	1	6	DEG_0	2026-08-07 12:27:02.364881
110	2	26	5	5	DEG_0	2026-08-03 01:43:07.56768
1832	26	\N	1	7	DEG_0	2026-08-07 12:27:02.365534
1833	26	\N	1	8	DEG_0	2026-08-07 12:27:02.366152
1834	26	\N	1	9	DEG_0	2026-08-07 12:27:02.366697
1835	26	\N	2	1	DEG_0	2026-08-07 12:27:02.367213
1836	26	\N	2	2	DEG_0	2026-08-07 12:27:02.370199
1837	26	\N	2	3	DEG_0	2026-08-07 12:27:02.370761
1838	26	\N	2	4	DEG_0	2026-08-07 12:27:02.371325
1839	26	\N	2	5	DEG_0	2026-08-07 12:27:02.371971
1840	26	\N	2	6	DEG_0	2026-08-07 12:27:02.372482
1841	26	\N	2	7	DEG_0	2026-08-07 12:27:02.372976
1842	26	\N	2	8	DEG_0	2026-08-07 12:27:02.373432
1843	26	\N	2	9	DEG_0	2026-08-07 12:27:02.37422
1844	26	\N	3	1	DEG_0	2026-08-07 12:27:02.374845
1845	26	\N	3	2	DEG_0	2026-08-07 12:27:02.375862
1846	26	\N	3	3	DEG_0	2026-08-07 12:27:02.376427
1847	26	\N	3	4	DEG_0	2026-08-07 12:27:02.376915
1848	26	\N	3	5	DEG_0	2026-08-07 12:27:02.377534
1849	26	\N	3	6	DEG_0	2026-08-07 12:27:02.378146
1850	26	\N	3	7	DEG_0	2026-08-07 12:27:02.378702
1851	26	\N	3	8	DEG_0	2026-08-07 12:27:02.379268
1852	26	\N	3	9	DEG_0	2026-08-07 12:27:02.379843
1853	26	\N	4	1	DEG_0	2026-08-07 12:27:02.380382
1854	26	\N	4	2	DEG_0	2026-08-07 12:27:02.380868
1855	26	\N	4	3	DEG_0	2026-08-07 12:27:02.38131
1856	26	\N	4	4	DEG_0	2026-08-07 12:27:02.381723
1857	26	\N	4	5	DEG_0	2026-08-07 12:27:02.382181
1858	26	\N	4	6	DEG_0	2026-08-07 12:27:02.382597
1859	26	\N	4	7	DEG_0	2026-08-07 12:27:02.383035
1860	26	\N	4	8	DEG_0	2026-08-07 12:27:02.383485
1861	26	\N	4	9	DEG_0	2026-08-07 12:27:02.383996
1862	26	\N	5	5	DEG_0	2026-08-07 12:27:02.384519
1863	26	\N	6	1	DEG_0	2026-08-07 12:27:02.385822
1864	26	\N	6	2	DEG_0	2026-08-07 12:27:02.386264
1865	26	\N	6	3	DEG_0	2026-08-07 12:27:02.386671
1866	26	\N	6	4	DEG_0	2026-08-07 12:27:02.387112
1867	26	\N	6	5	DEG_0	2026-08-07 12:27:02.388062
1868	26	\N	6	6	DEG_0	2026-08-07 12:27:02.388489
1869	26	\N	6	7	DEG_0	2026-08-07 12:27:02.38892
1870	26	\N	6	8	DEG_0	2026-08-07 12:27:02.389327
1871	26	\N	6	9	DEG_0	2026-08-07 12:27:02.389751
1872	26	\N	7	1	DEG_0	2026-08-07 12:27:02.390196
1873	26	\N	7	2	DEG_0	2026-08-07 12:27:02.390609
1874	26	\N	7	3	DEG_0	2026-08-07 12:27:02.391004
1875	26	\N	7	4	DEG_0	2026-08-07 12:27:02.391417
1876	26	\N	7	5	DEG_0	2026-08-07 12:27:02.391842
1877	26	\N	7	6	DEG_0	2026-08-07 12:27:02.392286
1878	26	\N	7	7	DEG_0	2026-08-07 12:27:02.392692
1879	26	\N	7	8	DEG_0	2026-08-07 12:27:02.393069
1534	22	\N	1	1	DEG_0	2026-08-06 05:24:47.271569
1535	22	\N	1	2	DEG_0	2026-08-06 05:24:47.273758
1536	22	\N	1	3	DEG_0	2026-08-06 05:24:47.274393
1537	22	\N	1	4	DEG_0	2026-08-06 05:24:47.275009
1538	22	\N	1	5	DEG_0	2026-08-06 05:24:47.275498
1539	22	\N	1	6	DEG_0	2026-08-06 05:24:47.276016
1540	22	\N	1	7	DEG_0	2026-08-06 05:24:47.276514
1541	22	\N	1	8	DEG_0	2026-08-06 05:24:47.276969
1542	22	\N	1	9	DEG_0	2026-08-06 05:24:47.277393
1543	22	\N	2	1	DEG_0	2026-08-06 05:24:47.277825
1544	22	\N	2	2	DEG_0	2026-08-06 05:24:47.278244
1545	22	\N	2	3	DEG_0	2026-08-06 05:24:47.278638
1546	22	\N	2	4	DEG_0	2026-08-06 05:24:47.279024
1547	22	\N	2	5	DEG_0	2026-08-06 05:24:47.279402
1548	22	\N	2	6	DEG_0	2026-08-06 05:24:47.279801
1549	22	\N	2	7	DEG_0	2026-08-06 05:24:47.280394
1550	22	\N	2	8	DEG_0	2026-08-06 05:24:47.280886
1551	22	\N	2	9	DEG_0	2026-08-06 05:24:47.281306
1552	22	\N	3	1	DEG_0	2026-08-06 05:24:47.281743
1553	22	\N	3	2	DEG_0	2026-08-06 05:24:47.282159
1554	22	\N	3	3	DEG_0	2026-08-06 05:24:47.282553
1555	22	\N	3	4	DEG_0	2026-08-06 05:24:47.28295
1556	22	\N	3	5	DEG_0	2026-08-06 05:24:47.283325
1557	22	\N	3	6	DEG_0	2026-08-06 05:24:47.283703
1558	22	\N	3	7	DEG_0	2026-08-06 05:24:47.284075
1559	22	\N	3	8	DEG_0	2026-08-06 05:24:47.284432
1560	22	\N	3	9	DEG_0	2026-08-06 05:24:47.284814
1561	22	\N	4	1	DEG_0	2026-08-06 05:24:47.285194
1562	22	\N	4	2	DEG_0	2026-08-06 05:24:47.285552
1563	22	\N	4	3	DEG_0	2026-08-06 05:24:47.286014
1564	22	\N	4	4	DEG_0	2026-08-06 05:24:47.286425
1565	22	\N	4	5	DEG_0	2026-08-06 05:24:47.286857
1566	22	\N	4	6	DEG_0	2026-08-06 05:24:47.287287
1567	22	\N	4	7	DEG_0	2026-08-06 05:24:47.287709
1568	22	\N	4	8	DEG_0	2026-08-06 05:24:47.288139
1569	22	\N	4	9	DEG_0	2026-08-06 05:24:47.288517
1880	26	\N	7	9	DEG_0	2026-08-07 12:27:02.393456
1571	22	\N	6	1	DEG_0	2026-08-06 05:24:47.289303
1572	22	\N	6	2	DEG_0	2026-08-06 05:24:47.289686
1573	22	\N	6	3	DEG_0	2026-08-06 05:24:47.290041
1574	22	\N	6	4	DEG_0	2026-08-06 05:24:47.290396
1575	22	\N	6	5	DEG_0	2026-08-06 05:24:47.290755
1576	22	\N	6	6	DEG_0	2026-08-06 05:24:47.29113
1577	22	\N	6	7	DEG_0	2026-08-06 05:24:47.291517
1578	22	\N	6	8	DEG_0	2026-08-06 05:24:47.291891
1579	22	\N	6	9	DEG_0	2026-08-06 05:24:47.292249
1580	22	\N	7	1	DEG_0	2026-08-06 05:24:47.292606
1581	22	\N	7	2	DEG_0	2026-08-06 05:24:47.292988
1582	22	\N	7	3	DEG_0	2026-08-06 05:24:47.293346
1583	22	\N	7	4	DEG_0	2026-08-06 05:24:47.293701
1584	22	\N	7	5	DEG_0	2026-08-06 05:24:47.294049
1585	22	\N	7	6	DEG_0	2026-08-06 05:24:47.294408
1586	22	\N	7	7	DEG_0	2026-08-06 05:24:47.294768
1587	22	\N	7	8	DEG_0	2026-08-06 05:24:47.295146
1588	22	\N	7	9	DEG_0	2026-08-06 05:24:47.295529
1589	22	\N	8	1	DEG_0	2026-08-06 05:24:47.296665
1590	22	\N	8	2	DEG_0	2026-08-06 05:24:47.297064
1591	22	\N	8	3	DEG_0	2026-08-06 05:24:47.297443
1592	22	\N	8	4	DEG_0	2026-08-06 05:24:47.297961
1593	22	\N	8	5	DEG_0	2026-08-06 05:24:47.298357
1594	22	\N	8	6	DEG_0	2026-08-06 05:24:47.298739
1595	22	\N	8	7	DEG_0	2026-08-06 05:24:47.299199
1596	22	\N	8	8	DEG_0	2026-08-06 05:24:47.299682
1597	22	\N	8	9	DEG_0	2026-08-06 05:24:47.300194
1598	22	\N	9	1	DEG_0	2026-08-06 05:24:47.300605
1881	26	\N	8	1	DEG_0	2026-08-07 12:27:02.393862
1882	26	\N	8	2	DEG_0	2026-08-07 12:27:02.394249
1601	22	\N	9	4	DEG_0	2026-08-06 05:24:47.301871
1602	22	\N	9	5	DEG_0	2026-08-06 05:24:47.302293
1883	26	\N	8	3	DEG_0	2026-08-07 12:27:02.394638
1884	26	\N	8	4	DEG_0	2026-08-07 12:27:02.395092
1885	26	\N	8	5	DEG_0	2026-08-07 12:27:02.395499
1887	26	\N	8	7	DEG_0	2026-08-07 12:27:02.396359
1888	26	\N	8	8	DEG_0	2026-08-07 12:27:02.396762
1889	26	\N	8	9	DEG_0	2026-08-07 12:27:02.39723
1890	26	\N	9	1	DEG_0	2026-08-07 12:27:02.397639
1891	26	\N	9	2	DEG_0	2026-08-07 12:27:02.398038
1892	26	\N	9	3	DEG_0	2026-08-07 12:27:02.398596
1893	26	\N	9	4	DEG_0	2026-08-07 12:27:02.399179
1894	26	\N	9	5	DEG_0	2026-08-07 12:27:02.399614
1895	26	\N	9	6	DEG_0	2026-08-07 12:27:02.400256
1896	26	\N	9	7	DEG_0	2026-08-07 12:27:02.400835
1570	22	140	5	5	DEG_0	2026-08-06 05:24:47.288919
1897	26	\N	9	8	DEG_0	2026-08-07 12:27:02.401341
1898	26	\N	9	9	DEG_0	2026-08-07 12:27:02.401856
1600	22	\N	9	3	DEG_0	2026-08-06 05:24:47.301476
1886	26	194	8	6	DEG_0	2026-08-07 12:27:02.395951
1606	22	\N	9	9	DEG_0	2026-08-06 05:24:47.304421
1605	22	604	9	8	DEG_0	2026-08-06 05:24:47.304032
1599	22	\N	9	2	DEG_0	2026-08-06 05:24:47.301013
1603	22	\N	9	6	DEG_0	2026-08-06 05:24:47.303116
1604	22	605	9	7	DEG_0	2026-08-06 05:24:47.303509
1	1	49	1	1	DEG_0	2026-08-03 01:40:30.997528
109	2	1030	4	9	DEG_0	2026-08-03 01:43:07.566996
\.


--
-- Data for Name: likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.likes (user_id, sheet_id, created_at) FROM stdin;
3	10	2026-08-04 05:09:39.997021
6	6	2026-08-10 11:19:28.959233
6	2	2026-08-10 11:24:56.004871
\.


--
-- Data for Name: oauth_identities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.oauth_identities (id, user_id, provider, provider_user_id, created_at, updated_at) FROM stdin;
1	1	KAKAO	5004964793	2026-08-03 01:15:46.502938	2026-08-03 01:15:46.502938
2	2	KAKAO	5004795651	2026-08-03 01:17:40.666949	2026-08-03 01:17:40.666949
3	3	KAKAO	5014811881	2026-08-03 01:40:21.646419	2026-08-03 01:40:21.646419
4	4	KAKAO	5015794606	2026-08-03 06:30:39.949957	2026-08-03 06:30:39.949957
5	5	KAKAO	5021091410	2026-08-03 07:21:27.402647	2026-08-03 07:21:27.402647
6	6	KAKAO	5014777686	2026-08-04 00:18:34.77105	2026-08-04 00:18:34.77105
7	7	KAKAO	5014600504	2026-08-04 01:28:19.205347	2026-08-04 01:28:19.205347
8	8	KAKAO	5014553800	2026-08-04 01:39:22.204056	2026-08-04 01:39:22.204056
9	9	KAKAO	5014488594	2026-08-05 04:26:26.207222	2026-08-05 04:26:26.207222
\.


--
-- Data for Name: refresh_token; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_token (id, uuid, device_id, token, expires_at, created_at, updated_at) FROM stdin;
24	c22daa37-ad8b-47e1-8596-d668b62de2ea	9bdaeccd-69e4-49a1-a8ca-1ac2292623eb	3efaa295b3b3952d00418a100169ab926d11c01dfe59886d1ee36ec045f3676a	2026-08-11 06:04:01.357925	2026-08-04 06:04:01.358146	2026-08-04 06:04:01.358146
68	2c9b47f7-f2d4-4b82-b24a-86e77ce24547	1f0611b4-e0e6-448e-8f36-7bbfb0ec285b	89d5cd96fb0c4370531359e443e751aaa03b8c0bd82e7f391d4e8b6c675c4783	2026-08-16 15:33:24.524148	2026-08-09 06:33:24.524286	2026-08-09 06:33:24.524286
28	981b74be-5c72-43d5-9830-f29b64f9dd76	d88ec9cc-f73f-4cf8-be24-8c046e9f96cb	8dcdc7ac7559290abc564edc7ba3417314d0bddef136a5949dced341645bb508	2026-08-12 06:54:44.380102	2026-08-05 00:09:28.06357	2026-08-05 06:54:44.381825
7	70958eb5-9987-4b37-82c0-fe93b485a97e	6c0c811b-fd99-4bfe-8894-b0959b399cb5	460f40c69073584c5c54c0ec05e0037943ca0c79a37ab2e3e9c23a9cd00966b5	2026-08-11 06:45:30.82468	2026-08-03 07:21:27.582009	2026-08-04 06:45:30.824966
58	2c9b47f7-f2d4-4b82-b24a-86e77ce24547	c2ce825b-33fc-44a6-a85d-f4cb53964607	855935aa5be6e6b4b6f02b541eb2c0860ae8c4c35d3cf21e09a2f9fee400da56	2026-08-17 09:01:42.301167	2026-08-07 08:32:28.59797	2026-08-10 00:01:42.301518
17	c22daa37-ad8b-47e1-8596-d668b62de2ea	07dd3b16-81c9-476b-a328-0bfc0d147207	832922a06a4db4caf988ff32c1376c6de2fb321c4acd8aaeced597168249d14e	2026-08-17 10:53:04.998431	2026-08-04 03:06:46.045933	2026-08-10 01:53:04.99865
55	50392369-9c09-45f8-9943-bc22bac6effc	efe70d64-28d0-413b-9b5f-7e71d9fa84cc	55c9c490080494b9c28be1b8576c2592175a7323cf5772041cda0bd5f173223b	2026-08-14 14:31:44.368678	2026-08-07 05:31:44.36915	2026-08-07 05:31:44.36915
56	2132394d-8d53-4f61-ab3e-0e7e40e128a0	cf4a643a-97fa-45db-ae7c-bdc2f03b6eea	d356e2a4951f30a2ff32751508d741dc59e469febef39d3f37e84c22e79475ce	2026-08-14 14:43:06.207952	2026-08-07 05:43:06.208069	2026-08-07 05:43:06.208069
27	70958eb5-9987-4b37-82c0-fe93b485a97e	bcd8601e-9c71-4a60-8668-120d3b52e5f4	2b13dcaa67a9b50785110f8ddaed687c87f779a8266cc2c74dccc09e442d2bb7	2026-08-13 07:07:00.736851	2026-08-04 07:09:15.390422	2026-08-06 07:07:00.737045
57	50392369-9c09-45f8-9943-bc22bac6effc	8d7d8134-96ce-49c7-9bba-e9e246235514	9dbc0927d5599410fb5ae2debcae777f7f6fbaa8f0f15bdc84f70b4687bd6cbc	2026-08-14 16:18:19.953985	2026-08-07 07:18:19.954202	2026-08-07 07:18:19.954202
8	2c9b47f7-f2d4-4b82-b24a-86e77ce24547	2aca5d7d-64c9-4b7b-8f83-be74145ebad8	d898c150476201e5a91601c44f9daf2a7c4a697f1e17a84186517c9277404066	2026-08-12 13:07:10.649889	2026-08-03 12:22:35.361365	2026-08-05 13:07:10.650253
44	2c9b47f7-f2d4-4b82-b24a-86e77ce24547	e9e2fb17-46c1-4f35-a456-23d1f94c9d15	6672fc8e83fab8785b81588b786f283276a6670f2d5158f3304c5bf7cab80f5d	2026-08-13 21:52:11.426721	2026-08-06 09:47:08.235294	2026-08-06 12:52:11.427228
13	2132394d-8d53-4f61-ab3e-0e7e40e128a0	10590f3d-92e3-4ba7-91c7-a8a69c1cc0d8	a4f5b82983df0e81b4073fda9f4af956b4c8f39b4f2819091bca5e95cba88430	2026-08-11 01:50:14.210884	2026-08-04 01:50:14.211062	2026-08-04 01:50:14.211062
14	2c9b47f7-f2d4-4b82-b24a-86e77ce24547	33e0b2ec-1e7b-4123-a72b-d01bfa749063	3be95d5b25c67fc11b54e673894559d2715bd7982e1dcec8380a9b4eaff4139b	2026-08-11 01:54:53.941494	2026-08-04 01:54:53.941669	2026-08-04 01:54:53.941669
12	c22daa37-ad8b-47e1-8596-d668b62de2ea	4cd5516e-fece-4b9f-abb4-8b1e22b264ee	0b4d5a71d55df5c67a026386e16c6075500d9898889e3932329a1e84b53d88b6	2026-08-11 03:05:56.13558	2026-08-04 01:39:22.51399	2026-08-04 03:05:56.135969
15	c22daa37-ad8b-47e1-8596-d668b62de2ea	9128c03a-9f0a-4f2a-9301-0bc6f897e9c7	f13b07e5c54ff2edf10c023e1d135fa8b949b617809008b22648c670b264612f	2026-08-11 03:06:12.424474	2026-08-04 03:06:12.424675	2026-08-04 03:06:12.424675
16	c22daa37-ad8b-47e1-8596-d668b62de2ea	9092b194-a794-499e-a6f4-2989c08d958f	0670f7e781dbd14965e5a84af5c4b4b9f596ed22c875556b95f16e7fb0f811da	2026-08-11 03:06:19.498063	2026-08-04 03:06:19.498239	2026-08-04 03:06:19.498239
18	c22daa37-ad8b-47e1-8596-d668b62de2ea	d75cfdc9-a78c-41a7-830c-6fa4019ebccb	e4c857c2e8d9a6ede0a3ff0da81d28ef05a9a7724fe3d5140ca3f0b99de42bf1	2026-08-11 03:07:19.694741	2026-08-04 03:07:19.694975	2026-08-04 03:07:19.694975
6	981b74be-5c72-43d5-9830-f29b64f9dd76	1c14ab9d-684d-4681-925f-90d42806f101	6394d16bc928d8a24a3002340f3b27870ca5a47f682b161b6f154df732b5e5a2	2026-08-11 03:48:29.567974	2026-08-03 06:30:40.085569	2026-08-04 03:48:29.584436
29	50392369-9c09-45f8-9943-bc22bac6effc	579a6fbc-d3b1-498c-9d7c-4f29cef15e02	bc91803204b7822dabc36b5cf5fab7d9d752c4bc5c6afc3dad143f0957c22fa2	2026-08-12 01:38:00.867524	2026-08-05 01:38:00.867741	2026-08-05 01:38:00.867741
20	c22daa37-ad8b-47e1-8596-d668b62de2ea	275e90f9-48a2-46a8-b169-34ed59267f4f	fabf34cb57ded3b56baa3a1c78b5fc8615e129e3cdd03c929e7cca46c02396e6	2026-08-11 04:11:02.199212	2026-08-04 04:11:02.199795	2026-08-04 04:11:02.199795
36	50392369-9c09-45f8-9943-bc22bac6effc	8a1731a4-f981-4da0-8e2a-d0f6459e7ef5	07020a966cd7aee6ade2e44908386834a2389c7c8e464c5df0d18b2fc54c76c4	2026-08-13 01:16:54.923365	2026-08-06 01:16:54.923545	2026-08-06 01:16:54.923545
30	427d89e0-bf22-4bed-96b3-2b611e783d86	e170bf1a-8295-447b-91b4-aa4001f10008	8cba7cb67b124e6f5ae5f689632924b7a04e8960f0727ad74c68812d22fb58ae	2026-08-14 12:11:26.36432	2026-08-05 04:26:26.525254	2026-08-07 03:11:26.364674
22	c22daa37-ad8b-47e1-8596-d668b62de2ea	63fac735-aeac-4d40-a667-9a58ff41a407	6bf810e0bb6f13c2182fa88797b58cc16ddd6d0648ea089241f84c472dd466c5	2026-08-11 04:41:53.05605	2026-08-04 04:41:53.0564	2026-08-04 04:41:53.0564
42	2c9b47f7-f2d4-4b82-b24a-86e77ce24547	179789ff-76a9-4bae-b2f8-7dba617f4c3e	7a6bf60b50022d9b2d6c5085668063560ecf7abdee4968778c00c87eeec3a102	2026-08-14 12:24:24.470886	2026-08-06 05:59:00.83003	2026-08-07 03:24:24.471149
45	981b74be-5c72-43d5-9830-f29b64f9dd76	c0aa2ffb-ea74-409d-b999-b2b962cc819b	471b209a45d9a042ca7a5904cb98bdf7a17f4bfc164ce30e5982b6b2462339ee	2026-08-15 16:32:47.332266	2026-08-07 00:25:17.989392	2026-08-08 07:32:47.332537
49	2132394d-8d53-4f61-ab3e-0e7e40e128a0	6e29ac93-b7f4-49ec-933e-1ff3fb2df1a2	73a9038e1085b62c44f9f063e9b92b4cc40fb164567f83f4e235d79cfd69d33e	2026-08-14 13:00:53.594048	2026-08-07 04:00:53.594168	2026-08-07 04:00:53.594168
50	2132394d-8d53-4f61-ab3e-0e7e40e128a0	fccd1af3-5d2e-45bd-ba8a-9e38fb5b3d3c	faa406b001827f73ec43d89cdf53de4541043ed691d7e097d26435a986e2854d	2026-08-14 13:01:01.797388	2026-08-07 04:01:01.797501	2026-08-07 04:01:01.797501
51	c22daa37-ad8b-47e1-8596-d668b62de2ea	7beadf8a-62c4-4085-92ef-0ba8ac9a2491	a9399a2c73695bf3edd5b1085f6a6147f8cd5080dd5663a82d5362b63931733c	2026-08-14 13:03:57.512699	2026-08-07 04:03:57.512836	2026-08-07 04:03:57.512836
52	c22daa37-ad8b-47e1-8596-d668b62de2ea	7a3e9451-9dc5-4150-8e4b-f54687d991dd	8a7daa433d9da8522eed8945591ef2073a49abea14f040df793546e4132bd705	2026-08-14 13:05:19.043523	2026-08-07 04:05:19.043902	2026-08-07 04:05:19.043902
59	981b74be-5c72-43d5-9830-f29b64f9dd76	c0b11d8c-342f-4184-b2a4-527c306f6e81	d0be759256294b4ecf54493392e16187d02a436cf0acbf9a36ba4e0c5c8e092f	2026-08-15 19:15:02.597339	2026-08-08 01:14:38.15923	2026-08-08 10:15:02.597666
53	c22daa37-ad8b-47e1-8596-d668b62de2ea	ca3d1f24-910d-4853-9b6e-b6b38ca87415	3c2801b8a6486e106d7fdff39beb1a615b34a6a6d4817a3785672d48c4e1a043	2026-08-14 13:06:57.978997	2026-08-07 04:06:57.979118	2026-08-07 04:06:57.979118
54	2132394d-8d53-4f61-ab3e-0e7e40e128a0	0cc26e26-4e4e-44f3-bb37-0cec4d343b1c	19040d98dd7b45e82e55b9f17b78481cbf95046c1eb919dff3d4a210964aed63	2026-08-14 13:25:46.107759	2026-08-07 04:25:46.107911	2026-08-07 04:25:46.107911
70	9a8b057b-5ed4-43a9-ad50-817b633ec18e	933c3b14-0a84-4790-90b3-89c110783c39	95866d149a4b21b44fda969c63497278ccabc44c40b8d4b9950271a16405c88e	2026-08-16 18:16:30.135606	2026-08-09 09:16:30.13575	2026-08-09 09:16:30.13575
72	tester-1	d52e4d29-ab98-474c-9e62-23a1c7c59123	5758a9903668d0ee28f2d5f439687a824d3f1eb23dc85ed2a967390760e09576	2026-08-17 02:23:23.885679	2026-08-09 17:23:23.886971	2026-08-09 17:23:23.886971
73	tester-2	6c45a493-0e66-4d8d-a73e-b708d986557a	897f991fc0ed357cd04e6977613632b914cf6d7d5e567397bf5df4c64ceb352e	2026-08-17 02:23:23.984052	2026-08-09 17:23:23.98419	2026-08-09 17:23:23.98419
74	tester-3	1015acf3-deb2-4c91-8f29-405e149f1add	fdd92def1991ca82c0c7d449ba35c4b0bea809b8e25e65b8f3e6373a43483bd2	2026-08-17 02:23:24.054299	2026-08-09 17:23:24.054427	2026-08-09 17:23:24.054427
75	tester-1	d0cf7f13-9b76-4651-94fe-a409b5d6a91f	a12ef2e20b30407f4fdda3588683885e1405e1dbbc657daa00a39ce0bd5822b5	2026-08-17 02:23:57.072822	2026-08-09 17:23:57.07296	2026-08-09 17:23:57.07296
76	tester-2	10b4e27f-dd93-41c5-939f-50540cf985ca	a8ae74c24e07b7ef57eba79a5d34c1a8ff5f78e08e0825d971b0233059be4264	2026-08-17 02:23:57.663394	2026-08-09 17:23:57.663553	2026-08-09 17:23:57.663553
77	tester-3	192964dc-d7eb-4215-9c21-98c8a5d6d789	d4e11be210ffedd7ae585075fd7368862dd80435c4b1a72f0f8392bec5f85739	2026-08-17 02:23:57.889721	2026-08-09 17:23:57.889889	2026-08-09 17:23:57.889889
78	tester-1	a996d406-50b8-498f-a145-216321dece96	73fe8eb72a53c76e26b6ac5d90ce6e82b2a459ec534e0359ffec3e36405f7812	2026-08-17 02:27:04.539657	2026-08-09 17:27:04.53982	2026-08-09 17:27:04.53982
79	tester-1	e43cc7b9-d413-406a-b1c6-c2b571b67d39	4189202363fbfda8d7c688c6a90dc0869e821bdd1fd91c5bd9783ec8529b3b6f	2026-08-17 08:26:07.490256	2026-08-09 23:26:07.490433	2026-08-09 23:26:07.490433
83	2c9b47f7-f2d4-4b82-b24a-86e77ce24547	e4c94842-a63f-4cfe-b6a7-1de893c9d4ef	169f137ae458af86ae94fcdc88463bbf4085f779c07e5ed534adfbdf810d14d4	2026-08-17 09:40:57.103218	2026-08-10 00:40:57.103335	2026-08-10 00:40:57.103335
85	9a8b057b-5ed4-43a9-ad50-817b633ec18e	e1dab5e6-e142-4137-be32-69fa2c476c31	ab3bdc97589e0192d527b7feb7449182829a1dc1574944168fa1978916cc7130	2026-08-17 10:29:27.042117	2026-08-10 01:19:20.747923	2026-08-10 01:29:27.042354
82	981b74be-5c72-43d5-9830-f29b64f9dd76	7e780284-e457-4785-810a-1a9fc9467a80	0dca7112129454c489412b01e3e560602fc5ca2367edd02b1e6eb81f2dc5930d	2026-08-17 11:20:19.403999	2026-08-10 00:06:38.209494	2026-08-10 02:20:19.404245
86	2132394d-8d53-4f61-ab3e-0e7e40e128a0	783b72e4-f8af-4ab7-925e-c31bb1146b8b	aac331938d0fd4c440654f0c17b2fa7adad994fec351fe7ac0ef719e30029917	2026-08-17 11:24:52.009645	2026-08-10 01:23:01.724089	2026-08-10 02:24:52.009891
84	af7c2693-469d-4dbd-bfa3-a90a5d409fd9	a5417b0c-649f-41fd-bc62-90f2ec3184fe	cddac7f5dc4932b0d689a6f47eabc72f97c768ec47b0f17ef2cb4927fefef4f2	2026-08-17 11:29:20.585964	2026-08-10 00:50:20.952741	2026-08-10 02:29:20.586179
81	70958eb5-9987-4b37-82c0-fe93b485a97e	f6f120cd-08e6-4871-a535-20ece67b3958	82002f3dc9dcf599662164e8f0ed6d96bd8ebfc1f4cf56a1e5380cec6fc15594	2026-08-17 11:29:34.78325	2026-08-10 00:03:13.192748	2026-08-10 02:29:34.783456
\.


--
-- Data for Name: request; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.request (id, sender_id, receiver_id, progress, created_at) FROM stdin;
1	2	6	ACCEPTED	2026-08-04 04:05:11.465549
2	4	6	ACCEPTED	2026-08-04 04:07:39.899456
7	3	1	ACCEPTED	2026-08-04 05:11:43.979203
8	6	1	ACCEPTED	2026-08-04 05:11:49.357427
10	4	1	ACCEPTED	2026-08-04 05:24:53.331884
9	6	3	ACCEPTED	2026-08-04 05:11:57.037492
6	7	8	ACCEPTED	2026-08-04 04:44:24.364041
5	5	8	ACCEPTED	2026-08-04 04:37:16.762614
4	2	8	ACCEPTED	2026-08-04 04:35:12.885063
3	1	8	ACCEPTED	2026-08-04 04:34:54.293674
11	4	8	ACCEPTED	2026-08-07 15:33:12.222252
\.


--
-- Data for Name: reward_claim; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reward_claim (id, user_id, milestone, kind, granted_point, created_at, updated_at) FROM stdin;
1	8	1	CREDIT	1000	2026-08-07 03:17:19.215751	2026-08-07 03:17:19.215751
2	4	1	CREDIT	1000	2026-08-09 23:42:35.808671	2026-08-09 23:42:35.808671
3	3	1	CREDIT	1000	2026-08-10 00:33:24.934317	2026-08-10 00:33:24.934317
4	3	2	CREDIT	1000	2026-08-10 00:33:26.957276	2026-08-10 00:33:26.957276
5	3	3	CREDIT	1000	2026-08-10 00:33:30.608668	2026-08-10 00:33:30.608668
6	3	4	CREDIT	1000	2026-08-10 00:33:33.509843	2026-08-10 00:33:33.509843
7	3	5	CREDIT	1000	2026-08-10 00:33:35.207146	2026-08-10 00:33:35.207146
\.


--
-- Data for Name: reward_claim_item; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.reward_claim_item (id, reward_claim_id, building_item_id) FROM stdin;
\.


--
-- Data for Name: sheet; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sheet (id, user_id, title, is_open, like_count, expired_at, created_at, updated_at) FROM stdin;
31	13	개발자로 성장하기	t	0	2026-10-09 02:23:22.438316	2026-08-09 17:23:22.450742	2026-08-09 17:23:22.450742
32	13	생활 습관 만들기	f	0	2026-11-08 02:23:22.788125	2026-08-09 17:23:22.789307	2026-08-09 17:23:22.789307
33	14	개발자로 성장하기	t	0	2026-10-09 02:23:23.082101	2026-08-09 17:23:23.082929	2026-08-09 17:23:23.082929
34	14	생활 습관 만들기	f	0	2026-11-08 02:23:23.266009	2026-08-09 17:23:23.266852	2026-08-09 17:23:23.266852
35	15	개발자로 성장하기	t	0	2026-10-09 02:23:23.48589	2026-08-09 17:23:23.486559	2026-08-09 17:23:23.486559
36	15	생활 습관 만들기	f	0	2026-11-08 02:23:23.636402	2026-08-09 17:23:23.637067	2026-08-09 17:23:23.637067
13	5	테스트	t	0	2027-02-02 00:00:00	2026-08-04 07:11:36.062954	2026-08-10 00:06:56.071819
6	6	더 나은 나 만들기	t	1	2027-02-02 00:00:00	2026-08-04 04:01:28.367455	2026-08-10 02:19:28.959419
2	3	시연용 만다라트 오전 10:43:07	t	1	2026-09-02 00:00:00	2026-08-03 01:43:07.475622	2026-08-10 02:24:56.005051
10	3	취업	t	1	2027-02-02 00:00:00	2026-08-04 04:57:12.033514	2026-08-04 05:09:39.997306
22	8	멋 진 나	t	0	2026-08-07 00:00:00	2026-08-06 05:24:47.232473	2026-08-07 03:16:53.457698
26	9	삼성전자 MX 사업부 합격하기	t	0	2027-02-05 00:00:00	2026-08-07 03:27:02.314905	2026-08-07 03:27:02.314905
1	3	시연용 만다라트 오전 10:40:30	t	0	2026-09-02 00:00:00	2026-08-03 01:40:30.916002	2026-08-07 03:51:27.11391
27	7	지식을 많이 쌓기	f	0	2027-02-05 00:00:00	2026-08-07 07:27:21.394494	2026-08-07 07:31:16.609729
\.


--
-- Data for Name: subject; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subject (id, domain_id, user_id, title, period_type, point, target_count, try_count, "position", is_done, created_at, updated_at, count_per_period) FROM stdin;
66	9	3	주 3회 러닝	WEEKLY	100	4	2	1	f	2026-08-03 01:43:07.479489	2026-08-09 23:59:24.641986	1
1	1	3	아침 스트레칭	DAILY	100	31	29	0	f	2026-08-03 01:40:30.923665	2026-08-10 00:33:47.137221	1
2	1	3	주 3회 러닝	WEEKLY	100	4	2	1	f	2026-08-03 01:40:30.929017	2026-08-10 00:33:49.236773	1
3	1	3	물 2L 마시기	NONE	100	1	1	2	t	2026-08-03 01:40:30.930164	2026-08-10 00:33:50.113916	1
8	1	3	금주 챌린지	WEEKLY	100	4	3	7	f	2026-08-03 01:40:30.935444	2026-08-10 00:33:53.514014	1
75	10	3	기술 블로그 1편	NONE	100	1	0	2	f	2026-08-03 01:43:07.488379	2026-08-02 01:43:07.488416	1
11	2	3	기술 블로그 1편	NONE	100	1	1	2	t	2026-08-03 01:40:30.939669	2026-08-10 00:33:58.601214	1
14	2	3	모의 면접	NONE	100	1	1	5	t	2026-08-03 01:40:30.94264	2026-08-10 00:34:00.789221	1
17	3	3	알고리즘 1일 1문제	DAILY	100	31	25	0	f	2026-08-03 01:40:30.946745	2026-08-10 00:34:08.85847	1
21	3	3	강의 완주	WEEKLY	100	4	4	4	t	2026-08-03 01:40:30.950806	2026-08-10 00:34:11.725735	1
22	3	3	스터디 참여	NONE	100	1	2	5	t	2026-08-03 01:40:30.951819	2026-08-10 00:34:12.101987	1
24	3	3	TIL 작성	WEEKLY	100	4	5	7	t	2026-08-03 01:40:30.953949	2026-08-10 00:34:13.55005	1
86	11	3	스터디 참여	NONE	100	1	0	5	f	2026-08-03 01:43:07.497804	2026-08-02 01:43:07.497846	1
38	5	3	비상금 모으기	NONE	100	1	0	5	f	2026-08-03 01:40:30.969253	2026-08-02 01:40:30.969292	1
94	12	3	봉사활동	NONE	100	1	0	5	f	2026-08-03 01:43:07.505286	2026-08-02 01:43:07.505321	1
26	4	3	친구 만나기	WEEKLY	100	4	1	1	f	2026-08-03 01:40:30.956845	2026-08-04 03:54:45.175907	1
71	9	3	체중 기록	DAILY	100	31	1	6	f	2026-08-03 01:43:07.484253	2026-08-04 03:54:45.715814	1
80	10	3	컨퍼런스 참석	WEEKLY	100	4	1	7	f	2026-08-03 01:43:07.492356	2026-08-04 03:55:06.722185	1
67	9	3	물 2L 마시기	NONE	100	1	2	2	t	2026-08-03 01:43:07.480442	2026-08-04 05:38:05.597364	1
10	2	3	포트폴리오 정리	WEEKLY	100	4	5	1	t	2026-08-03 01:40:30.938691	2026-08-07 03:34:56.272852	1
27	4	3	감사 메시지	NONE	100	1	1	2	f	2026-08-03 01:40:30.957747	2026-08-03 01:40:35.234451	1
43	6	3	요리 도전	NONE	100	1	1	2	f	2026-08-03 01:40:30.974921	2026-08-03 01:40:35.23533	1
46	6	3	드로잉	NONE	100	1	1	5	f	2026-08-03 01:40:30.977677	2026-08-03 01:40:35.23546	1
49	7	3	명상 10분	DAILY	100	31	20	0	f	2026-08-03 01:40:30.981322	2026-08-03 01:40:35.235891	1
54	7	3	주간 계획 세우기	NONE	100	1	1	5	f	2026-08-03 01:40:30.985936	2026-08-03 01:40:35.236041	1
53	7	3	심호흡 연습	WEEKLY	100	4	4	4	f	2026-08-03 01:40:30.984972	2026-08-03 01:40:35.23625	1
56	7	3	수면 루틴	WEEKLY	100	4	2	7	f	2026-08-03 01:40:30.987745	2026-08-03 01:40:35.236326	1
59	8	3	분리수거	NONE	100	1	1	2	f	2026-08-03 01:40:30.991146	2026-08-03 01:40:35.236407	1
57	8	3	책상 정리	DAILY	100	31	15	0	f	2026-08-03 01:40:30.989417	2026-08-03 01:40:35.236481	1
60	8	3	텀블러 사용	DAILY	100	31	19	3	f	2026-08-03 01:40:30.991991	2026-08-03 01:40:35.236555	1
51	7	3	디지털 디톡스	NONE	100	1	2	2	t	2026-08-03 01:40:30.983081	2026-08-07 03:35:20.773564	1
102	13	3	비상금 모으기	NONE	100	1	1	5	t	2026-08-03 01:43:07.513033	2026-08-04 06:37:24.364221	1
4	1	3	계단 이용하기	DAILY	100	31	31	3	t	2026-08-03 01:40:30.931223	2026-08-05 01:06:15.871872	1
70	9	3	주 1회 등산	NONE	100	1	1	5	t	2026-08-03 01:43:07.483249	2026-08-05 03:39:32.874685	1
61	8	3	옷장 비우기	WEEKLY	100	4	1	4	f	2026-08-03 01:40:30.992882	2026-08-06 08:30:33.90595	1
62	8	3	식물 키우기	NONE	100	1	1	5	t	2026-08-03 01:40:30.993684	2026-08-06 08:30:34.474297	1
63	8	3	침구 교체	DAILY	100	31	18	6	f	2026-08-03 01:40:30.99461	2026-08-06 08:30:37.719851	1
30	4	3	봉사활동	NONE	100	1	1	5	f	2026-08-03 01:40:30.960445	2026-08-03 01:40:33.542246	1
37	5	3	투자 공부	WEEKLY	100	4	3	4	f	2026-08-03 01:40:30.968255	2026-08-03 01:40:33.54296	1
40	5	3	주간 예산 지키기	WEEKLY	100	4	1	7	f	2026-08-03 01:40:30.971113	2026-08-03 01:40:33.543146	1
45	6	3	영화 감상	WEEKLY	100	4	3	4	f	2026-08-03 01:40:30.976748	2026-08-03 01:40:33.543543	1
5	1	3	취침 12시 전	WEEKLY	100	4	1	4	f	2026-08-03 01:40:30.932291	2026-08-10 00:33:51.744403	1
58	8	3	주 1회 대청소	WEEKLY	100	4	1	1	f	2026-08-03 01:40:30.990278	2026-08-03 01:40:33.544415	1
107	14	3	요리 도전	NONE	100	1	0	2	f	2026-08-03 01:43:07.517919	2026-08-02 01:43:07.517954	1
6	1	3	주 1회 등산	NONE	100	1	2	5	t	2026-08-03 01:40:30.933375	2026-08-10 00:33:52.699959	1
7	1	3	체중 기록	DAILY	100	31	20	6	f	2026-08-03 01:40:30.934506	2026-08-10 00:33:53.101343	1
19	3	3	영어 단어 30개	NONE	100	1	2	2	t	2026-08-03 01:40:30.948713	2026-08-10 00:34:09.86599	1
20	3	3	기술서 1권	DAILY	100	31	9	3	f	2026-08-03 01:40:30.949803	2026-08-10 00:34:10.829315	1
23	3	3	주간 회고	DAILY	100	31	9	6	f	2026-08-03 01:40:30.952906	2026-08-10 00:34:13.130677	1
9	2	3	이력서 갱신	DAILY	100	31	32	0	t	2026-08-03 01:40:30.937612	2026-08-10 00:33:58.161886	1
28	4	3	생일 챙기기	DAILY	100	31	1	3	f	2026-08-03 01:40:30.958674	2026-08-03 01:40:35.234602	1
29	4	3	동료와 커피챗	WEEKLY	100	4	1	4	f	2026-08-03 01:40:30.959582	2026-08-03 01:40:35.234679	1
31	4	3	편지 쓰기	DAILY	100	31	9	6	f	2026-08-03 01:40:30.961406	2026-08-03 01:40:35.234761	1
32	4	3	가족 식사	WEEKLY	100	4	4	7	f	2026-08-03 01:40:30.962403	2026-08-03 01:40:35.234865	1
105	14	3	기타 연습	DAILY	100	31	28	0	f	2026-08-03 01:43:07.516188	2026-08-05 01:06:04.871257	1
34	5	3	고정지출 점검	WEEKLY	100	4	3	1	f	2026-08-03 01:40:30.965311	2026-08-03 01:40:35.235016	1
35	5	3	적금 자동이체	NONE	100	1	0	2	f	2026-08-03 01:40:30.966282	2026-08-03 01:40:35.235106	1
36	5	3	불필요 구독 해지	DAILY	100	31	20	3	f	2026-08-03 01:40:30.96723	2026-08-03 01:40:35.235179	1
25	4	3	부모님께 전화	DAILY	100	31	29	0	f	2026-08-03 01:40:30.955806	2026-08-05 01:06:05.388995	1
55	7	3	독서 30분	DAILY	100	31	30	6	f	2026-08-03 01:40:30.986792	2026-08-05 01:06:05.875128	1
42	6	3	사진 찍기	WEEKLY	100	4	3	1	f	2026-08-03 01:40:30.973865	2026-08-03 01:40:35.235626	1
47	6	3	전시 관람	DAILY	100	31	5	6	f	2026-08-03 01:40:30.978554	2026-08-03 01:40:35.235709	1
48	6	3	악기 합주	WEEKLY	100	4	4	7	f	2026-08-03 01:40:30.979517	2026-08-03 01:40:35.235811	1
12	2	3	사이드 프로젝트	DAILY	100	31	18	3	f	2026-08-03 01:40:30.940736	2026-08-10 00:33:59.683769	1
52	7	3	산책하기	DAILY	100	31	20	3	f	2026-08-03 01:40:30.984045	2026-08-03 01:40:35.23618	1
110	14	3	드로잉	NONE	100	1	0	5	f	2026-08-03 01:43:07.520623	2026-08-02 01:43:07.52066	1
13	2	3	코딩테스트 3문제	WEEKLY	100	4	3	4	f	2026-08-03 01:40:30.941685	2026-08-10 00:34:00.39459	1
15	2	3	링크드인 정리	DAILY	100	31	17	6	f	2026-08-03 01:40:30.9436	2026-08-10 00:34:01.268618	1
16	2	3	컨퍼런스 참석	WEEKLY	100	4	5	7	t	2026-08-03 01:40:30.94466	2026-08-10 00:34:01.752106	1
18	3	3	CS 정리 노트	WEEKLY	100	4	4	1	t	2026-08-03 01:40:30.947731	2026-08-10 00:34:09.409645	1
123	16	3	분리수거	NONE	100	1	0	2	f	2026-08-03 01:43:07.534209	2026-08-02 01:43:07.534249	1
50	7	3	감사일기	WEEKLY	100	4	5	1	t	2026-08-03 01:40:30.982225	2026-08-07 03:35:27.036724	1
72	9	3	금주 챌린지	WEEKLY	100	4	2	7	f	2026-08-03 01:43:07.485133	2026-08-03 01:43:08.574653	1
73	10	3	이력서 갱신	DAILY	100	31	18	0	f	2026-08-03 01:43:07.486684	2026-08-03 01:43:08.574721	1
74	10	3	포트폴리오 정리	WEEKLY	100	4	2	1	f	2026-08-03 01:43:07.487552	2026-08-03 01:43:08.574818	1
68	9	3	계단 이용하기	DAILY	100	31	30	3	f	2026-08-03 01:43:07.481382	2026-08-07 04:15:38.239652	1
125	16	3	옷장 비우기	WEEKLY	100	4	1	4	f	2026-08-03 01:43:07.53591	2026-08-04 03:54:53.176143	1
126	16	3	식물 키우기	NONE	100	1	1	5	t	2026-08-03 01:43:07.536924	2026-08-04 03:59:53.822435	1
39	5	3	연말정산 준비	DAILY	100	31	1	6	f	2026-08-03 01:40:30.970212	2026-08-04 04:56:36.919506	1
65	9	3	아침 스트레칭	DAILY	100	31	31	0	t	2026-08-03 01:43:07.47814	2026-08-04 05:38:01.214545	1
69	9	3	취침 12시 전	WEEKLY	100	4	3	4	f	2026-08-03 01:43:07.482301	2026-08-05 03:39:33.987823	1
117	15	3	심호흡 연습	WEEKLY	100	4	1	4	f	2026-08-03 01:43:07.52838	2026-08-04 05:38:10.241421	1
106	14	3	사진 찍기	WEEKLY	100	4	1	1	f	2026-08-03 01:43:07.517027	2026-08-05 01:05:41.119731	1
33	5	3	가계부 작성	DAILY	100	31	28	0	f	2026-08-03 01:40:30.964371	2026-08-05 01:06:02.505672	1
41	6	3	기타 연습	DAILY	100	31	28	0	f	2026-08-03 01:40:30.972951	2026-08-05 01:06:02.985124	1
44	6	3	보드게임 모임	DAILY	100	31	28	3	f	2026-08-03 01:40:30.975896	2026-08-05 01:06:03.833606	1
76	10	3	사이드 프로젝트	DAILY	100	31	15	3	f	2026-08-03 01:43:07.489141	2026-08-03 01:43:08.574906	1
77	10	3	코딩테스트 3문제	WEEKLY	100	4	3	4	f	2026-08-03 01:43:07.489918	2026-08-03 01:43:08.574992	1
78	10	3	모의 면접	NONE	100	1	1	5	f	2026-08-03 01:43:07.490767	2026-08-03 01:43:08.575068	1
81	11	3	알고리즘 1일 1문제	DAILY	100	31	15	0	f	2026-08-03 01:43:07.493923	2026-08-03 01:43:08.575206	1
82	11	3	CS 정리 노트	WEEKLY	100	4	2	1	f	2026-08-03 01:43:07.49467	2026-08-03 01:43:08.57527	1
83	11	3	영어 단어 30개	NONE	100	1	1	2	f	2026-08-03 01:43:07.495444	2026-08-03 01:43:08.575337	1
84	11	3	기술서 1권	DAILY	100	31	19	3	f	2026-08-03 01:43:07.496188	2026-08-03 01:43:08.57542	1
87	11	3	주간 회고	DAILY	100	31	16	6	f	2026-08-03 01:43:07.498694	2026-08-03 01:43:08.575568	1
88	11	3	TIL 작성	WEEKLY	100	4	4	7	f	2026-08-03 01:43:07.499495	2026-08-03 01:43:08.575645	1
90	12	3	친구 만나기	WEEKLY	100	4	3	1	f	2026-08-03 01:43:07.501957	2026-08-03 01:43:08.575807	1
91	12	3	감사 메시지	NONE	100	1	1	2	f	2026-08-03 01:43:07.502822	2026-08-03 01:43:08.575876	1
92	12	3	생일 챙기기	DAILY	100	31	16	3	f	2026-08-03 01:43:07.50367	2026-08-03 01:43:08.575941	1
93	12	3	동료와 커피챗	WEEKLY	100	4	1	4	f	2026-08-03 01:43:07.504524	2026-08-03 01:43:08.576006	1
95	12	3	편지 쓰기	DAILY	100	31	4	6	f	2026-08-03 01:43:07.506088	2026-08-03 01:43:08.576076	1
96	12	3	가족 식사	WEEKLY	100	4	3	7	f	2026-08-03 01:43:07.50712	2026-08-03 01:43:08.57614	1
97	13	3	가계부 작성	DAILY	100	31	14	0	f	2026-08-03 01:43:07.508827	2026-08-03 01:43:08.576206	1
98	13	3	고정지출 점검	WEEKLY	100	4	3	1	f	2026-08-03 01:43:07.509644	2026-08-03 01:43:08.576271	1
99	13	3	적금 자동이체	NONE	100	1	1	2	f	2026-08-03 01:43:07.510419	2026-08-03 01:43:08.576347	1
101	13	3	투자 공부	WEEKLY	100	4	1	4	f	2026-08-03 01:43:07.512215	2026-08-03 01:43:08.576476	1
104	13	3	주간 예산 지키기	WEEKLY	100	4	1	7	f	2026-08-03 01:43:07.514655	2026-08-03 01:43:08.576606	1
108	14	3	보드게임 모임	DAILY	100	31	7	3	f	2026-08-03 01:43:07.518886	2026-08-03 01:43:08.577138	1
109	14	3	영화 감상	WEEKLY	100	4	2	4	f	2026-08-03 01:43:07.51972	2026-08-03 01:43:08.577213	1
112	14	3	악기 합주	WEEKLY	100	4	3	7	f	2026-08-03 01:43:07.522381	2026-08-03 01:43:08.577352	1
121	16	3	책상 정리	DAILY	100	31	2	0	f	2026-08-03 01:43:07.532739	2026-08-03 01:43:08.577943	1
122	16	3	주 1회 대청소	WEEKLY	100	4	4	1	f	2026-08-03 01:43:07.533467	2026-08-03 01:43:08.578008	1
128	16	3	서류 정리	WEEKLY	100	4	1	7	f	2026-08-03 01:43:07.538667	2026-08-03 01:43:08.578223	1
85	11	3	강의 완주	WEEKLY	100	4	5	4	t	2026-08-03 01:43:07.496941	2026-08-06 06:01:33.910665	1
124	16	3	텀블러 사용	DAILY	100	31	27	3	f	2026-08-03 01:43:07.535016	2026-08-05 01:06:01.554581	1
127	16	3	침구 교체	DAILY	100	31	6	6	f	2026-08-03 01:43:07.537754	2026-08-04 03:59:48.63531	1
116	15	3	산책하기	DAILY	100	31	8	3	f	2026-08-03 01:43:07.527569	2026-08-04 05:38:11.04039	1
115	15	3	디지털 디톡스	NONE	100	1	2	2	t	2026-08-03 01:43:07.526016	2026-08-04 05:38:17.342344	1
114	15	3	감사일기	WEEKLY	100	4	3	1	f	2026-08-03 01:43:07.524749	2026-08-04 05:38:18.779446	1
113	15	3	명상 10분	DAILY	100	31	14	0	f	2026-08-03 01:43:07.523902	2026-08-04 05:38:20.929329	1
120	15	3	수면 루틴	WEEKLY	100	4	2	7	f	2026-08-03 01:43:07.531211	2026-08-04 05:38:26.741212	1
100	13	3	불필요 구독 해지	DAILY	100	31	4	3	f	2026-08-03 01:43:07.511349	2026-08-04 06:37:14.041033	1
89	12	3	부모님께 전화	DAILY	100	31	30	0	f	2026-08-03 01:43:07.501038	2026-08-05 01:06:06.457925	1
103	13	3	연말정산 준비	DAILY	100	31	27	6	f	2026-08-03 01:43:07.513838	2026-08-05 01:06:08.068176	1
111	14	3	전시 관람	DAILY	100	31	22	6	f	2026-08-03 01:43:07.521482	2026-08-05 01:06:12.868574	1
119	15	3	독서 30분	DAILY	100	31	21	6	f	2026-08-03 01:43:07.53038	2026-08-05 01:06:17.837347	1
1921	241	13	백준 한 문제 풀기	DAILY	100	61	61	0	t	2026-08-09 17:23:22.459545	2026-07-31 02:23:22.774683	1
1922	241	13	틀린 문제 오답 정리	WEEKLY	100	16	16	1	t	2026-08-09 17:23:22.465224	2026-07-31 02:23:22.774683	2
1923	241	13	풀이 코드 리뷰 받기	WEEKLY	100	8	8	2	t	2026-08-09 17:23:22.466555	2026-07-31 02:23:22.774683	1
1924	241	13	시간복잡도 계산 연습	WEEKLY	100	16	16	3	t	2026-08-09 17:23:22.467817	2026-07-31 02:23:22.774683	2
1925	241	13	그래프 문제 다섯 개	WEEKLY	100	8	8	4	t	2026-08-09 17:23:22.46901	2026-07-31 02:23:22.774683	1
1926	241	13	DP 문제 다섯 개	WEEKLY	100	8	8	5	t	2026-08-09 17:23:22.470235	2026-07-31 02:23:22.774683	1
1927	241	13	모의 코딩테스트 응시	WEEKLY	100	8	8	6	t	2026-08-09 17:23:22.472354	2026-07-31 02:23:22.774683	1
1928	241	13	알고리즘 스터디 참여	WEEKLY	100	8	8	7	t	2026-08-09 17:23:22.474107	2026-07-31 02:23:22.774683	1
1929	242	13	Spring 공식 문서 읽기	DAILY	100	61	61	0	t	2026-08-09 17:23:22.476254	2026-07-31 02:23:22.774683	1
1930	242	13	REST API 설계 연습	WEEKLY	100	16	16	1	t	2026-08-09 17:23:22.477489	2026-07-31 02:23:22.774683	2
1931	242	13	JPA 쿼리 튜닝해 보기	WEEKLY	100	8	8	2	t	2026-08-09 17:23:22.478672	2026-07-31 02:23:22.774683	1
1932	242	13	테스트 코드 작성	DAILY	100	61	61	3	t	2026-08-09 17:23:22.479853	2026-07-31 02:23:22.774683	1
1933	242	13	예외 처리 규칙 정리	WEEKLY	100	8	8	4	t	2026-08-09 17:23:22.481058	2026-07-31 02:23:22.774683	1
1934	242	13	트랜잭션 실습	WEEKLY	100	8	8	5	t	2026-08-09 17:23:22.482176	2026-07-31 02:23:22.774683	1
1935	242	13	인증·인가 구현해 보기	WEEKLY	100	8	8	6	t	2026-08-09 17:23:22.483279	2026-07-31 02:23:22.774683	1
1936	242	13	API 응답 시간 측정	WEEKLY	100	8	8	7	t	2026-08-09 17:23:22.485618	2026-07-31 02:23:22.774683	1
1937	243	13	React 훅 실습	DAILY	100	61	61	0	t	2026-08-09 17:23:22.487621	2026-07-31 02:23:22.774683	1
1938	243	13	타입스크립트 타입 연습	DAILY	100	61	61	1	t	2026-08-09 17:23:22.488739	2026-07-31 02:23:22.774683	1
1939	243	13	접근성 점검	WEEKLY	100	8	8	2	t	2026-08-09 17:23:22.48993	2026-07-31 02:23:22.774683	1
1940	243	13	렌더 최적화 실험	WEEKLY	100	8	8	3	t	2026-08-09 17:23:22.491012	2026-07-31 02:23:22.774683	1
1941	243	13	상태 관리 리팩터링	WEEKLY	100	8	8	4	t	2026-08-09 17:23:22.492367	2026-07-31 02:23:22.774683	1
1942	243	13	반응형 레이아웃 만들기	WEEKLY	100	8	8	5	t	2026-08-09 17:23:22.49343	2026-07-31 02:23:22.774683	1
1943	243	13	애니메이션 다듬기	WEEKLY	100	8	8	6	t	2026-08-09 17:23:22.494486	2026-07-31 02:23:22.774683	1
1944	243	13	컴포넌트 문서화	WEEKLY	100	8	8	7	t	2026-08-09 17:23:22.495522	2026-07-31 02:23:22.774683	1
1945	244	13	배포 로그 확인	DAILY	100	61	61	0	t	2026-08-09 17:23:22.498189	2026-07-31 02:23:22.774683	1
345	44	6	월 수입의 40% 이상 저축/투자	MONTHLY	10	6	0	0	f	2026-08-04 04:01:28.432281	2026-08-03 04:01:28.432345	1
347	44	6	안 쓰는 구독 서비스/고정 지출 정리	NONE	10	1	0	2	f	2026-08-04 04:01:28.434915	2026-08-03 04:01:28.434971	1
348	44	6	재테크/투자 기초 서적 2권 읽기	MONTHLY	10	6	0	3	f	2026-08-04 04:01:28.436172	2026-08-03 04:01:28.436229	2
327	41	6	건강검진 받기	NONE	10	1	1	6	t	2026-08-04 04:01:28.406758	2026-08-05 01:40:42.13969	1
330	42	6	관심 분야 온라인 강의 들기	DAILY	10	30	2	1	f	2026-08-04 04:01:28.411974	2026-08-07 07:56:09.040503	1
332	42	6	매일 신문/아티클 1개 읽기	DAILY	10	30	2	3	f	2026-08-04 04:01:28.414433	2026-08-07 07:56:09.398	1
333	42	6	읽은 책 독서 노트 작성하기	DAILY	10	30	2	4	f	2026-08-04 04:01:28.415611	2026-08-07 07:56:09.566754	1
335	42	6	주 1회 새로운 지식 블로그/노션에 기록	DAILY	10	30	2	6	f	2026-08-04 04:01:28.417946	2026-08-07 07:56:09.776415	1
336	42	6	출퇴근길 오디오북/팟캐스트 듣기	DAILY	10	30	2	7	f	2026-08-04 04:01:28.419069	2026-08-07 07:56:10.118619	1
341	43	6	매일 6시 전 10분정도 한거 정리	DAILY	10	30	2	4	f	2026-08-04 04:01:28.42622	2026-08-07 07:56:10.34751	1
342	43	6	선배/동료 피드백 적극 수용하기	DAILY	10	30	2	5	f	2026-08-04 04:01:28.427476	2026-08-07 07:56:10.561819	1
346	44	6	매일 밤 모바일 가계부 작성하기	DAILY	10	30	2	1	f	2026-08-04 04:01:28.433701	2026-08-07 07:56:10.748167	1
349	44	6	비상금 통장 만들기 (3개월치 생활비)	DAILY	10	30	2	4	f	2026-08-04 04:01:28.437398	2026-08-07 07:56:10.953189	1
352	44	6	주식 하지 말기	DAILY	10	30	2	7	f	2026-08-04 04:01:28.441203	2026-08-07 07:56:11.343443	1
353	45	6	배워보고 싶었던 악기/미술 입문하기	DAILY	10	30	2	0	f	2026-08-04 04:01:28.443709	2026-08-07 07:56:11.522187	1
354	45	6	분기별로 힐링 여행 1번 다녀오기	DAILY	10	30	2	1	f	2026-08-04 04:01:28.444909	2026-08-07 07:56:11.716656	1
355	45	6	주말 하루는 일 생각 없이 쉬기	DAILY	10	30	2	2	f	2026-08-04 04:01:28.44603	2026-08-07 07:56:11.913803	1
356	45	6	맛있는 요리 레시피 2가지 Master 하기	DAILY	10	30	2	3	f	2026-08-04 04:01:28.447153	2026-08-07 07:56:12.112007	1
357	45	6	전시회나 공연 연 3회 이상 관람하기	DAILY	10	30	2	4	f	2026-08-04 04:01:28.448324	2026-08-07 07:56:12.486038	1
358	45	6	반려식물 1개 키워보기	DAILY	10	30	2	5	f	2026-08-04 04:01:28.449514	2026-08-07 07:56:12.679676	1
325	41	6	저녁에 환기하기	DAILY	10	30	3	4	f	2026-08-04 04:01:28.403232	2026-08-07 07:56:29.999056	1
337	43	6	직무 관련 자격증 1개 취득	MONTHLY	10	6	1	0	f	2026-08-04 04:01:28.421326	2026-08-07 07:57:15.050634	1
326	41	6	주 1회 금식하기	WEEKLY	10	12	1	5	f	2026-08-04 04:01:28.405285	2026-08-04 05:30:17.117185	1
324	41	6	주말 아침마다 뒷산 정상까지 오르기	WEEKLY	10	12	2	3	f	2026-08-04 04:01:28.401873	2026-08-07 07:57:10.390875	2
322	41	6	퇴근하고 1시간 러닝하기	WEEKLY	10	12	3	1	f	2026-08-04 04:01:28.398861	2026-08-07 07:57:09.761606	5
328	41	6	건강식 쇼핑하기	MONTHLY	10	6	1	7	f	2026-08-04 04:01:28.408105	2026-08-05 01:40:42.885028	1
334	42	6	베스트셀러 책 1개 완독하기	WEEKLY	10	12	1	5	f	2026-08-04 04:01:28.416768	2026-08-07 07:55:58.100989	1
338	43	6	이력서/포트폴리오 주기적 업데이트	WEEKLY	10	12	1	1	f	2026-08-04 04:01:28.422552	2026-08-07 07:55:58.402642	1
350	44	6	주 1회 무지출 데이 도전	WEEKLY	10	12	1	5	f	2026-08-04 04:01:28.438693	2026-08-07 07:55:59.044524	1
351	44	6	주 1회 무지출 데이 도전	WEEKLY	10	12	1	6	f	2026-08-04 04:01:28.439954	2026-08-07 07:55:59.398652	1
329	42	6	하루 15분 외국어 공부하기	DAILY	10	30	2	0	f	2026-08-04 04:01:28.410585	2026-08-07 07:56:08.864441	1
339	43	6	업무 효율화 도구(지라, 노션 등) 배우기	MONTHLY	10	6	1	2	f	2026-08-04 04:01:28.423719	2026-08-07 07:57:15.649935	20
340	43	6	직무 관련 세미나/모임 1회 참석	MONTHLY	10	6	1	3	f	2026-08-04 04:01:28.424932	2026-08-07 07:57:16.127844	1
343	43	6	내 직무 관련 책 2권 읽기	MONTHLY	10	6	1	6	f	2026-08-04 04:01:28.428692	2026-08-07 07:57:16.744624	2
361	46	6	5년 후/10년 후 내 모습 그려보기	NONE	10	1	0	0	f	2026-08-04 04:01:28.454314	2026-08-03 04:01:28.454381	1
362	46	6	버킷리스트 50가지 작성하기	NONE	10	1	0	1	f	2026-08-04 04:01:28.455504	2026-08-03 04:01:28.455577	1
364	46	6	나만의 블로그/SNS 채널 시작하기	MONTHLY	10	6	0	3	f	2026-08-04 04:01:28.457846	2026-08-03 04:01:28.457903	1
365	46	6	가보고 싶은 여행지 리스트 정리하기	NONE	10	1	0	4	f	2026-08-04 04:01:28.45892	2026-08-03 04:01:28.458975	1
366	46	6	가보고 싶은 여행지 리스트 정리하기	NONE	10	1	0	5	f	2026-08-04 04:01:28.460015	2026-08-03 04:01:28.46007	1
367	46	6	새로운 분야 도전 프로젝트 1개 하기	NONE	10	1	0	6	f	2026-08-04 04:01:28.461182	2026-08-03 04:01:28.461239	1
368	46	6	내가 꿈꾸는 라이프스타일 구체적으로 적어보기	NONE	10	1	0	7	f	2026-08-04 04:01:28.462334	2026-08-03 04:01:28.462391	1
360	45	6	예쁜 풍경이나 순간 사진으로 남기기	DAILY	10	30	2	7	f	2026-08-04 04:01:28.452044	2026-08-07 07:56:13.197199	1
373	47	6	주말에 30분 집안 청소하기	DAILY	10	30	2	4	f	2026-08-04 04:01:28.468999	2026-08-07 07:56:15.715043	1
374	47	6	일요일 저녁에 다음 주 일정 정리하기	DAILY	10	30	2	5	f	2026-08-04 04:01:28.470155	2026-08-07 07:56:15.871827	1
375	47	6	하루 8,000보 이상 걷기	DAILY	10	30	2	6	f	2026-08-04 04:01:28.471273	2026-08-07 07:56:16.428494	1
376	47	6	책상 위 항상 깔끔하게 유지하기	DAILY	10	30	2	7	f	2026-08-04 04:01:28.472362	2026-08-07 07:56:16.609902	1
377	48	6	매일 아침 감사한 점 3가지 적기	DAILY	10	30	2	0	f	2026-08-04 04:01:28.474384	2026-08-07 07:56:16.79508	1
378	48	6	남과 나를 비교하지 않기	DAILY	10	30	2	1	f	2026-08-04 04:01:28.475851	2026-08-07 07:56:17.375425	1
379	48	6	하루 10분 자기 전 명상하기	DAILY	10	30	2	2	f	2026-08-04 04:01:28.477117	2026-08-07 07:56:17.66948	1
380	48	6	나에게 긍정적인 확언 한마디 해주기	DAILY	10	30	2	3	f	2026-08-04 04:01:28.478243	2026-08-07 07:56:17.889151	1
381	48	6	감정 기복 생길 때 10초 깊게 호흡하기	DAILY	10	30	2	4	f	2026-08-04 04:01:28.479331	2026-08-07 07:56:18.047468	1
382	48	6	실패해도 원인만 분석하고 털어내기	DAILY	10	30	2	5	f	2026-08-04 04:01:28.480405	2026-08-07 07:56:18.228161	1
383	48	6	주 1회 스마트폰 멀리하는 시간 갖기	DAILY	10	30	2	6	f	2026-08-04 04:01:28.481481	2026-08-07 07:56:18.413511	1
384	48	6	칭찬받거나 기분 좋은 일 기록해두기	DAILY	10	30	2	7	f	2026-08-04 04:01:28.482905	2026-08-07 07:56:18.743481	1
321	41	6	몸무게 측정	DAILY	10	30	3	0	f	2026-08-04 04:01:28.393292	2026-08-07 07:56:29.074162	1
323	41	6	커피 하루에 한잔만 마시기	DAILY	10	30	3	2	f	2026-08-04 04:01:28.400507	2026-08-07 07:56:29.637894	1
1946	244	13	Docker 이미지 만들기	WEEKLY	100	8	8	1	t	2026-08-09 17:23:22.499368	2026-07-31 02:23:22.774683	1
1947	244	13	CI 파이프라인 손보기	WEEKLY	100	8	8	2	t	2026-08-09 17:23:22.500489	2026-07-31 02:23:22.774683	1
1948	244	13	nginx 설정 이해하기	WEEKLY	100	8	8	3	t	2026-08-09 17:23:22.501599	2026-07-31 02:23:22.774683	1
1949	244	13	모니터링 지표 보기	WEEKLY	100	16	16	4	t	2026-08-09 17:23:22.50266	2026-07-31 02:23:22.774683	2
1950	244	13	백업 스크립트 점검	MONTHLY	100	2	2	5	t	2026-08-09 17:23:22.503738	2026-07-31 02:23:22.774683	1
1951	244	13	보안 그룹 정리	MONTHLY	100	2	2	6	t	2026-08-09 17:23:22.504817	2026-07-31 02:23:22.774683	1
1952	244	13	장애 대응 훈련	MONTHLY	100	2	2	7	t	2026-08-09 17:23:22.506071	2026-07-31 02:23:22.774683	1
1953	245	13	면접 질문 답변 정리	DAILY	100	61	61	0	t	2026-08-09 17:23:22.508237	2026-07-31 02:23:22.774683	1
1954	245	13	네트워크 한 챕터	WEEKLY	100	16	16	1	t	2026-08-09 17:23:22.509322	2026-07-31 02:23:22.774683	2
1955	245	13	운영체제 한 챕터	WEEKLY	100	16	16	2	t	2026-08-09 17:23:22.510342	2026-07-31 02:23:22.774683	2
1956	245	13	자료구조 직접 구현	WEEKLY	100	8	8	3	t	2026-08-09 17:23:22.511368	2026-07-31 02:23:22.774683	1
1957	245	13	정규화 연습	WEEKLY	100	8	8	4	t	2026-08-09 17:23:22.512424	2026-07-31 02:23:22.774683	1
1958	245	13	디자인 패턴 하나 정리	WEEKLY	100	8	8	5	t	2026-08-09 17:23:22.513469	2026-07-31 02:23:22.774683	1
1959	245	13	동시성 개념 정리	WEEKLY	100	8	8	6	t	2026-08-09 17:23:22.51496	2026-07-31 02:23:22.774683	1
363	46	6	올해 버킷리스트 중 2개 달성하기	DAILY	10	30	2	2	f	2026-08-04 04:01:28.456743	2026-08-07 07:56:13.358717	1
369	47	6	밤 11시 30분 수면 준비 (7시간 수면)	DAILY	10	30	2	0	f	2026-08-04 04:01:28.464464	2026-08-07 07:56:14.768279	1
370	47	6	아침에 일어나자마자 물 한 잔 마시기	DAILY	10	30	2	1	f	2026-08-04 04:01:28.465577	2026-08-07 07:56:14.914702	1
371	47	6	출근 후 매일 우선순위 3가지 적기	DAILY	10	30	2	2	f	2026-08-04 04:01:28.466682	2026-08-07 07:56:15.239389	1
372	47	6	퇴근 후 외출복 즉시 정리하기	DAILY	10	30	2	3	f	2026-08-04 04:01:28.467839	2026-08-07 07:56:15.417586	1
1960	245	13	컴파일 과정 정리	MONTHLY	100	2	2	7	t	2026-08-09 17:23:22.516274	2026-07-31 02:23:22.774683	1
1961	246	13	커밋 메시지 다듬기	DAILY	100	61	61	0	t	2026-08-09 17:23:22.51861	2026-07-31 02:23:22.774683	1
1962	246	13	PR 리뷰 남기기	DAILY	100	61	61	1	t	2026-08-09 17:23:22.519804	2026-07-31 02:23:22.774683	1
1963	246	13	데일리 스크럼 참여	DAILY	100	61	61	2	t	2026-08-09 17:23:22.52091	2026-07-31 02:23:22.774683	1
1964	246	13	회고 작성	WEEKLY	100	8	8	3	t	2026-08-09 17:23:22.522013	2026-07-31 02:23:22.774683	1
1965	246	13	이슈 정리	WEEKLY	100	16	16	4	t	2026-08-09 17:23:22.523052	2026-07-31 02:23:22.774683	2
1966	246	13	문서 최신화	WEEKLY	100	8	8	5	t	2026-08-09 17:23:22.524133	2026-07-31 02:23:22.774683	1
1967	246	13	페어 프로그래밍	WEEKLY	100	8	8	6	t	2026-08-09 17:23:22.525395	2026-07-31 02:23:22.774683	1
1968	246	13	팀 규칙 점검	MONTHLY	100	2	2	7	t	2026-08-09 17:23:22.52651	2026-07-31 02:23:22.774683	1
1969	247	13	학습 노트 작성	DAILY	100	61	61	0	t	2026-08-09 17:23:22.528502	2026-07-31 02:23:22.774683	1
1970	247	13	읽은 문서 링크 정리	DAILY	100	61	61	1	t	2026-08-09 17:23:22.529514	2026-07-31 02:23:22.774683	1
359	45	6	좋아하는 운동 취미 1개 만들기	DAILY	10	30	2	6	f	2026-08-04 04:01:28.450801	2026-08-07 07:56:12.87092	1
1971	247	13	블로그 글 초안 쓰기	WEEKLY	100	8	8	2	t	2026-08-09 17:23:22.530523	2026-07-31 02:23:22.774683	1
1972	247	13	트러블슈팅 기록	WEEKLY	100	16	16	3	t	2026-08-09 17:23:22.531754	2026-07-31 02:23:22.774683	2
1973	247	13	코드 스니펫 정리	WEEKLY	100	8	8	4	t	2026-08-09 17:23:22.532867	2026-07-31 02:23:22.774683	1
1974	247	13	주간 회고 쓰기	WEEKLY	100	8	8	5	t	2026-08-09 17:23:22.533938	2026-07-31 02:23:22.774683	1
1975	247	13	블로그 발행	MONTHLY	100	4	4	6	t	2026-08-09 17:23:22.535192	2026-07-31 02:23:22.774683	2
1976	247	13	목표 점검	MONTHLY	100	2	2	7	t	2026-08-09 17:23:22.536213	2026-07-31 02:23:22.774683	1
1977	248	13	아침 스트레칭	DAILY	100	61	61	0	t	2026-08-09 17:23:22.538156	2026-07-31 02:23:22.774683	1
1978	248	13	산책 30분	DAILY	100	61	61	1	t	2026-08-09 17:23:22.539253	2026-07-31 02:23:22.774683	1
1979	248	13	물 2리터 마시기	DAILY	100	61	61	2	t	2026-08-09 17:23:22.54034	2026-07-31 02:23:22.774683	1
1980	248	13	12시 전에 자기	DAILY	100	61	61	3	t	2026-08-09 17:23:22.541437	2026-07-31 02:23:22.774683	1
1981	248	13	눈 운동	DAILY	100	61	61	4	t	2026-08-09 17:23:22.5426	2026-07-31 02:23:22.774683	3
1982	248	13	식단 기록	DAILY	100	61	61	5	t	2026-08-09 17:23:22.543815	2026-07-31 02:23:22.774683	1
1983	248	13	주말 운동	WEEKLY	100	16	16	6	t	2026-08-09 17:23:22.544893	2026-07-31 02:23:22.774683	2
1984	248	13	건강검진 예약	NONE	100	1	1	7	t	2026-08-09 17:23:22.546233	2026-07-31 02:23:22.774683	1
1985	249	13	아침 스트레칭	DAILY	100	91	91	0	t	2026-08-09 17:23:22.791899	2026-07-31 02:23:22.966557	1
584	73	3	ㅁㄴㅇㄻㄴㄹ	WEEKLY	10	12	1	7	f	2026-08-04 04:57:12.043489	2026-08-10 00:34:30.135842	1
1986	249	13	계단 이용하기	DAILY	100	91	91	1	t	2026-08-09 17:23:22.792977	2026-07-31 02:23:22.966557	1
1987	249	13	홈트 20분	DAILY	100	91	91	2	t	2026-08-09 17:23:22.793973	2026-07-31 02:23:22.966557	1
579	73	3	3	WEEKLY	10	12	2	2	f	2026-08-04 04:57:12.038666	2026-08-07 04:15:49.937747	3
593	75	3	1	DAILY	10	30	1	0	f	2026-08-04 04:57:12.056627	2026-08-04 05:29:14.049349	1
594	75	3	2	DAILY	10	30	1	1	f	2026-08-04 04:57:12.057731	2026-08-04 05:29:14.481901	1
595	75	3	3	DAILY	10	30	1	2	f	2026-08-04 04:57:12.060727	2026-08-04 05:29:14.793499	1
596	75	3	4	DAILY	10	30	1	3	f	2026-08-04 04:57:12.061657	2026-08-04 05:29:15.476948	1
597	75	3	5	DAILY	10	30	1	4	f	2026-08-04 04:57:12.062425	2026-08-04 05:29:16.115973	1
577	73	3	1	WEEKLY	10	12	1	0	f	2026-08-04 04:57:12.036385	2026-08-04 05:29:20.908958	1
578	73	3	2	MONTHLY	10	6	1	1	f	2026-08-04 04:57:12.037661	2026-08-04 05:29:24.186378	1
601	76	3	1	DAILY	10	30	1	0	f	2026-08-04 04:57:12.069266	2026-08-04 05:30:12.107484	1
602	76	3	2	DAILY	10	30	1	1	f	2026-08-04 04:57:12.070031	2026-08-04 05:30:13.812477	1
581	73	3	4	DAILY	10	30	1	4	f	2026-08-04 04:57:12.040548	2026-08-05 01:05:40.108747	1
580	73	3	3	DAILY	10	30	1	3	f	2026-08-04 04:57:12.039627	2026-08-05 01:05:40.583622	1
582	73	3	5	DAILY	10	30	1	5	f	2026-08-04 04:57:12.041555	2026-08-05 01:05:41.673248	1
583	73	3	ㄴㅇㅁㄹㄴㄹ	DAILY	10	30	1	6	f	2026-08-04 04:57:12.042583	2026-08-05 01:05:42.187056	1
585	74	3	1	DAILY	10	30	1	0	f	2026-08-04 04:57:12.047696	2026-08-05 01:05:42.718751	1
586	74	3	2	DAILY	10	30	1	1	f	2026-08-04 04:57:12.048644	2026-08-05 01:05:43.270597	1
587	74	3	3	DAILY	10	30	1	2	f	2026-08-04 04:57:12.049476	2026-08-05 01:05:43.726848	1
588	74	3	4	DAILY	10	30	1	3	f	2026-08-04 04:57:12.050318	2026-08-05 01:05:44.22142	1
589	74	3	5	DAILY	10	30	1	4	f	2026-08-04 04:57:12.051527	2026-08-05 01:05:44.803554	1
590	74	3	6	DAILY	10	30	1	5	f	2026-08-04 04:57:12.053167	2026-08-05 01:05:45.428142	1
591	74	3	7	DAILY	10	30	1	6	f	2026-08-04 04:57:12.053968	2026-08-05 01:05:46.091421	1
592	74	3	8	DAILY	10	30	1	7	f	2026-08-04 04:57:12.054736	2026-08-05 01:05:51.278348	1
598	75	3	6	DAILY	10	30	1	5	f	2026-08-04 04:57:12.064861	2026-08-05 01:05:51.904163	1
599	75	3	7	DAILY	10	30	1	6	f	2026-08-04 04:57:12.066345	2026-08-05 01:05:52.335156	1
603	76	3	3	DAILY	10	30	1	2	f	2026-08-04 04:57:12.070861	2026-08-05 01:05:53.737574	1
631	79	3	7	WEEKLY	10	12	1	6	f	2026-08-04 04:57:12.095929	2026-08-10 00:34:30.520881	1
607	76	3	7	DAILY	10	30	1	6	f	2026-08-04 04:57:12.074096	2026-08-06 05:25:34.178102	1
609	77	3	1	DAILY	10	30	1	0	f	2026-08-04 04:57:12.076392	2026-08-06 05:25:34.533208	1
1988	249	13	만보 걷기	DAILY	100	91	91	3	t	2026-08-09 17:23:22.795068	2026-07-31 02:23:22.966557	1
1989	249	13	자세 교정 운동	DAILY	100	91	91	4	t	2026-08-09 17:23:22.796093	2026-07-31 02:23:22.966557	1
1990	249	13	러닝 다녀오기	WEEKLY	100	26	26	5	t	2026-08-09 17:23:22.797172	2026-07-31 02:23:22.966557	2
619	78	3	3	DAILY	10	30	1	2	f	2026-08-04 04:57:12.086101	2026-08-07 04:43:22.804109	1
612	77	3	4	DAILY	10	30	2	3	f	2026-08-04 04:57:12.078673	2026-08-06 05:27:29.589549	1
614	77	3	6	DAILY	10	30	1	5	f	2026-08-04 04:57:12.08029	2026-08-06 05:27:31.280018	1
615	77	3	7	DAILY	10	30	1	6	f	2026-08-04 04:57:12.081205	2026-08-06 05:27:32.060068	1
636	80	3	4	DAILY	10	30	1	3	f	2026-08-04 04:57:12.101452	2026-08-04 05:29:33.545358	1
604	76	3	4	DAILY	10	30	1	3	f	2026-08-04 04:57:12.071649	2026-08-05 01:05:54.231766	1
605	76	3	5	DAILY	10	30	1	4	f	2026-08-04 04:57:12.072509	2026-08-05 01:05:55.403416	1
608	76	3	8	DAILY	10	30	1	7	f	2026-08-04 04:57:12.074865	2026-08-05 01:06:34.592099	1
634	80	3	2	DAILY	10	30	1	1	f	2026-08-04 04:57:12.099232	2026-08-05 01:06:44.795019	1
610	77	3	2	DAILY	10	30	1	1	f	2026-08-04 04:57:12.077196	2026-08-06 05:25:35.008547	1
611	77	3	3	DAILY	10	30	2	2	f	2026-08-04 04:57:12.077942	2026-08-06 05:27:29.004962	1
613	77	3	5	DAILY	10	30	2	4	f	2026-08-04 04:57:12.079496	2026-08-06 05:27:31.588018	1
616	77	3	8	DAILY	10	30	1	7	f	2026-08-04 04:57:12.082025	2026-08-06 05:27:32.992673	1
618	78	3	2	DAILY	10	30	1	1	f	2026-08-04 04:57:12.085103	2026-08-07 04:43:35.723942	1
620	78	3	4	DAILY	10	30	1	3	f	2026-08-04 04:57:12.086878	2026-08-07 04:43:40.706101	1
622	78	3	6	DAILY	10	30	1	5	f	2026-08-04 04:57:12.08838	2026-08-07 04:43:44.427096	1
621	78	3	5	DAILY	10	30	1	4	f	2026-08-04 04:57:12.08761	2026-08-07 04:43:51.343631	1
617	78	3	1	DAILY	10	30	1	0	f	2026-08-04 04:57:12.083835	2026-08-07 04:43:55.548193	1
623	78	3	7	DAILY	10	30	1	6	f	2026-08-04 04:57:12.08914	2026-08-07 04:44:11.073338	1
624	78	3	8	DAILY	10	30	1	7	f	2026-08-04 04:57:12.089914	2026-08-07 04:44:11.699868	1
625	79	3	12	DAILY	10	30	1	0	f	2026-08-04 04:57:12.091322	2026-08-07 04:44:12.509944	1
626	79	3	2	DAILY	10	30	1	1	f	2026-08-04 04:57:12.092072	2026-08-07 04:44:12.83809	1
627	79	3	3	DAILY	10	30	1	2	f	2026-08-04 04:57:12.092816	2026-08-07 04:44:13.095227	1
628	79	3	4	DAILY	10	30	1	3	f	2026-08-04 04:57:12.093571	2026-08-07 04:44:13.358383	1
629	79	3	5	DAILY	10	30	1	4	f	2026-08-04 04:57:12.094347	2026-08-07 04:44:13.610123	1
630	79	3	6	DAILY	10	30	1	5	f	2026-08-04 04:57:12.095148	2026-08-07 04:44:13.904892	1
632	79	3	8	DAILY	10	30	1	7	f	2026-08-04 04:57:12.096729	2026-08-07 04:44:14.244355	1
633	80	3	1	DAILY	10	30	1	0	f	2026-08-04 04:57:12.0983	2026-08-07 04:44:14.519099	1
637	80	3	5	DAILY	10	30	1	4	f	2026-08-04 04:57:12.102873	2026-08-07 04:44:14.76209	1
638	80	3	6	DAILY	10	30	1	5	f	2026-08-04 04:57:12.103989	2026-08-07 04:44:15.1013	1
639	80	3	7	DAILY	10	30	1	6	f	2026-08-04 04:57:12.104917	2026-08-07 04:44:15.380399	1
1991	249	13	체중 기록	WEEKLY	100	39	39	6	t	2026-08-09 17:23:22.79844	2026-07-31 02:23:22.966557	3
1992	249	13	주말 등산	MONTHLY	100	3	3	7	t	2026-08-09 17:23:22.799506	2026-07-31 02:23:22.966557	1
118	15	3	주간 계획 세우기	NONE	100	1	2	5	t	2026-08-03 01:43:07.529471	2026-08-04 05:38:12.671753	1
771	97	5	.	DAILY	10	30	0	2	f	2026-08-04 07:11:36.066495	2026-08-03 07:11:36.06652	1
772	97	5	.	DAILY	10	30	0	3	f	2026-08-04 07:11:36.067158	2026-08-03 07:11:36.067182	1
773	97	5	.	DAILY	10	30	0	4	f	2026-08-04 07:11:36.067824	2026-08-03 07:11:36.067847	1
774	97	5	.	DAILY	10	30	0	5	f	2026-08-04 07:11:36.068453	2026-08-03 07:11:36.068481	1
775	97	5	.	DAILY	10	30	0	6	f	2026-08-04 07:11:36.069212	2026-08-03 07:11:36.069247	1
776	97	5	.	DAILY	10	30	0	7	f	2026-08-04 07:11:36.069858	2026-08-03 07:11:36.069884	1
777	98	5	.	DAILY	10	30	0	0	f	2026-08-04 07:11:36.070894	2026-08-03 07:11:36.070919	1
778	98	5	.	DAILY	10	30	0	1	f	2026-08-04 07:11:36.07146	2026-08-03 07:11:36.071483	1
779	98	5	.	DAILY	10	30	0	2	f	2026-08-04 07:11:36.072008	2026-08-03 07:11:36.072031	1
780	98	5	.	DAILY	10	30	0	3	f	2026-08-04 07:11:36.072496	2026-08-03 07:11:36.07252	1
781	98	5	.	DAILY	10	30	0	4	f	2026-08-04 07:11:36.073044	2026-08-03 07:11:36.073066	1
782	98	5	.	DAILY	10	30	0	5	f	2026-08-04 07:11:36.073526	2026-08-03 07:11:36.07355	1
783	98	5	.	DAILY	10	30	0	6	f	2026-08-04 07:11:36.074198	2026-08-03 07:11:36.074232	1
784	98	5	.	DAILY	10	30	0	7	f	2026-08-04 07:11:36.074822	2026-08-03 07:11:36.074849	1
785	99	5	.	DAILY	10	30	0	0	f	2026-08-04 07:11:36.075878	2026-08-03 07:11:36.075905	1
786	99	5	.	DAILY	10	30	0	1	f	2026-08-04 07:11:36.076397	2026-08-03 07:11:36.076423	1
787	99	5	.	DAILY	10	30	0	2	f	2026-08-04 07:11:36.076915	2026-08-03 07:11:36.076939	1
788	99	5	.	DAILY	10	30	0	3	f	2026-08-04 07:11:36.077447	2026-08-03 07:11:36.077472	1
789	99	5	.	DAILY	10	30	0	4	f	2026-08-04 07:11:36.077961	2026-08-03 07:11:36.077984	1
790	99	5	.	DAILY	10	30	0	5	f	2026-08-04 07:11:36.078446	2026-08-03 07:11:36.07847	1
791	99	5	.	DAILY	10	30	0	6	f	2026-08-04 07:11:36.078948	2026-08-03 07:11:36.078971	1
792	99	5	.	DAILY	10	30	0	7	f	2026-08-04 07:11:36.079423	2026-08-03 07:11:36.079446	1
793	100	5	.	DAILY	10	30	0	0	f	2026-08-04 07:11:36.080334	2026-08-03 07:11:36.080358	1
794	100	5	.	DAILY	10	30	0	1	f	2026-08-04 07:11:36.08085	2026-08-03 07:11:36.080873	1
795	100	5	.	DAILY	10	30	0	2	f	2026-08-04 07:11:36.081384	2026-08-03 07:11:36.081407	1
796	100	5	.	DAILY	10	30	0	3	f	2026-08-04 07:11:36.081888	2026-08-03 07:11:36.081912	1
797	100	5	.	DAILY	10	30	0	4	f	2026-08-04 07:11:36.082386	2026-08-03 07:11:36.08241	1
798	100	5	.	DAILY	10	30	0	5	f	2026-08-04 07:11:36.082883	2026-08-03 07:11:36.082907	1
799	100	5	.	DAILY	10	30	0	6	f	2026-08-04 07:11:36.083367	2026-08-03 07:11:36.08339	1
800	100	5	.	DAILY	10	30	0	7	f	2026-08-04 07:11:36.083863	2026-08-03 07:11:36.083886	1
801	101	5	.	DAILY	10	30	0	0	f	2026-08-04 07:11:36.084923	2026-08-03 07:11:36.084948	1
802	101	5	.	DAILY	10	30	0	1	f	2026-08-04 07:11:36.085407	2026-08-03 07:11:36.085431	1
803	101	5	.	DAILY	10	30	0	2	f	2026-08-04 07:11:36.085887	2026-08-03 07:11:36.085911	1
804	101	5	.	DAILY	10	30	0	3	f	2026-08-04 07:11:36.086397	2026-08-03 07:11:36.08642	1
805	101	5	.	DAILY	10	30	0	4	f	2026-08-04 07:11:36.086886	2026-08-03 07:11:36.086909	1
769	97	5	.	DAILY	10	30	1	0	f	2026-08-04 07:11:36.064835	2026-08-04 11:24:16.354815	1
770	97	5	.	DAILY	10	30	1	1	f	2026-08-04 07:11:36.065844	2026-08-04 11:24:21.359566	1
2000	250	13	배달 한 번만	WEEKLY	100	13	0	7	f	2026-08-09 17:23:22.808862	2026-07-31 02:23:22.966557	1
1993	250	13	아침 먹기	DAILY	100	91	91	0	t	2026-08-09 17:23:22.801425	2026-07-31 02:23:22.966557	1
1994	250	13	야식 참기	DAILY	100	91	91	1	t	2026-08-09 17:23:22.802527	2026-07-31 02:23:22.966557	1
1995	250	13	채소 한 접시	DAILY	100	91	91	2	t	2026-08-09 17:23:22.80375	2026-07-31 02:23:22.966557	1
806	101	5	.	DAILY	10	30	0	5	f	2026-08-04 07:11:36.087349	2026-08-03 07:11:36.087372	1
807	101	5	.	DAILY	10	30	0	6	f	2026-08-04 07:11:36.088101	2026-08-03 07:11:36.08813	1
808	101	5	.	DAILY	10	30	0	7	f	2026-08-04 07:11:36.088701	2026-08-03 07:11:36.088727	1
809	102	5	.	DAILY	10	30	0	0	f	2026-08-04 07:11:36.089932	2026-08-03 07:11:36.089962	1
810	102	5	.	DAILY	10	30	0	1	f	2026-08-04 07:11:36.090495	2026-08-03 07:11:36.090521	1
811	102	5	.	DAILY	10	30	0	2	f	2026-08-04 07:11:36.091021	2026-08-03 07:11:36.091046	1
812	102	5	.	DAILY	10	30	0	3	f	2026-08-04 07:11:36.091686	2026-08-03 07:11:36.091717	1
813	102	5	.	DAILY	10	30	0	4	f	2026-08-04 07:11:36.092287	2026-08-03 07:11:36.092314	1
814	102	5	.	DAILY	10	30	0	5	f	2026-08-04 07:11:36.09297	2026-08-03 07:11:36.093002	1
815	102	5	.	DAILY	10	30	0	6	f	2026-08-04 07:11:36.093538	2026-08-03 07:11:36.093566	1
816	102	5	.	DAILY	10	30	0	7	f	2026-08-04 07:11:36.094107	2026-08-03 07:11:36.094135	1
817	103	5	.	DAILY	10	30	0	0	f	2026-08-04 07:11:36.09514	2026-08-03 07:11:36.095168	1
818	103	5	.	DAILY	10	30	0	1	f	2026-08-04 07:11:36.095688	2026-08-03 07:11:36.095721	1
819	103	5	.	DAILY	10	30	0	2	f	2026-08-04 07:11:36.096264	2026-08-03 07:11:36.096289	1
820	103	5	.	DAILY	10	30	0	3	f	2026-08-04 07:11:36.096752	2026-08-03 07:11:36.096806	1
821	103	5	.	DAILY	10	30	0	4	f	2026-08-04 07:11:36.097313	2026-08-03 07:11:36.097337	1
822	103	5	.	DAILY	10	30	0	5	f	2026-08-04 07:11:36.097992	2026-08-03 07:11:36.098024	1
823	103	5	.	DAILY	10	30	0	6	f	2026-08-04 07:11:36.098563	2026-08-03 07:11:36.09859	1
824	103	5	.	DAILY	10	30	0	7	f	2026-08-04 07:11:36.099152	2026-08-03 07:11:36.099177	1
825	104	5	.	DAILY	10	30	0	0	f	2026-08-04 07:11:36.100175	2026-08-03 07:11:36.100201	1
826	104	5	.	DAILY	10	30	0	1	f	2026-08-04 07:11:36.100687	2026-08-03 07:11:36.100711	1
827	104	5	.	DAILY	10	30	0	2	f	2026-08-04 07:11:36.101244	2026-08-03 07:11:36.101268	1
828	104	5	.	DAILY	10	30	0	3	f	2026-08-04 07:11:36.101723	2026-08-03 07:11:36.101746	1
829	104	5	.	DAILY	10	30	0	4	f	2026-08-04 07:11:36.102249	2026-08-03 07:11:36.102272	1
830	104	5	.	DAILY	10	30	0	5	f	2026-08-04 07:11:36.102722	2026-08-03 07:11:36.102746	1
831	104	5	.	DAILY	10	30	0	6	f	2026-08-04 07:11:36.103264	2026-08-03 07:11:36.103288	1
832	104	5	.	DAILY	10	30	0	7	f	2026-08-04 07:11:36.103736	2026-08-03 07:11:36.10376	1
1996	250	13	물 2리터 마시기	DAILY	100	91	91	3	t	2026-08-09 17:23:22.804903	2026-07-31 02:23:22.966557	1
1997	250	13	커피 두 잔 이하	DAILY	100	91	91	4	t	2026-08-09 17:23:22.805885	2026-07-31 02:23:22.966557	1
1998	250	13	영양제 챙겨 먹기	DAILY	100	91	91	5	t	2026-08-09 17:23:22.806883	2026-07-31 02:23:22.966557	1
600	75	3	8	DAILY	10	30	1	7	f	2026-08-04 04:57:12.067541	2026-08-05 01:05:52.86461	1
79	10	3	링크드인 정리	DAILY	100	31	24	6	f	2026-08-03 01:43:07.491572	2026-08-05 01:06:08.865329	1
635	80	3	3	DAILY	10	30	1	2	f	2026-08-04 04:57:12.100684	2026-08-05 01:07:10.293368	1
1999	250	13	직접 요리하기	WEEKLY	100	26	26	6	t	2026-08-09 17:23:22.80789	2026-07-31 02:23:22.966557	2
2007	251	13	낮잠 20분 이내	DAILY	100	91	0	6	f	2026-08-09 17:23:22.817016	2026-07-31 02:23:22.966557	1
2008	251	13	침구 정리	WEEKLY	100	26	0	7	f	2026-08-09 17:23:22.81799	2026-07-31 02:23:22.966557	2
2001	251	13	12시 전에 자기	DAILY	100	91	91	0	t	2026-08-09 17:23:22.810696	2026-07-31 02:23:22.966557	1
2002	251	13	일곱 시간 자기	DAILY	100	91	91	1	t	2026-08-09 17:23:22.811703	2026-07-31 02:23:22.966557	1
2003	251	13	기상 시간 고정	DAILY	100	91	91	2	t	2026-08-09 17:23:22.812675	2026-07-31 02:23:22.966557	1
2004	251	13	자기 전 휴대폰 끄기	DAILY	100	91	91	3	t	2026-08-09 17:23:22.813758	2026-07-31 02:23:22.966557	1
2005	251	13	오후에 카페인 안 먹기	DAILY	100	91	91	4	t	2026-08-09 17:23:22.814875	2026-07-31 02:23:22.966557	1
2006	251	13	수면 기록	DAILY	100	91	91	5	t	2026-08-09 17:23:22.815888	2026-07-31 02:23:22.966557	1
2014	252	13	서점 가기	MONTHLY	100	3	0	5	f	2026-08-09 17:23:22.825633	2026-07-31 02:23:22.966557	1
2015	252	13	서평 쓰기	MONTHLY	100	3	0	6	f	2026-08-09 17:23:22.826871	2026-07-31 02:23:22.966557	1
2016	252	13	읽을 책 목록 만들기	MONTHLY	100	3	0	7	f	2026-08-09 17:23:22.827871	2026-07-31 02:23:22.966557	1
2009	252	13	스무 쪽 읽기	DAILY	100	91	91	0	t	2026-08-09 17:23:22.81972	2026-07-31 02:23:22.966557	1
2010	252	13	밑줄 옮겨 적기	WEEKLY	100	26	26	1	t	2026-08-09 17:23:22.820758	2026-07-31 02:23:22.966557	2
2011	252	13	독서 노트 쓰기	WEEKLY	100	13	13	2	t	2026-08-09 17:23:22.821803	2026-07-31 02:23:22.966557	1
2012	252	13	오디오북 듣기	WEEKLY	100	26	26	3	t	2026-08-09 17:23:22.822719	2026-07-31 02:23:22.966557	2
2013	252	13	한 달 한 권 끝내기	MONTHLY	100	3	3	4	t	2026-08-09 17:23:22.824585	2026-07-31 02:23:22.966557	1
2020	253	13	냉장고 정리	WEEKLY	100	13	0	3	f	2026-08-09 17:23:22.832929	2026-07-31 02:23:22.966557	1
2021	253	13	파일 백업	WEEKLY	100	13	0	4	f	2026-08-09 17:23:22.833847	2026-07-31 02:23:22.966557	1
2022	253	13	지갑 정리	WEEKLY	100	13	0	5	f	2026-08-09 17:23:22.83492	2026-07-31 02:23:22.966557	1
2023	253	13	안 쓰는 물건 비우기	MONTHLY	100	3	0	6	f	2026-08-09 17:23:22.835935	2026-07-31 02:23:22.966557	1
2024	253	13	사진 정리	MONTHLY	100	3	0	7	f	2026-08-09 17:23:22.836916	2026-07-31 02:23:22.966557	1
2017	253	13	책상 정리	DAILY	100	91	91	0	t	2026-08-09 17:23:22.829906	2026-07-31 02:23:22.966557	1
2018	253	13	설거지 바로 하기	DAILY	100	91	91	1	t	2026-08-09 17:23:22.83092	2026-07-31 02:23:22.966557	1
2019	253	13	빨래 개기	WEEKLY	100	26	26	2	t	2026-08-09 17:23:22.831961	2026-07-31 02:23:22.966557	2
2027	254	13	커피값 줄이기	WEEKLY	100	39	0	2	f	2026-08-09 17:23:22.842382	2026-07-31 02:23:22.966557	3
2028	254	13	투자 공부	WEEKLY	100	26	0	3	f	2026-08-09 17:23:22.843367	2026-07-31 02:23:22.966557	2
2029	254	13	고정비 점검	MONTHLY	100	3	0	4	f	2026-08-09 17:23:22.844921	2026-07-31 02:23:22.966557	1
2030	254	13	적금 넣기	MONTHLY	100	3	0	5	f	2026-08-09 17:23:22.845875	2026-07-31 02:23:22.966557	1
2031	254	13	구독 서비스 점검	MONTHLY	100	3	0	6	f	2026-08-09 17:23:22.846831	2026-07-31 02:23:22.966557	1
2032	254	13	다음 달 예산 세우기	MONTHLY	100	3	0	7	f	2026-08-09 17:23:22.847746	2026-07-31 02:23:22.966557	1
2025	254	13	가계부 쓰기	DAILY	100	91	91	0	t	2026-08-09 17:23:22.838929	2026-07-31 02:23:22.966557	1
2026	254	13	무지출 하루	WEEKLY	100	13	13	1	t	2026-08-09 17:23:22.841332	2026-07-31 02:23:22.966557	1
1377	173	8	하늘 보기	DAILY	10	30	1	0	f	2026-08-06 05:24:47.253405	2026-08-07 03:14:28.200167	1
1378	173	8	명상하기	DAILY	10	30	1	1	f	2026-08-06 05:24:47.253883	2026-08-07 03:14:31.058871	1
1379	173	8	음악듣기	DAILY	10	30	1	2	f	2026-08-06 05:24:47.254338	2026-08-07 03:14:32.83798	1
1380	173	8	멍때리기	DAILY	10	30	1	3	f	2026-08-06 05:24:47.2548	2026-08-07 03:14:33.531686	1
1346	169	8	하루 6천 보 걷기	DAILY	10	30	2	1	f	2026-08-06 05:24:47.235532	2026-08-07 03:14:37.741205	1
1347	169	8	주 3회 근력 운동	WEEKLY	10	12	2	2	f	2026-08-06 05:24:47.236178	2026-08-07 03:17:24.069392	3
1348	169	8	야식 끊기	DAILY	10	30	1	3	f	2026-08-06 05:24:47.236816	2026-08-07 03:17:24.847204	1
1349	169	8	식사 시간 규칙적으로 하기	DAILY	10	30	1	4	f	2026-08-06 05:24:47.237465	2026-08-07 03:17:27.354391	1
1350	169	8	물 마시기 습관화하기	DAILY	10	30	1	5	f	2026-08-06 05:24:47.238122	2026-08-07 03:17:27.80332	1
1351	169	8	수면 시간 6시간 확보하기	DAILY	10	30	1	6	f	2026-08-06 05:24:47.23874	2026-08-07 03:17:28.728883	1
1352	169	8	바른 자세 유지하기	DAILY	10	30	1	7	f	2026-08-06 05:24:47.239274	2026-08-07 03:17:30.80544	1
1353	170	8	기술 블로그 읽기	WEEKLY	10	12	1	0	f	2026-08-06 05:24:47.240207	2026-08-07 03:17:34.2761	1
1361	171	8	커피 타오기	WEEKLY	10	12	1	0	f	2026-08-06 05:24:47.244896	2026-08-07 03:26:28.757648	3
1362	171	8	점심 식대 줄이기	DAILY	10	30	1	1	f	2026-08-06 05:24:47.245397	2026-08-07 03:26:29.484839	1
1363	171	8	구독 서비스 점검하기	MONTHLY	10	6	1	2	f	2026-08-06 05:24:47.245868	2026-08-07 03:26:30.332423	1
1364	171	8	안 쓰는 물건 판매하기	MONTHLY	10	6	1	3	f	2026-08-06 05:24:47.246313	2026-08-07 03:26:31.390496	1
1365	171	8	충동구매 방지 목록 작성	WEEKLY	10	12	1	4	f	2026-08-06 05:24:47.246762	2026-08-07 03:26:32.168392	1
1366	171	8	가계부 작성하기	DAILY	10	30	1	5	f	2026-08-06 05:24:47.247231	2026-08-07 03:26:32.667531	1
1367	171	8	고정 지출 분석하기	MONTHLY	10	6	1	6	f	2026-08-06 05:24:47.247667	2026-08-07 03:26:33.280012	1
1368	171	8	커피 사 마시지 않기	WEEKLY	10	12	1	7	f	2026-08-06 05:24:47.248093	2026-08-07 03:26:35.334809	3
1354	170	8	코딩 연습하기	DAILY	10	30	1	1	f	2026-08-06 05:24:47.240743	2026-08-07 04:04:06.54376	1
1359	170	8	코딩 알고리즘 문제 풀기	DAILY	10	30	1	6	f	2026-08-06 05:24:47.243458	2026-08-07 04:04:07.000815	1
2034	255	13	안부 메시지 보내기	WEEKLY	100	39	0	1	f	2026-08-09 17:23:22.850517	2026-07-31 02:23:22.966557	3
2035	255	13	가족에게 연락	WEEKLY	100	26	0	2	f	2026-08-09 17:23:22.851378	2026-07-31 02:23:22.966557	2
2036	255	13	같이 운동하기	WEEKLY	100	13	0	3	f	2026-08-09 17:23:22.852289	2026-07-31 02:23:22.966557	1
1369	172	8	매일 바이올린 연습 30분	DAILY	10	30	1	0	f	2026-08-06 05:24:47.24902	2026-08-07 04:04:07.755496	1
1355	170	8	관련 서적 가끔 읽기	MONTHLY	10	6	0	2	f	2026-08-06 05:24:47.241281	2026-08-05 05:24:47.241303	2
1372	172	8	게임 1시간 플레이	DAILY	10	30	1	3	f	2026-08-06 05:24:47.25045	2026-08-07 04:04:08.445607	1
1374	172	8	음악 이론 30분 학습	DAILY	10	30	1	5	f	2026-08-06 05:24:47.251462	2026-08-07 04:04:09.160466	1
1383	173	8	책상정리정돈	DAILY	10	30	1	6	f	2026-08-06 05:24:47.256316	2026-08-07 04:04:09.812982	1
2037	255	13	묵힌 답장 보내기	WEEKLY	100	13	0	4	f	2026-08-09 17:23:22.853565	2026-07-31 02:23:22.966557	1
2038	255	13	친구 만나기	MONTHLY	100	6	0	5	f	2026-08-09 17:23:22.85459	2026-07-31 02:23:22.966557	2
1356	170	8	정처기 공부하기	WEEKLY	10	12	1	3	f	2026-08-06 05:24:47.241927	2026-08-10 01:53:27.325543	1
2039	255	13	생일 챙기기	MONTHLY	100	3	0	6	f	2026-08-09 17:23:22.855549	2026-07-31 02:23:22.966557	1
2040	255	13	편지 쓰기	MONTHLY	100	3	0	7	f	2026-08-09 17:23:22.856602	2026-07-31 02:23:22.966557	1
2033	255	13	고맙다고 말하기	DAILY	100	91	91	0	t	2026-08-09 17:23:22.849461	2026-07-31 02:23:22.966557	1
2041	256	13	그림 10분	DAILY	100	91	0	0	f	2026-08-09 17:23:22.858468	2026-07-31 02:23:22.966557	1
2042	256	13	악기 연습	DAILY	100	91	0	1	f	2026-08-09 17:23:22.859426	2026-07-31 02:23:22.966557	1
2043	256	13	사진 찍기	WEEKLY	100	26	0	2	f	2026-08-09 17:23:22.860331	2026-07-31 02:23:22.966557	2
2044	256	13	영화 한 편	WEEKLY	100	13	0	3	f	2026-08-09 17:23:22.861255	2026-07-31 02:23:22.966557	1
2045	256	13	새 요리 도전	WEEKLY	100	13	0	4	f	2026-08-09 17:23:22.862163	2026-07-31 02:23:22.966557	1
2046	256	13	산책 코스 개발	WEEKLY	100	13	0	5	f	2026-08-09 17:23:22.863153	2026-07-31 02:23:22.966557	1
2047	256	13	전시 보기	MONTHLY	100	3	0	6	f	2026-08-09 17:23:22.86406	2026-07-31 02:23:22.966557	1
2048	256	13	플레이리스트 만들기	MONTHLY	100	3	0	7	f	2026-08-09 17:23:22.865023	2026-07-31 02:23:22.966557	1
1358	170	8	스터디 그룹 참여하기	WEEKLY	10	12	1	5	f	2026-08-06 05:24:47.242986	2026-08-10 01:53:27.890544	1
1357	170	8	영어공부	WEEKLY	10	12	1	4	f	2026-08-06 05:24:47.242488	2026-08-10 01:53:28.526887	1
1360	170	8	기술 문서 읽고 요약하기	WEEKLY	10	12	1	7	f	2026-08-06 05:24:47.244018	2026-08-10 01:53:35.065961	2
1370	172	8	FPS 게임 주 3회 플레이	WEEKLY	10	12	1	1	f	2026-08-06 05:24:47.249511	2026-08-10 01:53:35.500043	3
1371	172	8	음악 이론 공부하기	WEEKLY	10	12	1	2	f	2026-08-06 05:24:47.250003	2026-08-10 01:53:35.650274	1
1373	172	8	악기 조율 및 관리	WEEKLY	10	12	1	4	f	2026-08-06 05:24:47.250956	2026-08-10 01:53:36.212542	1
1375	172	8	주 3회 FPS 게임 플레이	WEEKLY	10	12	1	6	f	2026-08-06 05:24:47.25199	2026-08-10 01:53:36.44681	3
1376	172	8	새 악기 배우기	WEEKLY	10	12	1	7	f	2026-08-06 05:24:47.252478	2026-08-10 01:53:36.603609	1
1381	173	8	감사일기	WEEKLY	10	12	1	4	f	2026-08-06 05:24:47.255246	2026-08-10 01:53:36.776947	1
1382	173	8	예상 도착 시간보다 20분 일찍 나오기	WEEKLY	10	12	1	5	f	2026-08-06 05:24:47.255807	2026-08-10 01:53:37.128213	1
1386	174	8	뉴스 스크랩	MONTHLY	10	6	0	1	f	2026-08-06 05:24:47.258362	2026-08-05 05:24:47.258387	1
1387	174	8	파이팅하기	NONE	10	1	0	2	f	2026-08-06 05:24:47.25888	2026-08-05 05:24:47.258906	1
1388	174	8	자소서쓰기	WEEKLY	10	12	0	3	f	2026-08-06 05:24:47.259356	2026-08-05 05:24:47.259379	1
1389	174	8	원서 내보기	MONTHLY	10	6	0	4	f	2026-08-06 05:24:47.259868	2026-08-05 05:24:47.259895	3
1390	174	8	일정 잘 보기	WEEKLY	10	12	0	5	f	2026-08-06 05:24:47.260352	2026-08-05 05:24:47.260375	1
1391	174	8	포트폴리오 조금씩 만들기	WEEKLY	10	12	0	6	f	2026-08-06 05:24:47.260961	2026-08-05 05:24:47.260994	1
1392	174	8	프로젝트 깃에 정리	NONE	10	1	0	7	f	2026-08-06 05:24:47.261605	2026-08-05 05:24:47.261632	1
1393	175	8	친구에게 오랜만에 연락해서 안부인사 전하기	WEEKLY	10	12	0	0	f	2026-08-06 05:24:47.262539	2026-08-05 05:24:47.262564	1
1394	175	8	외할머니께 안부인사	WEEKLY	10	12	0	1	f	2026-08-06 05:24:47.263036	2026-08-05 05:24:47.263059	2
1395	175	8	기분이 태도가 되지 않기	NONE	10	1	0	2	f	2026-08-06 05:24:47.26358	2026-08-05 05:24:47.26361	1
1396	175	8	예의 있게 행동하기	NONE	10	1	0	3	f	2026-08-06 05:24:47.264113	2026-08-05 05:24:47.264137	1
1397	175	8	약속 지각 안하기	WEEKLY	10	12	0	4	f	2026-08-06 05:24:47.264587	2026-08-05 05:24:47.26461	1
1398	175	8	-	NONE	10	1	0	5	f	2026-08-06 05:24:47.265219	2026-08-05 05:24:47.265247	1
1399	175	8	-	NONE	10	1	0	6	f	2026-08-06 05:24:47.265796	2026-08-05 05:24:47.265823	1
1400	175	8	-	NONE	10	1	0	7	f	2026-08-06 05:24:47.266348	2026-08-05 05:24:47.26638	1
1384	173	8	긍정적으로 생각	DAILY	10	30	1	7	f	2026-08-06 05:24:47.256807	2026-08-10 01:53:37.494889	1
1385	174	8	기업분석	WEEKLY	10	12	1	0	f	2026-08-06 05:24:47.257854	2026-08-10 01:53:37.719379	1
1402	176	8	2	NONE	10	1	1	1	t	2026-08-06 05:24:47.267817	2026-08-06 05:45:58.758047	1
1403	176	8	3	NONE	10	1	1	2	t	2026-08-06 05:24:47.268363	2026-08-06 05:45:59.491287	1
1404	176	8	4	NONE	10	1	1	3	t	2026-08-06 05:24:47.268829	2026-08-06 05:46:00.572216	1
1405	176	8	5	NONE	10	1	1	4	t	2026-08-06 05:24:47.269292	2026-08-06 05:46:01.643972	1
1407	176	8	7	NONE	10	1	1	6	t	2026-08-06 05:24:47.270248	2026-08-06 05:46:03.593729	1
1408	176	8	8	NONE	10	1	1	7	t	2026-08-06 05:24:47.270912	2026-08-06 05:46:03.151641	1
1601	201	9	삼성전자 MX 사업부 채용 공고 분석	WEEKLY	10	12	0	0	f	2026-08-07 03:27:02.317854	2026-08-07 03:27:02.317854	1
1602	201	9	직무 관련 기술 스택 강화	DAILY	10	30	0	1	f	2026-08-07 03:27:02.318807	2026-08-07 03:27:02.318807	1
1603	201	9	최신 IT 트렌드 및 뉴스 습득	DAILY	10	30	0	2	f	2026-08-07 03:27:02.319511	2026-08-07 03:27:02.319511	1
1604	201	9	실무 프로젝트 경험 정리	WEEKLY	10	12	0	3	f	2026-08-07 03:27:02.320206	2026-08-07 03:27:02.320206	1
1605	201	9	삼성전자 MX 사업부 최신 기술 동향 심층 분석	WEEKLY	10	12	0	4	f	2026-08-07 03:27:02.320907	2026-08-07 03:27:02.320907	1
1606	201	9	실무 프로젝트 경험 구체화 및 성과 측정	WEEKLY	10	12	0	5	f	2026-08-07 03:27:02.321595	2026-08-07 03:27:02.321595	1
1607	201	9	직무 관련 기술 스택 심화 학습 (예: AI, ML)	DAILY	10	30	0	6	f	2026-08-07 03:27:02.322294	2026-08-07 03:27:02.322294	1
1608	201	9	123	DAILY	10	30	0	7	f	2026-08-07 03:27:02.322886	2026-08-07 03:27:02.322886	1
1609	202	9	예상 질문 리스트 만들기	WEEKLY	10	12	0	0	f	2026-08-07 03:27:02.323985	2026-08-07 03:27:02.323985	1
1610	202	9	예상 질문 답변 연습하기	DAILY	10	30	0	1	f	2026-08-07 03:27:02.324565	2026-08-07 03:27:02.324565	1
1611	202	9	모의 면접 진행하기	WEEKLY	10	12	0	2	f	2026-08-07 03:27:02.325164	2026-08-07 03:27:02.325164	1
1612	202	9	123123	DAILY	10	30	0	3	f	2026-08-07 03:27:02.325695	2026-08-07 03:27:02.325695	1
1613	202	9	12	DAILY	10	30	0	4	f	2026-08-07 03:27:02.326283	2026-08-07 03:27:02.326283	1
1614	202	9	3	DAILY	10	30	0	5	f	2026-08-07 03:27:02.326824	2026-08-07 03:27:02.326824	1
1615	202	9	123	DAILY	10	30	0	6	f	2026-08-07 03:27:02.327342	2026-08-07 03:27:02.327342	1
1616	202	9	12	DAILY	10	30	0	7	f	2026-08-07 03:27:02.32811	2026-08-07 03:27:02.32811	1
1617	203	9	충분한 수면 시간 확보	DAILY	10	30	0	0	f	2026-08-07 03:27:02.329248	2026-08-07 03:27:02.329248	1
1618	203	9	2	DAILY	10	30	0	1	f	2026-08-07 03:27:02.32981	2026-08-07 03:27:02.32981	1
1619	203	9	3	DAILY	10	30	0	2	f	2026-08-07 03:27:02.330346	2026-08-07 03:27:02.330346	1
1620	203	9	3	DAILY	10	30	0	3	f	2026-08-07 03:27:02.330885	2026-08-07 03:27:02.330885	1
1621	203	9	3	DAILY	10	30	0	4	f	2026-08-07 03:27:02.331406	2026-08-07 03:27:02.331406	1
1622	203	9	5	DAILY	10	30	0	5	f	2026-08-07 03:27:02.331956	2026-08-07 03:27:02.331956	1
1623	203	9	54	DAILY	10	30	0	6	f	2026-08-07 03:27:02.332476	2026-08-07 03:27:02.332476	1
1624	203	9	5	DAILY	10	30	0	7	f	2026-08-07 03:27:02.333038	2026-08-07 03:27:02.333038	1
1625	204	9	312	DAILY	10	30	0	0	f	2026-08-07 03:27:02.334151	2026-08-07 03:27:02.334151	1
1626	204	9	123	DAILY	10	30	0	1	f	2026-08-07 03:27:02.334687	2026-08-07 03:27:02.334687	1
1627	204	9	312	DAILY	10	30	0	2	f	2026-08-07 03:27:02.335238	2026-08-07 03:27:02.335238	1
1628	204	9	13	DAILY	10	30	0	3	f	2026-08-07 03:27:02.335766	2026-08-07 03:27:02.335766	1
1629	204	9	31	DAILY	10	30	0	4	f	2026-08-07 03:27:02.336321	2026-08-07 03:27:02.336321	1
1630	204	9	12	DAILY	10	30	0	5	f	2026-08-07 03:27:02.336875	2026-08-07 03:27:02.336875	1
1631	204	9	3	DAILY	10	30	0	6	f	2026-08-07 03:27:02.337392	2026-08-07 03:27:02.337392	1
1632	204	9	1	DAILY	10	30	0	7	f	2026-08-07 03:27:02.337956	2026-08-07 03:27:02.337956	1
1633	205	9	12	DAILY	10	30	0	0	f	2026-08-07 03:27:02.339071	2026-08-07 03:27:02.339071	1
1634	205	9	12	DAILY	10	30	0	1	f	2026-08-07 03:27:02.339672	2026-08-07 03:27:02.339672	1
1635	205	9	21	DAILY	10	30	0	2	f	2026-08-07 03:27:02.340215	2026-08-07 03:27:02.340215	1
1636	205	9	12	DAILY	10	30	0	3	f	2026-08-07 03:27:02.34079	2026-08-07 03:27:02.34079	1
1637	205	9	1	DAILY	10	30	0	4	f	2026-08-07 03:27:02.341325	2026-08-07 03:27:02.341325	1
1638	205	9	1	DAILY	10	30	0	5	f	2026-08-07 03:27:02.341853	2026-08-07 03:27:02.341853	1
1639	205	9	12	DAILY	10	30	0	6	f	2026-08-07 03:27:02.342374	2026-08-07 03:27:02.342374	1
1640	205	9	1	DAILY	10	30	0	7	f	2026-08-07 03:27:02.342955	2026-08-07 03:27:02.342955	1
606	76	3	6	DAILY	10	30	1	5	f	2026-08-04 04:57:12.073275	2026-08-06 05:25:33.940284	1
1641	206	9	21	DAILY	10	30	0	0	f	2026-08-07 03:27:02.343977	2026-08-07 03:27:02.343977	1
1642	206	9	12	DAILY	10	30	0	1	f	2026-08-07 03:27:02.344507	2026-08-07 03:27:02.344507	1
1643	206	9	12	DAILY	10	30	0	2	f	2026-08-07 03:27:02.345049	2026-08-07 03:27:02.345049	1
1644	206	9	2	DAILY	10	30	0	3	f	2026-08-07 03:27:02.345559	2026-08-07 03:27:02.345559	1
1645	206	9	12	DAILY	10	30	0	4	f	2026-08-07 03:27:02.346094	2026-08-07 03:27:02.346094	1
1646	206	9	2	DAILY	10	30	0	5	f	2026-08-07 03:27:02.34661	2026-08-07 03:27:02.34661	1
1647	206	9	212	DAILY	10	30	0	6	f	2026-08-07 03:27:02.347148	2026-08-07 03:27:02.347148	1
1648	206	9	2	DAILY	10	30	0	7	f	2026-08-07 03:27:02.347699	2026-08-07 03:27:02.347699	1
1649	207	9	12	DAILY	10	30	0	0	f	2026-08-07 03:27:02.34876	2026-08-07 03:27:02.34876	1
1650	207	9	1	DAILY	10	30	0	1	f	2026-08-07 03:27:02.349307	2026-08-07 03:27:02.349307	1
1651	207	9	1	DAILY	10	30	0	2	f	2026-08-07 03:27:02.349839	2026-08-07 03:27:02.349839	1
1652	207	9	2	DAILY	10	30	0	3	f	2026-08-07 03:27:02.350353	2026-08-07 03:27:02.350353	1
1653	207	9	12	DAILY	10	30	0	4	f	2026-08-07 03:27:02.35088	2026-08-07 03:27:02.35088	1
1654	207	9	2	DAILY	10	30	0	5	f	2026-08-07 03:27:02.351389	2026-08-07 03:27:02.351389	1
1655	207	9	2	DAILY	10	30	0	6	f	2026-08-07 03:27:02.351927	2026-08-07 03:27:02.351927	1
1656	207	9	2	DAILY	10	30	0	7	f	2026-08-07 03:27:02.352431	2026-08-07 03:27:02.352431	1
1657	208	9	21	DAILY	10	30	0	0	f	2026-08-07 03:27:02.353454	2026-08-07 03:27:02.353454	1
1658	208	9	12	DAILY	10	30	0	1	f	2026-08-07 03:27:02.35403	2026-08-07 03:27:02.35403	1
1659	208	9	12	DAILY	10	30	0	2	f	2026-08-07 03:27:02.354567	2026-08-07 03:27:02.354567	1
1660	208	9	1	DAILY	10	30	0	3	f	2026-08-07 03:27:02.355101	2026-08-07 03:27:02.355101	1
1661	208	9	212	DAILY	10	30	0	4	f	2026-08-07 03:27:02.355612	2026-08-07 03:27:02.355612	1
1662	208	9	1	DAILY	10	30	0	5	f	2026-08-07 03:27:02.356151	2026-08-07 03:27:02.356151	1
1663	208	9	1	DAILY	10	30	0	6	f	2026-08-07 03:27:02.356664	2026-08-07 03:27:02.356664	1
1664	208	9	1	DAILY	10	30	0	7	f	2026-08-07 03:27:02.357245	2026-08-07 03:27:02.357245	1
1401	176	8	1	NONE	10	1	1	0	t	2026-08-06 05:24:47.267327	2026-08-06 05:45:57.333027	1
1345	169	8	매일 스트레칭 10분	DAILY	10	30	2	0	f	2026-08-06 05:24:47.234529	2026-08-07 03:14:36.893474	1
2049	257	14	백준 한 문제 풀기	DAILY	100	61	61	0	t	2026-08-09 17:23:23.086375	2026-07-31 02:23:23.258877	1
2050	257	14	틀린 문제 오답 정리	WEEKLY	100	16	16	1	t	2026-08-09 17:23:23.087289	2026-07-31 02:23:23.258877	2
2051	257	14	풀이 코드 리뷰 받기	WEEKLY	100	8	8	2	t	2026-08-09 17:23:23.088421	2026-07-31 02:23:23.258877	1
2052	257	14	시간복잡도 계산 연습	WEEKLY	100	16	16	3	t	2026-08-09 17:23:23.089261	2026-07-31 02:23:23.258877	2
2053	257	14	그래프 문제 다섯 개	WEEKLY	100	8	8	4	t	2026-08-09 17:23:23.090084	2026-07-31 02:23:23.258877	1
2054	257	14	DP 문제 다섯 개	WEEKLY	100	8	8	5	t	2026-08-09 17:23:23.090949	2026-07-31 02:23:23.258877	1
2055	257	14	모의 코딩테스트 응시	WEEKLY	100	8	8	6	t	2026-08-09 17:23:23.091844	2026-07-31 02:23:23.258877	1
2056	257	14	알고리즘 스터디 참여	WEEKLY	100	8	8	7	t	2026-08-09 17:23:23.092622	2026-07-31 02:23:23.258877	1
2057	258	14	Spring 공식 문서 읽기	DAILY	100	61	61	0	t	2026-08-09 17:23:23.094036	2026-07-31 02:23:23.258877	1
2058	258	14	REST API 설계 연습	WEEKLY	100	16	16	1	t	2026-08-09 17:23:23.094767	2026-07-31 02:23:23.258877	2
2059	258	14	JPA 쿼리 튜닝해 보기	WEEKLY	100	8	8	2	t	2026-08-09 17:23:23.095646	2026-07-31 02:23:23.258877	1
2060	258	14	테스트 코드 작성	DAILY	100	61	61	3	t	2026-08-09 17:23:23.096431	2026-07-31 02:23:23.258877	1
2061	258	14	예외 처리 규칙 정리	WEEKLY	100	8	8	4	t	2026-08-09 17:23:23.097276	2026-07-31 02:23:23.258877	1
2062	258	14	트랜잭션 실습	WEEKLY	100	8	8	5	t	2026-08-09 17:23:23.098167	2026-07-31 02:23:23.258877	1
2063	258	14	인증·인가 구현해 보기	WEEKLY	100	8	8	6	t	2026-08-09 17:23:23.099942	2026-07-31 02:23:23.258877	1
2064	258	14	API 응답 시간 측정	WEEKLY	100	8	8	7	t	2026-08-09 17:23:23.100939	2026-07-31 02:23:23.258877	1
2065	259	14	React 훅 실습	DAILY	100	61	61	0	t	2026-08-09 17:23:23.104403	2026-07-31 02:23:23.258877	1
2066	259	14	타입스크립트 타입 연습	DAILY	100	61	61	1	t	2026-08-09 17:23:23.105341	2026-07-31 02:23:23.258877	1
2067	259	14	접근성 점검	WEEKLY	100	8	8	2	t	2026-08-09 17:23:23.106153	2026-07-31 02:23:23.258877	1
2068	259	14	렌더 최적화 실험	WEEKLY	100	8	8	3	t	2026-08-09 17:23:23.106959	2026-07-31 02:23:23.258877	1
2069	259	14	상태 관리 리팩터링	WEEKLY	100	8	8	4	t	2026-08-09 17:23:23.107721	2026-07-31 02:23:23.258877	1
2070	259	14	반응형 레이아웃 만들기	WEEKLY	100	8	8	5	t	2026-08-09 17:23:23.10863	2026-07-31 02:23:23.258877	1
2071	259	14	애니메이션 다듬기	WEEKLY	100	8	8	6	t	2026-08-09 17:23:23.109639	2026-07-31 02:23:23.258877	1
2072	259	14	컴포넌트 문서화	WEEKLY	100	8	8	7	t	2026-08-09 17:23:23.110542	2026-07-31 02:23:23.258877	1
2073	260	14	배포 로그 확인	DAILY	100	61	61	0	t	2026-08-09 17:23:23.112107	2026-07-31 02:23:23.258877	1
2074	260	14	Docker 이미지 만들기	WEEKLY	100	8	8	1	t	2026-08-09 17:23:23.112955	2026-07-31 02:23:23.258877	1
2075	260	14	CI 파이프라인 손보기	WEEKLY	100	8	8	2	t	2026-08-09 17:23:23.113822	2026-07-31 02:23:23.258877	1
2076	260	14	nginx 설정 이해하기	WEEKLY	100	8	8	3	t	2026-08-09 17:23:23.114625	2026-07-31 02:23:23.258877	1
2077	260	14	모니터링 지표 보기	WEEKLY	100	16	16	4	t	2026-08-09 17:23:23.115704	2026-07-31 02:23:23.258877	2
2078	260	14	백업 스크립트 점검	MONTHLY	100	2	2	5	t	2026-08-09 17:23:23.116749	2026-07-31 02:23:23.258877	1
2079	260	14	보안 그룹 정리	MONTHLY	100	2	2	6	t	2026-08-09 17:23:23.117841	2026-07-31 02:23:23.258877	1
2080	260	14	장애 대응 훈련	MONTHLY	100	2	2	7	t	2026-08-09 17:23:23.118759	2026-07-31 02:23:23.258877	1
2081	261	14	면접 질문 답변 정리	DAILY	100	61	61	0	t	2026-08-09 17:23:23.120247	2026-07-31 02:23:23.258877	1
2082	261	14	네트워크 한 챕터	WEEKLY	100	16	16	1	t	2026-08-09 17:23:23.121129	2026-07-31 02:23:23.258877	2
2083	261	14	운영체제 한 챕터	WEEKLY	100	16	16	2	t	2026-08-09 17:23:23.121984	2026-07-31 02:23:23.258877	2
2084	261	14	자료구조 직접 구현	WEEKLY	100	8	8	3	t	2026-08-09 17:23:23.122714	2026-07-31 02:23:23.258877	1
2085	261	14	정규화 연습	WEEKLY	100	8	8	4	t	2026-08-09 17:23:23.123512	2026-07-31 02:23:23.258877	1
2086	261	14	디자인 패턴 하나 정리	WEEKLY	100	8	8	5	t	2026-08-09 17:23:23.124314	2026-07-31 02:23:23.258877	1
2087	261	14	동시성 개념 정리	WEEKLY	100	8	8	6	t	2026-08-09 17:23:23.125141	2026-07-31 02:23:23.258877	1
2088	261	14	컴파일 과정 정리	MONTHLY	100	2	2	7	t	2026-08-09 17:23:23.125975	2026-07-31 02:23:23.258877	1
2089	262	14	커밋 메시지 다듬기	DAILY	100	61	61	0	t	2026-08-09 17:23:23.127486	2026-07-31 02:23:23.258877	1
2090	262	14	PR 리뷰 남기기	DAILY	100	61	61	1	t	2026-08-09 17:23:23.128236	2026-07-31 02:23:23.258877	1
2091	262	14	데일리 스크럼 참여	DAILY	100	61	61	2	t	2026-08-09 17:23:23.129021	2026-07-31 02:23:23.258877	1
2092	262	14	회고 작성	WEEKLY	100	8	8	3	t	2026-08-09 17:23:23.12989	2026-07-31 02:23:23.258877	1
2093	262	14	이슈 정리	WEEKLY	100	16	16	4	t	2026-08-09 17:23:23.13072	2026-07-31 02:23:23.258877	2
2094	262	14	문서 최신화	WEEKLY	100	8	8	5	t	2026-08-09 17:23:23.13154	2026-07-31 02:23:23.258877	1
2095	262	14	페어 프로그래밍	WEEKLY	100	8	8	6	t	2026-08-09 17:23:23.132364	2026-07-31 02:23:23.258877	1
2096	262	14	팀 규칙 점검	MONTHLY	100	2	2	7	t	2026-08-09 17:23:23.13326	2026-07-31 02:23:23.258877	1
2097	263	14	학습 노트 작성	DAILY	100	61	61	0	t	2026-08-09 17:23:23.134814	2026-07-31 02:23:23.258877	1
2098	263	14	읽은 문서 링크 정리	DAILY	100	61	61	1	t	2026-08-09 17:23:23.135571	2026-07-31 02:23:23.258877	1
2099	263	14	블로그 글 초안 쓰기	WEEKLY	100	8	8	2	t	2026-08-09 17:23:23.136412	2026-07-31 02:23:23.258877	1
2100	263	14	트러블슈팅 기록	WEEKLY	100	16	16	3	t	2026-08-09 17:23:23.137371	2026-07-31 02:23:23.258877	2
2101	263	14	코드 스니펫 정리	WEEKLY	100	8	8	4	t	2026-08-09 17:23:23.138252	2026-07-31 02:23:23.258877	1
2102	263	14	주간 회고 쓰기	WEEKLY	100	8	8	5	t	2026-08-09 17:23:23.139227	2026-07-31 02:23:23.258877	1
1406	176	8	6	NONE	10	1	1	5	t	2026-08-06 05:24:47.26979	2026-08-06 05:46:01.997554	1
2103	263	14	블로그 발행	MONTHLY	100	4	4	6	t	2026-08-09 17:23:23.140097	2026-07-31 02:23:23.258877	2
2104	263	14	목표 점검	MONTHLY	100	2	2	7	t	2026-08-09 17:23:23.141042	2026-07-31 02:23:23.258877	1
2105	264	14	아침 스트레칭	DAILY	100	61	61	0	t	2026-08-09 17:23:23.144157	2026-07-31 02:23:23.258877	1
2106	264	14	산책 30분	DAILY	100	61	61	1	t	2026-08-09 17:23:23.145035	2026-07-31 02:23:23.258877	1
2107	264	14	물 2리터 마시기	DAILY	100	61	61	2	t	2026-08-09 17:23:23.145855	2026-07-31 02:23:23.258877	1
2108	264	14	12시 전에 자기	DAILY	100	61	61	3	t	2026-08-09 17:23:23.146695	2026-07-31 02:23:23.258877	1
2109	264	14	눈 운동	DAILY	100	61	61	4	t	2026-08-09 17:23:23.147573	2026-07-31 02:23:23.258877	3
2110	264	14	식단 기록	DAILY	100	61	61	5	t	2026-08-09 17:23:23.148388	2026-07-31 02:23:23.258877	1
2111	264	14	주말 운동	WEEKLY	100	16	16	6	t	2026-08-09 17:23:23.149203	2026-07-31 02:23:23.258877	2
2112	264	14	건강검진 예약	NONE	100	1	1	7	t	2026-08-09 17:23:23.15011	2026-07-31 02:23:23.258877	1
640	80	3	8	DAILY	10	30	1	7	f	2026-08-04 04:57:12.105653	2026-08-07 04:44:26.07703	1
2115	265	14	홈트 20분	DAILY	100	91	91	2	t	2026-08-09 17:23:23.270381	2026-07-31 02:23:23.397293	1
2113	265	14	아침 스트레칭	DAILY	100	91	91	0	t	2026-08-09 17:23:23.268759	2026-07-31 02:23:23.397293	1
2114	265	14	계단 이용하기	DAILY	100	91	91	1	t	2026-08-09 17:23:23.26961	2026-07-31 02:23:23.397293	1
2116	265	14	만보 걷기	DAILY	100	91	91	3	t	2026-08-09 17:23:23.271163	2026-07-31 02:23:23.397293	1
2117	265	14	자세 교정 운동	DAILY	100	91	91	4	t	2026-08-09 17:23:23.272058	2026-07-31 02:23:23.397293	1
2118	265	14	러닝 다녀오기	WEEKLY	100	26	26	5	t	2026-08-09 17:23:23.272887	2026-07-31 02:23:23.397293	2
2119	265	14	체중 기록	WEEKLY	100	39	39	6	t	2026-08-09 17:23:23.273658	2026-07-31 02:23:23.397293	3
2120	265	14	주말 등산	MONTHLY	100	3	3	7	t	2026-08-09 17:23:23.274433	2026-07-31 02:23:23.397293	1
2128	266	14	배달 한 번만	WEEKLY	100	13	0	7	f	2026-08-09 17:23:23.281524	2026-07-31 02:23:23.397293	1
2121	266	14	아침 먹기	DAILY	100	91	91	0	t	2026-08-09 17:23:23.275869	2026-07-31 02:23:23.397293	1
2122	266	14	야식 참기	DAILY	100	91	91	1	t	2026-08-09 17:23:23.27663	2026-07-31 02:23:23.397293	1
2123	266	14	채소 한 접시	DAILY	100	91	91	2	t	2026-08-09 17:23:23.27737	2026-07-31 02:23:23.397293	1
2124	266	14	물 2리터 마시기	DAILY	100	91	91	3	t	2026-08-09 17:23:23.278374	2026-07-31 02:23:23.397293	1
2125	266	14	커피 두 잔 이하	DAILY	100	91	91	4	t	2026-08-09 17:23:23.279181	2026-07-31 02:23:23.397293	1
2126	266	14	영양제 챙겨 먹기	DAILY	100	91	91	5	t	2026-08-09 17:23:23.280003	2026-07-31 02:23:23.397293	1
2127	266	14	직접 요리하기	WEEKLY	100	26	26	6	t	2026-08-09 17:23:23.280753	2026-07-31 02:23:23.397293	2
2135	267	14	낮잠 20분 이내	DAILY	100	91	0	6	f	2026-08-09 17:23:23.287674	2026-07-31 02:23:23.397293	1
2136	267	14	침구 정리	WEEKLY	100	26	0	7	f	2026-08-09 17:23:23.288427	2026-07-31 02:23:23.397293	2
2129	267	14	12시 전에 자기	DAILY	100	91	91	0	t	2026-08-09 17:23:23.282918	2026-07-31 02:23:23.397293	1
1665	209	7	흥미로운 책 3권 선정하기	WEEKLY	10	12	0	0	f	2026-08-07 07:27:21.398571	2026-08-07 07:27:21.398571	1
1666	209	7	1	DAILY	10	30	0	1	f	2026-08-07 07:27:21.400873	2026-08-07 07:27:21.400873	1
1667	209	7	2	DAILY	10	30	0	2	f	2026-08-07 07:27:21.401583	2026-08-07 07:27:21.401583	1
1668	209	7	3	DAILY	10	30	0	3	f	2026-08-07 07:27:21.402249	2026-08-07 07:27:21.402249	1
1669	209	7	4	DAILY	10	30	0	4	f	2026-08-07 07:27:21.402846	2026-08-07 07:27:21.402846	1
1670	209	7	5	DAILY	10	30	0	5	f	2026-08-07 07:27:21.403462	2026-08-07 07:27:21.403462	1
1671	209	7	6	DAILY	10	30	0	6	f	2026-08-07 07:27:21.404091	2026-08-07 07:27:21.404091	1
1672	209	7	7	DAILY	10	30	0	7	f	2026-08-07 07:27:21.404607	2026-08-07 07:27:21.404607	1
1673	210	7	하루 10,000보 걷기	DAILY	10	30	0	0	f	2026-08-07 07:27:21.405585	2026-08-07 07:27:21.405585	1
1674	210	7	근력 운동하기	WEEKLY	10	12	0	1	f	2026-08-07 07:27:21.406239	2026-08-07 07:27:21.406239	3
1675	210	7	3	DAILY	10	30	0	2	f	2026-08-07 07:27:21.406764	2026-08-07 07:27:21.406764	1
1676	210	7	4	DAILY	10	30	0	3	f	2026-08-07 07:27:21.407321	2026-08-07 07:27:21.407321	1
1677	210	7	5	DAILY	10	30	0	4	f	2026-08-07 07:27:21.408079	2026-08-07 07:27:21.408079	1
1678	210	7	6	DAILY	10	30	0	5	f	2026-08-07 07:27:21.40863	2026-08-07 07:27:21.40863	1
1679	210	7	7	DAILY	10	30	0	6	f	2026-08-07 07:27:21.409096	2026-08-07 07:27:21.409096	1
1680	210	7	8	DAILY	10	30	0	7	f	2026-08-07 07:27:21.409577	2026-08-07 07:27:21.409577	1
1681	211	7	역사 유적지 탐방 계획 세우기	WEEKLY	10	12	0	0	f	2026-08-07 07:27:21.410524	2026-08-07 07:27:21.410524	1
1682	211	7	관련 역사 서적 읽기	WEEKLY	10	12	0	1	f	2026-08-07 07:27:21.411039	2026-08-07 07:27:21.411039	2
1683	211	7	여행 중 역사 기록 남기기	DAILY	10	30	0	2	f	2026-08-07 07:27:21.411522	2026-08-07 07:27:21.411522	1
1684	211	7	4	DAILY	10	30	0	3	f	2026-08-07 07:27:21.41219	2026-08-07 07:27:21.41219	1
1685	211	7	5	DAILY	10	30	0	4	f	2026-08-07 07:27:21.412717	2026-08-07 07:27:21.412717	1
1686	211	7	6	DAILY	10	30	0	5	f	2026-08-07 07:27:21.413203	2026-08-07 07:27:21.413203	1
1687	211	7	7	DAILY	10	30	0	6	f	2026-08-07 07:27:21.413769	2026-08-07 07:27:21.413769	1
1688	211	7	8	DAILY	10	30	0	7	f	2026-08-07 07:27:21.41444	2026-08-07 07:27:21.41444	1
1689	212	7	1	DAILY	10	30	0	0	f	2026-08-07 07:27:21.41548	2026-08-07 07:27:21.41548	1
1690	212	7	2	DAILY	10	30	0	1	f	2026-08-07 07:27:21.416127	2026-08-07 07:27:21.416127	1
1691	212	7	3	DAILY	10	30	0	2	f	2026-08-07 07:27:21.416645	2026-08-07 07:27:21.416645	1
1692	212	7	4	DAILY	10	30	0	3	f	2026-08-07 07:27:21.417165	2026-08-07 07:27:21.417165	1
1693	212	7	5	DAILY	10	30	0	4	f	2026-08-07 07:27:21.417625	2026-08-07 07:27:21.417625	1
1694	212	7	6	DAILY	10	30	0	5	f	2026-08-07 07:27:21.418079	2026-08-07 07:27:21.418079	1
1695	212	7	7	DAILY	10	30	0	6	f	2026-08-07 07:27:21.418533	2026-08-07 07:27:21.418533	1
1696	212	7	8	DAILY	10	30	0	7	f	2026-08-07 07:27:21.419079	2026-08-07 07:27:21.419079	1
1697	213	7	551	DAILY	10	30	0	0	f	2026-08-07 07:27:21.420031	2026-08-07 07:27:21.420031	1
1698	213	7	552	DAILY	10	30	0	1	f	2026-08-07 07:27:21.420491	2026-08-07 07:27:21.420491	1
1699	213	7	553	DAILY	10	30	0	2	f	2026-08-07 07:27:21.421001	2026-08-07 07:27:21.421001	1
1700	213	7	554	DAILY	10	30	0	3	f	2026-08-07 07:27:21.421629	2026-08-07 07:27:21.421629	1
1701	213	7	5555	DAILY	10	30	0	4	f	2026-08-07 07:27:21.422203	2026-08-07 07:27:21.422203	1
1702	213	7	12152115	DAILY	10	30	0	5	f	2026-08-07 07:27:21.422704	2026-08-07 07:27:21.422704	1
1703	213	7	12525	DAILY	10	30	0	6	f	2026-08-07 07:27:21.423201	2026-08-07 07:27:21.423201	1
1704	213	7	12512	DAILY	10	30	0	7	f	2026-08-07 07:27:21.423692	2026-08-07 07:27:21.423692	1
1705	214	7	12424	DAILY	10	30	0	0	f	2026-08-07 07:27:21.424844	2026-08-07 07:27:21.424844	1
1706	214	7	124512	DAILY	10	30	0	1	f	2026-08-07 07:27:21.42546	2026-08-07 07:27:21.42546	1
1707	214	7	1242	DAILY	10	30	0	2	f	2026-08-07 07:27:21.426078	2026-08-07 07:27:21.426078	1
1708	214	7	12521	DAILY	10	30	0	3	f	2026-08-07 07:27:21.426579	2026-08-07 07:27:21.426579	1
1709	214	7	12345	DAILY	10	30	0	4	f	2026-08-07 07:27:21.427057	2026-08-07 07:27:21.427057	1
1710	214	7	15 61	DAILY	10	30	0	5	f	2026-08-07 07:27:21.427594	2026-08-07 07:27:21.427594	1
1711	214	7	717	DAILY	10	30	0	6	f	2026-08-07 07:27:21.428149	2026-08-07 07:27:21.428149	1
1712	214	7	17237	DAILY	10	30	0	7	f	2026-08-07 07:27:21.428739	2026-08-07 07:27:21.428739	1
1713	215	7	21	DAILY	10	30	0	0	f	2026-08-07 07:27:21.429867	2026-08-07 07:27:21.429867	1
1714	215	7	125	DAILY	10	30	0	1	f	2026-08-07 07:27:21.430432	2026-08-07 07:27:21.430432	1
1715	215	7	12	DAILY	10	30	0	2	f	2026-08-07 07:27:21.43095	2026-08-07 07:27:21.43095	1
1716	215	7	25	DAILY	10	30	0	3	f	2026-08-07 07:27:21.431469	2026-08-07 07:27:21.431469	1
1717	215	7	215	DAILY	10	30	0	4	f	2026-08-07 07:27:21.431994	2026-08-07 07:27:21.431994	1
1718	215	7	125	DAILY	10	30	0	5	f	2026-08-07 07:27:21.432463	2026-08-07 07:27:21.432463	1
1719	215	7	125	DAILY	10	30	0	6	f	2026-08-07 07:27:21.432953	2026-08-07 07:27:21.432953	1
1720	215	7	12	DAILY	10	30	0	7	f	2026-08-07 07:27:21.433513	2026-08-07 07:27:21.433513	1
1721	216	7	wrerw	DAILY	10	30	0	0	f	2026-08-07 07:27:21.434619	2026-08-07 07:27:21.434619	1
1722	216	7	wetw	DAILY	10	30	0	1	f	2026-08-07 07:27:21.435225	2026-08-07 07:27:21.435225	1
1723	216	7	wtwt2323	DAILY	10	30	0	2	f	2026-08-07 07:27:21.43591	2026-08-07 07:27:21.43591	1
1724	216	7	23t3t	DAILY	10	30	0	3	f	2026-08-07 07:27:21.436541	2026-08-07 07:27:21.436541	1
1725	216	7	23t3t	DAILY	10	30	0	4	f	2026-08-07 07:27:21.437163	2026-08-07 07:27:21.437163	1
1726	216	7	32t32t	DAILY	10	30	0	5	f	2026-08-07 07:27:21.437682	2026-08-07 07:27:21.437682	1
1727	216	7	t23t32	DAILY	10	30	0	6	f	2026-08-07 07:27:21.438216	2026-08-07 07:27:21.438216	1
1728	216	7	23t32t	DAILY	10	30	0	7	f	2026-08-07 07:27:21.438737	2026-08-07 07:27:21.438737	1
2130	267	14	일곱 시간 자기	DAILY	100	91	91	1	t	2026-08-09 17:23:23.283674	2026-07-31 02:23:23.397293	1
2131	267	14	기상 시간 고정	DAILY	100	91	91	2	t	2026-08-09 17:23:23.284579	2026-07-31 02:23:23.397293	1
2132	267	14	자기 전 휴대폰 끄기	DAILY	100	91	91	3	t	2026-08-09 17:23:23.28537	2026-07-31 02:23:23.397293	1
2133	267	14	오후에 카페인 안 먹기	DAILY	100	91	91	4	t	2026-08-09 17:23:23.286178	2026-07-31 02:23:23.397293	1
2134	267	14	수면 기록	DAILY	100	91	91	5	t	2026-08-09 17:23:23.286941	2026-07-31 02:23:23.397293	1
2142	268	14	서점 가기	MONTHLY	100	3	0	5	f	2026-08-09 17:23:23.293718	2026-07-31 02:23:23.397293	1
2143	268	14	서평 쓰기	MONTHLY	100	3	0	6	f	2026-08-09 17:23:23.294548	2026-07-31 02:23:23.397293	1
2144	268	14	읽을 책 목록 만들기	MONTHLY	100	3	0	7	f	2026-08-09 17:23:23.295351	2026-07-31 02:23:23.397293	1
2137	268	14	스무 쪽 읽기	DAILY	100	91	91	0	t	2026-08-09 17:23:23.2898	2026-07-31 02:23:23.397293	1
2138	268	14	밑줄 옮겨 적기	WEEKLY	100	26	26	1	t	2026-08-09 17:23:23.290539	2026-07-31 02:23:23.397293	2
2139	268	14	독서 노트 쓰기	WEEKLY	100	13	13	2	t	2026-08-09 17:23:23.291403	2026-07-31 02:23:23.397293	1
2140	268	14	오디오북 듣기	WEEKLY	100	26	26	3	t	2026-08-09 17:23:23.292188	2026-07-31 02:23:23.397293	2
2141	268	14	한 달 한 권 끝내기	MONTHLY	100	3	3	4	t	2026-08-09 17:23:23.292962	2026-07-31 02:23:23.397293	1
2145	269	14	책상 정리	DAILY	100	91	91	0	t	2026-08-09 17:23:23.296745	2026-07-31 02:23:23.397293	1
2146	269	14	설거지 바로 하기	DAILY	100	91	91	1	t	2026-08-09 17:23:23.297648	2026-07-31 02:23:23.397293	1
2147	269	14	빨래 개기	WEEKLY	100	26	26	2	t	2026-08-09 17:23:23.298441	2026-07-31 02:23:23.397293	2
2148	269	14	냉장고 정리	WEEKLY	100	13	0	3	f	2026-08-09 17:23:23.299293	2026-07-31 02:23:23.397293	1
2149	269	14	파일 백업	WEEKLY	100	13	0	4	f	2026-08-09 17:23:23.300144	2026-07-31 02:23:23.397293	1
2150	269	14	지갑 정리	WEEKLY	100	13	0	5	f	2026-08-09 17:23:23.300913	2026-07-31 02:23:23.397293	1
2151	269	14	안 쓰는 물건 비우기	MONTHLY	100	3	0	6	f	2026-08-09 17:23:23.30166	2026-07-31 02:23:23.397293	1
2152	269	14	사진 정리	MONTHLY	100	3	0	7	f	2026-08-09 17:23:23.302528	2026-07-31 02:23:23.397293	1
2153	270	14	가계부 쓰기	DAILY	100	91	91	0	t	2026-08-09 17:23:23.303981	2026-07-31 02:23:23.397293	1
2155	270	14	커피값 줄이기	WEEKLY	100	39	0	2	f	2026-08-09 17:23:23.305553	2026-07-31 02:23:23.397293	3
2156	270	14	투자 공부	WEEKLY	100	26	0	3	f	2026-08-09 17:23:23.306364	2026-07-31 02:23:23.397293	2
2157	270	14	고정비 점검	MONTHLY	100	3	0	4	f	2026-08-09 17:23:23.307184	2026-07-31 02:23:23.397293	1
2158	270	14	적금 넣기	MONTHLY	100	3	0	5	f	2026-08-09 17:23:23.307967	2026-07-31 02:23:23.397293	1
2159	270	14	구독 서비스 점검	MONTHLY	100	3	0	6	f	2026-08-09 17:23:23.30873	2026-07-31 02:23:23.397293	1
2160	270	14	다음 달 예산 세우기	MONTHLY	100	3	0	7	f	2026-08-09 17:23:23.309503	2026-07-31 02:23:23.397293	1
2154	270	14	무지출 하루	WEEKLY	100	13	13	1	t	2026-08-09 17:23:23.304768	2026-07-31 02:23:23.397293	1
2162	271	14	안부 메시지 보내기	WEEKLY	100	39	0	1	f	2026-08-09 17:23:23.311704	2026-07-31 02:23:23.397293	3
2163	271	14	가족에게 연락	WEEKLY	100	26	0	2	f	2026-08-09 17:23:23.312457	2026-07-31 02:23:23.397293	2
2164	271	14	같이 운동하기	WEEKLY	100	13	0	3	f	2026-08-09 17:23:23.313209	2026-07-31 02:23:23.397293	1
2165	271	14	묵힌 답장 보내기	WEEKLY	100	13	0	4	f	2026-08-09 17:23:23.31415	2026-07-31 02:23:23.397293	1
2166	271	14	친구 만나기	MONTHLY	100	6	0	5	f	2026-08-09 17:23:23.314958	2026-07-31 02:23:23.397293	2
2167	271	14	생일 챙기기	MONTHLY	100	3	0	6	f	2026-08-09 17:23:23.315701	2026-07-31 02:23:23.397293	1
2168	271	14	편지 쓰기	MONTHLY	100	3	0	7	f	2026-08-09 17:23:23.316449	2026-07-31 02:23:23.397293	1
2161	271	14	고맙다고 말하기	DAILY	100	91	91	0	t	2026-08-09 17:23:23.310938	2026-07-31 02:23:23.397293	1
2169	272	14	그림 10분	DAILY	100	91	0	0	f	2026-08-09 17:23:23.317769	2026-07-31 02:23:23.397293	1
2170	272	14	악기 연습	DAILY	100	91	0	1	f	2026-08-09 17:23:23.318517	2026-07-31 02:23:23.397293	1
2171	272	14	사진 찍기	WEEKLY	100	26	0	2	f	2026-08-09 17:23:23.319343	2026-07-31 02:23:23.397293	2
2172	272	14	영화 한 편	WEEKLY	100	13	0	3	f	2026-08-09 17:23:23.320112	2026-07-31 02:23:23.397293	1
2173	272	14	새 요리 도전	WEEKLY	100	13	0	4	f	2026-08-09 17:23:23.320859	2026-07-31 02:23:23.397293	1
2174	272	14	산책 코스 개발	WEEKLY	100	13	0	5	f	2026-08-09 17:23:23.321621	2026-07-31 02:23:23.397293	1
2175	272	14	전시 보기	MONTHLY	100	3	0	6	f	2026-08-09 17:23:23.322412	2026-07-31 02:23:23.397293	1
2176	272	14	플레이리스트 만들기	MONTHLY	100	3	0	7	f	2026-08-09 17:23:23.323302	2026-07-31 02:23:23.397293	1
64	8	3	서류 정리	WEEKLY	100	4	2	7	f	2026-08-03 01:40:30.995798	2026-08-06 08:30:36.814561	1
331	42	6	다큐멘터리/교양 프로그램 시청	WEEKLY	10	12	1	2	f	2026-08-04 04:01:28.413219	2026-08-07 07:55:57.69428	1
344	43	6	주요 프로젝트 깔끔하게 문서화해두기	WEEKLY	10	12	1	7	f	2026-08-04 04:01:28.42991	2026-08-07 07:55:58.709133	1
2177	273	15	백준 한 문제 풀기	DAILY	100	61	61	0	t	2026-08-09 17:23:23.488161	2026-07-31 02:23:23.629684	1
2178	273	15	틀린 문제 오답 정리	WEEKLY	100	16	16	1	t	2026-08-09 17:23:23.489072	2026-07-31 02:23:23.629684	2
2179	273	15	풀이 코드 리뷰 받기	WEEKLY	100	8	8	2	t	2026-08-09 17:23:23.489888	2026-07-31 02:23:23.629684	1
2180	273	15	시간복잡도 계산 연습	WEEKLY	100	16	16	3	t	2026-08-09 17:23:23.4906	2026-07-31 02:23:23.629684	2
2181	273	15	그래프 문제 다섯 개	WEEKLY	100	8	8	4	t	2026-08-09 17:23:23.491301	2026-07-31 02:23:23.629684	1
2182	273	15	DP 문제 다섯 개	WEEKLY	100	8	8	5	t	2026-08-09 17:23:23.492004	2026-07-31 02:23:23.629684	1
2183	273	15	모의 코딩테스트 응시	WEEKLY	100	8	8	6	t	2026-08-09 17:23:23.492684	2026-07-31 02:23:23.629684	1
2184	273	15	알고리즘 스터디 참여	WEEKLY	100	8	8	7	t	2026-08-09 17:23:23.493388	2026-07-31 02:23:23.629684	1
2185	274	15	Spring 공식 문서 읽기	DAILY	100	61	61	0	t	2026-08-09 17:23:23.495541	2026-07-31 02:23:23.629684	1
2186	274	15	REST API 설계 연습	WEEKLY	100	16	16	1	t	2026-08-09 17:23:23.496238	2026-07-31 02:23:23.629684	2
2187	274	15	JPA 쿼리 튜닝해 보기	WEEKLY	100	8	8	2	t	2026-08-09 17:23:23.496935	2026-07-31 02:23:23.629684	1
2188	274	15	테스트 코드 작성	DAILY	100	61	61	3	t	2026-08-09 17:23:23.497596	2026-07-31 02:23:23.629684	1
2189	274	15	예외 처리 규칙 정리	WEEKLY	100	8	8	4	t	2026-08-09 17:23:23.498198	2026-07-31 02:23:23.629684	1
2190	274	15	트랜잭션 실습	WEEKLY	100	8	8	5	t	2026-08-09 17:23:23.498875	2026-07-31 02:23:23.629684	1
2191	274	15	인증·인가 구현해 보기	WEEKLY	100	8	8	6	t	2026-08-09 17:23:23.499504	2026-07-31 02:23:23.629684	1
2192	274	15	API 응답 시간 측정	WEEKLY	100	8	8	7	t	2026-08-09 17:23:23.500157	2026-07-31 02:23:23.629684	1
2193	275	15	React 훅 실습	DAILY	100	61	61	0	t	2026-08-09 17:23:23.501361	2026-07-31 02:23:23.629684	1
2194	275	15	타입스크립트 타입 연습	DAILY	100	61	61	1	t	2026-08-09 17:23:23.502053	2026-07-31 02:23:23.629684	1
2195	275	15	접근성 점검	WEEKLY	100	8	8	2	t	2026-08-09 17:23:23.502802	2026-07-31 02:23:23.629684	1
2196	275	15	렌더 최적화 실험	WEEKLY	100	8	8	3	t	2026-08-09 17:23:23.503461	2026-07-31 02:23:23.629684	1
2197	275	15	상태 관리 리팩터링	WEEKLY	100	8	8	4	t	2026-08-09 17:23:23.504158	2026-07-31 02:23:23.629684	1
2198	275	15	반응형 레이아웃 만들기	WEEKLY	100	8	8	5	t	2026-08-09 17:23:23.50482	2026-07-31 02:23:23.629684	1
2199	275	15	애니메이션 다듬기	WEEKLY	100	8	8	6	t	2026-08-09 17:23:23.505452	2026-07-31 02:23:23.629684	1
2200	275	15	컴포넌트 문서화	WEEKLY	100	8	8	7	t	2026-08-09 17:23:23.50613	2026-07-31 02:23:23.629684	1
2201	276	15	배포 로그 확인	DAILY	100	61	61	0	t	2026-08-09 17:23:23.507412	2026-07-31 02:23:23.629684	1
2202	276	15	Docker 이미지 만들기	WEEKLY	100	8	8	1	t	2026-08-09 17:23:23.508173	2026-07-31 02:23:23.629684	1
2203	276	15	CI 파이프라인 손보기	WEEKLY	100	8	8	2	t	2026-08-09 17:23:23.509127	2026-07-31 02:23:23.629684	1
2204	276	15	nginx 설정 이해하기	WEEKLY	100	8	8	3	t	2026-08-09 17:23:23.509895	2026-07-31 02:23:23.629684	1
2205	276	15	모니터링 지표 보기	WEEKLY	100	16	16	4	t	2026-08-09 17:23:23.510574	2026-07-31 02:23:23.629684	2
2206	276	15	백업 스크립트 점검	MONTHLY	100	2	2	5	t	2026-08-09 17:23:23.511373	2026-07-31 02:23:23.629684	1
2207	276	15	보안 그룹 정리	MONTHLY	100	2	2	6	t	2026-08-09 17:23:23.512065	2026-07-31 02:23:23.629684	1
2208	276	15	장애 대응 훈련	MONTHLY	100	2	2	7	t	2026-08-09 17:23:23.512923	2026-07-31 02:23:23.629684	1
2209	277	15	면접 질문 답변 정리	DAILY	100	61	61	0	t	2026-08-09 17:23:23.514421	2026-07-31 02:23:23.629684	1
2210	277	15	네트워크 한 챕터	WEEKLY	100	16	16	1	t	2026-08-09 17:23:23.515216	2026-07-31 02:23:23.629684	2
2211	277	15	운영체제 한 챕터	WEEKLY	100	16	16	2	t	2026-08-09 17:23:23.515934	2026-07-31 02:23:23.629684	2
2212	277	15	자료구조 직접 구현	WEEKLY	100	8	8	3	t	2026-08-09 17:23:23.516668	2026-07-31 02:23:23.629684	1
2213	277	15	정규화 연습	WEEKLY	100	8	8	4	t	2026-08-09 17:23:23.517379	2026-07-31 02:23:23.629684	1
2214	277	15	디자인 패턴 하나 정리	WEEKLY	100	8	8	5	t	2026-08-09 17:23:23.518157	2026-07-31 02:23:23.629684	1
2215	277	15	동시성 개념 정리	WEEKLY	100	8	8	6	t	2026-08-09 17:23:23.518914	2026-07-31 02:23:23.629684	1
2216	277	15	컴파일 과정 정리	MONTHLY	100	2	2	7	t	2026-08-09 17:23:23.519687	2026-07-31 02:23:23.629684	1
2217	278	15	커밋 메시지 다듬기	DAILY	100	61	61	0	t	2026-08-09 17:23:23.521031	2026-07-31 02:23:23.629684	1
2218	278	15	PR 리뷰 남기기	DAILY	100	61	61	1	t	2026-08-09 17:23:23.521743	2026-07-31 02:23:23.629684	1
2219	278	15	데일리 스크럼 참여	DAILY	100	61	61	2	t	2026-08-09 17:23:23.522497	2026-07-31 02:23:23.629684	1
2220	278	15	회고 작성	WEEKLY	100	8	8	3	t	2026-08-09 17:23:23.523173	2026-07-31 02:23:23.629684	1
2221	278	15	이슈 정리	WEEKLY	100	16	16	4	t	2026-08-09 17:23:23.523859	2026-07-31 02:23:23.629684	2
2222	278	15	문서 최신화	WEEKLY	100	8	8	5	t	2026-08-09 17:23:23.524523	2026-07-31 02:23:23.629684	1
2223	278	15	페어 프로그래밍	WEEKLY	100	8	8	6	t	2026-08-09 17:23:23.525183	2026-07-31 02:23:23.629684	1
2224	278	15	팀 규칙 점검	MONTHLY	100	2	2	7	t	2026-08-09 17:23:23.525875	2026-07-31 02:23:23.629684	1
2225	279	15	학습 노트 작성	DAILY	100	61	61	0	t	2026-08-09 17:23:23.527109	2026-07-31 02:23:23.629684	1
2226	279	15	읽은 문서 링크 정리	DAILY	100	61	61	1	t	2026-08-09 17:23:23.527805	2026-07-31 02:23:23.629684	1
2227	279	15	블로그 글 초안 쓰기	WEEKLY	100	8	8	2	t	2026-08-09 17:23:23.528458	2026-07-31 02:23:23.629684	1
2228	279	15	트러블슈팅 기록	WEEKLY	100	16	16	3	t	2026-08-09 17:23:23.529335	2026-07-31 02:23:23.629684	2
2229	279	15	코드 스니펫 정리	WEEKLY	100	8	8	4	t	2026-08-09 17:23:23.530029	2026-07-31 02:23:23.629684	1
2230	279	15	주간 회고 쓰기	WEEKLY	100	8	8	5	t	2026-08-09 17:23:23.532145	2026-07-31 02:23:23.629684	1
2231	279	15	블로그 발행	MONTHLY	100	4	4	6	t	2026-08-09 17:23:23.532907	2026-07-31 02:23:23.629684	2
2232	279	15	목표 점검	MONTHLY	100	2	2	7	t	2026-08-09 17:23:23.533615	2026-07-31 02:23:23.629684	1
2233	280	15	아침 스트레칭	DAILY	100	61	61	0	t	2026-08-09 17:23:23.534989	2026-07-31 02:23:23.629684	1
2234	280	15	산책 30분	DAILY	100	61	61	1	t	2026-08-09 17:23:23.535715	2026-07-31 02:23:23.629684	1
2235	280	15	물 2리터 마시기	DAILY	100	61	61	2	t	2026-08-09 17:23:23.53646	2026-07-31 02:23:23.629684	1
2236	280	15	12시 전에 자기	DAILY	100	61	61	3	t	2026-08-09 17:23:23.537204	2026-07-31 02:23:23.629684	1
2237	280	15	눈 운동	DAILY	100	61	61	4	t	2026-08-09 17:23:23.53788	2026-07-31 02:23:23.629684	3
2238	280	15	식단 기록	DAILY	100	61	61	5	t	2026-08-09 17:23:23.53854	2026-07-31 02:23:23.629684	1
2239	280	15	주말 운동	WEEKLY	100	16	16	6	t	2026-08-09 17:23:23.539179	2026-07-31 02:23:23.629684	2
2240	280	15	건강검진 예약	NONE	100	1	1	7	t	2026-08-09 17:23:23.539813	2026-07-31 02:23:23.629684	1
2241	281	15	아침 스트레칭	DAILY	100	91	91	0	t	2026-08-09 17:23:23.638629	2026-07-31 02:23:23.756429	1
2242	281	15	계단 이용하기	DAILY	100	91	91	1	t	2026-08-09 17:23:23.639313	2026-07-31 02:23:23.756429	1
2243	281	15	홈트 20분	DAILY	100	91	91	2	t	2026-08-09 17:23:23.63998	2026-07-31 02:23:23.756429	1
2244	281	15	만보 걷기	DAILY	100	91	91	3	t	2026-08-09 17:23:23.640602	2026-07-31 02:23:23.756429	1
2245	281	15	자세 교정 운동	DAILY	100	91	91	4	t	2026-08-09 17:23:23.641322	2026-07-31 02:23:23.756429	1
2246	281	15	러닝 다녀오기	WEEKLY	100	26	26	5	t	2026-08-09 17:23:23.642039	2026-07-31 02:23:23.756429	2
2247	281	15	체중 기록	WEEKLY	100	39	39	6	t	2026-08-09 17:23:23.642691	2026-07-31 02:23:23.756429	3
2248	281	15	주말 등산	MONTHLY	100	3	3	7	t	2026-08-09 17:23:23.643327	2026-07-31 02:23:23.756429	1
2256	282	15	배달 한 번만	WEEKLY	100	13	0	7	f	2026-08-09 17:23:23.649146	2026-07-31 02:23:23.756429	1
2249	282	15	아침 먹기	DAILY	100	91	91	0	t	2026-08-09 17:23:23.644512	2026-07-31 02:23:23.756429	1
2250	282	15	야식 참기	DAILY	100	91	91	1	t	2026-08-09 17:23:23.645205	2026-07-31 02:23:23.756429	1
2251	282	15	채소 한 접시	DAILY	100	91	91	2	t	2026-08-09 17:23:23.645899	2026-07-31 02:23:23.756429	1
2252	282	15	물 2리터 마시기	DAILY	100	91	91	3	t	2026-08-09 17:23:23.646573	2026-07-31 02:23:23.756429	1
2253	282	15	커피 두 잔 이하	DAILY	100	91	91	4	t	2026-08-09 17:23:23.647209	2026-07-31 02:23:23.756429	1
2254	282	15	영양제 챙겨 먹기	DAILY	100	91	91	5	t	2026-08-09 17:23:23.647904	2026-07-31 02:23:23.756429	1
2255	282	15	직접 요리하기	WEEKLY	100	26	26	6	t	2026-08-09 17:23:23.648518	2026-07-31 02:23:23.756429	2
2263	283	15	낮잠 20분 이내	DAILY	100	91	0	6	f	2026-08-09 17:23:23.654137	2026-07-31 02:23:23.756429	1
2264	283	15	침구 정리	WEEKLY	100	26	0	7	f	2026-08-09 17:23:23.654764	2026-07-31 02:23:23.756429	2
2257	283	15	12시 전에 자기	DAILY	100	91	91	0	t	2026-08-09 17:23:23.650303	2026-07-31 02:23:23.756429	1
2258	283	15	일곱 시간 자기	DAILY	100	91	91	1	t	2026-08-09 17:23:23.650951	2026-07-31 02:23:23.756429	1
2259	283	15	기상 시간 고정	DAILY	100	91	91	2	t	2026-08-09 17:23:23.651549	2026-07-31 02:23:23.756429	1
2260	283	15	자기 전 휴대폰 끄기	DAILY	100	91	91	3	t	2026-08-09 17:23:23.652177	2026-07-31 02:23:23.756429	1
2261	283	15	오후에 카페인 안 먹기	DAILY	100	91	91	4	t	2026-08-09 17:23:23.652863	2026-07-31 02:23:23.756429	1
2262	283	15	수면 기록	DAILY	100	91	91	5	t	2026-08-09 17:23:23.653488	2026-07-31 02:23:23.756429	1
2270	284	15	서점 가기	MONTHLY	100	3	0	5	f	2026-08-09 17:23:23.659995	2026-07-31 02:23:23.756429	1
2271	284	15	서평 쓰기	MONTHLY	100	3	0	6	f	2026-08-09 17:23:23.66066	2026-07-31 02:23:23.756429	1
2272	284	15	읽을 책 목록 만들기	MONTHLY	100	3	0	7	f	2026-08-09 17:23:23.661309	2026-07-31 02:23:23.756429	1
2265	284	15	스무 쪽 읽기	DAILY	100	91	91	0	t	2026-08-09 17:23:23.656086	2026-07-31 02:23:23.756429	1
2266	284	15	밑줄 옮겨 적기	WEEKLY	100	26	26	1	t	2026-08-09 17:23:23.656821	2026-07-31 02:23:23.756429	2
2267	284	15	독서 노트 쓰기	WEEKLY	100	13	13	2	t	2026-08-09 17:23:23.657488	2026-07-31 02:23:23.756429	1
2268	284	15	오디오북 듣기	WEEKLY	100	26	26	3	t	2026-08-09 17:23:23.658678	2026-07-31 02:23:23.756429	2
2269	284	15	한 달 한 권 끝내기	MONTHLY	100	3	3	4	t	2026-08-09 17:23:23.659344	2026-07-31 02:23:23.756429	1
2276	285	15	냉장고 정리	WEEKLY	100	13	0	3	f	2026-08-09 17:23:23.664595	2026-07-31 02:23:23.756429	1
2277	285	15	파일 백업	WEEKLY	100	13	0	4	f	2026-08-09 17:23:23.667569	2026-07-31 02:23:23.756429	1
2278	285	15	지갑 정리	WEEKLY	100	13	0	5	f	2026-08-09 17:23:23.668276	2026-07-31 02:23:23.756429	1
2279	285	15	안 쓰는 물건 비우기	MONTHLY	100	3	0	6	f	2026-08-09 17:23:23.669	2026-07-31 02:23:23.756429	1
2280	285	15	사진 정리	MONTHLY	100	3	0	7	f	2026-08-09 17:23:23.669636	2026-07-31 02:23:23.756429	1
2273	285	15	책상 정리	DAILY	100	91	91	0	t	2026-08-09 17:23:23.662461	2026-07-31 02:23:23.756429	1
2274	285	15	설거지 바로 하기	DAILY	100	91	91	1	t	2026-08-09 17:23:23.663098	2026-07-31 02:23:23.756429	1
2275	285	15	빨래 개기	WEEKLY	100	26	26	2	t	2026-08-09 17:23:23.663858	2026-07-31 02:23:23.756429	2
2283	286	15	커피값 줄이기	WEEKLY	100	39	0	2	f	2026-08-09 17:23:23.672358	2026-07-31 02:23:23.756429	3
2284	286	15	투자 공부	WEEKLY	100	26	0	3	f	2026-08-09 17:23:23.672981	2026-07-31 02:23:23.756429	2
2285	286	15	고정비 점검	MONTHLY	100	3	0	4	f	2026-08-09 17:23:23.673685	2026-07-31 02:23:23.756429	1
2286	286	15	적금 넣기	MONTHLY	100	3	0	5	f	2026-08-09 17:23:23.674368	2026-07-31 02:23:23.756429	1
2287	286	15	구독 서비스 점검	MONTHLY	100	3	0	6	f	2026-08-09 17:23:23.675073	2026-07-31 02:23:23.756429	1
2288	286	15	다음 달 예산 세우기	MONTHLY	100	3	0	7	f	2026-08-09 17:23:23.675711	2026-07-31 02:23:23.756429	1
2281	286	15	가계부 쓰기	DAILY	100	91	91	0	t	2026-08-09 17:23:23.671009	2026-07-31 02:23:23.756429	1
2282	286	15	무지출 하루	WEEKLY	100	13	13	1	t	2026-08-09 17:23:23.671722	2026-07-31 02:23:23.756429	1
2290	287	15	안부 메시지 보내기	WEEKLY	100	39	0	1	f	2026-08-09 17:23:23.677399	2026-07-31 02:23:23.756429	3
2291	287	15	가족에게 연락	WEEKLY	100	26	0	2	f	2026-08-09 17:23:23.678013	2026-07-31 02:23:23.756429	2
2292	287	15	같이 운동하기	WEEKLY	100	13	0	3	f	2026-08-09 17:23:23.678605	2026-07-31 02:23:23.756429	1
2293	287	15	묵힌 답장 보내기	WEEKLY	100	13	0	4	f	2026-08-09 17:23:23.679212	2026-07-31 02:23:23.756429	1
2294	287	15	친구 만나기	MONTHLY	100	6	0	5	f	2026-08-09 17:23:23.679816	2026-07-31 02:23:23.756429	2
2295	287	15	생일 챙기기	MONTHLY	100	3	0	6	f	2026-08-09 17:23:23.680415	2026-07-31 02:23:23.756429	1
2296	287	15	편지 쓰기	MONTHLY	100	3	0	7	f	2026-08-09 17:23:23.681165	2026-07-31 02:23:23.756429	1
2289	287	15	고맙다고 말하기	DAILY	100	91	91	0	t	2026-08-09 17:23:23.676823	2026-07-31 02:23:23.756429	1
2297	288	15	그림 10분	DAILY	100	91	0	0	f	2026-08-09 17:23:23.682452	2026-07-31 02:23:23.756429	1
2298	288	15	악기 연습	DAILY	100	91	0	1	f	2026-08-09 17:23:23.683148	2026-07-31 02:23:23.756429	1
2299	288	15	사진 찍기	WEEKLY	100	26	0	2	f	2026-08-09 17:23:23.684357	2026-07-31 02:23:23.756429	2
2300	288	15	영화 한 편	WEEKLY	100	13	0	3	f	2026-08-09 17:23:23.685065	2026-07-31 02:23:23.756429	1
2301	288	15	새 요리 도전	WEEKLY	100	13	0	4	f	2026-08-09 17:23:23.685645	2026-07-31 02:23:23.756429	1
2302	288	15	산책 코스 개발	WEEKLY	100	13	0	5	f	2026-08-09 17:23:23.686241	2026-07-31 02:23:23.756429	1
2303	288	15	전시 보기	MONTHLY	100	3	0	6	f	2026-08-09 17:23:23.686908	2026-07-31 02:23:23.756429	1
2304	288	15	플레이리스트 만들기	MONTHLY	100	3	0	7	f	2026-08-09 17:23:23.687614	2026-07-31 02:23:23.756429	1
\.


--
-- Data for Name: subject_log; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.subject_log (id, user_id, subject_id, earned_point, created_at) FROM stdin;
1447	6	322	0	2026-08-07 16:57:09.760294
66	3	66	100	2026-08-04 03:54:42.626745
67	3	26	100	2026-08-04 03:54:45.174486
68	3	71	100	2026-08-04 03:54:45.714484
69	3	125	100	2026-08-04 03:54:53.174901
70	3	80	100	2026-08-04 03:55:06.720957
71	3	127	100	2026-08-04 03:59:48.633957
72	3	126	100	2026-08-04 03:59:53.821198
142	6	332	10	2026-08-04 04:04:10.939861
148	6	346	10	2026-08-04 04:04:13.261688
149	6	349	10	2026-08-04 04:04:13.539928
156	6	358	10	2026-08-04 04:04:15.385102
158	6	360	10	2026-08-04 04:04:16.099049
166	6	375	10	2026-08-04 04:04:18.687313
168	6	377	10	2026-08-04 04:04:19.576336
1448	6	324	0	2026-08-07 16:57:10.389627
138	6	323	10	2026-08-04 04:04:09.987422
143	6	333	10	2026-08-04 04:04:11.258276
145	6	336	10	2026-08-04 04:04:11.598278
147	6	342	10	2026-08-04 04:04:12.384662
153	6	355	10	2026-08-04 04:04:14.485205
155	6	357	10	2026-08-04 04:04:15.116603
157	6	359	10	2026-08-04 04:04:15.664943
162	6	371	10	2026-08-04 04:04:17.379365
163	6	372	10	2026-08-04 04:04:17.784431
167	6	376	10	2026-08-04 04:04:18.945895
172	6	381	10	2026-08-04 04:04:21.286008
173	6	382	10	2026-08-04 04:04:21.750188
1449	6	337	0	2026-08-07 16:57:15.04906
144	6	335	10	2026-08-04 04:04:11.437892
151	6	353	10	2026-08-04 04:04:13.900509
164	6	373	10	2026-08-04 04:04:18.153753
174	6	383	0	2026-08-04 04:04:22.272706
1450	6	339	0	2026-08-07 16:57:15.648389
1452	6	343	0	2026-08-07 16:57:16.743391
137	6	321	10	2026-08-04 04:04:09.357171
139	6	325	10	2026-08-04 04:04:10.21555
140	6	329	10	2026-08-04 04:04:10.586587
146	6	341	10	2026-08-04 04:04:12.103167
150	6	352	10	2026-08-04 04:04:13.759051
159	6	363	10	2026-08-04 04:04:16.366958
160	6	369	10	2026-08-04 04:04:16.556833
169	6	378	10	2026-08-04 04:04:20.228362
170	6	379	10	2026-08-04 04:04:20.467211
1133	8	1377	10	2026-08-07 12:14:28.198883
1451	6	340	0	2026-08-07 16:57:16.126242
152	6	354	10	2026-08-04 04:04:14.228603
165	6	374	10	2026-08-04 04:04:18.426149
175	6	384	0	2026-08-04 04:04:22.850101
1134	8	1378	10	2026-08-07 12:14:31.057512
1182	8	1347	10	2026-08-07 12:17:24.068393
1183	8	1348	10	2026-08-07 12:17:24.846269
141	6	330	10	2026-08-04 04:04:10.752077
154	6	356	10	2026-08-04 04:04:14.677445
161	6	370	10	2026-08-04 04:04:16.740246
171	6	380	10	2026-08-04 04:04:20.828482
239	6	322	0	2026-08-04 04:53:15.871574
240	3	39	100	2026-08-04 04:56:36.914163
1135	8	1379	10	2026-08-07 12:14:32.836544
2982	3	66	100	2026-08-10 08:59:24.640728
1136	8	1380	10	2026-08-07 12:14:33.530391
1137	8	1345	10	2026-08-07 12:14:36.892028
1184	8	1349	10	2026-08-07 12:17:27.353463
1138	8	1346	10	2026-08-07 12:14:37.739921
1185	8	1350	10	2026-08-07 12:17:27.802314
1188	8	1353	10	2026-08-07 12:17:34.275242
1186	8	1351	10	2026-08-07 12:17:28.72785
3001	3	1	100	2026-08-10 09:33:47.136124
3003	3	3	100	2026-08-10 09:33:50.113016
3006	3	7	100	2026-08-10 09:33:53.100394
3007	3	8	100	2026-08-10 09:33:53.513162
3011	3	13	0	2026-08-10 09:34:00.392917
3012	3	14	0	2026-08-10 09:34:00.788441
3019	3	21	0	2026-08-10 09:34:11.725193
3021	3	23	0	2026-08-10 09:34:13.130029
3023	3	584	0	2026-08-10 09:34:30.135277
361	3	593	10	2026-08-04 05:29:14.047521
362	3	594	10	2026-08-04 05:29:14.480969
363	3	595	10	2026-08-04 05:29:14.792616
364	3	596	10	2026-08-04 05:29:15.475941
365	3	597	10	2026-08-04 05:29:16.115076
366	3	577	10	2026-08-04 05:29:20.90782
367	3	578	10	2026-08-04 05:29:24.185508
368	3	579	10	2026-08-04 05:29:25.172185
369	3	611	10	2026-08-04 05:29:26.943669
370	3	612	10	2026-08-04 05:29:28.239686
371	3	613	10	2026-08-04 05:29:29.175132
372	3	636	10	2026-08-04 05:29:33.544401
373	3	601	10	2026-08-04 05:30:12.106482
374	3	602	10	2026-08-04 05:30:13.811514
375	6	326	0	2026-08-04 05:30:17.115527
384	3	65	0	2026-08-04 05:38:01.213641
385	3	67	0	2026-08-04 05:38:05.596378
386	3	68	0	2026-08-04 05:38:06.399598
387	3	117	0	2026-08-04 05:38:10.240496
388	3	116	0	2026-08-04 05:38:11.039614
389	3	118	0	2026-08-04 05:38:12.671088
390	3	119	0	2026-08-04 05:38:13.462208
391	3	115	0	2026-08-04 05:38:17.341694
392	3	114	0	2026-08-04 05:38:18.778744
393	3	113	0	2026-08-04 05:38:20.928678
394	3	120	0	2026-08-04 05:38:26.740633
1187	8	1352	10	2026-08-07 12:17:30.804242
398	3	100	0	2026-08-04 06:37:14.039576
399	3	102	0	2026-08-04 06:37:24.363388
400	5	769	10	2026-08-04 11:24:16.349295
401	5	770	10	2026-08-04 11:24:21.358338
1189	8	1361	10	2026-08-07 12:26:28.756284
1194	8	1366	10	2026-08-07 12:26:32.666578
1195	8	1367	10	2026-08-07 12:26:33.279025
3002	3	2	100	2026-08-10 09:33:49.23549
3004	3	5	100	2026-08-10 09:33:51.743587
3010	3	12	0	2026-08-10 09:33:59.683022
3016	3	18	0	2026-08-10 09:34:09.408889
3022	3	24	0	2026-08-10 09:34:13.549321
3024	3	631	0	2026-08-10 09:34:30.520112
1190	8	1362	10	2026-08-07 12:26:29.483527
1192	8	1364	10	2026-08-07 12:26:31.389485
3005	3	6	100	2026-08-10 09:33:52.698765
3013	3	15	0	2026-08-10 09:34:01.267821
3018	3	20	0	2026-08-10 09:34:10.828538
1191	8	1363	10	2026-08-07 12:26:30.331011
1193	8	1365	10	2026-08-07 12:26:32.16741
1196	8	1368	10	2026-08-07 12:26:35.333801
3008	3	9	100	2026-08-10 09:33:58.160634
3009	3	11	100	2026-08-10 09:33:58.600367
3014	3	16	0	2026-08-10 09:34:01.751266
3015	3	17	0	2026-08-10 09:34:08.857671
3017	3	19	0	2026-08-10 09:34:09.865146
3020	3	22	0	2026-08-10 09:34:12.101301
1197	3	10	100	2026-08-07 12:34:56.270867
1198	3	51	100	2026-08-07 12:35:20.772577
1199	3	50	100	2026-08-07 12:35:27.035407
3034	8	1356	10	2026-08-10 10:53:27.323625
3039	8	1371	10	2026-08-10 10:53:35.649435
3044	8	1382	10	2026-08-10 10:53:37.127392
592	3	581	10	2026-08-05 01:05:40.107048
593	3	580	10	2026-08-05 01:05:40.582024
594	3	106	100	2026-08-05 01:05:41.118565
595	3	582	10	2026-08-05 01:05:41.671698
596	3	583	10	2026-08-05 01:05:42.185614
597	3	585	10	2026-08-05 01:05:42.717327
598	3	586	10	2026-08-05 01:05:43.269441
599	3	587	10	2026-08-05 01:05:43.725639
600	3	588	10	2026-08-05 01:05:44.21987
601	3	589	10	2026-08-05 01:05:44.801975
602	3	590	10	2026-08-05 01:05:45.426831
603	3	591	10	2026-08-05 01:05:46.09013
604	3	592	10	2026-08-05 01:05:51.277117
605	3	598	10	2026-08-05 01:05:51.902954
606	3	599	10	2026-08-05 01:05:52.333805
607	3	600	10	2026-08-05 01:05:52.863235
608	3	603	10	2026-08-05 01:05:53.735367
609	3	604	10	2026-08-05 01:05:54.230599
610	3	605	10	2026-08-05 01:05:55.402266
611	3	124	100	2026-08-05 01:06:01.553311
612	3	1	100	2026-08-05 01:06:02.029964
613	3	33	100	2026-08-05 01:06:02.504453
614	3	41	100	2026-08-05 01:06:02.983877
615	3	44	100	2026-08-05 01:06:03.832437
616	3	68	100	2026-08-05 01:06:04.362973
617	3	105	100	2026-08-05 01:06:04.870132
618	3	25	20	2026-08-05 01:06:05.387818
619	3	55	0	2026-08-05 01:06:05.874131
620	3	89	0	2026-08-05 01:06:06.456872
621	3	103	0	2026-08-05 01:06:08.067102
622	3	79	0	2026-08-05 01:06:08.864471
623	3	17	0	2026-08-05 01:06:10.150364
624	3	111	0	2026-08-05 01:06:12.867479
625	3	4	0	2026-08-05 01:06:15.870822
626	3	119	0	2026-08-05 01:06:17.836512
627	3	608	0	2026-08-05 01:06:34.590894
628	3	634	0	2026-08-05 01:06:44.793723
629	3	635	0	2026-08-05 01:07:10.292425
641	6	322	10	2026-08-05 01:40:20.955116
642	6	321	10	2026-08-05 01:40:21.639559
643	6	323	10	2026-08-05 01:40:27.172981
644	6	324	10	2026-08-05 01:40:28.520301
645	6	325	10	2026-08-05 01:40:30.218812
646	6	327	10	2026-08-05 01:40:42.138653
647	6	328	10	2026-08-05 01:40:42.883856
3035	8	1358	10	2026-08-10 10:53:27.889433
3040	8	1373	10	2026-08-10 10:53:36.211706
3045	8	1384	10	2026-08-10 10:53:37.494082
3036	8	1357	10	2026-08-10 10:53:28.525899
3041	8	1375	10	2026-08-10 10:53:36.445968
3037	8	1360	10	2026-08-10 10:53:35.064734
3038	8	1370	10	2026-08-10 10:53:35.499257
3042	8	1376	10	2026-08-10 10:53:36.602852
3043	8	1381	10	2026-08-10 10:53:36.77612
3046	8	1385	10	2026-08-10 10:53:37.718489
720	3	70	0	2026-08-05 03:39:32.873335
721	3	69	0	2026-08-05 03:39:33.986912
1312	8	1354	10	2026-08-07 13:04:06.542552
1317	8	1383	10	2026-08-07 13:04:09.812032
1313	8	1359	10	2026-08-07 13:04:06.999621
1314	8	1369	10	2026-08-07 13:04:07.754413
843	3	606	10	2026-08-06 05:25:33.939099
844	3	607	10	2026-08-06 05:25:34.176862
845	3	609	10	2026-08-06 05:25:34.532042
846	3	610	10	2026-08-06 05:25:35.007357
847	3	611	10	2026-08-06 05:27:29.004072
848	3	612	10	2026-08-06 05:27:29.588706
849	3	614	10	2026-08-06 05:27:31.279194
850	3	613	10	2026-08-06 05:27:31.587181
851	3	615	10	2026-08-06 05:27:32.059269
852	3	616	10	2026-08-06 05:27:32.99176
853	8	1401	10	2026-08-06 05:45:57.330721
854	8	1402	10	2026-08-06 05:45:58.756754
855	8	1403	10	2026-08-06 05:45:59.490117
856	8	1404	10	2026-08-06 05:46:00.571292
857	8	1405	10	2026-08-06 05:46:01.643017
858	8	1406	10	2026-08-06 05:46:01.996667
859	8	1408	10	2026-08-06 05:46:03.15044
860	8	1407	10	2026-08-06 05:46:03.592312
861	8	1345	10	2026-08-06 05:49:19.251702
862	8	1346	10	2026-08-06 05:49:19.881684
863	8	1347	10	2026-08-06 05:49:22.004379
864	3	68	100	2026-08-06 06:00:39.829445
865	3	85	100	2026-08-06 06:01:33.909477
1315	8	1372	10	2026-08-07 13:04:08.444428
1316	8	1374	10	2026-08-07 13:04:09.159435
1318	3	68	100	2026-08-07 13:15:38.237544
1319	3	579	10	2026-08-07 13:15:49.936897
1321	3	619	10	2026-08-07 13:43:22.802801
1327	3	623	10	2026-08-07 13:44:11.072417
1328	3	624	10	2026-08-07 13:44:11.699028
1331	3	627	10	2026-08-07 13:44:13.094319
1332	3	628	10	2026-08-07 13:44:13.357464
1337	3	637	10	2026-08-07 13:44:14.761169
951	3	61	100	2026-08-06 08:30:33.904815
952	3	62	100	2026-08-06 08:30:34.473418
953	3	64	100	2026-08-06 08:30:36.813367
954	3	63	100	2026-08-06 08:30:37.719045
1322	3	618	10	2026-08-07 13:43:35.722703
1326	3	617	10	2026-08-07 13:43:55.547273
1334	3	630	10	2026-08-07 13:44:13.903953
1335	3	632	10	2026-08-07 13:44:14.243454
1340	3	640	10	2026-08-07 13:44:26.076135
1323	3	620	10	2026-08-07 13:43:40.704901
1325	3	621	10	2026-08-07 13:43:51.34276
1329	3	625	10	2026-08-07 13:44:12.509054
1336	3	633	10	2026-08-07 13:44:14.518254
1339	3	639	10	2026-08-07 13:44:15.379402
1324	3	622	10	2026-08-07 13:43:44.425876
1330	3	626	10	2026-08-07 13:44:12.836613
1333	3	629	10	2026-08-07 13:44:13.609218
1338	3	638	10	2026-08-07 13:44:15.100379
1350	6	331	10	2026-08-07 16:55:57.692522
1351	6	334	10	2026-08-07 16:55:58.099179
1353	6	344	10	2026-08-07 16:55:58.70733
1393	6	330	10	2026-08-07 16:56:09.03929
1394	6	332	10	2026-08-07 16:56:09.396724
1401	6	349	10	2026-08-07 16:56:10.952033
1412	6	369	10	2026-08-07 16:56:14.766733
1414	6	371	10	2026-08-07 16:56:15.238217
1423	6	380	10	2026-08-07 16:56:17.888067
1425	6	382	10	2026-08-07 16:56:18.226974
1426	6	383	10	2026-08-07 16:56:18.412396
1444	6	321	0	2026-08-07 16:56:29.073144
1445	6	323	0	2026-08-07 16:56:29.636867
1446	6	325	0	2026-08-07 16:56:29.998049
1352	6	338	10	2026-08-07 16:55:58.400481
1354	6	350	10	2026-08-07 16:55:59.042866
1355	6	351	10	2026-08-07 16:55:59.397043
1392	6	329	10	2026-08-07 16:56:08.863288
1395	6	333	10	2026-08-07 16:56:09.565476
1396	6	335	10	2026-08-07 16:56:09.775192
1397	6	336	10	2026-08-07 16:56:10.117464
1398	6	341	10	2026-08-07 16:56:10.34606
1399	6	342	10	2026-08-07 16:56:10.560178
1400	6	346	10	2026-08-07 16:56:10.747026
1402	6	352	10	2026-08-07 16:56:11.342293
1403	6	353	10	2026-08-07 16:56:11.52095
1404	6	354	10	2026-08-07 16:56:11.715497
1405	6	355	10	2026-08-07 16:56:11.912634
1406	6	356	10	2026-08-07 16:56:12.110764
1407	6	357	10	2026-08-07 16:56:12.484803
1408	6	358	10	2026-08-07 16:56:12.67851
1409	6	359	10	2026-08-07 16:56:12.869003
1410	6	360	10	2026-08-07 16:56:13.196064
1411	6	363	10	2026-08-07 16:56:13.357498
1413	6	370	10	2026-08-07 16:56:14.9135
1415	6	372	10	2026-08-07 16:56:15.416452
1416	6	373	10	2026-08-07 16:56:15.713884
1417	6	374	10	2026-08-07 16:56:15.870629
1418	6	375	10	2026-08-07 16:56:16.427261
1419	6	376	10	2026-08-07 16:56:16.60865
1420	6	377	10	2026-08-07 16:56:16.793875
1421	6	378	10	2026-08-07 16:56:17.37431
1422	6	379	10	2026-08-07 16:56:17.668388
1424	6	381	10	2026-08-07 16:56:18.046441
1427	6	384	10	2026-08-07 16:56:18.74226
\.


--
-- Data for Name: user_building; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_building (id, user_id, building_item_id, created_at, updated_at) FROM stdin;
1	2	1	2026-08-03 01:23:54.931416	2026-08-03 01:23:54.931416
2	2	2	2026-08-03 01:23:54.935355	2026-08-03 01:23:54.935355
3	2	3	2026-08-03 01:23:54.936318	2026-08-03 01:23:54.936318
4	2	4	2026-08-03 01:23:54.937241	2026-08-03 01:23:54.937241
5	2	5	2026-08-03 01:23:54.938136	2026-08-03 01:23:54.938136
6	2	6	2026-08-03 01:23:54.939133	2026-08-03 01:23:54.939133
7	2	7	2026-08-03 01:23:54.939955	2026-08-03 01:23:54.939955
8	2	8	2026-08-03 01:23:54.940635	2026-08-03 01:23:54.940635
9	2	9	2026-08-03 01:23:54.941285	2026-08-03 01:23:54.941285
10	2	10	2026-08-03 01:23:54.941951	2026-08-03 01:23:54.941951
11	2	11	2026-08-03 01:23:54.942626	2026-08-03 01:23:54.942626
12	2	12	2026-08-03 01:23:54.943293	2026-08-03 01:23:54.943293
13	2	13	2026-08-03 01:23:54.943989	2026-08-03 01:23:54.943989
14	2	14	2026-08-03 01:23:54.944768	2026-08-03 01:23:54.944768
15	2	15	2026-08-03 01:23:54.945555	2026-08-03 01:23:54.945555
16	2	262	2026-08-03 01:23:54.946264	2026-08-03 01:23:54.946264
17	3	257	2026-08-03 01:40:34.435081	2026-08-03 01:40:34.435081
18	3	258	2026-08-03 01:40:34.436528	2026-08-03 01:40:34.436528
19	3	259	2026-08-03 01:40:34.437514	2026-08-03 01:40:34.437514
20	3	260	2026-08-03 01:40:34.438297	2026-08-03 01:40:34.438297
21	3	261	2026-08-03 01:40:34.439187	2026-08-03 01:40:34.439187
22	3	262	2026-08-03 01:40:34.440152	2026-08-03 01:40:34.440152
23	3	263	2026-08-03 01:40:34.441008	2026-08-03 01:40:34.441008
24	3	264	2026-08-03 01:40:34.441628	2026-08-03 01:40:34.441628
25	3	265	2026-08-03 01:40:34.442335	2026-08-03 01:40:34.442335
26	3	266	2026-08-03 01:40:34.442981	2026-08-03 01:40:34.442981
27	3	267	2026-08-03 01:40:34.443539	2026-08-03 01:40:34.443539
28	3	268	2026-08-03 01:40:34.444117	2026-08-03 01:40:34.444117
29	3	269	2026-08-03 01:40:34.444642	2026-08-03 01:40:34.444642
30	1	1	2026-08-04 00:00:18.139802	2026-08-04 00:00:18.139802
31	1	2	2026-08-04 00:00:18.166628	2026-08-04 00:00:18.166628
32	1	3	2026-08-04 00:00:18.168571	2026-08-04 00:00:18.168571
33	1	4	2026-08-04 00:00:18.169958	2026-08-04 00:00:18.169958
34	1	5	2026-08-04 00:00:18.171093	2026-08-04 00:00:18.171093
35	1	6	2026-08-04 00:00:18.172923	2026-08-04 00:00:18.172923
36	1	7	2026-08-04 00:00:18.174017	2026-08-04 00:00:18.174017
37	1	8	2026-08-04 00:00:18.174999	2026-08-04 00:00:18.174999
38	1	9	2026-08-04 00:00:18.175905	2026-08-04 00:00:18.175905
39	1	10	2026-08-04 00:00:18.176712	2026-08-04 00:00:18.176712
40	1	11	2026-08-04 00:00:18.177544	2026-08-04 00:00:18.177544
41	1	12	2026-08-04 00:00:18.178386	2026-08-04 00:00:18.178386
42	1	13	2026-08-04 00:00:18.179259	2026-08-04 00:00:18.179259
43	1	14	2026-08-04 00:00:18.180072	2026-08-04 00:00:18.180072
44	1	15	2026-08-04 00:00:18.18089	2026-08-04 00:00:18.18089
45	1	262	2026-08-04 00:00:18.181671	2026-08-04 00:00:18.181671
46	3	1	2026-08-04 00:18:11.954338	2026-08-04 00:18:11.954338
47	3	2	2026-08-04 00:18:11.957276	2026-08-04 00:18:11.957276
48	3	3	2026-08-04 00:18:11.958888	2026-08-04 00:18:11.958888
49	3	4	2026-08-04 00:18:11.959931	2026-08-04 00:18:11.959931
50	3	5	2026-08-04 00:18:11.960892	2026-08-04 00:18:11.960892
51	3	6	2026-08-04 00:18:11.961913	2026-08-04 00:18:11.961913
52	3	7	2026-08-04 00:18:11.962834	2026-08-04 00:18:11.962834
53	3	8	2026-08-04 00:18:11.963591	2026-08-04 00:18:11.963591
54	3	9	2026-08-04 00:18:11.964399	2026-08-04 00:18:11.964399
55	3	10	2026-08-04 00:18:11.965171	2026-08-04 00:18:11.965171
56	3	11	2026-08-04 00:18:11.965953	2026-08-04 00:18:11.965953
57	3	12	2026-08-04 00:18:11.966696	2026-08-04 00:18:11.966696
58	3	13	2026-08-04 00:18:11.967463	2026-08-04 00:18:11.967463
59	3	14	2026-08-04 00:18:11.968244	2026-08-04 00:18:11.968244
60	3	15	2026-08-04 00:18:11.969008	2026-08-04 00:18:11.969008
61	6	1	2026-08-04 00:18:35.358469	2026-08-04 00:18:35.358469
62	6	2	2026-08-04 00:18:35.361333	2026-08-04 00:18:35.361333
63	6	3	2026-08-04 00:18:35.362405	2026-08-04 00:18:35.362405
64	6	4	2026-08-04 00:18:35.364894	2026-08-04 00:18:35.364894
65	6	5	2026-08-04 00:18:35.365857	2026-08-04 00:18:35.365857
66	6	6	2026-08-04 00:18:35.366827	2026-08-04 00:18:35.366827
67	6	7	2026-08-04 00:18:35.367823	2026-08-04 00:18:35.367823
68	6	8	2026-08-04 00:18:35.368587	2026-08-04 00:18:35.368587
69	6	9	2026-08-04 00:18:35.369384	2026-08-04 00:18:35.369384
70	6	10	2026-08-04 00:18:35.370194	2026-08-04 00:18:35.370194
71	6	11	2026-08-04 00:18:35.371004	2026-08-04 00:18:35.371004
72	6	12	2026-08-04 00:18:35.371742	2026-08-04 00:18:35.371742
73	6	13	2026-08-04 00:18:35.372469	2026-08-04 00:18:35.372469
74	6	14	2026-08-04 00:18:35.373247	2026-08-04 00:18:35.373247
75	6	15	2026-08-04 00:18:35.374087	2026-08-04 00:18:35.374087
76	6	262	2026-08-04 00:18:35.374856	2026-08-04 00:18:35.374856
77	4	1	2026-08-04 00:21:59.493946	2026-08-04 00:21:59.493946
78	4	2	2026-08-04 00:21:59.496295	2026-08-04 00:21:59.496295
79	4	3	2026-08-04 00:21:59.498924	2026-08-04 00:21:59.498924
80	4	4	2026-08-04 00:21:59.502481	2026-08-04 00:21:59.502481
81	4	5	2026-08-04 00:21:59.503362	2026-08-04 00:21:59.503362
82	4	6	2026-08-04 00:21:59.504082	2026-08-04 00:21:59.504082
83	4	7	2026-08-04 00:21:59.504846	2026-08-04 00:21:59.504846
84	4	8	2026-08-04 00:21:59.505546	2026-08-04 00:21:59.505546
85	4	9	2026-08-04 00:21:59.506341	2026-08-04 00:21:59.506341
86	4	10	2026-08-04 00:21:59.5071	2026-08-04 00:21:59.5071
87	4	11	2026-08-04 00:21:59.507867	2026-08-04 00:21:59.507867
88	4	12	2026-08-04 00:21:59.508646	2026-08-04 00:21:59.508646
89	4	13	2026-08-04 00:21:59.509362	2026-08-04 00:21:59.509362
90	4	14	2026-08-04 00:21:59.510104	2026-08-04 00:21:59.510104
91	4	15	2026-08-04 00:21:59.510816	2026-08-04 00:21:59.510816
92	4	262	2026-08-04 00:21:59.51158	2026-08-04 00:21:59.51158
93	5	1	2026-08-04 00:37:47.759207	2026-08-04 00:37:47.759207
94	5	2	2026-08-04 00:37:47.761722	2026-08-04 00:37:47.761722
95	5	3	2026-08-04 00:37:47.762503	2026-08-04 00:37:47.762503
96	5	4	2026-08-04 00:37:47.763311	2026-08-04 00:37:47.763311
97	5	5	2026-08-04 00:37:47.764125	2026-08-04 00:37:47.764125
98	5	6	2026-08-04 00:37:47.764896	2026-08-04 00:37:47.764896
99	5	7	2026-08-04 00:37:47.765637	2026-08-04 00:37:47.765637
100	5	8	2026-08-04 00:37:47.766311	2026-08-04 00:37:47.766311
101	5	9	2026-08-04 00:37:47.767002	2026-08-04 00:37:47.767002
102	5	10	2026-08-04 00:37:47.767733	2026-08-04 00:37:47.767733
103	5	11	2026-08-04 00:37:47.768468	2026-08-04 00:37:47.768468
104	5	12	2026-08-04 00:37:47.769179	2026-08-04 00:37:47.769179
105	5	13	2026-08-04 00:37:47.769898	2026-08-04 00:37:47.769898
106	5	14	2026-08-04 00:37:47.770549	2026-08-04 00:37:47.770549
107	5	15	2026-08-04 00:37:47.771237	2026-08-04 00:37:47.771237
108	5	262	2026-08-04 00:37:47.771925	2026-08-04 00:37:47.771925
109	7	1	2026-08-04 01:28:19.599754	2026-08-04 01:28:19.599754
110	7	2	2026-08-04 01:28:19.601417	2026-08-04 01:28:19.601417
111	7	3	2026-08-04 01:28:19.602261	2026-08-04 01:28:19.602261
112	7	4	2026-08-04 01:28:19.603134	2026-08-04 01:28:19.603134
113	7	5	2026-08-04 01:28:19.605032	2026-08-04 01:28:19.605032
114	7	6	2026-08-04 01:28:19.608258	2026-08-04 01:28:19.608258
115	7	7	2026-08-04 01:28:19.612029	2026-08-04 01:28:19.612029
116	7	8	2026-08-04 01:28:19.613041	2026-08-04 01:28:19.613041
117	7	9	2026-08-04 01:28:19.61554	2026-08-04 01:28:19.61554
118	7	10	2026-08-04 01:28:19.618657	2026-08-04 01:28:19.618657
119	7	11	2026-08-04 01:28:19.620587	2026-08-04 01:28:19.620587
120	7	12	2026-08-04 01:28:19.622607	2026-08-04 01:28:19.622607
121	7	13	2026-08-04 01:28:19.623434	2026-08-04 01:28:19.623434
122	7	14	2026-08-04 01:28:19.624356	2026-08-04 01:28:19.624356
123	7	15	2026-08-04 01:28:19.625011	2026-08-04 01:28:19.625011
124	7	262	2026-08-04 01:28:19.625628	2026-08-04 01:28:19.625628
125	8	1	2026-08-04 01:39:22.75616	2026-08-04 01:39:22.75616
126	8	2	2026-08-04 01:39:22.75996	2026-08-04 01:39:22.75996
127	8	3	2026-08-04 01:39:22.763624	2026-08-04 01:39:22.763624
128	8	4	2026-08-04 01:39:22.765497	2026-08-04 01:39:22.765497
129	8	5	2026-08-04 01:39:22.766901	2026-08-04 01:39:22.766901
130	8	6	2026-08-04 01:39:22.76856	2026-08-04 01:39:22.76856
131	8	7	2026-08-04 01:39:22.769509	2026-08-04 01:39:22.769509
132	8	8	2026-08-04 01:39:22.77023	2026-08-04 01:39:22.77023
133	8	9	2026-08-04 01:39:22.771018	2026-08-04 01:39:22.771018
134	8	10	2026-08-04 01:39:22.772945	2026-08-04 01:39:22.772945
135	8	11	2026-08-04 01:39:22.775082	2026-08-04 01:39:22.775082
136	8	12	2026-08-04 01:39:22.776057	2026-08-04 01:39:22.776057
137	8	13	2026-08-04 01:39:22.776746	2026-08-04 01:39:22.776746
138	8	14	2026-08-04 01:39:22.777437	2026-08-04 01:39:22.777437
139	8	15	2026-08-04 01:39:22.778178	2026-08-04 01:39:22.778178
140	8	262	2026-08-04 01:39:22.77888	2026-08-04 01:39:22.77888
141	4	36	2026-08-04 03:51:30.259006	2026-08-04 03:51:30.259006
142	4	37	2026-08-04 03:51:32.433971	2026-08-04 03:51:32.433971
143	6	97	2026-08-04 04:09:32.687336	2026-08-04 04:09:32.687336
144	6	96	2026-08-04 04:09:34.021597	2026-08-04 04:09:34.021597
145	6	98	2026-08-04 04:09:36.055917	2026-08-04 04:09:36.055917
146	6	102	2026-08-04 04:09:39.43526	2026-08-04 04:09:39.43526
147	6	22	2026-08-04 05:13:42.148448	2026-08-04 05:13:42.148448
148	6	23	2026-08-04 05:13:43.796367	2026-08-04 05:13:43.796367
149	6	24	2026-08-04 05:13:45.221152	2026-08-04 05:13:45.221152
150	6	20	2026-08-04 05:13:46.570935	2026-08-04 05:13:46.570935
151	6	19	2026-08-04 05:13:47.603571	2026-08-04 05:13:47.603571
152	6	18	2026-08-04 05:13:48.618498	2026-08-04 05:13:48.618498
153	6	17	2026-08-04 05:13:50.216407	2026-08-04 05:13:50.216407
154	6	21	2026-08-04 05:13:51.590837	2026-08-04 05:13:51.590837
155	6	25	2026-08-04 05:13:53.08657	2026-08-04 05:13:53.08657
156	6	26	2026-08-04 05:13:54.421721	2026-08-04 05:13:54.421721
157	6	27	2026-08-04 05:13:55.457372	2026-08-04 05:13:55.457372
158	6	28	2026-08-04 05:13:56.449688	2026-08-04 05:13:56.449688
159	6	32	2026-08-04 05:13:57.405616	2026-08-04 05:13:57.405616
160	6	31	2026-08-04 05:13:58.914152	2026-08-04 05:13:58.914152
161	6	29	2026-08-04 05:14:00.872145	2026-08-04 05:14:00.872145
162	6	30	2026-08-04 05:14:01.849522	2026-08-04 05:14:01.849522
163	6	33	2026-08-04 05:14:03.293406	2026-08-04 05:14:03.293406
164	6	34	2026-08-04 05:14:04.250877	2026-08-04 05:14:04.250877
165	6	35	2026-08-04 05:14:05.55472	2026-08-04 05:14:05.55472
166	6	36	2026-08-04 05:14:06.583015	2026-08-04 05:14:06.583015
167	6	40	2026-08-04 05:14:08.440254	2026-08-04 05:14:08.440254
168	6	39	2026-08-04 05:14:09.693865	2026-08-04 05:14:09.693865
169	6	38	2026-08-04 05:14:10.606108	2026-08-04 05:14:10.606108
170	6	37	2026-08-04 05:14:11.847352	2026-08-04 05:14:11.847352
171	6	41	2026-08-04 05:14:13.839942	2026-08-04 05:14:13.839942
172	6	42	2026-08-04 05:14:14.741996	2026-08-04 05:14:14.741996
173	6	43	2026-08-04 05:14:15.654233	2026-08-04 05:14:15.654233
174	6	44	2026-08-04 05:14:16.590335	2026-08-04 05:14:16.590335
175	6	48	2026-08-04 05:14:17.666645	2026-08-04 05:14:17.666645
176	6	47	2026-08-04 05:14:18.877237	2026-08-04 05:14:18.877237
177	6	45	2026-08-04 05:14:20.16115	2026-08-04 05:14:20.16115
178	6	46	2026-08-04 05:14:21.542534	2026-08-04 05:14:21.542534
179	3	16	2026-08-04 05:16:13.182113	2026-08-04 05:16:13.182113
180	3	17	2026-08-04 05:16:17.0042	2026-08-04 05:16:17.0042
181	3	18	2026-08-04 05:16:20.707569	2026-08-04 05:16:20.707569
182	3	19	2026-08-04 05:16:21.759585	2026-08-04 05:16:21.759585
183	3	20	2026-08-04 05:16:22.97316	2026-08-04 05:16:22.97316
184	3	21	2026-08-04 05:16:24.245754	2026-08-04 05:16:24.245754
185	1	16	2026-08-04 05:21:02.295825	2026-08-04 05:21:02.295825
186	1	17	2026-08-04 05:21:09.10547	2026-08-04 05:21:09.10547
187	1	18	2026-08-04 05:21:14.876639	2026-08-04 05:21:14.876639
188	4	39	2026-08-04 23:50:12.881068	2026-08-04 23:50:12.881068
189	4	38	2026-08-05 00:29:17.577414	2026-08-05 00:29:17.577414
190	4	40	2026-08-05 00:29:20.773571	2026-08-05 00:29:20.773571
191	4	41	2026-08-05 00:29:22.084834	2026-08-05 00:29:22.084834
192	9	1	2026-08-05 04:26:26.890286	2026-08-05 04:26:26.890286
193	9	2	2026-08-05 04:26:26.892663	2026-08-05 04:26:26.892663
194	9	3	2026-08-05 04:26:26.893325	2026-08-05 04:26:26.893325
195	9	4	2026-08-05 04:26:26.893963	2026-08-05 04:26:26.893963
196	9	5	2026-08-05 04:26:26.894591	2026-08-05 04:26:26.894591
197	9	6	2026-08-05 04:26:26.895244	2026-08-05 04:26:26.895244
198	9	7	2026-08-05 04:26:26.895897	2026-08-05 04:26:26.895897
199	9	8	2026-08-05 04:26:26.896433	2026-08-05 04:26:26.896433
200	9	9	2026-08-05 04:26:26.896957	2026-08-05 04:26:26.896957
201	9	10	2026-08-05 04:26:26.897473	2026-08-05 04:26:26.897473
202	9	11	2026-08-05 04:26:26.898077	2026-08-05 04:26:26.898077
203	9	12	2026-08-05 04:26:26.898573	2026-08-05 04:26:26.898573
204	9	13	2026-08-05 04:26:26.89908	2026-08-05 04:26:26.89908
205	9	14	2026-08-05 04:26:26.89953	2026-08-05 04:26:26.89953
206	9	15	2026-08-05 04:26:26.899996	2026-08-05 04:26:26.899996
207	9	262	2026-08-05 04:26:26.900396	2026-08-05 04:26:26.900396
634	13	1	2026-08-09 17:23:22.32001	2026-08-09 17:23:22.32001
635	13	2	2026-08-09 17:23:22.324806	2026-08-09 17:23:22.324806
636	13	3	2026-08-09 17:23:22.326257	2026-08-09 17:23:22.326257
637	13	4	2026-08-09 17:23:22.327482	2026-08-09 17:23:22.327482
638	13	5	2026-08-09 17:23:22.328546	2026-08-09 17:23:22.328546
639	13	6	2026-08-09 17:23:22.330312	2026-08-09 17:23:22.330312
640	13	7	2026-08-09 17:23:22.331413	2026-08-09 17:23:22.331413
641	13	8	2026-08-09 17:23:22.332316	2026-08-09 17:23:22.332316
642	13	9	2026-08-09 17:23:22.33319	2026-08-09 17:23:22.33319
643	13	16	2026-08-09 17:23:22.3341	2026-08-09 17:23:22.3341
644	13	17	2026-08-09 17:23:22.335073	2026-08-09 17:23:22.335073
645	13	18	2026-08-09 17:23:22.335988	2026-08-09 17:23:22.335988
646	13	19	2026-08-09 17:23:22.336911	2026-08-09 17:23:22.336911
647	13	20	2026-08-09 17:23:22.33781	2026-08-09 17:23:22.33781
648	13	21	2026-08-09 17:23:22.338673	2026-08-09 17:23:22.338673
649	13	22	2026-08-09 17:23:22.339564	2026-08-09 17:23:22.339564
650	13	23	2026-08-09 17:23:22.340452	2026-08-09 17:23:22.340452
651	13	24	2026-08-09 17:23:22.341336	2026-08-09 17:23:22.341336
652	13	36	2026-08-09 17:23:22.342198	2026-08-09 17:23:22.342198
653	13	37	2026-08-09 17:23:22.343066	2026-08-09 17:23:22.343066
654	13	38	2026-08-09 17:23:22.343923	2026-08-09 17:23:22.343923
655	13	39	2026-08-09 17:23:22.344801	2026-08-09 17:23:22.344801
656	13	40	2026-08-09 17:23:22.345647	2026-08-09 17:23:22.345647
657	13	41	2026-08-09 17:23:22.346479	2026-08-09 17:23:22.346479
658	13	42	2026-08-09 17:23:22.347343	2026-08-09 17:23:22.347343
659	13	43	2026-08-09 17:23:22.348205	2026-08-09 17:23:22.348205
660	13	44	2026-08-09 17:23:22.349096	2026-08-09 17:23:22.349096
661	13	56	2026-08-09 17:23:22.349968	2026-08-09 17:23:22.349968
662	13	57	2026-08-09 17:23:22.350836	2026-08-09 17:23:22.350836
663	13	58	2026-08-09 17:23:22.351698	2026-08-09 17:23:22.351698
664	13	59	2026-08-09 17:23:22.352563	2026-08-09 17:23:22.352563
665	13	60	2026-08-09 17:23:22.353491	2026-08-09 17:23:22.353491
666	13	61	2026-08-09 17:23:22.354338	2026-08-09 17:23:22.354338
667	13	62	2026-08-09 17:23:22.355215	2026-08-09 17:23:22.355215
668	13	63	2026-08-09 17:23:22.356053	2026-08-09 17:23:22.356053
669	13	64	2026-08-09 17:23:22.357016	2026-08-09 17:23:22.357016
670	13	76	2026-08-09 17:23:22.357911	2026-08-09 17:23:22.357911
671	13	77	2026-08-09 17:23:22.358723	2026-08-09 17:23:22.358723
672	13	78	2026-08-09 17:23:22.359534	2026-08-09 17:23:22.359534
673	13	79	2026-08-09 17:23:22.360364	2026-08-09 17:23:22.360364
674	13	80	2026-08-09 17:23:22.361256	2026-08-09 17:23:22.361256
675	13	81	2026-08-09 17:23:22.362091	2026-08-09 17:23:22.362091
676	13	82	2026-08-09 17:23:22.362976	2026-08-09 17:23:22.362976
677	13	83	2026-08-09 17:23:22.363842	2026-08-09 17:23:22.363842
678	13	84	2026-08-09 17:23:22.364631	2026-08-09 17:23:22.364631
679	13	96	2026-08-09 17:23:22.365467	2026-08-09 17:23:22.365467
680	13	97	2026-08-09 17:23:22.366288	2026-08-09 17:23:22.366288
681	13	98	2026-08-09 17:23:22.367108	2026-08-09 17:23:22.367108
682	13	99	2026-08-09 17:23:22.367934	2026-08-09 17:23:22.367934
683	13	100	2026-08-09 17:23:22.368707	2026-08-09 17:23:22.368707
684	13	101	2026-08-09 17:23:22.369522	2026-08-09 17:23:22.369522
685	13	102	2026-08-09 17:23:22.370378	2026-08-09 17:23:22.370378
686	13	103	2026-08-09 17:23:22.371179	2026-08-09 17:23:22.371179
687	13	104	2026-08-09 17:23:22.372003	2026-08-09 17:23:22.372003
688	13	116	2026-08-09 17:23:22.372944	2026-08-09 17:23:22.372944
689	13	117	2026-08-09 17:23:22.373802	2026-08-09 17:23:22.373802
690	13	118	2026-08-09 17:23:22.374595	2026-08-09 17:23:22.374595
691	13	119	2026-08-09 17:23:22.375423	2026-08-09 17:23:22.375423
692	13	120	2026-08-09 17:23:22.376262	2026-08-09 17:23:22.376262
693	13	121	2026-08-09 17:23:22.37711	2026-08-09 17:23:22.37711
694	13	122	2026-08-09 17:23:22.377933	2026-08-09 17:23:22.377933
695	13	123	2026-08-09 17:23:22.378753	2026-08-09 17:23:22.378753
696	13	124	2026-08-09 17:23:22.379663	2026-08-09 17:23:22.379663
697	13	136	2026-08-09 17:23:22.38106	2026-08-09 17:23:22.38106
698	13	137	2026-08-09 17:23:22.382132	2026-08-09 17:23:22.382132
699	13	138	2026-08-09 17:23:22.382938	2026-08-09 17:23:22.382938
700	13	139	2026-08-09 17:23:22.383802	2026-08-09 17:23:22.383802
701	13	140	2026-08-09 17:23:22.384632	2026-08-09 17:23:22.384632
702	13	141	2026-08-09 17:23:22.385467	2026-08-09 17:23:22.385467
703	13	142	2026-08-09 17:23:22.386335	2026-08-09 17:23:22.386335
704	13	143	2026-08-09 17:23:22.387162	2026-08-09 17:23:22.387162
705	13	144	2026-08-09 17:23:22.388025	2026-08-09 17:23:22.388025
706	13	156	2026-08-09 17:23:22.388945	2026-08-09 17:23:22.388945
707	13	157	2026-08-09 17:23:22.38974	2026-08-09 17:23:22.38974
708	13	158	2026-08-09 17:23:22.390553	2026-08-09 17:23:22.390553
709	13	159	2026-08-09 17:23:22.391345	2026-08-09 17:23:22.391345
710	13	160	2026-08-09 17:23:22.392168	2026-08-09 17:23:22.392168
711	13	161	2026-08-09 17:23:22.393007	2026-08-09 17:23:22.393007
712	13	162	2026-08-09 17:23:22.393846	2026-08-09 17:23:22.393846
713	13	163	2026-08-09 17:23:22.394679	2026-08-09 17:23:22.394679
714	13	164	2026-08-09 17:23:22.395486	2026-08-09 17:23:22.395486
715	13	176	2026-08-09 17:23:22.396283	2026-08-09 17:23:22.396283
716	13	177	2026-08-09 17:23:22.397095	2026-08-09 17:23:22.397095
717	13	178	2026-08-09 17:23:22.397902	2026-08-09 17:23:22.397902
718	13	179	2026-08-09 17:23:22.398768	2026-08-09 17:23:22.398768
719	13	180	2026-08-09 17:23:22.399668	2026-08-09 17:23:22.399668
720	13	181	2026-08-09 17:23:22.400475	2026-08-09 17:23:22.400475
721	13	182	2026-08-09 17:23:22.401322	2026-08-09 17:23:22.401322
722	13	183	2026-08-09 17:23:22.402154	2026-08-09 17:23:22.402154
723	13	184	2026-08-09 17:23:22.403027	2026-08-09 17:23:22.403027
724	13	197	2026-08-09 17:23:22.40386	2026-08-09 17:23:22.40386
725	13	198	2026-08-09 17:23:22.404668	2026-08-09 17:23:22.404668
726	13	199	2026-08-09 17:23:22.405535	2026-08-09 17:23:22.405535
727	13	200	2026-08-09 17:23:22.40636	2026-08-09 17:23:22.40636
728	13	201	2026-08-09 17:23:22.407184	2026-08-09 17:23:22.407184
729	13	202	2026-08-09 17:23:22.40811	2026-08-09 17:23:22.40811
730	13	203	2026-08-09 17:23:22.408932	2026-08-09 17:23:22.408932
731	13	204	2026-08-09 17:23:22.409817	2026-08-09 17:23:22.409817
732	13	205	2026-08-09 17:23:22.41065	2026-08-09 17:23:22.41065
733	13	217	2026-08-09 17:23:22.411488	2026-08-09 17:23:22.411488
734	13	218	2026-08-09 17:23:22.412328	2026-08-09 17:23:22.412328
735	13	219	2026-08-09 17:23:22.413294	2026-08-09 17:23:22.413294
736	13	220	2026-08-09 17:23:22.41408	2026-08-09 17:23:22.41408
737	13	221	2026-08-09 17:23:22.414972	2026-08-09 17:23:22.414972
738	13	222	2026-08-09 17:23:22.415804	2026-08-09 17:23:22.415804
739	13	223	2026-08-09 17:23:22.41666	2026-08-09 17:23:22.41666
740	13	224	2026-08-09 17:23:22.41755	2026-08-09 17:23:22.41755
741	13	225	2026-08-09 17:23:22.418378	2026-08-09 17:23:22.418378
742	13	237	2026-08-09 17:23:22.419195	2026-08-09 17:23:22.419195
743	13	238	2026-08-09 17:23:22.419987	2026-08-09 17:23:22.419987
744	13	239	2026-08-09 17:23:22.420931	2026-08-09 17:23:22.420931
745	13	240	2026-08-09 17:23:22.421766	2026-08-09 17:23:22.421766
746	13	241	2026-08-09 17:23:22.422573	2026-08-09 17:23:22.422573
747	13	242	2026-08-09 17:23:22.423359	2026-08-09 17:23:22.423359
748	13	243	2026-08-09 17:23:22.424183	2026-08-09 17:23:22.424183
749	13	244	2026-08-09 17:23:22.425019	2026-08-09 17:23:22.425019
750	13	245	2026-08-09 17:23:22.425746	2026-08-09 17:23:22.425746
751	13	257	2026-08-09 17:23:22.426559	2026-08-09 17:23:22.426559
752	13	258	2026-08-09 17:23:22.427355	2026-08-09 17:23:22.427355
753	13	259	2026-08-09 17:23:22.428113	2026-08-09 17:23:22.428113
754	13	260	2026-08-09 17:23:22.428899	2026-08-09 17:23:22.428899
755	13	261	2026-08-09 17:23:22.429663	2026-08-09 17:23:22.429663
756	13	262	2026-08-09 17:23:22.430455	2026-08-09 17:23:22.430455
757	13	263	2026-08-09 17:23:22.431712	2026-08-09 17:23:22.431712
758	13	264	2026-08-09 17:23:22.432502	2026-08-09 17:23:22.432502
759	13	265	2026-08-09 17:23:22.43345	2026-08-09 17:23:22.43345
760	14	1	2026-08-09 17:23:22.998417	2026-08-09 17:23:22.998417
761	14	2	2026-08-09 17:23:22.999376	2026-08-09 17:23:22.999376
762	14	3	2026-08-09 17:23:23.002083	2026-08-09 17:23:23.002083
763	14	4	2026-08-09 17:23:23.002852	2026-08-09 17:23:23.002852
764	14	5	2026-08-09 17:23:23.00352	2026-08-09 17:23:23.00352
765	14	6	2026-08-09 17:23:23.004151	2026-08-09 17:23:23.004151
766	14	7	2026-08-09 17:23:23.00475	2026-08-09 17:23:23.00475
767	14	8	2026-08-09 17:23:23.005381	2026-08-09 17:23:23.005381
768	14	9	2026-08-09 17:23:23.006003	2026-08-09 17:23:23.006003
769	14	16	2026-08-09 17:23:23.006556	2026-08-09 17:23:23.006556
770	14	17	2026-08-09 17:23:23.007214	2026-08-09 17:23:23.007214
771	14	18	2026-08-09 17:23:23.008071	2026-08-09 17:23:23.008071
772	14	19	2026-08-09 17:23:23.008858	2026-08-09 17:23:23.008858
773	14	20	2026-08-09 17:23:23.009453	2026-08-09 17:23:23.009453
774	14	21	2026-08-09 17:23:23.01006	2026-08-09 17:23:23.01006
775	14	22	2026-08-09 17:23:23.010643	2026-08-09 17:23:23.010643
776	14	23	2026-08-09 17:23:23.011256	2026-08-09 17:23:23.011256
777	14	24	2026-08-09 17:23:23.012183	2026-08-09 17:23:23.012183
778	14	36	2026-08-09 17:23:23.012795	2026-08-09 17:23:23.012795
779	14	37	2026-08-09 17:23:23.013378	2026-08-09 17:23:23.013378
780	14	38	2026-08-09 17:23:23.014018	2026-08-09 17:23:23.014018
781	14	39	2026-08-09 17:23:23.014622	2026-08-09 17:23:23.014622
782	14	40	2026-08-09 17:23:23.015242	2026-08-09 17:23:23.015242
783	14	41	2026-08-09 17:23:23.015864	2026-08-09 17:23:23.015864
784	14	42	2026-08-09 17:23:23.016417	2026-08-09 17:23:23.016417
785	14	43	2026-08-09 17:23:23.016997	2026-08-09 17:23:23.016997
786	14	44	2026-08-09 17:23:23.017647	2026-08-09 17:23:23.017647
787	14	56	2026-08-09 17:23:23.018446	2026-08-09 17:23:23.018446
788	14	57	2026-08-09 17:23:23.019129	2026-08-09 17:23:23.019129
789	14	58	2026-08-09 17:23:23.019836	2026-08-09 17:23:23.019836
790	14	59	2026-08-09 17:23:23.020483	2026-08-09 17:23:23.020483
791	14	60	2026-08-09 17:23:23.021104	2026-08-09 17:23:23.021104
792	14	61	2026-08-09 17:23:23.021671	2026-08-09 17:23:23.021671
793	14	62	2026-08-09 17:23:23.022288	2026-08-09 17:23:23.022288
794	14	63	2026-08-09 17:23:23.022893	2026-08-09 17:23:23.022893
795	14	64	2026-08-09 17:23:23.023484	2026-08-09 17:23:23.023484
796	14	76	2026-08-09 17:23:23.024113	2026-08-09 17:23:23.024113
797	14	77	2026-08-09 17:23:23.024701	2026-08-09 17:23:23.024701
798	14	78	2026-08-09 17:23:23.02531	2026-08-09 17:23:23.02531
799	14	79	2026-08-09 17:23:23.025945	2026-08-09 17:23:23.025945
800	14	80	2026-08-09 17:23:23.026521	2026-08-09 17:23:23.026521
801	14	81	2026-08-09 17:23:23.02711	2026-08-09 17:23:23.02711
802	14	82	2026-08-09 17:23:23.027707	2026-08-09 17:23:23.027707
803	14	83	2026-08-09 17:23:23.028336	2026-08-09 17:23:23.028336
804	14	84	2026-08-09 17:23:23.029133	2026-08-09 17:23:23.029133
805	14	96	2026-08-09 17:23:23.029722	2026-08-09 17:23:23.029722
806	14	97	2026-08-09 17:23:23.030435	2026-08-09 17:23:23.030435
807	14	98	2026-08-09 17:23:23.031006	2026-08-09 17:23:23.031006
808	14	99	2026-08-09 17:23:23.031579	2026-08-09 17:23:23.031579
809	14	100	2026-08-09 17:23:23.032196	2026-08-09 17:23:23.032196
810	14	101	2026-08-09 17:23:23.032764	2026-08-09 17:23:23.032764
811	14	102	2026-08-09 17:23:23.033866	2026-08-09 17:23:23.033866
812	14	103	2026-08-09 17:23:23.034457	2026-08-09 17:23:23.034457
813	14	104	2026-08-09 17:23:23.035344	2026-08-09 17:23:23.035344
814	14	116	2026-08-09 17:23:23.036045	2026-08-09 17:23:23.036045
815	14	117	2026-08-09 17:23:23.036664	2026-08-09 17:23:23.036664
816	14	118	2026-08-09 17:23:23.037311	2026-08-09 17:23:23.037311
817	14	119	2026-08-09 17:23:23.03792	2026-08-09 17:23:23.03792
818	14	120	2026-08-09 17:23:23.038469	2026-08-09 17:23:23.038469
819	14	121	2026-08-09 17:23:23.039078	2026-08-09 17:23:23.039078
820	14	122	2026-08-09 17:23:23.039666	2026-08-09 17:23:23.039666
821	14	123	2026-08-09 17:23:23.040277	2026-08-09 17:23:23.040277
822	14	124	2026-08-09 17:23:23.040967	2026-08-09 17:23:23.040967
823	14	136	2026-08-09 17:23:23.041581	2026-08-09 17:23:23.041581
824	14	137	2026-08-09 17:23:23.04328	2026-08-09 17:23:23.04328
825	14	138	2026-08-09 17:23:23.043949	2026-08-09 17:23:23.043949
826	14	139	2026-08-09 17:23:23.044651	2026-08-09 17:23:23.044651
827	14	140	2026-08-09 17:23:23.045289	2026-08-09 17:23:23.045289
828	14	141	2026-08-09 17:23:23.045932	2026-08-09 17:23:23.045932
829	14	142	2026-08-09 17:23:23.046519	2026-08-09 17:23:23.046519
830	14	143	2026-08-09 17:23:23.047121	2026-08-09 17:23:23.047121
831	14	144	2026-08-09 17:23:23.047699	2026-08-09 17:23:23.047699
832	14	156	2026-08-09 17:23:23.048322	2026-08-09 17:23:23.048322
833	14	157	2026-08-09 17:23:23.048993	2026-08-09 17:23:23.048993
834	14	158	2026-08-09 17:23:23.049546	2026-08-09 17:23:23.049546
835	14	159	2026-08-09 17:23:23.050169	2026-08-09 17:23:23.050169
836	14	160	2026-08-09 17:23:23.050733	2026-08-09 17:23:23.050733
837	14	161	2026-08-09 17:23:23.051316	2026-08-09 17:23:23.051316
838	14	162	2026-08-09 17:23:23.051971	2026-08-09 17:23:23.051971
839	14	163	2026-08-09 17:23:23.052918	2026-08-09 17:23:23.052918
840	14	164	2026-08-09 17:23:23.053562	2026-08-09 17:23:23.053562
841	14	176	2026-08-09 17:23:23.054143	2026-08-09 17:23:23.054143
842	14	177	2026-08-09 17:23:23.054675	2026-08-09 17:23:23.054675
843	14	178	2026-08-09 17:23:23.055384	2026-08-09 17:23:23.055384
844	14	179	2026-08-09 17:23:23.056014	2026-08-09 17:23:23.056014
845	14	180	2026-08-09 17:23:23.056872	2026-08-09 17:23:23.056872
846	14	181	2026-08-09 17:23:23.057447	2026-08-09 17:23:23.057447
847	14	182	2026-08-09 17:23:23.058043	2026-08-09 17:23:23.058043
848	14	183	2026-08-09 17:23:23.05858	2026-08-09 17:23:23.05858
849	14	184	2026-08-09 17:23:23.059282	2026-08-09 17:23:23.059282
850	14	197	2026-08-09 17:23:23.060011	2026-08-09 17:23:23.060011
851	14	198	2026-08-09 17:23:23.060704	2026-08-09 17:23:23.060704
852	14	199	2026-08-09 17:23:23.061646	2026-08-09 17:23:23.061646
853	14	200	2026-08-09 17:23:23.062243	2026-08-09 17:23:23.062243
854	14	201	2026-08-09 17:23:23.062838	2026-08-09 17:23:23.062838
855	14	202	2026-08-09 17:23:23.06342	2026-08-09 17:23:23.06342
856	14	203	2026-08-09 17:23:23.063974	2026-08-09 17:23:23.063974
857	14	204	2026-08-09 17:23:23.064586	2026-08-09 17:23:23.064586
858	14	205	2026-08-09 17:23:23.065154	2026-08-09 17:23:23.065154
859	14	217	2026-08-09 17:23:23.065766	2026-08-09 17:23:23.065766
860	14	218	2026-08-09 17:23:23.066377	2026-08-09 17:23:23.066377
861	14	219	2026-08-09 17:23:23.066964	2026-08-09 17:23:23.066964
862	14	220	2026-08-09 17:23:23.067521	2026-08-09 17:23:23.067521
863	14	221	2026-08-09 17:23:23.068135	2026-08-09 17:23:23.068135
864	14	222	2026-08-09 17:23:23.068712	2026-08-09 17:23:23.068712
865	14	223	2026-08-09 17:23:23.069266	2026-08-09 17:23:23.069266
866	14	224	2026-08-09 17:23:23.069846	2026-08-09 17:23:23.069846
867	14	225	2026-08-09 17:23:23.070397	2026-08-09 17:23:23.070397
868	14	237	2026-08-09 17:23:23.071012	2026-08-09 17:23:23.071012
869	14	238	2026-08-09 17:23:23.071567	2026-08-09 17:23:23.071567
870	14	239	2026-08-09 17:23:23.072147	2026-08-09 17:23:23.072147
871	14	240	2026-08-09 17:23:23.0727	2026-08-09 17:23:23.0727
872	14	241	2026-08-09 17:23:23.073306	2026-08-09 17:23:23.073306
873	14	242	2026-08-09 17:23:23.073891	2026-08-09 17:23:23.073891
874	14	243	2026-08-09 17:23:23.074449	2026-08-09 17:23:23.074449
875	14	244	2026-08-09 17:23:23.075011	2026-08-09 17:23:23.075011
876	14	245	2026-08-09 17:23:23.0756	2026-08-09 17:23:23.0756
877	14	257	2026-08-09 17:23:23.076156	2026-08-09 17:23:23.076156
878	14	258	2026-08-09 17:23:23.076703	2026-08-09 17:23:23.076703
879	14	259	2026-08-09 17:23:23.077281	2026-08-09 17:23:23.077281
880	14	260	2026-08-09 17:23:23.077855	2026-08-09 17:23:23.077855
881	14	261	2026-08-09 17:23:23.078398	2026-08-09 17:23:23.078398
882	14	262	2026-08-09 17:23:23.079225	2026-08-09 17:23:23.079225
883	14	263	2026-08-09 17:23:23.079763	2026-08-09 17:23:23.079763
884	14	264	2026-08-09 17:23:23.080361	2026-08-09 17:23:23.080361
885	14	265	2026-08-09 17:23:23.081137	2026-08-09 17:23:23.081137
886	15	1	2026-08-09 17:23:23.423888	2026-08-09 17:23:23.423888
887	15	2	2026-08-09 17:23:23.424662	2026-08-09 17:23:23.424662
888	15	3	2026-08-09 17:23:23.425204	2026-08-09 17:23:23.425204
889	15	4	2026-08-09 17:23:23.425819	2026-08-09 17:23:23.425819
890	15	5	2026-08-09 17:23:23.426319	2026-08-09 17:23:23.426319
891	15	6	2026-08-09 17:23:23.426829	2026-08-09 17:23:23.426829
892	15	7	2026-08-09 17:23:23.427267	2026-08-09 17:23:23.427267
893	15	8	2026-08-09 17:23:23.427736	2026-08-09 17:23:23.427736
894	15	9	2026-08-09 17:23:23.428187	2026-08-09 17:23:23.428187
895	15	16	2026-08-09 17:23:23.428644	2026-08-09 17:23:23.428644
896	15	17	2026-08-09 17:23:23.429094	2026-08-09 17:23:23.429094
897	15	18	2026-08-09 17:23:23.429575	2026-08-09 17:23:23.429575
898	15	19	2026-08-09 17:23:23.430019	2026-08-09 17:23:23.430019
899	15	20	2026-08-09 17:23:23.430612	2026-08-09 17:23:23.430612
900	15	21	2026-08-09 17:23:23.431163	2026-08-09 17:23:23.431163
901	15	22	2026-08-09 17:23:23.431678	2026-08-09 17:23:23.431678
902	15	23	2026-08-09 17:23:23.432174	2026-08-09 17:23:23.432174
903	15	24	2026-08-09 17:23:23.432665	2026-08-09 17:23:23.432665
904	15	36	2026-08-09 17:23:23.433185	2026-08-09 17:23:23.433185
905	15	37	2026-08-09 17:23:23.43364	2026-08-09 17:23:23.43364
906	15	38	2026-08-09 17:23:23.434137	2026-08-09 17:23:23.434137
907	15	39	2026-08-09 17:23:23.434634	2026-08-09 17:23:23.434634
908	15	40	2026-08-09 17:23:23.435157	2026-08-09 17:23:23.435157
909	15	41	2026-08-09 17:23:23.435641	2026-08-09 17:23:23.435641
910	15	42	2026-08-09 17:23:23.436116	2026-08-09 17:23:23.436116
911	15	43	2026-08-09 17:23:23.436586	2026-08-09 17:23:23.436586
912	15	44	2026-08-09 17:23:23.437107	2026-08-09 17:23:23.437107
913	15	56	2026-08-09 17:23:23.437583	2026-08-09 17:23:23.437583
914	15	57	2026-08-09 17:23:23.438082	2026-08-09 17:23:23.438082
915	15	58	2026-08-09 17:23:23.438521	2026-08-09 17:23:23.438521
916	15	59	2026-08-09 17:23:23.439027	2026-08-09 17:23:23.439027
917	15	60	2026-08-09 17:23:23.439539	2026-08-09 17:23:23.439539
918	15	61	2026-08-09 17:23:23.440023	2026-08-09 17:23:23.440023
919	15	62	2026-08-09 17:23:23.440483	2026-08-09 17:23:23.440483
920	15	63	2026-08-09 17:23:23.440932	2026-08-09 17:23:23.440932
921	15	64	2026-08-09 17:23:23.441382	2026-08-09 17:23:23.441382
922	15	76	2026-08-09 17:23:23.441875	2026-08-09 17:23:23.441875
923	15	77	2026-08-09 17:23:23.442316	2026-08-09 17:23:23.442316
924	15	78	2026-08-09 17:23:23.442801	2026-08-09 17:23:23.442801
925	15	79	2026-08-09 17:23:23.443256	2026-08-09 17:23:23.443256
926	15	80	2026-08-09 17:23:23.443892	2026-08-09 17:23:23.443892
927	15	81	2026-08-09 17:23:23.444334	2026-08-09 17:23:23.444334
928	15	82	2026-08-09 17:23:23.444758	2026-08-09 17:23:23.444758
929	15	83	2026-08-09 17:23:23.445219	2026-08-09 17:23:23.445219
930	15	84	2026-08-09 17:23:23.445739	2026-08-09 17:23:23.445739
931	15	96	2026-08-09 17:23:23.446206	2026-08-09 17:23:23.446206
932	15	97	2026-08-09 17:23:23.446657	2026-08-09 17:23:23.446657
933	15	98	2026-08-09 17:23:23.447103	2026-08-09 17:23:23.447103
934	15	99	2026-08-09 17:23:23.447543	2026-08-09 17:23:23.447543
935	15	100	2026-08-09 17:23:23.448076	2026-08-09 17:23:23.448076
936	15	101	2026-08-09 17:23:23.448541	2026-08-09 17:23:23.448541
937	15	102	2026-08-09 17:23:23.449008	2026-08-09 17:23:23.449008
938	15	103	2026-08-09 17:23:23.449456	2026-08-09 17:23:23.449456
939	15	104	2026-08-09 17:23:23.450044	2026-08-09 17:23:23.450044
940	15	116	2026-08-09 17:23:23.451476	2026-08-09 17:23:23.451476
941	15	117	2026-08-09 17:23:23.451957	2026-08-09 17:23:23.451957
942	15	118	2026-08-09 17:23:23.452918	2026-08-09 17:23:23.452918
943	15	119	2026-08-09 17:23:23.453444	2026-08-09 17:23:23.453444
944	15	120	2026-08-09 17:23:23.453956	2026-08-09 17:23:23.453956
945	15	121	2026-08-09 17:23:23.454411	2026-08-09 17:23:23.454411
946	15	122	2026-08-09 17:23:23.454954	2026-08-09 17:23:23.454954
947	15	123	2026-08-09 17:23:23.455465	2026-08-09 17:23:23.455465
948	15	124	2026-08-09 17:23:23.455923	2026-08-09 17:23:23.455923
949	15	136	2026-08-09 17:23:23.45635	2026-08-09 17:23:23.45635
950	15	137	2026-08-09 17:23:23.456803	2026-08-09 17:23:23.456803
951	15	138	2026-08-09 17:23:23.457356	2026-08-09 17:23:23.457356
952	15	139	2026-08-09 17:23:23.457952	2026-08-09 17:23:23.457952
953	15	140	2026-08-09 17:23:23.458452	2026-08-09 17:23:23.458452
954	15	141	2026-08-09 17:23:23.459009	2026-08-09 17:23:23.459009
955	15	142	2026-08-09 17:23:23.459477	2026-08-09 17:23:23.459477
956	15	143	2026-08-09 17:23:23.45997	2026-08-09 17:23:23.45997
957	15	144	2026-08-09 17:23:23.460451	2026-08-09 17:23:23.460451
958	15	156	2026-08-09 17:23:23.460963	2026-08-09 17:23:23.460963
959	15	157	2026-08-09 17:23:23.46142	2026-08-09 17:23:23.46142
960	15	158	2026-08-09 17:23:23.461904	2026-08-09 17:23:23.461904
961	15	159	2026-08-09 17:23:23.46236	2026-08-09 17:23:23.46236
962	15	160	2026-08-09 17:23:23.462828	2026-08-09 17:23:23.462828
963	15	161	2026-08-09 17:23:23.463241	2026-08-09 17:23:23.463241
964	15	162	2026-08-09 17:23:23.463718	2026-08-09 17:23:23.463718
965	15	163	2026-08-09 17:23:23.464196	2026-08-09 17:23:23.464196
966	15	164	2026-08-09 17:23:23.464732	2026-08-09 17:23:23.464732
967	15	176	2026-08-09 17:23:23.465174	2026-08-09 17:23:23.465174
968	15	177	2026-08-09 17:23:23.465616	2026-08-09 17:23:23.465616
969	15	178	2026-08-09 17:23:23.46612	2026-08-09 17:23:23.46612
970	15	179	2026-08-09 17:23:23.466584	2026-08-09 17:23:23.466584
971	15	180	2026-08-09 17:23:23.467197	2026-08-09 17:23:23.467197
972	15	181	2026-08-09 17:23:23.467652	2026-08-09 17:23:23.467652
973	15	182	2026-08-09 17:23:23.468099	2026-08-09 17:23:23.468099
974	15	183	2026-08-09 17:23:23.468559	2026-08-09 17:23:23.468559
975	15	184	2026-08-09 17:23:23.469034	2026-08-09 17:23:23.469034
976	15	197	2026-08-09 17:23:23.469494	2026-08-09 17:23:23.469494
977	15	198	2026-08-09 17:23:23.469955	2026-08-09 17:23:23.469955
978	15	199	2026-08-09 17:23:23.470409	2026-08-09 17:23:23.470409
979	15	200	2026-08-09 17:23:23.470911	2026-08-09 17:23:23.470911
980	15	201	2026-08-09 17:23:23.471342	2026-08-09 17:23:23.471342
981	15	202	2026-08-09 17:23:23.471815	2026-08-09 17:23:23.471815
982	15	203	2026-08-09 17:23:23.472252	2026-08-09 17:23:23.472252
983	15	204	2026-08-09 17:23:23.472652	2026-08-09 17:23:23.472652
984	15	205	2026-08-09 17:23:23.473091	2026-08-09 17:23:23.473091
985	15	217	2026-08-09 17:23:23.473544	2026-08-09 17:23:23.473544
986	15	218	2026-08-09 17:23:23.473988	2026-08-09 17:23:23.473988
987	15	219	2026-08-09 17:23:23.474372	2026-08-09 17:23:23.474372
988	15	220	2026-08-09 17:23:23.474753	2026-08-09 17:23:23.474753
989	15	221	2026-08-09 17:23:23.475179	2026-08-09 17:23:23.475179
990	15	222	2026-08-09 17:23:23.475605	2026-08-09 17:23:23.475605
991	15	223	2026-08-09 17:23:23.476016	2026-08-09 17:23:23.476016
992	15	224	2026-08-09 17:23:23.476406	2026-08-09 17:23:23.476406
993	15	225	2026-08-09 17:23:23.476825	2026-08-09 17:23:23.476825
994	15	237	2026-08-09 17:23:23.477214	2026-08-09 17:23:23.477214
995	15	238	2026-08-09 17:23:23.477635	2026-08-09 17:23:23.477635
996	15	239	2026-08-09 17:23:23.478037	2026-08-09 17:23:23.478037
997	15	240	2026-08-09 17:23:23.478466	2026-08-09 17:23:23.478466
998	15	241	2026-08-09 17:23:23.47893	2026-08-09 17:23:23.47893
999	15	242	2026-08-09 17:23:23.479345	2026-08-09 17:23:23.479345
1000	15	243	2026-08-09 17:23:23.479843	2026-08-09 17:23:23.479843
1001	15	244	2026-08-09 17:23:23.480266	2026-08-09 17:23:23.480266
1002	15	245	2026-08-09 17:23:23.480714	2026-08-09 17:23:23.480714
1003	15	257	2026-08-09 17:23:23.481233	2026-08-09 17:23:23.481233
1004	15	258	2026-08-09 17:23:23.481638	2026-08-09 17:23:23.481638
1005	15	259	2026-08-09 17:23:23.48207	2026-08-09 17:23:23.48207
1006	15	260	2026-08-09 17:23:23.482929	2026-08-09 17:23:23.482929
1007	15	261	2026-08-09 17:23:23.483383	2026-08-09 17:23:23.483383
1008	15	262	2026-08-09 17:23:23.483798	2026-08-09 17:23:23.483798
1009	15	263	2026-08-09 17:23:23.484187	2026-08-09 17:23:23.484187
1010	15	264	2026-08-09 17:23:23.484588	2026-08-09 17:23:23.484588
1011	15	265	2026-08-09 17:23:23.485049	2026-08-09 17:23:23.485049
1019	4	50	2026-08-10 00:47:12.140865	2026-08-10 00:47:12.140865
1023	4	55	2026-08-10 00:47:19.54017	2026-08-10 00:47:19.54017
1032	3	116	2026-08-10 01:28:15.331307	2026-08-10 01:28:15.331307
1034	3	137	2026-08-10 01:28:23.605895	2026-08-10 01:28:23.605895
1042	3	77	2026-08-10 01:28:34.542635	2026-08-10 01:28:34.542635
1044	3	56	2026-08-10 01:28:38.206973	2026-08-10 01:28:38.206973
592	6	16	2026-08-06 01:05:51.254578	2026-08-06 01:05:51.254578
593	8	22	2026-08-06 04:18:32.930058	2026-08-06 04:18:32.930058
1052	3	39	2026-08-10 01:28:47.384881	2026-08-10 01:28:47.384881
600	8	136	2026-08-06 05:46:22.692091	2026-08-06 05:46:22.692091
601	8	138	2026-08-06 05:46:24.232081	2026-08-06 05:46:24.232081
602	8	142	2026-08-06 05:46:25.59047	2026-08-06 05:46:25.59047
607	8	176	2026-08-06 05:46:54.068982	2026-08-06 05:46:54.068982
1012	13	10	2026-08-09 17:27:05.239271	2026-08-09 17:27:05.239271
1013	13	11	2026-08-09 17:27:05.242727	2026-08-09 17:27:05.242727
1014	13	12	2026-08-09 17:27:05.243599	2026-08-09 17:27:05.243599
1015	13	13	2026-08-09 17:27:05.246975	2026-08-09 17:27:05.246975
1016	13	14	2026-08-09 17:27:05.247624	2026-08-09 17:27:05.247624
1017	13	15	2026-08-09 17:27:05.248311	2026-08-09 17:27:05.248311
1020	4	51	2026-08-10 00:47:13.440019	2026-08-10 00:47:13.440019
1027	3	156	2026-08-10 01:28:07.586231	2026-08-10 01:28:07.586231
1029	3	158	2026-08-10 01:28:09.544536	2026-08-10 01:28:09.544536
1031	3	118	2026-08-10 01:28:12.650527	2026-08-10 01:28:12.650527
1033	3	136	2026-08-10 01:28:22.916844	2026-08-10 01:28:22.916844
1037	3	96	2026-08-10 01:28:28.148219	2026-08-10 01:28:28.148219
1039	3	98	2026-08-10 01:28:29.719748	2026-08-10 01:28:29.719748
1041	3	76	2026-08-10 01:28:33.784067	2026-08-10 01:28:33.784067
1043	3	80	2026-08-10 01:28:35.892032	2026-08-10 01:28:35.892032
1047	3	59	2026-08-10 01:28:40.591765	2026-08-10 01:28:40.591765
1049	3	36	2026-08-10 01:28:43.787761	2026-08-10 01:28:43.787761
1051	3	38	2026-08-10 01:28:46.192826	2026-08-10 01:28:46.192826
603	8	118	2026-08-06 05:46:29.871207	2026-08-06 05:46:29.871207
604	8	57	2026-08-06 05:46:38.513266	2026-08-06 05:46:38.513266
605	8	174	2026-08-06 05:46:41.48988	2026-08-06 05:46:41.48988
606	8	182	2026-08-06 05:46:47.318516	2026-08-06 05:46:47.318516
608	2	97	2026-08-06 05:59:33.007915	2026-08-06 05:59:33.007915
609	3	22	2026-08-06 06:04:57.44606	2026-08-06 06:04:57.44606
610	4	42	2026-08-07 00:28:57.804714	2026-08-07 00:28:57.804714
611	4	43	2026-08-07 00:29:01.737089	2026-08-07 00:29:01.737089
612	4	44	2026-08-07 00:29:03.122237	2026-08-07 00:29:03.122237
613	4	45	2026-08-07 00:29:04.209516	2026-08-07 00:29:04.209516
614	4	46	2026-08-07 00:29:05.287238	2026-08-07 00:29:05.287238
615	4	47	2026-08-07 00:29:08.346889	2026-08-07 00:29:08.346889
616	4	48	2026-08-07 00:29:09.509303	2026-08-07 00:29:09.509303
617	9	57	2026-08-07 03:27:20.193258	2026-08-07 03:27:20.193258
618	9	219	2026-08-07 03:27:32.67371	2026-08-07 03:27:32.67371
619	9	218	2026-08-07 03:27:33.87483	2026-08-07 03:27:33.87483
620	9	222	2026-08-07 03:27:34.812408	2026-08-07 03:27:34.812408
621	9	221	2026-08-07 03:27:35.937461	2026-08-07 03:27:35.937461
1018	4	49	2026-08-10 00:47:10.789133	2026-08-10 00:47:10.789133
1021	4	52	2026-08-10 00:47:15.682876	2026-08-10 00:47:15.682876
1022	4	54	2026-08-10 00:47:18.2529	2026-08-10 00:47:18.2529
1024	4	53	2026-08-10 00:47:23.883649	2026-08-10 00:47:23.883649
1025	4	56	2026-08-10 00:47:29.564628	2026-08-10 00:47:29.564628
1026	4	57	2026-08-10 00:47:30.575717	2026-08-10 00:47:30.575717
628	1	238	2026-08-08 23:42:50.108299	2026-08-08 23:42:50.108299
629	1	237	2026-08-08 23:42:51.720618	2026-08-08 23:42:51.720618
630	1	239	2026-08-08 23:42:53.369747	2026-08-08 23:42:53.369747
631	1	240	2026-08-08 23:42:54.70571	2026-08-08 23:42:54.70571
632	1	241	2026-08-08 23:42:56.556638	2026-08-08 23:42:56.556638
633	1	19	2026-08-08 23:43:35.047531	2026-08-08 23:43:35.047531
1028	3	157	2026-08-10 01:28:08.312161	2026-08-10 01:28:08.312161
1030	3	117	2026-08-10 01:28:11.640618	2026-08-10 01:28:11.640618
1035	3	138	2026-08-10 01:28:24.400474	2026-08-10 01:28:24.400474
1036	3	139	2026-08-10 01:28:25.295925	2026-08-10 01:28:25.295925
1038	3	97	2026-08-10 01:28:28.913162	2026-08-10 01:28:28.913162
1040	3	99	2026-08-10 01:28:30.797605	2026-08-10 01:28:30.797605
1045	3	57	2026-08-10 01:28:38.880337	2026-08-10 01:28:38.880337
1046	3	58	2026-08-10 01:28:39.619254	2026-08-10 01:28:39.619254
1048	3	63	2026-08-10 01:28:41.622829	2026-08-10 01:28:41.622829
1050	3	37	2026-08-10 01:28:45.26834	2026-08-10 01:28:45.26834
\.


--
-- Data for Name: user_village; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.user_village (user_id, sheet_id, terrain, created_at, updated_at) FROM stdin;
13	32	CITY_ROAD	2026-08-09 17:23:22.935708	2026-08-09 17:23:22.935708
14	33	GRASS_PATH	2026-08-09 17:23:23.215974	2026-08-09 17:23:23.215974
14	34	CITY_ROAD	2026-08-09 17:23:23.37497	2026-08-09 17:23:23.37497
15	35	GRASS_PATH	2026-08-09 17:23:23.591278	2026-08-09 17:23:23.591278
15	36	CITY_ROAD	2026-08-09 17:23:23.732635	2026-08-09 17:23:23.732635
13	31	WATER_WAY	2026-08-09 17:23:22.669582	2026-08-09 17:28:20.764665
3	2	GRASS_PATH	2026-08-09 08:09:55.602411	2026-08-10 00:21:59.043014
6	6	WATER_WAY	2026-08-04 04:08:56.493701	2026-08-06 01:04:01.586487
5	13	CITY_ROAD	2026-08-04 07:11:41.986473	2026-08-10 01:41:11.920957
9	26	DIRT_ROAD	2026-08-07 03:29:28.49711	2026-08-07 03:29:28.990643
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, uuid, point, profile_image, created_at, updated_at, deleted_at) FROM stdin;
7	고성현	50392369-9c09-45f8-9943-bc22bac6effc	10000	\N	2026-08-04 01:28:19.203902	2026-08-04 01:28:19.203902	\N
5	지상근	70958eb5-9987-4b37-82c0-fe93b485a97e	20	\N	2026-08-03 07:21:27.401422	2026-08-04 11:24:21.359488	\N
4	김재현	981b74be-5c72-43d5-9830-f29b64f9dd76	220	\N	2026-08-03 06:30:39.948545	2026-08-10 00:47:30.57669	\N
2	희성	2c9b47f7-f2d4-4b82-b24a-86e77ce24547	2030	\N	2026-08-03 01:17:40.665692	2026-08-08 16:00:12.894337	\N
13	테스터1	tester-1	4500	\N	2026-08-09 17:23:22.218863	2026-08-09 17:23:22.218863	\N
14	테스터2	tester-2	4500	\N	2026-08-09 17:23:22.980239	2026-08-09 17:23:22.980239	\N
15	테스터3	tester-3	4500	\N	2026-08-09 17:23:23.409005	2026-08-09 17:23:23.409005	\N
6	이성현	2132394d-8d53-4f61-ab3e-0e7e40e128a0	1130	\N	2026-08-04 00:18:34.76547	2026-08-07 07:56:27.43038	\N
9	지환	427d89e0-bf22-4bed-96b3-2b611e783d86	8500	\N	2026-08-05 04:26:26.200476	2026-08-07 03:27:35.938627	\N
3	권병수	af7c2693-469d-4dbd-bfa3-a90a5d409fd9	49600	\N	2026-08-03 01:40:21.644827	2026-08-10 01:28:47.385946	\N
8	소연	c22daa37-ad8b-47e1-8596-d668b62de2ea	10050	\N	2026-08-04 01:39:22.202371	2026-08-10 01:53:37.719297	\N
1	황우찬	9a8b057b-5ed4-43a9-ad50-817b633ec18e	1640	\N	2026-08-03 01:15:46.496523	2026-08-09 23:23:12.089037	\N
\.


--
-- Name: building_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.building_item_id_seq', 269, true);


--
-- Name: domain_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.domain_id_seq', 288, true);


--
-- Name: friends_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.friends_id_seq', 17, true);


--
-- Name: group_request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.group_request_id_seq', 1, false);


--
-- Name: group_sheet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.group_sheet_id_seq', 1, false);


--
-- Name: groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.groups_id_seq', 1, false);


--
-- Name: item_spot_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.item_spot_id_seq', 2628, true);


--
-- Name: oauth_identities_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.oauth_identities_id_seq', 9, true);


--
-- Name: refresh_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.refresh_token_id_seq', 86, true);


--
-- Name: request_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.request_id_seq', 11, true);


--
-- Name: reward_claim_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reward_claim_id_seq', 7, true);


--
-- Name: reward_claim_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.reward_claim_item_id_seq', 1, false);


--
-- Name: sheet_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.sheet_id_seq', 36, true);


--
-- Name: subject_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subject_id_seq', 2304, true);


--
-- Name: subject_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.subject_log_id_seq', 3046, true);


--
-- Name: user_building_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.user_building_id_seq', 1052, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 15, true);


--
-- Name: building_item building_item_item_key_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.building_item
    ADD CONSTRAINT building_item_item_key_key UNIQUE (item_key);


--
-- Name: building_item building_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.building_item
    ADD CONSTRAINT building_item_pkey PRIMARY KEY (id);


--
-- Name: domain domain_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain
    ADD CONSTRAINT domain_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: friends friends_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_pkey PRIMARY KEY (id);


--
-- Name: group_request group_request_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_request
    ADD CONSTRAINT group_request_pkey PRIMARY KEY (id);


--
-- Name: group_sheet group_sheet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_sheet
    ADD CONSTRAINT group_sheet_pkey PRIMARY KEY (id);


--
-- Name: groups groups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_pkey PRIMARY KEY (id);


--
-- Name: item_spot item_spot_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item_spot
    ADD CONSTRAINT item_spot_pkey PRIMARY KEY (id);


--
-- Name: likes likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT likes_pkey PRIMARY KEY (user_id, sheet_id);


--
-- Name: oauth_identities oauth_identities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_identities
    ADD CONSTRAINT oauth_identities_pkey PRIMARY KEY (id);


--
-- Name: user_village pk_user_village; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_village
    ADD CONSTRAINT pk_user_village PRIMARY KEY (user_id, sheet_id);


--
-- Name: refresh_token refresh_token_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT refresh_token_pkey PRIMARY KEY (id);


--
-- Name: request request_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request
    ADD CONSTRAINT request_pkey PRIMARY KEY (id);


--
-- Name: reward_claim_item reward_claim_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_claim_item
    ADD CONSTRAINT reward_claim_item_pkey PRIMARY KEY (id);


--
-- Name: reward_claim reward_claim_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_claim
    ADD CONSTRAINT reward_claim_pkey PRIMARY KEY (id);


--
-- Name: sheet sheet_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet
    ADD CONSTRAINT sheet_pkey PRIMARY KEY (id);


--
-- Name: subject_log subject_log_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subject_log
    ADD CONSTRAINT subject_log_pkey PRIMARY KEY (id);


--
-- Name: subject subject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subject
    ADD CONSTRAINT subject_pkey PRIMARY KEY (id);


--
-- Name: friends uk_friends_pair; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT uk_friends_pair UNIQUE (user_id1, user_id2);


--
-- Name: group_request uk_group_request; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_request
    ADD CONSTRAINT uk_group_request UNIQUE (group_id, receiver_id);


--
-- Name: item_spot uk_item_spot_tile; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item_spot
    ADD CONSTRAINT uk_item_spot_tile UNIQUE (sheet_id, domain_position, item_position);


--
-- Name: oauth_identities uk_oauth_identities_provider_user; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_identities
    ADD CONSTRAINT uk_oauth_identities_provider_user UNIQUE (provider, provider_user_id);


--
-- Name: oauth_identities uk_oauth_identities_user_provider; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_identities
    ADD CONSTRAINT uk_oauth_identities_user_provider UNIQUE (user_id, provider);


--
-- Name: refresh_token uk_refresh_token_device; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_token
    ADD CONSTRAINT uk_refresh_token_device UNIQUE (device_id);


--
-- Name: request uk_request_pair; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request
    ADD CONSTRAINT uk_request_pair UNIQUE (sender_id, receiver_id);


--
-- Name: reward_claim uk_reward_claim; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_claim
    ADD CONSTRAINT uk_reward_claim UNIQUE (user_id, milestone);


--
-- Name: user_building uk_user_building; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_building
    ADD CONSTRAINT uk_user_building UNIQUE (user_id, building_item_id);


--
-- Name: user_building user_building_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_building
    ADD CONSTRAINT user_building_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_uuid_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uuid_key UNIQUE (uuid);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_building_item_sort; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_building_item_sort ON public.building_item USING btree (sort_order);


--
-- Name: idx_building_item_theme; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_building_item_theme ON public.building_item USING btree (theme);


--
-- Name: idx_building_item_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_building_item_type ON public.building_item USING btree (type);


--
-- Name: idx_domain_sheet; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_domain_sheet ON public.domain USING btree (sheet_id);


--
-- Name: idx_friends_user1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_friends_user1 ON public.friends USING btree (user_id1);


--
-- Name: idx_friends_user2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_friends_user2 ON public.friends USING btree (user_id2);


--
-- Name: idx_group_request_receiver; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_group_request_receiver ON public.group_request USING btree (receiver_id);


--
-- Name: idx_groups_creator; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_groups_creator ON public.groups USING btree (creator_id);


--
-- Name: idx_groups_inven; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_groups_inven ON public.groups USING btree (inven_id);


--
-- Name: idx_groups_user1; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_groups_user1 ON public.groups USING btree (user_id1);


--
-- Name: idx_groups_user2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_groups_user2 ON public.groups USING btree (user_id2);


--
-- Name: idx_groups_user3; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_groups_user3 ON public.groups USING btree (user_id3);


--
-- Name: idx_item_spot_inven; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_item_spot_inven ON public.item_spot USING btree (inven_id);


--
-- Name: idx_likes_sheet; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_likes_sheet ON public.likes USING btree (sheet_id);


--
-- Name: idx_oauth_identities_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_oauth_identities_user ON public.oauth_identities USING btree (user_id);


--
-- Name: idx_refresh_token_token; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_token_token ON public.refresh_token USING btree (token);


--
-- Name: idx_refresh_token_uuid; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_refresh_token_uuid ON public.refresh_token USING btree (uuid);


--
-- Name: idx_reward_claim_item_claim; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reward_claim_item_claim ON public.reward_claim_item USING btree (reward_claim_id);


--
-- Name: idx_reward_claim_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reward_claim_user ON public.reward_claim USING btree (user_id);


--
-- Name: idx_sheet_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sheet_user ON public.sheet USING btree (user_id);


--
-- Name: idx_subject_domain; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subject_domain ON public.subject USING btree (domain_id);


--
-- Name: idx_subject_log_subject; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subject_log_subject ON public.subject_log USING btree (subject_id);


--
-- Name: idx_subject_log_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subject_log_user ON public.subject_log USING btree (user_id);


--
-- Name: idx_subject_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_subject_user ON public.subject USING btree (user_id);


--
-- Name: idx_user_building_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_building_user ON public.user_building USING btree (user_id);


--
-- Name: idx_user_village_sheet; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_user_village_sheet ON public.user_village USING btree (sheet_id);


--
-- Name: domain fk_domain_sheet; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.domain
    ADD CONSTRAINT fk_domain_sheet FOREIGN KEY (sheet_id) REFERENCES public.sheet(id) ON DELETE CASCADE;


--
-- Name: friends fk_friends_user1; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT fk_friends_user1 FOREIGN KEY (user_id1) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: friends fk_friends_user2; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT fk_friends_user2 FOREIGN KEY (user_id2) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: item_spot fk_item_spot_inven; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item_spot
    ADD CONSTRAINT fk_item_spot_inven FOREIGN KEY (inven_id) REFERENCES public.user_building(id) ON DELETE SET NULL;


--
-- Name: item_spot fk_item_spot_sheet; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.item_spot
    ADD CONSTRAINT fk_item_spot_sheet FOREIGN KEY (sheet_id) REFERENCES public.sheet(id) ON DELETE CASCADE;


--
-- Name: likes fk_likes_sheet; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT fk_likes_sheet FOREIGN KEY (sheet_id) REFERENCES public.sheet(id) ON DELETE CASCADE;


--
-- Name: likes fk_likes_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.likes
    ADD CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: oauth_identities fk_oauth_identities_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.oauth_identities
    ADD CONSTRAINT fk_oauth_identities_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: request fk_request_receiver; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request
    ADD CONSTRAINT fk_request_receiver FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: request fk_request_sender; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.request
    ADD CONSTRAINT fk_request_sender FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: reward_claim_item fk_reward_claim_item_building; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_claim_item
    ADD CONSTRAINT fk_reward_claim_item_building FOREIGN KEY (building_item_id) REFERENCES public.building_item(id) ON DELETE CASCADE;


--
-- Name: reward_claim_item fk_reward_claim_item_claim; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_claim_item
    ADD CONSTRAINT fk_reward_claim_item_claim FOREIGN KEY (reward_claim_id) REFERENCES public.reward_claim(id) ON DELETE CASCADE;


--
-- Name: reward_claim fk_reward_claim_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.reward_claim
    ADD CONSTRAINT fk_reward_claim_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: sheet fk_sheet_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sheet
    ADD CONSTRAINT fk_sheet_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subject fk_subject_domain; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subject
    ADD CONSTRAINT fk_subject_domain FOREIGN KEY (domain_id) REFERENCES public.domain(id) ON DELETE CASCADE;


--
-- Name: subject_log fk_subject_log_subject; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subject_log
    ADD CONSTRAINT fk_subject_log_subject FOREIGN KEY (subject_id) REFERENCES public.subject(id) ON DELETE CASCADE;


--
-- Name: subject_log fk_subject_log_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subject_log
    ADD CONSTRAINT fk_subject_log_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: subject fk_subject_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subject
    ADD CONSTRAINT fk_subject_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_building fk_user_building_item; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_building
    ADD CONSTRAINT fk_user_building_item FOREIGN KEY (building_item_id) REFERENCES public.building_item(id) ON DELETE CASCADE;


--
-- Name: user_building fk_user_building_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_building
    ADD CONSTRAINT fk_user_building_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_village fk_user_village_sheet; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_village
    ADD CONSTRAINT fk_user_village_sheet FOREIGN KEY (sheet_id) REFERENCES public.sheet(id) ON DELETE CASCADE;


--
-- Name: user_village fk_user_village_user; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_village
    ADD CONSTRAINT fk_user_village_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: group_request group_request_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_request
    ADD CONSTRAINT group_request_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- Name: group_request group_request_group_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_request
    ADD CONSTRAINT group_request_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;


--
-- Name: group_request group_request_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_request
    ADD CONSTRAINT group_request_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id);


--
-- Name: group_sheet group_sheet_domain_id1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_sheet
    ADD CONSTRAINT group_sheet_domain_id1_fkey FOREIGN KEY (domain_id1) REFERENCES public.domain(id) ON DELETE SET NULL;


--
-- Name: group_sheet group_sheet_domain_id2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_sheet
    ADD CONSTRAINT group_sheet_domain_id2_fkey FOREIGN KEY (domain_id2) REFERENCES public.domain(id) ON DELETE SET NULL;


--
-- Name: group_sheet group_sheet_domain_id3_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_sheet
    ADD CONSTRAINT group_sheet_domain_id3_fkey FOREIGN KEY (domain_id3) REFERENCES public.domain(id) ON DELETE SET NULL;


--
-- Name: group_sheet group_sheet_domain_id4_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_sheet
    ADD CONSTRAINT group_sheet_domain_id4_fkey FOREIGN KEY (domain_id4) REFERENCES public.domain(id) ON DELETE SET NULL;


--
-- Name: group_sheet group_sheet_domain_id5_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_sheet
    ADD CONSTRAINT group_sheet_domain_id5_fkey FOREIGN KEY (domain_id5) REFERENCES public.domain(id) ON DELETE SET NULL;


--
-- Name: group_sheet group_sheet_domain_id6_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_sheet
    ADD CONSTRAINT group_sheet_domain_id6_fkey FOREIGN KEY (domain_id6) REFERENCES public.domain(id) ON DELETE SET NULL;


--
-- Name: group_sheet group_sheet_domain_id7_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_sheet
    ADD CONSTRAINT group_sheet_domain_id7_fkey FOREIGN KEY (domain_id7) REFERENCES public.domain(id) ON DELETE SET NULL;


--
-- Name: group_sheet group_sheet_domain_id8_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.group_sheet
    ADD CONSTRAINT group_sheet_domain_id8_fkey FOREIGN KEY (domain_id8) REFERENCES public.domain(id) ON DELETE SET NULL;


--
-- Name: groups groups_creator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.users(id);


--
-- Name: groups groups_group_sheet_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_group_sheet_id_fkey FOREIGN KEY (group_sheet_id) REFERENCES public.group_sheet(id);


--
-- Name: groups groups_inven_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_inven_id_fkey FOREIGN KEY (inven_id) REFERENCES public.user_building(id) ON DELETE SET NULL;


--
-- Name: groups groups_user_id1_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_user_id1_fkey FOREIGN KEY (user_id1) REFERENCES public.users(id);


--
-- Name: groups groups_user_id2_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_user_id2_fkey FOREIGN KEY (user_id2) REFERENCES public.users(id);


--
-- Name: groups groups_user_id3_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.groups
    ADD CONSTRAINT groups_user_id3_fkey FOREIGN KEY (user_id3) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict TwlIJn7NJcv51JC4uFukd7T8ddJ1QP7NNYPtx8dVymFCXmPp2lI2x2zLCJvBdry

