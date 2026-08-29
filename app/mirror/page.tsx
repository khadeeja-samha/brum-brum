"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Camera, ShieldCheck, FileCheck, ArrowRight } from "lucide-react";
import { MirrorUpload } from "@/components/MirrorUpload";
import { SessionStats } from "@/components/SessionStats";
import { TranscribeWorkResponse } from "@/lib/ai/schemas";

export default function MirrorModePage() {
  const [transcribedData, setTranscribedData] = useState<{
    result: TranscribeWorkResponse;
    imageUrl: string;
  } | null>(null);

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
        {/* Banner / Value Proposition (PRD.md §12) */}
        <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 md:p-8 shadow-[8px_8px_0px_0px_#121212] relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1040C0] text-white font-black text-xs uppercase tracking-wider border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212]">
                <Camera className="w-3.5 h-3.5" />
                <span>Phase 5: Vision Ingestion Active</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight leading-none">
                Audit Your <span className="text-[#D02020] underline decoration-[#121212] decoration-4">Own</span> Real Work
              </h1>
              <p className="text-sm font-medium text-[#121212]/80 leading-relaxed">
                Snap a photo of your handwritten homework or worksheet. Nemotron OCR transcribes your lines, and our live Verifier Agent challenges you to locate flaws in your own work.
              </p>
            </div>

            {/* 3-Pillar Visual Indicator */}
            <div className="grid grid-cols-3 gap-2 shrink-0 w-full md:w-auto">
              <div className="bg-[#F0F0F0] border-2 border-[#121212] p-2.5 text-center shadow-[2px_2px_0px_0px_#121212]">
                <span className="w-5 h-5 rounded-full bg-[#1040C0] text-white font-black text-[10px] inline-flex items-center justify-center border border-[#121212] mb-1">
                  1
                </span>
                <p className="text-[10px] font-black uppercase">OCR Ingest</p>
              </div>
              <div className="bg-[#F0F0F0] border-2 border-[#121212] p-2.5 text-center shadow-[2px_2px_0px_0px_#121212]">
                <span className="w-5 h-5 bg-[#F0C020] text-[#121212] font-black text-[10px] inline-flex items-center justify-center border border-[#121212] mb-1">
                  2
                </span>
                <p className="text-[10px] font-black uppercase">Confirm Steps</p>
              </div>
              <div className="bg-[#F0F0F0] border-2 border-[#121212] p-2.5 text-center shadow-[2px_2px_0px_0px_#121212]">
                <span className="w-5 h-5 rounded-full bg-[#D02020] text-white font-black text-[10px] inline-flex items-center justify-center border border-[#121212] mb-1">
                  3
                </span>
                <p className="text-[10px] font-black uppercase">Self-Audit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Upload & Ingestion Component */}
        <MirrorUpload
          onTranscriptionSuccess={(result, imageUrl) => {
            setTranscribedData({ result, imageUrl });
          }}
        />
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-4 border-[#121212] bg-[#FFFFFF] p-4 shadow-[4px_4px_0px_0px_#121212]">
        <div className="font-bold text-xs uppercase tracking-wider">
          CogniTrace Mirror Mode — Vision Ingestion Pipeline
        </div>
        <div className="flex items-center gap-3 text-xs font-bold uppercase">
          <span>Nemotron OCR v2</span>
          <span>•</span>
          <span>5MB In-Memory Stream</span>
          <span>•</span>
          <span className="text-[#1040C0]">0.75 Confidence Gate</span>
        </div>
      </footer>
    </div>
  );
}
