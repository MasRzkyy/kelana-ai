import React from "react";

/**
 * Helper to convert inline markdown syntax like **bold** into clean <strong> elements
 * without showing raw ** characters.
 */

export function parseInlineFormatting(str: string) {
  if (!str) return null;

  // Split by bold pattern **text**
  const parts = str.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      const boldText = part.slice(2, -2);
      return (
        <strong key={idx} className="font-semibold text-[#141413]">
          {boldText}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Clean Markdown renderer for AI Assistant responses.
 * Converts headers, lists, and bold text into clean HTML elements without raw markdown symbols (** or ###).
 */
export function renderCleanAssistantText(aiText?: string) {
  if (!aiText) return null;

  const lines = aiText.split("\n");

  return (
    <div className="space-y-2 text-xs sm:text-sm text-[#141413] leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1" />;

        // Header check (# Header, ## Header, ### Header, #### Header)
        if (/^#{1,4}\s+/.test(trimmed)) {
          const headerText = trimmed.replace(/^#{1,4}\s+/, "").replace(/\*\*/g, "").trim();
          return (
            <h3 key={i} className="font-bold text-sm sm:text-base text-[#141413] pt-2 pb-0.5 tracking-tight">
              {headerText}
            </h3>
          );
        }

        // Bullet point check (- item, * item, • item)
        if (/^[-*•]\s+/.test(trimmed)) {
          const bulletContent = trimmed.replace(/^[-*•]\s+/, "");
          return (
            <div key={i} className="flex items-start gap-2.5 pl-1 py-0.5">
              <span className="text-[#d97757] font-bold text-xs shrink-0 mt-0.5">•</span>
              <div className="flex-1 text-[#3d3d3a]">
                {parseInlineFormatting(bulletContent)}
              </div>
            </div>
          );
        }

        // Standard paragraph line
        return (
          <div key={i} className="text-[#3d3d3a]">
            {parseInlineFormatting(trimmed)}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Main itinerary parser function
 */
export function renderParsedItinerary(aiText?: string) {
  if (!aiText) return null;

  // Use clean markdown parser if no heavy day cards exist
  if (!aiText.includes("Day ") && !aiText.includes("DAY ") && !aiText.includes("### Day")) {
    return renderCleanAssistantText(aiText);
  }

  const rawSections = aiText.split(/###\s+/).filter(Boolean);

  if (rawSections.length <= 1) {
    return renderCleanAssistantText(aiText);
  }

  return (
    <div className="space-y-4">
      {rawSections.map((sec, idx) => {
        const lines = sec.trim().split("\n");
        const title = lines[0].replace(/^[#*📍💡🍜💰\s]+/, "").replace(/\*\*/g, "").trim();
        const content = lines.slice(1).join("\n").trim();

        const secLower = sec.toLowerCase();
        const titleLower = lines[0].toLowerCase();

        const isDayCard = secLower.includes("day ") || titleLower.includes("day");
        const isTips = secLower.includes("tip") || titleLower.includes("tip");
        const isFood = secLower.includes("food") || secLower.includes("culinary") || titleLower.includes("food");
        const isBudget = secLower.includes("budget breakdown") || secLower.includes("estimated budget") || titleLower.includes("budget");

        if (isDayCard) {
          return (
            <div key={idx} className="bg-[#faf9f5] border border-[#cccbc8] rounded-xl p-5 shadow-2xs transition-all hover:border-[#d97757]">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#e3dacc]">
                <span className="bg-[#141413] text-[#faf9f5] text-xs font-bold px-2.5 py-1 rounded-lg">
                  🗓️ Day Card
                </span>
                <h4 className="font-semibold text-base text-[#141413]">
                  {title}
                </h4>
              </div>
              <div>{renderCleanAssistantText(content)}</div>
            </div>
          );
        }

        if (isTips) {
          return (
            <div key={idx} className="bg-[#fef9c3] border border-[#fef08a] text-[#854d0e] rounded-xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-2 font-semibold text-base">
                <span>💡</span>
                <h4>{title || "Travel Tips"}</h4>
              </div>
              <div>{renderCleanAssistantText(content)}</div>
            </div>
          );
        }

        if (isFood) {
          return (
            <div key={idx} className="bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46] rounded-xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-2 font-semibold text-base">
                <span>🍜</span>
                <h4>{title || "Local Food Recommendations"}</h4>
              </div>
              <div>{renderCleanAssistantText(content)}</div>
            </div>
          );
        }

        if (isBudget) {
          return (
            <div key={idx} className="bg-[#f5e3c7] border border-[#e3dacc] text-[#141413] rounded-xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-2 font-semibold text-base">
                <span>💰</span>
                <h4>{title || "Estimated Budget Breakdown"}</h4>
              </div>
              <div>{renderCleanAssistantText(content)}</div>
            </div>
          );
        }

        return (
          <div key={idx} className="space-y-1">
            <h4 className="font-semibold text-base text-[#141413] mb-1">{title}</h4>
            <div>{renderCleanAssistantText(content)}</div>
          </div>
        );
      })}
    </div>
  );
}
