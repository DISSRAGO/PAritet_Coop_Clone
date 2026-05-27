type AuthState = {
  accessToken: string | null;
  userId: string | null;
  subjectId: string | null;
  sessionId: string | null;
  roles: string[];
  isSuperuser: boolean;
};

const state: AuthState = {
  accessToken: null,
  userId: null,
  subjectId: null,
  sessionId: null,
  roles: [],
  isSuperuser: false,
};

export function setAuthState(next: Partial<AuthState>) {
  Object.assign(state, next);
}

export function clearAuthState() {
  state.accessToken = null;
  state.userId = null;
  state.subjectId = null;
  state.sessionId = null;
  state.roles = [];
  state.isSuperuser = false;
}

export function getAccessToken() {
  return state.accessToken;
}

export function getAuthState() {
  return state;
}