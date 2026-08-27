import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import TripDashboardClient from "@/components/trip-dashboard-client";
import { getTrips } from "@/services/trip-service";
import { TripRecommendation } from "@/types/trip";

export const revalidate = 0; // Dynamic data fetching per request

export default async function TripsPage() {
  const trips: TripRecommendation[] = await getTrips();

  return (
    <div className="min-h-screen bg-[#f0eee6] text-[#141413] font-[family-name:var(--font-outfit)] flex flex-col justify-between">
      {/* Floating Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="pt-28 pb-20 px-6 sm:px-10 max-w-[1240px] mx-auto w-full flex-grow">
        {/* Header Section */}
        <div className="mb-8 pb-6 border-b border-[#cccbc8]/70 space-y-4">
          {/* Top Badge & Count */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d97757] bg-[#d97757]/10 px-3 py-1 rounded-full border border-[#d97757]/20">
              Dashboard
            </span>
            <span className="text-xs text-[#87867f] font-medium">
              {trips.length} {trips.length === 1 ? "itinerary" : "itineraries"} saved
            </span>
          </div>

          {/* Main Title & Description */}
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#141413] leading-snug">
              Trip History & Saved Recommendations
            </h1>
            <p className="text-[#565550] text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Browse previous AI-generated itineraries retrieved directly from PostgreSQL. Search by destination or style, and sort by budget or date.
            </p>
          </div>

          {/* CTA Button placed neatly at the bottom of header */}
          <div className="pt-1">
            <Link
              href="/"
              className="inline-flex items-center justify-center bg-[#141413] hover:bg-[#d97757] text-[#faf9f5] text-xs sm:text-sm font-semibold px-6 py-3 rounded-full transition-all shadow-xs w-full sm:w-auto text-center"
            >
              + Create New Trip
            </Link>
          </div>
        </div>

        {/* Trips Grid / Empty State with Search & Sort */}
        {trips.length === 0 ? (
          <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-3xl p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="text-4xl mb-4">✈️</div>
            <h2 className="text-xl font-bold text-[#141413] mb-2">No trips found</h2>
            <p className="text-sm text-[#87867f] mb-6">
              You haven&apos;t generated any travel itineraries yet. Start planning your first trip now!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-[#d97757] hover:bg-[#c6613f] text-white text-sm font-semibold px-6 py-3 rounded-full transition-all shadow-md"
            >
              Generate a Trip →
            </Link>
          </div>
        ) : (
          <TripDashboardClient initialTrips={trips} />
        )}
      </main>

      {/* Editorial Footer */}
      <Footer />
    </div>
  );
}
