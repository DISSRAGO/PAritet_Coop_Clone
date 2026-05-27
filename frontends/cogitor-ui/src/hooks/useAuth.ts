import React from "react";
import {AuthContext} from "../context/AuthContext";

export function useAuth() {
  return React.useContext(AuthContext);
}
