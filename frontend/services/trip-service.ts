import { TripRecommendation } from "@/types/trip";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function getTrips(): Promise<TripRecommendation[]> {
  try {
    const res = await fetch(`${API_URL}/trips`, {
      cache: "no-store",
    });
    if (!res.ok) {
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
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 404) return null;
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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(`Failed to create trip (${res.status})`);
  }

  return await res.json();
}

export async function generateAIRecommendation(id: number | string): Promise<TripRecommendation> {
  const res = await fetch(`${API_URL}/trips/${id}/generate`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(`Failed to generate AI recommendation for trip ${id}`);
  }

  return await res.json();
}
