import jwtdecode from "jwt-decode";
import React, { FC, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { useActions } from "../hooks/useActions";
import { useTypedSelector } from "../hooks/useTypedSelector";
import { FetchStatus } from "../store/types/fetchTypes";

export type DecodedToken = {
  readonly exp: number;
  readonly iat: number;
  readonly login: string;
};

export interface AuthState {
  isAuth: boolean;
}

const AuthContext = React.createContext<AuthState>({ isAuth: false });

const AuthContextProvider: FC<any> = ({ children }) => {
  const location = useLocation();
  const { logout } = useActions();
  const [isAuth, setIsAuth] = useState(false);

  const logoutRequestStatus = useTypedSelector(
    (state: any) => state.auth.logoutRequestStatus
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setIsAuth(false);
      return;
    }

    try {
      const decodedToken: DecodedToken = jwtdecode(token);
      const isExpired = new Date(decodedToken.exp * 1000) < new Date();

      if (isExpired) {
        setIsAuth(false);
        logout();
      } else {
        setIsAuth(true);
      }
    } catch (error) {
      console.error("Failed to decode accessToken", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsAuth(false);
    }
  }, [location]);

  useEffect(() => {
    if (logoutRequestStatus?.status === FetchStatus.SUCCESS) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.reload();
    }
  }, [logoutRequestStatus]);

  const getAccessToken = (): string | null => {
    return localStorage.getItem("accessToken");
  };

  const getBDToken = (): string | null => {
    return localStorage.getItem("bdtoken");
  };

  const decodeToken = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    try {
      const decodedToken: DecodedToken = jwtdecode(token);
      return decodedToken;
    } catch (error) {
      console.error("Failed to decode token in decodeToken()", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthContextProvider };