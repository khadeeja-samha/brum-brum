/**
 * Phase 5c Reasoning-Mode Benchmark Suite for Verifier Agent
 * Measures solution accuracy and latency across 11 test problems in Algebra, Physics, Chemistry, and Code.
 * Compares 3 configurations:
 * 1. Thinking OFF (enable_thinking: false)
 * 2. Thinking Medium (enable_thinking: true, medium_effort: true)
 * 3. Thinking Full (enable_thinking: true)
 */

import fs from "fs";
import path from "path";

// Read .env.local
const envPath = path.resolve(".env.local");
let apiKey = process.env.NVIDIA_NIM_API_KEY;
let model = process.env.NVIDIA_NIM_MODEL || "nvidia/nemotron-3-ultra-550b-a55b";

if (!apiKey && fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("NVIDIA_NIM_API_KEY=")) {
      apiKey = trimmed.substring("NVIDIA_NIM_API_KEY=".length).replace(/^["']|["']$/g, "");
    } else if (trimmed.startsWith("NVIDIA_NIM_MODEL=")) {
      model = trimmed.substring("NVIDIA_NIM_MODEL=".length).replace(/^["']|["']$/g, "");
    }
  }
}

if (!apiKey) {
  console.error("❌ Missing NVIDIA_NIM_API_KEY in .env.local");
  process.exit(1);
}

function parseModelJson(raw) {
  if (!raw) return null;
  // Strip <think> tags
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  const jsonMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, cleaned];
  cleaned = (jsonMatch[1] || cleaned).trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try {
        return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

const VERIFIER_SYSTEM_PROMPT = `You are the Expert Diagnostic Verifier Agent for CogniTrace.
Your mission is to independently re-solve the target problem and rigorously check a student's confirmed solution step-by-step against mathematical, physical, chemical, and algorithmic ground truth.

CRITICAL EVALUATION RULES:
1. First, independently solve the initial problem statement from scratch to establish unassailable ground truth.
2. Examine each student step in strict chronological order (Step 1, Step 2, Step 3, etc.).
3. Check if every equation transformation, algebraic expansion, arithmetic calculation, unit conversion, chemical balance, and logical operation is 100% sound.
4. If ALL steps are mathematically, scientifically, and logically correct:
   - "verificationStatus": "fully_correct"
   - "flawedStepIndex": null
   - "errorType": null
   - "explanationOfFlaw": null
5. If one or more steps contain a flaw or mistake:
   - "verificationStatus": "has_error"
   - Identify the FIRST chronological step where an error occurred. Note: If a problem has multiple subsequent errors caused by or following an initial mistake, you MUST flag ONLY the FIRST chronological error.
   - "flawedStepIndex": the 0-based integer index of the FIRST flawed step (0 for Step 1, 1 for Step 2, etc.).
   - "errorType": a concise archetype tag.
   - "explanationOfFlaw": a clear, pedagogical 1-2 sentence explanation of exactly what error was made in that designated step and why it violates correct principles.
6. The "flawedStepIndex" MUST be a valid 0-based index between 0 and (total_steps - 1).

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:
{
  "verificationStatus": "fully_correct" | "has_error",
  "flawedStepIndex": 0 | null,
  "errorType": "string or null",
  "explanationOfFlaw": "string or null",
  "verifiedSolution": "Brief correct step-by-step working"
}`;

function createVerifierUserPrompt(params) {
  return `DOMAIN: ${params.domain.toUpperCase()}
TARGET PROBLEM STATEMENT:
${params.problemStatement}

STUDENT CONFIRMED STEPS (${params.steps.length} steps):
${params.steps.map((s) => `[Step ${s.stepIndex + 1} (index ${s.stepIndex})] ${s.text}`).join("\n")}

Independently solve the problem, check each step chronologically, identify the first error (if any) or certify the work as fully correct. Return STRICT JSON only.`;
}

const BENCHMARK_PROBLEMS = [
  {
    name: "1. Algebra: Distributive Addition Slip",
    domain: "algebra",
    problemStatement: "Solve for x: 3(2x - 4) = 18",
    steps: [
      { stepIndex: 0, text: "6x - 12 = 18" },
      { stepIndex: 1, text: "6x = 18 - 12 = 6" }, // FLAW: should be 18 + 12 = 30
      { stepIndex: 2, text: "x = 1" },
    ],
    expectedStatus: "has_error",
    expectedFlawedStep: 1,
  },
  {
    name: "2. Algebra: Linear Isolation (Fully Correct)",
    domain: "algebra",
    problemStatement: "Solve for x: 5x - 7 = 3x + 9",
    steps: [
      { stepIndex: 0, text: "5x - 3x = 9 + 7" },
      { stepIndex: 1, text: "2x = 16" },
      { stepIndex: 2, text: "x = 8" },
    ],
    expectedStatus: "fully_correct",
    expectedFlawedStep: null,
  },
  {
    name: "3. Algebra: Negative Sign Distribution",
    domain: "algebra",
    problemStatement: "Solve for x: -4(x - 3) = 20",
    steps: [
      { stepIndex: 0, text: "-4x - 12 = 20" }, // FLAW: -4 * -3 = +12
      { stepIndex: 1, text: "-4x = 32" },
      { stepIndex: 2, text: "x = -8" },
    ],
    expectedStatus: "has_error",
    expectedFlawedStep: 0,
  },
  {
    name: "4. Physics: Kinematics Exponent Square Slip",
    domain: "physics",
    problemStatement: "A car starts from rest (v_i = 0) and accelerates at a = 9.8 m/s^2 for t = 3s. Find displacement d. Take d = v_i*t + 0.5*a*t^2.",
    steps: [
      { stepIndex: 0, text: "d = (0)(3) + 0.5 * 9.8 * (3)^2" },
      { stepIndex: 1, text: "d = 0 + 0.5 * 9.8 * 6" }, // FLAW: 3^2 = 9, not 6
      { stepIndex: 2, text: "d = 29.4 m" },
    ],
    expectedStatus: "has_error",
    expectedFlawedStep: 1,
  },
  {
    name: "5. Physics: Potential Energy (Fully Correct)",
    domain: "physics",
    problemStatement: "Calculate the gravitational potential energy of a m = 2.0 kg mass lifted h = 10.0 m. Take upward as positive and g = 9.8 m/s^2.",
    steps: [
      { stepIndex: 0, text: "PE = m * g * h" },
      { stepIndex: 1, text: "PE = (2.0 kg) * (9.8 m/s^2) * (10.0 m)" },
      { stepIndex: 2, text: "PE = 196.0 J" },
    ],
    expectedStatus: "fully_correct",
    expectedFlawedStep: null,
  },
  {
    name: "6. Physics: Free Fall Coordinate Inversion",
    domain: "physics",
    problemStatement: "A projectile is launched upward with initial velocity v_i = 20.0 m/s. Take upward as positive and g = 9.8 m/s^2. Find velocity at t = 2.0s.",
    steps: [
      { stepIndex: 0, text: "v_f = v_i + a * t with upward positive" },
      { stepIndex: 1, text: "v_f = 20.0 + (9.8)(2.0)" }, // FLAW: a = -g = -9.8
      { stepIndex: 2, text: "v_f = 39.6 m/s" },
    ],
    expectedStatus: "has_error",
    expectedFlawedStep: 1,
  },
  {
    name: "7. Chemistry: Propane Balancing Diatomic Divisor Slip",
    domain: "chemistry",
    problemStatement: "Balance the combustion reaction: C3H8 + O2 -> CO2 + H2O",
    steps: [
      { stepIndex: 0, text: "Balance Carbon: C3H8 + O2 -> 3CO2 + H2O" },
      { stepIndex: 1, text: "Balance Hydrogen: C3H8 + O2 -> 3CO2 + 4H2O" },
      { stepIndex: 2, text: "Count Oxygen on right: 3(2) + 4(1) = 10 atoms. Therefore O2 coefficient is 10: C3H8 + 10O2 -> 3CO2 + 4H2O" }, // FLAW: 10 O atoms = 5 O2
      { stepIndex: 3, text: "Final balanced equation: C3H8 + 10O2 -> 3CO2 + 4H2O" },
    ],
    expectedStatus: "has_error",
    expectedFlawedStep: 2,
  },
  {
    name: "8. Chemistry: Molar Mass Calculation (Fully Correct)",
    domain: "chemistry",
    problemStatement: "Find the amount of moles in 88.02 g of CO2. Use atomic masses: C = 12.01 g/mol, O = 16.00 g/mol.",
    steps: [
      { stepIndex: 0, text: "Molar mass of CO2 = 12.01 + 2(16.00) = 44.01 g/mol" },
      { stepIndex: 1, text: "Moles n = mass / molar mass = 88.02 g / 44.01 g/mol" },
      { stepIndex: 2, text: "n = 2.00 mol" },
    ],
    expectedStatus: "fully_correct",
    expectedFlawedStep: null,
  },
  {
    name: "9. Code: Python Range Loop Bound Off-By-One",
    domain: "code",
    problemStatement: "def sum_array(arr): calculate sum of all elements in list arr",
    steps: [
      { stepIndex: 0, text: "total = 0" },
      { stepIndex: 1, text: "for i in range(len(arr) + 1):" }, // FLAW: range(len(arr) + 1) raises IndexError
      { stepIndex: 2, text: "    total += arr[i]" },
      { stepIndex: 3, text: "return total" },
    ],
    expectedStatus: "has_error",
    expectedFlawedStep: 1,
  },
  {
    name: "10. Code: Python Mutable Default Argument Binding",
    domain: "code",
    problemStatement: "def record_event(name, log_list=[]): append name to log_list and return log_list",
    steps: [
      { stepIndex: 0, text: "def record_event(name, log_list=[]):" }, // FLAW: mutable default list argument persists between invocations
      { stepIndex: 1, text: "    log_list.append(name)" },
      { stepIndex: 2, text: "    return log_list" },
    ],
    expectedStatus: "has_error",
    expectedFlawedStep: 0,
  },
  {
    name: "11. Code: JavaScript Closure State (Fully Correct)",
    domain: "code",
    problemStatement: "function createCounter(): returns increment function with encapsulated state",
    steps: [
      { stepIndex: 0, text: "let count = 0;" },
      { stepIndex: 1, text: "return function increment() { count += 1; return count; };" },
    ],
    expectedStatus: "fully_correct",
    expectedFlawedStep: null,
  },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function runModelCallWithRetry(kwargs, userPrompt, maxRetries = 3) {
  let attempt = 0;
  while (attempt < maxRetries) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);
    const startTime = Date.now();

    try {
      const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: VERIFIER_SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 1500,
          chat_template_kwargs: kwargs,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;

      if (!res.ok) {
        const errText = await res.text();
        if ((res.status === 503 || res.status === 429) && attempt < maxRetries) {
          console.log(`    ⚠️ Transient ${res.status} overload, backing off for 1500ms (attempt ${attempt}/${maxRetries})...`);
          await sleep(1500 * attempt);
          continue;
        }
        return { ok: false, error: `HTTP ${res.status}: ${errText}`, latency };
      }

      const data = await res.json();
      const rawContent = data.choices?.[0]?.message?.content || "";
      const parsed = parseModelJson(rawContent);

      return { ok: true, latency, parsed, rawContent };
    } catch (err) {
      clearTimeout(timeoutId);
      const latency = Date.now() - startTime;
      if (attempt < maxRetries) {
        await sleep(1000 * attempt);
        continue;
      }
      return { ok: false, error: err.message, latency };
    }
  }
}

async function benchmarkMode(name, kwargs) {
  console.log(`\n======================================================`);
  console.log(`🔬 BENCHMARKING MODE: ${name}`);
  console.log(`Kwargs: ${JSON.stringify(kwargs)}`);
  console.log(`======================================================`);

  let correctCount = 0;
  let totalLatency = 0;
  let validJsonCount = 0;
  const results = [];

  for (const prob of BENCHMARK_PROBLEMS) {
    const prompt = createVerifierUserPrompt({
      problemStatement: prob.problemStatement,
      steps: prob.steps,
      domain: prob.domain,
    });

    // small pacing delay between requests to avoid server overloading
    await sleep(350);

    const res = await runModelCallWithRetry(kwargs, prompt);
    totalLatency += res.latency;

    if (!res.ok) {
      console.log(`  ❌ ${prob.name}: API Error (${res.error}) [${res.latency}ms]`);
      results.push({ prob: prob.name, status: "ERROR", latency: res.latency });
      continue;
    }

    if (!res.parsed) {
      console.log(`  ❌ ${prob.name}: JSON Parse Error [${res.latency}ms]`);
      results.push({ prob: prob.name, status: "INVALID_JSON", latency: res.latency });
      continue;
    }

    validJsonCount++;
    const statusMatch = res.parsed.verificationStatus === prob.expectedStatus;
    const stepMatch = prob.expectedStatus === "fully_correct" 
      ? (res.parsed.flawedStepIndex === null || res.parsed.flawedStepIndex === undefined)
      : (res.parsed.flawedStepIndex === prob.expectedFlawedStep);

    const isAccurate = statusMatch && stepMatch;
    if (isAccurate) {
      correctCount++;
      console.log(`  ✅ ${prob.name}: ACCURATE (status: ${res.parsed.verificationStatus}, step: ${res.parsed.flawedStepIndex}) [${res.latency}ms]`);
    } else {
      console.log(`  ⚠️ ${prob.name}: MISMATCH (got status=${res.parsed.verificationStatus}, step=${res.parsed.flawedStepIndex} | expected status=${prob.expectedStatus}, step=${prob.expectedFlawedStep}) [${res.latency}ms]`);
    }

    results.push({
      prob: prob.name,
      isAccurate,
      status: res.parsed.verificationStatus,
      step: res.parsed.flawedStepIndex,
      latency: res.latency,
    });
  }

  const avgLatency = Math.round(totalLatency / BENCHMARK_PROBLEMS.length);
  const accuracyPct = Math.round((correctCount / BENCHMARK_PROBLEMS.length) * 100);

  console.log(`\n--- SUMMARY: ${name} ---`);
  console.log(`Accuracy: ${correctCount}/${BENCHMARK_PROBLEMS.length} (${accuracyPct}%)`);
  console.log(`Valid JSON: ${validJsonCount}/${BENCHMARK_PROBLEMS.length}`);
  console.log(`Average Latency: ${avgLatency}ms`);

  return { name, accuracy: `${correctCount}/${BENCHMARK_PROBLEMS.length}`, accuracyPct: `${accuracyPct}%`, avgLatency: `${avgLatency}ms`, validJsonCount };
}

async function main() {
  console.log("🚀 STARTING 3-WAY VERIFIER AGENT REASONING BENCHMARK");
  console.log(`Total Problems: ${BENCHMARK_PROBLEMS.length} across 4 Domains (Algebra, Physics, Chemistry, Code)\n`);

  const summary = [];

  // Mode 1: Thinking OFF
  const resOff = await benchmarkMode("1. Thinking OFF", { enable_thinking: false });
  summary.push(resOff);

  // Mode 2: Medium Effort
  const resMed = await benchmarkMode("2. Thinking Medium", { enable_thinking: true, medium_effort: true });
  summary.push(resMed);

  // Mode 3: Full Thinking
  const resFull = await benchmarkMode("3. Thinking Full", { enable_thinking: true });
  summary.push(resFull);

  console.log(`\n======================================================`);
  console.log(`📊 FINAL BENCHMARK COMPARISON TABLE:`);
  console.table(summary);
  console.log(`======================================================`);
}

main().catch((err) => {
  console.error("Benchmark error:", err);
  process.exit(1);
});
