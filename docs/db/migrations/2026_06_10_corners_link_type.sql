-- 2026-06-10 — Возврат функционала «углы» (Elements) на тханке.
--
-- Канон V0.51 (260423-DDL-V051-14, KOGI.Metody_V1-10, PERVYI-RELIZ.-DOKUMENTATsIIa_V4-11):
--   * угол тханки = ссылка на другую тханку через `thanka_link`
--     (left_thanka_id = родительская тханка, right_thanka_id = угловая тханка,
--      link_type_id = ссылка на link_type с одним из 4 corner-кодов).
--   * Видимость углов хранится в cogobject.current_content.visible_elements
--     (поле уже работает: см. local_adapter.py).
--   * 4 константы (Область SOC, Cogi): LeftUp / LeftBottom / RightUp / RightBottom.
--
-- Базовые таблицы link_type и thanka_link описаны в docs/db/base/homonet_ddl.sql:746-761.
-- На некоторых стендах базовый DDL накатан не полностью, поэтому здесь
-- ИДЕМПОТЕНТНО создаём их сами (CREATE TABLE IF NOT EXISTS), а потом сидируем
-- 4 corner-кода. Если таблицы уже есть с данными — IF NOT EXISTS ничего не трогает,
-- ON CONFLICT (code) DO NOTHING — не дублирует сид.

BEGIN;

SET search_path TO homonet, public;

-- 1. Базовые таблицы (повторение канона DDL V0.51).
CREATE TABLE IF NOT EXISTS link_type (
    link_type_id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code                    text NOT NULL UNIQUE,
    name                    text NOT NULL,
    CHECK (code <> ''),
    CHECK (name <> '')
);

CREATE TABLE IF NOT EXISTS thanka_link (
    thanka_link_id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    left_thanka_id          uuid NOT NULL REFERENCES thanka(thanka_id) ON DELETE CASCADE,
    right_thanka_id         uuid NOT NULL REFERENCES thanka(thanka_id) ON DELETE CASCADE,
    link_type_id            uuid NOT NULL REFERENCES link_type(link_type_id) ON DELETE RESTRICT,
    created_at              timestamptz NOT NULL DEFAULT now(),
    CHECK (left_thanka_id <> right_thanka_id)
);

-- Индексы для быстрого поиска углов тханки (parent → углы) и обратных ссылок.
-- Канон V0.51 не прописывает индексы прямо — но при росте таблицы они обязательны,
-- иначе _corner_elements_for деградирует в seq scan.
CREATE INDEX IF NOT EXISTS thanka_link_left_idx
    ON thanka_link (left_thanka_id, link_type_id);
CREATE INDEX IF NOT EXISTS thanka_link_right_idx
    ON thanka_link (right_thanka_id);

-- 2. Сид 4 corner-кодов (canonical имена из PERVYI-RELIZ §«углы»).
INSERT INTO link_type (code, name) VALUES
    ('corner_left_up',     'Левый верхний угол'),
    ('corner_right_up',    'Правый верхний угол'),
    ('corner_left_bottom', 'Левый нижний угол'),
    ('corner_right_bottom','Правый нижний угол')
ON CONFLICT (code) DO NOTHING;

-- 3. GRANTы: link_type и thanka_link обслуживает homonet_app_auth
-- (SELECT/INSERT/UPDATE — DELETE для очистки угла тоже нужен,
-- т.к. SetElements чистит привязки).
-- Идемпотентно — GRANT на уже выданное право не падает.
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'homonet_app_auth') THEN
        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON link_type TO homonet_app_auth';
        EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON thanka_link TO homonet_app_auth';
    END IF;
END $$;

COMMIT;
