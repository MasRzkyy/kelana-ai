"use client";

import HeroSection from "@/components/hero-section";
import PageRefreshLoader from "@/components/page-refresh-loader";
import PlannerForm from "@/components/planner-form";
import ItineraryDisplay from "@/components/itinerary-display";
import Footer from "@/components/footer";
import { useTripGenerator } from "@/hooks/use-trip-generator";

export default function Home() {
  const {
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
  } = useTripGenerator();

  return (
    <>
      <PageRefreshLoader pageLoading={pageLoading} isFadingOut={isFadingOut} />

      <div className="min-h-screen flex flex-col justify-between bg-[#fefefd] text-[#141413]">
        <HeroSection />

        <main id="planner" className="max-w-[1200px] mx-auto px-6 sm:px-10 py-12 flex-1 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <PlannerForm
              destination={destination}
              setDestination={setDestination}
              budget={budget}
              setBudget={setBudget}
              days={days}
              setDays={setDays}
              travelStyle={travelStyle}
              setTravelStyle={setTravelStyle}
              travelMonth={travelMonth}
              setTravelMonth={setTravelMonth}
              loading={loading}
              handleSubmit={handleSubmit}
            />

            <ItineraryDisplay
              loading={loading}
              error={error}
              trip={trip}
              days={days}
              destination={destination}
              handleSubmit={handleSubmit}
            />
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
