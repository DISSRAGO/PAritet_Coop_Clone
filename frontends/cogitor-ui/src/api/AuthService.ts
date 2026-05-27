import { IConfirmFormData } from "../models/profile/IConfirmFormData";
import { IRegistrationFormData } from "../models/profile/IRegisterFormData";
import { getAccessToken } from "../utils/checkAuth";
import { Urls } from "../utils/urls";

async function handleJsonResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.detail || data?.message || `HTTP ${response.status}`);
  }
  return data;
}

export default class AuthService {
  static async signIn(login: string, password: string): Promise<any> {
    const response = await fetch(Urls.LOGINURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
    });

    const data = await handleJsonResponse(response);

    sessionStorage.setItem("isAuth", "true");
    sessionStorage.setItem("login", login);

    if (data.accessToken) {
      sessionStorage.setItem("accessToken", data.accessToken);
    }

    if (data.refreshToken) {
      sessionStorage.setItem("refreshToken", data.refreshToken);
    }

    return data;
  }

  static async logout(): Promise<boolean> {
    const response = await fetch(Urls.LOGOUTURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getAccessToken()}`,
      },
      body: JSON.stringify({
        userId: localStorage.getItem("userId"),
      }),
    });

    await handleJsonResponse(response);

    sessionStorage.removeItem("isAuth");
    sessionStorage.removeItem("login");
    sessionStorage.removeItem("id");
    sessionStorage.removeItem("cabinet");
    sessionStorage.removeItem("admin");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");

    return true;
  }

  static async signUp(
    registrationFormData: IRegistrationFormData
  ): Promise<IConfirmFormData> {
    const response = await fetch(Urls.REGISTERURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registrationFormData),
    });

    return handleJsonResponse(response);
  }

  static async signUpConfirm(formData: IConfirmFormData): Promise<any> {
    const response = await fetch(Urls.REGISTERCONFIRMURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    return handleJsonResponse(response);
  }

  static async validateEmail(email: string): Promise<any> {
    const response = await fetch(Urls.VALIDATEEMAILURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    return handleJsonResponse(response);
  }

  static async validateLogin(login: string): Promise<any> {
    const response = await fetch(Urls.VALIDATELOGINURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login }),
    });

    return handleJsonResponse(response);
  }

  static async validatePhone(phone: string): Promise<any> {
    const response = await fetch(Urls.VALIDATEPHONEURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    return handleJsonResponse(response);
  }

  static async validatePassword(): Promise<boolean> {
    return true;
  }

  static async validateRestorePassword(): Promise<boolean> {
    return true;
  }
}