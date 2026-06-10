# Углы (Elements) тханки

Возврат функционала «углов» по канону V0.51 (KOGI.Metody / PERVYI-RELIZ /
DDL).

## Канон

- **VisibleElements** (`%Boolean`) — флаг «показывать ли углы», per-тханка.
  Хранится в `cogobject.current_content.visible_elements`.
  Уже обрабатывается в `local_adapter.py:_h_get_thanka` (поле `Thanka.VisibleElements`)
  и в `_build_content` (запись из фронта).
- **GetElements(Id)** — собирает 4 угла тханки (KOGI.Metody:624).
- **SetElements(Elements, Id)** — устанавливает 4 угла (KOGI.Metody:669).
- **4 константы** (Область SOC, Cogi): LeftUp / RightUp / LeftBottom / RightBottom
  (PERVYI-RELIZ:437).

## Хранение

Источник правды — `homonet.thanka_link` + `homonet.link_type`
(DDL V0.51, `260423-DDL-V051-14.txt:893-907`).

- `link_type` сидируется миграцией
  `docs/db/migrations/2026_06_10_corners_link_type.sql`:
  - `corner_left_up`     → «Левый верхний угол»
  - `corner_right_up`    → «Правый верхний угол»
  - `corner_left_bottom` → «Левый нижний угол»
  - `corner_right_bottom`→ «Правый нижний угол»
- Угол тханки = ряд в `thanka_link`:
  `left_thanka_id = <родительская тханка>`,
  `right_thanka_id = <угловая тханка>`,
  `link_type_id = <id одного из 4 corner-кодов>`.

## API адаптера

### `GetThanka` (расширен)
В ответе на `GetThanka` поле `Elements` теперь содержит ровно 4 объекта
в порядке `LeftUp, RightUp, LeftBottom, RightBottom`. Ненастроенные позиции —
заглушки с `ID=""`:

```json
{
  "Elements": {
    "RegisteredObject": [
      { "ID": "<uuid>", "Name": "§ЛЮДИ", "Annotation": "...", "Image": 1 },
      { "ID": "",       "Name": "",       "Annotation": "",    "Image": 0 },
      { "ID": "",       "Name": "",       "Annotation": "",    "Image": 0 },
      { "ID": "",       "Name": "",       "Annotation": "",    "Image": 0 }
    ]
  }
}
```

### `SetElements(Id, Elements)` (новый)
Параметры:
- `Id` — `uuid` родительской тханки.
- `Elements` — массив длиной до 4. Каждый элемент: `{ "ID": "<uuid|"">" }`.
  Пустой `ID` = угол очищен (привязка удаляется).
  Массив дополняется/обрезается до 4, порядок строго
  `LeftUp, RightUp, LeftBottom, RightBottom`.

Транзакция идемпотентна: для каждого corner-кода сначала
`DELETE` по `(parent, link_type_id)`, затем `INSERT` при непустом `right_id`.

## Frontend контракт

`frontends/cogitor-ui/src/components/Iconostas/Canvas.jsx`:
- Координаты углов (`coord[]`, lines 22–26) **строго соответствуют**
  порядку `_CORNER_CODES` в бэке. Не менять одно без другого.
- `generateShapes()` пропускает заглушки (`ID===""`): ненастроенные углы
  не отрисовываются (канон cogi.teka.ru).
- `onClick` игнорирует клик в пустой угол (см. защиту по `.ID`).

## Применение миграции

```bash
sudo -u postgres env DATABASE_URL='postgresql:///homonet_v051_test?user=postgres' \
  psql -f docs/db/migrations/2026_06_10_corners_link_type.sql
```

Идемпотентно (`ON CONFLICT (code) DO NOTHING`) — безопасно гонять повторно.
