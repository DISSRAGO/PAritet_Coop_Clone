# static-data

Дефолтные статические файлы, копируемые в `$COGI_DATA_DIR` (`/srv/clone/data/`)
при старте сервера через `infra/scripts/start_cogiteka_hybrid.sh`.

Копирование идёт неразрушительно: файлы переносятся только если в целевой
папке их ещё нет. Чтобы пересоздать — удалите файл в `$COGI_DATA_DIR` и
перезапустите бэкенд.

## Файлы

- **unfound.jpg** (350×350) — заглушка для центрального превью тханки
  (Iconostas/Canvas/Mindmap), когда у тханки нет своего изображения
  (`image_flag()` вернул 0).
- **empty.jpg** (50×50) — мини-заглушка для таблиц/списков (TableInterface,
  TableList, ContentList, CogObject и др.).

## Почему так

Фронт (`Canvas.jsx`, `Mindmap.jsx`, Table/*, Viewer/*) ссылается на
`DIRPATH + '/unfound.jpg'` и `DIRPATH + '/empty.jpg'`, где
`DIRPATH = '/data'` (`frontends/cogitor-ui/src/utils/url.js`). Бэкенд
монтирует `/data → $COGI_DATA_DIR` через `StaticFiles`. Без этих файлов
получаем 404 и "дыру" в круге.

Поведение совпадает с легаси Cogiteka: PHP-функция `image_flag()` возвращала
1 если есть `image{ID}.jpg`, иначе 0, и UI подставлял заглушку.

## Канон V0.51

В SRS/ER/DDL/OpenAPI понятий `unfound.jpg` / `empty.jpg` / `image_flag` нет —
это деталь реализации UI, унаследованная от Cogiteka. Канонические превью
тханок (если будут) должны храниться в `cogobject.current_content` (jsonb)
или через `file_ref`.
