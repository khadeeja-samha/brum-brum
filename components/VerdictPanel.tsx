"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { CheckCircle2, XCircle, AlertCircle, ArrowRight, RotateCcw, Target, AlertTriangle, Sparkles, ShieldAlert, HelpCircle } from "lucide-react";
import { GradeResponse } from "@/lib/ai/schemas";

interface VerdictPanelProps {
  verdictData: GradeResponse;
  onNextChallenge: () => void;
  onRetry?: () => void;
}

export function VerdictPanel({ verdictData, onNextChallenge }: VerdictPanelProps) {
  const isCorrect = verdictData.verdict === "correct";
  const isPartial = verdictData.verdict === "partially_correct";
  const confidence = verdictData.confidence ?? 3;

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

  // Metacognition Calibration Details
  let calTitle = "Moderate Confidence Audit";
  let calMsg = "Moderate baseline confidence (3/5). As you audit more problems, aim to calibrate higher certainty on clear patterns.";
  let calBg = "bg-[#FAFAFA] text-[#121212] border-l-8 border-l-[#121212]";
  let calBadgeBg = "bg-[#121212] text-white";
  let CalIcon = HelpCircle;

  if (confidence >= 4) {
    if (isCorrect) {
      calTitle = "Perfect Calibration — Justified Certainty";
      calMsg = `Accurate detection backed by high confidence (${confidence}/5). Your self-assessment perfectly matches your competence.`;
      calBg = "bg-[#F0F5FF] text-[#121212] border-l-8 border-l-[#1040C0]";
      calBadgeBg = "bg-[#1040C0] text-white";
      CalIcon = Target;
    } else if (isPartial) {
      calTitle = "Partial Calibration — Shaky Explanation";
      calMsg = `You felt highly confident (${confidence}/5) and flagged the right step, but your explanation missed the true underlying root cause.`;
      calBg = "bg-[#FFFDF0] text-[#121212] border-l-8 border-l-[#F0C020]";
      calBadgeBg = "bg-[#F0C020] text-[#121212]";
      CalIcon = AlertCircle;
    } else {
      calTitle = "Misconception Alert — Overconfident Audit";
      calMsg = `You felt highly confident (${confidence}/5), but flagged a sound step. This highlights a cognitive blind spot or false certainty.`;
      calBg = "bg-[#FFF0F0] text-[#121212] border-l-8 border-l-[#D02020]";
      calBadgeBg = "bg-[#D02020] text-white";
      CalIcon = AlertTriangle;
    }
  } else if (confidence <= 2) {
    if (isCorrect) {
      calTitle = "Underconfidence — Trust Your Intuition";
      calMsg = `You caught the exact flaw despite low confidence (${confidence}/5). Your diagnostic instincts are sharper than you think!`;
      calBg = "bg-[#F0F5FF] text-[#121212] border-l-8 border-l-[#1040C0]";
      calBadgeBg = "bg-[#1040C0] text-white";
      CalIcon = Sparkles;
    } else if (isPartial) {
      calTitle = "Cautious Reasoning — Developing Insight";
      calMsg = `Your uncertainty (${confidence}/5) matched your evolving reasoning on this tricky step.`;
      calBg = "bg-[#FFFDF0] text-[#121212] border-l-8 border-l-[#F0C020]";
      calBadgeBg = "bg-[#F0C020] text-[#121212]";
      CalIcon = AlertCircle;
    } else {
      calTitle = "Honest Self-Assessment — Justified Caution";
      calMsg = `You sensed uncertainty (${confidence}/5) and the step was tricky. Accurate recognition of uncertainty is the foundation of verification.`;
      calBg = "bg-[#FFFDF0] text-[#121212] border-l-8 border-l-[#F0C020]";
      calBadgeBg = "bg-[#F0C020] text-[#121212]";
      CalIcon = ShieldAlert;
    }
  }

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
        {/* Metacognitive Calibration Callout Banner */}
        <div className={`p-4 border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] ${calBg}`}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`inline-flex items-center gap-1 text-[11px] font-black uppercase px-2 py-0.5 border border-[#121212] ${calBadgeBg}`}>
              <CalIcon className="w-3.5 h-3.5 stroke-[2.5]" />
              {calTitle}
            </span>
            <span className="text-xs font-bold text-[#121212]/70">
              (Confidence: {confidence}/5)
            </span>
          </div>
          <p className="text-sm font-bold text-[#121212] leading-snug">
            {calMsg}
          </p>
        </div>

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
              Mathematical / Physical Root Cause (Step {verdictData.actualFlawedStep + 1})
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
