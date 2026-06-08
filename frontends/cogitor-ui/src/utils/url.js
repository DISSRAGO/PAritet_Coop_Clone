// export const PATH = "http://backend.stend.cogi.teka.ru/cogiAPI/";
export const PATH = "/api/";
export const DIRPATH = "/data";

// SITE / SITE_NAKED — базовый URL самого фронта (для билда внутренних
// навигационных ссылок). Раньше было жёстко забито localhost:3001 —
// это ломало навигацию с внешнего домена: ссылки вели на
// localhost самого пользователя вместо домена. Берём из window.location,
// чтобы работало на любом origin (dev/prod, домен или localhost).
const _origin = (typeof window !== "undefined" && window.location && window.location.origin)
  ? window.location.origin
  : "http://localhost:3001";
export const SITE = _origin + "/";
export const SITE_NAKED = _origin;