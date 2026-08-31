import { getRandomSeedProblem } from "../lib/fallback/seed-problems.js";

async function testStatelessStore() {
  console.log("=== Testing Stateless Problem Recovery ===");

  // Dynamically import the compiled or TS module via node
  const { packStoredProblem, getProblem, toClientSafeProblem } = await import("../lib/state/problemStore.ts");

  // 1. Create a problem
  const seed = getRandomSeedProblem("algebra_linear_equations");
  const packed = packStoredProblem(seed);
  const clientSafe = toClientSafeProblem(packed);

  console.log("Client Problem ID:", clientSafe.problemId);

  // 2. Simulate complete memory wipe (serverless new lambda cold start)
  if (global.__PROBLEM_STORE__) {
    global.__PROBLEM_STORE__.clear();
    console.log("Simulated serverless cold start: In-memory store wiped (size = 0)");
  }

  // 3. Test getProblem on the wiped instance
  const recovered = getProblem(clientSafe.problemId);
  if (!recovered) {
    throw new Error("FAIL: Problem could not be recovered on cold instance!");
  }

  console.log("✅ Recovered problem statement:", recovered.problemStatement);
  console.log("✅ Recovered steps count:", recovered.steps.length);
  const flawedStep = recovered.steps.find(s => s.isFlawed);
  console.log("✅ Recovered flawed step index:", flawedStep?.stepIndex);
  console.log("✅ Recovered explanation:", flawedStep?.explanationOfFlaw);

  console.log("\nALL STATELESS RECOVERY CHECKS PASSED 100%!");
}

testStatelessStore().catch(console.error);
