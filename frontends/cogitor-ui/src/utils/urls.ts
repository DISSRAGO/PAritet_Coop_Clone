// BASE_URL пустая = same-origin (все запросы пойдут на тот же хост/
// порт/схему что и страница). Это правильный вариант и для dev,
// и для prod:
//
//   • dev (localhost:3001 или SSH-туннель): /api/* уходит на :3001,
//     там webpack-dev-server proxy (см. webpack.config.ts → devServer.proxy)
//     пересылает на backend :8000.
//
//   • prod-домен (https://dev.clone.paritet.club): /api/* уходит на
//     reverse-proxy админа → :3001 → webpack proxy → backend :8000.
//     Позже, когда мы переедем на нормальный prod-деплой
//     (сборка статики + nginx прямо на backend), эта логика не изменится —
//     same-origin работает везде.
//
// Раньше было "http://127.0.0.1:8000" — это ломало всё при доступе
// с внешнего домена: браузер пытался достучаться до своего
// собственного localhost:8000 → Failed to fetch.
//
// Через env REACT_APP_API_BASE_URL можно переопределить (прокидывается
// в бандл через webpack.DefinePlugin в webpack.config.ts).
//
// Безопасное чтение: в браузере нет глобального process, и если вдруг
// DefinePlugin отключили — обращение к process.env.* бросит ReferenceError
// прямо на импорте и вырубит весь бандл. Используем try/catch.
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

  // На бэке маршруты реализованы в REST-стиле с подресурсом
  // (POST /api/auth/validate/{login|email|phone}) — см.
  // backend/modules/cogiteka/routers/auth.py. Раньше фронт
  // использовал camelCase без слеша ("/validateLogin") — получал
  // 404 на каждом открытии /signup и показывал 3 красных
  // тоста "Not Found" поверх формы.
  VALIDATE_LOGIN_URL: `${BASE_URL}/api/auth/validate/login`,
  VALIDATE_EMAIL_URL: `${BASE_URL}/api/auth/validate/email`,
  VALIDATE_PHONE_URL: `${BASE_URL}/api/auth/validate/phone`,

  // --- user / profile ---
  GET_PROFILE_URL: `${BASE_URL}/api/user/profile`,
  SAVE_PROFILE_ADDRESS_URL: `${BASE_URL}/api/user/profile/address`,
  GET_HEADER_INFO_URL: `${BASE_URL}/api/user/header_info`,
  GET_ACCOUNT_URL: `${BASE_URL}/api/user/account`,
  GET_OPERATION_HISTORY_URL: `${BASE_URL}/api/user/operation_history`,
};
