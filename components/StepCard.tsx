"use client";

import React from "react";
import { AlertTriangle, Check } from "lucide-react";
import { formatChemicalFormula } from "@/lib/formatChemicalFormula";

interface StepCardProps {
  stepIndex: number;
  text: string;
  isSelected: boolean;
  onSelect: (index: number) => void;
  disabled?: boolean;
  revealedState?: {
    isActualFlaw: boolean;
    isStudentSelection: boolean;
  };
}

export function StepCard({
  stepIndex,
  text,
  isSelected,
  onSelect,
  disabled = false,
  revealedState,
}: StepCardProps) {
  // Determine border and background styles based on interaction or reveal
  let borderStyles = "border-4 border-[#121212]";
  let bgStyles = "bg-[#FFFFFF] text-[#121212]";
  let shadowStyles = "shadow-[5px_5px_0px_0px_#121212]";

  if (revealedState) {
    if (revealedState.isActualFlaw) {
      // The true planted error
      borderStyles = "border-4 border-[#121212] border-l-[12px] border-l-[#D02020]";
      bgStyles = "bg-[#FFF0F0] text-[#121212]";
      shadowStyles = "shadow-[6px_6px_0px_0px_#D02020]";
    } else if (revealedState.isStudentSelection && !revealedState.isActualFlaw) {
      // Student falsely accused this step
      borderStyles = "border-4 border-[#121212] border-l-[12px] border-l-[#F0C020]";
      bgStyles = "bg-[#FFFDF0] text-[#121212]";
      shadowStyles = "shadow-[6px_6px_0px_0px_#121212]";
    } else {
      borderStyles = "border-2 border-[#121212]/50";
      bgStyles = "bg-[#FAFAFA] text-[#121212]/70";
      shadowStyles = "shadow-[2px_2px_0px_0px_#121212]/30";
    }
  } else if (isSelected) {
    borderStyles = "border-4 border-[#121212] border-l-[12px] border-l-[#D02020]";
    bgStyles = "bg-[#FFF5F5] text-[#121212]";
    shadowStyles = "shadow-[7px_7px_0px_0px_#121212] -translate-y-0.5";
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-pressed={isSelected}
      onClick={() => {
        if (!disabled) onSelect(stepIndex);
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect(stepIndex);
        }
      }}
      className={`relative w-full p-4 md:p-5 transition-all duration-150 rounded-none cursor-pointer select-none ${borderStyles} ${bgStyles} ${shadowStyles} ${
        !disabled ? "hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" : "cursor-default"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Step Index Geometric Number Box */}
        <div
          className={`w-9 h-9 md:w-10 md:h-10 shrink-0 flex items-center justify-center font-black text-base border-2 border-[#121212] ${
            revealedState?.isActualFlaw
              ? "bg-[#D02020] text-white"
              : isSelected
              ? "bg-[#D02020] text-white"
              : "bg-[#F0C020] text-[#121212]"
          } shadow-[2px_2px_0px_0px_#121212]`}
        >
          {stepIndex + 1}
        </div>

        {/* Step Transformation Text */}
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-black text-xs uppercase tracking-wider text-[#121212]/80">
              Step {stepIndex + 1}
            </span>

            {/* Visual Indicators */}
            {revealedState?.isActualFlaw && (
              <span className="flex items-center gap-1 bg-[#D02020] text-white text-[11px] font-black uppercase px-2 py-0.5 border border-[#121212]">
                <AlertTriangle className="w-3.5 h-3.5 stroke-[3]" />
                Actual Planted Error
              </span>
            )}
            {revealedState?.isStudentSelection && !revealedState?.isActualFlaw && (
              <span className="bg-[#F0C020] text-[#121212] text-[11px] font-black uppercase px-2 py-0.5 border border-[#121212]">
                Your Flag (Valid Step)
              </span>
            )}
            {!revealedState && isSelected && (
              <span className="flex items-center gap-1 bg-[#D02020] text-white text-[11px] font-black uppercase px-2 py-0.5 border border-[#121212] animate-pulse">
                Flagged As Corrupt
              </span>
            )}
          </div>

          <p className="font-mono text-base md:text-lg font-bold text-[#121212] leading-snug">
            {formatChemicalFormula(text)}
          </p>
        </div>

        {/* Triangle Flag Marker for Bauhaus Constructivist aesthetic */}
        {isSelected && !revealedState && (
          <div
            className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[16px] border-r-[#D02020] self-center"
            title="Flagged"
          />
        )}
      </div>
    </div>
  );
}
