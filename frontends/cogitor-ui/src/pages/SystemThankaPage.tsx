// src/pages/SystemThankaPage.tsx
import React, { useEffect, useState } from "react";
import { Spin, Alert, Typography } from "antd";
import { Link } from "react-router-dom";

import { useTypedSelector } from "../hooks/useTypedSelector";
import ThankaService, { SystemRootResponse } from "../api/thanka";
import AdminSystemRootWheel from "../components/Viewer/AdminSystemRootWheel";

const { Title, Text } = Typography;

const FALLBACK_SYSTEM_ROOT_THANKA_ID = "00000000-0000-0000-0000-000000000010";

const SystemThankaPage: React.FC = () => {
  const userProfile = useTypedSelector((s) => s.user.userProfile);

  const login =
    (userProfile?.data as any)?.Login ||
    (userProfile?.data as any)?.login ||
    "admin";

  const displayName =
    (userProfile?.data as any)?.Name ||
    (userProfile?.data as any)?.DisplayName ||
    "Системный администратор";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [systemRoot, setSystemRoot] = useState<SystemRootResponse | null>(null);

  // Грузим только данные системной тханки (заголовок страницы).
  // Колесо типов и список тханок — в AdminSystemRootWheel.
  useEffect(() => {
    let cancelled = false;

    async function loadRoot() {
      try {
        setLoading(true);
        setError(null);
        const root = await ThankaService.getSystemRoot();
        if (!cancelled) setSystemRoot(root);
      } catch (e: any) {
        if (!cancelled)
          setError(e?.message || "Не удалось загрузить системную тханку");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadRoot();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <Spin />
      </div>
    );
  }

  const systemRootId = systemRoot?.thankaId || FALLBACK_SYSTEM_ROOT_THANKA_ID;

  return (
    <div style={{ padding: 24 }}>

      {/* ── блок описания системной тханки ── */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2}>Главная страница</Title>
        <Text>
          Системная корневая тханка (ID: {systemRootId}), автор:{" "}
          <b>{login}</b>, имя: <b>{displayName}</b>.
        </Text>
        <br />
        <Link to="/profile" style={{ marginTop: 8, display: "inline-block" }}>
          Перейти в профиль администратора
        </Link>
      </div>

      {/* ── ошибка загрузки системной тханки ── */}
      {error && (
        <Alert
          type="error"
          message="Ошибка"
          description={error}
          style={{ marginBottom: 16 }}
        />
      )}

      {/* ── типы содержимого: колесо + список тханок ──
          Вся логика загрузки и отображения вынесена в AdminSystemRootWheel,
          чтобы тот же компонент работал и в ЛК (SiteComponent, cabinet).
      */}
      <div style={{ marginTop: 8 }}>
        <Title level={3}>Типы содержимого</Title>
        <AdminSystemRootWheel login={login} size={360} />
      </div>

    </div>
  );
};

export default SystemThankaPage;