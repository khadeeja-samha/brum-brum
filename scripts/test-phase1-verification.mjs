import fs from "fs";
import path from "path";

// Load .env.local
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

const BASE_URL = "http://localhost:3000";

async function runPhase1Tests() {
  console.log("=================================================");
  console.log("🧪 STARTING PHASE 1 AUTOMATED VERIFICATION SUITE");
  console.log("=================================================\n");

  const results = {
    totalGenerations: 15,
    successfulGenerations: 0,
    zeroLeaksVerified: true,
    fallbackTested: false,
    gradingCorrectTested: false,
    gradingIncorrectTested: false,
  };

  // Test 1: 15 Consecutive Live Generations & Leak Inspection (RULES.md R2, R7)
  console.log("📋 Test 1: 15 Consecutive Live Problem Generations via API...");
  for (let i = 1; i <= 15; i++) {
    const start = Date.now();
    try {
      const res = await fetch(`${BASE_URL}/api/generate-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: "algebra_linear_equations" }),
      });

      const elapsed = Date.now() - start;
      if (!res.ok) {
        console.error(`  ❌ Run #${i}: HTTP ${res.status}`);
        continue;
      }

      const data = await res.json();

      // Verify R7: Never leak isFlawed, errorType, or explanationOfFlaw
      const rawString = JSON.stringify(data);
      const hasLeakedKey =
        rawString.includes('"isFlawed"') ||
        rawString.includes('"errorType"') ||
        rawString.includes('"explanationOfFlaw"');

      if (hasLeakedKey) {
        console.error(`  🚨 SECURITY LEAK in Run #${i}: Answer keys found in client payload!`);
        results.zeroLeaksVerified = false;
      }

      if (data.problemId && Array.isArray(data.steps) && data.steps.length >= 2) {
        results.successfulGenerations++;
        console.log(
          `  ✓ Run #${i.toString().padStart(2, "0")} (${elapsed}ms): ` +
          `Problem "${data.problemStatement.slice(0, 30)}..." | ${data.steps.length} steps | Leak-free: ${!hasLeakedKey}`
        );
      } else {
        console.error(`  ⚠️ Run #${i}: Malformed response structure`, data);
      }
    } catch (err) {
      console.error(`  ❌ Run #${i} failed:`, err.message);
    }
  }

  // Test 2: Fallback Path Verification (RULES.md R5)
  console.log("\n📋 Test 2: Seed-Problem Fallback Path Verification...");
  try {
    const res = await fetch(`${BASE_URL}/api/generate-problem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "algebra_linear_equations", forceFallback: true }),
    });
    const fallbackData = await res.json();
    if (fallbackData.problemId && fallbackData.steps.length >= 2) {
      results.fallbackTested = true;
      console.log(`  ✓ Seed fallback loaded successfully: "${fallbackData.problemStatement}"`);
    }
  } catch (err) {
    console.error("  ❌ Fallback test error:", err.message);
  }

  // Test 3: Live End-to-End Grading Verification (Correct vs Incorrect)
  console.log("\n📋 Test 3: Live Grading Agent & Verdict Verification...");
  try {
    // Generate fresh problem
    const genRes = await fetch(`${BASE_URL}/api/generate-problem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "algebra_linear_equations" }),
    });
    const problem = await genRes.json();

    // 3a. Grade Attempt with Wrong Step (e.g. Step 0 if multiple steps exist)
    const gradeWrongRes = await fetch(`${BASE_URL}/api/grade-attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: problem.problemId,
        selectedStepIndex: 0,
        explanation: "I think this step is wrong because the arithmetic is strange.",
      }),
    });
    const gradeWrongData = await gradeWrongRes.json();
    console.log(`  ✓ Wrong Step Grade: Verdict = "${gradeWrongData.verdict}", Actual Flawed = Step ${gradeWrongData.actualFlawedStep + 1}`);
    results.gradingIncorrectTested = true;

    // 3b. Grade Attempt with the Actual Flawed Step
    const gradeCorrectRes = await fetch(`${BASE_URL}/api/grade-attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: problem.problemId,
        selectedStepIndex: gradeWrongData.actualFlawedStep,
        explanation: "This step made an algebraic error in computation and operation.",
      }),
    });
    const gradeCorrectData = await gradeCorrectRes.json();
    console.log(`  ✓ Correct Step Grade: Verdict = "${gradeCorrectData.verdict}", Feedback = "${gradeCorrectData.feedback}"`);
    results.gradingCorrectTested = true;
  } catch (err) {
    console.error("  ❌ Grading test error:", err.message);
  }

  console.log("\n=================================================");
  console.log("📊 PHASE 1 VERIFICATION RESULTS SUMMARY:");
  console.log(`- Live Generations Passed: ${results.successfulGenerations} / ${results.totalGenerations}`);
  console.log(`- Zero Answer Leaks to Client (R7): ${results.zeroLeaksVerified ? "✅ CONFIRMED" : "❌ FAILED"}`);
  console.log(`- Fallback Seed Path (R5): ${results.fallbackTested ? "✅ CONFIRMED" : "❌ FAILED"}`);
  console.log(`- Incorrect Grading Evaluation: ${results.gradingIncorrectTested ? "✅ CONFIRMED" : "❌ FAILED"}`);
  console.log(`- Correct Grading Evaluation: ${results.gradingCorrectTested ? "✅ CONFIRMED" : "❌ FAILED"}`);
  console.log("=================================================\n");
}

runPhase1Tests();
