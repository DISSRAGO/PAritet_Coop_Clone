-- 2026-06-10 — Сидируем link_type для «углов» тханки (Elements).
--
-- Канон V0.51 (260423-DDL-V051-14, KOGI.Metody_V1-10, PERVYI-RELIZ.-DOKUMENTATsIIa_V4-11):
--   * угол тханки = ссылка на другую тханку через `thanka_link`
--     (left_thanka_id = родительская тханка, right_thanka_id = угловая тханка,
--      link_type_id = ссылка на link_type с одним из 4 corner-кодов).
--   * Видимость углов хранится в cogobject.current_content.visible_elements
--     (поле уже работает: см. local_adapter.py).
--   * 4 константы (Область SOC, Cogi): LeftUp / LeftBottom / RightUp / RightBottom.
--
-- Таблицы link_type и thanka_link уже существуют в БД (DDL V0.51, строки 893–907 справочника).
-- Здесь только сидируем 4 типа ссылок для углов. Идемпотентно
-- (ON CONFLICT по уникальному code).

BEGIN;

SET search_path TO homonet, public;

INSERT INTO link_type (code, name) VALUES
    ('corner_left_up',     'Левый верхний угол'),
    ('corner_right_up',    'Правый верхний угол'),
    ('corner_left_bottom', 'Левый нижний угол'),
    ('corner_right_bottom','Правый нижний угол')
ON CONFLICT (code) DO NOTHING;

COMMIT;
