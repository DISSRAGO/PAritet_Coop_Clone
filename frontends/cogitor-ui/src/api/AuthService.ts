import { Urls } from "../utils/urls";

export interface LoginPayload {
  login: string;
  password: string;
}

export interface RegisterPayload {
  surname: string;
  firstName: string;
  secondName?: string;
  login: string;
  phone: string;
  addressId: number;
  password: string;
  restorePassword: string;
  email: string;
}

export interface ConfirmPayload {
  Login: string;
  Password: string;
  Surname: string;
  FirstName: string;
  SecondName?: string;
  Phone: string;
  Email: string;
  address: string;
  ActivationRequestId: string;
  ActivationCode: string;
}

export interface RefreshPayload {
  refreshToken: string;
}

function formatValidationDetail(detail: unknown): string | null {
  // FastAPI/Pydantic возвращает 422 как { detail: [{ loc, msg, type }, ...] }.
  // Преобразуем массив объектов в человекочитаемую строку.
  if (Array.isArray(detail)) {
    const parts = detail
      .map((item: any) => {
        if (item && typeof item === "object") {
          const loc = Array.isArray(item.loc) ? item.loc.join(".") : "";
          const msg = item.msg || item.message || "";
          return loc ? `${loc}: ${msg}` : msg;
        }
        return typeof item === "string" ? item : "";
      })
      .filter(Boolean);
    return parts.length ? parts.join("; ") : null;
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (detail && typeof detail === "object") {
    try {
      return JSON.stringify(detail);
    } catch {
      return null;
    }
  }

  return null;
}

async function handleJsonResponse(response: Response) {
  const data = await response.json().catch(() => ({} as any));

  if (!response.ok) {
    const message =
      formatValidationDetail(data?.detail) ||
      data?.message ||
      data?.text ||
      `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export default class AuthService {
  static async signIn(payload: LoginPayload) {
    const response = await fetch(Urls.LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await handleJsonResponse(response);

    sessionStorage.setItem("isAuth", "true");
    sessionStorage.setItem("login", payload.login);

    if (data.accessToken) {
      sessionStorage.setItem("accessToken", data.accessToken);
    }

    if (data.refreshToken) {
      sessionStorage.setItem("refreshToken", data.refreshToken);
    }

    return data;
  }

  static async logout() {
    const accessToken = sessionStorage.getItem("accessToken") || "";

    const response = await fetch(Urls.LOGOUT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    await handleJsonResponse(response);

    sessionStorage.removeItem("isAuth");
    sessionStorage.removeItem("login");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    return true;
  }

  static async refresh() {
    const refreshToken = sessionStorage.getItem("refreshToken") || "";

    const response = await fetch(Urls.REFRESH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    const data = await handleJsonResponse(response);

    if (data.accessToken) {
      sessionStorage.setItem("accessToken", data.accessToken);
    }

    if (data.refreshToken) {
      sessionStorage.setItem("refreshToken", data.refreshToken);
    }

    return data;
  }

  static async signUp(payload: RegisterPayload) {
    const response = await fetch(Urls.REGISTER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return handleJsonResponse(response);
  }

  static async signUpConfirm(payload: ConfirmPayload) {
    const response = await fetch(Urls.REGISTER_CONFIRM_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return handleJsonResponse(response);
  }

  static async validateLogin(login: string) {
    const response = await fetch(Urls.VALIDATE_LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login }),
    });

    return handleJsonResponse(response);
  }

  static async validateEmail(email: string) {
    const response = await fetch(Urls.VALIDATE_EMAIL_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    return handleJsonResponse(response);
  }

  static async validatePhone(phone: string) {
    const response = await fetch(Urls.VALIDATE_PHONE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    return handleJsonResponse(response);
  }
}