"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Camera,
  ShieldCheck,
  FileCheck,
  ArrowRight,
  RefreshCw,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  FileText,
  HelpCircle,
  Target,
} from "lucide-react";
import confetti from "canvas-confetti";
import { MirrorUpload } from "@/components/MirrorUpload";
import { ManualWorkInput } from "@/components/ManualWorkInput";
import { TranscriptionReview } from "@/components/TranscriptionReview";
import { StepCard } from "@/components/StepCard";
import { VerdictPanel } from "@/components/VerdictPanel";
import { SessionStats } from "@/components/SessionStats";
import { useSession } from "@/lib/state/SessionContext";
import {
  TranscribeWorkResponse,
  StructuredWork,
  ConfirmedWork,
  VerifyWorkResponse,
  GradeResponse,
} from "@/lib/ai/schemas";

export default function MirrorModePage() {
  const { recordAttempt } = useSession();

  const [inputMode, setInputMode] = useState<"photo" | "manual">("photo");
  const [currentStep, setCurrentStep] = useState<
    "upload" | "structuring" | "review" | "verifying" | "audit" | "flawless"
  >("upload");

  const [transcribedData, setTranscribedData] = useState<{
    result: TranscribeWorkResponse;
    imageUrl: string;
  } | null>(null);

  const [structuredWork, setStructuredWork] = useState<StructuredWork | null>(null);
  const [confirmedWork, setConfirmedWork] = useState<ConfirmedWork | null>(null);
  const [verifiedWork, setVerifiedWork] = useState<VerifyWorkResponse | null>(null);

  // Self-Audit Challenge States
  const [selectedStepIndex, setSelectedStepIndex] = useState<number | null>(null);
  const [explanation, setExplanation] = useState<string>("");
  const [confidence, setConfidence] = useState<number>(3);
  const [isSubmittingAudit, setIsSubmittingAudit] = useState<boolean>(false);
  const [auditVerdict, setAuditVerdict] = useState<GradeResponse | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Trigger structuring pass from OCR result
  const handleTranscriptionSuccess = async (
    result: TranscribeWorkResponse,
    imageUrl: string
  ) => {
    setTranscribedData({ result, imageUrl });
    setCurrentStep("structuring");
    setErrorText(null);

    try {
      const res = await fetch("/api/structure-work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: result.rawText,
          suggestedDomain: result.suggestedDomain,
          workId: result.workId,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Structuring API error (${res.status})`);
      }

      const structured: StructuredWork = await res.json();
      setStructuredWork(structured);
      setCurrentStep("review");
    } catch (err) {
      console.error("[MirrorMode] Structuring error:", err);
      setErrorText((err as Error).message);
      // Fallback: create basic structured work from detections
      const fallbackSteps = result.detections.map((d, i) => ({
        stepIndex: i,
        text: d.text,
      }));
      setStructuredWork({
        problemStatement: result.detections[0]?.text || "Solve the equation",
        steps: fallbackSteps.slice(1).length > 0 ? fallbackSteps.slice(1) : fallbackSteps,
        domain: result.suggestedDomain || "algebra",
        conceptTag: `${result.suggestedDomain || "algebra"}_self_audit`,
        workId: result.workId,
      });
      setCurrentStep("review");
    }
  };

  // Trigger Verifier Agent upon student review confirmation (RULES.md R14 & R15)
  const handleConfirmReview = async (confirmed: ConfirmedWork) => {
    setConfirmedWork(confirmed);
    setCurrentStep("verifying");
    setErrorText(null);

    try {
      const res = await fetch("/api/verify-work", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(confirmed),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Verification failed (${res.status})`);
      }

      const verifyData: VerifyWorkResponse = await res.json();
      setVerifiedWork(verifyData);

      if (verifyData.verificationStatus === "fully_correct") {
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#1040C0", "#F0C020", "#D02020"],
        });

        // Record successful self-audit attempt in session state
        recordAttempt({
          problemId: verifyData.problemId,
          verdict: "correct",
          conceptTag: verifyData.conceptTag,
          confidence: 5
        });

        setCurrentStep("flawless");
      } else {
        // Solution has an error -> enter interactive self-audit challenge mode
        setSelectedStepIndex(null);
        setExplanation("");
        setConfidence(3);
        setAuditVerdict(null);
        setCurrentStep("audit");
      }
    } catch (err) {
      console.error("[MirrorMode] Verifier Agent error:", err);
      setErrorText((err as Error).message);
      setCurrentStep("review");
    }
  };

  // Submit Self-Audit Flag & Explanation
  const handleSubmitSelfAudit = async () => {
    if (selectedStepIndex === null || !explanation.trim() || !verifiedWork) return;

    setIsSubmittingAudit(true);
    setErrorText(null);

    try {
      const res = await fetch("/api/grade-attempt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: verifiedWork.problemId,
          selectedStepIndex,
          explanation: explanation.trim(),
          confidence,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Grading failed (${res.status})`);
      }

      const gradeResult: GradeResponse = await res.json();
      setAuditVerdict(gradeResult);

      // Record attempt in session history
      recordAttempt({
        problemId: verifiedWork.problemId,
        verdict: gradeResult.verdict,
        conceptTag: gradeResult.conceptTag || verifiedWork.conceptTag,
        confidence
      });

      // Fire confetti if caught correctly
      if (gradeResult.verdict === "correct") {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#1040C0", "#F0C020", "#D02020"],
        });
      }
    } catch (err) {
      console.error("[MirrorMode] Audit grading error:", err);
      setErrorText((err as Error).message);
    } finally {
      setIsSubmittingAudit(false);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (currentStep !== "audit" || auditVerdict || isSubmittingAudit) return;

      // Alt+1-5: Confidence rating
      if (e.altKey) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= 5) {
          e.preventDefault();
          setConfidence(num);
          return;
        }
      }

      // 1-9: Step selection (when not typing in textarea)
      if (
        document.activeElement?.tagName !== "TEXTAREA" &&
        document.activeElement?.tagName !== "INPUT" &&
        verifiedWork
      ) {
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= verifiedWork.steps.length) {
          e.preventDefault();
          setSelectedStepIndex(num - 1);
        }
      }

      // Ctrl+Enter / Cmd+Enter: Submit
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (selectedStepIndex !== null && explanation.trim() && !isSubmittingAudit) {
          e.preventDefault();
          handleSubmitSelfAudit();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, auditVerdict, isSubmittingAudit, verifiedWork, selectedStepIndex, explanation, confidence]);

  const handleResetToUpload = () => {
    setTranscribedData(null);
    setStructuredWork(null);
    setConfirmedWork(null);
    setVerifiedWork(null);
    setSelectedStepIndex(null);
    setExplanation("");
    setConfidence(3);
    setAuditVerdict(null);
    setErrorText(null);
    setCurrentStep("upload");
  };

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212] flex flex-col justify-between p-4 md:p-8 selection:bg-[#D02020] selection:text-white">
      {/* Top Header Bar */}
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
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#1040C0] border border-[#121212]" />
            <span className="font-black text-lg sm:text-xl uppercase tracking-tight">
              Mirror Mode: Multimodal Self-Audit
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/topics"
            className="bauhaus-btn font-black text-xs uppercase px-4 py-2 bg-[#FFFFFF] text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#F5F5F5]"
          >
            Curriculum
          </Link>
          <Link
            href="/summary"
            className="bauhaus-btn font-black text-xs uppercase px-4 py-2 bg-[#121212] text-white border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212]"
          >
            Report Card
          </Link>
        </div>
      </header>

      {/* Session Stats Bar */}
      <div className="mb-6">
        <SessionStats />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full mb-8 space-y-6">
        {/* Banner / Value Proposition */}
        <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 md:p-8 shadow-[8px_8px_0px_0px_#121212] relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1040C0] text-white font-black text-xs uppercase tracking-wider border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212]">
                <Camera className="w-3.5 h-3.5" />
                <span>Live Ground-Truth Verifier Agent</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none">
                Audit Your <span className="text-[#D02020] underline decoration-[#121212] decoration-4">Own</span> Real Work
              </h1>
              <p className="text-sm font-medium text-[#121212]/80 leading-relaxed">
                Snap a photo or type your handwritten working. The OCR engine transcribes your lines into structured steps, you review & confirm, and our Verifier Agent checks your work live against ground truth.
              </p>
            </div>

            {/* 3-Pillar Step Progress Indicator */}
            <div className="grid grid-cols-3 gap-2 shrink-0 w-full md:w-auto">
              <div className={`border-2 border-[#121212] p-2.5 text-center shadow-[2px_2px_0px_0px_#121212] transition-colors ${
                currentStep === "upload" ? "bg-[#1040C0] text-white" : "bg-[#F0F0F0] text-[#121212]"
              }`}>
                <span className="w-5 h-5 rounded-full bg-white text-[#121212] font-black text-[10px] inline-flex items-center justify-center border border-[#121212] mb-1">
                  1
                </span>
                <p className="text-[10px] font-black uppercase">OCR Ingest</p>
              </div>

              <div className={`border-2 border-[#121212] p-2.5 text-center shadow-[2px_2px_0px_0px_#121212] transition-colors ${
                currentStep === "review" || currentStep === "structuring" ? "bg-[#F0C020] text-[#121212]" : "bg-[#F0F0F0] text-[#121212]"
              }`}>
                <span className="w-5 h-5 bg-[#121212] text-white font-black text-[10px] inline-flex items-center justify-center border border-[#121212] mb-1">
                  2
                </span>
                <p className="text-[10px] font-black uppercase">Confirm</p>
              </div>

              <div className={`border-2 border-[#121212] p-2.5 text-center shadow-[2px_2px_0px_0px_#121212] transition-colors ${
                currentStep === "verifying" || currentStep === "audit" || currentStep === "flawless" ? "bg-[#D02020] text-white" : "bg-[#F0F0F0] text-[#121212]"
              }`}>
                <span className="w-5 h-5 rounded-full bg-[#121212] text-white font-black text-[10px] inline-flex items-center justify-center border border-[#121212] mb-1">
                  3
                </span>
                <p className="text-[10px] font-black uppercase">Self-Audit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorText && (
          <div className="border-4 border-[#121212] bg-[#D02020] text-white p-4 shadow-[6px_6px_0px_0px_#121212] flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 stroke-[3]" />
              <span className="font-bold text-sm">{errorText}</span>
            </div>
            <button
              onClick={() => setErrorText(null)}
              className="text-xs font-black uppercase underline hover:text-black"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* STEP 1: Upload / Manual Mode */}
        {currentStep === "upload" && (
          <div className="space-y-4">
            {/* Input Modality Toggle Bar */}
            <div className="flex items-center justify-between border-3 border-[#121212] bg-[#FFFFFF] p-2.5 shadow-[4px_4px_0px_0px_#121212]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setInputMode("photo")}
                  className={`bauhaus-btn font-black text-xs uppercase px-4 py-2 border-2 border-[#121212] flex items-center gap-2 transition-colors ${
                    inputMode === "photo" ? "bg-[#1040C0] text-white" : "bg-[#F0F0F0] text-[#121212] hover:bg-white"
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>Photo & Presets (OCR)</span>
                </button>
                <button
                  onClick={() => setInputMode("manual")}
                  className={`bauhaus-btn font-black text-xs uppercase px-4 py-2 border-2 border-[#121212] flex items-center gap-2 transition-colors ${
                    inputMode === "manual" ? "bg-[#1040C0] text-white" : "bg-[#F0F0F0] text-[#121212] hover:bg-white"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Type Steps Manually (Fallback)</span>
                </button>
              </div>
              <span className="text-[10px] font-bold uppercase text-[#121212]/70 hidden sm:inline">
                {inputMode === "photo" ? "Computer Vision Image Ingestion" : "ARCHITECTURE.md §8e Text-Input Fallback"}
              </span>
            </div>

            {inputMode === "photo" ? (
              <MirrorUpload onTranscriptionSuccess={handleTranscriptionSuccess} />
            ) : (
              <ManualWorkInput
                onConfirm={(confirmed) => handleConfirmReview(confirmed)}
                onCancel={() => setInputMode("photo")}
              />
            )}
          </div>
        )}

        {/* STEP 1 -> 2: Structuring Loading State */}
        {currentStep === "structuring" && (
          <div className="border-4 border-[#121212] bg-[#FFFFFF] p-12 text-center shadow-[8px_8px_0px_0px_#121212] space-y-4">
            <div className="w-14 h-14 bg-[#1040C0] text-white flex items-center justify-center border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] mx-auto animate-pulse">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">
              Structuring Transcribed Steps...
            </h3>
            <p className="text-xs font-medium text-[#121212]/70 max-w-md mx-auto">
              Parsing raw OCR lines into clean equations and numbered steps while preserving all student working verbatim.
            </p>
          </div>
        )}

        {/* STEP 2: Human Review & Edit (RULES.md R14) */}
        {currentStep === "review" && structuredWork && (
          <TranscriptionReview
            initialStructuredWork={structuredWork}
            originalImagePreviewUrl={transcribedData?.imageUrl}
            originalRawOcrText={transcribedData?.result.rawText}
            onConfirm={handleConfirmReview}
            onBackToUpload={handleResetToUpload}
          />
        )}

        {/* STEP 2 -> 3: Verifying Loading State (Live Ground Truth Computation) */}
        {currentStep === "verifying" && (
          <div className="border-4 border-[#121212] bg-[#FFFFFF] p-12 text-center shadow-[8px_8px_0px_0px_#121212] space-y-4">
            <div className="w-14 h-14 bg-[#D02020] text-white flex items-center justify-center border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] mx-auto animate-pulse">
              <ShieldCheck className="w-7 h-7 animate-spin" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight">
              Verifier Agent Re-Solving Equation...
            </h3>
            <p className="text-xs font-medium text-[#121212]/70 max-w-md mx-auto">
              Independently establishing ground truth and auditing each student step chronologically against mathematical and scientific laws.
            </p>
          </div>
        )}

        {/* STEP 3A: Flawless Outcome (No Error Detected) */}
        {currentStep === "flawless" && verifiedWork && (
          <div className="border-4 border-[#121212] bg-[#FFFFFF] p-8 shadow-[8px_8px_0px_0px_#121212] space-y-6">
            <div className="bg-[#1040C0] text-white p-6 border-3 border-[#121212] shadow-[6px_6px_0px_0px_#121212] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white text-[#1040C0] flex items-center justify-center border-2 border-[#121212] font-black shrink-0">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 border border-white/40">
                    Live Ground Truth Verified
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight mt-1">
                    Flawless! Zero Errors Detected
                  </h2>
                  <p className="text-xs font-medium text-white/90">
                    We independently re-solved your problem and confirmed every step of your solution is 100% sound.
                  </p>
                </div>
              </div>

              <div className="bg-[#121212] text-white p-3 border-2 border-white/40 text-center shrink-0">
                <span className="text-[10px] font-bold uppercase block text-white/70">Mastery Earned</span>
                <span className="text-xl font-black text-[#F0C020]">+100 PTS</span>
              </div>
            </div>

            {/* Verified Steps Blueprint */}
            <div className="bg-[#F9F9F9] p-5 border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#121212]/70 block mb-1">
                  Target Problem Statement:
                </span>
                <p className="font-mono font-bold text-base bg-white p-3 border-2 border-[#121212]">
                  {verifiedWork.problemStatement}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-[#121212]/70 block mb-2">
                  Verified Clean Working ({verifiedWork.steps.length} Steps):
                </span>
                <div className="space-y-2">
                  {verifiedWork.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 border-2 border-[#121212] flex items-center gap-3 font-mono text-xs border-l-[8px] border-l-[#1040C0]"
                    >
                      <span className="w-6 h-6 bg-[#1040C0] text-white flex items-center justify-center font-black text-[11px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-[#121212]">{step.text}</span>
                      <span className="ml-auto text-[10px] font-black uppercase text-[#1040C0]">
                        ✓ Clean
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={handleResetToUpload}
                className="bauhaus-btn w-full sm:w-auto bg-[#F0F0F0] text-[#121212] font-black text-xs uppercase px-6 py-3 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] hover:bg-white"
              >
                ← Audit Another Solution
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  href="/topics"
                  className="bauhaus-btn w-full sm:w-auto bg-white text-[#121212] font-black text-xs uppercase px-6 py-3 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] text-center"
                >
                  View Curriculum
                </Link>
                <Link
                  href="/summary"
                  className="bauhaus-btn w-full sm:w-auto bg-[#121212] text-white font-black text-xs uppercase px-6 py-3 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] text-center"
                >
                  View Report Card
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3B: Self-Audit Challenge Workspace (Flaw Detected by Verifier Agent) */}
        {currentStep === "audit" && verifiedWork && (
          <div className="space-y-6">
            {/* Flaw Alert Banner */}
            <div className="border-4 border-[#121212] bg-[#D02020] text-white p-5 shadow-[8px_8px_0px_0px_#121212] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-white text-[#D02020] flex items-center justify-center border-2 border-[#121212] font-black shrink-0 shadow-[2px_2px_0px_0px_#121212]">
                  <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-black/30 px-2 py-0.5 border border-white/30">
                    Live Verifier Agent Diagnosis
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight mt-0.5">
                    1 Flaw Detected in Your Solution
                  </h2>
                  <p className="text-xs font-bold text-white/90">
                    Our Verifier re-solved your problem and identified a mathematical slip. Locate your own mistake below!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleResetToUpload}
                  className="bauhaus-btn bg-white text-[#121212] font-black text-xs uppercase px-3.5 py-2 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212]"
                >
                  Start Over
                </button>
              </div>
            </div>

            {/* Target Problem Statement Card */}
            <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 shadow-[8px_8px_0px_0px_#121212]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase text-[#121212]/70 tracking-wider">
                  Target Problem Statement
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#F0C020] border border-[#121212]">
                  Domain: {verifiedWork.domain.toUpperCase()}
                </span>
              </div>
              <p className="font-mono font-black text-lg sm:text-xl text-[#121212] bg-[#F0F0F0] p-4 border-3 border-[#121212]">
                {verifiedWork.problemStatement}
              </p>
            </div>

            {/* Click-to-Flag Step Cards */}
            <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 shadow-[8px_8px_0px_0px_#121212] space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#121212] pb-3">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-tight">
                    Which step contains your mistake?
                  </h3>
                  <p className="text-xs font-medium text-[#121212]/70">
                    Click the flawed step card or press [1-{verifiedWork.steps.length}] on your keyboard.
                  </p>
                </div>
                {selectedStepIndex !== null && (
                  <span className="font-black text-xs uppercase bg-[#D02020] text-white px-3 py-1 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212]">
                    Flagged: Step {selectedStepIndex + 1}
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {verifiedWork.steps.map((step) => (
                  <StepCard
                    key={step.stepIndex}
                    stepIndex={step.stepIndex}
                    text={step.text}
                    isSelected={selectedStepIndex === step.stepIndex}
                    onSelect={() => {
                      if (!auditVerdict) setSelectedStepIndex(step.stepIndex);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Rationale & Confidence Submission Card */}
            {!auditVerdict && (
              <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 shadow-[8px_8px_0px_0px_#121212] space-y-5">
                {/* 5-Segment Bauhaus Confidence Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black uppercase tracking-wider text-[#121212] flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-[#1040C0]" />
                      <span>Metacognitive Confidence Rating</span>
                    </label>
                    <span className="text-[10px] font-bold text-[#121212]/60 uppercase">
                      Shortcut: [Alt+1-5]
                    </span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 3, 4, 5].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setConfidence(lvl)}
                        className={`bauhaus-btn p-2.5 text-center border-2 border-[#121212] font-black text-xs uppercase transition-colors shadow-[2px_2px_0px_0px_#121212] ${
                          confidence === lvl
                            ? "bg-[#121212] text-white"
                            : "bg-[#F0F0F0] text-[#121212] hover:bg-white"
                        }`}
                      >
                        <span className="block font-mono text-sm mb-0.5">
                          {lvl === 1 && "■ □ □ □ □"}
                          {lvl === 2 && "■ ■ □ □ □"}
                          {lvl === 3 && "■ ■ ■ □ □"}
                          {lvl === 4 && "■ ■ ■ ■ □"}
                          {lvl === 5 && "■ ■ ■ ■ ■"}
                        </span>
                        <span className="text-[10px] block">
                          {lvl === 1 && "1: Guess"}
                          {lvl === 2 && "2: Unsure"}
                          {lvl === 3 && "3: Moderate"}
                          {lvl === 4 && "4: Confident"}
                          {lvl === 5 && "5: Certain"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Explanation Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black uppercase tracking-wider text-[#121212]">
                      Explain what went wrong in your flagged step:
                    </label>
                    <span
                      className={`text-xs font-mono font-bold ${
                        explanation.length >= 480 ? "text-[#D02020]" : "text-[#121212]/60"
                      }`}
                    >
                      {explanation.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    placeholder="e.g. I subtracted 12 instead of adding 12 across the equals sign, or forgot the negative sign when distributing..."
                    className="w-full bg-[#F0F0F0] text-[#121212] font-mono font-bold text-xs sm:text-sm p-3.5 border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] focus:bg-white focus:border-[#1040C0] focus:outline-none"
                  />
                </div>

                {/* Submit Action */}
                <button
                  onClick={handleSubmitSelfAudit}
                  disabled={selectedStepIndex === null || !explanation.trim() || isSubmittingAudit}
                  className={`bauhaus-btn w-full font-black text-sm uppercase py-4 px-6 border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] flex items-center justify-center gap-3 transition-colors ${
                    selectedStepIndex !== null && explanation.trim() && !isSubmittingAudit
                      ? "bg-[#D02020] text-white cursor-pointer hover:-translate-y-0.5"
                      : "bg-[#E0E0E0] text-[#121212]/40 cursor-not-allowed"
                  }`}
                >
                  {isSubmittingAudit ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Grading Your Self-Audit...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 stroke-[2.5]" />
                      <span>Submit Self-Audit Accusation [Ctrl+Enter]</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Verdict Panel */}
            {auditVerdict && (
              <div className="space-y-4">
                <VerdictPanel
                  verdictData={{ ...auditVerdict, confidence }}
                  onNextChallenge={handleResetToUpload}
                />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleResetToUpload}
                    className="bauhaus-btn w-full sm:w-auto bg-[#D02020] text-white font-black text-xs uppercase px-6 py-3 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212]"
                  >
                    Audit Another Worksheet
                  </button>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Link
                      href="/topics"
                      className="bauhaus-btn w-full sm:w-auto bg-white text-[#121212] font-black text-xs uppercase px-6 py-3 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] text-center"
                    >
                      View Curriculum
                    </Link>
                    <Link
                      href="/summary"
                      className="bauhaus-btn w-full sm:w-auto bg-[#121212] text-white font-black text-xs uppercase px-6 py-3 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] text-center"
                    >
                      View Report Card
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-4 border-[#121212] bg-[#FFFFFF] p-4 shadow-[4px_4px_0px_0px_#121212]">
        <div className="font-bold text-xs uppercase tracking-wider">
          CogniTrace Mirror Mode — Live Ground-Truth Verifier
        </div>
        <div className="flex items-center gap-3 text-xs font-bold uppercase">
          {/* Footer content removed per user request */}
        </div>
      </footer>
    </div>
  );
}
