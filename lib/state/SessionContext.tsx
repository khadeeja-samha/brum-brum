"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type MasteryStatus = "untested" | "red" | "yellow" | "blue";

export interface ConceptMastery {
  conceptTag: string;
  label: string;
  attempts: number;
  correct: number;
  status: MasteryStatus;
}

export interface MasteryState {
  [conceptTag: string]: ConceptMastery;
}

export interface AttemptHistoryItem {
  problemId: string;
  verdict: "correct" | "partially_correct" | "incorrect";
  conceptTag: string;
  confidence?: number;
  timestamp: number;
}

export interface SessionContextType {
  mastery: MasteryState;
  streak: number;
  totalAttempts: number;
  totalCorrect: number;
  calibrationScore: number;
  history: AttemptHistoryItem[];
  recordAttempt: (params: {
    problemId: string;
    verdict: "correct" | "partially_correct" | "incorrect";
    conceptTag: string;
    confidence?: number;
  }) => void;
  resetSession: () => void;
}

/**
 * Computes Metacognitive Calibration Index (%) based on confidence (1-5) and verdict.
 * Explicit treatment of partially_correct:
 * - Confidence 4-5 (High) + partially_correct => 0.5 points (overconfident partial reasoning)
 * - Confidence 3 (Moderate) + partially_correct => 1.0 points (well-matched moderate certainty)
 * - Confidence 1-2 (Low) + partially_correct => 0.75 points (justified caution for shaky rationale)
 * Standard calibration alignments:
 * - Confidence 4-5 + correct => 1.0 points (Master Calibrated)
 * - Confidence 1-2 + incorrect => 1.0 points (Self-Aware Caution)
 * - Confidence 3 + correct => 0.75 points
 * - Confidence 3 + incorrect => 0.5 points
 * - Confidence 4-5 + incorrect => 0.0 points (Overconfidence Blindspot)
 * - Confidence 1-2 + correct => 0.5 points (Underconfidence / Hidden Competence)
 */
export function calculateCalibrationScore(history: AttemptHistoryItem[]): number {
  if (history.length === 0) return 100;
  let scoreSum = 0;
  for (const item of history) {
    const conf = item.confidence ?? 3;
    if (item.verdict === "correct") {
      if (conf >= 4) scoreSum += 1.0;
      else if (conf === 3) scoreSum += 0.75;
      else scoreSum += 0.5;
    } else if (item.verdict === "partially_correct") {
      if (conf === 3) scoreSum += 1.0;
      else if (conf <= 2) scoreSum += 0.75;
      else scoreSum += 0.5;
    } else {
      // incorrect
      if (conf <= 2) scoreSum += 1.0;
      else if (conf === 3) scoreSum += 0.5;
      else scoreSum += 0.0;
    }
  }
  return Math.round((scoreSum / history.length) * 100);
}

// Concept label mapping for display
export const CONCEPT_METADATA: Record<string, { label: string; description: string }> = {
  sign_handling: {
    label: "Sign Handling & Negatives",
    description: "Tracking signs during addition, subtraction, and isolation.",
  },
  distributive_property: {
    label: "Distributive Property",
    description: "Multiplying constants across parenthetical expressions correctly.",
  },
  variable_isolation: {
    label: "Variable Isolation",
    description: "Balancing equations while isolating terms to one side.",
  },
  fraction_elimination: {
    label: "Fraction Elimination & LCD",
    description: "Clearing denominators across all terms in an equation.",
  },
  order_of_operations: {
    label: "Order of Operations",
    description: "Executing grouping, multiplication, and addition in correct hierarchy.",
  },
  linear_equations_sign_handling: {
    label: "Linear Equation Signs",
    description: "Handling signs when moving terms across the equals sign.",
  },
  combining_like_terms: {
    label: "Combining Like Terms",
    description: "Simplifying and grouping identical variable terms.",
  },
  two_step_equations: {
    label: "Rational & Multi-Step Equations",
    description: "Solving equations involving rational coefficients and fractions.",
  },
  off_by_one: {
    label: "Array & Loop Bounds",
    description: "Detecting off-by-one indexing errors and iterator boundaries in code.",
  },
  mutable_default_args: {
    label: "Mutable Default Arguments",
    description: "Spotting persistent state bugs from mutable function parameter defaults.",
  },
  shallow_copy_mutation: {
    label: "Shallow Spread Mutation",
    description: "Finding accidental nested reference mutations when spreading objects or arrays.",
  },
  async_missing_await: {
    label: "Async Execution & Await",
    description: "Catching un-awaited Promises and asynchronous timing errors in JavaScript.",
  },
  scope_shadowing: {
    label: "Scope & Closure Bindings",
    description: "Analyzing variable shadowing and unbound local variable state in closures.",
  },
  unit_conversion_error: {
    label: "Unit Conversions & Velocity",
    description: "Detecting improper unit conversions between SI and metric units (e.g., km/h to m/s).",
  },
  sign_error_vectors: {
    label: "1D Kinematics & Vector Signs",
    description: "Tracking coordinate sign conventions in 1D kinematics and gravitational vectors.",
  },
  wrong_kinematic_equation: {
    label: "Kinematic Equation Selection",
    description: "Identifying mismatched motion formulas for constant acceleration.",
  },
  energy_not_conserved: {
    label: "Conservation of Energy",
    description: "Verifying mechanical energy accounting across kinetic and potential states.",
  },
  missing_friction_term: {
    label: "Forces & Inclined Friction",
    description: "Checking for missing friction resistance and normal force components on inclines.",
  },
  unbalanced_coefficients: {
    label: "Reaction Balancing & Atoms",
    description: "Auditing atom balance across reactants and products in chemical reactions.",
  },
  wrong_mole_ratio: {
    label: "Stoichiometric Mole Ratios",
    description: "Detecting incorrect or inverted stoichiometric coefficient ratios in calculations.",
  },
  sig_fig_error: {
    label: "Molar Mass & Analytical Precision",
    description: "Verifying molecular formula molar mass calculations and precision.",
  },
  wrong_limiting_reagent: {
    label: "Limiting Reagent Analysis",
    description: "Catching false limiting reactant assumptions based on mass rather than theoretical molar yield.",
  },
  charge_imbalance: {
    label: "Net Ionic & Charge Balance",
    description: "Checking electrical charge conservation in aqueous net ionic and redox equations.",
  },
};

export function calculateMasteryStatus(attempts: number, correct: number): MasteryStatus {
  if (attempts === 0) return "untested";
  const ratio = correct / attempts;
  if (ratio >= 0.75 && attempts >= 3) return "blue"; // Mastered
  if (ratio >= 0.4) return "yellow"; // Unstable / Developing
  return "red"; // Misconception
}

const initialConcepts: MasteryState = {
  sign_handling: {
    conceptTag: "sign_handling",
    label: "Sign Handling",
    attempts: 0,
    correct: 0,
    status: "untested",
  },
  distributive_property: {
    conceptTag: "distributive_property",
    label: "Distributive Property",
    attempts: 0,
    correct: 0,
    status: "untested",
  },
  variable_isolation: {
    conceptTag: "variable_isolation",
    label: "Variable Isolation",
    attempts: 0,
    correct: 0,
    status: "untested",
  },
  fraction_elimination: {
    conceptTag: "fraction_elimination",
    label: "Fraction Elimination",
    attempts: 0,
    correct: 0,
    status: "untested",
  },
  order_of_operations: {
    conceptTag: "order_of_operations",
    label: "Order of Operations",
    attempts: 0,
    correct: 0,
    status: "untested",
  },
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const STORAGE_KEY = "cognitrace_session_v1";

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [mastery, setMastery] = useState<MasteryState>(initialConcepts);
  const [streak, setStreak] = useState<number>(0);
  const [history, setHistory] = useState<AttemptHistoryItem[]>([]);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Hydrate session from localStorage/sessionStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mastery) setMastery(parsed.mastery);
        if (typeof parsed.streak === "number") setStreak(parsed.streak);
        if (Array.isArray(parsed.history)) setHistory(parsed.history);
      }
    } catch (e) {
      console.warn("Failed to load session:", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save session state to localStorage/sessionStorage on change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      const stateToSave = JSON.stringify({ mastery, streak, history });
      localStorage.setItem(STORAGE_KEY, stateToSave);
      sessionStorage.setItem(STORAGE_KEY, stateToSave);
    } catch (e) {
      console.warn("Failed to save session:", e);
    }
  }, [mastery, streak, history, isHydrated]);

  const recordAttempt = useCallback(
    ({
      problemId,
      verdict,
      conceptTag,
      confidence = 3,
    }: {
      problemId: string;
      verdict: "correct" | "partially_correct" | "incorrect";
      conceptTag: string;
      confidence?: number;
    }) => {
      setHistory((prev) => [
        {
          problemId,
          verdict,
          conceptTag,
          confidence,
          timestamp: Date.now(),
        },
        ...prev,
      ]);

      if (verdict === "correct") {
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }

      setMastery((prev) => {
        const tag = conceptTag || "sign_handling";
        const current = prev[tag] || {
          conceptTag: tag,
          label: CONCEPT_METADATA[tag]?.label || tag,
          attempts: 0,
          correct: 0,
          status: "untested",
        };

        const newAttempts = current.attempts + 1;
        const newCorrect = current.correct + (verdict === "correct" ? 1 : 0);
        const newStatus = calculateMasteryStatus(newAttempts, newCorrect);

        return {
          ...prev,
          [tag]: {
            ...current,
            attempts: newAttempts,
            correct: newCorrect,
            status: newStatus,
          },
        };
      });
    },
    []
  );

  const resetSession = useCallback(() => {
    setMastery(initialConcepts);
    setStreak(0);
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const totalAttempts = history.length;
  const totalCorrect = history.filter((h) => h.verdict === "correct").length;
  const calibrationScore = calculateCalibrationScore(history);

  return (
    <SessionContext.Provider
      value={{
        mastery,
        streak,
        totalAttempts,
        totalCorrect,
        calibrationScore,
        history,
        recordAttempt,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}
