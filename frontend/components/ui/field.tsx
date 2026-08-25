"use client";

import React from "react";

export function FieldGroup({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

export function Field({
  children,
  orientation = "vertical",
  className = "",
}: {
  children: React.ReactNode;
  orientation?: "vertical" | "horizontal";
  className?: string;
}) {
  const flexClass =
    orientation === "horizontal"
      ? "flex items-center gap-3"
      : "flex flex-col gap-1.5";
  return <div className={`${flexClass} ${className}`}>{children}</div>;
}

export function FieldLabel({
  htmlFor,
  children,
  className = "",
}: {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-[11px] font-semibold text-[#87867f] uppercase tracking-wider ${className}`}
    >
      {children}
    </label>
  );
}

export function FieldDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-xs text-[#87867f] font-normal ${className}`}>
      {children}
    </p>
  );
}
