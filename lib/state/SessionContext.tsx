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
  timestamp: number;
}

export interface SessionContextType {
  mastery: MasteryState;
  streak: number;
  totalAttempts: number;
  totalCorrect: number;
  history: AttemptHistoryItem[];
  recordAttempt: (params: {
    problemId: string;
    verdict: "correct" | "partially_correct" | "incorrect";
    conceptTag: string;
  }) => void;
  resetSession: () => void;
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
    label: "Reference & Shallow Copies",
    description: "Identifying unintended nested mutations caused by shallow copies.",
  },
  async_missing_await: {
    label: "Async & Promise Await",
    description: "Catching unawaited asynchronous calls and Promise handling bugs.",
  },
  scope_shadowing: {
    label: "Scope & Closure Bindings",
    description: "Analyzing variable shadowing and unbound local variable state in closures.",
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
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Load from storage if available
  useEffect(() => {
    try {
      const saved =
        (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) ||
        (typeof window !== "undefined" && sessionStorage.getItem(STORAGE_KEY));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mastery) setMastery(parsed.mastery);
        if (typeof parsed.streak === "number") setStreak(parsed.streak);
        if (Array.isArray(parsed.history)) setHistory(parsed.history);
      }
    } catch {
      // Ignore storage read errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save changes to storage only after initial load has finished
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const data = JSON.stringify({ mastery, streak, history });
      localStorage.setItem(STORAGE_KEY, data);
      sessionStorage.setItem(STORAGE_KEY, data);
    } catch {
      // Ignore storage write errors
    }
  }, [mastery, streak, history, isLoaded]);

  const recordAttempt = useCallback(
    ({
      problemId,
      verdict,
      conceptTag,
    }: {
      problemId: string;
      verdict: "correct" | "partially_correct" | "incorrect";
      conceptTag: string;
    }) => {
      setHistory((prev) => [
        {
          problemId,
          verdict,
          conceptTag,
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

  return (
    <SessionContext.Provider
      value={{
        mastery,
        streak,
        totalAttempts,
        totalCorrect,
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
