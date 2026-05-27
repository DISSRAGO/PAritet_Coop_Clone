import React from "react";
import {Navigate, useLocation} from "react-router-dom";
import {useAuth} from "../hooks/useAuth";

export const ROUTE_NAMES = {
  HOME_PAGE: "/",
  NAVIGATOR: "/navigator/:thankaId",
  SITE_PAGE: "sitepage/:sitePageId",
  EMPTY_NAVIGATOR: "/navigator/",
  EDIT_PAGE: "/edit",
  ADD_PAGE: "/add",
  STORY_PAGE: "/story",
  COMMENTS_PAGE: "/comments",
  CREATE_PAGE: "/create",
  CREATE_SITE: "/createsite",
  EDIT_SITE: "/editsite",
  SIGN_IN_PAGE: "/login",
  CONFIRM_PAGE: '/confirm',
  PROFILE: "/profile",
  ADMIN: "/admin",
  BILLING: "/billing",
  SIGN_UP: "/sign-up",
  ERROR: "/404"
}

