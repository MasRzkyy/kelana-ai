"use client";

import Navbar from "@/components/navbar";
import WorldMapAnimation from "@/components/world-map-animation";

export default function HeroSection() {
  return (
    <section className="relative pb-12 sm:pb-16 bg-[#fefefd]">
      <Navbar />
      <div className="max-w-[1200px] mx-auto px-6 sm:px-10 pt-24 sm:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          <div className="lg:col-span-6 max-w-2xl">
            <span className="inline-block bg-[#f5e3c7] border border-[#e3dacc] text-[#141413] px-3 py-1 rounded-full text-xs font-medium mb-4">
              ✨ AI Travel Orchestration
            </span>
            <h1 className="text-4xl sm:text-6xl font-bold text-[#141413] leading-[1.15] mb-4">
              Engineered Travel Intelligence.
            </h1>
            <p className="text-base sm:text-lg font-normal text-[#87867f] leading-[1.5] max-w-xl">
              Input your destination, budget, and travel style. Amazon Bedrock LLM calculates bespoke itineraries tailored to your voyage.
            </p>
          </div>
          <div className="lg:col-span-6 flex justify-center items-center">
            <WorldMapAnimation />
          </div>
        </div>
      </div>
    </section>
  );
}
