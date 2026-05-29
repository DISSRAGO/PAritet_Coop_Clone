export const BASE_URL = "http://127.0.0.1:8000";

export const Urls = {
  // --- auth ---
  LOGIN_URL: `${BASE_URL}/api/auth/login`,
  REGISTER_URL: `${BASE_URL}/api/auth/signUp`,
  REGISTER_CONFIRM_URL: `${BASE_URL}/api/auth/confirm`,
  LOGOUT_URL: `${BASE_URL}/api/auth/logout`,
  REFRESH_URL: `${BASE_URL}/api/auth/refresh`,

  VALIDATE_LOGIN_URL: `${BASE_URL}/api/auth/validateLogin`,
  VALIDATE_EMAIL_URL: `${BASE_URL}/api/auth/validateEmail`,
  VALIDATE_PHONE_URL: `${BASE_URL}/api/auth/validatePhone`,

  // --- user / profile ---
  GET_PROFILE_URL: `${BASE_URL}/api/user/profile`,
  SAVE_PROFILE_ADDRESS_URL: `${BASE_URL}/api/user/profile/address`,
  GET_HEADER_INFO_URL: `${BASE_URL}/api/user/header_info`,
  GET_ACCOUNT_URL: `${BASE_URL}/api/user/account`,
  GET_OPERATION_HISTORY_URL: `${BASE_URL}/api/user/operation_history`,
};
