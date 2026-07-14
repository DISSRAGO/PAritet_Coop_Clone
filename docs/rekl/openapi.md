# OpenAPI #РЕКЛ V0.51

**REST API сервиса рекламаций, модерации и восстановления доверия**

Источник: `260611-OpenAPI-REKL-V0.51-5.docx`

## Базовый префикс

```
/api/v051/rekl
```

Все действия выполняются субъектом (либо человеком-представителем субъекта). Каждый write-endpoint получает или определяет `actor_subject_id`.

## Группы endpoint'ов

- **Core Reclamation** — карточка
- **Message / Response** — переписка, официальные ответы
- **Attachment** — доказательства
- **Decision / Action** — решения и исполнение
- **Escalation** — эскалация и апелляции
- **Context Control** — автоматические рекламации
- **Guarantee / Insurance** — #ДЕПО и #СТРХ
- **Moderation Panel** — фасадные endpoint'ы для UI `/moderation`

## MVP endpoints (обязательный набор для V0.51)

| Метод | URL | Use Case |
|---|---|---|
| POST | `/reclamations` | UC-REKL-01 |
| GET | `/reclamations` | UC-REKL-02 |
| GET | `/reclamations/{id}` | UC-REKL-02 |
| POST | `/reclamations/{id}/messages` | UC-REKL-05 |
| POST | `/reclamations/{id}/attachments` | UC-REKL-06 |
| POST | `/reclamations/{id}/responses` | UC-REKL-07 |
| POST | `/reclamations/{id}/decisions` | UC-REKL-08 |
| POST | `/reclamations/{id}/escalate` | UC-REKL-11 |
| POST | `/reclamations/{id}/close` | UC-REKL-17 |
| POST | `/reclamations/{id}/accept` | UC-REKL-03 |
| POST | `/reclamations/{id}/assign` | UC-REKL-04 |
| POST | `/reclamations/{id}/withdraw` | UC-REKL-12 |
| GET | `/panel/inbox` | Панель |
| GET | `/panel/outbox` | Панель |
| GET | `/panel/archive` | Панель |
| GET | `/panel/dashboard` | Панель |
| POST | `/context-triggers` | UC-REKL-18 |

## Общий формат ответа

Single object:
```json
{ "data": {}, "meta": {} }
```

List:
```json
{ "data": [], "meta": { "total": 0, "limit": 20, "offset": 0 } }
```

Error:
```json
{ "error": { "code": "validation_error", "message": "...", "details": {} } }
```

## Пример: создание рекламации

**POST /api/v051/rekl/reclamations**

```json
{
  "reclamation_type": "content",
  "source_type": "user",
  "priority": "normal",
  "created_by_subject_id": "uuid",
  "respondent_subject_id": "uuid",
  "target_type": "thanka",
  "target_id": "uuid",
  "community_id": "uuid",
  "title": "Нарушение контекста",
  "description": "Тханка размещена в чужом дереве без согласия владельца."
}
```

Response:
```json
{ "data": { "reclamation_id": "uuid", "status": "registered" } }
```

Business rules:
- `created_by_subject_id` обязателен;
- `target_type` и `target_id` обязательны;
- при создании должен быть создан `reclamation_event`;
- ответственный субъект может быть назначен автоматически.

## Пример: принять решение

**POST /api/v051/rekl/reclamations/{id}/decisions**

```json
{
  "decision_by_subject_id": "uuid",
  "decision_type": "move",
  "decision_text": "Переместить тханку в дерево автора.",
  "reason": "Объект размещен в чужом дереве без согласия владельца.",
  "effective_from": "2026-01-01T10:00:00Z",
  "is_final": false
}
```

Business rules:
- решение **неизменяемо**;
- должно иметь автора;
- должно иметь обоснование;
- после решения создается событие.

## Пример: автоматическая рекламация

**POST /api/v051/rekl/context-triggers**

```json
{
  "context_rule_id": "uuid",
  "target_type": "thanka",
  "target_id": "uuid",
  "detected_by": "system",
  "payload": {
    "tree_owner_subject_id": "uuid",
    "author_subject_id": "uuid"
  },
  "create_reclamation": true
}
```

Если `create_reclamation = true`, система создает рекламацию: `source_type = auto`, `reclamation_type = context`.

## Переходы статусов

**Разрешено**:
```
draft → registered
registered → accepted | cancelled
accepted → in_review | cancelled
in_review → waiting_response | resolved | escalated
waiting_response → in_review
escalated → in_review
resolved → closed
```

**Запрещено**:
```
closed → *
cancelled → *
```

Исключение возможно только через отдельную апелляцию или новую рекламацию.

## Коды ошибок

- `reclamation_not_found`
- `invalid_reclamation_status`
- `transition_not_allowed`
- `actor_not_allowed`
- `responsible_required`
- `target_required`
- `decision_reason_required`
- `closed_reclamation_immutable`
- `escalation_level_invalid`
- `context_rule_not_found`
- `duplicate_participant`
- `insurance_case_already_exists`

## Формула API

```
reclamation → messages → responses → decisions → actions → escalations → panel
```

Модераторская панель — **фасад** сервиса #РЕКЛ, а не отдельная система.
