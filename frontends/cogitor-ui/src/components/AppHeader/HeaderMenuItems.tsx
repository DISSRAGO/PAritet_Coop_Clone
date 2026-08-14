// /srv/clone/frontends/cogitor-ui/src/components/AppHeader/HeaderMenuItems.tsx

import {
  LogoutOutlined,
  HomeOutlined,
  WalletOutlined,
  UserOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Avatar, Menu, Badge } from "antd";
import React, { FC, useContext, useEffect, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useMediaQuery } from "react-responsive";

import { AuthContext } from "../../context/AuthContext";
import { useActions } from "../../hooks/useActions";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import { ROUTE_NAMES } from "../../routes/AppRoutesSettings";
import {
  convertBinaryStringToFile,
  DEFAULT_AVATAR_URL,
} from "../../utils/avatar";
import { getAccessToken } from "../../utils/checkAuth";
import { loadDashboard, loadInbox, loadOutbox } from "../../store/reclamationSlice";
import { useDispatch } from "react-redux";

const resolveCurrentSubjectId = (state: any): string => {
  const fromHeader =
    state?.user?.headerInfo?.data?.subjectId ||
    state?.user?.headerInfo?.data?.subject_id ||
    state?.user?.headerInfo?.subjectId ||
    state?.user?.headerInfo?.subject_id;

  if (fromHeader) return String(fromHeader);

  const fromAuth =
    state?.auth?.user?.subjectId ||
    state?.auth?.user?.subject_id ||
    state?.auth?.user?.subject?.subjectId ||
    state?.auth?.user?.subject?.subject_id;

  if (fromAuth) return String(fromAuth);

  const fromProfile =
    state?.user?.profile?.subjectId || state?.user?.profile?.subject_id;

  if (fromProfile) return String(fromProfile);

  console.log("resolveCurrentSubjectId state.user.headerInfo =", state?.user?.headerInfo);
  console.log("resolved subjectId =", fromHeader || fromAuth || fromProfile || "");
  return "";
};

const HeaderMenuItems: FC = () => {
  const { isAuth } = useContext(AuthContext);
  const headerInfo = useTypedSelector((state: any) => state.user.headerInfo);
  const reclamationState = useTypedSelector(
    (state: any) => state.reclamation || {}
  );
  const subjectId = useTypedSelector((state: any) =>
    resolveCurrentSubjectId(state)
  );
  const authUser = useTypedSelector((state: any) => state.auth?.user || null);

  const actions = useActions();
  const dispatch = useDispatch() as any;
  const location = useLocation();
  const navigate = useNavigate();
  const isTabletOrMobile = useMediaQuery({ query: "(max-width: 767px)" });

  useEffect(() => {
    if (getAccessToken()) {
      actions.getHeaderInformation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isAuth || !subjectId) return;

    dispatch(loadDashboard(subjectId));
    dispatch(loadInbox(subjectId));
    dispatch(loadOutbox(subjectId));
  }, [dispatch, isAuth, subjectId]);

  const getAvatar = (): string => {
    if (headerInfo?.data?.photoImage?.binaryContents) {
      return convertBinaryStringToFile(
        headerInfo?.data?.photoImage?.binaryContents ?? "",
        headerInfo?.data?.photoImage?.contentType ?? ""
      );
    }

    return DEFAULT_AVATAR_URL;
  };

  const handleLogout = () => {
    try {
      actions.logout();
    } catch {
      // серверный logout не должен блокировать локальный выход
    }

    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } catch {
      // ignore
    }

    navigate(ROUTE_NAMES.SIGN_IN_PAGE, { replace: true });
    window.location.reload();
  };

  const headerLogin =
    headerInfo?.data?.login ||
    headerInfo?.data?.Login ||
    headerInfo?.data?.userLogin ||
    headerInfo?.data?.user_login;

  const authLogin =
    (authUser &&
      (authUser.login ||
        authUser.Login ||
        authUser.userName ||
        authUser.UserName)) ||
    "";

  const effectiveLogin = String(headerLogin || authLogin || "").trim();
  const isAdmin = effectiveLogin.toLowerCase() === "admin";

  const handleProfileClick = () => {
    if (isAdmin) {
      navigate(ROUTE_NAMES.PROFILE);
    } else {
      navigate(ROUTE_NAMES.EMPTY_NAVIGATOR);
    }
  };

  const selectedKeys: string[] = [];

  if (location.pathname === ROUTE_NAMES.PROFILE) selectedKeys.push("profile");
  if (location.pathname.startsWith(ROUTE_NAMES.EMPTY_NAVIGATOR)) {
    selectedKeys.push("profile");
  }
  if (location.pathname === ROUTE_NAMES.HOME_PAGE) selectedKeys.push("home");
  if (location.pathname === ROUTE_NAMES.BILLING) selectedKeys.push("billing");
  if (location.pathname === ROUTE_NAMES.RECLAMATIONS) {
    selectedKeys.push("reclamations");
  }

  const reclamationsUnreadCount = useMemo(() => {
    const inboxEnvelope = reclamationState?.inbox;
    const outboxEnvelope = reclamationState?.outbox;

    const inbox = Array.isArray(inboxEnvelope?.data)
      ? inboxEnvelope.data
      : Array.isArray(inboxEnvelope)
      ? inboxEnvelope
      : [];

    const outbox = Array.isArray(outboxEnvelope?.data)
      ? outboxEnvelope.data
      : Array.isArray(outboxEnvelope)
      ? outboxEnvelope
      : [];

    let count = 0;

    // Входящие: +1 за "зарегистрировано", +1 за непрочитанные сообщения
    inbox.forEach((item: any) => {
      const status = String(item?.status || "").toLowerCase();
      const unreadMessages =
        Number(item?.unreadCount ?? 0) > 0 || !!item?.hasUnread;

      if (status === "registered") {
        count += 1;
      }

      if (unreadMessages) {
        count += 1;
      }
    });

    // Исходящие: +1 за непрочитанные сообщения
    outbox.forEach((item: any) => {
      const unreadMessages =
        Number(item?.unreadCount ?? 0) > 0 || !!item?.hasUnread;

      if (unreadMessages) {
        count += 1;
      }
    });

    return count;
  }, [reclamationState?.inbox, reclamationState?.outbox]);

  const reclamationsLabel = (
    <Badge
      count={reclamationsUnreadCount}
      size="small"
      offset={[6, -2]}
      color="#ff4d4f"
    >
      <span>Рекламации</span>
    </Badge>
  );

  const authItems = [
    {
      key: "profile",
      icon: <Avatar size={30} src={getAvatar()} />,
      label: <span onClick={handleProfileClick}>Профиль</span>,
    },
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <NavLink to={ROUTE_NAMES.HOME_PAGE}>Главная</NavLink>,
    },
    {
      key: "reclamations",
      icon: <ToolOutlined />,
      label: (
        <NavLink to={ROUTE_NAMES.RECLAMATIONS}>{reclamationsLabel}</NavLink>
      ),
    },
    {
      key: "billing",
      icon: <WalletOutlined />,
      label: <NavLink to={ROUTE_NAMES.BILLING}>Биллинг</NavLink>,
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>Выход</span>,
    },
  ];

  const guestItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: <NavLink to={ROUTE_NAMES.HOME_PAGE}>Главная</NavLink>,
    },
    {
      key: "login",
      icon: <UserOutlined />,
      label: <NavLink to={ROUTE_NAMES.SIGN_IN_PAGE}>Вход</NavLink>,
    },
    {
      key: "register",
      icon: <UserOutlined />,
      label: <NavLink to={ROUTE_NAMES.SIGN_UP}>Регистрация</NavLink>,
    },
  ];

  const items = isAuth ? authItems : guestItems;

  if (isTabletOrMobile) {
    return <Menu mode="inline" selectedKeys={selectedKeys} items={items} />;
  }

  return <Menu mode="horizontal" selectedKeys={selectedKeys} items={items} />;
};

export default HeaderMenuItems;