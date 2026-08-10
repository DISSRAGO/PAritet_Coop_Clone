// src/pages/ProfilePage/ProfilePage.tsx
import { Menu } from "antd";
import React, { FC, useEffect, useMemo, useState } from "react";

import { useActions } from "../../hooks/useActions";
import { useTypedSelector } from "../../hooks/useTypedSelector";
import "./ProfilePage.less";
import ProfileAddress from "./components/ProfileAddress";
import NotificationPage from "./components/ProfileNotifications";

import ThankaService, {
    ThankaTypeSector,
    ThankaSummary,
} from "../../api/thanka";
import { ThankaWheel } from "../../components/Viewer/ThankaWheel.jsx";
import { ROUTE_NAMES } from "../../routes/AppRoutesSettings";

const menuTitle = ["Профиль", "Адрес", "Уведомления", "Поручительство"];

const ProfilePage: FC = () => {
    const { getProfile } = useActions();

    const [selectedKey, setSelectedKey] = useState(0);

    const [sectors, setSectors] = useState<ThankaTypeSector[]>([]);
    const [selectedSector, setSelectedSector] = useState<ThankaTypeSector | null>(null);
    const [thankas, setThankas] = useState<ThankaSummary[]>([]);
    const [loadingThankas, setLoadingThankas] = useState(false);

    const headerInfo = useTypedSelector((state) => state?.user?.headerInfo);
    const subjectId = headerInfo?.data?.subjectId || "";

    const guarantorApiBase = `${window.location.origin}/api/profile/guarantor`;

    const guarantorSubjectsMenuTitles = ["Подтверждённые", "Заявки"];
    const guarantorSubjectsMenuItems = guarantorSubjectsMenuTitles.map((title) => ({
        key: title,
        label: title,
    }));

    const [selectedGuarantorSubjectsTab, setSelectedGuarantorSubjectsTab] = useState("Подтверждённые");
    const [guarantorInfo, setGuarantorInfo] = useState<any>(null);
    const [guarantorLoading, setGuarantorLoading] = useState(false);
    const [guarantorError, setGuarantorError] = useState("");
    const [guarantorLoginOrEmail, setGuarantorLoginOrEmail] = useState("");
    const [showGuarantorRequestForm, setShowGuarantorRequestForm] = useState(true);

    const [guaranteedSubjects, setGuaranteedSubjects] = useState<any[]>([]);
    const [guaranteedSubjectsLoading, setGuaranteedSubjectsLoading] = useState(false);
    const [guaranteedSubjectsError, setGuaranteedSubjectsError] = useState("");

    useEffect(() => {
        getProfile();
    }, [getProfile]);

    useEffect(() => {
        let cancelled = false;

        async function loadTypes() {
            try {
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
                } else {
                    setThankas([]);
                }
            } catch (e) {
                console.error("Failed to load thanka types in profile", e);
            } finally {
                if (!cancelled) {
                    setLoadingThankas(false);
                }
            }
        }

        loadTypes();

        return () => {
            cancelled = true;
        };
    }, []);

    const parseApiError = async (response: Response) => {
        try {
            const payload = await response.json();
            if (typeof payload?.detail === "string") return payload.detail;
            if (Array.isArray(payload?.detail)) {
                return payload.detail.map((x: any) => x?.msg || JSON.stringify(x)).join("; ");
            }
            return payload?.message || payload?.error || "Ошибка запроса";
        } catch (e) {
            return "Ошибка запроса";
        }
    };

    const loadGuarantor = async () => {
        if (!subjectId) {
            setGuarantorError("Не найден subjectId текущего пользователя");
            setGuarantorInfo(null);
            return;
        }

        setGuarantorLoading(true);
        setGuarantorError("");

        try {
            const response = await fetch(
                `${guarantorApiBase}?subject_id=${encodeURIComponent(subjectId)}`,
                { method: "GET" }
            );

            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }

            const result = await response.json();
            const info = result?.data || null;
            setGuarantorInfo(info);
            setShowGuarantorRequestForm(!info?.guarantorSubjectId);
        } catch (e: any) {
            setGuarantorInfo(null);
            setGuarantorError(e?.message || "Не удалось загрузить поручителя");
        } finally {
            setGuarantorLoading(false);
        }
    };

    const loadGuaranteedSubjects = async () => {
        if (!subjectId) {
            setGuaranteedSubjects([]);
            setGuaranteedSubjectsError("");
            return;
        }

        setGuaranteedSubjectsLoading(true);
        setGuaranteedSubjectsError("");

        try {
            const response = await fetch(
                `${guarantorApiBase}/subjects?guarantor_subject_id=${encodeURIComponent(subjectId)}`,
                { method: "GET" }
            );

            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }

            const result = await response.json();
            setGuaranteedSubjects(result?.data || []);
        } catch (e: any) {
            setGuaranteedSubjects([]);
            setGuaranteedSubjectsError(e?.message || "Не удалось загрузить список поручительств");
        } finally {
            setGuaranteedSubjectsLoading(false);
        }
    };

    const requestGuarantor = async () => {
        if (!subjectId) {
            setGuarantorError("Не найден actorSubjectId");
            return;
        }

        if (!guarantorLoginOrEmail || guarantorLoginOrEmail.trim() === "") {
            setGuarantorError("Укажите логин или email поручителя");
            return;
        }

        setGuarantorLoading(true);
        setGuarantorError("");

        try {
            const response = await fetch(`${guarantorApiBase}/request`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    actorSubjectId: subjectId,
                    guarantorLoginOrEmail: guarantorLoginOrEmail.trim(),
                }),
            });

            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }

            const result = await response.json();
            setGuarantorInfo(result?.data || null);
            setGuarantorLoginOrEmail("");
            setShowGuarantorRequestForm(false);
            await loadGuaranteedSubjects();
        } catch (e: any) {
            setGuarantorError(e?.message || "Не удалось запросить поручителя");
        } finally {
            setGuarantorLoading(false);
        }
    };

    const confirmGuarantorForSubject = async (targetSubjectId: string) => {
        if (!subjectId) {
            setGuarantorError("Не найден subjectId текущего пользователя");
            return;
        }

        if (!targetSubjectId) {
            setGuarantorError("Не найден subjectId для подтверждения");
            return;
        }

        setGuarantorLoading(true);
        setGuarantorError("");

        try {
            const response = await fetch(`${guarantorApiBase}/confirm`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    actorSubjectId: subjectId,
                    subjectId: targetSubjectId,
                }),
            });

            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }

            const result = await response.json();

            if (guarantorInfo?.subjectId === targetSubjectId) {
                setGuarantorInfo(result?.data || null);
            }

            await loadGuarantor();
            await loadGuaranteedSubjects();
        } catch (e: any) {
            setGuarantorError(e?.message || "Не удалось подтвердить поручительство");
        } finally {
            setGuarantorLoading(false);
        }
    };

    const rejectGuarantorForSubject = async (targetSubjectId: string) => {
        if (!subjectId) {
            setGuarantorError("Не найден subjectId текущего пользователя");
            return;
        }

        if (!targetSubjectId) {
            setGuarantorError("Не найден subjectId для отклонения");
            return;
        }

        setGuarantorLoading(true);
        setGuarantorError("");

        try {
            const response = await fetch(`${guarantorApiBase}/reject`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    actorSubjectId: subjectId,
                    subjectId: targetSubjectId,
                }),
            });

            if (!response.ok) {
                throw new Error(await parseApiError(response));
            }

            if (guarantorInfo?.subjectId === targetSubjectId) {
                const result = await response.json();
                setGuarantorInfo(result?.data || null);
            }

            await loadGuarantor();
            await loadGuaranteedSubjects();
        } catch (e: any) {
            setGuarantorError(e?.message || "Не удалось отклонить поручительство");
        } finally {
            setGuarantorLoading(false);
        }
    };

    useEffect(() => {
        if (menuTitle[selectedKey] === "Поручительство") {
            loadGuarantor();
            loadGuaranteedSubjects();
        }
    }, [selectedKey, subjectId]);

    const selectKey = (key: any) => {
        if (key.key === "Профиль") {
            setSelectedKey(0);
        } else if (key.key === "Адрес") {
            setSelectedKey(1);
        } else if (key.key === "Уведомления") {
            setSelectedKey(2);
        } else {
            setSelectedKey(3);
        }
    };

    const onGuarantorSubjectsTabClick = (e: any) => {
        if (e?.key) setSelectedGuarantorSubjectsTab(e.key);
    };

    const handleTypeClick = async (sector: ThankaTypeSector) => {
        setSelectedSector(sector);
        try {
            setLoadingThankas(true);
            const items = await ThankaService.getThankasByType(sector.code);
            setThankas(items);
        } catch (e) {
            console.error("Failed to load thankas by type in profile", e);
        } finally {
            setLoadingThankas(false);
        }
    };

    // Нормализация: по каждому subjectId оставляем одну запись,
    // приоритет confirmed > pending, при равном статусе берём более позднюю дату.
    const latestBySubject = useMemo(() => {
        const map = new Map<string, any>();

        const rankStatus = (status: string) => {
            if (status === "confirmed") return 2;
            if (status === "pending") return 1;
            return 0;
        };

        const rankDate = (item: any) =>
            item.confirmedAt || item.requestedAt || "";

        for (const item of guaranteedSubjects) {
            if (!item?.subjectId) continue;

            const existing = map.get(item.subjectId);

            if (!existing) {
                map.set(item.subjectId, item);
                continue;
            }

            const existingRank = rankStatus(existing.status);
            const currentRank = rankStatus(item.status);

            if (currentRank > existingRank) {
                map.set(item.subjectId, item);
                continue;
            }

            if (currentRank === existingRank) {
                const existingDate = rankDate(existing);
                const currentDate = rankDate(item);

                if (currentDate > existingDate) {
                    map.set(item.subjectId, item);
                }
            }
        }

        return Array.from(map.values());
    }, [guaranteedSubjects]);

    const confirmedSubjects = useMemo(
        () => latestBySubject.filter((item: any) => item.status === "confirmed"),
        [latestBySubject]
    );

    const pendingSubjects = useMemo(
        () => latestBySubject.filter((item: any) => item.status === "pending"),
        [latestBySubject]
    );

    const shownGuaranteedSubjects =
        selectedGuarantorSubjectsTab === "Подтверждённые"
            ? confirmedSubjects
            : pendingSubjects;

    function renderRightMenu() {
        if (menuTitle[selectedKey] === "Профиль") {
            return (
                <>
                    {sectors.length > 0 && (
                        <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
                            <ThankaWheel
                                sectors={sectors as never[]}
                                selected={(selectedSector?.code ?? null) as null}
                                onSelect={(code: string) => {
                                    const sector = sectors.find((s) => s.code === code);
                                    if (sector) {
                                        handleTypeClick(sector);
                                    }
                                }}
                                size={340}
                                centerLabel="admin"
                            />
                        </div>
                    )}

                    {loadingThankas ? (
                        <div style={{ marginTop: 24 }}>Загрузка тханок выбранного типа…</div>
                    ) : thankas.length > 0 ? (
                        <div style={{ marginTop: 24 }}>
                            <h3>
                                Тханки выбранного типа{" "}
                                {selectedSector ? `«${selectedSector.name}»` : ""}
                            </h3>
                            <ul style={{ paddingLeft: 20 }}>
                                {thankas.map((th: any) => (
                                    <li key={th.id || th.ID || th.title}>
                                        {th.title} ({th.status})
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : null}
                </>
            );
        }

        if (menuTitle[selectedKey] === "Адрес") {
            return <ProfileAddress />;
        }

        if (menuTitle[selectedKey] === "Уведомления") {
            return <NotificationPage />;
        }

        if (menuTitle[selectedKey] === "Поручительство") {
            return (
                <div style={{ paddingTop: 8 }}>
                    {!subjectId && (
                        <p style={{ color: "red" }}>Не удалось определить id текущего пользователя.</p>
                    )}

                    {subjectId && guarantorInfo?.guarantorSubjectId && !showGuarantorRequestForm && (
                        <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <button onClick={() => setShowGuarantorRequestForm(true)}>Сменить</button>
                            <button onClick={loadGuarantor}>Обновить</button>
                        </div>
                    )}

                    {subjectId && showGuarantorRequestForm && (
                        <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                            <input
                                type="text"
                                value={guarantorLoginOrEmail}
                                onChange={(e) => setGuarantorLoginOrEmail(e.target.value)}
                                placeholder="Логин или email поручителя"
                                style={{ minWidth: 260, padding: 6 }}
                            />
                            <button onClick={requestGuarantor}>Запросить поручителя</button>
                            <button onClick={loadGuarantor}>Обновить</button>
                        </div>
                    )}

                    {guarantorLoading && <p>Загрузка...</p>}
                    {guarantorError && <p style={{ color: "red" }}>{guarantorError}</p>}

                    {!guarantorLoading && !guarantorError && !guarantorInfo && subjectId && (
                        <p>Поручитель не назначен.</p>
                    )}

                    {guarantorInfo && (
                        <div style={{ marginBottom: 24 }}>
                            <p><b>Статус: </b>{guarantorInfo.status}</p>

                            {guarantorInfo.guarantorDisplayName && (
                                <p><b>Поручитель: </b>{guarantorInfo.guarantorDisplayName}</p>
                            )}

                            {guarantorInfo.guarantorSubjectId && (
                                <p><b>ID поручителя: </b>{guarantorInfo.guarantorSubjectId}</p>
                            )}

                            {guarantorInfo.subjectId && (
                                <p><b>ID субъекта: </b>{guarantorInfo.subjectId}</p>
                            )}

                            {guarantorInfo.requestedAt && (
                                <p><b>Запрошен: </b>{guarantorInfo.requestedAt}</p>
                            )}

                            {guarantorInfo.confirmedAt && (
                                <p><b>Подтверждён: </b>{guarantorInfo.confirmedAt}</p>
                            )}

                            {guarantorInfo.rejectedAt && (
                                <p><b>Отклонён: </b>{guarantorInfo.rejectedAt}</p>
                            )}

                            {guarantorInfo.revokedAt && (
                                <p><b>Отозван: </b>{guarantorInfo.revokedAt}</p>
                            )}

                            {guarantorInfo.isDefault !== undefined && (
                                <p><b>По умолчанию: </b>{guarantorInfo.isDefault ? "Да" : "Нет"}</p>
                            )}
                        </div>
                    )}

                    <div style={{ marginTop: 16 }}>
                        <h4>Подчинённые поручителя</h4>

                        <Menu
                            mode="horizontal"
                            items={guarantorSubjectsMenuItems}
                            selectedKeys={[selectedGuarantorSubjectsTab]}
                            onClick={onGuarantorSubjectsTabClick}
                            style={{ marginBottom: 16 }}
                        />

                        {guaranteedSubjectsLoading && <p>Загрузка списка поручительств...</p>}
                        {guaranteedSubjectsError && <p style={{ color: "red" }}>{guaranteedSubjectsError}</p>}

                        {!guaranteedSubjectsLoading && !guaranteedSubjectsError && shownGuaranteedSubjects.length === 0 && (
                            <p>
                                {selectedGuarantorSubjectsTab === "Подтверждённые"
                                    ? "Подтверждённых поручительств пока нет."
                                    : "Заявок на подтверждение пока нет."}
                            </p>
                        )}

                        {!guaranteedSubjectsLoading && !guaranteedSubjectsError && shownGuaranteedSubjects.length > 0 && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                {shownGuaranteedSubjects.map((item: any) => (
                                    <div
                                        key={`${item.subjectId}-${item.status}-${item.requestedAt || item.confirmedAt || ""}`}
                                        style={{
                                            border: "1px solid #d9d9d9",
                                            padding: 12,
                                            borderRadius: 4,
                                            background: "#fff",
                                        }}
                                    >
                                        <p><b>Пользователь: </b>{item.displayName || "Без имени"}</p>
                                        <p><b>ID субъекта: </b>{item.subjectId}</p>
                                        <p><b>Статус: </b>{item.status}</p>

                                        {item.requestedAt && <p><b>Запрошен: </b>{item.requestedAt}</p>}
                                        {item.confirmedAt && <p><b>Подтверждён: </b>{item.confirmedAt}</p>}
                                        {item.isDefault !== undefined && (
                                            <p><b>По умолчанию: </b>{item.isDefault ? "Да" : "Нет"}</p>
                                        )}

                                        {item.status === "pending" && (
                                            <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
                                                <button onClick={() => confirmGuarantorForSubject(item.subjectId)}>
                                                    Подтвердить
                                                </button>
                                                <button onClick={() => rejectGuarantorForSubject(item.subjectId)}>
                                                    Отклонить
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return null;
    }

    return (
        <div className="profile-page">
            <Menu
                mode="horizontal"
                className="profile-tabs-menu"
                selectedKeys={[menuTitle[selectedKey]]}
                onClick={selectKey}
                items={menuTitle.map((title) => ({
                    key: title,
                    label: title,
                }))}
            />
            <div className="profile-page-content">
                {renderRightMenu()}
            </div>
        </div>
    );
};

export default ProfilePage;