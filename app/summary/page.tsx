"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  ArrowLeft,
  RotateCcw,
  LayoutGrid,
  Trophy,
  Target,
  Flame,
  Zap,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";
import { useSession, CONCEPT_METADATA, calculateCalibrationScore } from "@/lib/state/SessionContext";
import { ReportCardCanvas } from "@/components/ReportCardCanvas";

export default function SummaryPage() {
  const { streak, totalAttempts, totalCorrect, history, mastery, resetSession } = useSession();

  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const calibrationScore = calculateCalibrationScore(history);

  // Calibration Quadrants
  const highConfCorrect = history.filter((h) => (h.confidence ?? 3) >= 4 && h.verdict === "correct").length;
  const highConfIncorrect = history.filter((h) => (h.confidence ?? 3) >= 4 && h.verdict === "incorrect").length;
  const highConfPartial = history.filter((h) => (h.confidence ?? 3) >= 4 && h.verdict === "partially_correct").length;
  const lowConfCorrect = history.filter((h) => (h.confidence ?? 3) <= 2 && h.verdict === "correct").length;
  const lowConfIncorrect = history.filter((h) => (h.confidence ?? 3) <= 2 && h.verdict === "incorrect").length;
  const lowConfPartial = history.filter((h) => (h.confidence ?? 3) <= 2 && h.verdict === "partially_correct").length;

  // Trigger celebratory confetti on high accuracy
  useEffect(() => {
    if (accuracy >= 70 && totalAttempts >= 3) {
      try {
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#1040C0", "#D02020", "#F0C020", "#121212"],
        });
      } catch {}
    }
  }, [accuracy, totalAttempts]);

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212] flex flex-col justify-between p-4 md:p-8 selection:bg-[#D02020] selection:text-white">
      {/* Top Header */}
      <header className="w-full flex items-center justify-between border-4 border-[#121212] bg-[#FFFFFF] p-4 shadow-[6px_6px_0px_0px_#121212] mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="bauhaus-btn flex items-center gap-2 font-black text-xs uppercase px-3 py-2 bg-[#F0F0F0] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#FFFFFF]"
          >
            <ArrowLeft className="w-4 h-4 stroke-[3]" />
            <span>Home</span>
          </Link>
          <div className="h-6 w-[2px] bg-[#121212] hidden sm:block" />
          <span className="font-black text-lg sm:text-xl uppercase tracking-tight">
            Audit Session Report
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/topics"
            className="bauhaus-btn flex items-center gap-1.5 font-black text-xs uppercase px-3 py-2 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#F5F5F5]"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Curriculum</span>
          </Link>
        </div>
      </header>

      {/* Main Summary Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full mb-8 space-y-8">
        {/* Big Display Headline (DESIGN.md §3) */}
        <div className="border-4 border-[#121212] bg-[#FFFFFF] p-8 md:p-12 shadow-[8px_8px_0px_0px_#121212] relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <span className="font-black text-xs uppercase px-3 py-1 bg-[#D02020] text-white border border-[#121212] shadow-[2px_2px_0px_0px_#121212]">
              Audit Debrief
            </span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-[#1040C0] border border-[#121212]" />
              <div className="w-4 h-4 bg-[#F0C020] border border-[#121212]" />
              <div className="w-4 h-4 bg-[#D02020] border border-[#121212]" />
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight leading-[0.9] mb-4">
            You Caught{" "}
            <span className="text-[#1040C0] underline decoration-[#121212] decoration-4">
              {totalCorrect} / {totalAttempts}
            </span>{" "}
            Planted Flaws.
          </h1>

          <p className="text-base sm:text-lg font-medium text-[#121212]/80 max-w-2xl">
            {accuracy >= 75
              ? "Exceptional critical audit skills! You consistently detected logical slips and articulated the exact STEM principles violated."
              : totalAttempts === 0
              ? "You haven't completed any challenges in this session yet. Launch a challenge to audit AI traces."
              : "Solid practice run. Review the metacognitive calibration breakdown and misconceptions below."}
          </p>
        </div>

        {/* 4-Column Geometric Stats Block */}
        <div className="border-4 border-[#121212] bg-[#FFFFFF] shadow-[8px_8px_0px_0px_#121212] grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x-4 divide-[#121212]">
          <div className="p-5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-[#1040C0] text-white border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex items-center justify-center mb-2">
              <Target className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#121212]/70 mb-1">
              Audit Accuracy
            </span>
            <span className="text-3xl font-black">{accuracy}%</span>
          </div>

          <div className="p-5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-[#F0C020] text-[#121212] border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex items-center justify-center mb-2">
              <Flame className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#121212]/70 mb-1">
              Top Streak
            </span>
            <span className="text-3xl font-black">{streak} Flaws</span>
          </div>

          <div className="p-5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-[#D02020] text-white border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex items-center justify-center mb-2">
              <Zap className="w-6 h-6 stroke-[2.5]" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#121212]/70 mb-1">
              Total Audits
            </span>
            <span className="text-3xl font-black">{totalAttempts}</span>
          </div>

          <div className="p-5 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-[#121212] text-white border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex items-center justify-center mb-2">
              <span className="font-mono font-black text-lg">C</span>
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#121212]/70 mb-1">
              Calibration Index
            </span>
            <span className="text-3xl font-black">{totalAttempts > 0 ? `${calibrationScore}%` : "—"}</span>
          </div>
        </div>

        {/* Metacognitive Calibration Quadrant Card (Phase 4d) */}
        <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 md:p-8 shadow-[8px_8px_0px_0px_#121212]">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-[#121212]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#121212] border border-[#121212]" />
              <h2 className="text-xl font-black uppercase tracking-tight">
                Metacognitive Calibration Analysis
              </h2>
            </div>
            <span className="font-black text-xs uppercase px-2.5 py-1 bg-[#1040C0] text-white border border-[#121212]">
              {calibrationScore >= 80 ? "Master Calibrated" : calibrationScore >= 60 ? "Balanced Calibration" : "Needs Realignment"}
            </span>
          </div>

          <p className="text-sm font-medium text-[#121212]/80 mb-6">
            CogniTrace evaluates how accurately your self-assessed certainty matches your actual diagnostic performance across 4 metacognitive quadrants.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Quadrant 1: Justified High Certainty */}
            <div className="border-3 border-[#121212] p-4 bg-[#F0F5FF] shadow-[3px_3px_0px_0px_#1040C0]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-xs uppercase tracking-tight text-[#1040C0]">
                  Calibrated Precision
                </span>
                <span className="font-mono font-black text-lg text-[#1040C0]">{highConfCorrect}</span>
              </div>
              <span className="text-[11px] font-bold text-[#121212]/70 block">
                High Confidence (4-5) + Correct. Clean, validated diagnostic mastery.
              </span>
            </div>

            {/* Quadrant 2: Overconfidence Blindspots */}
            <div className="border-3 border-[#121212] p-4 bg-[#FFF0F0] shadow-[3px_3px_0px_0px_#D02020]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-xs uppercase tracking-tight text-[#D02020]">
                  Overconfidence Blindspots
                </span>
                <span className="font-mono font-black text-lg text-[#D02020]">{highConfIncorrect}</span>
              </div>
              <span className="text-[11px] font-bold text-[#121212]/70 block">
                High Confidence (4-5) + Incorrect. High-priority misconceptions to review.
              </span>
            </div>

            {/* Quadrant 3: Hidden Intuition */}
            <div className="border-3 border-[#121212] p-4 bg-[#FAFAFA] shadow-[3px_3px_0px_0px_#121212]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-xs uppercase tracking-tight text-[#121212]">
                  Underconfident Intuition
                </span>
                <span className="font-mono font-black text-lg text-[#121212]">{lowConfCorrect}</span>
              </div>
              <span className="text-[11px] font-bold text-[#121212]/70 block">
                Low Confidence (1-2) + Correct. Accurate instincts that warrant higher confidence.
              </span>
            </div>

            {/* Quadrant 4: Self-Aware Uncertainty */}
            <div className="border-3 border-[#121212] p-4 bg-[#FFFDF0] shadow-[3px_3px_0px_0px_#F0C020]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-xs uppercase tracking-tight text-[#121212]">
                  Prudent Caution
                </span>
                <span className="font-mono font-black text-lg text-[#121212]">{lowConfIncorrect}</span>
              </div>
              <span className="text-[11px] font-bold text-[#121212]/70 block">
                Low Confidence (1-2) + Incorrect. Healthy recognition of personal uncertainty.
              </span>
            </div>
          </div>

          {(highConfPartial > 0 || lowConfPartial > 0) && (
            <div className="mt-4 p-3 border-2 border-[#121212] bg-[#FAFAFA] text-xs font-bold text-[#121212]/80 flex items-center justify-between">
              <span>Partial Reasoning Audits:</span>
              <span>{highConfPartial} high confidence partials (0.5 score) • {lowConfPartial} cautious partials (0.75 score)</span>
            </div>
          )}
        </div>

        {/* Shareable Report Card Section (Phase 4e) */}
        <ReportCardCanvas
          totalAttempts={totalAttempts}
          totalCorrect={totalCorrect}
          streak={streak}
          calibrationScore={calibrationScore}
          mastery={mastery}
          history={history}
        />

        {/* Concept Mastery Breakdown */}
        <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 md:p-8 shadow-[8px_8px_0px_0px_#121212]">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-6 flex items-center gap-2">
            <div className="w-3 h-3 bg-[#1040C0] border border-[#121212]" />
            <span>Mastery by Concept Area</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(mastery).map(([tag, concept]) => {
              const info = CONCEPT_METADATA[tag] || {
                label: concept.label || tag,
                description: "Diagnostic concept",
              };

              let badgeStyle = "bg-[#E0E0E0] text-[#121212]";
              let statusLabel = "Untested";

              if (concept.status === "blue") {
                badgeStyle = "bg-[#1040C0] text-white";
                statusLabel = "Mastered";
              } else if (concept.status === "yellow") {
                badgeStyle = "bg-[#F0C020] text-[#121212]";
                statusLabel = "Developing";
              } else if (concept.status === "red") {
                badgeStyle = "bg-[#D02020] text-white";
                statusLabel = "Misconception";
              }

              return (
                <div
                  key={tag}
                  className="border-3 border-[#121212] p-4 bg-[#FAFAFA] shadow-[3px_3px_0px_0px_#121212] flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-black text-sm uppercase tracking-tight">{info.label}</h3>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 border border-[#121212] ${badgeStyle}`}
                    >
                      {statusLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[#121212]/70 mb-3">{info.description}</p>
                  <div className="text-xs font-bold text-[#121212] flex justify-between border-t border-[#121212]/20 pt-2">
                    <span>Performance:</span>
                    <span>
                      {concept.correct} / {concept.attempts} Catches
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <Link
            href="/challenge/algebra_linear_equations"
            className="bauhaus-btn w-full sm:w-auto bg-[#D02020] text-white font-black uppercase text-base px-8 py-4 border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] text-center"
          >
            Start Next Challenge
          </Link>

          <div className="flex items-center gap-4 w-full sm:w-auto">
            <Link
              href="/topics"
              className="bauhaus-btn flex-1 sm:flex-initial bg-[#FFFFFF] text-[#121212] font-black uppercase text-sm px-6 py-4 border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] text-center"
            >
              Curriculum Map
            </Link>
            <button
              onClick={resetSession}
              className="bauhaus-btn p-4 bg-[#FFFFFF] border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] hover:bg-[#D02020] hover:text-white cursor-pointer"
              title="Reset Session History"
            >
              <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-4 border-[#121212] bg-[#FFFFFF] p-4 shadow-[4px_4px_0px_0px_#121212]">
        <div className="font-bold text-xs uppercase tracking-wider">
          CogniTrace Session Report — Prometheus AI Challenge
        </div>
        <div className="flex items-center gap-3 text-xs font-bold uppercase">
          <span>Active Learning</span>
          <span>•</span>
          <span>Zero Hallucination Leaks</span>
        </div>
      </footer>
    </div>
  );
}
