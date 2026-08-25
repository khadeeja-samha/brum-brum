"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  Position,
  Handle,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useSession, MasteryStatus, CONCEPT_METADATA } from "@/lib/state/SessionContext";
import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, Code2, Calculator, Atom, FlaskConical } from "lucide-react";

// Custom Bauhaus Geometric Concept Node
function BauhausConceptNode({
  data,
}: {
  data: {
    label: string;
    conceptTag: string;
    status: MasteryStatus;
    attempts: number;
    correct: number;
    description?: string;
  };
}) {
  const { label, status, attempts, correct, description } = data;

  // Determine fill color based on Bauhaus 4-color palette
  let bgClass = "bg-[#E0E0E0] text-[#121212]"; // Untested grey
  let statusText = "Untested";
  let StatusIcon = HelpCircle;

  if (status === "blue") {
    bgClass = "bg-[#1040C0] text-white"; // Mastered
    statusText = "Mastered";
    StatusIcon = CheckCircle2;
  } else if (status === "yellow") {
    bgClass = "bg-[#F0C020] text-[#121212]"; // Unstable / Developing
    statusText = "Unstable";
    StatusIcon = AlertCircle;
  } else if (status === "red") {
    bgClass = "bg-[#D02020] text-white"; // Misconception
    statusText = "Needs Review";
    StatusIcon = AlertTriangle;
  }

  const accuracy = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;

  return (
    <div className="relative group select-none">
      {/* Target Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-[#121212] !border-2 !border-white !rounded-none"
      />

      {/* Main Bauhaus Circle Node */}
      <div
        className={`w-32 h-32 md:w-36 md:h-36 rounded-full border-4 border-[#121212] flex flex-col items-center justify-center p-3 text-center shadow-[6px_6px_0px_0px_#121212] transition-colors duration-300 ${bgClass}`}
      >
        <StatusIcon className="w-5 h-5 mb-1 stroke-[3]" />
        <span className="font-black text-xs md:text-sm uppercase tracking-tight leading-tight line-clamp-2 mb-1">
          {label}
        </span>
        <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border border-[#121212] bg-[#FFFFFF] text-[#121212]">
          {attempts > 0 ? `${correct}/${attempts} (${accuracy}%)` : statusText}
        </div>
      </div>

      {/* Source Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#121212] !border-2 !border-white !rounded-none"
      />

      {/* Hover Diagnostic Tooltip */}
      <div className="absolute left-1/2 -bottom-2 translate-y-full -translate-x-1/2 hidden group-hover:block z-50 w-52 p-3 bg-[#FFFFFF] text-[#121212] border-3 border-[#121212] shadow-[5px_5px_0px_0px_#121212] text-xs">
        <div className="font-black uppercase mb-1">{label}</div>
        <div className="text-[11px] text-[#121212]/80 mb-2">{description}</div>
        <div className="flex justify-between border-t border-[#121212] pt-1 font-bold">
          <span>Status: {statusText}</span>
          <span>{accuracy}% Catches</span>
        </div>
      </div>
    </div>
  );
}

// Custom Bauhaus Central Hub Node
function BauhausHubNode({ data }: { data: { label: string; badge: string } }) {
  return (
    <div className="relative select-none">
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-[#121212] !border-2 !border-white !rounded-none"
      />
      <div className="w-44 h-22 bg-[#FFFFFF] text-[#121212] border-4 border-[#121212] shadow-[6px_6px_0px_0px_#121212] flex flex-col items-center justify-center p-3 text-center">
        <span className="text-[10px] font-black uppercase text-[#D02020] tracking-wider mb-0.5">
          {data.badge || "Knowledge Domain"}
        </span>
        <span className="font-black text-sm uppercase tracking-tight leading-none">
          {data.label}
        </span>
      </div>
    </div>
  );
}

const nodeTypes = {
  conceptNode: BauhausConceptNode,
  hubNode: BauhausHubNode,
};

export function UnderstandingMap({
  className = "",
  initialDomain = "algebra",
}: {
  className?: string;
  initialDomain?: "algebra" | "code" | "physics" | "chemistry";
}) {
  const { mastery } = useSession();
  const [currentDomain, setCurrentDomain] = useState<"algebra" | "code" | "physics" | "chemistry">(initialDomain);

  useEffect(() => {
    setCurrentDomain(initialDomain);
  }, [initialDomain]);

  // Generate dynamic nodes based on domain and real-time mastery state
  const nodes: Node[] = useMemo(() => {
    if (currentDomain === "chemistry") {
      const hub: Node = {
        id: "hub-chemistry",
        type: "hubNode",
        position: { x: 320, y: 30 },
        data: { label: "General Chemistry", badge: "Chemistry Domain" },
      };

      const chemConcepts = [
        { tag: "unbalanced_coefficients", label: "Reaction Balancing", x: 60, y: 180 },
        { tag: "wrong_mole_ratio", label: "Stoichiometry Ratios", x: 280, y: 180 },
        { tag: "sig_fig_error", label: "Molar Mass Precision", x: 500, y: 180 },
        { tag: "wrong_limiting_reagent", label: "Limiting Reagents", x: 120, y: 380 },
        { tag: "charge_imbalance", label: "Net Ionic Charges", x: 440, y: 380 },
      ];

      const conceptNodes: Node[] = chemConcepts.map((c) => {
        const state = mastery[c.tag] || {
          attempts: 0,
          correct: 0,
          status: "untested" as MasteryStatus,
        };

        return {
          id: c.tag,
          type: "conceptNode",
          position: { x: c.x, y: c.y },
          data: {
            label: c.label,
            conceptTag: c.tag,
            status: state.status,
            attempts: state.attempts,
            correct: state.correct,
            description: CONCEPT_METADATA[c.tag]?.description || "Chemical stoichiometry and reaction concept.",
          },
        };
      });

      return [hub, ...conceptNodes];
    }

    if (currentDomain === "physics") {
      const hub: Node = {
        id: "hub-physics",
        type: "hubNode",
        position: { x: 320, y: 30 },
        data: { label: "Classical Mechanics", badge: "Physics Domain" },
      };

      const physicsConcepts = [
        { tag: "unit_conversion_error", label: "Unit Conversions", x: 60, y: 180 },
        { tag: "sign_error_vectors", label: "Vector Signs & 1D", x: 280, y: 180 },
        { tag: "wrong_kinematic_equation", label: "Kinematic Formulas", x: 500, y: 180 },
        { tag: "energy_not_conserved", label: "Energy Conservation", x: 120, y: 380 },
        { tag: "missing_friction_term", label: "Friction & Forces", x: 440, y: 380 },
      ];

      const conceptNodes: Node[] = physicsConcepts.map((c) => {
        const state = mastery[c.tag] || {
          attempts: 0,
          correct: 0,
          status: "untested" as MasteryStatus,
        };

        return {
          id: c.tag,
          type: "conceptNode",
          position: { x: c.x, y: c.y },
          data: {
            label: c.label,
            conceptTag: c.tag,
            status: state.status,
            attempts: state.attempts,
            correct: state.correct,
            description: CONCEPT_METADATA[c.tag]?.description || "Classical physics mechanics concept.",
          },
        };
      });

      return [hub, ...conceptNodes];
    }

    if (currentDomain === "code") {
      const hub: Node = {
        id: "hub-code",
        type: "hubNode",
        position: { x: 320, y: 30 },
        data: { label: "Code Debugging", badge: "Python / JS Domain" },
      };

      const codeConcepts = [
        { tag: "off_by_one", label: "Loop & Array Bounds", x: 60, y: 180 },
        { tag: "mutable_default_args", label: "Mutable Defaults", x: 280, y: 180 },
        { tag: "shallow_copy_mutation", label: "Shallow Spread Mutation", x: 500, y: 180 },
        { tag: "async_missing_await", label: "Async & Await State", x: 120, y: 380 },
        { tag: "scope_shadowing", label: "Closure Scope Bindings", x: 440, y: 380 },
      ];

      const conceptNodes: Node[] = codeConcepts.map((c) => {
        const state = mastery[c.tag] || {
          attempts: 0,
          correct: 0,
          status: "untested" as MasteryStatus,
        };

        return {
          id: c.tag,
          type: "conceptNode",
          position: { x: c.x, y: c.y },
          data: {
            label: c.label,
            conceptTag: c.tag,
            status: state.status,
            attempts: state.attempts,
            correct: state.correct,
            description: CONCEPT_METADATA[c.tag]?.description || "Software debugging concept.",
          },
        };
      });

      return [hub, ...conceptNodes];
    }

    // Algebra Domain Nodes
    const hub: Node = {
      id: "hub-algebra",
      type: "hubNode",
      position: { x: 320, y: 30 },
      data: { label: "Linear Algebra", badge: "Mathematics Domain" },
    };

    const algebraConcepts = [
      { tag: "sign_handling", label: "Sign Handling", x: 60, y: 180 },
      { tag: "distributive_property", label: "Distributive Property", x: 280, y: 180 },
      { tag: "variable_isolation", label: "Variable Isolation", x: 500, y: 180 },
      { tag: "fraction_elimination", label: "Fraction Elimination", x: 120, y: 380 },
      { tag: "order_of_operations", label: "Order of Operations", x: 440, y: 380 },
    ];

    const conceptNodes: Node[] = algebraConcepts.map((c) => {
      const state = mastery[c.tag] || {
        attempts: 0,
        correct: 0,
        status: "untested" as MasteryStatus,
      };

      return {
        id: c.tag,
        type: "conceptNode",
        position: { x: c.x, y: c.y },
        data: {
          label: c.label,
          conceptTag: c.tag,
          status: state.status,
          attempts: state.attempts,
          correct: state.correct,
          description: CONCEPT_METADATA[c.tag]?.description || "Algebraic verification concept.",
        },
      };
    });

    return [hub, ...conceptNodes];
  }, [currentDomain, mastery]);

  // Edges: Thick black straight lines
  const edges: Edge[] = useMemo(() => {
    if (currentDomain === "chemistry") {
      return [
        {
          id: "e-hub-unbalanced",
          source: "hub-chemistry",
          target: "unbalanced_coefficients",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
        {
          id: "e-hub-ratio",
          source: "hub-chemistry",
          target: "wrong_mole_ratio",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
        {
          id: "e-hub-sigfig",
          source: "hub-chemistry",
          target: "sig_fig_error",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
        {
          id: "e-ratio-limiting",
          source: "wrong_mole_ratio",
          target: "wrong_limiting_reagent",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
        {
          id: "e-unbalanced-charge",
          source: "unbalanced_coefficients",
          target: "charge_imbalance",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
      ];
    }

    if (currentDomain === "physics") {
      return [
        {
          id: "e-hub-unit",
          source: "hub-physics",
          target: "unit_conversion_error",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
        {
          id: "e-hub-signvec",
          source: "hub-physics",
          target: "sign_error_vectors",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
        {
          id: "e-hub-kinematic",
          source: "hub-physics",
          target: "wrong_kinematic_equation",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
        {
          id: "e-signvec-energy",
          source: "sign_error_vectors",
          target: "energy_not_conserved",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
        {
          id: "e-kinematic-friction",
          source: "wrong_kinematic_equation",
          target: "missing_friction_term",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
      ];
    }

    if (currentDomain === "code") {
      return [
        {
          id: "e-hub-offbyone",
          source: "hub-code",
          target: "off_by_one",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
        {
          id: "e-hub-mutable",
          source: "hub-code",
          target: "mutable_default_args",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
        {
          id: "e-hub-shallow",
          source: "hub-code",
          target: "shallow_copy_mutation",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
        {
          id: "e-mutable-scope",
          source: "mutable_default_args",
          target: "scope_shadowing",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
        {
          id: "e-shallow-async",
          source: "shallow_copy_mutation",
          target: "async_missing_await",
          type: "straight",
          style: { stroke: "#121212", strokeWidth: 3 },
        },
      ];
    }

    return [
      {
        id: "e-hub-sign",
        source: "hub-algebra",
        target: "sign_handling",
        type: "straight",
        style: { stroke: "#121212", strokeWidth: 3 },
      },
      {
        id: "e-hub-dist",
        source: "hub-algebra",
        target: "distributive_property",
        type: "straight",
        style: { stroke: "#121212", strokeWidth: 3 },
      },
      {
        id: "e-hub-var",
        source: "hub-algebra",
        target: "variable_isolation",
        type: "straight",
        style: { stroke: "#121212", strokeWidth: 3 },
      },
      {
        id: "e-dist-frac",
        source: "distributive_property",
        target: "fraction_elimination",
        type: "straight",
        style: { stroke: "#121212", strokeWidth: 3 },
      },
      {
        id: "e-dist-order",
        source: "distributive_property",
        target: "order_of_operations",
        type: "straight",
        style: { stroke: "#121212", strokeWidth: 3 },
      },
      {
        id: "e-sign-frac",
        source: "sign_handling",
        target: "fraction_elimination",
        type: "straight",
        style: { stroke: "#121212", strokeWidth: 3, strokeDasharray: "5,5" },
      },
    ];
  }, [currentDomain]);

  return (
    <div
      className={`w-full h-[520px] bg-[#F0F0F0] border-4 border-[#121212] shadow-[8px_8px_0px_0px_#121212] relative overflow-hidden ${className}`}
    >
      {/* Top Controls Bar: Legend + Domain Switcher */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Legend Bar */}
        <div className="bg-[#FFFFFF] border-2 border-[#121212] p-2 shadow-[3px_3px_0px_0px_#121212] flex flex-wrap items-center gap-3 text-[11px] font-black uppercase pointer-events-auto">
          <span className="text-[#121212]/60">Mastery Index:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#1040C0] border border-[#121212]" />
            <span>Mastered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#F0C020] border border-[#121212]" />
            <span>Unstable</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#D02020] border border-[#121212]" />
            <span>Misconception</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-[#E0E0E0] border border-[#121212]" />
            <span>Untested</span>
          </div>
        </div>

        {/* 4-Way Domain View Switcher */}
        <div className="bg-[#FFFFFF] border-2 border-[#121212] p-1 shadow-[3px_3px_0px_0px_#121212] flex flex-wrap items-center gap-1 pointer-events-auto">
          <button
            onClick={() => setCurrentDomain("algebra")}
            className={`bauhaus-btn text-[11px] font-black uppercase px-2.5 py-1 border border-[#121212] flex items-center gap-1.5 cursor-pointer ${
              currentDomain === "algebra" ? "bg-[#1040C0] text-white" : "bg-[#FFFFFF] text-[#121212]"
            }`}
          >
            <Calculator className="w-3 h-3" />
            <span>Algebra</span>
          </button>
          <button
            onClick={() => setCurrentDomain("code")}
            className={`bauhaus-btn text-[11px] font-black uppercase px-2.5 py-1 border border-[#121212] flex items-center gap-1.5 cursor-pointer ${
              currentDomain === "code" ? "bg-[#D02020] text-white" : "bg-[#FFFFFF] text-[#121212]"
            }`}
          >
            <Code2 className="w-3 h-3" />
            <span>Code Debug</span>
          </button>
          <button
            onClick={() => setCurrentDomain("physics")}
            className={`bauhaus-btn text-[11px] font-black uppercase px-2.5 py-1 border border-[#121212] flex items-center gap-1.5 cursor-pointer ${
              currentDomain === "physics" ? "bg-[#F0C020] text-[#121212]" : "bg-[#FFFFFF] text-[#121212]"
            }`}
          >
            <Atom className="w-3 h-3 stroke-[2.5]" />
            <span>Physics</span>
          </button>
          <button
            onClick={() => setCurrentDomain("chemistry")}
            className={`bauhaus-btn text-[11px] font-black uppercase px-2.5 py-1 border border-[#121212] flex items-center gap-1.5 cursor-pointer ${
              currentDomain === "chemistry" ? "bg-[#121212] text-white" : "bg-[#FFFFFF] text-[#121212]"
            }`}
          >
            <FlaskConical className="w-3 h-3 stroke-[2.5]" />
            <span>Chemistry</span>
          </button>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.6}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="#121212"
        />
        <Controls
          showInteractive={false}
          className="!bg-[#FFFFFF] !border-2 !border-[#121212] !shadow-[3px_3px_0px_0px_#121212] !rounded-none"
        />
      </ReactFlow>
    </div>
  );
}

