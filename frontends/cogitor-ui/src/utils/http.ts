import { clearAuthState, getAccessToken as getMemoryAccessToken, setAuthState } from "./authStore";
import { Urls } from "./urls";

function getStoredAccessToken(): string | null {
  return localStorage.getItem("accessToken");
}

function getStoredRefreshToken(): string | null {
  return localStorage.getItem("refreshToken");
}

function setStoredTokens(data: {
  accessToken?: string | null;
  refreshToken?: string | null;
  userId?: string | null;
  subjectId?: string | null;
  sessionId?: string | null;
  roles?: string[];
  isSuperuser?: boolean;
}) {
  if (data.accessToken) {
    localStorage.setItem("accessToken", data.accessToken);
  } else {
    localStorage.removeItem("accessToken");
  }

  if (data.refreshToken) {
    localStorage.setItem("refreshToken", data.refreshToken);
  } else {
    localStorage.removeItem("refreshToken");
  }

  if (data.userId) {
    localStorage.setItem("userId", data.userId);
  }

  setAuthState({
    accessToken: data.accessToken ?? null,
    userId: data.userId ?? null,
    subjectId: data.subjectId ?? null,
    sessionId: data.sessionId ?? null,
    roles: data.roles || [],
    isSuperuser: !!data.isSuperuser,
  });
}

function clearStoredTokens() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("userId");
  clearAuthState();
}

function resolveAccessToken(): string | null {
  return getMemoryAccessToken() || getStoredAccessToken();
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    clearStoredTokens();
    throw new Error("Missing refresh token");
  }

  const res = await fetch(Urls.LOGIN_URL.replace("/login", "/refresh"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    clearStoredTokens();
    throw new Error("Refresh failed");
  }

  const data = await res.json();

  setStoredTokens({
    accessToken: data.accessToken ?? null,
    refreshToken: data.refreshToken ?? refreshToken,
    userId: data.userId ?? null,
    subjectId: data.subjectId ?? null,
    sessionId: data.sessionId ?? null,
    roles: data.roles || [],
    isSuperuser: !!data.isSuperuser,
  });

  return data.accessToken as string;
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  let token = resolveAccessToken();

  const makeRequest = async (bearer?: string) =>
    fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
    });

  let response = await makeRequest(token ?? undefined);

  if (response.status === 401 && token) {
    token = await refreshAccessToken();
    response = await makeRequest(token ?? undefined);
  }

  return response;
}

export { clearStoredTokens, resolveAccessToken, setStoredTokens };