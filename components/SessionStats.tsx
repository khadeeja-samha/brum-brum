"use client";

import React from "react";
import { Zap, Target, Flame, RotateCcw } from "lucide-react";
import { useSession } from "@/lib/state/SessionContext";

export function SessionStats() {
  const { streak, totalAttempts, totalCorrect, resetSession } = useSession();

  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <div className="w-full border-4 border-[#121212] bg-[#FFFFFF] shadow-[5px_5px_0px_0px_#121212] grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x-4 divide-[#121212]">
      {/* Metric 1: Streak */}
      <div className="p-3 md:p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#F0C020] border-2 border-[#121212] flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#121212] shrink-0">
          <Flame className="w-6 h-6 text-[#121212]" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider text-[#121212]/70">
            Current Streak
          </div>
          <div className="text-xl font-black">{streak} Flaws</div>
        </div>
      </div>

      {/* Metric 2: Bugs Caught */}
      <div className="p-3 md:p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#1040C0] text-white border-2 border-[#121212] flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#121212] shrink-0">
          <Target className="w-6 h-6" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider text-[#121212]/70">
            Bugs Caught
          </div>
          <div className="text-xl font-black">
            {totalCorrect} / {totalAttempts}
          </div>
        </div>
      </div>

      {/* Metric 3: Accuracy */}
      <div className="p-3 md:p-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-[#D02020] text-white border-2 border-[#121212] flex items-center justify-center font-black shadow-[2px_2px_0px_0px_#121212] shrink-0">
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider text-[#121212]/70">
            Audit Accuracy
          </div>
          <div className="text-xl font-black">{accuracy}%</div>
        </div>
      </div>

      {/* Session Mode & Report Link */}
      <div className="p-3 md:p-4 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-black uppercase tracking-wider text-[#121212]/70">
            Session Mode
          </div>
          {totalAttempts > 0 ? (
            <a
              href="/summary"
              className="text-xs font-black uppercase text-[#1040C0] hover:underline block mt-0.5"
            >
              View Report →
            </a>
          ) : (
            <div className="text-xs font-black uppercase text-[#1040C0]">Live Challenge</div>
          )}
        </div>
        {totalAttempts > 0 && (
          <button
            onClick={resetSession}
            title="Reset Session History"
            className="bauhaus-btn p-2 bg-[#F0F0F0] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:bg-[#D02020] hover:text-white cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
