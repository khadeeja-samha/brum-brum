import { NextRequest, NextResponse } from "next/server";
import { callNimChatCompletion } from "@/lib/ai/client";
import {
  GRADING_SYSTEM_PROMPT,
  createGradingUserPrompt,
} from "@/lib/ai/prompts";
import {
  GradeRequestSchema,
  GradingAgentOutputSchema,
  GradeResponse,
} from "@/lib/ai/schemas";
import { parseModelJson } from "@/lib/ai/parseModelJson";
import { getProblem } from "@/lib/state/problemStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = GradeRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid grade request parameters", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { problemId, selectedStepIndex, explanation, confidence } = parseResult.data;
    const storedProblem = getProblem(problemId);

    if (!storedProblem) {
      return NextResponse.json(
        { error: "Problem not found or session expired. Please generate a new challenge." },
        { status: 404 }
      );
    }

    // Validate selectedStepIndex is within valid range of the actual problem steps
    if (selectedStepIndex >= storedProblem.steps.length) {
      return NextResponse.json(
        {
          error: "selectedStepIndex is out of range for this problem",
          selectedStepIndex,
          maxStepIndex: storedProblem.steps.length - 1,
        },
        { status: 400 }
      );
    }

    const actualFlawedStepIndex = storedProblem.steps.findIndex((s) => s.isFlawed);
    const actualFlawedStep = storedProblem.steps[actualFlawedStepIndex];
    const actualFlawExplanation =
      actualFlawedStep?.explanationOfFlaw || "This step contains the planted algebraic error.";

    // If student selected wrong step entirely
    const isStepCorrect = selectedStepIndex === actualFlawedStepIndex;

    let verdict: "correct" | "partially_correct" | "incorrect" = "incorrect";
    let feedback = "";
    let correctExplanation = `The actual error is in Step ${actualFlawedStepIndex + 1}: ${actualFlawExplanation}`;

    if (!isStepCorrect) {
      verdict = "incorrect";
      feedback = `You flagged Step ${selectedStepIndex + 1}, but that step is mathematically sound. The actual logical breakdown occurred in Step ${actualFlawedStepIndex + 1}.`;
    } else {
      // Step index matches! Now evaluate student's explanation via Grading Agent
      try {
        const prompt = createGradingUserPrompt({
          problemStatement: storedProblem.problemStatement,
          steps: storedProblem.steps,
          actualFlawedStepIndex,
          actualFlawExplanation,
          selectedStepIndex,
          studentExplanation: explanation,
        });

        const rawText = await callNimChatCompletion({
          messages: [
            { role: "system", content: GRADING_SYSTEM_PROMPT },
            { role: "user", content: prompt },
          ],
          temperature: 0.1,
          max_tokens: 350,
          enable_thinking: false,
        });

        const parsedGrade = parseModelJson(rawText);
        const validatedGrade = GradingAgentOutputSchema.safeParse(parsedGrade);

        if (validatedGrade.success) {
          verdict = validatedGrade.data.verdict;
          feedback = validatedGrade.data.feedback;
          correctExplanation = validatedGrade.data.correctExplanation || correctExplanation;
        } else {
          verdict = "correct";
          feedback = `Accurately spotted Step ${actualFlawedStepIndex + 1}! ${actualFlawExplanation}`;
        }
      } catch (aiErr) {
        console.error("[Grading Agent] AI call failed, using deterministic fallback:", (aiErr as Error).message);
        verdict = "correct";
        feedback = `Accurately flagged Step ${actualFlawedStepIndex + 1}! ${actualFlawExplanation}`;
      }
    }

    const masteryDelta = verdict === "correct" ? 1 : verdict === "partially_correct" ? 0 : -1;

    const responsePayload: GradeResponse = {
      verdict,
      actualFlawedStep: actualFlawedStepIndex,
      correctExplanation,
      feedback,
      conceptTag: storedProblem.conceptTag,
      masteryDelta,
      confidence,
    };

    return NextResponse.json(responsePayload);
  } catch (err) {
    console.error("[Grading Route] Unhandled exception:", (err as Error).message);
    return NextResponse.json(
      { error: "Internal grading error", details: (err as Error).message },
      { status: 500 }
    );
  }
}
