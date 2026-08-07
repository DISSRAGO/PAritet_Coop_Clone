import { IPayConfirm } from "../models/payment/IPayConfirm";
import { IPaymentOption } from "../models/payment/IPaymentOption";
import { getAccessToken } from "../utils/checkAuth";
import { Urls } from "../utils/urls";

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json() as Promise<T>;
    }
    return response.text() as unknown as T;
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    throw await response.json();
  }

  throw await response.text();
}

function authHeaders(): HeadersInit {
  const token = getAccessToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export default class PaymentService {
  static async pay_step1(): Promise<IPaymentOption> {
    const response = await fetch(Urls.PAYMENT_STEP1_URL, {
      method: "POST",
      headers: authHeaders(),
    });

    return handleResponse<IPaymentOption>(response);
  }

  static async pay_step2(
    amount: string,
    description: string,
    login: string
  ): Promise<IPayConfirm> {
    const response = await fetch(Urls.PAYMENT_STEP2_URL, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        amount,
        description,
        login,
      }),
    });

    return handleResponse<IPayConfirm>(response);
  }

  static async pay_step3(
    activationRequestId: string,
    activationCode: string,
    contractForm: string,
    amount: string,
    typeTo: string,
    valueTo: string,
    description: string
  ): Promise<string> {
    const response = await fetch(Urls.PAYMENT_STEP3_URL, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        activationRequestId,
        activationCode,
        contractForm,
        amount,
        typeTo,
        valueTo,
        description,
      }),
    });

    return handleResponse<string>(response);
  }
}