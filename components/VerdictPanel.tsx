"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, RotateCcw } from "lucide-react";
import { GradeResponse } from "@/lib/ai/schemas";

interface VerdictPanelProps {
  verdictData: GradeResponse;
  onNextChallenge: () => void;
  onRetry?: () => void;
}

export function VerdictPanel({ verdictData, onNextChallenge }: VerdictPanelProps) {
  const isCorrect = verdictData.verdict === "correct";
  const isPartial = verdictData.verdict === "partially_correct";

  // Trigger celebration confetti on pure correct catch
  useEffect(() => {
    if (isCorrect) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ["#1040C0", "#D02020", "#F0C020", "#121212"],
        });
      } catch {}
    }
  }, [isCorrect]);

  return (
    <div
      className={`w-full border-4 border-[#121212] p-6 md:p-8 shadow-[8px_8px_0px_0px_#121212] transition-all duration-200 ${
        isCorrect
          ? "bg-[#1040C0] text-white"
          : isPartial
          ? "bg-[#F0C020] text-[#121212]"
          : "bg-[#D02020] text-white"
      }`}
    >
      {/* Header Stamp / Flash */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-4 border-[#121212]">
        <div className="flex items-center gap-3">
          {/* Geometric Stamp Icon */}
          <div
            className={`w-12 h-12 border-3 border-[#121212] flex items-center justify-center ${
              isCorrect
                ? "rounded-full bg-[#FFFFFF] text-[#1040C0]"
                : isPartial
                ? "bg-[#FFFFFF] text-[#121212]"
                : "rounded-none bg-[#FFFFFF] text-[#D02020]"
            } shadow-[3px_3px_0px_0px_#121212] shrink-0`}
          >
            {isCorrect ? (
              <CheckCircle2 className="w-7 h-7 stroke-[3]" />
            ) : isPartial ? (
              <AlertCircle className="w-7 h-7 stroke-[3]" />
            ) : (
              <XCircle className="w-7 h-7 stroke-[3]" />
            )}
          </div>

          <div>
            <span className="font-black text-xs uppercase tracking-wider px-2 py-0.5 border border-[#121212] bg-[#FFFFFF] text-[#121212] inline-block mb-1">
              Audit Verdict
            </span>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
              {isCorrect
                ? "Flaw Confirmed — Bug Caught!"
                : isPartial
                ? "Partially Correct — Step Spotted"
                : "Audit Failed — False Accusation"}
            </h2>
          </div>
        </div>

        {/* Mastery Delta Pill */}
        <div className="flex items-center gap-2 px-4 py-2 bg-[#FFFFFF] text-[#121212] border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] font-black text-sm uppercase">
          <span>Concept Mastery:</span>
          <span
            className={`font-black ${
              isCorrect ? "text-[#1040C0]" : isPartial ? "text-[#121212]" : "text-[#D02020]"
            }`}
          >
            {verdictData.masteryDelta > 0
              ? `+${verdictData.masteryDelta} Point`
              : verdictData.masteryDelta === 0
              ? `+0 (Developing)`
              : `-1 Point`}
          </span>
        </div>
      </div>

      {/* Explanation & Feedback Section */}
      <div className="my-6 space-y-4">
        {/* Diagnostic Feedback */}
        <div className="bg-[#FFFFFF] text-[#121212] p-5 border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212]">
          <h3 className="font-black text-xs uppercase tracking-wider text-[#121212]/80 mb-2">
            AI Auditor Evaluation
          </h3>
          <p className="font-medium text-base sm:text-lg leading-relaxed">
            {verdictData.feedback}
          </p>
        </div>

        {/* Detailed Breakdown of the True Flaw */}
        <div className="bg-[#FAFAFA] text-[#121212] p-5 border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 bg-[#D02020] border border-[#121212]" />
            <h3 className="font-black text-xs uppercase tracking-wider text-[#121212]/80">
              Mathematical Root Cause (Step {verdictData.actualFlawedStep + 1})
            </h3>
          </div>
          <p className="font-mono text-sm sm:text-base font-bold text-[#121212]">
            {verdictData.correctExplanation}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4 pt-4 border-t-4 border-[#121212]">
        <button
          onClick={onNextChallenge}
          className="bauhaus-btn flex items-center justify-center gap-3 bg-[#FFFFFF] text-[#121212] font-black uppercase text-base px-8 py-4 border-4 border-[#121212] shadow-[4px_4px_0px_0px_#121212] hover:-translate-y-1 transition-transform cursor-pointer"
        >
          <span>Next Challenge</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
