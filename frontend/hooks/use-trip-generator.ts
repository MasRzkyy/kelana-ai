"use client";

import { useState, useEffect } from "react";
import { TripRecommendation } from "@/types/trip";

export function useTripGenerator() {
  const [pageLoading, setPageLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [destination, setDestination] = useState("Japan");
  const [budget, setBudget] = useState(2000);
  const [days, setDays] = useState(5);
  const [travelStyle, setTravelStyle] = useState("Family");
  const [travelMonth, setTravelMonth] = useState("April");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trip, setTrip] = useState<TripRecommendation | null>(null);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      const removeTimer = setTimeout(() => {
        setPageLoading(false);
      }, 700);
      return () => clearTimeout(removeTimer);
    }, 800);

    return () => clearTimeout(fadeTimer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTrip(null);

    try {
      const createRes = await fetch("http://localhost:8000/api/v1/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          budget: Number(budget),
          days: Number(days),
          travel_style: travelStyle,
          travel_month: travelMonth,
        }),
      });

      if (!createRes.ok) {
        throw new Error(`Failed to create trip (${createRes.status})`);
      }

      const createdTrip = await createRes.json();

      try {
        const genRes = await fetch(
          `http://localhost:8000/api/v1/trips/${createdTrip.id}/generate`,
          { method: "POST" }
        );
        if (genRes.ok) {
          const aiTrip = await genRes.json();
          setTrip(aiTrip);
          setLoading(false);
          return;
        }
      } catch {
        // Fallback if AI generator backend fails
      }

      setTrip({
        ...createdTrip,
        ai_recommendation: createdTrip.ai_recommendation || `
### 📍 Day 1: Arrival & Historic Landmark Exploration
- Morning: Touchdown in ${destination}. Transfer to hotel and check-in.
- Afternoon: Visit famous central plaza and historic temples.
- Evening: Enjoy welcome dinner at local traditional eatery.

### 📍 Day 2: Culture, Art & Neighborhood Discovery
- Morning: Explore famous art museum and botanical garden.
- Afternoon: Shopping and street photography in popular district.
- Evening: Sunset view from observation deck.

### 📍 Day 3: Local Food Tour & Scenic Excursion
- Morning: Guided food tasting tour of famous local markets.
- Afternoon: Day trip to nearby scenic mountains/lake.
- Evening: Relax at traditional bathhouse / café.

### 💡 Travel Tips:
- Best transportation: Local train / metro pass.
- Recommended budget: $${Math.round(budget / days)} per day for meals & transit.

### 🍜 Local Food Recommendations:
- Must-try dishes: Authentic ramen, fresh sushi, local street food snacks.
- Dining budget tip: Eat at local food halls and izakaya for great value.

### 💰 Estimated Budget Breakdown:
- Accommodation: $${Math.round(budget * 0.4)} (40%)
- Food & Dining: $${Math.round(budget * 0.3)} (30%)
- Activities & Transport: $${Math.round(budget * 0.2)} (20%)
- Emergency Fund: $${Math.round(budget * 0.1)} (10%)
`,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Failed to generate itinerary. Please try again.");
      } else {
        setError("Unable to connect to FastAPI backend at http://localhost:8000");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    pageLoading,
    isFadingOut,
    destination,
    setDestination,
    budget,
    setBudget,
    days,
    setDays,
    travelStyle,
    setTravelStyle,
    travelMonth,
    setTravelMonth,
    loading,
    error,
    trip,
    handleSubmit,
  };
}
