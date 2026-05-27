import jwtDecode from "jwt-decode";

type JwtDecodeType = {
  login: string;
  iat: number;
  exp: number;
};

export const checkAuth = (): boolean => {
  return localStorage.getItem("accessToken") !== null;
};

export const getAccessToken = (): string => {
  return localStorage.getItem("accessToken") ?? "";
};

export const getRefreshToken = (): string => {
  return localStorage.getItem("refreshToken") ?? "";
};

export const isExpired = (): boolean => {
  const token = localStorage.getItem("accessToken") ?? "";
  if (!token) return true;

  const decodedToken: JwtDecodeType = jwtDecode(token);
  const dateNow = Math.floor(Date.now() / 1000);

  return decodedToken.exp < dateNow;
};