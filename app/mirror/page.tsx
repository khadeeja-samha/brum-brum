"use client";

import React, { useState } from "react";
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
} from "lucide-react";
import { MirrorUpload } from "@/components/MirrorUpload";
import { TranscriptionReview } from "@/components/TranscriptionReview";
import { SessionStats } from "@/components/SessionStats";
import {
  TranscribeWorkResponse,
  StructuredWork,
  ConfirmedWork,
} from "@/lib/ai/schemas";

export default function MirrorModePage() {
  const [currentStep, setCurrentStep] = useState<"upload" | "structuring" | "review" | "confirmed">("upload");
  const [transcribedData, setTranscribedData] = useState<{
    result: TranscribeWorkResponse;
    imageUrl: string;
  } | null>(null);
  const [structuredWork, setStructuredWork] = useState<StructuredWork | null>(null);
  const [confirmedWork, setConfirmedWork] = useState<ConfirmedWork | null>(null);
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

  const handleConfirmReview = (confirmed: ConfirmedWork) => {
    setConfirmedWork(confirmed);
    setCurrentStep("confirmed");
  };

  const handleResetToUpload = () => {
    setTranscribedData(null);
    setStructuredWork(null);
    setConfirmedWork(null);
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
                <span>Phase 5b: Structuring & Human Review Active</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none">
                Audit Your <span className="text-[#D02020] underline decoration-[#121212] decoration-4">Own</span> Real Work
              </h1>
              <p className="text-sm font-medium text-[#121212]/80 leading-relaxed">
                Snap a photo of your handwritten homework. Nemotron OCR transcribes your lines into structured steps, you review & confirm, and our Verifier Agent checks your work.
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
                <p className="text-[10px] font-black uppercase">Confirm Steps</p>
              </div>

              <div className={`border-2 border-[#121212] p-2.5 text-center shadow-[2px_2px_0px_0px_#121212] transition-colors ${
                currentStep === "confirmed" ? "bg-[#D02020] text-white" : "bg-[#F0F0F0] text-[#121212]"
              }`}>
                <span className="w-5 h-5 rounded-full bg-[#121212] text-white font-black text-[10px] inline-flex items-center justify-center border border-[#121212] mb-1">
                  3
                </span>
                <p className="text-[10px] font-black uppercase">Self-Audit</p>
              </div>
            </div>
          </div>
        </div>

        {/* STEP 1: Upload */}
        {currentStep === "upload" && (
          <MirrorUpload onTranscriptionSuccess={handleTranscriptionSuccess} />
        )}

        {/* STEP 1 -> 2: Structuring Loading State */}
        {currentStep === "structuring" && (
          <div className="border-4 border-[#121212] bg-[#FFFFFF] p-12 text-center shadow-[8px_8px_0px_0px_#121212] space-y-4">
            <div className="w-14 h-14 bg-[#1040C0] text-white flex items-center justify-center border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] mx-auto animate-pulse">
              <RefreshCw className="w-7 h-7 animate-spin" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">
              Structuring Transcribed Steps with Nemotron 3 Ultra...
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

        {/* STEP 3: Confirmed Work Celebration State (Ready for Phase 5c Live Verifier Agent) */}
        {currentStep === "confirmed" && confirmedWork && (
          <div className="border-4 border-[#121212] bg-[#FFFFFF] p-8 shadow-[8px_8px_0px_0px_#121212] space-y-6">
            <div className="flex items-center justify-between border-b-3 border-[#121212] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1040C0] text-white flex items-center justify-center border-2 border-[#121212] font-black">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#1040C0] text-white border border-[#121212]">
                      Human Confirmation Verified (R14)
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#F0C020] text-[#121212] border border-[#121212]">
                      Domain: {confirmedWork.domain.toUpperCase()}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tight mt-1">
                    Student Work Confirmed & Locked For Audit
                  </h2>
                </div>
              </div>

              <button
                onClick={handleResetToUpload}
                className="bauhaus-btn bg-[#F0F0F0] text-[#121212] font-black text-xs uppercase px-4 py-2 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212]"
              >
                Start Another
              </button>
            </div>

            {/* Confirmed Summary Blueprint */}
            <div className="bg-[#F9F9F9] p-5 border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212] space-y-4">
              <div>
                <span className="text-[10px] font-black uppercase text-[#121212]/70 block mb-1">
                  Target Problem:
                </span>
                <p className="font-mono font-bold text-base bg-white p-3 border-2 border-[#121212]">
                  {confirmedWork.problemStatement}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-[#121212]/70 block mb-2">
                  Confirmed Steps ({confirmedWork.steps.length} Steps):
                </span>
                <div className="space-y-2">
                  {confirmedWork.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 border-2 border-[#121212] flex items-center gap-3 font-mono text-xs"
                    >
                      <span className="w-6 h-6 bg-[#121212] text-white flex items-center justify-center font-black text-[11px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-[#121212]">{step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs font-bold text-[#121212]/70 uppercase">
                ✅ Ready for Phase 5c Verifier Agent (Live Ground Truth Evaluation)
              </p>
              <Link
                href="/challenge/algebra_linear_equations"
                className="bauhaus-btn bg-[#D02020] text-white font-black text-xs uppercase px-6 py-3 border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] flex items-center gap-2"
              >
                <span>Audit Next AI Challenge</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-4 border-[#121212] bg-[#FFFFFF] p-4 shadow-[4px_4px_0px_0px_#121212]">
        <div className="font-bold text-xs uppercase tracking-wider">
          CogniTrace Mirror Mode — Vision Ingestion & Review Pipeline
        </div>
        <div className="flex items-center gap-3 text-xs font-bold uppercase">
          <span>Nemotron OCR v2</span>
          <span>•</span>
          <span>Nemotron 3 Ultra Structuring</span>
          <span>•</span>
          <span className="text-[#1040C0]">R14 Human Confirmation Gate</span>
        </div>
      </footer>
    </div>
  );
}

