"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline";
}

export function Button({
  className = "",
  variant = "default",
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#d97757]/30 disabled:opacity-50 cursor-pointer active:scale-[0.995] font-[family-name:var(--font-outfit)]";
  const variantStyles =
    variant === "outline"
      ? "border border-[#cccbc8] bg-white hover:bg-[#faf9f5] text-[#141413] shadow-2xs"
      : "bg-[#d97757] hover:bg-[#c6613f] text-white border border-[#c6613f] shadow-sm hover:shadow";

  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
}
