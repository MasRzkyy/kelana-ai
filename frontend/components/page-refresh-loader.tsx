"use client";

import LoadingPaperplane from "@/components/loading-paperplane";

interface PageRefreshLoaderProps {
  pageLoading: boolean;
  isFadingOut: boolean;
}

export default function PageRefreshLoader({
  pageLoading,
  isFadingOut,
}: PageRefreshLoaderProps) {
  if (!pageLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center min-h-screen transition-all duration-700 ease-in-out ${
        isFadingOut ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
      }`}
    >
      <LoadingPaperplane />
      <p className="mt-2 text-sm font-semibold text-[#141413] tracking-wide animate-pulse">
        KelanaAI is preparing...
      </p>
    </div>
  );
}
