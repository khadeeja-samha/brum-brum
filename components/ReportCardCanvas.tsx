"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Download, Copy, Check } from "lucide-react";
import { MasteryState, AttemptHistoryItem } from "@/lib/state/SessionContext";

interface ReportCardCanvasProps {
  totalAttempts: number;
  totalCorrect: number;
  streak: number;
  calibrationScore: number;
  mastery: MasteryState;
  history: AttemptHistoryItem[];
}

export function ReportCardCanvas({
  totalAttempts,
  totalCorrect,
  streak,
  calibrationScore,
  mastery,
  history,
}: ReportCardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [canCopy, setCanCopy] = useState<boolean>(false);
  const [isRendered, setIsRendered] = useState<boolean>(false);

  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  // Feature detect ClipboardItem and navigator.clipboard.write per Amendment 2
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof ClipboardItem !== "undefined" &&
      typeof navigator.clipboard.write === "function"
    ) {
      setCanCopy(true);
    }
  }, []);

  // Compute domain statistics
  const getDomainStats = useCallback(
    (domainConcepts: string[]) => {
      let attempts = 0;
      let correct = 0;
      for (const key of domainConcepts) {
        if (mastery[key]) {
          attempts += mastery[key].attempts;
          correct += mastery[key].correct;
        }
      }
      let status = "UNTESTED";
      if (attempts > 0) {
        const ratio = correct / attempts;
        if (ratio >= 0.75 && attempts >= 2) status = "MASTERED";
        else if (ratio >= 0.4) status = "DEVELOPING";
        else status = "MISCONCEPTION";
      }
      return { attempts, correct, status };
    },
    [mastery]
  );

  const algebraStats = getDomainStats([
    "sign_handling",
    "distributive_property",
    "variable_isolation",
    "fraction_elimination",
    "order_of_operations",
    "linear_equations_sign_handling",
    "combining_like_terms",
    "two_step_equations",
  ]);

  const codeStats = getDomainStats([
    "off_by_one",
    "mutable_default_args",
    "shallow_copy_mutation",
    "async_missing_await",
    "scope_shadowing",
  ]);

  const physicsStats = getDomainStats([
    "unit_conversion_error",
    "sign_error_vectors",
    "wrong_kinematic_equation",
    "energy_not_conserved",
    "missing_friction_term",
  ]);

  const chemStats = getDomainStats([
    "unbalanced_coefficients",
    "wrong_mole_ratio",
    "sig_fig_error",
    "wrong_limiting_reagent",
    "charge_imbalance",
  ]);

  const drawCard = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Explicit font-ready wait per Amendment 1
    if (typeof document !== "undefined" && document.fonts) {
      try {
        await document.fonts.ready;
      } catch {}
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // High-DPI 2x scaling (1200x630 displayed, 2400x1260 rendered)
    const width = 1200;
    const height = 630;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // 1. Background Fill (Off-white Bauhaus #F7F7F7)
    ctx.fillStyle = "#F7F7F7";
    ctx.fillRect(0, 0, width, height);

    // 2. Heavy Outer Border (10px #121212)
    ctx.strokeStyle = "#121212";
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, width - 10, height - 10);

    // 3. Top Header Bar (y=24, h=64)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(24, 24, width - 48, 64);
    ctx.strokeStyle = "#121212";
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 24, width - 48, 64);

    // Geometric Shapes on Left of Header
    // Circle (Blue)
    ctx.fillStyle = "#1040C0";
    ctx.beginPath();
    ctx.arc(54, 56, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#121212";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Square (Yellow)
    ctx.fillStyle = "#F0C020";
    ctx.fillRect(76, 42, 26, 26);
    ctx.strokeRect(76, 42, 26, 26);

    // Triangle (Red)
    ctx.fillStyle = "#D02020";
    ctx.beginPath();
    ctx.moveTo(120, 42);
    ctx.lineTo(134, 68);
    ctx.lineTo(106, 68);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Header Title
    ctx.fillStyle = "#121212";
    ctx.font = "900 24px 'Outfit', sans-serif, system-ui";
    ctx.fillText("COGNITRACE", 150, 63);

    ctx.font = "800 13px 'Outfit', sans-serif, system-ui";
    ctx.fillStyle = "#121212";
    ctx.fillText("ACTIVE VERIFICATION ENGINE", 310, 62);

    // Header Right Stamp Pill
    ctx.fillStyle = "#D02020";
    ctx.fillRect(width - 230, 36, 190, 40);
    ctx.strokeStyle = "#121212";
    ctx.lineWidth = 3;
    ctx.strokeRect(width - 230, 36, 190, 40);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "900 12px 'Outfit', sans-serif, system-ui";
    ctx.textAlign = "center";
    ctx.fillText("OFFICIAL AUDIT REPORT", width - 135, 61);
    ctx.textAlign = "left";

    // 4. Main Headline Section (y=112)
    ctx.fillStyle = "#121212";
    ctx.font = "900 38px 'Outfit', sans-serif, system-ui";
    ctx.fillText(`CAUGHT ${totalCorrect} OF ${totalAttempts} PLANTED FLAWS`, 28, 140);

    ctx.font = "600 16px 'Outfit', sans-serif, system-ui";
    ctx.fillStyle = "#444444";
    ctx.fillText(
      "Metacognitive diagnostic performance across Algebra, Code Debugging, Physics & Chemistry",
      28,
      168
    );

    // 5. 4-Box Geometric Stats Grid (y=190, h=100)
    const boxWidth = (width - 48 - 36) / 4;
    const boxY = 190;
    const boxH = 100;

    const stats = [
      { label: "AUDIT ACCURACY", val: `${accuracy}%`, bg: "#F0F5FF", accent: "#1040C0" },
      { label: "TOP STREAK", val: `${streak} FLAWS`, bg: "#FFFDF0", accent: "#F0C020" },
      { label: "TOTAL AUDITS", val: `${totalAttempts}`, bg: "#FFF0F0", accent: "#D02020" },
      { label: "CALIBRATION INDEX", val: `${calibrationScore}%`, bg: "#FFFFFF", accent: "#121212" },
    ];

    stats.forEach((s, idx) => {
      const bx = 24 + idx * (boxWidth + 12);

      // Shadow
      ctx.fillStyle = "#121212";
      ctx.fillRect(bx + 4, boxY + 4, boxWidth, boxH);

      // Box
      ctx.fillStyle = s.bg;
      ctx.fillRect(bx, boxY, boxWidth, boxH);
      ctx.strokeStyle = "#121212";
      ctx.lineWidth = 3;
      ctx.strokeRect(bx, boxY, boxWidth, boxH);

      // Accent top bar
      ctx.fillStyle = s.accent;
      ctx.fillRect(bx, boxY, boxWidth, 6);

      // Label
      ctx.fillStyle = "#121212";
      ctx.font = "800 11px 'Outfit', sans-serif, system-ui";
      ctx.fillText(s.label, bx + 14, boxY + 30);

      // Value
      ctx.fillStyle = s.accent === "#1040C0" ? "#1040C0" : s.accent === "#D02020" ? "#D02020" : "#121212";
      ctx.font = "900 28px 'Outfit', sans-serif, system-ui";
      ctx.fillText(s.val, bx + 14, boxY + 74);
    });

    // 6. Multi-Domain Mastery Matrix (y=314, h=220)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(24, 314, width - 48, 220);
    ctx.strokeStyle = "#121212";
    ctx.lineWidth = 4;
    ctx.strokeRect(24, 314, width - 48, 220);

    // Section header
    ctx.fillStyle = "#121212";
    ctx.font = "900 14px 'Outfit', sans-serif, system-ui";
    ctx.fillText("MULTI-DOMAIN STEM MASTERY MATRIX", 44, 342);

    const domains = [
      { name: "ALGEBRA & LINEAR EQUATIONS", stats: algebraStats, color: "#1040C0" },
      { name: "CODE DEBUGGING (PYTHON & JS)", stats: codeStats, color: "#D02020" },
      { name: "PHYSICS MECHANICS & VECTORS", stats: physicsStats, color: "#F0C020" },
      { name: "GENERAL CHEMISTRY & STOICHIOMETRY", stats: chemStats, color: "#1040C0" },
    ];

    const dBoxW = (width - 48 - 48) / 2;
    const dBoxH = 68;

    domains.forEach((d, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const dx = 44 + col * (dBoxW + 16);
      const dy = 360 + row * (dBoxH + 12);

      // Domain card container
      ctx.fillStyle = "#FAFAFA";
      ctx.fillRect(dx, dy, dBoxW, dBoxH);
      ctx.strokeStyle = "#121212";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(dx, dy, dBoxW, dBoxH);

      // Left color notch
      ctx.fillStyle = d.color;
      ctx.fillRect(dx, dy, 6, dBoxH);

      // Domain Title
      ctx.fillStyle = "#121212";
      ctx.font = "800 12px 'Outfit', sans-serif, system-ui";
      ctx.fillText(d.name, dx + 16, dy + 26);

      // Score
      ctx.font = "700 12px 'Outfit', sans-serif, system-ui";
      ctx.fillStyle = "#555555";
      ctx.fillText(`Audited: ${d.stats.correct}/${d.stats.attempts} Catches`, dx + 16, dy + 50);

      // Status Badge
      let badgeBg = "#E0E0E0";
      let badgeText = "#121212";
      if (d.stats.status === "MASTERED") {
        badgeBg = "#1040C0";
        badgeText = "#FFFFFF";
      } else if (d.stats.status === "DEVELOPING") {
        badgeBg = "#F0C020";
        badgeText = "#121212";
      } else if (d.stats.status === "MISCONCEPTION") {
        badgeBg = "#D02020";
        badgeText = "#FFFFFF";
      }

      const badgeW = 95;
      const badgeH = 22;
      const bx = dx + dBoxW - badgeW - 12;
      const by = dy + (dBoxH - badgeH) / 2;

      ctx.fillStyle = badgeBg;
      ctx.fillRect(bx, by, badgeW, badgeH);
      ctx.strokeStyle = "#121212";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, badgeW, badgeH);

      ctx.fillStyle = badgeText;
      ctx.font = "900 10px 'Outfit', sans-serif, system-ui";
      ctx.textAlign = "center";
      ctx.fillText(d.stats.status, bx + badgeW / 2, by + 15);
      ctx.textAlign = "left";
    });

    // 7. Footer Bar (y=554)
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    ctx.fillStyle = "#121212";
    ctx.fillRect(24, 554, width - 48, 52);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "800 12px 'Outfit', sans-serif, system-ui";
    ctx.fillText("COGNITRACE • AI AUDIT BENCHMARK", 44, 584);

    ctx.font = "700 11px 'Outfit', sans-serif, system-ui";
    ctx.textAlign = "right";
    ctx.fillText(`VERIFIED SESSION • ${today.toUpperCase()}`, width - 44, 584);
    ctx.textAlign = "left";

    setIsRendered(true);
  }, [
    totalAttempts,
    totalCorrect,
    streak,
    calibrationScore,
    accuracy,
    algebraStats,
    codeStats,
    physicsStats,
    chemStats,
  ]);

  useEffect(() => {
    drawCard();
  }, [drawCard]);

  // Download Image Handler
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `cognitrace-report-${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Copy to Clipboard Handler (Feature-detected per Amendment 2)
  const handleCopy = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !canCopy) return;

    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const item = new ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2500);
      }, "image/png");
    } catch (err) {
      console.warn("Failed to copy image to clipboard:", err);
    }
  };

  return (
    <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 md:p-8 shadow-[8px_8px_0px_0px_#121212] space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#121212]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-[#1040C0] border border-[#121212]" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
              Shareable Report Card
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-medium text-[#121212]/70">
            Export a high-resolution 1200×630 Bauhaus report card of your diagnostic session stats.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {canCopy && (
            <button
              onClick={handleCopy}
              className="bauhaus-btn flex items-center justify-center gap-2 bg-[#FFFFFF] text-[#121212] font-black text-xs uppercase px-4 py-3 border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] hover:bg-[#F5F5F5] cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 text-[#1040C0] stroke-[3]" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 stroke-[2.5]" />
                  <span>Copy Image</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleDownload}
            className="bauhaus-btn flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-[#1040C0] text-white font-black text-xs uppercase px-5 py-3 border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] hover:-translate-y-0.5 cursor-pointer"
          >
            <Download className="w-4 h-4 stroke-[3]" />
            <span>Download PNG</span>
          </button>
        </div>
      </div>

      {/* Canvas Preview Container */}
      <div className="border-3 border-[#121212] bg-[#FAFAFA] p-2 sm:p-4 shadow-[4px_4px_0px_0px_#121212] overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          className="w-full max-w-4xl h-auto border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] bg-[#F7F7F7]"
          style={{ aspectRatio: "1200 / 630" }}
        />
      </div>
    </div>
  );
}
