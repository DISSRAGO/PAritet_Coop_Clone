import React, { useCallback, useState } from "react";
import SubjectService, {
  SubjectAccountItem,
  SubjectCard,
  SubjectContributionItem,
  SubjectDealItem,
  SubjectDecisionItem,
  SubjectListingItem,
  SubjectObjectItem,
  SubjectObjectsResponse,
  SubjectSummary,
  SubjectThankaItem,
} from "../../services/SubjectService";

// ---------------------------------------------------------------------------
// PersonalSubjectPage — dev-страница для проверки subject API (Stage 3).
// ---------------------------------------------------------------------------
// Назначение:
//   1) Создать personal subject (UC-03) — поле «логин + ФИО».
//   2) Посмотреть карточку (SubjectCard) и summary-счётчики.
//   3) Перелистывать домены владельца (тханки/листинги/сделки/решения/вклады/
//      счета) через resolver-ручки PR 1.
//   4) Дёрнуть единую ручку /objects (PR 2) — смешанная лента.
//
// Стилизация — inline (соответствует существующему стилю страницы), без
// тяжёлых UI-зависимостей: задача — показать API, а не «дизайн».
// ---------------------------------------------------------------------------

type DomainTab =
  | "summary"
  | "thankas"
  | "listings"
  | "deals"
  | "decisions"
  | "contributions"
  | "accounts"
  | "objects";

const TAB_LABELS: Record<DomainTab, string> = {
  summary: "Сводка",
  thankas: "Тханки",
  listings: "Листинги",
  deals: "Сделки",
  decisions: "Решения",
  contributions: "Вклады",
  accounts: "Счета",
  objects: "Всё вместе",
};

const TAB_ORDER: DomainTab[] = [
  "summary",
  "thankas",
  "listings",
  "deals",
  "decisions",
  "contributions",
  "accounts",
  "objects",
];

const PersonalSubjectPage: React.FC = () => {
  // ----- форма создания -----
  const [authUserLogin, setAuthUserLogin] = useState("");
  const [surname, setSurname] = useState("");
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");

  // ----- общий стейт -----
  const [subjectId, setSubjectId] = useState<string>("");
  const [subjectCard, setSubjectCard] = useState<SubjectCard | null>(null);
  const [activeTab, setActiveTab] = useState<DomainTab>("summary");
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  // ----- данные по вкладкам -----
  const [summary, setSummary] = useState<SubjectSummary | null>(null);
  const [thankas, setThankas] = useState<SubjectThankaItem[] | null>(null);
  const [listings, setListings] = useState<SubjectListingItem[] | null>(null);
  const [deals, setDeals] = useState<SubjectDealItem[] | null>(null);
  const [decisions, setDecisions] = useState<SubjectDecisionItem[] | null>(null);
  const [contributions, setContributions] = useState<SubjectContributionItem[] | null>(null);
  const [accounts, setAccounts] = useState<SubjectAccountItem[] | null>(null);
  const [objects, setObjects] = useState<SubjectObjectsResponse | null>(null);

  // ----- handlers ---------------------------------------------------------

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorText("");
    setSuccessText("");

    try {
      const created = await SubjectService.createPersonalSubject({
        authUserLogin,
        surname,
        firstName,
        secondName: secondName || undefined,
      });
      setSubjectId(created.subjectId);
      setSuccessText(`Personal subject создан: ${created.subjectId}`);

      const card = await SubjectService.getSubjectCard(created.subjectId);
      setSubjectCard(card);
    } catch (err: any) {
      setErrorText(err?.message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadById = async () => {
    if (!subjectId) return;
    setLoading(true);
    setErrorText("");
    setSuccessText("");
    setSubjectCard(null);
    try {
      const card = await SubjectService.getSubjectCard(subjectId);
      setSubjectCard(card);
    } catch (err: any) {
      setErrorText(err?.message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  const loadTab = useCallback(
    async (tab: DomainTab) => {
      if (!subjectId) return;
      setLoading(true);
      setErrorText("");
      try {
        switch (tab) {
          case "summary":
            setSummary(await SubjectService.getSummary(subjectId));
            break;
          case "thankas":
            setThankas((await SubjectService.getThankas(subjectId)).items);
            break;
          case "listings":
            setListings((await SubjectService.getListings(subjectId)).items);
            break;
          case "deals":
            setDeals((await SubjectService.getDeals(subjectId)).items);
            break;
          case "decisions":
            setDecisions((await SubjectService.getDecisions(subjectId)).items);
            break;
          case "contributions":
            setContributions((await SubjectService.getContributions(subjectId)).items);
            break;
          case "accounts":
            setAccounts((await SubjectService.getAccounts(subjectId)).items);
            break;
          case "objects":
            setObjects(await SubjectService.getObjects(subjectId));
            break;
        }
      } catch (err: any) {
        setErrorText(err?.message || "Неизвестная ошибка");
      } finally {
        setLoading(false);
      }
    },
    [subjectId],
  );

  const switchTab = (tab: DomainTab) => {
    setActiveTab(tab);
    loadTab(tab);
  };

  // ----- styles -----------------------------------------------------------

  const inputStyle: React.CSSProperties = {
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: 6,
    fontSize: 14,
  };

  const buttonStyle: React.CSSProperties = {
    padding: "8px 14px",
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "white",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  };

  const tabButtonStyle = (active: boolean): React.CSSProperties => ({
    padding: "6px 12px",
    border: "1px solid",
    borderColor: active ? "#2563eb" : "#ddd",
    background: active ? "#2563eb" : "white",
    color: active ? "white" : "#333",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
  });

  // ----- render -----------------------------------------------------------

  return (
    <div style={{ maxWidth: 960, margin: "32px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif" }}>
      <h1>Personal subject — отладочная панель</h1>
      <p style={{ color: "#555" }}>
        Создание personal subject (UC-03), карточка и просмотр кросс-доменных
        выборок через единый subjectId.
      </p>

      {/* --- форма создания --- */}
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>Создать personal subject</h2>
        <form onSubmit={handleCreate} style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr" }}>
          <input style={inputStyle} placeholder="Логин auth-пользователя" value={authUserLogin}
                 onChange={(e) => setAuthUserLogin(e.target.value)} />
          <input style={inputStyle} placeholder="Фамилия" value={surname}
                 onChange={(e) => setSurname(e.target.value)} />
          <input style={inputStyle} placeholder="Имя" value={firstName}
                 onChange={(e) => setFirstName(e.target.value)} />
          <input style={inputStyle} placeholder="Отчество (необязательно)" value={secondName}
                 onChange={(e) => setSecondName(e.target.value)} />
          <button type="submit" disabled={loading} style={{ ...buttonStyle, gridColumn: "1 / -1" }}>
            {loading ? "Создание..." : "Создать personal subject"}
          </button>
        </form>
      </section>

      {/* --- поиск по UUID --- */}
      <section style={{ marginTop: 24 }}>
        <h2 style={{ fontSize: 18 }}>Открыть существующий subject</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            placeholder="UUID subject'а"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value.trim())}
          />
          <button onClick={handleLoadById} disabled={loading || !subjectId} style={buttonStyle}>
            Загрузить карточку
          </button>
        </div>
      </section>

      {/* --- статусы --- */}
      {errorText && (
        <div style={{ marginTop: 16, padding: 10, background: "#fee", color: "#b00020", borderRadius: 6 }}>
          Ошибка: {errorText}
        </div>
      )}
      {successText && (
        <div style={{ marginTop: 16, padding: 10, background: "#eaf7ec", color: "#0a7a2f", borderRadius: 6 }}>
          {successText}
        </div>
      )}

      {/* --- карточка subject --- */}
      {subjectCard && (
        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18 }}>Карточка subject</h2>
          <div style={{ padding: 16, background: "#f4f4f4", borderRadius: 8, display: "grid", gap: 4 }}>
            <div><strong>ID:</strong> {subjectCard.id}</div>
            <div><strong>Тип:</strong> {subjectCard.subjectKind}</div>
            <div><strong>Имя для отображения:</strong> {subjectCard.displayName}</div>
            <div><strong>Статус:</strong> {subjectCard.status}</div>
            {subjectCard.authUserLogin && <div><strong>Логин:</strong> {subjectCard.authUserLogin}</div>}
            {subjectCard.email && <div><strong>E-mail:</strong> {subjectCard.email}</div>}
            {subjectCard.phone && <div><strong>Телефон:</strong> {subjectCard.phone}</div>}
            {subjectCard.personId && <div><strong>personId:</strong> {subjectCard.personId}</div>}
            {subjectCard.organizationId && <div><strong>organizationId:</strong> {subjectCard.organizationId}</div>}
            {subjectCard.communityId && <div><strong>communityId:</strong> {subjectCard.communityId}</div>}
          </div>
        </section>
      )}

      {/* --- вкладки доменов --- */}
      {subjectId && (
        <section style={{ marginTop: 24 }}>
          <h2 style={{ fontSize: 18 }}>Кросс-доменные выборки</h2>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
            {TAB_ORDER.map((tab) => (
              <button
                key={tab}
                style={tabButtonStyle(activeTab === tab)}
                onClick={() => switchTab(tab)}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          <div style={{ padding: 16, background: "#fafafa", borderRadius: 8, minHeight: 80 }}>
            {activeTab === "summary" && summary && <SummaryView summary={summary} />}
            {activeTab === "thankas" && thankas && <ListBlock items={thankas} render={renderThanka} empty="Тханок нет." />}
            {activeTab === "listings" && listings && <ListBlock items={listings} render={renderListing} empty="Листингов нет." />}
            {activeTab === "deals" && deals && <ListBlock items={deals} render={renderDeal} empty="Сделок нет." />}
            {activeTab === "decisions" && decisions && <ListBlock items={decisions} render={renderDecision} empty="Решений нет." />}
            {activeTab === "contributions" && contributions && <ListBlock items={contributions} render={renderContribution} empty="Вкладов нет." />}
            {activeTab === "accounts" && accounts && <ListBlock items={accounts} render={renderAccount} empty="Счетов нет." />}
            {activeTab === "objects" && objects && <ObjectsView data={objects} />}
            {loading && <div style={{ color: "#666" }}>Загрузка...</div>}
          </div>
        </section>
      )}
    </div>
  );
};

// ----- рендеры вкладок ------------------------------------------------------

const SummaryView: React.FC<{ summary: SubjectSummary }> = ({ summary }) => (
  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 8 }}>
    <Stat label="Тханки" value={summary.thankas} />
    <Stat label="Листинги" value={summary.listings} />
    <Stat label="Сделки (продаж)" value={summary.dealsAsSupplier} />
    <Stat label="Сделки (покупок)" value={summary.dealsAsBuyer} />
    <Stat label="Решения" value={summary.decisionsProposed} />
    <Stat label="Вклады" value={summary.contributions} />
    <Stat label="Счета" value={summary.accounts} />
  </div>
);

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <div style={{ padding: 12, background: "white", border: "1px solid #eee", borderRadius: 6 }}>
    <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
    <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
  </div>
);

function ListBlock<T>({
  items, render, empty,
}: { items: T[]; render: (item: T, idx: number) => React.ReactNode; empty: string }) {
  if (items.length === 0) return <div style={{ color: "#888" }}>{empty}</div>;
  return <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>{items.map(render)}</ul>;
}

const renderThanka = (t: SubjectThankaItem, i: number) => (
  <li key={t.thankaId || i}><strong>{t.title}</strong> · {t.status}{t.createdAt && ` · ${t.createdAt}`}</li>
);
const renderListing = (l: SubjectListingItem, i: number) => (
  <li key={l.listingId || i}>
    Asset {l.assetId} · {l.price ?? "—"} {l.unit ?? ""} · {l.status}
  </li>
);
const renderDeal = (d: SubjectDealItem, i: number) => (
  <li key={d.dealId || i}>
    [{d.role}] {d.quantity} × {d.price} = {d.dealSum ?? "—"} · {d.status}{d.dealDate && ` · ${d.dealDate}`}
  </li>
);
const renderDecision = (d: SubjectDecisionItem, i: number) => (
  <li key={d.decisionId || i}>
    <strong>{d.title}</strong> ({d.decisionType}) · {d.status}
  </li>
);
const renderContribution = (c: SubjectContributionItem, i: number) => (
  <li key={c.contributionId || i}>
    [{c.contributionType}] {c.description}
  </li>
);
const renderAccount = (a: SubjectAccountItem, i: number) => (
  <li key={a.accountId || i}>
    {a.currency}: {a.balance} ({a.status}){a.accountType ? ` — ${a.accountType}` : ""}
  </li>
);

// ----- unified /objects -----

const ObjectsView: React.FC<{ data: SubjectObjectsResponse }> = ({ data }) => (
  <div>
    <div style={{ fontSize: 13, color: "#666", marginBottom: 8 }}>
      Всего: {data.total} ·{" "}
      {Object.entries(data.totals).map(([k, v]) => `${k}: ${v}`).join(", ")}
    </div>
    {data.items.length === 0 ? (
      <div style={{ color: "#888" }}>Объектов нет.</div>
    ) : (
      <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6 }}>
        {data.items.map((it: SubjectObjectItem, i) => (
          <li key={`${it.domain}:${it.objectId}:${i}`}>
            <span style={{
              display: "inline-block", padding: "1px 6px", borderRadius: 4,
              background: "#eef2ff", color: "#3730a3", fontSize: 12, marginRight: 6,
            }}>{it.domain}</span>
            <strong>{it.title}</strong>
            {it.status && <span style={{ color: "#666" }}> · {it.status}</span>}
            {it.sortKey && <span style={{ color: "#888", fontSize: 12 }}> · {it.sortKey}</span>}
          </li>
        ))}
      </ul>
    )}
  </div>
);

export default PersonalSubjectPage;
