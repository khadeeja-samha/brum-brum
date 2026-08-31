import { NextRequest, NextResponse } from "next/server";
import { callNimChatCompletion } from "@/lib/ai/client";
import {
  GENERATOR_SYSTEM_PROMPT,
  createGeneratorUserPrompt,
  createGeneratorRetryPrompt,
} from "@/lib/ai/prompts";
import { GeneratedProblemSchema, StoredProblemRecord } from "@/lib/ai/schemas";
import { parseModelJson } from "@/lib/ai/parseModelJson";
import { getRandomSeedProblem } from "@/lib/fallback/seed-problems";
import { saveProblem, packStoredProblem, toClientSafeProblem } from "@/lib/state/problemStore";

export async function POST(req: NextRequest) {
  let targetConcept: string | undefined = undefined;
  try {
    const body = await req.json().catch(() => ({}));
    const topic = body.topic || "algebra_linear_equations";
    const subConcept = body.subConcept;
    const forceFallback = body.forceFallback === true;

    targetConcept = subConcept || topic;

    // Testability hook for R5 verification: force seed fallback
    if (forceFallback || !process.env.NVIDIA_NIM_API_KEY) {
      const seed = getRandomSeedProblem(targetConcept);
      const packedSeed = packStoredProblem(seed);
      return NextResponse.json(toClientSafeProblem(packedSeed));
    }

    let validated = null;
    let attempts = 0;
    const maxAttempts = 2; // Initial call + 1 retry

    const userPrompt = createGeneratorUserPrompt(topic, subConcept);
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: GENERATOR_SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ];

    while (attempts < maxAttempts && !validated) {
      attempts++;
      try {
        const rawText = await callNimChatCompletion({
          messages,
          temperature: 0.75, // Higher temperature for rich diversity and unique equations
          max_tokens: 1200,
          enable_thinking: false,
        });

        const rawProblem = parseModelJson(rawText);

        // Schema validation
        const parsed = GeneratedProblemSchema.safeParse(rawProblem);
        if (parsed.success) {
          // Self-check: exactly 1 flawed step (ARCHITECTURE.md §5)
          const flawedCount = parsed.data.steps.filter((s) => s.isFlawed).length;
          if (flawedCount === 1) {
            validated = parsed.data;
            break;
          } else {
            console.warn(`[Generator] Attempt ${attempts}: Invalid flawed step count (${flawedCount}). Retrying...`);
            messages.push({ role: "assistant", content: rawText });
            messages.push({
              role: "user",
              content: createGeneratorRetryPrompt(
                `Found ${flawedCount} flawed steps. Exactly 1 step must have isFlawed=true.`
              ),
            });
          }
        } else {
          console.warn(`[Generator] Attempt ${attempts}: Schema validation error:`, parsed.error.format());
          messages.push({ role: "assistant", content: rawText });
          messages.push({
            role: "user",
            content: createGeneratorRetryPrompt("JSON output did not match schema."),
          });
        }
      } catch (callErr) {
        console.error(`[Generator] NIM call error on attempt ${attempts}:`, (callErr as Error).message);
      }
    }

    // If validation succeeded from NIM
    if (validated) {
      const problemId = `gen-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const storedRecord: StoredProblemRecord = {
        problemId,
        problemStatement: validated.problemStatement,
        steps: validated.steps,
        conceptTag: validated.conceptTag,
        createdAt: Date.now(),
      };

      const packed = packStoredProblem(storedRecord);
      return NextResponse.json(toClientSafeProblem(packed));
    }

    // Safety Fallback (RULES.md R5)
    console.warn("[Generator] Live generation fallback engaged.");
    const fallbackProblem = getRandomSeedProblem(targetConcept);
    const packedFallback = packStoredProblem(fallbackProblem);
    return NextResponse.json(toClientSafeProblem(packedFallback));
  } catch (err) {
    console.error("[Generator] Unhandled route error, returning seed problem:", (err as Error).message);
    const fallbackProblem = getRandomSeedProblem(targetConcept);
    const packedFallback = packStoredProblem(fallbackProblem);
    return NextResponse.json(toClientSafeProblem(packedFallback));
  }
}
