export const PATH = "/api/";
export const DIRPATH = "/data";

const _origin = (typeof window !== "undefined" && window.location && window.location.origin)
  ? window.location.origin
  : "http://localhost:3001";
export const SITE = _origin + "/";
export const SITE_NAKED = _origin;