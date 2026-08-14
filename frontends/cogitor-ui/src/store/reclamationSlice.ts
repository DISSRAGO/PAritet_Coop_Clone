import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import ReclamationApi from "../api/reclamation";
import { Urls } from "../utils/urls";
import type {
  ReclamationAcceptRequest,
  ReclamationAssignRequest,
  ReclamationCloseRequest,
  ReclamationCreateAttachmentRequest,
  ReclamationCreateDecisionRequest,
  ReclamationCreateMessageRequest,
  ReclamationCreateRequest,
  ReclamationCreateResponseRequest,
  ReclamationDashboard,
  ReclamationEscalateRequest,
  ReclamationEscalateResponse,
  ReclamationFullData,
  ReclamationFullResponse,
  ReclamationListEnvelope,
  ReclamationPatchRequest,
  ReclamationStatusTransitionResponse,
  ReclamationSummary,
  ReclamationWithdrawRequest,
} from "../models/reclamation/Reclamation";

type LoadingState = "idle" | "loading" | "succeeded" | "failed";

interface ReclamationState {
  list: ReclamationListEnvelope | null;
  detail: ReclamationFullData | null;
  inbox: ReclamationListEnvelope | null;
  outbox: ReclamationListEnvelope | null;
  archive: ReclamationListEnvelope | null;
  currentAllLevels: ReclamationListEnvelope | null;
  dashboard: { data: ReclamationDashboard } | null;
  loading: LoadingState;
  actionLoading: LoadingState;
  error: string | null;
}

const initialState: ReclamationState = {
  list: null,
  detail: null,
  inbox: null,
  outbox: null,
  archive: null,
  currentAllLevels: null,
  dashboard: null,
  loading: "idle",
  actionLoading: "idle",
  error: null,
};

type QueryParams = Record<string, string | number | boolean | null | undefined>;

function getBaseUrl(): string {
  const explicit =
    (Urls as unknown as Record<string, unknown>)?.RECLAMATION_API_URL ||
    (Urls as unknown as Record<string, unknown>)?.API_URL ||
    (Urls as unknown as Record<string, unknown>)?.BASE_API_URL;

  if (explicit) return String(explicit).replace(/\/$/, "");
  return `${window.location.origin}/api`;
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

const extractApiError = (error: unknown): string => {
  const fallback = "Request failed";

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  return fallback;
};

async function handleJsonResponse<T>(response: Response): Promise<T> {
  const rawText = await response.text().catch(() => "");
  let data: unknown = {};

  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch {
    data = { rawText };
  }

  if (!response.ok) {
    const err = data as
      | {
          error?: { message?: string };
          message?: string;
          detail?: string;
          rawText?: string;
        }
      | undefined;

    const errorMessage =
      err?.error?.message ||
      err?.message ||
      err?.detail ||
      err?.rawText ||
      `HTTP ${response.status}`;

    throw new Error(errorMessage);
  }

  return data as T;
}

function normalizeListEnvelope(input: unknown): ReclamationListEnvelope {
  if (Array.isArray(input)) {
    return { data: input as ReclamationSummary[] };
  }

  if (typeof input === "object" && input !== null && "data" in input) {
    const obj = input as ReclamationListEnvelope;
    return {
      data: Array.isArray(obj.data) ? obj.data : [],
      meta: obj.meta,
    };
  }

  return { data: [] };
}

function normalizeDashboardEnvelope(
  input: ReclamationDashboard | { data: ReclamationDashboard }
): { data: ReclamationDashboard } {
  if (typeof input === "object" && input !== null && "data" in input) {
    return input as { data: ReclamationDashboard };
  }

  return {
    data: input as ReclamationDashboard,
  };
}

export const loadReclamations = createAsyncThunk<
  ReclamationListEnvelope,
  Record<string, string | number | undefined>,
  { rejectValue: string }
>("reclamation/loadReclamations", async (params, { rejectWithValue }) => {
  try {
    const response = await fetch(buildUrl("/reclamations", params), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const data = await handleJsonResponse<ReclamationListEnvelope>(response);
    return normalizeListEnvelope(data);
  } catch (error) {
    return rejectWithValue(extractApiError(error));
  }
});

export const loadReclamationDetail = createAsyncThunk<
  ReclamationFullData,
  string,
  { rejectValue: string }
>(
  "reclamation/loadReclamationDetail",
  async (reclamationId, { rejectWithValue }) => {
    try {
      const response = await ReclamationApi.getById(reclamationId);
      const payload = response as ReclamationFullResponse;
      return payload.data;
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const loadInbox = createAsyncThunk<
  ReclamationListEnvelope,
  string,
  { rejectValue: string }
>("reclamation/loadInbox", async (subjectId, { rejectWithValue }) => {
  try {
    const data = await ReclamationApi.getInbox(subjectId);
    return normalizeListEnvelope(data);
  } catch (error) {
    return rejectWithValue(extractApiError(error));
  }
});

export const loadOutbox = createAsyncThunk<
  ReclamationListEnvelope,
  string,
  { rejectValue: string }
>("reclamation/loadOutbox", async (subjectId, { rejectWithValue }) => {
  try {
    const data = await ReclamationApi.getOutbox(subjectId);
    return normalizeListEnvelope(data);
  } catch (error) {
    return rejectWithValue(extractApiError(error));
  }
});

export const loadArchive = createAsyncThunk<
  ReclamationListEnvelope,
  string,
  { rejectValue: string }
>("reclamation/loadArchive", async (subjectId, { rejectWithValue }) => {
  try {
    const data = await ReclamationApi.getArchive(subjectId);
    return normalizeListEnvelope(data);
  } catch (error) {
    return rejectWithValue(extractApiError(error));
  }
});

export const loadDashboard = createAsyncThunk<
  { data: ReclamationDashboard },
  string,
  { rejectValue: string }
>("reclamation/loadDashboard", async (subjectId, { rejectWithValue }) => {
  try {
    const data = await ReclamationApi.getDashboard(subjectId);
    return normalizeDashboardEnvelope(data);
  } catch (error) {
    return rejectWithValue(extractApiError(error));
  }
});

export const loadCurrentAllLevels = createAsyncThunk<
  ReclamationListEnvelope,
  string,
  { rejectValue: string }
>("reclamation/loadCurrentAllLevels", async (subjectId, { rejectWithValue }) => {
  try {
    const data = await ReclamationApi.getCurrentAllLevels(subjectId);
    return normalizeListEnvelope(data);
  } catch (error) {
    return rejectWithValue(extractApiError(error));
  }
});

export const createReclamation = createAsyncThunk<
  ReclamationSummary,
  ReclamationCreateRequest,
  { rejectValue: string }
>(
  "reclamation/createReclamation",
  async (payload, { rejectWithValue }) => {
    try {
      return await ReclamationApi.create(payload);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const patchReclamation = createAsyncThunk<
  ReclamationStatusTransitionResponse,
  { reclamationId: string; payload: ReclamationPatchRequest },
  { rejectValue: string }
>(
  "reclamation/patchReclamation",
  async ({ reclamationId, payload }, { rejectWithValue }) => {
    try {
      return await ReclamationApi.patchReclamation(reclamationId, payload);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const acceptReclamation = createAsyncThunk<
  ReclamationStatusTransitionResponse,
  { reclamationId: string; payload: ReclamationAcceptRequest },
  { rejectValue: string }
>(
  "reclamation/acceptReclamation",
  async ({ reclamationId, payload }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        buildUrl(`/reclamations/${reclamationId}/accept`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      return await handleJsonResponse<ReclamationStatusTransitionResponse>(
        response
      );
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const assignReclamation = createAsyncThunk<
  ReclamationStatusTransitionResponse,
  { reclamationId: string; payload: ReclamationAssignRequest },
  { rejectValue: string }
>(
  "reclamation/assignReclamation",
  async ({ reclamationId, payload }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        buildUrl(`/reclamations/${reclamationId}/assign`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      return await handleJsonResponse<ReclamationStatusTransitionResponse>(
        response
      );
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const withdrawReclamation = createAsyncThunk<
  ReclamationStatusTransitionResponse,
  { reclamationId: string; payload: ReclamationWithdrawRequest },
  { rejectValue: string }
>(
  "reclamation/withdrawReclamation",
  async ({ reclamationId, payload }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        buildUrl(`/reclamations/${reclamationId}/withdraw`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      return await handleJsonResponse<ReclamationStatusTransitionResponse>(
        response
      );
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const closeReclamation = createAsyncThunk<
  ReclamationStatusTransitionResponse,
  { reclamationId: string; payload: ReclamationCloseRequest },
  { rejectValue: string }
>(
  "reclamation/closeReclamation",
  async ({ reclamationId, payload }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        buildUrl(`/reclamations/${reclamationId}/close`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      return await handleJsonResponse<ReclamationStatusTransitionResponse>(
        response
      );
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const escalateReclamation = createAsyncThunk<
  ReclamationEscalateResponse,
  { reclamationId: string; payload: ReclamationEscalateRequest },
  { rejectValue: string }
>(
  "reclamation/escalateReclamation",
  async ({ reclamationId, payload }, { rejectWithValue }) => {
    try {
      return await ReclamationApi.escalate(reclamationId, payload);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const createReclamationMessage = createAsyncThunk<
  unknown,
  { reclamationId: string; payload: ReclamationCreateMessageRequest },
  { rejectValue: string }
>(
  "reclamation/createReclamationMessage",
  async ({ reclamationId, payload }, { rejectWithValue }) => {
    try {
      return await ReclamationApi.createMessage(reclamationId, payload);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const createReclamationAttachment = createAsyncThunk<
  unknown,
  { reclamationId: string; payload: ReclamationCreateAttachmentRequest },
  { rejectValue: string }
>(
  "reclamation/createReclamationAttachment",
  async ({ reclamationId, payload }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        buildUrl(`/reclamations/${reclamationId}/attachments`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      return await handleJsonResponse<unknown>(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const createReclamationResponse = createAsyncThunk<
  unknown,
  { reclamationId: string; payload: ReclamationCreateResponseRequest },
  { rejectValue: string }
>(
  "reclamation/createReclamationResponse",
  async ({ reclamationId, payload }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        buildUrl(`/reclamations/${reclamationId}/responses`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      return await handleJsonResponse<unknown>(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

export const createReclamationDecision = createAsyncThunk<
  unknown,
  { reclamationId: string; payload: ReclamationCreateDecisionRequest },
  { rejectValue: string }
>(
  "reclamation/createReclamationDecision",
  async ({ reclamationId, payload }, { rejectWithValue }) => {
    try {
      const response = await fetch(
        buildUrl(`/reclamations/${reclamationId}/decisions`),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      return await handleJsonResponse<unknown>(response);
    } catch (error) {
      return rejectWithValue(extractApiError(error));
    }
  }
);

const reclamationSlice = createSlice({
  name: "reclamation",
  initialState,
  reducers: {
    clearReclamationError(state) {
      state.error = null;
    },
    clearReclamationDetail(state) {
      state.detail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadReclamations.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(
        loadReclamations.fulfilled,
        (state, action: PayloadAction<ReclamationListEnvelope>) => {
          state.loading = "succeeded";
          state.list = action.payload;
        }
      )
      .addCase(loadReclamations.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload ?? "Failed to fetch reclamations";
      })

      .addCase(loadReclamationDetail.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(
        loadReclamationDetail.fulfilled,
        (state, action: PayloadAction<ReclamationFullData>) => {
          state.loading = "succeeded";
          state.detail = action.payload;
        }
      )
      .addCase(loadReclamationDetail.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload ?? "Failed to fetch reclamation detail";
      })

      .addCase(loadInbox.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(
        loadInbox.fulfilled,
        (state, action: PayloadAction<ReclamationListEnvelope>) => {
          state.loading = "succeeded";
          state.inbox = action.payload;
        }
      )
      .addCase(loadInbox.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload ?? "Failed to fetch inbox";
      })

      .addCase(loadOutbox.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(
        loadOutbox.fulfilled,
        (state, action: PayloadAction<ReclamationListEnvelope>) => {
          state.loading = "succeeded";
          state.outbox = action.payload;
        }
      )
      .addCase(loadOutbox.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload ?? "Failed to fetch outbox";
      })

      .addCase(loadArchive.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(
        loadArchive.fulfilled,
        (state, action: PayloadAction<ReclamationListEnvelope>) => {
          state.loading = "succeeded";
          state.archive = action.payload;
        }
      )
      .addCase(loadArchive.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload ?? "Failed to fetch archive";
      })

      .addCase(loadDashboard.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(
        loadDashboard.fulfilled,
        (state, action: PayloadAction<{ data: ReclamationDashboard }>) => {
          state.loading = "succeeded";
          state.dashboard = action.payload;
        }
      )
      .addCase(loadDashboard.rejected, (state, action) => {
        state.loading = "failed";
        state.error = action.payload ?? "Failed to fetch dashboard";
      })

      .addCase(loadCurrentAllLevels.pending, (state) => {
        state.loading = "loading";
        state.error = null;
      })
      .addCase(
        loadCurrentAllLevels.fulfilled,
        (state, action: PayloadAction<ReclamationListEnvelope>) => {
          state.loading = "succeeded";
          state.currentAllLevels = action.payload;
        }
      )
      .addCase(loadCurrentAllLevels.rejected, (state, action) => {
        state.loading = "failed";
        state.error =
          action.payload ??
          "Failed to fetch current reclamations (all escalation levels)";
      })

      .addCase(createReclamation.pending, (state) => {
        state.actionLoading = "loading";
        state.error = null;
      })
      .addCase(createReclamation.fulfilled, (state) => {
        state.actionLoading = "succeeded";
      })
      .addCase(createReclamation.rejected, (state, action) => {
        state.actionLoading = "failed";
        state.error = action.payload ?? "Failed to create reclamation";
      })

      .addCase(patchReclamation.pending, (state) => {
        state.actionLoading = "loading";
        state.error = null;
      })
      .addCase(patchReclamation.fulfilled, (state) => {
        state.actionLoading = "succeeded";
      })
      .addCase(patchReclamation.rejected, (state, action) => {
        state.actionLoading = "failed";
        state.error = action.payload ?? "Failed to update reclamation";
      })

      .addCase(acceptReclamation.pending, (state) => {
        state.actionLoading = "loading";
        state.error = null;
      })
      .addCase(acceptReclamation.fulfilled, (state) => {
        state.actionLoading = "succeeded";
      })
      .addCase(acceptReclamation.rejected, (state, action) => {
        state.actionLoading = "failed";
        state.error = action.payload ?? "Failed to accept reclamation";
      })

      .addCase(assignReclamation.pending, (state) => {
        state.actionLoading = "loading";
        state.error = null;
      })
      .addCase(assignReclamation.fulfilled, (state) => {
        state.actionLoading = "succeeded";
      })
      .addCase(assignReclamation.rejected, (state, action) => {
        state.actionLoading = "failed";
        state.error = action.payload ?? "Failed to assign reclamation";
      })

      .addCase(withdrawReclamation.pending, (state) => {
        state.actionLoading = "loading";
        state.error = null;
      })
      .addCase(withdrawReclamation.fulfilled, (state) => {
        state.actionLoading = "succeeded";
      })
      .addCase(withdrawReclamation.rejected, (state, action) => {
        state.actionLoading = "failed";
        state.error = action.payload ?? "Failed to withdraw reclamation";
      })

      .addCase(closeReclamation.pending, (state) => {
        state.actionLoading = "loading";
        state.error = null;
      })
      .addCase(closeReclamation.fulfilled, (state) => {
        state.actionLoading = "succeeded";
      })
      .addCase(closeReclamation.rejected, (state, action) => {
        state.actionLoading = "failed";
        state.error = action.payload ?? "Failed to close reclamation";
      })

      .addCase(escalateReclamation.pending, (state) => {
        state.actionLoading = "loading";
        state.error = null;
      })
      .addCase(escalateReclamation.fulfilled, (state) => {
        state.actionLoading = "succeeded";
      })
      .addCase(escalateReclamation.rejected, (state, action) => {
        state.actionLoading = "failed";
        state.error = action.payload ?? "Failed to escalate reclamation";
      })

      .addCase(createReclamationMessage.pending, (state) => {
        state.actionLoading = "loading";
        state.error = null;
      })
      .addCase(createReclamationMessage.fulfilled, (state) => {
        state.actionLoading = "succeeded";
      })
      .addCase(createReclamationMessage.rejected, (state, action) => {
        state.actionLoading = "failed";
        state.error = action.payload ?? "Failed to create message";
      })

      .addCase(createReclamationAttachment.pending, (state) => {
        state.actionLoading = "loading";
        state.error = null;
      })
      .addCase(createReclamationAttachment.fulfilled, (state) => {
        state.actionLoading = "succeeded";
      })
      .addCase(createReclamationAttachment.rejected, (state, action) => {
        state.actionLoading = "failed";
        state.error = action.payload ?? "Failed to create attachment";
      })

      .addCase(createReclamationResponse.pending, (state) => {
        state.actionLoading = "loading";
        state.error = null;
      })
      .addCase(createReclamationResponse.fulfilled, (state) => {
        state.actionLoading = "succeeded";
      })
      .addCase(createReclamationResponse.rejected, (state, action) => {
        state.actionLoading = "failed";
        state.error = action.payload ?? "Failed to create response";
      })

      .addCase(createReclamationDecision.pending, (state) => {
        state.actionLoading = "loading";
        state.error = null;
      })
      .addCase(createReclamationDecision.fulfilled, (state) => {
        state.actionLoading = "succeeded";
      })
      .addCase(createReclamationDecision.rejected, (state, action) => {
        state.actionLoading = "failed";
        state.error = action.payload ?? "Failed to create decision";
      });
  },
});

export const { clearReclamationError, clearReclamationDetail } =
  reclamationSlice.actions;
export default reclamationSlice.reducer;