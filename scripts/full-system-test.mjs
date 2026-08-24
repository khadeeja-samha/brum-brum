import fs from "fs";
import path from "path";

// Load environment variables
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

async function runComprehensiveTest() {
  console.log("=================================================");
  console.log("🧪 COGNITRACE FULL SYSTEM VERIFICATION SUITE");
  console.log("=================================================\n");

  const testReport = [];

  // TEST 1: Landing Page GET (200 OK & Content Check)
  try {
    const res = await fetch(`${BASE_URL}/`);
    const text = await res.text();
    const passed = res.ok && text.includes("CogniTrace") && !text.includes("NIM Nemotron-3");
    testReport.push({
      Suite: "UI Routing",
      Test: "Landing Page Render (/) [No raw model strings]",
      Status: passed ? "✅ PASS" : "❌ FAIL",
      Details: `HTTP ${res.status} | Text length: ${text.length} chars`,
    });
  } catch (err) {
    testReport.push({
      Suite: "UI Routing",
      Test: "Landing Page Render (/)",
      Status: "❌ FAIL",
      Details: err.message,
    });
  }

  // TEST 2: Challenge Page GET (200 OK)
  try {
    const res = await fetch(`${BASE_URL}/challenge/algebra_linear_equations`);
    const text = await res.text();
    const passed = res.ok && text.includes("CogniTrace Audit Session");
    testReport.push({
      Suite: "UI Routing",
      Test: "Challenge Page Load (/challenge/algebra_linear_equations)",
      Status: passed ? "✅ PASS" : "❌ FAIL",
      Details: `HTTP ${res.status}`,
    });
  } catch (err) {
    testReport.push({
      Suite: "UI Routing",
      Test: "Challenge Page Load",
      Status: "❌ FAIL",
      Details: err.message,
    });
  }

  // TEST 3: Problem Generation API (Live AI Call)
  let generatedProblem = null;
  try {
    const t0 = Date.now();
    const res = await fetch(`${BASE_URL}/api/generate-problem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "algebra_linear_equations" }),
    });
    const elapsed = Date.now() - t0;
    const data = await res.json();
    generatedProblem = data;

    const isStructureValid = data.problemId && Array.isArray(data.steps) && data.steps.length >= 2;
    const isLeakFree = !JSON.stringify(data).includes("isFlawed") && !JSON.stringify(data).includes("errorType");

    testReport.push({
      Suite: "AI Problem Generator",
      Test: "Live Generation + Zero Answer Leak (R7)",
      Status: res.ok && isStructureValid && isLeakFree ? "✅ PASS" : "❌ FAIL",
      Details: `Latency: ${elapsed}ms | Steps: ${data.steps?.length} | Target: "${data.problemStatement?.slice(0, 25)}..."`,
    });
  } catch (err) {
    testReport.push({
      Suite: "AI Problem Generator",
      Test: "Live Problem Generation",
      Status: "❌ FAIL",
      Details: err.message,
    });
  }

  // TEST 4: Seed Fallback Mode (R5 Safety Net)
  try {
    const res = await fetch(`${BASE_URL}/api/generate-problem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "algebra_linear_equations", forceFallback: true }),
    });
    const data = await res.json();
    const isStructureValid = data.problemId && Array.isArray(data.steps) && data.steps.length >= 2;
    const isLeakFree = !JSON.stringify(data).includes("isFlawed");

    testReport.push({
      Suite: "Demo Fallback Safety",
      Test: "Seed Fallback Generation (R5)",
      Status: res.ok && isStructureValid && isLeakFree ? "✅ PASS" : "❌ FAIL",
      Details: `Seed ID: ${data.problemId} | Concept: ${data.conceptTag}`,
    });
  } catch (err) {
    testReport.push({
      Suite: "Demo Fallback Safety",
      Test: "Seed Fallback Generation (R5)",
      Status: "❌ FAIL",
      Details: err.message,
    });
  }

  // TEST 5: Grading Agent — Incorrect Step Flag
  if (generatedProblem) {
    try {
      const res = await fetch(`${BASE_URL}/api/grade-attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: generatedProblem.problemId,
          selectedStepIndex: 0,
          explanation: "Testing false accusation on valid step.",
        }),
      });
      const data = await res.json();
      const passed = res.ok && data.verdict && typeof data.actualFlawedStep === "number";

      testReport.push({
        Suite: "AI Grading Agent",
        Test: "Grading: Step Selection Evaluation",
        Status: passed ? "✅ PASS" : "❌ FAIL",
        Details: `Verdict: ${data.verdict} | Actual Flaw: Step ${data.actualFlawedStep + 1} | Delta: ${data.masteryDelta}`,
      });

      // TEST 6: Grading Agent — Correct Step Flag + Explanation
      const res2 = await fetch(`${BASE_URL}/api/grade-attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: generatedProblem.problemId,
          selectedStepIndex: data.actualFlawedStep,
          explanation: "There is an arithmetic or sign violation in this specific step.",
        }),
      });
      const data2 = await res2.json();
      const passed2 = res2.ok && (data2.verdict === "correct" || data2.verdict === "partially_correct");

      testReport.push({
        Suite: "AI Grading Agent",
        Test: "Grading: Explanation Rationale Evaluation",
        Status: passed2 ? "✅ PASS" : "❌ FAIL",
        Details: `Verdict: ${data2.verdict} | Feedback: "${data2.feedback?.slice(0, 45)}..."`,
      });
    } catch (err) {
      testReport.push({
        Suite: "AI Grading Agent",
        Test: "Grading Agent End-to-End",
        Status: "❌ FAIL",
        Details: err.message,
      });
    }
  }

  // TEST 7: Input Validation & Error Handling (Unhappy Paths R9)
  try {
    const res = await fetch(`${BASE_URL}/api/grade-attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: "non-existent-id-9999",
        selectedStepIndex: 1,
        explanation: "Random text",
      }),
    });
    const passed = res.status === 404;
    testReport.push({
      Suite: "Unhappy Path Robustness",
      Test: "Missing/Expired Problem ID (R9)",
      Status: passed ? "✅ PASS" : "❌ FAIL",
      Details: `Correctly returned HTTP ${res.status}`,
    });
  } catch (err) {
    testReport.push({
      Suite: "Unhappy Path Robustness",
      Test: "Missing Problem ID",
      Status: "❌ FAIL",
      Details: err.message,
    });
  }

  console.table(testReport);
  console.log("\n=================================================");
  const allPassed = testReport.every((t) => t.Status.includes("PASS"));
  console.log(`FINAL RESULT: ${allPassed ? "🎉 ALL 7 SYSTEM TESTS PASSED" : "⚠️ SOME TESTS FAILED"}`);
  console.log("=================================================\n");
}

runComprehensiveTest();
