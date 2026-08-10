// src/components/Viewer/AdminSystemRootWheel.tsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Spin, Alert, Typography } from "antd";
import { ThankaWheel as ThankaWheelRaw } from "./ThankaWheel.jsx";
const ThankaWheel = ThankaWheelRaw as any;
import ThankaService, {
  ThankaTypeSector,
  ThankaSummary,
} from "../../api/thanka";

const { Title, Text } = Typography;

interface Props {
  login?: string;
  size?: number;
}

const AdminSystemRootWheel: React.FC<Props> = ({ login = "admin", size = 360 }) => {
  const [sectors, setSectors] = useState<ThankaTypeSector[]>([]);
  const [selectedSector, setSelectedSector] = useState<ThankaTypeSector | null>(null);
  const [thankas, setThankas] = useState<ThankaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingThankas, setLoadingThankas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        setLoading(true);
        setError(null);
        const types = await ThankaService.getTypeSectors();
        if (cancelled) return;

        setSectors(types);

        if (types.length > 0) {
          const first = types[0];
          setSelectedSector(first);
          setLoadingThankas(true);
          const items = await ThankaService.getThankasByType(first.code);
          if (!cancelled) {
            setThankas(items);
          }
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Ошибка загрузки типов");
      } finally {
        if (!cancelled) {
          setLoading(false);
          setLoadingThankas(false);
        }
      }
    }

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSelect = async (sector: ThankaTypeSector) => {
    setSelectedSector(sector);
    setError(null);
    try {
      setLoadingThankas(true);
      const items = await ThankaService.getThankasByType(sector.code);
      setThankas(items);
    } catch (e: any) {
      setError(e?.message || "Ошибка загрузки тханок");
    } finally {
      setLoadingThankas(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <Spin />
      </div>
    );
  }

  if (error && sectors.length === 0) {
    return (
      <Alert
        type="error"
        message="Ошибка"
        description={error}
        style={{ marginBottom: 16 }}
      />
    );
  }

  if (sectors.length === 0) {
    return <Text type="secondary">Типы содержимого не настроены.</Text>;
  }

  return (
    <div>
      {/* ── кнопки-фильтры по типам ── */}
      <div style={{ display: "flex", flexWrap: "wrap", marginBottom: 12 }}>
        {sectors.map((s) => (
          <button
            key={s.code}
            onClick={() => handleSelect(s)}
            style={{
              marginRight: 8,
              marginBottom: 8,
              padding: "4px 10px",
              borderRadius: 4,
              border:
                s.code === selectedSector?.code
                  ? "1px solid #1890ff"
                  : "1px solid #d9d9d9",
              backgroundColor:
                s.code === selectedSector?.code ? "#e6f7ff" : "#fff",
              cursor: "pointer",
            }}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* ── SVG-колесо ── */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <ThankaWheel
          sectors={sectors}
          selected={selectedSector?.code ?? undefined}
          onSelect={(code: string) => {
            const s = sectors.find((x) => x.code === code);
            if (s) handleSelect(s);
          }}
          size={size}
          centerLabel={login}
        />
      </div>

      {/* ── ошибка загрузки тханок (тип выбран, но список не загрузился) ── */}
      {error && (
        <Alert
          type="warning"
          message={error}
          style={{ marginBottom: 12 }}
        />
      )}

      {/* ── список тханок выбранного типа ── */}
      <div>
        <Title level={4} style={{ marginBottom: 8 }}>
          {selectedSector
            ? `«${selectedSector.name}» — тханки`
            : "Тханки"}
        </Title>

        {loadingThankas ? (
          <Spin size="small" />
        ) : thankas.length === 0 ? (
          <Text type="secondary">
            Тханок типа «{selectedSector?.name}» нет.
          </Text>
        ) : (
          <ul style={{ padding: 0, listStyle: "none", margin: 0 }}>
            {thankas.map((th) => (
              <li key={th.thankaId} style={{ marginBottom: 4 }}>
                <Link to={`/thanka/${th.thankaId}`}>
                  {th.title}
                </Link>{" "}
                <Text type="secondary">({th.status})</Text>
                {th.createdAt && (
                  <Text
                    type="secondary"
                    style={{ fontSize: 12, marginLeft: 8 }}
                  >
                    {new Date(th.createdAt).toLocaleString()}
                  </Text>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminSystemRootWheel;