"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlannerFormProps {
  destination: string;
  setDestination: (val: string) => void;
  budget: number;
  setBudget: (val: number) => void;
  days: number;
  setDays: (val: number) => void;
  travelStyle: string;
  setTravelStyle: (val: string) => void;
  travelMonth: string;
  setTravelMonth: (val: string) => void;
  loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

export default function PlannerForm({
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
  handleSubmit,
}: PlannerFormProps) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="lg:col-span-5 bg-[#fefefd] border border-[#cccbc8] rounded-2xl p-6 sm:p-8 shadow-sm font-[family-name:var(--font-outfit)]">
      <div className="flex items-center justify-between border-b border-[#cccbc8] pb-4 mb-6">
        <h2 className="text-xl font-semibold text-[#141413] font-[family-name:var(--font-outfit)]">
          Travel Parameters
        </h2>
        <span className="bg-[#e3dacc] text-[#141413] text-xs font-medium px-2.5 py-0.5 rounded-full font-[family-name:var(--font-outfit)]">
          Step 1
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {/* Destination */}
          <Field>
            <FieldLabel htmlFor="form-destination">Destination</FieldLabel>
            <Input
              id="form-destination"
              type="text"
              required
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g. Japan, Paris, Bali"
            />
          </Field>

          {/* Budget & Days Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="form-budget">Budget ($)</FieldLabel>
              <Input
                id="form-budget"
                type="number"
                required
                min={100}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                placeholder="2000"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="form-days">Days</FieldLabel>
              <Input
                id="form-days"
                type="number"
                required
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                placeholder="5"
              />
            </Field>
          </div>

          {/* Travel Month */}
          <Field>
            <FieldLabel htmlFor="form-travel-month">Travel Month</FieldLabel>
            <Select value={travelMonth} onValueChange={setTravelMonth}>
              <SelectTrigger id="form-travel-month">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>

          {/* Travel Style Pills */}
          <Field>
            <FieldLabel>Travel Style</FieldLabel>
            <div className="grid grid-cols-2 gap-2">
              {["Family", "Solo", "Couple", "Backpacker"].map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setTravelStyle(style)}
                  className={`border rounded-xl py-2.5 px-3 font-semibold text-xs transition-all cursor-pointer font-[family-name:var(--font-outfit)] ${
                    travelStyle === style
                      ? "bg-[#141413] border-[#141413] text-[#faf9f5] shadow-2xs"
                      : "bg-white border-[#cccbc8] text-[#141413] hover:bg-[#faf9f5] hover:border-[#87867f]"
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </Field>

          {/* Submit CTA Button */}
          <Field>
            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 text-base font-[family-name:var(--font-outfit)]"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span className="mr-1.5">⚡</span>
                  <span>Generate AI Trip</span>
                </>
              )}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
