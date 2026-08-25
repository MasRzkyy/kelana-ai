"use client";

import React from "react";
import LoadingPaperplane from "@/components/loading-paperplane";
import { renderParsedItinerary } from "@/lib/itinerary-parser";
import { TripRecommendation } from "@/types/trip";

interface ItineraryDisplayProps {
  loading: boolean;
  error: string | null;
  trip: TripRecommendation | null;
  days: number;
  destination: string;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function ItineraryDisplay({
  loading,
  error,
  trip,
  days,
  destination,
  handleSubmit,
}: ItineraryDisplayProps) {
  return (
    <div className="lg:col-span-7">
      {/* 1. IDLE STATE */}
      {!loading && !error && !trip && (
        <div className="bg-[#fefefd] border border-[#cccbc8] rounded-2xl p-8 sm:p-12 text-center shadow-sm">
          <div className="w-14 h-14 bg-[#e3dacc] border border-[#cccbc8] rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4">
            🗺️
          </div>
          <h3 className="text-xl font-semibold text-[#141413] mb-2">
            Your Itinerary Will Appear Here
          </h3>
          <p className="text-[#87867f] font-normal text-sm max-w-md mx-auto mb-6">
            Fill out the parameters on the left and click &quot;Generate AI Trip&quot; to calculate your custom itinerary.
          </p>
          <div className="inline-flex flex-wrap gap-2 justify-center">
            <span className="bg-[#faf9f5] text-[#141413] border border-[#cccbc8] px-3 py-1 rounded-full text-xs font-medium">
              FastAPI REST
            </span>
            <span className="bg-[#faf9f5] text-[#141413] border border-[#cccbc8] px-3 py-1 rounded-full text-xs font-medium">
              Amazon Bedrock
            </span>
            <span className="bg-[#faf9f5] text-[#141413] border border-[#cccbc8] px-3 py-1 rounded-full text-xs font-medium">
              PostgreSQL
            </span>
          </div>
        </div>
      )}

      {/* 2. LOADING STATE */}
      {loading && (
        <div className="bg-[#141413] text-[#faf9f5] rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <LoadingPaperplane />
          <h3 className="text-xl font-semibold mb-2 mt-2">
            Generating Custom Itinerary...
          </h3>
          <p className="text-[#b0aea5] font-normal text-sm max-w-md mx-auto">
            Amazon Bedrock AI is calculating daily routes and recommendations for your {days}-day trip to {destination}.
          </p>
        </div>
      )}

      {/* 3. ERROR STATE */}
      {error && (
        <div className="bg-[#fefefd] border border-rose-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-lg">
              ⚠️
            </div>
            <div>
              <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider block">
                Connection or Processing Fault
              </span>
              <h3 className="text-lg font-semibold text-[#141413]">
                Unable to Generate Itinerary
              </h3>
            </div>
          </div>
          <p className="text-[#87867f] font-normal text-sm mb-5 leading-relaxed bg-rose-50/50 p-3.5 rounded-xl border border-rose-100/80">
            {error}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSubmit}
              className="bg-[#d97757] hover:bg-[#c6613f] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <span>🔄</span>
              <span>Retry Generation</span>
            </button>
            <span className="text-xs text-[#87867f]">
              Ensure FastAPI backend is active at <code className="bg-[#e3dacc]/50 px-1.5 py-0.5 rounded text-[11px]">localhost:8000</code>
            </span>
          </div>
        </div>
      )}

      {/* 4. RESULT STATE */}
      {trip && !loading && (
        <div className="bg-[#fefefd] border border-[#cccbc8] rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Destination Hero Banner Image */}
          <div className="relative w-full h-48 sm:h-56 rounded-xl overflow-hidden mb-6 border border-[#cccbc8] shadow-2xs group">
            <img
              src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
              alt={trip.destination}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="bg-[#d97757] text-white px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider mb-1.5 inline-block">
                Featured Destination
              </span>
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                Exploring {trip.destination}
              </h3>
            </div>
          </div>

          {/* Header Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#cccbc8]">
            <div>
              <span className="text-xs font-medium text-[#87867f] block mb-1">
                AI RECOMMENDATION
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold text-[#141413]">
                🏝️ {trip.destination}
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="bg-[#f5e3c7] text-[#141413] border border-[#e3dacc] px-3 py-1 rounded-full text-xs font-medium">
                💵 ${trip.budget}
              </span>
              <span className="bg-[#e3dacc] text-[#141413] border border-[#cccbc8] px-3 py-1 rounded-full text-xs font-medium">
                📅 {trip.days} Days
              </span>
              <span className="bg-[#faf9f5] text-[#141413] border border-[#cccbc8] px-3 py-1 rounded-full text-xs font-medium">
                ♟️ {trip.travel_style}
              </span>
            </div>
          </div>

          {/* Daily Budget Callout */}
          {trip.daily_budget && (
            <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-xl p-3 mb-6 flex items-center justify-between">
              <span className="text-xs font-medium text-[#87867f]">
                Estimated Daily Budget:
              </span>
              <span className="text-sm font-semibold text-[#141413] bg-[#f5e3c7] border border-[#e3dacc] px-2.5 py-0.5 rounded-lg">
                ${trip.daily_budget} / day
              </span>
            </div>
          )}

          {/* Itinerary Output */}
          <div className="mt-4">
            {renderParsedItinerary(trip.ai_recommendation)}
          </div>
        </div>
      )}
    </div>
  );
}
