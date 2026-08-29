"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Camera,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  FileText,
  ArrowRight,
  Sparkles,
  XCircle,
  Eye,
} from "lucide-react";
import {
  HANDWRITING_SAMPLES,
  HandwritingSample,
} from "@/lib/fallback/sample-handwriting";
import { TranscribeWorkResponse } from "@/lib/ai/schemas";

interface MirrorUploadProps {
  onTranscriptionSuccess?: (result: TranscribeWorkResponse, imageUrl: string) => void;
}

export function MirrorUpload({ onTranscriptionSuccess }: MirrorUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedSample, setSelectedSample] = useState<HandwritingSample | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [clientError, setClientError] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<TranscribeWorkResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_SIZE_BYTES = 5 * 1024 * 1024;

  const handleFile = (file: File) => {
    setClientError(null);
    setOcrResult(null);
    setSelectedSample(null);

    // Client-side file type check
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setClientError("Invalid file format. Please upload a JPEG or PNG image.");
      setSelectedFile(null);
      setImagePreviewUrl(null);
      return;
    }

    // Client-side file size check (5MB cap)
    if (file.size > MAX_SIZE_BYTES) {
      setClientError(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum allowed size is 5MB.`
      );
      setSelectedFile(null);
      setImagePreviewUrl(null);
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setImagePreviewUrl(objectUrl);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: HandwritingSample) => {
    setClientError(null);
    setOcrResult(null);
    setSelectedFile(null);
    setSelectedSample(sample);
    setImagePreviewUrl(sample.imageSvgDataUrl);
  };

  const handleTranscribe = async (forceLowConfidence: boolean = false) => {
    if (!selectedFile && !selectedSample) {
      setClientError("Please select a sample or upload a photo first.");
      return;
    }

    setIsLoading(true);
    setClientError(null);

    try {
      let res: Response;

      if (selectedSample) {
        // Send JSON with sampleId
        res = await fetch("/api/transcribe-work", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sampleId: selectedSample.id,
            forceLowConfidence: forceLowConfidence || selectedSample.isLowConfidence,
          }),
        });
      } else if (selectedFile) {
        // Send multipart form data
        const formData = new FormData();
        formData.append("file", selectedFile);
        if (forceLowConfidence) {
          formData.append("forceLowConfidence", "true");
        }

        res = await fetch("/api/transcribe-work", {
          method: "POST",
          body: formData,
        });
      } else {
        throw new Error("No input source available");
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with HTTP ${res.status}`);
      }

      const data: TranscribeWorkResponse = await res.json();
      setOcrResult(data);

      if (data.status === "success" && onTranscriptionSuccess && imagePreviewUrl) {
        onTranscriptionSuccess(data, imagePreviewUrl);
      }
    } catch (err) {
      setClientError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImagePreviewUrl(null);
    setSelectedSample(null);
    setOcrResult(null);
    setClientError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Client Error Banner */}
      {clientError && (
        <div className="border-4 border-[#121212] bg-[#D02020] text-white p-4 shadow-[6px_6px_0px_0px_#121212] flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-sm">
            <XCircle className="w-5 h-5 shrink-0 stroke-[3]" />
            <span>{clientError}</span>
          </div>
          <button
            onClick={() => setClientError(null)}
            className="text-xs uppercase font-black px-2 py-1 bg-[#121212] text-white border border-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Low-Confidence Gate Warning Banner (VerdictPanel full-bleed alert pattern) */}
      {ocrResult?.status === "low_confidence" && (
        <div className="border-4 border-[#121212] bg-[#D02020] text-white p-6 shadow-[8px_8px_0px_0px_#121212] space-y-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 shrink-0 stroke-[3]" />
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">
                Low OCR Confidence Gate Triggered ({Math.round(ocrResult.averageConfidence * 100)}%)
              </h3>
              <p className="text-xs font-bold uppercase opacity-90">
                Threshold Requirement: $\ge 75\%$ Confidence (RULES.md R14)
              </p>
            </div>
          </div>
          <p className="text-sm font-medium leading-relaxed bg-[#121212] p-4 border-2 border-white/20">
            {ocrResult.message ||
              "We could not read this handwriting clearly enough to ensure a fair audit. To protect against grading errors caused by transcription mistakes, please retake or choose another sample."}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleReset}
              className="bauhaus-btn bg-[#FFFFFF] text-[#121212] font-black text-xs uppercase px-5 py-3 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retake / Re-upload Photo</span>
            </button>
            <button
              onClick={() => handleSelectSample(HANDWRITING_SAMPLES[0])}
              className="bauhaus-btn bg-[#F0C020] text-[#121212] font-black text-xs uppercase px-5 py-3 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Try Clear Algebra Preset</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Upload / Ingestion Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Dropzone & Image Preview */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 shadow-[8px_8px_0px_0px_#121212]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#D02020] border border-[#121212]" />
                <h2 className="font-black text-lg uppercase tracking-tight">
                  Handwritten Solution Ingestion
                </h2>
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#F0F0F0] border border-[#121212]">
                JPEG / PNG (Max 5MB)
              </span>
            </div>

            {/* Drop Zone (DESIGN.md §6) */}
            {!imagePreviewUrl ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-4 border-dashed p-8 md:p-12 text-center cursor-pointer transition-all ${
                  isDragging
                    ? "border-[#D02020] bg-[#D02020]/10 scale-[0.99]"
                    : "border-[#121212] bg-[#F0F0F0] hover:bg-[#EAEAEA]"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/jpg"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 bg-[#1040C0] text-white flex items-center justify-center border-3 border-[#121212] shadow-[4px_4px_0px_0px_#121212]">
                    <UploadCloud className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <div>
                    <p className="font-black text-base uppercase tracking-tight">
                      Click to upload photo or drag & drop
                    </p>
                    <p className="text-xs font-medium text-[#121212]/70 mt-1">
                      Clear photos of paper notebooks, blackboards, or digital tablets
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 bg-[#FFFFFF] border border-[#121212] shadow-[2px_2px_0px_0px_#121212]">
                      <Camera className="w-3 h-3" /> Camera Photo
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 bg-[#FFFFFF] border border-[#121212] shadow-[2px_2px_0px_0px_#121212]">
                      <FileText className="w-3 h-3" /> PNG / JPEG
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              /* Image Preview Box (No rounded corners, pure Bauhaus framing) */
              <div className="space-y-4">
                <div className="border-4 border-[#121212] bg-[#121212] p-2 shadow-[6px_6px_0px_0px_#121212] relative">
                  <div className="aspect-[16/10] w-full bg-[#FCFCFA] flex items-center justify-center overflow-hidden border-2 border-white/40 relative">
                    {/* Render Image or SVG Data URL */}
                    <img
                      src={imagePreviewUrl}
                      alt="Uploaded student work"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-2 right-2 bg-[#121212] text-white text-[10px] font-black uppercase px-2 py-1 border border-white">
                      {selectedSample ? `Preset: ${selectedSample.title}` : selectedFile?.name}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleReset}
                    className="bauhaus-btn bg-[#FFFFFF] text-[#121212] font-black text-xs uppercase px-4 py-2 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Clear / Choose Different</span>
                  </button>

                  <button
                    onClick={() => handleTranscribe(false)}
                    disabled={isLoading}
                    className={`bauhaus-btn bg-[#D02020] text-white font-black text-xs uppercase px-6 py-3 border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] flex items-center gap-2 hover:-translate-y-0.5 ${
                      isLoading ? "opacity-75 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Transcribing with AI OCR Engine...</span>
                      </>
                    ) : (
                      <>
                        <span>Transcribe Handwriting</span>
                        <ArrowRight className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pre-packaged Test Samples Library */}
        <div className="lg:col-span-5 space-y-4">
          <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 shadow-[8px_8px_0px_0px_#121212]">
            <div className="flex items-center justify-between mb-4">
              <span className="font-black text-xs uppercase px-2 py-0.5 bg-[#F0C020] border border-[#121212]">
                Instant 1-Click Test Library
              </span>
              <span className="text-[10px] font-bold uppercase text-[#121212]/70">
                {HANDWRITING_SAMPLES.length} Presets
              </span>
            </div>

            <h3 className="text-base font-black uppercase tracking-tight mb-2">
              Or Select A Realistic Student Sample
            </h3>
            <p className="text-xs font-medium text-[#121212]/70 mb-4">
              Click any sample below to load it directly into the OCR pipeline for instant audit testing:
            </p>

            <div className="space-y-3">
              {HANDWRITING_SAMPLES.map((sample) => {
                const isSelected = selectedSample?.id === sample.id;
                const isBlurry = sample.isLowConfidence;

                return (
                  <button
                    key={sample.id}
                    onClick={() => handleSelectSample(sample)}
                    className={`w-full text-left p-3 border-2 border-[#121212] transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? "bg-[#1040C0] text-white shadow-[4px_4px_0px_0px_#121212]"
                        : isBlurry
                        ? "bg-[#FFF5F5] hover:bg-[#FFEAEB] shadow-[2px_2px_0px_0px_#D02020]"
                        : "bg-[#F9F9F9] hover:bg-[#FFFFFF] shadow-[2px_2px_0px_0px_#121212]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[9px] font-black uppercase px-1.5 py-0.2 border ${
                            isSelected
                              ? "bg-white text-[#121212] border-white"
                              : isBlurry
                              ? "bg-[#D02020] text-white border-[#121212]"
                              : "bg-[#F0C020] text-[#121212] border-[#121212]"
                          }`}
                        >
                          {sample.domain.toUpperCase()}
                        </span>
                        {isBlurry && (
                          <span
                            className={`text-[9px] font-black uppercase px-1.5 py-0.2 border ${
                              isSelected
                                ? "bg-[#D02020] text-white border-white"
                                : "bg-[#D02020] text-white border-[#121212]"
                            }`}
                          >
                            Retake Gate Test
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-xs uppercase tracking-tight">
                        {sample.title}
                      </h4>
                      <p
                        className={`text-[11px] font-medium leading-snug mt-0.5 ${
                          isSelected ? "text-white/90" : "text-[#121212]/70"
                        }`}
                      >
                        {sample.description}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span
                        className={`text-[10px] font-black uppercase block ${
                          isSelected ? "text-white" : isBlurry ? "text-[#D02020]" : "text-[#1040C0]"
                        }`}
                      >
                        {Math.round(sample.averageConfidence * 100)}% Conf
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Transcription Success Card (Phase 5a verification preview) */}
      {ocrResult?.status === "success" && (
        <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 shadow-[8px_8px_0px_0px_#121212] space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#121212] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-[#1040C0] text-white flex items-center justify-center border-2 border-[#121212] font-black text-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">
                  Transcription Complete ({Math.round(ocrResult.averageConfidence * 100)}% Confidence)
                </h3>
                <p className="text-xs font-bold text-[#121212]/70 uppercase">
                  Domain Detected: {ocrResult.suggestedDomain || "Algebra"} • {ocrResult.detections.length} Lines Captured
                </p>
              </div>
            </div>
            <span className="text-xs font-black uppercase px-3 py-1 bg-[#1040C0] text-white border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212]">
              Gate Passed $\ge 75\%$
            </span>
          </div>

          <div className="bg-[#F0F0F0] p-4 border-2 border-[#121212] font-mono text-xs space-y-1.5">
            <span className="font-bold text-[10px] uppercase text-[#121212]/70 block mb-1">
              Raw OCR Detections:
            </span>
            {ocrResult.detections.map((det, idx) => (
              <div key={idx} className="flex items-center justify-between bg-white p-2 border border-[#121212]">
                <span className="font-bold text-[#121212]">{det.text}</span>
                <span className="text-[10px] font-black bg-[#F0F0F0] px-1.5 py-0.5 border border-[#121212]">
                  {Math.round(det.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                if (onTranscriptionSuccess && imagePreviewUrl) {
                  onTranscriptionSuccess(ocrResult, imagePreviewUrl);
                }
              }}
              className="bauhaus-btn bg-[#1040C0] text-white font-black text-xs uppercase px-6 py-3 border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] flex items-center gap-2 hover:-translate-y-0.5"
            >
              <span>Proceed to Step Confirmation (Phase 5b)</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
