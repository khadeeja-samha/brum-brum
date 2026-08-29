"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Edit3,
  Plus,
  Trash2,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Eye,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { StructuredWork, StructuredStep, ConfirmedWork } from "@/lib/ai/schemas";

interface TranscriptionReviewProps {
  initialStructuredWork: StructuredWork;
  originalImagePreviewUrl?: string;
  originalRawOcrText?: string;
  onConfirm: (confirmed: ConfirmedWork) => void;
  onBackToUpload: () => void;
}

export function TranscriptionReview({
  initialStructuredWork,
  originalImagePreviewUrl,
  originalRawOcrText,
  onConfirm,
  onBackToUpload,
}: TranscriptionReviewProps) {
  const [problemStatement, setProblemStatement] = useState<string>(
    initialStructuredWork.problemStatement
  );
  const [steps, setSteps] = useState<StructuredStep[]>(
    initialStructuredWork.steps
  );
  const [domain, setDomain] = useState<"algebra" | "physics" | "chemistry" | "code">(
    initialStructuredWork.domain
  );
  const [hasConfirmedReview, setHasConfirmedReview] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Update a single step's text
  const handleStepChange = (index: number, newText: string) => {
    setValidationError(null);
    setSteps((prev) =>
      prev.map((step, i) => (i === index ? { ...step, text: newText } : step))
    );
  };

  // Add a new step
  const handleAddStep = () => {
    setValidationError(null);
    setSteps((prev) => [
      ...prev,
      { stepIndex: prev.length, text: "" },
    ]);
  };

  // Remove a step (enforcing at least 1 step remaining)
  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) {
      setValidationError("At least one solution step is required.");
      return;
    }
    setValidationError(null);
    const updated = steps
      .filter((_, i) => i !== index)
      .map((step, newIdx) => ({ ...step, stepIndex: newIdx }));
    setSteps(updated);
  };

  // Reset to initial OCR extraction
  const handleResetToOcr = () => {
    setProblemStatement(initialStructuredWork.problemStatement);
    setSteps(initialStructuredWork.steps);
    setDomain(initialStructuredWork.domain);
    setValidationError(null);
  };

  // Handle explicit Confirm & Audit submission (RULES.md R14)
  const handleSubmitConfirmation = () => {
    // 1. Validation checks
    if (!problemStatement.trim()) {
      setValidationError("Problem statement cannot be empty. Please enter or confirm the equation.");
      return;
    }

    const emptyStepIdx = steps.findIndex((s) => !s.text.trim());
    if (emptyStepIdx !== -1) {
      setValidationError(`Step ${emptyStepIdx + 1} is empty. Please enter equation text or remove the step.`);
      return;
    }

    if (!hasConfirmedReview) {
      setValidationError("Please check the confirmation box below to verify the steps match your handwriting (RULES.md R14).");
      return;
    }

    const confirmedPayload: ConfirmedWork = {
      workId: initialStructuredWork.workId || `work-${Date.now()}`,
      problemStatement: problemStatement.trim(),
      steps: steps.map((s, idx) => ({ stepIndex: idx, text: s.text.trim() })),
      domain: domain,
      conceptTag: initialStructuredWork.conceptTag || `${domain}_self_audit`,
    };

    onConfirm(confirmedPayload);
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Notification / R14 Policy Banner */}
      <div className="border-4 border-[#121212] bg-[#FFFFFF] p-5 shadow-[6px_6px_0px_0px_#121212] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#F0C020] text-[#121212] flex items-center justify-center border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] font-black shrink-0">
            <Edit3 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#F0C020] border border-[#121212]">
                Reliability Gate (R14)
              </span>
              <span className="text-[10px] font-bold uppercase text-[#121212]/70">
                Human Confirmation Required
              </span>
            </div>
            <h2 className="text-xl font-black uppercase tracking-tight">
              Review & Edit Transcribed Steps
            </h2>
          </div>
        </div>

        <button
          onClick={onBackToUpload}
          className="bauhaus-btn bg-[#F0F0F0] text-[#121212] font-black text-xs uppercase px-4 py-2 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-white shrink-0"
        >
          ← Back to Upload
        </button>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div className="border-4 border-[#121212] bg-[#D02020] text-white p-4 shadow-[6px_6px_0px_0px_#121212] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 stroke-[3]" />
          <span className="font-bold text-sm">{validationError}</span>
        </div>
      )}

      {/* Main Split Grid (DESIGN.md §6) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Original Handwriting Frame */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border-4 border-[#121212] bg-[#FFFFFF] p-5 shadow-[8px_8px_0px_0px_#121212]">
            <div className="flex items-center justify-between mb-3 border-b-2 border-[#121212] pb-2">
              <span className="font-black text-xs uppercase flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#1040C0]" />
                <span>Original Handwriting</span>
              </span>
              <span className="text-[10px] font-bold uppercase bg-[#F0F0F0] px-2 py-0.5 border border-[#121212]">
                Reference
              </span>
            </div>

            {originalImagePreviewUrl ? (
              <div className="border-3 border-[#121212] bg-[#121212] p-1.5 shadow-[4px_4px_0px_0px_#121212]">
                <div className="aspect-[4/3] w-full bg-[#FCFCFA] flex items-center justify-center overflow-hidden border border-white/40">
                  <img
                    src={originalImagePreviewUrl}
                    alt="Original handwritten solution"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-[#F0F0F0] p-6 text-center border-2 border-[#121212]">
                <p className="text-xs font-bold text-[#121212]/70 uppercase">
                  No image preview available
                </p>
              </div>
            )}

            {/* Raw OCR Trace Accordion */}
            {originalRawOcrText && (
              <div className="mt-4 pt-4 border-t-2 border-[#121212]">
                <span className="text-[10px] font-black uppercase text-[#121212]/70 block mb-1.5">
                  Raw OCR Extractions:
                </span>
                <div className="bg-[#F0F0F0] p-3 border-2 border-[#121212] font-mono text-[11px] max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                  {originalRawOcrText}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Editable Step Cards */}
        <div className="lg:col-span-7 space-y-5">
          <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 shadow-[8px_8px_0px_0px_#121212] space-y-6">
            {/* Problem Statement Input */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider mb-2 text-[#121212]">
                1. Initial Problem Statement / Target Equation
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={problemStatement}
                  onChange={(e) => {
                    setValidationError(null);
                    setProblemStatement(e.target.value);
                  }}
                  placeholder="e.g. Solve for x: 4(x - 3) = 2x + 10"
                  className="w-full bg-[#F0F0F0] text-[#121212] font-bold text-sm p-3.5 border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] focus:bg-white focus:border-[#1040C0] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Editable Step Cards (DESIGN.md §6 Yellow Outline) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-black uppercase tracking-wider text-[#121212]">
                  2. Sequential Solution Steps ({steps.length} Steps)
                </label>
                <button
                  onClick={handleResetToOcr}
                  className="text-[10px] font-black uppercase px-2.5 py-1 bg-[#F0F0F0] text-[#121212] border border-[#121212] hover:bg-white flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reset to OCR</span>
                </button>
              </div>

              <div className="space-y-3">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="border-3 border-[#121212] bg-[#FFFFFF] p-3 shadow-[4px_4px_0px_0px_#121212] flex items-start gap-3 relative"
                  >
                    {/* Step Number Badge */}
                    <div className="w-8 h-8 bg-[#121212] text-white flex items-center justify-center font-black text-xs shrink-0 border border-[#121212]">
                      {idx + 1}
                    </div>

                    {/* Step Textarea with Bauhaus Yellow Focus */}
                    <div className="flex-1">
                      <textarea
                        rows={2}
                        value={step.text}
                        onChange={(e) => handleStepChange(idx, e.target.value)}
                        placeholder={`Enter step ${idx + 1} equation...`}
                        className="w-full bg-[#FFFDF0] text-[#121212] font-mono font-bold text-xs p-2.5 border-2 border-[#F0C020] shadow-[2px_2px_0px_0px_#121212] focus:bg-white focus:border-[#1040C0] focus:outline-none resize-none transition-colors"
                      />
                    </div>

                    {/* Delete Step Button */}
                    <button
                      onClick={() => handleRemoveStep(idx)}
                      title="Remove this step"
                      className="w-8 h-8 bg-[#F0F0F0] hover:bg-[#D02020] hover:text-white text-[#121212] flex items-center justify-center border-2 border-[#121212] transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Step Button */}
              <button
                onClick={handleAddStep}
                className="mt-3 bauhaus-btn w-full bg-[#F0F0F0] hover:bg-white text-[#121212] font-black text-xs uppercase py-2.5 px-4 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Additional Step</span>
              </button>
            </div>

            {/* Mandatory Human Review Checkbox (RULES.md R14) */}
            <div className="pt-4 border-t-2 border-[#121212]">
              <label className="flex items-start gap-3 cursor-pointer select-none bg-[#FFFDE7] p-3.5 border-2 border-[#F0C020] shadow-[3px_3px_0px_0px_#121212]">
                <input
                  type="checkbox"
                  checked={hasConfirmedReview}
                  onChange={(e) => {
                    setValidationError(null);
                    setHasConfirmedReview(e.target.checked);
                  }}
                  className="w-5 h-5 accent-[#D02020] border-2 border-[#121212] shrink-0 mt-0.5 cursor-pointer"
                />
                <span className="text-xs font-bold text-[#121212] leading-snug">
                  I confirm that the problem statement and all {steps.length} steps above accurately match my handwritten work (including any flaws I may have written).
                </span>
              </label>
            </div>

            {/* Primary Action Button (DESIGN.md §6 Confirm & Audit) */}
            <div className="pt-2">
              <button
                onClick={handleSubmitConfirmation}
                className="bauhaus-btn w-full bg-[#D02020] text-white font-black text-sm uppercase py-4 px-6 border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-transform cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
                <span>Confirm & Audit My Work</span>
                <ArrowRight className="w-5 h-5 stroke-[3]" />
              </button>
              <p className="text-[10px] font-bold text-center text-[#121212]/70 uppercase mt-2">
                The Verifier Agent will independently re-solve the equation and check your work.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
