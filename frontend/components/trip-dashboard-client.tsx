"use client";

import { useState, useMemo, useEffect } from "react";
import { TripRecommendation } from "@/types/trip";
import { TripCard } from "@/components/trip-card";

interface TripDashboardClientProps {
  initialTrips: TripRecommendation[];
}

const ITEMS_PER_PAGE = 10;

export function TripDashboardClient({ initialTrips }: TripDashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"latest" | "oldest" | "budget-high" | "budget-low" | "days">(
    "latest"
  );
  const [currentPage, setCurrentPage] = useState(1);

  // Filter and Sort Logic
  const filteredAndSortedTrips = useMemo(() => {
    let result = [...initialTrips];

    // 1. Search filter (Destination or Travel Style)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.destination.toLowerCase().includes(q) ||
          (t.travel_style && t.travel_style.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter tab
    if (selectedCategory !== "all") {
      result = result.filter(
        (t) => (t.category || "Standard").toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 3. Sorting logic
    result.sort((a, b) => {
      if (sortBy === "latest") {
        return (b.id || 0) - (a.id || 0);
      }
      if (sortBy === "oldest") {
        return (a.id || 0) - (b.id || 0);
      }
      if (sortBy === "budget-high") {
        return b.budget - a.budget;
      }
      if (sortBy === "budget-low") {
        return a.budget - b.budget;
      }
      if (sortBy === "days") {
        return b.days - a.days;
      }
      return 0;
    });

    return result;
  }, [initialTrips, searchQuery, selectedCategory, sortBy]);

  // Reset to Page 1 on filter or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedTrips.length / ITEMS_PER_PAGE);
  const paginatedTrips = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTrips.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedTrips, currentPage]);

  const categories = ["all", "Backpacker", "Standard", "Luxury"];

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 200, behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 font-[family-name:var(--font-outfit)]">
      {/* Search & Filter Control Panel */}
      <div className="bg-[#faf9f5]/90 backdrop-blur-md border border-[#cccbc8] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 font-[family-name:var(--font-outfit)]">
        {/* Section 1: Search Input */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#87867f]">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by destination or travel style..."
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-[#cccbc8] rounded-xl text-xs sm:text-sm font-medium text-[#141413] placeholder-[#87867f] focus:outline-none focus:border-[#d97757] focus:ring-1 focus:ring-[#d97757] transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#87867f] hover:text-[#141413]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Section 2: Sort By Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#cccbc8]/50 pt-3">
          <label htmlFor="sort-dropdown" className="text-[11px] font-bold text-[#87867f] uppercase tracking-wider">
            Sort By
          </label>
          <select
            id="sort-dropdown"
            value={sortBy}
            onChange={(e) =>
              setSortBy(e.target.value as "latest" | "oldest" | "budget-high" | "budget-low" | "days")
            }
            className="w-full sm:w-auto bg-white border border-[#cccbc8] text-[#141413] text-xs font-semibold px-3.5 py-2 rounded-xl focus:outline-none focus:border-[#d97757] transition-all cursor-pointer shadow-2xs"
          >
            <option value="latest">Latest (Newest First)</option>
            <option value="oldest">Oldest First</option>
            <option value="budget-high">Highest Budget ($$$ → $)</option>
            <option value="budget-low">Lowest Budget ($ → $$$)</option>
            <option value="days">Most Days (Duration)</option>
          </select>
        </div>

        {/* Section 3: Category Filter Pills */}
        <div className="space-y-2 border-t border-[#cccbc8]/50 pt-3">
          <div className="text-[11px] font-bold text-[#87867f] uppercase tracking-wider">
            Category Filter
          </div>
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-all cursor-pointer capitalize shrink-0 whitespace-nowrap ${
                  selectedCategory === cat
                    ? "bg-[#141413] text-[#faf9f5] border-[#141413] shadow-2xs"
                    : "bg-white text-[#565550] border-[#cccbc8] hover:border-[#87867f]"
                }`}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Counter info */}
        <div className="flex items-center justify-between text-xs text-[#87867f] border-t border-[#cccbc8]/50 pt-3">
          <span>
            Showing <strong className="text-[#141413]">{paginatedTrips.length}</strong> of{" "}
            <strong className="text-[#141413]">{filteredAndSortedTrips.length}</strong> trips
          </span>
          {totalPages > 1 && (
            <span className="font-semibold text-[#d97757]">
              Page {currentPage} of {totalPages}
            </span>
          )}
        </div>
      </div>

      {/* Grid Results or Empty Search State */}
      {filteredAndSortedTrips.length === 0 ? (
        <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-3xl p-8 sm:p-10 text-center max-w-md mx-auto my-8 shadow-xs">
          <div className="text-3xl mb-3">🔍</div>
          <h3 className="text-lg font-bold text-[#141413] mb-1">No matching trips found</h3>
          <p className="text-xs text-[#87867f] mb-5">
            No itineraries matched &quot;{searchQuery}&quot;. Try adjusting your search query or filters.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSortBy("latest");
            }}
            className="inline-flex items-center gap-1.5 bg-[#141413] hover:bg-[#d97757] text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all shadow-xs cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {paginatedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>

          {/* Pagination Controls (> 10 items) */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#cccbc8] font-[family-name:var(--font-outfit)]">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1 bg-white border border-[#cccbc8] text-[#141413] text-xs font-bold px-4 py-2.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#faf9f5] hover:border-[#d97757] transition-all cursor-pointer shadow-2xs"
              >
                ← Previous
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                      currentPage === pageNum
                        ? "bg-[#141413] text-white shadow-2xs"
                        : "bg-white border border-[#cccbc8] text-[#565550] hover:border-[#d97757]"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1 bg-white border border-[#cccbc8] text-[#141413] text-xs font-bold px-4 py-2.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#faf9f5] hover:border-[#d97757] transition-all cursor-pointer shadow-2xs"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default TripDashboardClient;
