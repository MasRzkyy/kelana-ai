"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getCurrentUser, getMe, logoutUser, User } from "@/services/auth-service";

interface NavbarProps {
  onStartPlanning?: () => void;
}

export default function Navbar({ onStartPlanning }: NavbarProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    async function syncUser() {
      let user = getCurrentUser();
      if (!user) {
        user = await getMe();
      }
      setCurrentUser(user);
    }

    syncUser();

    const handleAuthChange = () => {
      syncUser();
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);

    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setMobileMenuOpen(false);
    router.push("/login");
  };

  const handleScrollToPlanner = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onStartPlanning) {
      onStartPlanning();
    } else {
      const plannerEl = document.getElementById("planner");
      if (plannerEl) {
        plannerEl.scrollIntoView({ behavior: "smooth" });
      } else {
        router.push("/#planner");
      }
    }
    setMobileMenuOpen(false);
  };

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="fixed top-4 inset-x-0 z-50 px-6 sm:px-10 max-w-[1240px] mx-auto w-full pointer-events-none font-[family-name:var(--font-outfit)]">
      {/* 1. TOP FLOATING PILL HEADER */}
      <header className="bg-[#faf9f5]/90 backdrop-blur-md border border-[#cccbc8] rounded-full shadow-xs pointer-events-auto transition-all">
        <div className="px-5 sm:px-7 py-2.5 flex items-center justify-between">
          {/* BRAND LOGO */}
          <Link
            href="/"
            onClick={handleScrollToTop}
            className="flex items-baseline gap-1 group pl-1 sm:pl-2"
          >
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#141413] group-hover:text-[#d97757] transition-colors">
              Kelana
            </span>
            <span className="text-xs font-bold text-[#d97757]">®</span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-12 text-sm font-medium text-[#87867f]">
            <Link
              href="/"
              className="text-[#141413] hover:text-[#d97757] font-medium transition-colors duration-300 py-1 px-2"
            >
              Planner
            </Link>
            <Link
              href="/trips"
              className="group flex items-center gap-1 text-[#141413] hover:text-[#d97757] font-semibold transition-colors duration-300 py-1 px-2"
            >
              <span>Trip History</span>
              <span className="transform group-hover:translate-x-1 transition-transform duration-300 ease-out">
                →
              </span>
            </Link>
            <Link
              href="/assistant"
              className="text-[#141413] hover:text-[#d97757] font-semibold transition-colors duration-300 py-1 px-2 flex items-center gap-1 bg-[#d97757]/10 border border-[#d97757]/30 rounded-full px-3 py-1"
            >
              <span>🤖 AI Assistant</span>
            </Link>
          </nav>

          {/* RIGHT SIDE ACTIONS */}
          <div className="hidden sm:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="text-xs font-semibold text-[#141413] hover:text-[#d97757] bg-[#f0eee6] hover:bg-[#e6e3da] border border-[#cccbc8] px-3.5 py-1.5 rounded-full transition-all"
                >
                  Welcome back, {currentUser.name} 👋
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="bg-white border border-[#cccbc8] hover:border-red-300 hover:text-red-600 text-[#565550] text-xs font-semibold px-4 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-[#141413] hover:text-[#d97757] px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="bg-[#141413] hover:bg-[#d97757] text-[#faf9f5] text-xs font-semibold px-4 py-2 rounded-full shadow-2xs transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* MOBILE ANIMATED HAMBURGER MENU TOGGLE BUTTON */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ backgroundColor: "#141413", color: "#ffffff" }}
            className="md:hidden w-9 h-9 rounded-full flex items-center justify-center focus:outline-none transition-all duration-300 cursor-pointer shadow-md shrink-0 border border-[#141413]"
            aria-label="Toggle navigation menu"
          >
            <svg
              className={`w-5 h-5 transition-transform duration-300 ease-out ${
                mobileMenuOpen ? "rotate-90" : "rotate-0"
              }`}
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {mobileMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" stroke="#d97757" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" stroke="#ffffff" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* 2. MOBILE DROPDOWN FLOATING CARD */}
      <div
        className={`mt-2 bg-[#faf9f5]/95 backdrop-blur-md border border-[#cccbc8] rounded-2xl shadow-2xl p-5 space-y-3 pointer-events-auto md:hidden font-[family-name:var(--font-outfit)] transition-all duration-300 ease-out origin-top transform ${
          mobileMenuOpen
            ? "opacity-100 translate-y-0 scale-y-100 max-h-96"
            : "opacity-0 -translate-y-3 scale-y-95 max-h-0 overflow-hidden py-0 border-transparent shadow-none"
        }`}
      >
        <Link
          href="/"
          onClick={() => setMobileMenuOpen(false)}
          className="block text-base font-medium text-[#141413] hover:text-[#d97757] py-2 border-b border-[#cccbc8]/50 transition-colors"
        >
          Planner
        </Link>
        <Link
          href="/trips"
          onClick={() => setMobileMenuOpen(false)}
          className="group flex items-center justify-between text-base font-semibold text-[#141413] hover:text-[#d97757] py-2 border-b border-[#cccbc8]/50 transition-colors duration-300"
        >
          <span>Trip History</span>
          <span className="transform group-hover:translate-x-1 transition-transform duration-300 ease-out">
            →
          </span>
        </Link>
        <Link
          href="/assistant"
          onClick={() => setMobileMenuOpen(false)}
          className="flex items-center justify-between text-base font-semibold text-[#d97757] py-2 border-b border-[#cccbc8]/50 transition-colors"
        >
          <span>🤖 AI Travel Assistant</span>
          <span>→</span>
        </Link>

        <div className="pt-2 flex flex-col gap-2">
          {currentUser ? (
            <>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold text-[#141413] bg-[#f0eee6] hover:bg-[#e6e3da] border border-[#cccbc8] px-3.5 py-2 rounded-xl text-center block transition-all"
              >
                Welcome back, {currentUser.name} 👋
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-center text-sm font-semibold py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-white border border-[#cccbc8] text-[#141413] text-center text-sm font-semibold py-2.5 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="bg-[#141413] text-white text-center text-sm font-semibold py-2.5 rounded-xl transition-all"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
