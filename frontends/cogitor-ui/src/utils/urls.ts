function _readEnv(name: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (process as any)?.env?.[name] ?? "";
  } catch {
    return "";
  }
}

export const BASE_URL = _readEnv("REACT_APP_API_BASE_URL");

export const Urls = {
  // --- auth ---
  LOGIN_URL: `${BASE_URL}/api/auth/login`,
  REGISTER_URL: `${BASE_URL}/api/auth/signUp`,
  REGISTER_CONFIRM_URL: `${BASE_URL}/api/auth/confirm`,
  LOGOUT_URL: `${BASE_URL}/api/auth/logout`,
  REFRESH_URL: `${BASE_URL}/api/auth/refresh`,
  VALIDATE_LOGIN_URL: `${BASE_URL}/api/auth/validate/login`,
  VALIDATE_EMAIL_URL: `${BASE_URL}/api/auth/validate/email`,
  VALIDATE_PHONE_URL: `${BASE_URL}/api/auth/validate/phone`,

  // --- user / profile ---
  GET_PROFILE_URL: `${BASE_URL}/api/user/profile`,
  SAVE_PROFILE_ADDRESS_URL: `${BASE_URL}/api/user/profile/address`,
  GET_HEADER_INFO_URL: `${BASE_URL}/api/user/header_info`,
  GET_ACCOUNT_URL: `${BASE_URL}/api/user/account`,
  GET_OPERATION_HISTORY_URL: `${BASE_URL}/api/user/operation_history`,

  // --- payment ---
  // Если на backend route не /api/payment/*, а /api/payments/*
  // или /api/portmonet/*, поменяй только path-часть, не имена ключей.
  PAYMENT_STEP1_URL: `${BASE_URL}/api/payment/step1`,
  PAYMENT_STEP2_URL: `${BASE_URL}/api/payment/step2`,
  PAYMENT_STEP3_URL: `${BASE_URL}/api/payment/step3`,
};