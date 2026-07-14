# Use Cases #РЕКЛ V0.51

Источник: `260611-Use-Case-Catalogue-Servis-REKL-V0.51-7.docx`

## Каталог UC-REKL

| UC | Название | API | DB |
|---|---|---|---|
| UC-REKL-01 | Создать рекламацию | POST /reclamations | reclamation, participant, event |
| UC-REKL-02 | Просмотреть рекламацию | GET /reclamations/{id} | reclamation + child |
| UC-REKL-03 | Принять рекламацию к рассмотрению | POST /accept | reclamation, event |
| UC-REKL-04 | Назначить ответственного | POST /assign | reclamation, event |
| UC-REKL-05 | Добавить пояснение | POST /messages | reclamation_message |
| UC-REKL-06 | Добавить доказательство | POST /attachments | reclamation_attachment |
| UC-REKL-07 | Дать официальный ответ | POST /responses | reclamation_response |
| UC-REKL-08 | Принять решение | POST /decisions | reclamation_decision |
| UC-REKL-09 | Создать исполнительное действие | POST /actions | reclamation_action |
| UC-REKL-10 | Исполнить решение | POST /actions/{id}/perform | action |
| UC-REKL-11 | Эскалировать рекламацию | POST /escalate | reclamation_escalation |
| UC-REKL-12 | Отозвать рекламацию | POST /withdraw | reclamation |
| UC-REKL-13 | Передать на голосование | POST /decisions (vote) | decision |
| UC-REKL-14 | Передать на Вече | POST /decisions (veche) | decision |
| UC-REKL-15 | Создать поручительскую проверку | POST /guarantee-links | guarantee_link |
| UC-REKL-16 | Создать страховой случай | POST /insurance-case | insurance_case |
| UC-REKL-17 | Закрыть рекламацию | POST /close | reclamation |
| UC-REKL-18 | **Автоматическая рекламация по контексту** | POST /context-triggers | context_trigger, reclamation |
| UC-REKL-19 | Модерация контента (перемещение/скрытие) | POST /decisions + /actions | decision, action |
| UC-REKL-20 | Апелляция / повторная эскалация | POST /escalate | escalation |

## UC-REKL-18 — ключевой сценарий V0.51 (автоматика)

**Правило `THANKA_IN_FOREIGN_TREE`** — тханка создана в чужом дереве.

Триггер:
1. При создании тханки backend/#КОГИ проверяет: `тханка.tree_owner_subject_id != тханка.author_subject_id`.
2. Если условие выполнено — вызывает `POST /api/v051/rekl/context-triggers` с `context_rule_id` правила `THANKA_IN_FOREIGN_TREE`, `create_reclamation=true`.
3. Сервис #РЕКЛ создаёт рекламацию:
   - `source_type = auto`
   - `reclamation_type = context`
   - `target_type = thanka`, `target_id = тханка.id`
   - `respondent_subject_id = тханка.author_subject_id`
   - `current_responsible_subject_id = тханка.tree_owner_subject_id`
   - записывает `reclamation_event` `created` + `auto_created`.

Владелец дерева получает рекламацию во вкладку «Входящие» панели `/moderation`.

## Формула

```
VISION → Use Case → ER → DDL → API → UI
```

Именно этот пакет UC связывает архитектуру с реализацией.
