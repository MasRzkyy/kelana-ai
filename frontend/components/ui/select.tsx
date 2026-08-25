"use client";

import React, { createContext, useContext } from "react";

interface SelectContextType {
  value?: string;
  onValueChange?: (val: string) => void;
}

const SelectContext = createContext<SelectContextType>({});

export function Select({
  value,
  onValueChange,
  defaultValue,
  children,
  items,
}: {
  value?: string;
  onValueChange?: (val: string) => void;
  defaultValue?: string;
  children?: React.ReactNode;
  items?: Array<{ label: string; value: string }>;
}) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || "");
  const currentValue = value !== undefined ? value : internalValue;

  const handleChange = (val: string) => {
    if (value === undefined) {
      setInternalValue(val);
    }
    if (onValueChange) {
      onValueChange(val);
    }
  };

  return (
    <SelectContext.Provider value={{ value: currentValue, onValueChange: handleChange }}>
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({
  id,
  children,
  className = "",
}: {
  id?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative w-full ${className}`}>
      {children}
    </div>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return null;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function SelectGroup({ children }: { children: React.ReactNode }) {
  const ctx = useContext(SelectContext);
  return (
    <div className="relative w-full">
      <select
        value={ctx.value}
        onChange={(e) => ctx.onValueChange && ctx.onValueChange(e.target.value)}
        className="w-full bg-white border border-[#cccbc8] rounded-xl px-3.5 py-2.5 pr-10 font-normal text-[#141413] text-sm shadow-2xs focus:outline-none focus:border-[#d97757] focus:ring-2 focus:ring-[#d97757]/20 transition-all appearance-none cursor-pointer font-[family-name:var(--font-outfit)]"
      >
        {children}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#87867f]">
        <svg className="w-4 h-4 fill-current opacity-70" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
}

export function SelectItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  return (
    <option value={value} className="bg-white text-[#141413] font-[family-name:var(--font-outfit)]">
      {children}
    </option>
  );
}
