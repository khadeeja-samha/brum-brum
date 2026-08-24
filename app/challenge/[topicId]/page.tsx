"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertTriangle,
  Send,
  Loader2,
  RefreshCw,
  Map as MapIcon,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
} from "lucide-react";
import { ClientSafeProblem, GradeResponse } from "@/lib/ai/schemas";
import { useSession, CONCEPT_METADATA } from "@/lib/state/SessionContext";
import { StepCard } from "@/components/StepCard";
import { VerdictPanel } from "@/components/VerdictPanel";
import { SessionStats } from "@/components/SessionStats";
import { UnderstandingMap } from "@/components/UnderstandingMap";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

export default function ChallengePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const topicId = resolvedParams.topicId || "algebra_linear_equations";

  const { recordAttempt } = useSession();

  const [problem, setProblem] = useState<ClientSafeProblem | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [verdict, setVerdict] = useState<GradeResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [useMockFallback, setUseMockFallback] = useState<boolean>(false);
  const [showMapDrawer, setShowMapDrawer] = useState<boolean>(false);

  // Fetch / Generate Problem
  const fetchProblem = useCallback(
    async (forceFallback = false) => {
      setIsLoading(true);
      setErrorMsg(null);
      setVerdict(null);
      setSelectedStepIndex(null);
      setExplanation("");

      const subConceptParam = topicId !== "algebra_linear_equations" && topicId !== "linear_equations_all" ? topicId : undefined;

      try {
        const res = await fetch("/api/generate-problem", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic: topicId,
            subConcept: subConceptParam,
            forceFallback: forceFallback || useMockFallback,
          }),
        });

        if (!res.ok) {
          throw new Error(`Generation failed with status ${res.status}`);
        }

        const data: ClientSafeProblem = await res.json();
        setProblem(data);
      } catch (err) {
        console.error("Problem loading error:", err);
        setErrorMsg("Failed to generate problem. Click retry to load a fallback problem.");
      } finally {
        setIsLoading(false);
      }
    },
    [topicId, useMockFallback]
  );

  useEffect(() => {
    fetchProblem();
  }, [fetchProblem]);

  // Keyboard shortcut listener (1-9 to select step, Ctrl+Enter to submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (verdict || isSubmitting) return;

      // Number key 1-9 to select step if not inside textarea
      if (
        document.activeElement?.tagName !== "TEXTAREA" &&
        document.activeElement?.tagName !== "INPUT" &&
        problem
      ) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= problem.steps.length) {
          e.preventDefault();
          setSelectedStepIndex(num - 1);
        }
      }

      // Ctrl+Enter or Cmd+Enter to submit audit
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (selectedStepIndex !== null && explanation.trim() && !isSubmitting) {
          e.preventDefault();
          const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
          handleSubmitAudit(fakeEvent);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [problem, selectedStepIndex, explanation, isSubmitting, verdict]);

  // Handle Submission
  const handleSubmitAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStepIndex === null || !explanation.trim() || !problem || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/grade-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: problem.problemId,
          selectedStepIndex,
          explanation: explanation.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error(`Grading request failed with status ${res.status}`);
      }

      const gradeData: GradeResponse = await res.json();
      setVerdict(gradeData);

      // Record to React Context Session State
      recordAttempt({
        problemId: problem.problemId,
        verdict: gradeData.verdict,
        conceptTag: gradeData.conceptTag,
      });
    } catch (err) {
      console.error("Grading error:", err);
      setErrorMsg("Failed to grade attempt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentConceptInfo = problem
    ? CONCEPT_METADATA[problem.conceptTag] || {
        label: problem.conceptTag.replace(/_/g, " "),
        description: "Algebraic step verification",
      }
    : null;

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
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            href="/topics"
            className="bauhaus-btn flex items-center gap-2 font-black text-xs uppercase px-3 py-2 bg-[#FFFFFF] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#F5F5F5]"
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Topics</span>
          </Link>
          <div className="h-6 w-[2px] bg-[#121212] hidden md:block" />
          <span className="font-black text-base sm:text-xl uppercase tracking-tight truncate">
            CogniTrace Audit Session
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Toggle Map Drawer */}
          <button
            onClick={() => setShowMapDrawer(!showMapDrawer)}
            className={`bauhaus-btn font-black text-xs uppercase px-3 py-1.5 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] flex items-center gap-1.5 cursor-pointer ${
              showMapDrawer ? "bg-[#1040C0] text-white" : "bg-[#FFFFFF] text-[#121212]"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Map</span>
            {showMapDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Fallback Mode Switcher */}
          <button
            onClick={() => {
              const nextVal = !useMockFallback;
              setUseMockFallback(nextVal);
              fetchProblem(nextVal);
            }}
            title="Toggle between Live AI and Seed Fallback Mode"
            className={`font-black text-xs uppercase px-3 py-1.5 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] transition-colors cursor-pointer ${
              useMockFallback
                ? "bg-[#F0C020] text-[#121212]"
                : "bg-[#FFFFFF] text-[#121212]/70 hover:text-[#121212]"
            }`}
          >
            {useMockFallback ? "Safe Seed" : "Live AI"}
          </button>
        </div>
      </header>

      {/* Expandable Understanding Map Drawer */}
      {showMapDrawer && (
        <div className="mb-6 border-4 border-[#121212] bg-[#FFFFFF] p-4 shadow-[8px_8px_0px_0px_#121212] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-[#121212]">
            <span className="font-black text-xs uppercase tracking-wider">
              Live Concept Mastery Map
            </span>
            <Link
              href="/topics"
              className="text-xs font-black uppercase text-[#1040C0] hover:underline"
            >
              Full Screen Map →
            </Link>
          </div>
          <UnderstandingMap
            className="!h-[360px]"
            initialDomain={
              topicId.startsWith("code_") ||
              [
                "off_by_one",
                "mutable_default_args",
                "shallow_copy_mutation",
                "async_missing_await",
                "scope_shadowing",
                "code_debugging",
              ].includes(topicId)
                ? "code"
                : "algebra"
            }
          />
        </div>
      )}

      {/* Session Stats Bar */}
      <div className="mb-6">
        <SessionStats />
      </div>

      {/* Main Challenge Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full mb-8">
        {isLoading ? (
          /* Loading Skeleton in Bauhaus Style */
          <div className="border-4 border-[#121212] bg-[#FFFFFF] p-10 shadow-[8px_8px_0px_0px_#121212] flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="relative mb-6">
              <div className="w-16 h-16 border-4 border-[#121212] bg-[#F0C020] animate-spin" />
              <div className="w-8 h-8 rounded-full bg-[#1040C0] absolute top-4 left-4 border-2 border-[#121212]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">
              Generating Diagnostic Trace
            </h2>
            <p className="font-medium text-sm text-[#121212]/80 max-w-md">
              Planting exactly one subtle logical error using advanced diagnostic reasoning...
            </p>
          </div>
        ) : errorMsg && !problem ? (
          /* Error State */
          <div className="border-4 border-[#121212] bg-[#FFF0F0] p-8 shadow-[8px_8px_0px_0px_#121212] text-center">
            <AlertTriangle className="w-12 h-12 text-[#D02020] mx-auto mb-4 stroke-[3]" />
            <h2 className="text-2xl font-black uppercase mb-2">Generation Interrupted</h2>
            <p className="font-medium text-sm mb-6">{errorMsg}</p>
            <button
              onClick={() => fetchProblem(true)}
              className="bauhaus-btn inline-flex items-center gap-2 bg-[#D02020] text-white font-black uppercase px-6 py-3 border-4 border-[#121212] shadow-[4px_4px_0px_0px_#121212]"
            >
              <RefreshCw className="w-4 h-4 stroke-[3]" />
              <span>Load Safe Seed Problem</span>
            </button>
          </div>
        ) : problem ? (
          <div className="space-y-6">
            {/* Problem Statement Card */}
            <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 md:p-8 shadow-[8px_8px_0px_0px_#121212]">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-3 h-3 border border-[#121212] ${
                      topicId.startsWith("code_") ||
                      [
                        "off_by_one",
                        "mutable_default_args",
                        "shallow_copy_mutation",
                        "async_missing_await",
                        "scope_shadowing",
                        "code_debugging",
                      ].includes(topicId)
                        ? "bg-[#D02020]"
                        : "bg-[#1040C0]"
                    }`}
                  />
                  <span className="font-black text-xs uppercase tracking-wider text-[#121212]">
                    Domain:{" "}
                    {topicId.startsWith("code_") ||
                    [
                      "off_by_one",
                      "mutable_default_args",
                      "shallow_copy_mutation",
                      "async_missing_await",
                      "scope_shadowing",
                      "code_debugging",
                    ].includes(topicId)
                      ? "Python / JavaScript Code Debugging"
                      : "High School Algebra"}
                  </span>
                </div>

                {currentConceptInfo && (
                  <span className="font-black text-xs uppercase px-3 py-1 bg-[#F0C020] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212]">
                    {currentConceptInfo.label}
                  </span>
                )}
              </div>

              <div className="border-t-2 border-[#121212] pt-4 mb-2">
                <span className="text-xs font-black uppercase text-[#121212]/60 block mb-1">
                  Problem Target
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-mono tracking-tight text-[#121212]">
                  {problem.problemStatement}
                </h1>
              </div>

              <p className="text-sm font-medium text-[#121212]/80 mt-2">
                Carefully audit each line below. <strong>Exactly one step</strong> contains a planted{" "}
                {topicId.startsWith("code_") ||
                [
                  "off_by_one",
                  "mutable_default_args",
                  "shallow_copy_mutation",
                  "async_missing_await",
                  "scope_shadowing",
                  "code_debugging",
                ].includes(topicId)
                  ? "software bug or logical flaw"
                  : "mathematical error"}
                . Click it (or press 1-{problem.steps.length}) to flag, then explain why.
              </p>
            </div>

            {/* Step-by-Step Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-black text-sm uppercase tracking-wider flex items-center gap-2">
                  <span>Worked Solution Steps</span>
                  <span className="text-xs font-bold px-2 py-0.5 bg-[#FFFFFF] border border-[#121212]">
                    {problem.steps.length} Steps
                  </span>
                </h2>
                {!verdict && (
                  <span className="text-xs font-bold text-[#121212]/70">
                    {selectedStepIndex !== null
                      ? `Step ${selectedStepIndex + 1} Selected`
                      : "Click any step to flag"}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {problem.steps.map((step) => (
                  <StepCard
                    key={step.stepIndex}
                    stepIndex={step.stepIndex}
                    text={step.text}
                    isSelected={selectedStepIndex === step.stepIndex}
                    onSelect={(index) => {
                      if (!verdict) setSelectedStepIndex(index);
                    }}
                    disabled={isSubmitting || verdict !== null}
                    revealedState={
                      verdict
                        ? {
                            isActualFlaw: verdict.actualFlawedStep === step.stepIndex,
                            isStudentSelection: selectedStepIndex === step.stepIndex,
                          }
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>

            {/* Explanation Input & Submit (Shown while active audit in progress) */}
            {!verdict && (
              <form
                onSubmit={handleSubmitAudit}
                className="border-4 border-[#121212] bg-[#FFFFFF] p-6 shadow-[8px_8px_0px_0px_#121212] space-y-4"
              >
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="explanation-input"
                    className="font-black text-sm uppercase tracking-wider flex items-center gap-2"
                  >
                    <div className="w-3 h-3 bg-[#D02020] border border-[#121212]" />
                    <span>
                      {selectedStepIndex !== null
                        ? `Why is Step ${selectedStepIndex + 1} mathematically wrong?`
                        : "Select a step above to explain the error"}
                    </span>
                  </label>
                  <span className="text-xs font-medium text-[#121212]/60 hidden sm:inline">
                    Shortcut: Ctrl+Enter to submit
                  </span>
                </div>

                <textarea
                  id="explanation-input"
                  rows={3}
                  maxLength={500}
                  disabled={selectedStepIndex === null || isSubmitting}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder={
                    selectedStepIndex !== null
                      ? "Describe the exact mathematical violation here (e.g., 'They distributed -3 incorrectly: -3 * -5 should be +15, not -15')..."
                      : "Click on the step containing the error first..."
                  }
                  className={`w-full p-4 border-3 border-[#121212] rounded-none font-medium text-base text-[#121212] placeholder:text-[#121212]/40 focus:outline-none focus:ring-2 focus:ring-[#D02020] transition-colors ${
                    selectedStepIndex === null ? "bg-[#F5F5F5] cursor-not-allowed" : "bg-[#FFFFFF]"
                  }`}
                />

                <div className="flex items-center justify-between text-xs text-[#121212]/60">
                  <span>
                    {selectedStepIndex === null
                      ? "Select a step to enable submission"
                      : explanation.trim().length === 0
                      ? "Type an explanation to submit"
                      : "Ready to audit"}
                  </span>
                  <span className={`font-mono font-bold ${explanation.length >= 480 ? "text-[#D02020]" : "text-[#121212]/60"}`}>
                    {explanation.length}/500
                  </span>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-[#FFF0F0] border-2 border-[#D02020] text-[#D02020] text-sm font-bold">
                    {errorMsg}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-3 pt-2">

                  <button
                    type="submit"
                    disabled={selectedStepIndex === null || !explanation.trim() || isSubmitting}
                    className={`bauhaus-btn w-full sm:w-auto flex items-center justify-center gap-2 font-black uppercase text-base px-8 py-4 border-4 border-[#121212] shadow-[4px_4px_0px_0px_#121212] transition-transform ${
                      selectedStepIndex !== null && explanation.trim() && !isSubmitting
                        ? "bg-[#D02020] text-white hover:-translate-y-1 cursor-pointer"
                        : "bg-[#E0E0E0] text-[#121212]/40 cursor-not-allowed shadow-none"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Grading Audit...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Accusation</span>
                        <Send className="w-5 h-5 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Verdict Panel when graded */}
            {verdict && (
              <div className="pt-2">
                <VerdictPanel
                  verdictData={verdict}
                  onNextChallenge={() => fetchProblem()}
                />
              </div>
            )}
          </div>
        ) : null}
      </main>

      {/* Bottom Footer */}
      <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-4 border-[#121212] bg-[#FFFFFF] p-4 shadow-[4px_4px_0px_0px_#121212]">
        <div className="font-bold text-xs uppercase tracking-wider">
          CogniTrace — Active Verification Engine
        </div>
        <div className="flex items-center gap-3 text-xs font-bold uppercase">
          <span>Keyboard: [1-5] Flag Step • [Ctrl+Enter] Submit</span>
          <span>•</span>
          <span>Zero Answer Leaks (R7 Verified)</span>
        </div>
      </footer>
    </div>
  );
}
