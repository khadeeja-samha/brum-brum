import OpenAI from "openai";
import fs from "fs";
import path from "path";

// Load .env.local manually
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || "";
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value.trim();
    }
  }
}

const apiKey = process.env.NVIDIA_NIM_API_KEY;
const nim = new OpenAI({
  apiKey,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

const modelName = process.env.NVIDIA_NIM_MODEL || "nvidia/nemotron-3-ultra-550b-a55b";

const testPrompt = `You are a diagnostic math problem generator for an active-verification learning app.
Generate a high school linear equation problem with step-by-step solution containing EXACTLY ONE planted logical error.
Output STRICT JSON:
{
  "problemStatement": "Solve for x: 3(x - 4) = 2x + 5",
  "steps": [
    { "stepIndex": 0, "text": "Distribute 3: 3x - 12 = 2x + 5", "isFlawed": false },
    { "stepIndex": 1, "text": "Subtract 2x from both sides: x - 12 = 5", "isFlawed": false },
    { "stepIndex": 2, "text": "Subtract 12 from both sides: x = -7", "isFlawed": true, "errorType": "sign_error" }
  ],
  "conceptTag": "linear_equations_sign_handling"
}`;

async function runDirectFetchBenchmark(name, bodyPayload) {
  console.log(`\n========================================`);
  console.log(`🚀 Testing: ${name}`);
  console.log(`Payload keys:`, Object.keys(bodyPayload));
  if (bodyPayload.chat_template_kwargs) {
    console.log(`chat_template_kwargs:`, JSON.stringify(bodyPayload.chat_template_kwargs));
  }
  
  const startTime = Date.now();
  try {
    const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(bodyPayload)
    });

    const latency = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ HTTP ${response.status}:`, JSON.stringify(data));
      return {
        name,
        latencyMs: latency,
        success: false,
        error: `HTTP ${response.status}: ${JSON.stringify(data.detail || data)}`,
      };
    }

    const content = data.choices?.[0]?.message?.content || "";
    console.log(`⏱️ Latency: ${latency} ms (${(latency / 1000).toFixed(2)}s)`);
    console.log(`📝 Output snippet (first 250 chars):`);
    console.log(content.slice(0, 250));
    
    let parsed = null;
    const thinkTagDetected = content.includes("<think>");
    const cleaned = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
    const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    const candidate = jsonMatch ? jsonMatch[1].trim() : cleaned;
    
    try {
      parsed = JSON.parse(candidate);
      console.log(`✅ JSON Valid: Yes | Steps count: ${parsed.steps?.length} | Flawed: ${parsed.steps?.filter(s => s.isFlawed)?.length}`);
    } catch (e) {
      console.log(`⚠️ JSON Parsing: FAILED (${e.message})`);
    }

    return {
      name,
      latencyMs: latency,
      success: true,
      thinkTagDetected,
      jsonValid: parsed !== null,
      errorCount: parsed?.steps?.filter(s => s.isFlawed)?.length,
    };
  } catch (err) {
    const latency = Date.now() - startTime;
    console.error(`❌ Error (${latency} ms):`, err.message);
    return {
      name,
      latencyMs: latency,
      success: false,
      error: err.message,
    };
  }
}

async function main() {
  console.log(`🧪 Starting Phase 0 Direct NIM Benchmark...`);
  
  const results = [];
  
  const basePayload = {
    model: modelName,
    messages: [
      { role: "system", content: "You are a precise JSON-only math reasoning engine." },
      { role: "user", content: testPrompt }
    ],
    temperature: 0.2,
    max_tokens: 1500,
  };

  // 1. Thinking OFF
  results.push(await runDirectFetchBenchmark("1. enable_thinking: false", {
    ...basePayload,
    chat_template_kwargs: { enable_thinking: false }
  }));

  // 2. Thinking Medium
  results.push(await runDirectFetchBenchmark("2. enable_thinking: true, medium_effort: true", {
    ...basePayload,
    chat_template_kwargs: { enable_thinking: true, medium_effort: true }
  }));

  // 3. Thinking Full
  results.push(await runDirectFetchBenchmark("3. enable_thinking: true (Full)", {
    ...basePayload,
    chat_template_kwargs: { enable_thinking: true }
  }));

  // 4. Default (no kwargs)
  results.push(await runDirectFetchBenchmark("4. Default (no kwargs)", {
    ...basePayload
  }));

  // 5. Grading Agent Simulation (Thinking OFF, max_tokens: 400)
  results.push(await runDirectFetchBenchmark("5. Grading Agent Sim (Thinking OFF, max_tokens 400)", {
    model: modelName,
    messages: [
      { role: "system", content: "You are an exact diagnostic grading engine. Return JSON: { verdict: 'correct' | 'incorrect' | 'partially_correct', explanation: '...' }" },
      { role: "user", content: "Problem: Solve 3(x-4)=2x+5. Flawed Step 2: x-12=5 -> x=-7. Student selected Step 2, explanation: 'They subtracted 12 instead of adding 12 to both sides.'" }
    ],
    temperature: 0.1,
    max_tokens: 400,
    chat_template_kwargs: { enable_thinking: false }
  }));

  console.log(`\n========================================`);
  console.log(`📋 BENCHMARK SUMMARY TABLE:`);
  console.table(results);
}

main();
