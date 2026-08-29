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

// Grade Request from client (enforces max 500 characters and 1-5 confidence rating)
export const GradeRequestSchema = z.object({
  problemId: z.string().min(1, "problemId is required"),
  selectedStepIndex: z.number().int("selectedStepIndex must be an integer").min(0, "selectedStepIndex cannot be negative"),
  explanation: z.string().trim().min(1, "explanation cannot be empty").max(500, "explanation must not exceed 500 characters"),
  confidence: z.number().int("confidence must be an integer").min(1, "confidence must be between 1 and 5").max(5, "confidence must be between 1 and 5").optional().default(3),
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
  confidence?: number;
}

// ==========================================
// PHASE 5: MIRROR MODE (MULTIMODAL SELF-AUDIT)
// ==========================================

// Single text detection from OCR
export const OcrDetectionSchema = z.object({
  text: z.string().min(1),
  confidence: z.number().min(0).max(1),
  bbox: z.array(z.number()).length(4).optional(),
});

export type OcrDetection = z.infer<typeof OcrDetectionSchema>;

// Transcription request JSON payload (base64 image or sampleId)
export const TranscribeWorkRequestSchema = z.object({
  imageBase64: z.string().optional(),
  sampleId: z.string().optional(),
  forceLowConfidence: z.boolean().optional(),
  mimeType: z.enum(["image/jpeg", "image/png"]).optional(),
});

export type TranscribeWorkRequest = z.infer<typeof TranscribeWorkRequestSchema>;

// Server response from /api/transcribe-work
export const TranscribeWorkResponseSchema = z.object({
  status: z.enum(["success", "low_confidence", "error"]),
  rawText: z.string(),
  averageConfidence: z.number().min(0).max(1),
  detections: z.array(OcrDetectionSchema),
  message: z.string().optional(),
  suggestedDomain: z.enum(["algebra", "physics", "chemistry", "code"]).optional(),
  workId: z.string().optional(),
});

export type TranscribeWorkResponse = z.infer<typeof TranscribeWorkResponseSchema>;

// Phase 5b: Structuring Request Schema
export const StructureWorkRequestSchema = z.object({
  rawText: z.string().trim().min(1, "rawText cannot be empty"),
  suggestedDomain: z.enum(["algebra", "physics", "chemistry", "code"]).optional(),
  workId: z.string().optional(),
});

export type StructureWorkRequest = z.infer<typeof StructureWorkRequestSchema>;

// Phase 5b: Discrete Structured Step Schema
export const StructuredStepSchema = z.object({
  stepIndex: z.number().int().min(0),
  text: z.string().trim().min(1, "step text cannot be empty"),
});

export type StructuredStep = z.infer<typeof StructuredStepSchema>;

// Phase 5b: Structured Output from Nemotron 3 Ultra
export const StructuredWorkSchema = z.object({
  problemStatement: z.string().trim().min(1, "problemStatement cannot be empty"),
  steps: z.array(StructuredStepSchema).min(1, "at least one step is required"),
  domain: z.enum(["algebra", "physics", "chemistry", "code"]),
  conceptTag: z.string().min(1),
  workId: z.string().optional(),
});

export type StructuredWork = z.infer<typeof StructuredWorkSchema>;

// Phase 5b: Student-Confirmed Work Schema (submitted before Verifier Agent runs)
export const ConfirmedWorkSchema = z.object({
  workId: z.string().min(1, "workId is required"),
  problemStatement: z.string().trim().min(1, "problemStatement cannot be empty"),
  steps: z.array(StructuredStepSchema).min(1, "at least one step is required"),
  domain: z.enum(["algebra", "physics", "chemistry", "code"]),
  conceptTag: z.string().optional(),
});

export type ConfirmedWork = z.infer<typeof ConfirmedWorkSchema>;


