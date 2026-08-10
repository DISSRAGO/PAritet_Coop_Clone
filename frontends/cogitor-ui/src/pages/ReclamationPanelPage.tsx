import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  DatePicker,
  Drawer,
  Input,
  Modal,
  Segmented,
  Select,
  Space,
  Table,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useDispatch, useSelector } from "react-redux";
import moment, { Moment } from "moment";
import type { RangeValue } from "rc-picker/lib/interface";


import {
  loadArchive,
  loadDashboard,
  loadInbox,
  loadOutbox,
} from "../store/reclamationSlice";
import ReclamationApi from "../api/reclamation";
import type {
  ReclamationStatus,
  ReclamationSummary,
} from "../models/reclamation/Reclamation";
import { Urls } from "../utils/urls";


const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { TextArea } = Input;


type PanelTab = "inbox" | "outbox" | "current" | "archive";


type PanelAction = {
  key: string;
  label: string;
  nextStatus?: ReclamationStatus;
  danger?: boolean;
  success?: boolean;
  disabled?: boolean;
};


type ChatMessage = {
  messageId: string;
  authorSubjectId: string;
  messageType: string;
  body: string;
  createdAt: string;
};


const STATUS_LABELS: Record<string, string> = {
  draft: "Черновик",
  registered: "Зарегистрировано",
  accepted: "Принято",
  in_progress: "В работе",
  waiting_response: "Ждёт ответа",
  resolved: "Решено",
  rejected: "Отказано",
  escalated: "Эскалировано",
  completed: "Завершено",
  closed: "Закрыто",
  cancelled: "Отменено",
  with_chairman: "У председателя",
};


const ARCHIVE_STATUSES = new Set<ReclamationStatus>([
  "completed",
  "closed",
  "cancelled",
]);


const NON_ARCHIVE_STATUSES: ReclamationStatus[] = (
  Object.keys(STATUS_LABELS) as ReclamationStatus[]
).filter((s) => !ARCHIVE_STATUSES.has(s));


const INBOX_EXECUTOR_STATUSES = new Set<ReclamationStatus>([
  "registered",
  "accepted",
  "in_progress",
  "waiting_response",
  "escalated",
  "with_chairman",
]);


function translateStatus(status?: string): string {
  return (
    STATUS_LABELS[String(status || "").toLowerCase()] || String(status || "—")
  );
}


function getStatusPalette(status?: string): {
  bg: string;
  border: string;
  color: string;
} {
  const map: Record<string, { bg: string; border: string; color: string }> = {
    draft: { bg: "#f5f5f5", border: "#d9d9d9", color: "#595959" },
    registered: { bg: "#e6f4ff", border: "#91caff", color: "#0958d9" },
    accepted: { bg: "#e6fffb", border: "#87e8de", color: "#08979c" },
    in_progress: { bg: "#fff7e6", border: "#ffd591", color: "#d46b08" },
    waiting_response: { bg: "#fffbe6", border: "#ffe58f", color: "#ad6800" },
    resolved: { bg: "#f6ffed", border: "#b7eb8f", color: "#389e0d" },
    rejected: { bg: "#fff2e8", border: "#ffbb96", color: "#d4380d" },
    escalated: { bg: "#fff0f6", border: "#ffadd2", color: "#c41d7f" },
    completed: { bg: "#fcffe6", border: "#d3f261", color: "#5b8c00" },
    closed: { bg: "#fafafa", border: "#d9d9d9", color: "#434343" },
    cancelled: { bg: "#fff1f0", border: "#ffa39e", color: "#cf1322" },
  };


  return (
    map[String(status || "").toLowerCase()] || {
      bg: "#fafafa",
      border: "#d9d9d9",
      color: "#434343",
    }
  );
}


function renderStatusBadge(status?: string): React.ReactNode {
  const label = translateStatus(status);
  const palette = getStatusPalette(status);


  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 116,
        padding: "4px 10px",
        borderRadius: 999,
        fontSize: 12,
        lineHeight: "18px",
        fontWeight: 500,
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        color: palette.color,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}


function isUuidLike(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value.trim()
  );
}


function resolveCurrentSubjectId(state: any): string {
  const fromHeader =
    state?.user?.headerInfo?.data?.subjectId ||
    state?.user?.headerInfo?.data?.subject_id;
  if (fromHeader) return String(fromHeader);


  const fromAuth =
    state?.auth?.user?.subjectId ||
    state?.auth?.user?.subject_id ||
    state?.auth?.user?.subject?.subjectId ||
    state?.auth?.user?.subject?.subject_id;
  if (fromAuth) return String(fromAuth);


  const fromProfile =
    state?.user?.profile?.subjectId || state?.user?.profile?.subject_id;
  if (fromProfile) return String(fromProfile);


  return "";
}


function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ru-RU");
}


function getApiBaseUrl(): string {
  const explicit =
    (Urls as any)?.RECLAMATION_API_URL ||
    (Urls as any)?.API_URL ||
    (Urls as any)?.BASE_API_URL;


  if (explicit) {
    return String(explicit).replace(/\/$/, "");
  }


  if (typeof window !== "undefined" && window.location.origin) {
    return `${window.location.origin}/api`;
  }


  return "/api";
}


type ThankaUrlInfo = {
  customUrl?: string | null;
  slug: string;
  fullUrl: string;
};


const ThankaNavigatorLink: React.FC<{ thankaId: string }> = ({ thankaId }) => {
  const [info, setInfo] = React.useState<ThankaUrlInfo | null>(null);


  React.useEffect(() => {
    let cancelled = false;


    async function load() {
      try {
        const base = getApiBaseUrl();
        const resp = await fetch(`${base}/thanka-url/${thankaId}`);
        if (!resp.ok) return;
        const json = await resp.json();
        if (cancelled) return;


        setInfo({
          customUrl: json.customUrl ?? null,
          slug: json.customUrl ? String(json.customUrl) : thankaId,
          fullUrl: String(json.fullUrl || ""),
        });
      } catch {
        if (!cancelled) {
          setInfo(null);
        }
      }
    }


    load();


    return () => {
      cancelled = true;
    };
  }, [thankaId]);


  const origin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";


  const slug = info?.customUrl ? String(info.customUrl) : thankaId;
  const path = `/navigator/${slug}`;
  const text = origin ? `${origin}${path}` : path;


  return (
    <a href={path} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
};


function renderObjectCell(item: ReclamationSummary): React.ReactNode {
  const type = String(item.targetType || "").toLowerCase();
  const id = (item.targetId || "").trim();


  if (type === "thanka" && id) {
    return <ThankaNavigatorLink thankaId={id} />;
  }


  return (
    <Text>
      {type || "object"}: {id || "—"}
    </Text>
  );
}


function filterByCreatedAtRange(
  items: ReclamationSummary[],
  range: RangeValue<Moment>
): ReclamationSummary[] {
  if (!range || !range[0] || !range[1]) {
    return items;
  }


  const from = range[0].clone().startOf("day");
  const to = range[1].clone().endOf("day");


  return items.filter((item) => {
    if (!item.createdAt) return false;
    const d = moment(item.createdAt);
    if (!d.isValid()) return false;
    return d.isSameOrAfter(from) && d.isSameOrBefore(to);
  });
}


function buildActions(
  item: ReclamationSummary,
  subjectId: string
): PanelAction[] {
  const status = String(item.status || "").toLowerCase() as ReclamationStatus;

  const effectiveClaimantId =
    item.claimantEffectiveSubjectId || item.createdBySubjectId;

  const effectiveExecutorId =
    item.currentResponsibleSubjectId ||
    item.respondentEffectiveSubjectId ||
    item.respondentSubjectId;

  const isClaimant = effectiveClaimantId === subjectId;
  const isExecutor = effectiveExecutorId === subjectId;

  // В финальном режиме председатель является одновременно claimant,
  // respondent и current responsible. Но UI показывает ему только
  // исполнительский набор действий.
  const isChairmanCase =
    isClaimant &&
    isExecutor &&
    effectiveClaimantId === effectiveExecutorId;

  const actions: PanelAction[] = [];

  if (isExecutor) {
    if (
      status === "registered" ||
      status === "escalated" ||
      status === "with_chairman"
    ) {
      actions.push({
        key: "accept",
        label: "Принять",
        nextStatus: "accepted",
        success: true,
      });
    }

    if (status === "accepted") {
      actions.push({
        key: "start",
        label: "Взять в работу",
        nextStatus: "in_progress",
        success: true,
      });
      actions.push({
        key: "reject",
        label: "Отказать",
        nextStatus: "rejected",
        danger: true,
      });
    }

    if (status === "in_progress") {
      actions.push({
        key: "resolve",
        label: "Отметить решённой",
        nextStatus: "resolved",
        success: true,
      });
      actions.push({
        key: "reject",
        label: "Отказать",
        nextStatus: "rejected",
        danger: true,
      });
      actions.push({
        key: "open_chat_wait",
        label: "Запросить уточнение",
        disabled: true,
      });
    }

    if (status === "waiting_response") {
      actions.push({
        key: "resume",
        label: "Вернуть в работу",
        nextStatus: "in_progress",
      });
      actions.push({
        key: "resolve",
        label: "Отметить решённой",
        nextStatus: "resolved",
        success: true,
      });
      actions.push({
        key: "reject",
        label: "Отказать",
        nextStatus: "rejected",
        danger: true,
      });
    }
  }

  // У председателя нет отдельного claimant-набора кнопок:
  // его решение окончательно и выполняется через исполнительские действия.
  if (isClaimant && !isChairmanCase) {
    if (
      status === "registered" ||
      status === "accepted" ||
      status === "escalated"
    ) {
      actions.push({
        key: "cancel",
        label: "Отменить",
        nextStatus: "cancelled",
        danger: true,
      });
    }

    if (status === "waiting_response") {
      actions.push({
        key: "reply_hint",
        label: "Ответить в переписке",
        disabled: true,
      });
    }

    if (status === "rejected") {
      actions.push({
        key: "escalate",
        label: "Эскалировать",
        danger: true,
      });
    }

    if (status === "resolved") {
      actions.push({
        key: "complete",
        label: "Подтвердить решение",
        nextStatus: "completed",
        success: true,
      });
      actions.push({
        key: "close",
        label: "Закрыть без подтверждения",
        nextStatus: "closed",
      });
      actions.push({
        key: "escalate",
        label: "Эскалировать",
        danger: true,
      });
    }
  }

  return actions;
}


const ReclamationPanelPage: React.FC = () => {
  const dispatch = useDispatch() as any;
  const reclamationState = useSelector((state: any) => state.reclamation || {});
  const subjectId = useSelector((state: any) => resolveCurrentSubjectId(state));
  const [currentAllLevels, setCurrentAllLevels] = useState<ReclamationSummary[]>([]);


  const inbox: ReclamationSummary[] = Array.isArray(
    reclamationState.inbox?.data
  )
    ? reclamationState.inbox.data
    : Array.isArray(reclamationState.inbox)
    ? reclamationState.inbox
    : [];


  const outbox: ReclamationSummary[] = Array.isArray(
    reclamationState.outbox?.data
  )
    ? reclamationState.outbox.data
    : Array.isArray(reclamationState.outbox)
    ? reclamationState.outbox
    : [];


  const archive: ReclamationSummary[] = Array.isArray(
    reclamationState.archive?.data
  )
    ? reclamationState.archive.data
    : Array.isArray(reclamationState.archive)
    ? reclamationState.archive
    : [];


  const dashboard = reclamationState.dashboard || null;
  const loading: boolean = reclamationState.loading === "loading";
  const stateError: string | null = reclamationState.error || null;


  const [tab, setTab] = useState<PanelTab>("inbox");
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);
  const [archiveRange, setArchiveRange] = useState<RangeValue<Moment>>(null);
  const [currentRange, setCurrentRange] = useState<RangeValue<Moment>>(null);
  const [currentStatus, setCurrentStatus] = useState<string>("");


  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatItem, setChatItem] = useState<ReclamationSummary | null>(null);
  const [chatSending, setChatSending] = useState(false);


  const subjectReady = useMemo(() => isUuidLike(subjectId), [subjectId]);


  useEffect(() => {
    if (!subjectReady || !subjectId) return;


    dispatch(loadInbox(subjectId));
    dispatch(loadOutbox(subjectId));
    dispatch(loadArchive(subjectId));
    dispatch(loadDashboard(subjectId));


    // Локальная загрузка всех уровней
    (async () => {
      try {
        const data = await ReclamationApi.getCurrentAllLevels(subjectId);
        setCurrentAllLevels(data);
      } catch (error: any) {
        // Не ломаем страницу, просто логируем
        console.error(
          "Failed to load current reclamations (all levels)",
          error?.message || error
        );
      }
    })();
  }, [dispatch, subjectId, subjectReady]);


  const allParticipating = useMemo(
    () =>
      [...inbox, ...outbox].filter(
        (item, i, arr) =>
          arr.findIndex((x) => x.reclamationId === item.reclamationId) === i
      ),
    [inbox, outbox]
  );


  const inboxExecutorItems = useMemo(
    () =>
      inbox.filter((item) =>
        INBOX_EXECUTOR_STATUSES.has(
          String(item.status || "").toLowerCase() as ReclamationStatus
        )
      ),
    [inbox]
  );


  const currentData = useMemo(() => {
    if (tab === "inbox") {
      return inboxExecutorItems;
    }
    if (tab === "outbox") return outbox;


    if (tab === "current") {
      let items = allParticipating.filter(
        (item) =>
          !ARCHIVE_STATUSES.has(
            String(item.status || "").toLowerCase() as ReclamationStatus
          )
      );


      if (currentStatus) {
        items = items.filter(
          (item) =>
            String(item.status || "").toLowerCase() === String(currentStatus)
        );
      }


      return filterByCreatedAtRange(items, currentRange);
    }


    if (tab === "archive") {
      return filterByCreatedAtRange(archive, archiveRange);
    }


    return [];
  }, [
    tab,
    inboxExecutorItems,
    outbox,
    archive,
    allParticipating,
    archiveRange,
    currentRange,
    currentStatus,
  ]);


  const refreshAll = async () => {
    if (!subjectReady || !subjectId) return;
    await Promise.all([
      dispatch(loadInbox(subjectId)),
      dispatch(loadOutbox(subjectId)),
      dispatch(loadArchive(subjectId)),
      dispatch(loadDashboard(subjectId)),
    ]);


    try {
      const data = await ReclamationApi.getCurrentAllLevels(subjectId);
      setCurrentAllLevels(data);
    } catch (error: any) {
      console.error(
        "Failed to refresh current reclamations (all levels)",
        error?.message || error
      );
    }
  };


  const openChat = async (item: ReclamationSummary) => {
    setChatItem(item);
    setChatOpen(true);
    setChatLoading(true);
    setChatError(null);
    setChatMessages([]);
    setChatInput("");


    try {
      const resp = await ReclamationApi.getById(item.reclamationId);
      const data = resp?.data || resp;
      const messages = Array.isArray(data?.messages) ? data.messages : [];
      setChatMessages(messages);


      if (subjectId && (tab === "inbox" || !!item.hasUnread || !!item.unreadCount)) {
        try {
          await ReclamationApi.markAsRead(item.reclamationId, subjectId);
          await refreshAll();
        } catch {
        }
      }
    } catch (error: any) {
      setChatError(error?.message || "Не удалось загрузить переписку");
    } finally {
      setChatLoading(false);
    }
  };


  const sendChatMessage = async () => {
    if (!chatItem || !subjectId || !chatInput.trim()) return;


    try {
      setChatSending(true);
      await ReclamationApi.createMessage(chatItem.reclamationId, {
        actorSubjectId: subjectId,
        body: chatInput.trim(),
        messageType: "comment",
        visibility: "participants",
      });


      setChatInput("");
      const resp = await ReclamationApi.getById(chatItem.reclamationId);
      const data = resp?.data || resp;
      const messages = Array.isArray(data?.messages) ? data.messages : [];
      setChatMessages(messages);
      await refreshAll();
    } catch (error: any) {
      message.error(error?.message || "Не удалось отправить сообщение");
    } finally {
      setChatSending(false);
    }
  };


  const runStatusAction = async (
    item: ReclamationSummary,
    action: PanelAction
  ) => {
    if (!subjectReady || !subjectId) {
      message.error("Не найден корректный subjectId текущего пользователя.");
      return;
    }


    if (action.key === "escalate") {
      let escalationComment = "";


      Modal.confirm({
        title: "Эскалация рекламации",
        content: (
          <>
            <div style={{ marginBottom: 8 }}>
              ID: {item.reclamationId}
            </div>
            <div style={{ marginBottom: 8 }}>
              Рекламация будет передана поручителю текущего исполнителя.
            </div>
            <TextArea
              rows={3}
              placeholder="Причина эскалации (не менее 3 символов)"
              onChange={(e) => {
                escalationComment = e.target.value;
              }}
            />
          </>
        ),
        okText: "Эскалировать",
        cancelText: "Отмена",
        okButtonProps: { danger: true },
        onOk: async () => {
          const trimmedComment = escalationComment.trim();


          if (trimmedComment.length < 3) {
            message.error("Укажите причину эскалации (минимум 3 символа)");
            return Promise.reject();
          }


          const lk = `${item.reclamationId}:escalate`;
          setActionLoadingKey(lk);
          try {
            await ReclamationApi.escalate(item.reclamationId, {
              actorSubjectId: subjectId,
              escalationReason: "manual",
              comment: trimmedComment,
            });
            message.success("Рекламация эскалирована");
            await refreshAll();
          } catch (error: any) {
            message.error(error?.message || "Не удалось эскалировать рекламацию");
          } finally {
            setActionLoadingKey(null);
          }
        },
      });


      return;
    }



    if (!action.nextStatus) {
      if (action.key === "reply_hint") {
        message.info(
          "Ответ заявителя в переписке автоматически вернёт рекламацию в работу."
        );
      }
      return;
    }


    const currentStatusValue = String(item.status || "").toLowerCase() as ReclamationStatus;
    const nextStatus = action.nextStatus;


    Modal.confirm({
      title: "Подтвердите изменение статуса",
      content: (
        <>
          <div>ID: {item.reclamationId}</div>
          <div>Текущий статус: {translateStatus(currentStatusValue)}</div>
          <div>Новый статус: {translateStatus(nextStatus)}</div>
        </>
      ),
      okText: "Подтвердить",
      cancelText: "Отмена",
      okButtonProps: { danger: !!action.danger },
      onOk: async () => {
        const lk = `${item.reclamationId}:${action.key}`;
        setActionLoadingKey(lk);
        try {
          await ReclamationApi.patchReclamation(item.reclamationId, {
            actorSubjectId: subjectId,
            status: nextStatus,
          });
          message.success(
            `Статус изменён: ${translateStatus(currentStatusValue)} → ${translateStatus(nextStatus)}`
          );
          await refreshAll();
        } catch (error: any) {
          message.error(error?.message || "Не удалось изменить статус");
        } finally {
          setActionLoadingKey(null);
        }
      },
    });
  };


  const isReadOnlyTab = tab === "archive";


  const columns: ColumnsType<ReclamationSummary> = [
    {
      title: "Тип",
      dataIndex: "reclamationType",
      key: "reclamationType",
      width: 110,
      render: (v: string) => v || "—",
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      width: 170,
      render: (v: string) => renderStatusBadge(v),
    },
    ...(!isReadOnlyTab
      ? [
          {
            title: "Действия",
            key: "actions",
            width: 300,
            render: (_: any, item: ReclamationSummary) => {
              if (!subjectReady || !subjectId) return "—";
              const actions = buildActions(item, subjectId);
              if (!actions.length) return "—";


              return (
                <Space wrap>
                  {actions.map((action) => {
                    const lk = `${item.reclamationId}:${action.key}`;
                    return (
                      <Button
                        key={action.key}
                        size="small"
                        type={action.success ? "primary" : "default"}
                        danger={action.danger}
                        disabled={action.disabled}
                        loading={actionLoadingKey === lk}
                        onClick={() => runStatusAction(item, action)}
                      >
                        {action.label}
                      </Button>
                    );
                  })}
                </Space>
              );
            },
          },
        ]
      : []),
    {
      title: "Приоритет",
      dataIndex: "priority",
      key: "priority",
      width: 105,
      render: (v: string) => v || "—",
    },
    {
      title: "Заголовок",
      dataIndex: "title",
      key: "title",
      render: (v: string, item: ReclamationSummary) => (
        <Button
          type="link"
          style={{ paddingInline: 0 }}
          onClick={() => openChat(item)}
        >
          {item.unreadCount ? (
            <Badge count={item.unreadCount} size="small" offset={[8, 0]}>
              <span>{v || "—"}</span>
            </Badge>
          ) : (
            v || "—"
          )}
        </Button>
      ),
    },
    {
      title: "Объект",
      key: "object",
      width: 260,
      render: (_: any, item: ReclamationSummary) => renderObjectCell(item),
    },
    {
      title: "Создано",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 165,
      render: (v: string) => formatDate(v),
    },
  ];


  if (!subjectReady || !subjectId) {
    return (
      <div>
        <Title level={2}>Рекламации</Title>
        <Alert
          type="warning"
          message="Не найден корректный subjectId текущего пользователя"
          showIcon
        />
      </div>
    );
  }


  const currentCount = allParticipating.filter(
    (item) =>
      !ARCHIVE_STATUSES.has(
        String(item.status || "").toLowerCase() as ReclamationStatus
      )
  ).length;


  const segmentedOptions = [
    {
      label: `Входящие${
        inboxExecutorItems.length ? ` · ${inboxExecutorItems.length}` : ""
      }`,
      value: "inbox" as PanelTab,
    },
    {
      label: `Исходящие${outbox.length ? ` · ${outbox.length}` : ""}`,
      value: "outbox" as PanelTab,
    },
    {
      label: `Текущие${currentCount ? ` · ${currentCount}` : ""}`,
      value: "current" as PanelTab,
    },
    {
      label: `Архив${archive.length ? ` · ${archive.length}` : ""}`,
      value: "archive" as PanelTab,
    },
  ];


  return (
    <div>
      <Title level={2}>Рекламации</Title>


      {stateError && (
        <Alert
          type="error"
          message={stateError}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}


      <Segmented
        value={tab}
        onChange={(value) => setTab(value as PanelTab)}
        options={segmentedOptions}
        style={{ marginBottom: 16 }}
      />


      {tab === "current" && (
        <Space style={{ marginBottom: 16 }} wrap>
          <RangePicker
            value={currentRange}
            onChange={(values) => setCurrentRange(values)}
            allowClear
          />
          <Select
            value={currentStatus || undefined}
            onChange={(value) =>
              setCurrentStatus((value as ReclamationStatus) || "")
            }
            allowClear
            placeholder="Фильтр по статусу"
            style={{ minWidth: 220 }}
            options={NON_ARCHIVE_STATUSES.map((s) => ({
              value: s,
              label: translateStatus(s),
            }))}
          />
        </Space>
      )}


      {tab === "archive" && (
        <Space style={{ marginBottom: 16 }} wrap>
          <RangePicker
            value={archiveRange}
            onChange={(values) => setArchiveRange(values)}
            allowClear
          />
          {!archiveRange && <Text type="secondary">Выберите период</Text>}
        </Space>
      )}


      <Table<ReclamationSummary>
        rowKey="reclamationId"
        columns={columns}
        dataSource={currentData}
        loading={loading}
        pagination={{ pageSize: 10, hideOnSinglePage: false }}
        scroll={{ x: 1100 }}
      />


      <Drawer
        title={
          chatItem
            ? `Переписка: ${chatItem.title || chatItem.reclamationId}`
            : "Переписка"
        }
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        width={520}
      >
        {chatLoading ? (
          <Text>Загрузка переписки…</Text>
        ) : chatError ? (
          <Alert type="error" message={chatError} showIcon />
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 16,
                maxHeight: "55vh",
                overflowY: "auto",
              }}
            >
              {chatMessages.length === 0 && (
                <Text type="secondary">Сообщений пока нет.</Text>
              )}


              {chatMessages.map((m) => {
                const isMine = m.authorSubjectId === subjectId;
                const isSystem = m.messageType === "system_note";


                return (
                  <div
                    key={m.messageId}
                    style={{
                      alignSelf: isMine ? "flex-end" : "flex-start",
                      maxWidth: "85%",
                      background: isSystem
                        ? "#fafafa"
                        : isMine
                        ? "#e6f4ff"
                        : "#f5f5f5",
                      border: "1px solid #f0f0f0",
                      borderRadius: 12,
                      padding: "10px 12px",
                    }}
                  >
                    <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
                    {!isSystem && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {formatDate(m.createdAt)}
                      </Text>
                    )}
                  </div>
                );
              })}
            </div>


            <Space direction="vertical" style={{ width: "100%" }}>
              <TextArea
                rows={4}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Введите сообщение"
              />
              <Button
                type="primary"
                onClick={sendChatMessage}
                loading={chatSending}
              >
                Отправить
              </Button>
            </Space>
          </>
        )}
      </Drawer>



    </div>
  );
};


export default ReclamationPanelPage;