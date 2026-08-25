import React from "react";

export function renderParsedItinerary(aiText?: string) {
  if (!aiText) return null;

  const rawSections = aiText.split(/###\s+/).filter(Boolean);

  if (rawSections.length <= 1) {
    return (
      <div className="text-[#141413] font-normal text-sm leading-relaxed whitespace-pre-line bg-[#faf9f5] border border-[#cccbc8] p-5 rounded-xl">
        {aiText}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rawSections.map((sec, idx) => {
        const lines = sec.trim().split("\n");
        const title = lines[0].replace(/^[#*📍💡🍜💰\s]+/, "").trim();
        const content = lines.slice(1).join("\n").trim();

        const secLower = sec.toLowerCase();
        const titleLower = lines[0].toLowerCase();

        const isDayCard = secLower.includes("day ") || titleLower.includes("day");
        const isTips = secLower.includes("tip") || titleLower.includes("tip");
        const isFood = secLower.includes("food") || secLower.includes("culinary") || titleLower.includes("food");
        const isBudget = secLower.includes("budget breakdown") || secLower.includes("estimated budget") || titleLower.includes("budget");

        if (isDayCard) {
          return (
            <div key={idx} className="bg-[#faf9f5] border border-[#cccbc8] rounded-xl p-5 shadow-sm transition-all hover:border-[#d97757]">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#e3dacc]">
                <span className="bg-[#141413] text-[#faf9f5] text-xs font-bold px-2.5 py-1 rounded-lg">
                  🗓️ Day Card
                </span>
                <h4 className="font-semibold text-base text-[#141413]">
                  {title}
                </h4>
              </div>
              <div className="text-[#141413] text-sm leading-relaxed whitespace-pre-line">
                {content}
              </div>
            </div>
          );
        }

        if (isTips) {
          return (
            <div key={idx} className="bg-[#fef9c3] border border-[#fef08a] text-[#854d0e] rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 font-semibold text-base">
                <span>💡</span>
                <h4>{title || "Travel Tips"}</h4>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-line text-[#713f12]">
                {content}
              </div>
            </div>
          );
        }

        if (isFood) {
          return (
            <div key={idx} className="bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 font-semibold text-base">
                <span>🍜</span>
                <h4>{title || "Local Food Recommendations"}</h4>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-line text-[#047857]">
                {content}
              </div>
            </div>
          );
        }

        if (isBudget) {
          return (
            <div key={idx} className="bg-[#f5e3c7] border border-[#e3dacc] text-[#141413] rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2 font-semibold text-base">
                <span>💰</span>
                <h4>{title || "Estimated Budget Breakdown"}</h4>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-line text-[#44403c]">
                {content}
              </div>
            </div>
          );
        }

        return (
          <div key={idx} className="bg-[#faf9f5] border border-[#cccbc8] rounded-xl p-5">
            <h4 className="font-semibold text-base text-[#141413] mb-2">{title}</h4>
            <div className="text-[#141413] text-sm leading-relaxed whitespace-pre-line">
              {content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
