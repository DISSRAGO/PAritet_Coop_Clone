# DDL Patch #РЕКЛ V0.51

Источник: `260611-DDL-Patch-REKL-V0.51-3.docx`

## Миграция

Полный DDL Patch применяется как **одна миграция** одним файлом:

**Файл**: [`../db/migrations/2026_06_15_rekl_v051.sql`](../db/migrations/2026_06_15_rekl_v051.sql)

## Как применить

```bash
psql -U homonet_app_auth -d homonet_v051_test -f docs/db/migrations/2026_06_15_rekl_v051.sql
```

Или через контейнер БД, аналогично прочим миграциям.

## Состав патча

**13 ENUM-типов**:
1. `reclamation_type_enum` (content/context/behavior/transaction/governance/system)
2. `reclamation_source_type_enum` (user/auto/moderator/system/appeal)
3. `reclamation_status_enum` (draft/registered/accepted/in_review/waiting_response/resolved/escalated/closed/cancelled)
4. `reclamation_priority_enum` (low/normal/high/critical)
5. `reclamation_participant_role_enum` (claimant/respondent/responsible/moderator/observer/mediator/guarantor)
6. `reclamation_message_type_enum` (comment/explanation/inquiry/notice/mediation/system)
7. `reclamation_response_type_enum` (accept/reject/explain/apologize/counter/respond/withdraw)
8. `reclamation_decision_type_enum` (dismiss/warn/restrict/move/archive/hide/refund/compensate/escalate/revoke_role/insurance/vote/veche/other)
9. `reclamation_action_type_enum` (move/archive/hide/restrict/publish/refund/compensate/notify/revoke_role/reassign_owner/create_insurance_case/create_vote/create_veche_case/other)
10. `reclamation_escalation_reason_enum` (timeout/refusal/conflict_of_interest/severity/explicit_request/appeal/auto_rule)
11. `reclamation_event_type_enum` (~20 значений: created/registered/accepted/responsible_assigned/decision_made/escalated/…)
12. `reclamation_context_rule_scope_enum` (own_tree/community_tree/chat/deal/process/site/global)
13. `reclamation_context_rule_severity_enum` (info/normal/high/critical)

**12 таблиц** + 1 представление:
- `reclamation` (главная карточка)
- `reclamation_participant`
- `reclamation_message`
- `reclamation_attachment`
- `reclamation_response`
- `reclamation_decision`
- `reclamation_action`
- `reclamation_escalation`
- `reclamation_event` (append-only)
- `reclamation_context_rule`
- `reclamation_context_trigger`
- `reclamation_guarantee_link`
- `reclamation_insurance_case`
- **view** `v_reclamation_inbox` — для панели

## Идемпотентность

- Все `CREATE TYPE` обёрнуты в `DO $$ BEGIN … EXCEPTION WHEN duplicate_object THEN null; END $$;`
- Все `CREATE TABLE` используют `IF NOT EXISTS`.
- Индексы создаются `CREATE INDEX IF NOT EXISTS`.
- Патч можно применять повторно без побочных эффектов.

## Зависимости

Патч требует существование таблиц в схеме `homonet`:
- `subject`
- `community`
- `process`
- `deal`
- `conflict`
- `file_ref`
- `decision`

Все они уже есть в `docs/db/base/homonet_ddl.sql`.

## Индексы

DDL создаёт индексы по ключевым фильтрам панели рекламаций:
- `status`, `reclamation_type`, `priority`
- `created_by_subject_id`, `current_responsible_subject_id`, `respondent_subject_id`
- `target_type + target_id`
- `community_id`, `process_id`, `deal_id`
- `created_at DESC`

Это покрывает MVP-запросы: inbox, outbox, my-targets, escalated, archive.
