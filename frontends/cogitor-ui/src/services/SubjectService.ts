const BASE_URL = "http://127.0.0.1:8000";

export interface CreatePersonalSubjectPayload {
  authUserLogin: string;
  surname: string;
  firstName: string;
  secondName?: string;
  email?: string;
  phone?: string;
}

export interface SubjectCard {
  id: number;
  subjectType: string;
  displayName: string;
  surname?: string | null;
  firstName?: string | null;
  secondName?: string | null;
  email?: string | null;
  phone?: string | null;
  authUserLogin?: string | null;
}

async function handleJsonResponse(response: Response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.detail || data?.message || `HTTP ${response.status}`);
  }

  return data;
}

export default class SubjectService {
  static async createPersonalSubject(payload: CreatePersonalSubjectPayload) {
    const response = await fetch(`${BASE_URL}/api/subject/personal/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return handleJsonResponse(response);
  }

  static async getSubjectCard(subjectId: number): Promise<SubjectCard> {
    const response = await fetch(`${BASE_URL}/api/subject/${subjectId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    return handleJsonResponse(response);
  }
}