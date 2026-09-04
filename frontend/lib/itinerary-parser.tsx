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
        <strong key={idx} className="font-semibold text-[#0f172a]">
          {boldText}
        </strong>
      );
    }
    return part;
  });
}

/**
 * Clean, standard conversational Markdown renderer for AI Assistant responses.
 * Renders headers, lists, and formatted text naturally like standard chat interfaces (ChatGPT / Claude).
 */
export function renderCleanAssistantText(aiText?: string) {
  if (!aiText) return null;

  const lines = aiText.split("\n");

  return (
    <div className="space-y-2 text-xs sm:text-sm text-[#334155] leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1.5" />;

        // Header check (# Header, ## Header, ### Header, #### Header)
        if (/^#{1,4}\s+/.test(trimmed)) {
          const headerText = trimmed.replace(/^#{1,4}\s+/, "").replace(/\*\*/g, "").trim();
          return (
            <h3 key={i} className="font-bold text-sm sm:text-base text-[#0f172a] pt-3 pb-1 tracking-tight border-b border-[#f1f5f9] mb-1">
              {headerText}
            </h3>
          );
        }

        // Bullet point check (- item, * item, • item)
        if (/^[-*•]\s+/.test(trimmed)) {
          const bulletContent = trimmed.replace(/^[-*•]\s+/, "");
          return (
            <div key={i} className="flex items-start gap-2 pl-1 py-0.5">
              <span className="text-[#2589f5] font-bold text-xs shrink-0 mt-0.5">•</span>
              <div className="flex-1 text-[#334155]">
                {parseInlineFormatting(bulletContent)}
              </div>
            </div>
          );
        }

        // Numbered list check (1. item, 2. item)
        if (/^\d+\.\s+/.test(trimmed)) {
          const numMatch = trimmed.match(/^(\d+\.)\s+(.*)/);
          if (numMatch) {
            return (
              <div key={i} className="flex items-start gap-2 pl-1 py-0.5">
                <span className="text-[#2589f5] font-semibold text-xs shrink-0 mt-0.5">{numMatch[1]}</span>
                <div className="flex-1 text-[#334155]">
                  {parseInlineFormatting(numMatch[2])}
                </div>
              </div>
            );
          }
        }

        // Standard paragraph line
        return (
          <div key={i} className="text-[#334155]">
            {parseInlineFormatting(trimmed)}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Main itinerary renderer function - renders clean conversational text.
 */
export function renderParsedItinerary(aiText?: string) {
  return renderCleanAssistantText(aiText);
}
