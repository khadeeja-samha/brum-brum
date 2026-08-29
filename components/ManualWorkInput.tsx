"use client";
import React, { useState } from "react";
import {
  FileText,
  Plus,
  Trash2,
  ArrowRight,
  Sparkles,
  Layers,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { ConfirmedWork, StructuredStep } from "@/lib/ai/schemas";

interface ManualWorkInputProps {
  onConfirm: (confirmed: ConfirmedWork) => void;
  onCancel: () => void;
}

export function ManualWorkInput({ onConfirm, onCancel }: ManualWorkInputProps) {
  const [domain, setDomain] = useState<"algebra" | "physics" | "chemistry" | "code">("algebra");
  const [problemStatement, setProblemStatement] = useState<string>("");
  const [steps, setSteps] = useState<StructuredStep[]>([
    { stepIndex: 0, text: "" },
    { stepIndex: 1, text: "" },
  ]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleStepChange = (index: number, value: string) => {
    setValidationError(null);
    setSteps((prev) =>
      prev.map((s, i) => (i === index ? { ...s, text: value } : s))
    );
  };

  const handleAddStep = () => {
    setValidationError(null);
    setSteps((prev) => [...prev, { stepIndex: prev.length, text: "" }]);
  };

  const handleRemoveStep = (index: number) => {
    if (steps.length <= 1) {
      setValidationError("At least one solution step is required.");
      return;
    }
    setValidationError(null);
    setSteps((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((s, newIdx) => ({ ...s, stepIndex: newIdx }))
    );
  };

  const handleLoadSample = (type: "algebra" | "physics" | "chemistry" | "code") => {
    setValidationError(null);
    setDomain(type);
    if (type === "algebra") {
      setProblemStatement("Solve for x: -3(2x - 4) = 18");
      setSteps([
        { stepIndex: 0, text: "-6x + 12 = 18" },
        { stepIndex: 1, text: "-6x = 18 - 12 = 6" },
        { stepIndex: 2, text: "x = -1" },
      ]);
    } else if (type === "physics") {
      setProblemStatement("Ball dropped from rest (v_i = 0, g = 9.8 m/s^2). Find distance after t = 3.0s.");
      setSteps([
        { stepIndex: 0, text: "d = v_i * t + 0.5 * g * t^2" },
        { stepIndex: 1, text: "d = 0 + 0.5 * (9.8) * (3)^2" },
        { stepIndex: 2, text: "d = 4.9 * 9 = 44.1 m" },
      ]);
    } else if (type === "chemistry") {
      setProblemStatement("Balance the reaction: C3H8 + O2 -> CO2 + H2O");
      setSteps([
        { stepIndex: 0, text: "C3H8 + O2 -> 3CO2 + H2O" },
        { stepIndex: 1, text: "C3H8 + O2 -> 3CO2 + 4H2O" },
        { stepIndex: 2, text: "C3H8 + 5O2 -> 3CO2 + 4H2O" },
      ]);
    } else if (type === "code") {
      setProblemStatement("def find_max(numbers): return largest number in list");
      setSteps([
        { stepIndex: 0, text: "max_val = numbers[0]" },
        { stepIndex: 1, text: "for i in range(len(numbers)):" },
        { stepIndex: 2, text: "    if numbers[i] > max_val: max_val = numbers[i]" },
        { stepIndex: 3, text: "return max_val" },
      ]);
    }
  };

  const handleSubmit = () => {
    if (!problemStatement.trim()) {
      setValidationError("Please enter the initial problem statement or equation.");
      return;
    }

    const emptyIdx = steps.findIndex((s) => !s.text.trim());
    if (emptyIdx !== -1) {
      setValidationError(`Step ${emptyIdx + 1} is empty. Please enter text or remove the step.`);
      return;
    }

    const confirmed: ConfirmedWork = {
      workId: `manual-work-${Date.now()}`,
      problemStatement: problemStatement.trim(),
      steps: steps.map((s, idx) => ({ stepIndex: idx, text: s.text.trim() })),
      domain: domain,
      conceptTag: `${domain}_manual_self_audit`,
    };

    onConfirm(confirmed);
  };

  return (
    <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 md:p-8 shadow-[8px_8px_0px_0px_#121212] space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-3 border-[#121212] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#1040C0] text-white flex items-center justify-center border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] shrink-0 font-black">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#1040C0] text-white border border-[#121212]">
                Text-Input Fallback Mode
              </span>
              <span className="text-[10px] font-bold uppercase text-[#121212]/70">
                ARCHITECTURE.md §8e
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              Type or Paste Solution Steps Manually
            </h2>
          </div>
        </div>

        <button
          onClick={onCancel}
          className="bauhaus-btn font-black text-xs uppercase px-4 py-2 bg-[#F0F0F0] text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-white"
        >
          ← Back to Photo Upload
        </button>
      </div>

      {/* Validation Error Alert */}
      {validationError && (
        <div className="border-3 border-[#121212] bg-[#D02020] text-white p-3.5 shadow-[4px_4px_0px_0px_#121212] flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 stroke-[3]" />
          <span className="font-bold text-xs sm:text-sm">{validationError}</span>
        </div>
      )}

      {/* Quick Preset Buttons */}
      <div className="bg-[#F0F0F0] p-3.5 border-2 border-[#121212] flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-black uppercase text-[#121212]/70 mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#1040C0]" />
          <span>Quick Sample Presets:</span>
        </span>
        <button
          onClick={() => handleLoadSample("algebra")}
          className="text-[10px] font-black uppercase px-2.5 py-1 bg-white hover:bg-[#F0C020] text-[#121212] border border-[#121212] shadow-[1px_1px_0px_0px_#121212]"
        >
          Algebra Linear
        </button>
        <button
          onClick={() => handleLoadSample("physics")}
          className="text-[10px] font-black uppercase px-2.5 py-1 bg-white hover:bg-[#F0C020] text-[#121212] border border-[#121212] shadow-[1px_1px_0px_0px_#121212]"
        >
          Physics Kinematics
        </button>
        <button
          onClick={() => handleLoadSample("chemistry")}
          className="text-[10px] font-black uppercase px-2.5 py-1 bg-white hover:bg-[#F0C020] text-[#121212] border border-[#121212] shadow-[1px_1px_0px_0px_#121212]"
        >
          Chemistry Balancing
        </button>
        <button
          onClick={() => handleLoadSample("code")}
          className="text-[10px] font-black uppercase px-2.5 py-1 bg-white hover:bg-[#F0C020] text-[#121212] border border-[#121212] shadow-[1px_1px_0px_0px_#121212]"
        >
          Code Trace
        </button>
      </div>

      {/* Domain Selection Tabs */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 text-[#121212]">
          1. Select STEM Domain
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(["algebra", "physics", "chemistry", "code"] as const).map((dom) => (
            <button
              key={dom}
              type="button"
              onClick={() => {
                setValidationError(null);
                setDomain(dom);
              }}
              className={`bauhaus-btn font-black text-xs uppercase py-2.5 px-3 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] text-center transition-colors ${
                domain === dom ? "bg-[#121212] text-white" : "bg-[#FFFFFF] text-[#121212] hover:bg-[#F0F0F0]"
              }`}
            >
              {dom === "algebra" && "Algebra"}
              {dom === "physics" && "Physics"}
              {dom === "chemistry" && "Chemistry"}
              {dom === "code" && "Code Debug"}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Statement Input */}
      <div>
        <label className="block text-xs font-black uppercase tracking-wider mb-2 text-[#121212]">
          2. Target Problem Statement / Original Equation
        </label>
        <input
          type="text"
          value={problemStatement}
          onChange={(e) => {
            setValidationError(null);
            setProblemStatement(e.target.value);
          }}
          placeholder="e.g. Solve for x: 3(2x - 4) = 18"
          className="w-full bg-[#F0F0F0] text-[#121212] font-bold text-sm p-3.5 border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] focus:bg-white focus:border-[#1040C0] focus:outline-none"
        />
      </div>

      {/* Steps List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-xs font-black uppercase tracking-wider text-[#121212]">
            3. Solution Working Steps ({steps.length} Steps)
          </label>
        </div>

        <div className="space-y-3">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="border-3 border-[#121212] bg-[#FFFFFF] p-3 shadow-[4px_4px_0px_0px_#121212] flex items-start gap-3"
            >
              <div className="w-8 h-8 bg-[#121212] text-white flex items-center justify-center font-black text-xs shrink-0 border border-[#121212]">
                {idx + 1}
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={step.text}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                  placeholder={`Step ${idx + 1} equation or code...`}
                  className="w-full bg-[#FFFDF0] text-[#121212] font-mono font-bold text-xs p-2.5 border-2 border-[#F0C020] shadow-[2px_2px_0px_0px_#121212] focus:bg-white focus:border-[#1040C0] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemoveStep(idx)}
                title="Remove step"
                className="w-8 h-8 bg-[#F0F0F0] hover:bg-[#D02020] hover:text-white text-[#121212] flex items-center justify-center border-2 border-[#121212] transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={handleAddStep}
          className="mt-3 bauhaus-btn w-full bg-[#F0F0F0] hover:bg-white text-[#121212] font-black text-xs uppercase py-2.5 px-4 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Step</span>
        </button>
      </div>

      {/* Submit Action */}
      <div className="pt-3 border-t-2 border-[#121212]">
        <button
          type="button"
          onClick={handleSubmit}
          className="bauhaus-btn w-full bg-[#D02020] text-white font-black text-sm uppercase py-4 px-6 border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-transform cursor-pointer"
        >
          <span>Send to Verifier Agent</span>
          <ArrowRight className="w-5 h-5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
