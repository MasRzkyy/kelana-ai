import Link from "next/link";
import { TripRecommendation } from "@/types/trip";

interface TripCardProps {
  trip: TripRecommendation;
}

export function TripCard({ trip }: TripCardProps) {
  // 1. Currency & Budget Formatting (e.g. USD 2,000)
  const formattedBudget = `USD ${new Intl.NumberFormat("en-US").format(trip.budget)}`;

  // 2. Category Badge Color Coding (Clean text without emojis)
  const getCategoryBadge = (category?: string) => {
    const cat = category?.toLowerCase().trim();
    switch (cat) {
      case "luxury":
        return {
          label: "Luxury",
          className: "bg-amber-100/90 text-amber-900 border-amber-300 shadow-2xs font-bold",
        };
      case "backpacker":
        return {
          label: "Backpacker",
          className: "bg-emerald-100/90 text-emerald-900 border-emerald-300 shadow-2xs font-bold",
        };
      default:
        return {
          label: "Standard",
          className: "bg-slate-100/90 text-slate-800 border-slate-300 shadow-2xs font-bold",
        };
    }
  };

  // 3. Travel Style Badge Helper (Clean text without emojis)
  const getStyleBadge = (style?: string) => {
    const s = style?.toLowerCase().trim();
    switch (s) {
      case "family":
        return {
          label: "Family",
          className: "bg-indigo-50 text-indigo-900 border-indigo-200",
        };
      case "solo":
        return {
          label: "Solo",
          className: "bg-purple-50 text-purple-900 border-purple-200",
        };
      case "couple":
        return {
          label: "Couple",
          className: "bg-rose-50 text-rose-900 border-rose-200",
        };
      case "business":
        return {
          label: "Business",
          className: "bg-slate-50 text-slate-900 border-slate-200",
        };
      default:
        return {
          label: style || "Traveler",
          className: "bg-[#f0eee6] text-[#3d3d3a] border-[#cccbc8]",
        };
    }
  };

  const categoryStyle = getCategoryBadge(trip.category);
  const styleStyle = getStyleBadge(trip.travel_style);

  return (
    <div className="group relative bg-[#faf9f5]/90 backdrop-blur-md border border-[#cccbc8] hover:border-[#d97757] rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between font-[family-name:var(--font-outfit)]">
      <div>
        {/* Top Badges Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span
            className={`text-xs px-3 py-1 rounded-full border shrink-0 ${categoryStyle.className}`}
          >
            {categoryStyle.label}
          </span>

          {trip.travel_style && (
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full border shrink-0 ${styleStyle.className}`}
            >
              {styleStyle.label}
            </span>
          )}
        </div>

        {/* Clean Destination Title */}
        <h3 className="text-xl font-bold text-[#141413] group-hover:text-[#d97757] transition-colors mb-3 truncate">
          {trip.destination}
        </h3>

        {/* Subtitle & Specs */}
        <div className="text-xs sm:text-sm font-medium text-[#565550] space-y-2 mb-4 bg-[#f0eee6]/60 p-3.5 rounded-xl border border-[#cccbc8]/50">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1">
            <span className="text-[#87867f] font-normal shrink-0">Duration & Budget:</span>
            <span className="font-bold text-[#141413] shrink-0">
              {trip.days} Days • {formattedBudget}
            </span>
          </div>

          {trip.daily_budget && (
            <div className="flex items-center justify-between gap-1 text-xs">
              <span className="text-[#87867f]">Est. Daily:</span>
              <span className="font-semibold text-[#d97757]">
                ${Math.round(trip.daily_budget)}/day
              </span>
            </div>
          )}

          {trip.travel_month && (
            <div className="flex items-center justify-between gap-1 text-xs">
              <span className="text-[#87867f]">Travel Month:</span>
              <span className="font-medium text-[#141413]">{trip.travel_month}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 sm:pt-4 border-t border-[#cccbc8]/60 flex items-center justify-between">
        <span className="text-xs font-semibold text-[#87867f]">ID #{trip.id}</span>
        <Link
          href={`/trips/${trip.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#141413] group-hover:text-[#d97757] bg-white group-hover:bg-[#faf9f5] border border-[#cccbc8] group-hover:border-[#d97757] px-3.5 py-1.5 rounded-full transition-all shadow-2xs"
        >
          <span>View Details</span>
          <span className="transform group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>
    </div>
  );
}

export default TripCard;
