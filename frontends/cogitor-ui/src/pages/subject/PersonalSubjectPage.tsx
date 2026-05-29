import React, { useState } from "react";
import SubjectService from "../../services/SubjectService";

const PersonalSubjectPage: React.FC = () => {
  const [authUserLogin, setAuthUserLogin] = useState("");
  const [surname, setSurname] = useState("");
  const [firstName, setFirstName] = useState("");
  const [secondName, setSecondName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [createdSubjectId, setCreatedSubjectId] = useState<number | null>(null);
  const [subjectCard, setSubjectCard] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [successText, setSuccessText] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorText("");
    setSuccessText("");
    setSubjectCard(null);

    try {
      const created = await SubjectService.createPersonalSubject({
        authUserLogin,
        surname,
        firstName,
        secondName,
        email,
        phone,
      });

      setCreatedSubjectId(created.subjectId);
      setSuccessText(`Personal subject created: #${created.subjectId}`);

      const card = await SubjectService.getSubjectCard(created.subjectId);
      setSubjectCard(card);
    } catch (error: any) {
      setErrorText(error?.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 760, margin: "32px auto", padding: "0 16px" }}>
      <h1>Personal Subject</h1>
      <p>Create a personal subject for an existing verified auth user.</p>

      <form onSubmit={handleCreate} style={{ display: "grid", gap: 12 }}>
        <input
          placeholder="Auth user login"
          value={authUserLogin}
          onChange={(e) => setAuthUserLogin(e.target.value)}
        />
        <input
          placeholder="Surname"
          value={surname}
          onChange={(e) => setSurname(e.target.value)}
        />
        <input
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />
        <input
          placeholder="Second name"
          value={secondName}
          onChange={(e) => setSecondName(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create personal subject"}
        </button>
      </form>

      {errorText && (
        <div style={{ marginTop: 16, color: "#b00020" }}>
          Error: {errorText}
        </div>
      )}

      {successText && (
        <div style={{ marginTop: 16, color: "#0a7a2f" }}>
          {successText}
        </div>
      )}

      {createdSubjectId && (
        <div style={{ marginTop: 16 }}>
          Created subject id: <strong>{createdSubjectId}</strong>
        </div>
      )}

      {subjectCard && (
        <pre
          style={{
            marginTop: 24,
            padding: 16,
            background: "#f4f4f4",
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
          {JSON.stringify(subjectCard, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default PersonalSubjectPage;
