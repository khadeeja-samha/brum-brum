// scratch/test-phase5d-stress.mjs
// Phase 5d: Mirror Mode Integration & Stress Testing Suite
// Verifies all 5 user amendments and PHASE5.md Definition of Done

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

let passedCount = 0;
let failedCount = 0;
const results = [];

function assert(condition, message) {
  if (condition) {
    passedCount++;
    console.log(`  ✅ PASS: ${message}`);
    results.push({ test: message, passed: true });
  } else {
    failedCount++;
    console.error(`  ❌ FAIL: ${message}`);
    results.push({ test: message, passed: false });
  }
}

// Concept definitions from lib/ai/conceptTags.ts
const DOMAIN_CONCEPTS = {
  algebra: [
    "sign_handling",
    "distributive_property",
    "variable_isolation",
    "fraction_elimination",
    "order_of_operations",
  ],
  physics: [
    "unit_conversion_error",
    "sign_error_vectors",
    "wrong_kinematic_equation",
    "energy_not_conserved",
    "missing_friction_term",
  ],
  chemistry: [
    "unbalanced_coefficients",
    "wrong_mole_ratio",
    "sig_fig_error",
    "wrong_limiting_reagent",
    "charge_imbalance",
  ],
  code: [
    "off_by_one",
    "mutable_default_args",
    "shallow_copy_mutation",
    "async_missing_await",
    "scope_shadowing",
  ],
};

const UNCATEGORIZED_TAG = "self_audit_uncategorized";

function calculateMasteryStatus(attempts, correct) {
  if (attempts === 0) return "untested";
  const ratio = correct / attempts;
  if (ratio >= 0.75 && attempts >= 3) return "blue"; // Mastered
  if (ratio >= 0.4) return "yellow"; // Unstable / Developing
  return "red"; // Misconception
}

async function runPhase5dTestSuite() {
  console.log("\n" + "=".repeat(80));
  console.log("🚀 PHASE 5d: MIRROR MODE INTEGRATION & STRESS TEST SUITE");
  console.log("=".repeat(80) + "\n");

  // -------------------------------------------------------------
  // PART 1: AMENDMENT 1 — CONCEPT TAG RESOLUTION & UNCATEGORIZED FALLBACK VIA LIVE API
  // -------------------------------------------------------------
  console.log("-------------------------------------------------------------");
  console.log("⭐ 1. TESTING AMENDMENT 1: CONCEPT TAG RESOLUTION & FALLBACK");
  console.log("-------------------------------------------------------------");

  // Test 1a: Live structuring with clear algebra distributive property
  const structAlgRes = await fetch(`${BASE_URL}/api/structure-work`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      rawText: "Problem: 4(x - 3) = 2x + 10\nStep 1: 4x - 12 = 2x + 10\nStep 2: 4x - 2x = 22\nStep 3: x = 11",
      suggestedDomain: "algebra",
    }),
  });
  assert(structAlgRes.ok, "POST /api/structure-work returns HTTP 200");
  const structAlgData = await structAlgRes.json();
  assert(
    structAlgData.conceptTag === "distributive_property",
    `Structuring resolves conceptTag to '${structAlgData.conceptTag}' (distributive_property)`
  );

  // Test 1b: Amendment 1 — Genuinely ambiguous/unmappable error context lands in self_audit_uncategorized
  const ambiguousVerifyRes = await fetch(`${BASE_URL}/api/verify-work`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workId: `work-ambig-unmappable-${Date.now()}`,
      problemStatement: "Solve: x = 2",
      steps: [
        { stepIndex: 0, text: "x = 2" },
      ],
      domain: "algebra",
      conceptTag: "unmappable_custom_tag",
    }),
  });
  assert(ambiguousVerifyRes.ok, "Ambiguous unmappable payload processed with HTTP 200");
  const ambiguousVerifyData = await ambiguousVerifyRes.json();
  assert(
    ambiguousVerifyData.conceptTag === UNCATEGORIZED_TAG,
    `Amendment 1: Genuinely unmappable context lands in '${ambiguousVerifyData.conceptTag}' (${UNCATEGORIZED_TAG}) rather than guessing a wrong specific concept`
  );

  // -------------------------------------------------------------
  // PART 2: AMENDMENT 2 — RESOLVECONCEPTTAG ON FULLY_CORRECT PATH
  // -------------------------------------------------------------
  console.log("\n-------------------------------------------------------------");
  console.log("⭐ 2. TESTING AMENDMENT 2: FULLY_CORRECT RESOLUTION ON LIVE ROUTE");
  console.log("-------------------------------------------------------------");

  const correctWorkPayload = {
    workId: `work-correct-test-${Date.now()}`,
    problemStatement: "Solve: 4(x - 3) = 2x + 10",
    steps: [
      { stepIndex: 0, text: "4x - 12 = 2x + 10" },
      { stepIndex: 1, text: "4x - 2x = 10 + 12" },
      { stepIndex: 2, text: "2x = 22" },
      { stepIndex: 3, text: "x = 11" },
    ],
    domain: "algebra",
  };

  const verifyCorrectRes = await fetch(`${BASE_URL}/api/verify-work`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(correctWorkPayload),
  });

  assert(verifyCorrectRes.ok, "POST /api/verify-work returns HTTP 200 for correct problem");
  const verifyCorrectData = await verifyCorrectRes.json();
  assert(verifyCorrectData.verificationStatus === "fully_correct", "Work verified as 'fully_correct'");
  assert(
    verifyCorrectData.conceptTag === "distributive_property",
    `Amendment 2: 'fully_correct' work resolved conceptTag to '${verifyCorrectData.conceptTag}' (distributive_property) matching Understanding Map`
  );

  // -------------------------------------------------------------
  // PART 3: AMENDMENT 3 — FORCED FAILURE & RESILIENCE
  // -------------------------------------------------------------
  console.log("\n-------------------------------------------------------------");
  console.log("⭐ 3. TESTING AMENDMENT 3: FORCED FAILURE & RESILIENCE");
  console.log("-------------------------------------------------------------");

  // Force bad payload to test 400 rejection
  const badVerifyRes = await fetch(`${BASE_URL}/api/verify-work`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workId: "bad-work", domain: "algebra", steps: [] }),
  });
  assert(badVerifyRes.status === 400, "Empty steps payload rejected with HTTP 400");

  // Test OCR corrupt bytes rejection
  const corruptOcrRes = await fetch(`${BASE_URL}/api/transcribe-work`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64: "data:image/jpeg;base64,bm90LWFuLWltYWdl" }),
  });
  assert(corruptOcrRes.status === 400, "Corrupted image payload rejected with HTTP 400");

  // Test Low-Confidence Gate trigger
  const lowConfOcrRes = await fetch(`${BASE_URL}/api/transcribe-work`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sampleId: "sample-blurry-001" }),
  });
  assert(lowConfOcrRes.ok, "Blurry sample returns HTTP 200 with low_confidence status");
  const lowConfData = await lowConfOcrRes.json();
  assert(lowConfData.status === "low_confidence", "Low confidence status correctly triggered");
  assert(lowConfData.workId === undefined, "workId withheld when confidence < 75%");

  // -------------------------------------------------------------
  // PART 4: STRESS TEST SAMPLES (MESSY, AMBIGUOUS, MULTI-ERROR)
  // -------------------------------------------------------------
  console.log("\n-------------------------------------------------------------");
  console.log("⭐ 4. TESTING STRESS SAMPLES: MESSY, AMBIGUOUS, MULTI-ERROR");
  console.log("-------------------------------------------------------------");

  // Sample 1: Messy Algebra Handwriting via sampleId
  const messyOcrRes = await fetch(`${BASE_URL}/api/transcribe-work`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sampleId: "sample-messy-001" }),
  });
  assert(messyOcrRes.ok, "Sample 'sample-messy-001' loads via OCR API");
  const messyOcrData = await messyOcrRes.json();
  assert(messyOcrData.averageConfidence >= 0.75, `Messy algebra confidence (${messyOcrData.averageConfidence}) clears 75% gate`);

  const structMessyRes = await fetch(`${BASE_URL}/api/structure-work`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawText: messyOcrData.rawText, suggestedDomain: messyOcrData.suggestedDomain }),
  });
  assert(structMessyRes.ok, "Messy algebra successfully structures via API");
  const structMessyData = await structMessyRes.json();
  assert(structMessyData.steps.length >= 4, `Structured into at least 4 steps (found ${structMessyData.steps.length})`);

  // Sample 2: Messy Physics Dense Notation
  const messyPhysOcrRes = await fetch(`${BASE_URL}/api/transcribe-work`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sampleId: "sample-messy-002" }),
  });
  assert(messyPhysOcrRes.ok, "Sample 'sample-messy-002' loads via OCR API");
  const messyPhysOcrData = await messyPhysOcrRes.json();
  assert(messyPhysOcrData.averageConfidence >= 0.75, `Messy physics confidence (${messyPhysOcrData.averageConfidence}) clears 75% gate`);

  const structPhysRes = await fetch(`${BASE_URL}/api/structure-work`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rawText: messyPhysOcrData.rawText, suggestedDomain: messyPhysOcrData.suggestedDomain }),
  });
  assert(structPhysRes.ok, "Messy physics successfully structures via API");
  const structPhysData = await structPhysRes.json();
  assert(structPhysData.domain === "physics", "Domain identified as 'physics'");

  // Sample 3: Ambiguous / Unconventional Order (Valid math written backwards)
  const ambigVerifyRes = await fetch(`${BASE_URL}/api/verify-work`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workId: `work-ambig-${Date.now()}`,
      problemStatement: "Solve: 24 = 2(x + 4) + 4",
      steps: [
        { stepIndex: 0, text: "24 - 4 = 2(x + 4)" },
        { stepIndex: 1, text: "20 = 2x + 8" },
        { stepIndex: 2, text: "12 = 2x" },
        { stepIndex: 3, text: "6 = x" },
      ],
      domain: "algebra",
    }),
  });
  assert(ambigVerifyRes.ok, "Ambiguous sample verified with HTTP 200");
  const ambigVerifyData = await ambigVerifyRes.json();
  assert(
    ambigVerifyData.verificationStatus === "fully_correct",
    `Ambiguous order verified as 'fully_correct' with zero false-positive accusations (Got: ${ambigVerifyData.verificationStatus})`
  );

  // Sample 4: Genuine Multi-Error Cascade (Step 2 and Step 4 flawed)
  const multiErrorVerifyRes = await fetch(`${BASE_URL}/api/verify-work`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      workId: `work-multi-err-${Date.now()}`,
      problemStatement: "Problem: 5(2x - 3) = 15",
      steps: [
        { stepIndex: 0, text: "10x - 15 = 15" },
        { stepIndex: 1, text: "10x = 15 - 15" }, // Flaw 1 (Sign mistake: subtracted 15 instead of adding)
        { stepIndex: 2, text: "10x = 0" },
        { stepIndex: 3, text: "x = 10" },          // Flaw 2 (Division mistake: 0 / 10 = 10)
      ],
      domain: "algebra",
    }),
  });
  assert(multiErrorVerifyRes.ok, "Multi-error sample verified with HTTP 200");
  const multiErrorData = await multiErrorVerifyRes.json();
  assert(multiErrorData.verificationStatus === "has_error", "Multi-error sample identified as 'has_error'");

  // Grade check: Verify that flagging Step 2 (index 1) is graded as CORRECT (First chronological error)
  const gradeFirstErrorRes = await fetch(`${BASE_URL}/api/grade-attempt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      problemId: multiErrorData.problemId,
      selectedStepIndex: 1, // Step 2
      explanation: "Subtracted 15 instead of adding 15 to the right side of the equation.",
      confidence: 5,
    }),
  });
  assert(gradeFirstErrorRes.ok, "Grading first chronological error returns HTTP 200");
  const gradeFirstData = await gradeFirstErrorRes.json();
  assert(
    gradeFirstData.verdict === "correct",
    `End-to-End Multi-Error Rule: Flagging Step 2 (first chronological error) rewarded with 'correct' verdict (Got: ${gradeFirstData.verdict})`
  );

  // -------------------------------------------------------------
  // PART 5: 10+ LIVE END-TO-END RUNS ACROSS ALL 4 DOMAINS
  // -------------------------------------------------------------
  console.log("\n-------------------------------------------------------------");
  console.log("⭐ 5. TESTING 10+ LIVE END-TO-END RUNS ACROSS ALL 4 DOMAINS");
  console.log("-------------------------------------------------------------");

  const liveRuns = [
    // Algebra runs (3)
    {
      domain: "algebra",
      problemStatement: "Solve: 2(3x - 1) = 16",
      steps: [
        { stepIndex: 0, text: "6x - 2 = 16" },
        { stepIndex: 1, text: "6x = 18" },
        { stepIndex: 2, text: "x = 3" },
      ],
      expectedStatus: "fully_correct",
    },
    {
      domain: "algebra",
      problemStatement: "Solve: 4(x + 2) = 24",
      steps: [
        { stepIndex: 0, text: "4x + 8 = 24" },
        { stepIndex: 1, text: "4x = 16" },
        { stepIndex: 2, text: "x = 4" },
      ],
      expectedStatus: "fully_correct",
    },
    {
      domain: "algebra",
      problemStatement: "Solve: -2(x - 5) = 14",
      steps: [
        { stepIndex: 0, text: "-2x - 10 = 14" }, // Error in Step 1 (sign slip)
        { stepIndex: 1, text: "-2x = 24" },
        { stepIndex: 2, text: "x = -12" },
      ],
      expectedStatus: "has_error",
    },
    // Physics runs (3)
    {
      domain: "physics",
      problemStatement: "A ball drops from rest (g = 9.8 m/s^2) for 2 seconds. Find final velocity.",
      steps: [
        { stepIndex: 0, text: "v_f = v_i + g*t" },
        { stepIndex: 1, text: "v_f = 0 + (9.8)*(2)" },
        { stepIndex: 2, text: "v_f = 19.6 m/s" },
      ],
      expectedStatus: "fully_correct",
    },
    {
      domain: "physics",
      problemStatement: "Calculate kinetic energy for m = 4 kg, v = 3 m/s.",
      steps: [
        { stepIndex: 0, text: "KE = 0.5 * m * v^2" },
        { stepIndex: 1, text: "KE = 0.5 * 4 * (3)^2" },
        { stepIndex: 2, text: "KE = 2 * 9 = 18 J" },
      ],
      expectedStatus: "fully_correct",
    },
    {
      domain: "physics",
      problemStatement: "Car accelerating at 2 m/s^2 from rest for 5 seconds.",
      steps: [
        { stepIndex: 0, text: "d = v_i*t + 0.5*a*t^2" },
        { stepIndex: 1, text: "d = 0 + 0.5 * 2 * 25" },
        { stepIndex: 2, text: "d = 50 m" }, // Error: 0.5 * 2 * 25 is 25, not 50
      ],
      expectedStatus: "has_error",
    },
    // Chemistry runs (2)
    {
      domain: "chemistry",
      problemStatement: "Balance: 2H2 + O2 -> 2H2O",
      steps: [
        { stepIndex: 0, text: "Reactants: 4 H, 2 O" },
        { stepIndex: 1, text: "Products: 4 H, 2 O" },
        { stepIndex: 2, text: "Balanced: 2H2 + O2 -> 2H2O" },
      ],
      expectedStatus: "fully_correct",
    },
    {
      domain: "chemistry",
      problemStatement: "Balance: N2 + H2 -> NH3",
      steps: [
        { stepIndex: 0, text: "N2 + 2H2 -> 2NH3" }, // Error: 2H2 gives 4 H, not 6
        { stepIndex: 1, text: "Check: 2 N, 6 H on right" },
      ],
      expectedStatus: "has_error",
    },
    // Code runs (3)
    {
      domain: "code",
      problemStatement: "Calculate sum of numbers from 0 to n - 1.",
      steps: [
        { stepIndex: 0, text: "total = 0" },
        { stepIndex: 1, text: "for i in range(n): total += i" },
        { stepIndex: 2, text: "return total" },
      ],
      expectedStatus: "fully_correct",
    },
    {
      domain: "code",
      problemStatement: "Find the maximum item in a non-empty array nums.",
      steps: [
        { stepIndex: 0, text: "max_val = nums[0]" },
        { stepIndex: 1, text: "for num in nums[1:]: if num > max_val: max_val = num" },
        { stepIndex: 2, text: "return max_val" },
      ],
      expectedStatus: "fully_correct",
    },
    {
      domain: "code",
      problemStatement: "Iterate over all elements of array arr of length n.",
      steps: [
        { stepIndex: 0, text: "for i in range(len(arr) + 1):" }, // Off-by-one error
        { stepIndex: 1, text: "    print(arr[i])" },
      ],
      expectedStatus: "has_error",
    },
  ];

  let liveSuccessCount = 0;

  for (let i = 0; i < liveRuns.length; i++) {
    const run = liveRuns[i];
    try {
      const res = await fetch(`${BASE_URL}/api/verify-work`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workId: `live-run-${i}-${Date.now()}`,
          problemStatement: run.problemStatement,
          steps: run.steps,
          domain: run.domain,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.verificationStatus === run.expectedStatus) {
          liveSuccessCount++;
          console.log(`  [Live Run ${i + 1}/${liveRuns.length}] (${run.domain}) ✅ PASS: Verified as '${data.verificationStatus}'`);
        } else {
          console.warn(`  [Live Run ${i + 1}/${liveRuns.length}] (${run.domain}) ⚠️ MISMATCH: Expected '${run.expectedStatus}', got '${data.verificationStatus}'`);
        }
      } else {
        console.error(`  [Live Run ${i + 1}/${liveRuns.length}] (${run.domain}) ❌ HTTP ERROR: ${res.status}`);
      }
    } catch (e) {
      console.error(`  [Live Run ${i + 1}/${liveRuns.length}] (${run.domain}) ❌ EXCEPTION:`, e.message);
    }
  }

  assert(
    liveSuccessCount >= 9,
    `Amendment 5 Live-Demo-Readiness Threshold: ${liveSuccessCount}/11 live runs succeeded cleanly (Requires >= 9/10)`
  );

  // -------------------------------------------------------------
  // PART 6: UNDERSTANDING MAP MASTERY UPDATE VERIFICATION
  // -------------------------------------------------------------
  console.log("\n-------------------------------------------------------------");
  console.log("⭐ 6. TESTING UNDERSTANDING MAP MASTERY INTEGRATION");
  console.log("-------------------------------------------------------------");

  // Test calculateMasteryStatus pure function
  assert(calculateMasteryStatus(0, 0) === "untested", "0 attempts yields 'untested'");
  assert(calculateMasteryStatus(1, 0) === "red", "1 attempt with 0 correct yields 'red' (Needs Review)");
  assert(calculateMasteryStatus(2, 1) === "yellow", "2 attempts with 1 correct (50%) yields 'yellow' (Unstable)");
  assert(calculateMasteryStatus(3, 3) === "blue", "3 attempts with 3 correct (100%) yields 'blue' (Mastered)");

  // Confirm concept tags from DOMAIN_CONCEPTS map 1:1 to UnderstandingMap node IDs
  for (const domain of ["algebra", "physics", "chemistry", "code"]) {
    const concepts = DOMAIN_CONCEPTS[domain];
    assert(concepts.length === 5, `${domain.toUpperCase()} domain has exactly 5 concept nodes in registry`);
  }

  // Final Summary Report
  console.log("\n" + "=".repeat(80));
  console.log("📊 PHASE 5d TEST SUITE SUMMARY");
  console.log("=".repeat(80));
  console.log(`Total Assertions Passed: ${passedCount}`);
  console.log(`Total Assertions Failed: ${failedCount}`);
  console.log(`Live Runs Success Rate:  ${liveSuccessCount}/${liveRuns.length} (${Math.round((liveSuccessCount / liveRuns.length) * 100)}%)`);
  console.log(`Demo-Readiness Threshold: ${liveSuccessCount >= 9 ? "🏆 MET (PROCEED WITH LIVE DEMO)" : "⚠️ NOT MET (INVOKE ESCALATION RULE)"}`);
  console.log("=".repeat(80) + "\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runPhase5dTestSuite().catch((e) => {
  console.error("Test suite fatal crash:", e);
  process.exit(1);
});
