# Acceptance Pack #РЕКЛ V0.51

**Приёмочный пакет сервиса рекламаций HomoNet**

Источник: `260611-Acceptance-Pack-REKL-V0.51-2.docx`

## Тестовые роли и сущности

| Тег | Роль |
|---|---|
| Subject A | Заявитель |
| Subject B | Ответчик |
| Subject C | Координатор |
| Subject D | Уполномоченный |
| Subject E | Супервизор |
| Community K | Сообщество |
| Thanka T | Тханка |

## Acceptance Scenarios (сокращённый список)

### AC-REKL-01 Создание рекламации
**Given** Subject A и Thanka T существуют. **When** Subject A создает рекламацию на Thanka T. **Then** создаётся `reclamation`, `participant(claimant)`, `event(created)`, статус `registered`.

### AC-REKL-02 Назначение ответственного
**Given** рекламация зарегистрирована. **When** система определяет владельца дерева. **Then** заполняется `current_responsible_subject_id`, создаётся событие `responsible_assigned`.

### AC-REKL-03 Принятие к рассмотрению
**Given** рекламация зарегистрирована. **When** координатор принимает её. **Then** переход `registered → accepted`, создаётся событие.

### AC-REKL-04 Добавление пояснения
**Given** рекламация в рассмотрении. **When** участник добавляет сообщение. **Then** запись в `reclamation_message`, событие.

### AC-REKL-05 Официальный ответ ответчика
**Given** рекламация в рассмотрении. **When** ответчик даёт ответ (accept/reject/explain). **Then** запись в `reclamation_response`, событие.

### AC-REKL-06 Принятие решения
**Given** рекламация в рассмотрении. **When** ответственный принимает решение с обоснованием. **Then** запись в `reclamation_decision`, событие. **Решение неизменяемо**.

### AC-REKL-07 Эскалация
**Given** ответственный не может/не хочет решать. **When** создаётся эскалация уровня `from_level → to_level`. **Then** `to_level > from_level`, `current_responsible_subject_id` обновляется, статус `escalated`, событие.

### AC-REKL-08 Автоматическая рекламация (контекст)
**Given** активно правило `THANKA_IN_FOREIGN_TREE`. **When** создаётся тханка в чужом дереве. **Then** система создаёт `reclamation(source_type=auto, type=context)`, `context_trigger`, событие `auto_created`.

### AC-REKL-09 Закрытие
**Given** рекламация в `resolved`. **When** координатор закрывает. **Then** статус `closed`, дальнейшие изменения запрещены.

### AC-REKL-10 Отзыв
**Given** рекламация в `registered/accepted`. **When** заявитель отзывает. **Then** статус `cancelled`, событие.

## Инварианты (INV-01..INV-10)

| Инвариант | Описание |
|---|---|
| INV-01 | Каждая рекламация имеет заявителя (`created_by_subject_id`) |
| INV-02 | Каждая рекламация имеет ответственного (`current_responsible_subject_id`) |
| INV-03 | Все события append-only, `reclamation_event` не редактируется |
| INV-04 | Ответчик определён либо через `respondent_subject_id`, либо через владельца `target` |
| INV-05 | В `reclamation_participant` UNIQUE (reclamation_id, subject_id, role) |
| INV-06 | Эскалация: `to_level > from_level` |
| INV-07 | **Решения неизменяемы** после создания |
| INV-08 | Переходы статусов ограничены (см. state machine) |
| INV-09 | Закрытая рекламация не удаляется — только архивируется |
| INV-10 | Автоматические рекламации всегда имеют `source_type = auto` и связь с `context_trigger` |

## PASS-критерии MVP

Система считается принятой, если:
- рекламация создаётся;
- назначается ответственный;
- переписка сохраняется;
- решение фиксируется;
- эскалация работает;
- аудит сохраняется;
- рекламация не удаляется;
- закрытая рекламация доступна для просмотра;
- автоматическая рекламация по правилу `THANKA_IN_FOREIGN_TREE` создаётся.
