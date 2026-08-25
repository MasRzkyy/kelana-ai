"use client";

import { useState } from "react";

interface NavbarProps {
  onStartPlanning?: () => void;
}

export default function Navbar({ onStartPlanning }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleScrollToPlanner = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onStartPlanning) {
      onStartPlanning();
    } else {
      const plannerEl = document.getElementById("planner");
      if (plannerEl) {
        plannerEl.scrollIntoView({ behavior: "smooth" });
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
    <div className="fixed top-4 inset-x-0 z-50 px-4 sm:px-8 max-w-[1240px] mx-auto w-full pointer-events-none font-[family-name:var(--font-outfit)]">
      {/* 1. TOP FLOATING PILL HEADER */}
      <header className="bg-transparent backdrop-blur-sm border border-[#cccbc8] rounded-full shadow-sm pointer-events-auto transition-all">
        <div className="px-5 sm:px-7 py-2.5 flex items-center justify-between">
          {/* BRAND LOGO */}
          <a
            href="#"
            onClick={handleScrollToTop}
            className="flex items-baseline gap-1 group pl-1 sm:pl-2"
          >
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#141413] group-hover:text-[#d97757] transition-colors">
              Kelana
            </span>
            <span className="text-xs font-bold text-[#d97757]">®</span>
          </a>

          {/* DESKTOP NAV LINKS */}
          <nav className="hidden md:flex items-center gap-8 lg:gap-12 text-sm font-medium text-[#87867f]">
            <a
              href="#planner"
              onClick={handleScrollToPlanner}
              className="text-[#141413] hover:text-[#d97757] transition-colors py-1 px-2"
            >
              Itinerary Planner
            </a>
            <a
              href="#solutions"
              onClick={handleScrollToPlanner}
              className="hover:text-[#141413] transition-colors py-1 px-2"
            >
              Travel Support
            </a>
            <a
              href="#architecture"
              onClick={handleScrollToPlanner}
              className="hover:text-[#141413] transition-colors py-1 px-2"
            >
              Architecture
            </a>
          </nav>

          {/* RIGHT SIDE ACTIONS */}
          <div className="hidden sm:flex items-center gap-3">
            {/* HEALTH STATUS PILL */}
            <div className="flex items-center gap-2 bg-[#f0eee6] border border-[#cccbc8] px-3.5 py-1.5 rounded-full text-xs font-medium text-[#3d3d3a]">
              <span className="w-2 h-2 rounded-full bg-[#d97757] animate-pulse" />
              <span>FastAPI Backend :8000</span>
            </div>

            {/* CTA PILL BUTTON */}
            <a
              href="#planner"
              onClick={handleScrollToPlanner}
              className="bg-[#141413] hover:bg-[#d97757] text-[#faf9f5] text-xs font-semibold px-5 py-2.5 rounded-full shadow-sm transition-all"
            >
              Start Planning
            </a>
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

      {/* 2. MOBILE DROPDOWN FLOATING CARD WITH SMOOTH FADE & SLIDE ANIMATION */}
      <div
        className={`mt-2 bg-transparent backdrop-blur-sm border border-[#cccbc8] rounded-2xl shadow-2xl p-5 space-y-3 pointer-events-auto md:hidden font-[family-name:var(--font-outfit)] transition-all duration-300 ease-out origin-top transform ${
          mobileMenuOpen
            ? "opacity-100 translate-y-0 scale-y-100 max-h-96"
            : "opacity-0 -translate-y-3 scale-y-95 max-h-0 overflow-hidden py-0 border-transparent shadow-none"
        }`}
      >
        <a
          href="#planner"
          onClick={handleScrollToPlanner}
          className="block text-base font-medium text-[#141413] hover:text-[#d97757] py-2 border-b border-[#cccbc8]/50 transition-colors"
        >
          Itinerary Planner
        </a>
        <a
          href="#solutions"
          onClick={handleScrollToPlanner}
          className="block text-base font-normal text-[#87867f] hover:text-[#141413] py-2 border-b border-[#cccbc8]/50 transition-colors"
        >
          Travel Support
        </a>
        <a
          href="#architecture"
          onClick={handleScrollToPlanner}
          className="block text-base font-normal text-[#87867f] hover:text-[#141413] py-2 border-b border-[#cccbc8]/50 transition-colors"
        >
          Architecture
        </a>

        <div className="pt-2 flex flex-col gap-3">
          <div className="flex items-center gap-2 bg-[#f0eee6] border border-[#cccbc8] px-3.5 py-2 rounded-full text-xs font-medium text-[#3d3d3a] justify-center">
            <span className="w-2 h-2 rounded-full bg-[#d97757] animate-pulse" />
            <span>FastAPI Backend :8000</span>
          </div>
          <a
            href="#planner"
            onClick={handleScrollToPlanner}
            className="bg-[#d97757] hover:bg-[#c6613f] text-white text-center text-sm font-semibold py-3 rounded-full shadow-sm transition-all"
          >
            Start Planning
          </a>
        </div>
      </div>
    </div>
  );
}
