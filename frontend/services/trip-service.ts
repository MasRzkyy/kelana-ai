import { TripRecommendation } from "@/types/trip";
import { getAuthToken } from "@/services/auth-service";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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

export async function getTrips(): Promise<TripRecommendation[]> {
  try {
    const res = await fetch(`${API_URL}/trips`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 401) {
        console.warn("User unauthenticated when fetching trips");
        return [];
      }
      throw new Error(`Failed to fetch trips (${res.status})`);
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching trips:", error);
    return [];
  }
}

export async function getTrip(id: number | string): Promise<TripRecommendation | null> {
  try {
    const res = await fetch(`${API_URL}/trips/${id}`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 404 || res.status === 403) return null;
      throw new Error(`Failed to fetch trip ${id} (${res.status})`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Error fetching trip ${id}:`, error);
    return null;
  }
}

export async function createTrip(data: Partial<TripRecommendation>): Promise<TripRecommendation> {
  const res = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to create trip (${res.status})`);
  }

  return await res.json();
}

export async function generateAIRecommendation(id: number | string): Promise<TripRecommendation> {
  const res = await fetch(`${API_URL}/trips/${id}/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to generate AI recommendation for trip ${id}`);
  }

  return await res.json();
}

export async function deleteTrip(id: number | string): Promise<void> {
  const res = await fetch(`${API_URL}/trips/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to delete trip ${id}`);
  }
}
