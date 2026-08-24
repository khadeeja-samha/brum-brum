/**
 * Robust helper to extract and parse JSON from LLM responses.
 * Handles:
 * - <think>...</think> reasoning traces emitted by Nemotron / reasoning models
 * - Markdown code blocks (```json ... ```)
 * - Raw JSON strings
 */
export function parseModelJson<T = unknown>(rawText: string): T {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Raw model output is empty or not a string");
  }

  // 1. Strip <think>...</think> or <thought>...</thought> tags if present
  let cleaned = rawText.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/gi, "").trim();

  // 2. Extract JSON from markdown code block if present
  const markdownJsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (markdownJsonMatch && markdownJsonMatch[1]) {
    cleaned = markdownJsonMatch[1].trim();
  } else {
    // 3. Fallback: find outermost '{' and '}' or '[' and ']'
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      cleaned = cleaned.substring(firstBrace, lastBrace + 1).trim();
    }
  }

  // 4. Try standard JSON parse
  try {
    return JSON.parse(cleaned) as T;
  } catch (initialErr) {
    // 5. Try fixing common JSON syntax errors like trailing commas before closing braces
    const sanitized = cleaned
      .replace(/,\s*([\]}])/g, "$1") // Remove trailing commas
      .replace(/[\u201C\u201D]/g, '"'); // Replace smart quotes

    try {
      return JSON.parse(sanitized) as T;
    } catch {
      throw new Error(`Failed to parse model JSON: ${(initialErr as Error).message}. Raw content snippet: ${cleaned.slice(0, 200)}...`);
    }
  }
}
