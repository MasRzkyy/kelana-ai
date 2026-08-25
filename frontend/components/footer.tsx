"use client";

export default function Footer() {
  return (
    <footer className="bg-[#fefefd] py-6">
      <div className="max-w-[1200px] mx-auto px-6 text-center font-normal text-xs text-[#87867f] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          © 2026 <span className="font-semibold text-[#141413]">KelanaAI</span> — Session 6 Warm Editorial Theme
        </div>
        <div className="flex gap-2">
          <span className="bg-[#faf9f5] text-[#141413] border border-[#cccbc8] px-2.5 py-0.5 rounded-full text-[10px] font-medium">
            Next.js 16
          </span>
          <span className="bg-[#faf9f5] text-[#141413] border border-[#cccbc8] px-2.5 py-0.5 rounded-full text-[10px] font-medium">
            Tailwind CSS v4
          </span>
          <span className="bg-[#faf9f5] text-[#141413] border border-[#cccbc8] px-2.5 py-0.5 rounded-full text-[10px] font-medium">
            FastAPI
          </span>
        </div>
      </div>
    </footer>
  );
}
