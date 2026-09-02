import { getAuthToken } from "@/services/auth-service";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface AssistantResponse {
  question: string;
  answer: string;
  source?: string;
  citations?: string[];
}

export async function askAssistant(question: string): Promise<AssistantResponse> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}/assistant`, {
    method: "POST",
    headers,
    body: JSON.stringify({ question }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to fetch answer (${res.status})`);
  }

  return await res.json();
}
