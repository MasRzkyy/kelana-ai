"use client";

import React from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={`w-full bg-white border border-[#cccbc8] rounded-xl px-3.5 py-2.5 font-normal text-[#141413] text-sm placeholder-[#b0aea5] shadow-2xs focus:outline-none focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20 transition-all font-[family-name:var(--font-outfit)] ${className}`}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
