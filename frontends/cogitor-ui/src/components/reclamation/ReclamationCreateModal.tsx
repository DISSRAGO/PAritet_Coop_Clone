// /srv/clone/frontends/cogitor-ui/src/components/reclamation/ReclamationCreateModal.tsx

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createReclamation } from "../../store/reclamationSlice";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetType: string;
  targetId: string;
  communityId?: string | null;
  subjectId: string;
  respondentSubjectId?: string;
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: 16,
};

const modalStyle: React.CSSProperties = {
  width: "100%",
  maxWidth: 560,
  background: "#fff",
  borderRadius: 12,
  boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  padding: 20,
  boxSizing: "border-box",
};

const titleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 16,
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 6,
  marginBottom: 14,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #d9d9d9",
  boxSizing: "border-box",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
  marginTop: 16,
};

const cancelButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #d9d9d9",
  background: "#fff",
  cursor: "pointer",
};

const submitButtonStyle: React.CSSProperties = {
  padding: "10px 14px",
  borderRadius: 8,
  border: "1px solid #1677ff",
  background: "#1677ff",
  color: "#fff",
  cursor: "pointer",
};

const errorStyle: React.CSSProperties = {
  color: "#c62828",
  marginTop: 4,
};

const helperStyle: React.CSSProperties = {
  color: "#666",
  fontSize: 13,
};

const ReclamationCreateModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  communityId = null,
  subjectId,
  respondentSubjectId,
}) => {
  const dispatch = useDispatch() as any;

  const [reclamationType, setReclamationType] = useState<
    "content" | "context" | "behavior" | "transaction" | "governance" | "system"
  >("content");
  const [priority, setPriority] = useState<"low" | "normal" | "high" | "critical">("normal");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetAndClose = () => {
    setError(null);
    setSubmitting(false);
    setTitle("");
    setDescription("");
    setReclamationType("content");
    setPriority("normal");
    onClose();
  };

  const handleSubmit = async () => {
    if (!subjectId) {
      setError("Не найден subjectId текущего пользователя.");
      return;
    }

    if (!targetType || !targetId) {
      setError("Не определён объект рекламации.");
      return;
    }

    if (!title.trim()) {
      setError("Введите заголовок рекламации.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const action = await dispatch(
        createReclamation({
          actorSubjectId: subjectId,
          reclamationType,
          sourceType: "user",
          priority,
          respondentSubjectId: respondentSubjectId || undefined,
          targetType,
          targetId,
          communityId,
          title: title.trim(),
          description: description.trim() || undefined,
        })
      );

      if (action?.meta?.requestStatus === "rejected") {
        throw new Error(
          action?.payload || action?.error?.message || "Не удалось создать рекламацию"
        );
      }

      resetAndClose();
    } catch (e: any) {
      setError(e?.message || "Не удалось создать рекламацию");
      setSubmitting(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={resetAndClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h3 style={titleStyle}>Подать рекламацию</h3>

        <div style={fieldStyle}>
          <label>Тип рекламации</label>
          <select
            style={inputStyle}
            value={reclamationType}
            onChange={(e) => setReclamationType(e.target.value as any)}
          >
            <option value="content">content</option>
            <option value="context">context</option>
            <option value="behavior">behavior</option>
            <option value="transaction">transaction</option>
            <option value="governance">governance</option>
            <option value="system">system</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label>Приоритет</label>
          <select
            style={inputStyle}
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
          >
            <option value="low">low</option>
            <option value="normal">normal</option>
            <option value="high">high</option>
            <option value="critical">critical</option>
          </select>
        </div>

        <div style={fieldStyle}>
          <label>Заголовок</label>
          <input
            style={inputStyle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Кратко опишите суть претензии"
          />
        </div>

        <div style={fieldStyle}>
          <label>Описание</label>
          <textarea
            style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Подробности, аргументы, ссылки на факты"
          />
        </div>

        <div style={helperStyle}>
          После создания рекламация должна появиться в исходящих у заявителя и в
          соответствующем потоке разбора по ответственным. Если у заявителя или
          ответчика назначен подтверждённый поручитель, effective-участники будут
          определены backend автоматически.
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <div style={footerStyle}>
          <button style={cancelButtonStyle} onClick={resetAndClose} disabled={submitting}>
            Отмена
          </button>
          <button style={submitButtonStyle} onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Отправка..." : "Отправить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReclamationCreateModal;