import { z } from "zod";

// Schema for raw generated problem from Generator Agent
export const GeneratedStepSchema = z.object({
  stepIndex: z.number(),
  text: z.string().min(1),
  isFlawed: z.boolean(),
  errorType: z.string().optional(),
  explanationOfFlaw: z.string().optional(),
});

export const GeneratedProblemSchema = z.object({
  problemStatement: z.string().min(1),
  steps: z.array(GeneratedStepSchema).min(2),
  conceptTag: z.string().min(1),
});

export type GeneratedProblem = z.infer<typeof GeneratedProblemSchema>;
export type GeneratedStep = z.infer<typeof GeneratedStepSchema>;

// Server-side stored problem record
export interface StoredProblemRecord {
  problemId: string;
  problemStatement: string;
  steps: GeneratedStep[];
  conceptTag: string;
  createdAt: number;
}

// Client-safe problem response (RULES.md R7: answer key is omitted)
export interface ClientSafeProblem {
  problemId: string;
  problemStatement: string;
  steps: Array<{ stepIndex: number; text: string }>;
  conceptTag: string;
}

// Grade Request from client (enforces max 500 characters per Phase 4a security spec)
export const GradeRequestSchema = z.object({
  problemId: z.string().min(1, "problemId is required"),
  selectedStepIndex: z.number().int("selectedStepIndex must be an integer").min(0, "selectedStepIndex cannot be negative"),
  explanation: z.string().trim().min(1, "explanation cannot be empty").max(500, "explanation must not exceed 500 characters"),
});

export type GradeRequest = z.infer<typeof GradeRequestSchema>;

// Grading Agent response schema
export const GradingAgentOutputSchema = z.object({
  verdict: z.enum(["correct", "partially_correct", "incorrect"]),
  feedback: z.string().min(1),
  correctExplanation: z.string().min(1),
});

export type GradingAgentOutput = z.infer<typeof GradingAgentOutputSchema>;

// Complete Grade verdict returned to client
export interface GradeResponse {
  verdict: "correct" | "partially_correct" | "incorrect";
  actualFlawedStep: number;
  correctExplanation: string;
  feedback: string;
  conceptTag: string;
  masteryDelta: number;
}
