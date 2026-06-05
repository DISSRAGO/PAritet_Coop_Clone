// ---------------------------------------------------------------------------
// SubjectService — клиент канонического subject API (HomoNet V0.51, Stage 3).
// ---------------------------------------------------------------------------
// Все запросы идут на относительные пути (`/api/...`), которые webpack-dev-server
// проксирует на FastAPI (см. webpack.config.ts → proxy). За счёт этого один и
// тот же код работает и в dev (через прокси), и в проде (за nginx/обратным
// прокси), без зашитого BASE_URL.
//
// Архитектурно subject — сущность выше cogiteka: один subjectId позволяет
// фронту (cogiteka, будущему магазину, кошельку и т.д.) получить тханки,
// листинги, сделки и т.п. одним общим набором ручек. Здесь обёрнуты:
//   • create/get (UC-03, UC-05, карточка)
//   • resolver-выборки по доменам (Stage 3 / PR 1)
//   • единая ручка /objects с дискриминатором domain (Stage 3 / PR 2)
//   • summary-дашборд по counts
// ---------------------------------------------------------------------------

const API_PREFIX = "/api";

// ----- Payloads / cards -----------------------------------------------------

export interface CreatePersonalSubjectPayload {
  authUserLogin: string;
  surname: string;
  firstName: string;
  secondName?: string;
}

export interface CreatePersonalSubjectResponse {
  subjectId: string;
  message: string;
}

export interface CreateCollectiveSubjectPayload {
  communityId: string;
  displayName?: string;
}

export interface CreateCollectiveSubjectResponse {
  subjectId: string;
  message: string;
}

export interface SubjectCard {
  id: string;                       // UUID
  subjectKind: string;              // 'personal' | 'organizational' | 'collective'
  displayName: string;
  status: string;
  personId?: string | null;
  organizationId?: string | null;
  communityId?: string | null;
  authUserLogin?: string | null;
  email?: string | null;
  phone?: string | null;
}

// ----- Resolver: per-domain items (PR 1) -----------------------------------

export interface SubjectThankaItem {
  thankaId: string;
  title: string;
  status: string;
  thankaTypeId?: string | null;
  authorId?: string | null;
  createdAt?: string | null;
}

export interface SubjectListingItem {
  listingId: string;
  assetId: string;
  price?: number | null;
  quantity?: number | null;
  unit?: string | null;
  status: string;
  createdAt?: string | null;
}

export interface SubjectDealItem {
  dealId: string;
  listingId: string;
  role: "supplier" | "buyer";
  counterpartySubjectId: string;
  quantity: number;
  price: number;
  dealSum?: number | null;
  status: string;
  dealDate?: string | null;
}

export interface SubjectDecisionItem {
  decisionId: string;
  communityId: string;
  decisionType: string;
  title: string;
  status: string;
  proposedAt?: string | null;
}

export interface SubjectContributionItem {
  contributionId: string;
  processId: string;
  contributionType: string;
  description: string;
  recordedAt?: string | null;
}

export interface SubjectAccountItem {
  accountId: string;
  currency: string;
  balance: number;
  status: string;
  accountType?: string | null;
}

export interface Paginated<T> {
  total: number;
  limit: number;
  offset: number;
  items: T[];
}

// ----- Unified /objects (PR 2) ---------------------------------------------

export type SubjectObjectDomain =
  | "thanka"
  | "listing"
  | "deal"
  | "decision"
  | "contribution"
  | "account";

export interface SubjectObjectItem {
  domain: SubjectObjectDomain;
  objectId: string;
  title: string;
  status?: string | null;
  sortKey?: string | null;
  payload: Record<string, any>;
}

export interface SubjectObjectsResponse {
  subjectId: string;
  limit: number;
  offset: number;
  total: number;
  totals: Partial<Record<SubjectObjectDomain, number>>;
  items: SubjectObjectItem[];
}

// ----- Summary --------------------------------------------------------------

export interface SubjectSummary {
  subjectId: string;
  displayName: string;
  subjectKind: string;
  thankas: number;
  listings: number;
  dealsAsSupplier: number;
  dealsAsBuyer: number;
  decisionsProposed: number;
  contributions: number;
  accounts: number;
}

// ----- HTTP helpers ---------------------------------------------------------

async function handleJsonResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = (data && (data.detail || data.message)) || `HTTP ${response.status}`;
    throw new Error(msg);
  }
  return data as T;
}

async function getJson<T>(path: string, query?: Record<string, string | number | undefined | null>): Promise<T> {
  let url = `${API_PREFIX}${path}`;
  if (query) {
    const qs = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") {
        qs.append(k, String(v));
      }
    });
    const tail = qs.toString();
    if (tail) url += `?${tail}`;
  }
  const resp = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  return handleJsonResponse<T>(resp);
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const resp = await fetch(`${API_PREFIX}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleJsonResponse<T>(resp);
}

// ----- Service --------------------------------------------------------------

export default class SubjectService {
  // ----- create / read карточки -------------------------------------------

  static createPersonalSubject(payload: CreatePersonalSubjectPayload) {
    // Канонический путь по subject_app_api §5.2; legacy /subject/personal/create
    // остаётся на бэке для совместимости, но фронт использует канон.
    return postJson<CreatePersonalSubjectResponse>(
      "/app/subjects/create-personal-subject",
      payload,
    );
  }

  static createCollectiveSubject(payload: CreateCollectiveSubjectPayload) {
    return postJson<CreateCollectiveSubjectResponse>(
      "/app/subjects/create-collective-subject",
      payload,
    );
  }

  static getSubjectCard(subjectId: string) {
    return getJson<SubjectCard>(`/app/subjects/${subjectId}/card`);
  }

  // ----- resolver-выборки (PR 1) ------------------------------------------

  static getThankas(subjectId: string, opts: { limit?: number; offset?: number; status?: string } = {}) {
    return getJson<Paginated<SubjectThankaItem>>(
      `/app/subjects/${subjectId}/thankas`,
      { limit: opts.limit, offset: opts.offset, status: opts.status },
    );
  }

  static getListings(subjectId: string, opts: { limit?: number; offset?: number; status?: string } = {}) {
    return getJson<Paginated<SubjectListingItem>>(
      `/app/subjects/${subjectId}/listings`,
      { limit: opts.limit, offset: opts.offset, status: opts.status },
    );
  }

  static getDeals(
    subjectId: string,
    opts: { limit?: number; offset?: number; role?: "supplier" | "buyer"; status?: string } = {},
  ) {
    return getJson<Paginated<SubjectDealItem>>(
      `/app/subjects/${subjectId}/deals`,
      { limit: opts.limit, offset: opts.offset, role: opts.role, status: opts.status },
    );
  }

  static getDecisions(subjectId: string, opts: { limit?: number; offset?: number; status?: string } = {}) {
    return getJson<Paginated<SubjectDecisionItem>>(
      `/app/subjects/${subjectId}/decisions`,
      { limit: opts.limit, offset: opts.offset, status: opts.status },
    );
  }

  static getContributions(subjectId: string, opts: { limit?: number; offset?: number } = {}) {
    return getJson<Paginated<SubjectContributionItem>>(
      `/app/subjects/${subjectId}/contributions`,
      { limit: opts.limit, offset: opts.offset },
    );
  }

  static getAccounts(subjectId: string) {
    return getJson<{ items: SubjectAccountItem[] }>(`/app/subjects/${subjectId}/accounts`);
  }

  static getSummary(subjectId: string) {
    return getJson<SubjectSummary>(`/app/subjects/${subjectId}/summary`);
  }

  // ----- unified /objects (PR 2) ------------------------------------------

  static getObjects(
    subjectId: string,
    opts: { domain?: SubjectObjectDomain[] | string; limit?: number; offset?: number } = {},
  ) {
    const domainParam = Array.isArray(opts.domain) ? opts.domain.join(",") : opts.domain;
    return getJson<SubjectObjectsResponse>(
      `/app/subjects/${subjectId}/objects`,
      { domain: domainParam, limit: opts.limit, offset: opts.offset },
    );
  }
}
