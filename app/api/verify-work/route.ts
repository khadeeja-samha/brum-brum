import { NextRequest, NextResponse } from "next/server";
import {
  VerifyWorkRequestSchema,
  VerifierAgentOutputSchema,
  VerifierAgentOutput,
  StoredProblemRecord,
} from "@/lib/ai/schemas";
import {
  VERIFIER_SYSTEM_PROMPT,
  createVerifierUserPrompt,
  createVerifierRetryPrompt,
} from "@/lib/ai/prompts";
import { callNimChatCompletion } from "@/lib/ai/client";
import { parseModelJson } from "@/lib/ai/parseModelJson";
import { saveProblem, packStoredProblem } from "@/lib/state/problemStore";
import { resolveConceptTag } from "@/lib/ai/conceptTags";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Input Validation (Amendment 4: Reject empty or malformed step arrays with clean HTTP 400 before calling LLM)
    const parseResult = VerifyWorkRequestSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid verified work payload",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const body = parseResult.data;

    // 2. Prepare Verifier Prompt
    const userPrompt = createVerifierUserPrompt({
      problemStatement: body.problemStatement,
      steps: body.steps,
      domain: body.domain,
    });

    let verifierOutput: VerifierAgentOutput | null = null;
    let rawModelResponse = "";

    // 3. Call 1: Primary Verifier Agent Run
    // Rationale (RULES.md R2a & Amendment 1 Benchmark Results):
    // 3-Way Multi-Domain Benchmark (11 problems across Algebra, Physics, Chemistry, Code):
    // - Thinking OFF: 91% accuracy (10/11), 100% valid JSON, 3,943ms avg latency.
    // - Thinking Medium: 91% accuracy (10/11), 100% valid JSON, 10,346ms avg latency (2.6x slower).
    // - Thinking Full: 82% accuracy (9/11), 1 timeout abort, 11,917ms avg latency.
    // enable_thinking: false is chosen as default for superior latency and identical top accuracy.
    try {
      rawModelResponse = await callNimChatCompletion({
        messages: [
          { role: "system", content: VERIFIER_SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 1500,
        enable_thinking: false,
        timeoutMs: 35000,
      });

      const parsed = parseModelJson(rawModelResponse);
      const schemaCheck = VerifierAgentOutputSchema.safeParse(parsed);

      if (schemaCheck.success) {
        const validated = schemaCheck.data;
        // Amendment 2: Bounds-check flawedStepIndex against submitted steps length
        if (validated.verificationStatus === "has_error") {
          const idx = validated.flawedStepIndex;
          if (
            typeof idx === "number" &&
            idx >= 0 &&
            idx < body.steps.length
          ) {
            verifierOutput = validated;
          }
        } else if (validated.verificationStatus === "fully_correct") {
          verifierOutput = validated;
        }
      }
    } catch (primaryErr) {
      console.warn("[Verifier Agent] Primary call failed, preparing retry:", primaryErr);
    }

    // 4. Call 2: Corrective Retry if output failed validation or was out-of-bounds (RULES.md R15 / Amendment 2)
    if (!verifierOutput) {
      console.log("[Verifier Agent] Triggering corrective retry pass...");
      try {
        const retryPrompt = createVerifierRetryPrompt({
          problemStatement: body.problemStatement,
          steps: body.steps,
          domain: body.domain,
          previousError: `Output was malformed or flawedStepIndex was out of bounds for step count ${body.steps.length}`,
        });

        const retryResponse = await callNimChatCompletion({
          messages: [
            { role: "system", content: VERIFIER_SYSTEM_PROMPT },
            { role: "user", content: retryPrompt },
          ],
          temperature: 0.1,
          max_tokens: 1500,
          enable_thinking: false,
          timeoutMs: 35000,
        });

        const retryParsed = parseModelJson(retryResponse);
        const retryCheck = VerifierAgentOutputSchema.safeParse(retryParsed);

        if (retryCheck.success) {
          const validated = retryCheck.data;
          if (validated.verificationStatus === "has_error") {
            const idx = validated.flawedStepIndex;
            if (
              typeof idx === "number" &&
              idx >= 0 &&
              idx < body.steps.length
            ) {
              verifierOutput = validated;
            }
          } else if (validated.verificationStatus === "fully_correct") {
            verifierOutput = validated;
          }
        }
      } catch (retryErr) {
        console.error("[Verifier Agent] Retry call failed:", retryErr);
      }
    }

    // 5. Fallback if both calls failed
    if (!verifierOutput) {
      return NextResponse.json(
        {
          error: "Verification service temporarily unavailable. Please try again or use manual review.",
          canRetry: true,
        },
        { status: 503 }
      );
    }

    // 6. Outcome A: Student Solution Has Error (Store server-side in problemStore, return ClientSafe payload — R7)
    if (verifierOutput.verificationStatus === "has_error") {
      const flawedIdx = verifierOutput.flawedStepIndex ?? 0;
      const conceptTag = resolveConceptTag(
        body.domain,
        verifierOutput.errorType || body.conceptTag,
        `${body.problemStatement} ${verifierOutput.explanationOfFlaw || ""}`
      );

      const storedRecord: StoredProblemRecord = {
        problemId: body.workId,
        problemStatement: body.problemStatement,
        conceptTag: conceptTag,
        createdAt: Date.now(),
        steps: body.steps.map((step, idx) => ({
          stepIndex: idx,
          text: step.text,
          isFlawed: idx === flawedIdx,
          errorType: idx === flawedIdx ? (verifierOutput?.errorType || "calculation_error") : undefined,
          explanationOfFlaw: idx === flawedIdx ? (verifierOutput?.explanationOfFlaw || "Calculation or logical slip in this step.") : undefined,
        })),
      };

      const packedRecord = packStoredProblem(storedRecord);

      // Return Client-Safe response (RULES.md R7: answer key fields omitted)
      return NextResponse.json({
        workId: body.workId,
        problemId: packedRecord.problemId,
        problemStatement: body.problemStatement,
        steps: body.steps.map((s) => ({ stepIndex: s.stepIndex, text: s.text })),
        verificationStatus: "has_error",
        domain: body.domain,
        conceptTag: conceptTag,
        message: "Verifier Agent identified an error in your solution. Locate and audit your mistake below.",
      });
    }

    // 7. Outcome B: Student Solution is Fully Correct (Celebration path, Amendment 2: resolveConceptTag applied)
    const resolvedCorrectTag = resolveConceptTag(
      body.domain,
      body.conceptTag,
      `${body.problemStatement} ${body.steps.map((s) => s.text).join(" ")}`
    );

    return NextResponse.json({
      workId: body.workId,
      problemId: body.workId,
      problemStatement: body.problemStatement,
      steps: body.steps.map((s) => ({ stepIndex: s.stepIndex, text: s.text })),
      verificationStatus: "fully_correct",
      domain: body.domain,
      conceptTag: resolvedCorrectTag,
      message: "Verified Flawless! No errors detected in your solution.",
    });
  } catch (err) {
    console.error("[POST /api/verify-work] Unhandled server exception:", err);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}
