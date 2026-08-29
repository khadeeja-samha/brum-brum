"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Brain, Code2, Calculator, Atom, FlaskConical, LayoutGrid, Camera } from "lucide-react";
import { useSession } from "@/lib/state/SessionContext";
import { UnderstandingMap } from "@/components/UnderstandingMap";
import { SessionStats } from "@/components/SessionStats";

interface TopicCardItem {
  tag: string;
  domain: "algebra" | "code" | "physics" | "chemistry";
  domainLabel: string;
  title: string;
  difficulty: "Foundation" | "Intermediate" | "Advanced";
  shape: "circle" | "square" | "triangle";
  shapeColor: "#D02020" | "#F0C020" | "#1040C0" | "#121212";
  description: string;
}

const TOPICS: TopicCardItem[] = [
  // --- DOMAIN 1: ALGEBRA ---
  {
    tag: "linear_equations_all",
    domain: "algebra",
    domainLabel: "Algebra",
    title: "Comprehensive Linear Equations",
    difficulty: "Foundation",
    shape: "circle",
    shapeColor: "#1040C0",
    description: "Multi-step equations combining distribution, variable isolation, and constants.",
  },
  {
    tag: "distributive_property",
    domain: "algebra",
    domainLabel: "Algebra",
    title: "Distributive Property & Negatives",
    difficulty: "Foundation",
    shape: "square",
    shapeColor: "#D02020",
    description: "Multiplying negative constants across parenthetical binomials.",
  },
  {
    tag: "sign_handling",
    domain: "algebra",
    domainLabel: "Algebra",
    title: "Sign Handling & Transformations",
    difficulty: "Intermediate",
    shape: "triangle",
    shapeColor: "#F0C020",
    description: "Tracking positive/negative signs across both sides of the equals sign.",
  },
  {
    tag: "fraction_elimination",
    domain: "algebra",
    domainLabel: "Algebra",
    title: "Fraction Elimination & Rational Forms",
    difficulty: "Advanced",
    shape: "circle",
    shapeColor: "#1040C0",
    description: "Multiplying LCD across terms to clear fractional denominators.",
  },
  {
    tag: "order_of_operations",
    domain: "algebra",
    domainLabel: "Algebra",
    title: "Order of Operations in Equations",
    difficulty: "Intermediate",
    shape: "square",
    shapeColor: "#F0C020",
    description: "Navigating operator precedence, grouping symbols, and linear expansions.",
  },
  {
    tag: "variable_isolation",
    domain: "algebra",
    domainLabel: "Algebra",
    title: "Variable Isolation & Balancing",
    difficulty: "Foundation",
    shape: "triangle",
    shapeColor: "#D02020",
    description: "Balancing equations with division by positive and negative coefficients.",
  },

  // --- DOMAIN 2: CODE DEBUGGING ---
  {
    tag: "off_by_one",
    domain: "code",
    domainLabel: "Python Code",
    title: "Array Indexing & Loop Bounds",
    difficulty: "Foundation",
    shape: "circle",
    shapeColor: "#D02020",
    description: "Detecting off-by-one errors and boundary conditions in iterators.",
  },
  {
    tag: "mutable_default_args",
    domain: "code",
    domainLabel: "Python Code",
    title: "Mutable Default Arguments",
    difficulty: "Intermediate",
    shape: "square",
    shapeColor: "#F0C020",
    description: "Identifying persistent state traps caused by mutable parameter defaults.",
  },
  {
    tag: "shallow_copy_mutation",
    domain: "code",
    domainLabel: "JavaScript",
    title: "Reference & Shallow Copy Mutation",
    difficulty: "Intermediate",
    shape: "triangle",
    shapeColor: "#1040C0",
    description: "Catching unintended side-effects in nested object spreads.",
  },
  {
    tag: "async_missing_await",
    domain: "code",
    domainLabel: "JavaScript",
    title: "Async Promises & Missing Awaits",
    difficulty: "Advanced",
    shape: "circle",
    shapeColor: "#F0C020",
    description: "Auditing asynchronous execution traces and unresolved Promise states.",
  },
  {
    tag: "scope_shadowing",
    domain: "code",
    domainLabel: "Python Code",
    title: "Closure Scope & Unbound Variables",
    difficulty: "Advanced",
    shape: "square",
    shapeColor: "#D02020",
    description: "Diagnosing variable masking and unbound local variable state in closures.",
  },

  // --- DOMAIN 3: PHYSICS (Phase 4b) ---
  {
    tag: "unit_conversion_error",
    domain: "physics",
    domainLabel: "Physics",
    title: "Unit Conversions & Velocity",
    difficulty: "Foundation",
    shape: "circle",
    shapeColor: "#1040C0",
    description: "Auditing dimensional conversions between km/h, m/s, and SI time units.",
  },
  {
    tag: "sign_error_vectors",
    domain: "physics",
    domainLabel: "Physics",
    title: "1D Kinematics & Vector Signs",
    difficulty: "Foundation",
    shape: "square",
    shapeColor: "#D02020",
    description: "Verifying coordinate sign conventions in vertical free fall and gravity vectors.",
  },
  {
    tag: "wrong_kinematic_equation",
    domain: "physics",
    domainLabel: "Physics",
    title: "Kinematic Equation Selection",
    difficulty: "Intermediate",
    shape: "triangle",
    shapeColor: "#F0C020",
    description: "Diagnosing formula mismatch errors in uniformly accelerated motion.",
  },
  {
    tag: "energy_not_conserved",
    domain: "physics",
    domainLabel: "Physics",
    title: "Conservation of Energy",
    difficulty: "Intermediate",
    shape: "circle",
    shapeColor: "#1040C0",
    description: "Verifying mechanical energy accounting across kinetic and potential height states.",
  },
  {
    tag: "missing_friction_term",
    domain: "physics",
    domainLabel: "Physics",
    title: "Forces & Incline Friction",
    difficulty: "Advanced",
    shape: "square",
    shapeColor: "#D02020",
    description: "Catching missing frictional deceleration terms on inclined planes.",
  },

  // --- DOMAIN 4: CHEMISTRY (Phase 4c) ---
  {
    tag: "unbalanced_coefficients",
    domain: "chemistry",
    domainLabel: "Chemistry",
    title: "Reaction Balancing & Atoms",
    difficulty: "Foundation",
    shape: "circle",
    shapeColor: "#D02020",
    description: "Auditing atom balance across reactants and products in hydrocarbon combustions.",
  },
  {
    tag: "wrong_mole_ratio",
    domain: "chemistry",
    domainLabel: "Chemistry",
    title: "Stoichiometric Mole Ratios",
    difficulty: "Intermediate",
    shape: "square",
    shapeColor: "#F0C020",
    description: "Detecting incorrect or inverted stoichiometric coefficient ratios in yield calculations.",
  },
  {
    tag: "sig_fig_error",
    domain: "chemistry",
    domainLabel: "Chemistry",
    title: "Molar Mass & Analytical Precision",
    difficulty: "Foundation",
    shape: "triangle",
    shapeColor: "#1040C0",
    description: "Verifying molecular formula molar mass calculations and significant figures precision.",
  },
  {
    tag: "wrong_limiting_reagent",
    domain: "chemistry",
    domainLabel: "Chemistry",
    title: "Limiting Reagent Determination",
    difficulty: "Advanced",
    shape: "circle",
    shapeColor: "#D02020",
    description: "Catching false limiting reactant assumptions based on mass rather than molar theoretical yield.",
  },
  {
    tag: "charge_imbalance",
    domain: "chemistry",
    domainLabel: "Chemistry",
    title: "Net Ionic & Redox Charge Balance",
    difficulty: "Advanced",
    shape: "square",
    shapeColor: "#121212",
    description: "Checking electrical charge conservation in aqueous net ionic and redox equations.",
  },
];

export default function TopicsPage() {
  const { mastery } = useSession();
  const [activeTab, setActiveTab] = useState<"topics" | "map">("topics");
  const [selectedDomain, setSelectedDomain] = useState<"all" | "algebra" | "code" | "physics" | "chemistry">("all");

  const filteredTopics = TOPICS.filter((t) =>
    selectedDomain === "all" ? true : t.domain === selectedDomain
  );

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-[#121212] flex flex-col justify-between p-4 md:p-8 selection:bg-[#D02020] selection:text-white">
      {/* Top Header */}
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
          <span className="font-black text-lg sm:text-xl uppercase tracking-tight">
            Diagnostic Curriculum & Map
          </span>
        </div>

        {/* View Switcher Tabs & Mirror Mode */}
        <div className="flex items-center gap-2">
          <Link
            href="/mirror"
            className="bauhaus-btn font-black text-xs uppercase px-3.5 py-2 bg-[#F0C020] text-[#121212] border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] hover:-translate-y-0.5 transition-transform flex items-center gap-1"
          >
            <span>Mirror Mode</span>
          </Link>
          <button
            onClick={() => setActiveTab("topics")}
            className={`bauhaus-btn font-black text-xs uppercase px-4 py-2 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] cursor-pointer ${
              activeTab === "topics"
                ? "bg-[#1040C0] text-white"
                : "bg-[#FFFFFF] text-[#121212] hover:bg-[#F5F5F5]"
            }`}
          >
            Topic List
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`bauhaus-btn font-black text-xs uppercase px-4 py-2 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] cursor-pointer ${
              activeTab === "map"
                ? "bg-[#D02020] text-white"
                : "bg-[#FFFFFF] text-[#121212] hover:bg-[#F5F5F5]"
            }`}
          >
            Understanding Map
          </button>
        </div>
      </header>

      {/* Session Stats Bar */}
      <div className="mb-6">
        <SessionStats />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full mb-8">
        {activeTab === "map" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-4 border-[#121212] bg-[#FFFFFF] p-4 shadow-[5px_5px_0px_0px_#121212]">
              <div>
                <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  Real-Time Understanding Map
                </h1>
                <p className="text-xs font-medium text-[#121212]/70">
                  Nodes automatically transition color as you catch and explain planted AI errors.
                </p>
              </div>
              <Link
                href="/challenge/algebra_linear_equations"
                className="bauhaus-btn bg-[#D02020] text-white font-black uppercase text-xs px-4 py-2.5 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#121212] hover:-translate-y-0.5"
              >
                Launch Audit
              </Link>
            </div>
            <UnderstandingMap />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header with Domain Filter Pills */}
            <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 shadow-[8px_8px_0px_0px_#121212] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="font-black text-xs uppercase px-2.5 py-1 bg-[#F0C020] border border-[#121212] inline-block mb-2">
                  Multi-Domain Active Verification
                </span>
                <h1 className="text-3xl font-black uppercase tracking-tight">
                  Select a Diagnostic Track
                </h1>
                <p className="text-sm font-medium text-[#121212]/80 mt-1">
                  Choose between high school algebra, code debugging, classical physics, or general chemistry.
                </p>
              </div>

              {/* Domain Filter Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSelectedDomain("all")}
                  className={`bauhaus-btn text-xs font-black uppercase px-3 py-1.5 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] cursor-pointer ${
                    selectedDomain === "all"
                      ? "bg-[#121212] text-white"
                      : "bg-[#FFFFFF] text-[#121212]"
                  }`}
                >
                  All ({TOPICS.length})
                </button>
                <button
                  onClick={() => setSelectedDomain("algebra")}
                  className={`bauhaus-btn text-xs font-black uppercase px-3 py-1.5 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] flex items-center gap-1.5 cursor-pointer ${
                    selectedDomain === "algebra"
                      ? "bg-[#1040C0] text-white"
                      : "bg-[#FFFFFF] text-[#121212]"
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Algebra (6)</span>
                </button>
                <button
                  onClick={() => setSelectedDomain("code")}
                  className={`bauhaus-btn text-xs font-black uppercase px-3 py-1.5 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] flex items-center gap-1.5 cursor-pointer ${
                    selectedDomain === "code"
                      ? "bg-[#D02020] text-white"
                      : "bg-[#FFFFFF] text-[#121212]"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Code Debug (5)</span>
                </button>
                <button
                  onClick={() => setSelectedDomain("physics")}
                  className={`bauhaus-btn text-xs font-black uppercase px-3 py-1.5 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] flex items-center gap-1.5 cursor-pointer ${
                    selectedDomain === "physics"
                      ? "bg-[#F0C020] text-[#121212]"
                      : "bg-[#FFFFFF] text-[#121212]"
                  }`}
                >
                  <Atom className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Physics (5)</span>
                </button>
                <button
                  onClick={() => setSelectedDomain("chemistry")}
                  className={`bauhaus-btn text-xs font-black uppercase px-3 py-1.5 border-2 border-[#121212] shadow-[2px_2px_0px_0px_#121212] flex items-center gap-1.5 cursor-pointer ${
                    selectedDomain === "chemistry"
                      ? "bg-[#121212] text-white"
                      : "bg-[#FFFFFF] text-[#121212]"
                  }`}
                >
                  <FlaskConical className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Chemistry (5)</span>
                </button>
              </div>
            </div>

            {/* Mirror Mode (Multimodal Self-Audit) Banner */}
            <div className="border-4 border-[#121212] bg-[#FFFFFF] p-6 shadow-[8px_8px_0px_0px_#121212] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden bg-bauhaus-dots">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#F0C020] text-[#121212] flex items-center justify-center border-3 border-[#121212] shadow-[3px_3px_0px_0px_#121212] shrink-0">
                  <Camera className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#D02020] text-white border border-[#121212]">
                      New: Vision Ingestion
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#1040C0] text-white border border-[#121212]">
                      Phase 5 Mirror Mode
                    </span>
                  </div>
                  <h2 className="text-xl font-black uppercase tracking-tight">
                    Audit Your Own Handwritten Homework
                  </h2>
                  <p className="text-xs font-medium text-[#121212]/80 mt-0.5 max-w-2xl">
                    Upload photos of your real handwritten solutions. Nemotron OCR transcribes each step and our live Verifier Agent challenges you to locate your own flaws.
                  </p>
                </div>
              </div>

              <Link
                href="/mirror"
                className="bauhaus-btn bg-[#D02020] text-white font-black uppercase text-xs px-6 py-3 border-2 border-[#121212] shadow-[4px_4px_0px_0px_#121212] hover:-translate-y-0.5 shrink-0 flex items-center gap-2"
              >
                <span>Launch Mirror Mode</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </Link>
            </div>

            {/* Grid of Topic Cards (DESIGN.md §3) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTopics.map((topic) => {
                const state = mastery[topic.tag];
                const attempts = state?.attempts || 0;
                const correct = state?.correct || 0;
                const status = state?.status || "untested";

                let statusBadge = "bg-[#E0E0E0] text-[#121212]";
                let statusLabel = "Untested";

                if (status === "blue") {
                  statusBadge = "bg-[#1040C0] text-white";
                  statusLabel = "Mastered";
                } else if (status === "yellow") {
                  statusBadge = "bg-[#F0C020] text-[#121212]";
                  statusLabel = "Developing";
                } else if (status === "red") {
                  statusBadge = "bg-[#D02020] text-white";
                  statusLabel = "Misconception";
                }

                return (
                  <div
                    key={topic.tag}
                    className="border-4 border-[#121212] bg-[#FFFFFF] p-6 shadow-[8px_8px_0px_0px_#121212] flex flex-col justify-between hover:-translate-y-1 transition-transform relative overflow-hidden"
                  >
                    {/* Topic Geometric Icon in Corner (DESIGN.md §3) */}
                    <div className="absolute top-4 right-4 flex items-center gap-2">
                      {topic.shape === "circle" ? (
                        <div
                          className="w-4 h-4 rounded-full border-2 border-[#121212]"
                          style={{ backgroundColor: topic.shapeColor }}
                        />
                      ) : topic.shape === "square" ? (
                        <div
                          className="w-4 h-4 border-2 border-[#121212]"
                          style={{ backgroundColor: topic.shapeColor }}
                        />
                      ) : (
                        <div
                          className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px]"
                          style={{ borderBottomColor: topic.shapeColor }}
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#F0F0F0] border border-[#121212]">
                          {topic.domainLabel}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 border border-[#121212] ${statusBadge}`}
                        >
                          {statusLabel} ({correct}/{attempts})
                        </span>
                      </div>

                      <h2 className="text-xl font-black uppercase tracking-tight leading-snug mb-2">
                        {topic.title}
                      </h2>
                      <p className="text-xs font-medium text-[#121212]/80 leading-relaxed mb-6">
                        {topic.description}
                      </p>
                    </div>

                    <Link
                      href={`/challenge/${topic.tag}`}
                      className="bauhaus-btn w-full bg-[#121212] text-white font-black uppercase text-xs py-3 px-4 border-2 border-[#121212] shadow-[3px_3px_0px_0px_#F0C020] flex items-center justify-center gap-2 hover:bg-[#D02020] transition-colors"
                    >
                      <span>Audit Track</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-4 border-[#121212] bg-[#FFFFFF] p-4 shadow-[4px_4px_0px_0px_#121212]">
        <div className="font-bold text-xs uppercase tracking-wider">
          CogniTrace Multi-Domain Curriculum — Prometheus AI Challenge
        </div>
        <div className="flex items-center gap-3 text-xs font-bold uppercase">
          <span>Algebra, Code Debugging & Physics Tracks</span>
          <span>•</span>
          <span>Live Node Graph</span>
        </div>
      </footer>
    </div>
  );
}

