import { NextRequest, NextResponse } from "next/server";
import {
  StructureWorkRequestSchema,
  StructuredWorkSchema,
  StructuredWork,
} from "@/lib/ai/schemas";
import {
  STRUCTURE_WORK_SYSTEM_PROMPT,
  createStructureWorkUserPrompt,
} from "@/lib/ai/prompts";
import { callNimChatCompletion } from "@/lib/ai/client";
import { parseModelJson } from "@/lib/ai/parseModelJson";

// Fallback heuristic structuring parser for offline resilience & sample presets
function fallbackStructureWork(rawText: string, suggestedDomain?: string, workId?: string): StructuredWork {
  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let problemStatement = "Solve the given equation";
  const steps: Array<{ stepIndex: number; text: string }> = [];

  let stepIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line is problem statement
    if (i === 0 && (line.toLowerCase().startsWith("problem:") || line.toLowerCase().startsWith("solve:") || line.toLowerCase().startsWith("drop:") || line.toLowerCase().startsWith("balance:"))) {
      problemStatement = line.replace(/^(problem|solve|drop|balance):\s*/i, "").trim();
    } else if (line.match(/^step\s*\d+[:.]?\s*/i)) {
      const cleanStep = line.replace(/^step\s*\d+[:.]?\s*/i, "").trim();
      steps.push({ stepIndex: stepIdx++, text: cleanStep });
    } else if (i === 0 && !line.toLowerCase().includes("step")) {
      problemStatement = line;
    } else {
      steps.push({ stepIndex: stepIdx++, text: line });
    }
  }

  if (steps.length === 0) {
    steps.push({ stepIndex: 0, text: lines[0] || "1 = 1" });
  }

  // Detect domain
  let domain: "algebra" | "physics" | "chemistry" | "code" = (suggestedDomain as any) || "algebra";
  const lower = rawText.toLowerCase();
  if (lower.includes("->") || lower.includes("mol") || lower.includes("co2") || lower.includes("h2o")) {
    domain = "chemistry";
  } else if (lower.includes("m/s") || lower.includes("g = 9.8") || lower.includes("v_i") || lower.includes("kinematics")) {
    domain = "physics";
  } else if (lower.includes("def ") || lower.includes("return") || lower.includes("function") || lower.includes("console.log")) {
    domain = "code";
  }

  return {
    problemStatement,
    steps,
    domain,
    conceptTag: `${domain}_self_audit`,
    workId: workId || `work-${Date.now()}`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parseResult = StructureWorkRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid structuring request", details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { rawText, suggestedDomain, workId } = parseResult.data;

    // If NIM API key is configured, call Nemotron 3 Ultra
    const apiKey = process.env.NVIDIA_NIM_API_KEY;

    if (apiKey && apiKey.length > 0 && !apiKey.includes("dummy")) {
      try {
        const userPrompt = createStructureWorkUserPrompt(rawText, suggestedDomain);
        const rawResponse = await callNimChatCompletion({
          messages: [
            { role: "system", content: STRUCTURE_WORK_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 1000,
          enable_thinking: false,
          timeoutMs: 6000,
        });

        const parsedJson = parseModelJson(rawResponse);
        const validated = StructuredWorkSchema.safeParse(parsedJson);

        if (validated.success) {
          return NextResponse.json({
            ...validated.data,
            workId: workId || `work-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          });
        } else {
          console.warn("[StructureWork] NIM output schema validation mismatch, falling back to heuristic:", validated.error.format());
        }
      } catch (nimErr) {
        console.warn("[StructureWork] NIM call error or timeout, falling back to heuristic:", (nimErr as Error).message);
      }
    }

    // Fallback heuristic structuring
    const structured = fallbackStructureWork(rawText, suggestedDomain, workId);
    return NextResponse.json(structured);
  } catch (err) {
    console.error("[StructureWork] Unhandled error:", err);
    return NextResponse.json(
      { error: "Internal server error during work structuring" },
      { status: 500 }
    );
  }
}
