# ER-модель сервиса #РЕКЛ V0.51

Источник: `260611-ER-model-servisa-REKL-V0.51-4.docx`

## Ядро

```
Subject (V0.51)
   │
   ├── Reclamation                    — карточка рекламации
   │       │
   │       ├── ReclamationParticipant  — участники (заявитель/ответчик/ответственный/наблюдатель)
   │       ├── ReclamationMessage      — переписка (комментарии/пояснения)
   │       ├── ReclamationAttachment   — вложения (file_ref)
   │       ├── ReclamationResponse     — официальные ответы (respond/explain/accept/reject)
   │       ├── ReclamationDecision     — решения (неизменяемые)
   │       ├── ReclamationAction       — исполнительные действия
   │       ├── ReclamationEscalation   — эскалации
   │       └── ReclamationEvent        — журнал (append-only)
```

## Внешние связи

Рекламация может ссылаться на любой из объектов HomoNet через `target_type + target_id`:
- **thanka** (#КОГИ)
- **cogobject** (#КОГИ)
- **comment** (#КОГИ)
- **post** (#КОГИ)
- **chat** (#КОГИ)
- **process** (#ДЕЛО)
- **outcome** (#ДЕЛО)
- **contribution** (#ДЕЛО)
- **account** (#СЧЕТ)
- **transaction** (#СЧЕТ)
- **subject** (сам субъект — для поведенческих)
- **decision** (#ГЛАС — для организационных)

## Контекстный контроль

```
ReclamationContextRule    — правила («тханка в чужом дереве» и т.п.)
       ↓
ReclamationContextTrigger — срабатывания правил
       ↓
Reclamation               — автоматически создаётся при триггере
```

## Поручительство и страхование

```
Reclamation
   ├── ReclamationGuaranteeLink   — связь с поручителями (#ДЕПО)
   └── ReclamationInsuranceCase   — страховой случай (#СТРХ)
```

## Ключевые инварианты модели

- Ответственный субъект всегда есть (`current_responsible_subject_id`).
- События append-only (`reclamation_event`).
- Решения неизменяемы (INV-07).
- Закрытая рекламация не удаляется (INV-09) — только архивируется.
- `to_level > from_level` при эскалации.
- В `reclamation_participant` UNIQUE(reclamation_id, subject_id, role).

## Список таблиц (12)

1. `reclamation`
2. `reclamation_participant`
3. `reclamation_message`
4. `reclamation_attachment`
5. `reclamation_response`
6. `reclamation_decision`
7. `reclamation_action`
8. `reclamation_escalation`
9. `reclamation_event`
10. `reclamation_context_rule`
11. `reclamation_context_trigger`
12. `reclamation_guarantee_link`
13. `reclamation_insurance_case`

Плюс представление `v_reclamation_inbox`.

## Зависимости от базового DDL

Все FK-таблицы уже присутствуют в `docs/db/base/homonet_ddl.sql`:
- `subject` (строка 266)
- `community` (строка 292)
- `process` (строка 373)
- `deal` (строка 509)
- `conflict` (строка 574)
- `file_ref` (строка 818)
