export const BASE_URL = "http://127.0.0.1:8000";

export const Urls = {
  LOGIN_URL: `${BASE_URL}/api/auth/login`,
  REGISTER_URL: `${BASE_URL}/api/auth/signUp`,
  REGISTER_CONFIRM_URL: `${BASE_URL}/api/auth/confirm`,
  LOGOUT_URL: `${BASE_URL}/api/auth/logout`,
  REFRESH_URL: `${BASE_URL}/api/auth/refresh`,

  VALIDATE_LOGIN_URL: `${BASE_URL}/api/auth/validateLogin`,
  VALIDATE_EMAIL_URL: `${BASE_URL}/api/auth/validateEmail`,
  VALIDATE_PHONE_URL: `${BASE_URL}/api/auth/validatePhone`,
};