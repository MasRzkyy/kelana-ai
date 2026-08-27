import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getTrip } from "@/services/trip-service";
import { renderParsedItinerary } from "@/lib/itinerary-parser";
import { TripRecommendation } from "@/types/trip";

export const revalidate = 0; // Dynamic data fetching per request

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: PageProps) {
  const { id } = await params;
  const trip: TripRecommendation | null = await getTrip(id);

  if (!trip) {
    notFound();
  }

  // Format budget to USD 2,000 style
  const formattedBudget = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(trip.budget);

  return (
    <div className="min-h-screen bg-[#f0eee6] text-[#141413] font-[family-name:var(--font-outfit)] flex flex-col justify-between">
      {/* Floating Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-28 pb-20 px-4 sm:px-8 max-w-[1000px] mx-auto w-full flex-grow">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/trips"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#87867f] hover:text-[#d97757] transition-colors bg-[#faf9f5] border border-[#cccbc8] px-4 py-2 rounded-full shadow-xs"
          >
            <span>←</span> Back to Trips
          </Link>
        </div>

        {/* Trip Card Container */}
        <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-3xl p-6 sm:p-10 shadow-sm">
          {/* Top Banner Image */}
          <div className="relative w-full h-56 sm:h-72 rounded-2xl overflow-hidden mb-8 border border-[#cccbc8] shadow-xs">
            <img
              src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80"
              alt={trip.destination}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div>
                <span className="bg-[#d97757] text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block shadow-xs">
                  {trip.category || "Standard"} Category
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                  {trip.destination}
                </h1>
              </div>
              <div className="text-sm font-semibold bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20">
                ID #{trip.id}
              </div>
            </div>
          </div>

          {/* Quick Specifications Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 bg-[#f0eee6] border border-[#cccbc8] rounded-2xl p-4 sm:p-5">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#87867f] block mb-1">
                DESTINATION
              </span>
              <span className="text-base font-bold text-[#141413]">
                {trip.destination}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#87867f] block mb-1">
                BUDGET
              </span>
              <span className="text-base font-bold text-[#141413]">
                {formattedBudget}
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#87867f] block mb-1">
                DURATION
              </span>
              <span className="text-base font-bold text-[#141413]">
                {trip.days} Days
              </span>
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#87867f] block mb-1">
                STYLE / SEASON
              </span>
              <span className="text-base font-bold text-[#141413]">
                {trip.travel_style || "General"} {trip.travel_month ? `(${trip.travel_month})` : ""}
              </span>
            </div>
          </div>

          {/* Daily Budget Highlight */}
          {trip.daily_budget && (
            <div className="bg-[#f5e3c7]/60 border border-[#e3dacc] rounded-xl p-4 mb-8 flex items-center justify-between">
              <span className="text-xs font-semibold text-[#87867f]">
                Recommended Daily Budget:
              </span>
              <span className="text-sm font-bold text-[#141413] bg-[#f5e3c7] border border-[#e3dacc] px-3 py-1 rounded-lg shadow-xs">
                ${trip.daily_budget} / day
              </span>
            </div>
          )}

          {/* AI Recommendation Content */}
          <div className="pt-6 border-t border-[#cccbc8]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#141413] flex items-center gap-2">
                <span>🤖</span> AI Travel Recommendation
              </h2>
              <span className="text-xs text-[#87867f] font-medium bg-[#f0eee6] border border-[#cccbc8] px-3 py-1 rounded-full">
                Cached from PostgreSQL
              </span>
            </div>

            {trip.ai_recommendation ? (
              <div className="prose max-w-none">
                {renderParsedItinerary(trip.ai_recommendation)}
              </div>
            ) : (
              <div className="bg-[#f0eee6] border border-[#cccbc8] rounded-2xl p-8 text-center">
                <p className="text-sm text-[#87867f] mb-4">
                  No AI recommendation generated yet for this trip.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
