"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { getMe, logoutUser, User } from "@/services/auth-service";
import { getTrips } from "@/services/trip-service";
import { TripRecommendation } from "@/types/trip";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<TripRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProfileData() {
      // Core Challenge: Fetch current user profile via GET /api/v1/auth/me (JWT authenticated)
      const currentUser = await getMe();
      if (!currentUser) {
        router.push("/login");
        return;
      }
      setUser(currentUser);

      try {
        const userTrips = await getTrips();
        setTrips(userTrips);
      } catch (err) {
        console.error("Failed to load user trips:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProfileData();
  }, [router]);

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f0eee6] text-[#141413] font-[family-name:var(--font-outfit)] flex flex-col justify-between">
        <Navbar />
        <main className="pt-32 pb-20 px-6 max-w-xl mx-auto w-full flex-grow flex items-center justify-center">
          <div className="flex items-center gap-3 bg-[#faf9f5] border border-[#cccbc8] px-6 py-4 rounded-2xl shadow-xs">
            <svg className="animate-spin h-5 w-5 text-[#d97757]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium text-[#141413]">Loading profile data from GET /api/v1/auth/me...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0eee6] text-[#141413] font-[family-name:var(--font-outfit)] flex flex-col justify-between">
      {/* Floating Navbar */}
      <Navbar />

      {/* Main Profile Container */}
      <main className="pt-32 pb-20 px-6 sm:px-10 max-w-2xl mx-auto w-full flex-grow">
        <div className="space-y-6">
          {/* TOP BREADCRUMB */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d97757] bg-[#d97757]/10 px-3 py-1 rounded-full border border-[#d97757]/20">
              User Profile • Core Challenge
            </span>
            <Link
              href="/trips"
              className="text-xs font-semibold text-[#87867f] hover:text-[#141413] transition-colors"
            >
              ← Back to Trips
            </Link>
          </div>

          {/* PROFILE CARD */}
          <div className="bg-[#faf9f5] border border-[#cccbc8] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-5 pb-6 border-b border-[#cccbc8]/60">
              {/* Avatar Circle */}
              <div className="w-20 h-20 rounded-full bg-[#141413] text-[#faf9f5] flex items-center justify-center text-2xl font-bold border-2 border-[#d97757] shadow-md">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>

              {/* User Meta */}
              <div className="text-center sm:text-left space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-[#141413]">
                  {user?.name}
                </h1>
                <p className="text-sm text-[#87867f] font-medium">{user?.email}</p>
                <div className="pt-1 flex items-center justify-center sm:justify-start gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#3d3d3a]">
                    Verified JWT Session
                  </span>
                </div>
              </div>
            </div>

            {/* STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-[#cccbc8] rounded-2xl p-5 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#87867f]">
                  Total Trips Generated
                </span>
                <p className="text-3xl font-extrabold text-[#141413]">{trips.length}</p>
                <p className="text-xs text-[#87867f]">Personalized itineraries saved under user_id</p>
              </div>

              <div className="bg-white border border-[#cccbc8] rounded-2xl p-5 space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#87867f]">
                  User Identity
                </span>
                <p className="text-xl font-extrabold text-[#d97757] truncate">{user?.name}</p>
                <p className="text-xs text-[#87867f]">Identified via JWT token payload</p>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                href="/#planner"
                className="flex-1 bg-[#141413] hover:bg-[#d97757] text-white text-center font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-xs"
              >
                ✦ Plan New Trip
              </Link>
              <Link
                href="/trips"
                className="flex-1 bg-white border border-[#cccbc8] hover:border-[#141413] text-[#141413] text-center font-semibold py-3 px-4 rounded-xl text-sm transition-all shadow-2xs"
              >
                View My Trips →
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-red-50 border border-red-200 hover:bg-red-600 hover:text-white text-red-600 font-semibold py-3 px-5 rounded-xl text-sm transition-all cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
