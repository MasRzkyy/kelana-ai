import { getAuthToken, logoutUser } from "@/services/auth-service";
import { getApiBaseUrl } from "@/lib/config";

const API_URL = getApiBaseUrl();

export interface AssistantResponse {
  question: string;
  answer: string;
  source?: string;
  citations?: string[];
}

export interface ConversationApiItem {
  id: number;
  title: string;
  created_at: string;
}

export interface MessageApiItem {
  id: number;
  conversation_id: number;
  role: "user" | "assistant";
  content: string;
  source?: string;
  created_at: string;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleApiResponse<T>(res: Response, fallbackError: string): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    if (res.status === 401) {
      logoutUser();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    throw new Error(errorData.detail || `${fallbackError} (${res.status})`);
  }
  return await res.json();
}

export async function askAssistant(question: string): Promise<AssistantResponse> {
  const res = await fetch(`${API_URL}/assistant`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ question }),
  });
  return handleApiResponse<AssistantResponse>(res, "Failed to fetch answer");
}

export async function createConversationApi(): Promise<{ conversation_id: number }> {
  const res = await fetch(`${API_URL}/conversations`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return handleApiResponse<{ conversation_id: number }>(res, "Failed to create conversation");
}

export async function getConversationsApi(): Promise<ConversationApiItem[]> {
  const res = await fetch(`${API_URL}/conversations`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleApiResponse<ConversationApiItem[]>(res, "Failed to list conversations");
}

export async function sendMessageApi(conversationId: number, content: string): Promise<MessageApiItem> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ content }),
  });
  return handleApiResponse<MessageApiItem>(res, "Failed to send message");
}

export async function getMessagesApi(conversationId: number): Promise<MessageApiItem[]> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleApiResponse<MessageApiItem[]>(res, "Failed to fetch messages");
}

export async function deleteConversationApi(conversationId: number): Promise<{ message: string; id: number }> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleApiResponse<{ message: string; id: number }>(res, "Failed to delete conversation");
}

export async function renameConversationApi(conversationId: number, title: string): Promise<ConversationApiItem> {
  const res = await fetch(`${API_URL}/conversations/${conversationId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ title }),
  });
  return handleApiResponse<ConversationApiItem>(res, "Failed to rename conversation");
}
