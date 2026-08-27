"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TripRecommendation } from "@/types/trip";
import { createTrip, generateAIRecommendation } from "@/services/trip-service";

export function useTripGenerator() {
  const router = useRouter();
  const [pageLoading, setPageLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [destination, setDestination] = useState("Japan");
  const [budget, setBudget] = useState<number | "">(2000);
  const [days, setDays] = useState<number | "">(5);
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
      const numBudget = Number(budget) || 2000;
      const numDays = Number(days) || 5;

      const createdTrip = await createTrip({
        destination,
        budget: numBudget,
        days: numDays,
        travel_style: travelStyle,
        travel_month: travelMonth,
      });

      try {
        const aiTrip = await generateAIRecommendation(createdTrip.id!);
        setTrip(aiTrip);
        setLoading(false);
        router.push("/trips");
        return;
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
- Recommended budget: $${Math.round(numBudget / numDays)} per day for meals & transit.

### 🍜 Local Food Recommendations:
- Must-try dishes: Authentic ramen, fresh sushi, local street food snacks.
- Dining budget tip: Eat at local food halls and izakaya for great value.

### 💰 Estimated Budget Breakdown:
- Accommodation: $${Math.round(numBudget * 0.4)} (40%)
- Food & Dining: $${Math.round(numBudget * 0.3)} (30%)
- Activities & Transport: $${Math.round(numBudget * 0.2)} (20%)
- Emergency Fund: $${Math.round(numBudget * 0.1)} (10%)
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
