import OpenAI from "openai";

// NVIDIA NIM OpenAI-compatible client setup (ARCHITECTURE.md §4a)
export const nim = new OpenAI({
  apiKey: process.env.NVIDIA_NIM_API_KEY || "",
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export const NIM_MODEL = process.env.NVIDIA_NIM_MODEL || "nvidia/nemotron-3-ultra-550b-a55b";

export interface CallNimOptions {
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  max_tokens?: number;
  enable_thinking?: boolean;
  model?: string;
  timeoutMs?: number;
}

/**
 * Direct HTTP caller with explicit timeout and thinking-mode controls
 */
export async function callNimChatCompletion(options: CallNimOptions): Promise<string> {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) throw new Error("Missing NVIDIA_NIM_API_KEY in environment");

  const payload = {
    model: options.model || NIM_MODEL,
    messages: options.messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.max_tokens ?? 1500,
    chat_template_kwargs: { enable_thinking: options.enable_thinking ?? false },
  };

  const timeoutMs = options.timeoutMs ?? 7000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`NVIDIA NIM API error ${res.status}: ${errText}`);
    }

    const json = await res.json();
    return json.choices?.[0]?.message?.content || "";
  } catch (err) {
    clearTimeout(timeoutId);
    if ((err as Error).name === "AbortError") {
      throw new Error(`NVIDIA NIM API call timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
}
