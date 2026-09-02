import { Urls } from "../utils/urls";
import {
  ReclamationSummary,
  ReclamationDashboard,
  ReclamationCreateRequest,
  ReclamationFullResponse,
  ReclamationListEnvelope,
  ReclamationType,
  ReclamationStatus,
  ReclamationPriority,
  ReclamationMessageType,
  ReclamationVisibility,
} from "../models/reclamation/Reclamation";

type QueryParams = Record<string, string | number | boolean | null | undefined>;

function getBaseUrl(): string {
  const explicit =
    (Urls as any)?.RECLAMATION_API_URL ||
    (Urls as any)?.API_URL ||
    (Urls as any)?.BASE_API_URL;

  if (explicit) return String(explicit).replace(/\/$/, "");
  return `${window.location.origin}/api`;
}

function normalizeReclamationType(value: any): ReclamationType {
  const v = String(value || "").toLowerCase();

  if (
    v === "content" ||
    v === "context" ||
    v === "behavior" ||
    v === "transaction" ||
    v === "governance" ||
    v === "system"
  ) {
    return v;
  }

  return "content";
}

function normalizeStatus(value: any): ReclamationStatus {
  const v = String(value || "").toLowerCase();

  if (
    v === "draft" ||
    v === "registered" ||
    v === "accepted" ||
    v === "in_progress" ||
    v === "waiting_response" ||
    v === "resolved" ||
    v === "rejected" ||
    v === "escalated" ||
    v === "with_chairman" ||
    v === "completed" ||
    v === "closed" ||
    v === "cancelled"
  ) {
    return v;
  }

  return "registered";
}

function normalizePriority(value: any): ReclamationPriority {
  const v = String(value || "").toLowerCase();

  if (v === "low" || v === "normal" || v === "high" || v === "critical") {
    return v;
  }

  return "normal";
}

function normalizeSummary(item: any): ReclamationSummary {
  return {
    reclamationId:
      item?.reclamationId ||
      item?.reclamation_id ||
      item?.reclamationid ||
      item?.id ||
      "",
    reclamationType: normalizeReclamationType(
      item?.reclamationType || item?.reclamation_type || item?.reclamationtype
    ),
    sourceType: item?.sourceType || item?.source_type || undefined,
    status: normalizeStatus(item?.status),
    priority: normalizePriority(item?.priority),
    title: item?.title || "",
    targetType: item?.targetType || item?.target_type || item?.targettype || "",
    targetId: item?.targetId || item?.target_id || item?.targetid || "",
    createdAt: item?.createdAt || item?.created_at || item?.createdat || "",
    createdBySubjectId:
      item?.createdBySubjectId || item?.created_by_subject_id || undefined,
    respondentSubjectId:
      item?.respondentSubjectId || item?.respondent_subject_id || undefined,
    currentResponsibleSubjectId:
      item?.currentResponsibleSubjectId ||
      item?.current_responsible_subject_id ||
      undefined,
    communityId: item?.communityId || item?.community_id || undefined,
    deadlineAt: item?.deadlineAt || item?.deadline_at || undefined,
    hasUnread: !!(item?.hasUnread ?? item?.has_unread ?? false),
    unreadCount: Number(item?.unreadCount ?? item?.unread_count ?? 0),
    claimantEffectiveSubjectId:
      item?.claimantEffectiveSubjectId ||
      item?.claimant_effective_subject_id ||
      undefined,
    respondentEffectiveSubjectId:
      item?.respondentEffectiveSubjectId ||
      item?.respondent_effective_subject_id ||
      undefined,
    escalationLevel: Number(
      item?.escalationLevel ?? item?.escalation_level ?? 0
    ),
  } as ReclamationSummary;
}

function normalizeDashboard(data: any): ReclamationDashboard {
  return {
    inboxCount: Number(data?.inboxCount ?? data?.inbox_count ?? 0),
    outboxCount: Number(data?.outboxCount ?? data?.outbox_count ?? 0),
    waitingResponseCount: Number(
      data?.waitingResponseCount ?? data?.waiting_response_count ?? 0
    ),
    escalatedCount: Number(data?.escalatedCount ?? data?.escalated_count ?? 0),
    overdueCount: Number(data?.overdueCount ?? data?.overdue_count ?? 0),
    closedCount: Number(data?.closedCount ?? data?.closed_count ?? 0),
  };
}

function normalizeFullResponse(json: any): ReclamationFullResponse {
  const data = json?.data || json || {};

  return {
    data: {
      ...data,
      reclamation: data?.reclamation
        ? {
            ...data.reclamation,
            reclamationType: normalizeReclamationType(
              data.reclamation?.reclamationType ||
                data.reclamation?.reclamation_type
            ),
            status: normalizeStatus(data.reclamation?.status),
            priority: normalizePriority(data.reclamation?.priority),
          }
        : data?.reclamation,
      participants: Array.isArray(data?.participants) ? data.participants : [],
      messages: Array.isArray(data?.messages) ? data.messages : [],
      attachments: Array.isArray(data?.attachments) ? data.attachments : [],
      responses: Array.isArray(data?.responses) ? data.responses : [],
      decisions: Array.isArray(data?.decisions) ? data.decisions : [],
      escalations: Array.isArray(data?.escalations) ? data.escalations : [],
      events: Array.isArray(data?.events) ? data.events : [],
      levels: Array.isArray(data?.levels) ? data.levels : [],
    },
  };
}



async function handleJsonResponse(response: Response): Promise<any> {
  const rawText = await response.text().catch(() => "");
  let data: any = {};

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = { rawText };
  }

  if (!response.ok) {
    console.error("REKL API error", response.status, data, rawText);

    const errorMessage =
      data?.error?.message ||
      data?.message ||
      data?.detail ||
      data?.rawText ||
      `HTTP ${response.status}`;

    throw new Error(errorMessage);
  }

  return data;
}

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(`${getBaseUrl()}${path}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

function toList(json: ReclamationListEnvelope | any): ReclamationSummary[] {
  const items = Array.isArray(json?.data)
    ? json.data
    : Array.isArray(json)
    ? json
    : [];

  return items.map(normalizeSummary);
}

export interface CreateMessagePayload {
  actorSubjectId: string;
  body: string;
  messageType?: ReclamationMessageType | string;
  visibility?: ReclamationVisibility | string;
}

export default class ReclamationService {
  static async create(payload: ReclamationCreateRequest): Promise<any> {
    const response = await fetch(buildUrl("/reclamations"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return handleJsonResponse(response);
  }

  static async patchReclamation(
    reclamationId: string,
    payload: {
      actorSubjectId: string;
      status?: string;
      priority?: string;
      description?: string;
      deadlineAt?: string | null;
      currentResponsibleSubjectId?: string | null;
    }
  ): Promise<any> {
    const response = await fetch(buildUrl(`/reclamations/${reclamationId}`), {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return handleJsonResponse(response);
  }

  static async getById(reclamationId: string): Promise<ReclamationFullResponse> {
    const response = await fetch(buildUrl(`/reclamations/${reclamationId}`), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const json = await handleJsonResponse(response);
    return normalizeFullResponse(json);
  }

  static async createMessage(
    reclamationId: string,
    payload: CreateMessagePayload
  ): Promise<any> {
    const response = await fetch(
      buildUrl(`/reclamations/${reclamationId}/messages`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actorSubjectId: payload.actorSubjectId,
          body: payload.body,
          messageType: payload.messageType || "comment",
          visibility: payload.visibility || "participants",
        }),
      }
    );

    return handleJsonResponse(response);
  }

  static async markAsRead(
    reclamationId: string,
    subjectId: string
  ): Promise<void> {
    const response = await fetch(
      buildUrl(`/reclamations/${reclamationId}/read`, {
        subject_id: subjectId,
      }),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok && response.status !== 204) {
      await handleJsonResponse(response);
    }
  }

  static async getUnreadCount(subjectId: string): Promise<number> {
    const response = await fetch(
      buildUrl("/reclamations/unread-count", { subject_id: subjectId }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const json = await handleJsonResponse(response);
    return Number(json?.unreadCount ?? 0);
  }

  static async getInbox(
    subjectId: string,
    params?: QueryParams
  ): Promise<ReclamationSummary[]> {
    const response = await fetch(
      buildUrl("/panel/inbox", {
        subject_id: subjectId,
        ...params,
      }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const json: ReclamationListEnvelope | any = await handleJsonResponse(
      response
    );
    return toList(json);
  }

  static async getOutbox(
    subjectId: string,
    params?: QueryParams
  ): Promise<ReclamationSummary[]> {
    const response = await fetch(
      buildUrl("/panel/outbox", {
        created_by_subject_id: subjectId,
        ...params,
      }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const json: ReclamationListEnvelope | any = await handleJsonResponse(
      response
    );
    return toList(json);
  }

  static async getMyTargets(
    subjectId: string,
    params?: QueryParams
  ): Promise<ReclamationSummary[]> {
    const response = await fetch(
      buildUrl("/panel/my-targets", {
        owner_subject_id: subjectId,
        target_type: "thanka",
        ...params,
      }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const json: ReclamationListEnvelope | any = await handleJsonResponse(
      response
    );
    return toList(json);
  }

  static async getArchive(
    subjectId: string,
    params?: QueryParams
  ): Promise<ReclamationSummary[]> {
    const response = await fetch(
      buildUrl("/panel/archive", {
        subject_id: subjectId,
        ...params,
      }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const json: ReclamationListEnvelope | any = await handleJsonResponse(
      response
    );
    return toList(json);
  }

  static async getDashboard(subjectId: string): Promise<ReclamationDashboard> {
    const response = await fetch(
      buildUrl("/panel/dashboard", {
        subject_id: subjectId,
      }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const json: any = await handleJsonResponse(response);
    return normalizeDashboard(json?.data || json || {});
  }

  static async escalate(
    reclamationId: string,
    payload: {
      actorSubjectId: string;
      escalationReason: string;
      comment: string;
    }
  ): Promise<any> {
    const response = await fetch(
      buildUrl(`/reclamations/${reclamationId}/escalate`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          actorSubjectId: payload.actorSubjectId,
          escalationReason: payload.escalationReason,
          comment: payload.comment,
        }),
      }
    );

    return handleJsonResponse(response);
  }

  static async getCurrentAllLevels(
    subjectId: string,
    params?: QueryParams
  ): Promise<ReclamationSummary[]> {
    const response = await fetch(
      buildUrl("/panel/current-all-levels", {
        subject_id: subjectId,
        ...params,
      }),
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const json: ReclamationListEnvelope | any = await handleJsonResponse(
      response
    );
    return toList(json);
  }
}