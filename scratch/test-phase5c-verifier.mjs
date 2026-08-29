/**
 * Phase 5c Automated Test Suite for Verifier Agent (Live Ground Truth)
 * Tests:
 * 1. 10+ Deliberately Flawed Test Cases (Algebra, Physics, Chemistry, Code)
 * 2. 5+ Genuinely Correct Test Cases (Verified Flawless)
 * 3. Multi-Error Chronological Selection (Amendment 3: Flags First Error)
 * 4. Input Validation & Bounds Safety (Amendment 4: Rejects empty/malformed steps with clean 400)
 * 5. RULES.md R7 Security Audit: Zero Answer Leaks to Client
 * 6. End-to-End Self-Audit Flow with /api/grade-attempt
 */

const BASE_URL = "http://localhost:3000";

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passedCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedCount++;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function postJson(url, data, retries = 3) {
  let attempt = 0;
  while (attempt < retries) {
    attempt++;
    const res = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if ((res.status === 503 || res.status === 429) && attempt < retries) {
      console.log(`    ⚠️ Transient ${res.status}, retrying in 2500ms (attempt ${attempt}/${retries})...`);
      await sleep(2500);
      continue;
    }
    const json = await res.json().catch(() => ({}));
    return { status: res.status, ok: res.ok, json };
  }
}

// 10+ Flawed Test Problems
const FLAWED_TEST_CASES = [
  {
    name: "1. Algebra: Distributive Addition Slip",
    domain: "algebra",
    conceptTag: "distributive_property",
    problemStatement: "Solve for x: 3(2x - 4) = 18",
    steps: [
      { stepIndex: 0, text: "6x - 12 = 18" },
      { stepIndex: 1, text: "6x = 18 - 12 = 6" }, // FLAW: should be 18 + 12 = 30
      { stepIndex: 2, text: "x = 1" },
    ],
    expectedFlawedIndex: 1,
  },
  {
    name: "2. Algebra: Negative Sign Distribution",
    domain: "algebra",
    conceptTag: "sign_handling",
    problemStatement: "Solve for x: -4(x - 3) = 20",
    steps: [
      { stepIndex: 0, text: "-4x - 12 = 20" }, // FLAW: -4 * -3 = +12
      { stepIndex: 1, text: "-4x = 32" },
      { stepIndex: 2, text: "x = -8" },
    ],
    expectedFlawedIndex: 0,
  },
  {
    name: "3. Algebra: Fraction LCD Cross-Multiplication Slip",
    domain: "algebra",
    conceptTag: "fraction_elimination",
    problemStatement: "Solve for x: (x + 2)/3 = (2x - 1)/4",
    steps: [
      { stepIndex: 0, text: "Multiply by 12: 4(x + 2) = 3(2x - 1)" },
      { stepIndex: 1, text: "4x + 8 = 6x - 3" },
      { stepIndex: 2, text: "4x - 6x = -3 + 8 = 5" }, // FLAW: should be -3 - 8 = -11
      { stepIndex: 3, text: "-2x = 5 => x = -2.5" },
    ],
    expectedFlawedIndex: 2,
  },
  {
    name: "4. Algebra: Variable Division Sign Loss",
    domain: "algebra",
    conceptTag: "variable_isolation",
    problemStatement: "Solve for x: -5x = 35",
    steps: [
      { stepIndex: 0, text: "-5x = 35" },
      { stepIndex: 1, text: "Divide by -5: x = 35 / -5 = 7" }, // FLAW: 35 / -5 = -7
    ],
    expectedFlawedIndex: 1,
  },
  {
    name: "5. Physics: Kinematics Exponent Square Slip",
    domain: "physics",
    conceptTag: "wrong_kinematic_equation",
    problemStatement: "Car accelerates from rest (v_i = 0) at a = 9.8 m/s^2 for t = 3s. Find displacement d.",
    steps: [
      { stepIndex: 0, text: "d = v_i*t + 0.5*a*t^2" },
      { stepIndex: 1, text: "d = (0)(3) + 0.5 * 9.8 * 6" }, // FLAW: 3^2 = 9, not 6
      { stepIndex: 2, text: "d = 29.4 m" },
    ],
    expectedFlawedIndex: 1,
  },
  {
    name: "6. Physics: Upward Motion Acceleration Sign Inversion",
    domain: "physics",
    conceptTag: "sign_error_vectors",
    problemStatement: "Projectile thrown upward at v_i = 20 m/s. Take upward as positive, g = 9.8 m/s^2. Velocity at t = 2s.",
    steps: [
      { stepIndex: 0, text: "v_f = v_i + a*t with upward as positive" },
      { stepIndex: 1, text: "v_f = 20 + 9.8 * 2 = 39.6 m/s" }, // FLAW: a = -g = -9.8
    ],
    expectedFlawedIndex: 1,
  },
  {
    name: "7. Physics: Potential Energy Height Inversion",
    domain: "physics",
    conceptTag: "energy_not_conserved",
    problemStatement: "Find PE of m = 4.0 kg dropped from h = 5.0 m. Take g = 9.8 m/s^2.",
    steps: [
      { stepIndex: 0, text: "PE = m * g * h" },
      { stepIndex: 1, text: "PE = 4.0 * 9.8 * 50.0" }, // FLAW: h = 5.0, not 50.0
      { stepIndex: 2, text: "PE = 1960 J" },
    ],
    expectedFlawedIndex: 1,
  },
  {
    name: "8. Chemistry: Combustion Balancing Diatomic Divisor Slip",
    domain: "chemistry",
    conceptTag: "unbalanced_coefficients",
    problemStatement: "Balance combustion reaction: C3H8 + O2 -> CO2 + H2O",
    steps: [
      { stepIndex: 0, text: "Balance Carbon: C3H8 + O2 -> 3CO2 + H2O" },
      { stepIndex: 1, text: "Balance Hydrogen: C3H8 + O2 -> 3CO2 + 4H2O" },
      { stepIndex: 2, text: "Count Oxygen: 3(2) + 4 = 10 atoms. Write: C3H8 + 10O2 -> 3CO2 + 4H2O" }, // FLAW: 10 O atoms = 5 O2
      { stepIndex: 3, text: "Balanced: C3H8 + 10O2 -> 3CO2 + 4H2O" },
    ],
    expectedFlawedIndex: 2,
  },
  {
    name: "9. Chemistry: Stoichiometric Mole Ratio Inversion",
    domain: "chemistry",
    conceptTag: "wrong_mole_ratio",
    problemStatement: "2Al + 6HCl -> 2AlCl3 + 3H2. Find moles of H2 produced from 4.0 mol of Al.",
    steps: [
      { stepIndex: 0, text: "Mole ratio of H2 to Al is 3 mol H2 / 2 mol Al" },
      { stepIndex: 1, text: "Moles H2 = 4.0 mol Al * (2 mol Al / 3 mol H2)" }, // FLAW: inverted ratio (2/3 instead of 3/2)
      { stepIndex: 2, text: "Moles H2 = 2.67 mol" },
    ],
    expectedFlawedIndex: 1,
  },
  {
    name: "10. Chemistry: Net Ionic Charge Imbalance",
    domain: "chemistry",
    conceptTag: "charge_imbalance",
    problemStatement: "Balance net ionic redox: Zn(s) + Ag+(aq) -> Zn2+(aq) + Ag(s)",
    steps: [
      { stepIndex: 0, text: "Atom balance: 1 Zn on left, 1 Zn on right; 1 Ag on left, 1 Ag on right" },
      { stepIndex: 1, text: "Write: Zn(s) + Ag+(aq) -> Zn2+(aq) + Ag(s)" }, // FLAW: Charge on left is +1, on right is +2
    ],
    expectedFlawedIndex: 1,
  },
  {
    name: "11. Code: Python Loop Bounds Off-By-One",
    domain: "code",
    conceptTag: "off_by_one",
    problemStatement: "def sum_list(items): calculate sum of all elements in list items",
    steps: [
      { stepIndex: 0, text: "total = 0" },
      { stepIndex: 1, text: "for i in range(len(items) + 1):" }, // FLAW: range(len + 1) index error
      { stepIndex: 2, text: "    total += items[i]" },
      { stepIndex: 3, text: "return total" },
    ],
    expectedFlawedIndex: 1,
  },
];

// 5+ Genuinely Correct Test Problems
const CORRECT_TEST_CASES = [
  {
    name: "1. Algebra: Linear Isolation (Fully Correct)",
    domain: "algebra",
    conceptTag: "variable_isolation",
    problemStatement: "Solve for x: 5x - 7 = 3x + 9",
    steps: [
      { stepIndex: 0, text: "5x - 3x = 9 + 7" },
      { stepIndex: 1, text: "2x = 16" },
      { stepIndex: 2, text: "x = 8" },
    ],
  },
  {
    name: "2. Algebra: Distributive Property (Fully Correct)",
    domain: "algebra",
    conceptTag: "distributive_property",
    problemStatement: "Solve for x: 4(x - 3) = 2x + 10",
    steps: [
      { stepIndex: 0, text: "4x - 12 = 2x + 10" },
      { stepIndex: 1, text: "4x - 2x = 10 + 12" },
      { stepIndex: 2, text: "2x = 22" },
      { stepIndex: 3, text: "x = 11" },
    ],
  },
  {
    name: "3. Physics: Gravitational Potential Energy (Fully Correct)",
    domain: "physics",
    conceptTag: "energy_not_conserved",
    problemStatement: "Calculate PE of m = 2.0 kg mass lifted h = 10.0 m. Take g = 9.8 m/s^2.",
    steps: [
      { stepIndex: 0, text: "PE = m * g * h" },
      { stepIndex: 1, text: "PE = (2.0 kg) * (9.8 m/s^2) * (10.0 m)" },
      { stepIndex: 2, text: "PE = 196.0 J" },
    ],
  },
  {
    name: "4. Chemistry: Molar Mass Calculation (Fully Correct)",
    domain: "chemistry",
    conceptTag: "sig_fig_error",
    problemStatement: "Find moles in 88.02 g of CO2. (C = 12.01 g/mol, O = 16.00 g/mol).",
    steps: [
      { stepIndex: 0, text: "Molar mass of CO2 = 12.01 + 2(16.00) = 44.01 g/mol" },
      { stepIndex: 1, text: "Moles n = 88.02 g / 44.01 g/mol" },
      { stepIndex: 2, text: "n = 2.00 mol" },
    ],
  },
  {
    name: "5. Code: Array Max Search (Fully Correct)",
    domain: "code",
    conceptTag: "off_by_one",
    problemStatement: "def find_max(numbers): return largest number in a non-empty list",
    steps: [
      { stepIndex: 0, text: "max_val = numbers[0]" },
      { stepIndex: 1, text: "for num in numbers:" },
      { stepIndex: 2, text: "    if num > max_val: max_val = num" },
      { stepIndex: 3, text: "return max_val" },
    ],
  },
];

async function runTests() {
  console.log("======================================================");
  console.log("🧪 STARTING PHASE 5c VERIFIER AGENT AUTOMATED TEST SUITE");
  console.log("Target: " + BASE_URL + "/api/verify-work");
  console.log("======================================================\n");

  // --- SECTION 1: 10+ Deliberately Flawed Test Cases ---
  console.log("--- [1] Testing 11 Deliberately Flawed Worksheets Across 4 Domains ---");
  for (let i = 0; i < FLAWED_TEST_CASES.length; i++) {
    const tc = FLAWED_TEST_CASES[i];
    await sleep(250);
    const workId = `test-flawed-${Date.now()}-${i}`;
    const payload = {
      workId,
      problemStatement: tc.problemStatement,
      steps: tc.steps,
      domain: tc.domain,
      conceptTag: tc.conceptTag,
    };

    const res = await postJson("/api/verify-work", payload);

    assert(res.status === 200, `${tc.name}: returns HTTP 200`);
    assert(res.json.verificationStatus === "has_error", `${tc.name}: verificationStatus is 'has_error'`);
    assert(res.json.workId === workId, `${tc.name}: workId preserved`);
    assert(Array.isArray(res.json.steps) && res.json.steps.length === tc.steps.length, `${tc.name}: steps array intact`);
  }

  // --- SECTION 2: 5+ Genuinely Correct Test Cases ---
  console.log("\n--- [2] Testing 5 Genuinely Correct Worksheets (Zero Errors) ---");
  for (let i = 0; i < CORRECT_TEST_CASES.length; i++) {
    const tc = CORRECT_TEST_CASES[i];
    await sleep(250);
    const workId = `test-correct-${Date.now()}-${i}`;
    const payload = {
      workId,
      problemStatement: tc.problemStatement,
      steps: tc.steps,
      domain: tc.domain,
      conceptTag: tc.conceptTag,
    };

    const res = await postJson("/api/verify-work", payload);

    assert(res.status === 200, `${tc.name}: returns HTTP 200`);
    assert(res.json.verificationStatus === "fully_correct", `${tc.name}: verificationStatus is 'fully_correct'`);
    assert(res.json.workId === workId, `${tc.name}: workId preserved`);
  }

  // --- SECTION 3: Multi-Error Chronological Selection (Amendment 3) ---
  console.log("\n--- [3] Multi-Error Chronological Selection (Amendment 3) ---");
  const multiErrorWorkId = `test-multi-error-${Date.now()}`;
  const multiErrorPayload = {
    workId: multiErrorWorkId,
    problemStatement: "Solve for x: -2(3x - 5) + 4 = 24",
    steps: [
      { stepIndex: 0, text: "-6x - 10 + 4 = 24" }, // FIRST ERROR: -2 * -5 = +10, not -10
      { stepIndex: 1, text: "-6x - 6 = 24" },
      { stepIndex: 2, text: "-6x = 24 - 6 = 18" }, // SECOND ERROR: 24 + 6 = 30, not 18
      { stepIndex: 3, text: "x = -3" },
    ],
    domain: "algebra",
    conceptTag: "distributive_property",
  };

  const multiRes = await postJson("/api/verify-work", multiErrorPayload);
  assert(multiRes.status === 200, "Multi-error payload returns HTTP 200");
  assert(multiRes.json.verificationStatus === "has_error", "Multi-error status is 'has_error'");

  // Verify that grading against the stored record checks step index 0 as the first flaw
  const gradeFirstError = await postJson("/api/grade-attempt", {
    problemId: multiErrorWorkId,
    selectedStepIndex: 0,
    explanation: "In step 1, multiplying -2 by -5 should give positive 10, not negative 10.",
    confidence: 5,
  });

  assert(gradeFirstError.status === 200, "Grading first error returns HTTP 200");
  assert(gradeFirstError.json.actualFlawedStep === 0, "Multi-error: FIRST error (Step 1 / index 0) flagged chronologically");
  assert(gradeFirstError.json.verdict === "correct", "Selecting first chronological flaw receives 'correct' verdict");

  // --- SECTION 4: Input Validation & Bounds Safety (Amendment 4) ---
  console.log("\n--- [4] Input Validation & Bounds Safety (Amendment 4) ---");
  
  // Empty steps array
  const emptyStepsRes = await postJson("/api/verify-work", {
    workId: "bad-work-1",
    problemStatement: "Solve 2x = 4",
    steps: [],
    domain: "algebra",
  });
  assert(emptyStepsRes.status === 400, "Empty steps array rejected with HTTP 400");

  // Step with empty text
  const emptyStepTextRes = await postJson("/api/verify-work", {
    workId: "bad-work-2",
    problemStatement: "Solve 2x = 4",
    steps: [{ stepIndex: 0, text: "   " }],
    domain: "algebra",
  });
  assert(emptyStepTextRes.status === 400, "Step with empty text rejected with HTTP 400");

  // Missing problemStatement
  const missingStatementRes = await postJson("/api/verify-work", {
    workId: "bad-work-3",
    problemStatement: "  ",
    steps: [{ stepIndex: 0, text: "2x = 4" }],
    domain: "algebra",
  });
  assert(missingStatementRes.status === 400, "Missing problemStatement rejected with HTTP 400");

  // Missing workId
  const missingWorkIdRes = await postJson("/api/verify-work", {
    workId: "   ",
    problemStatement: "Solve 2x = 4",
    steps: [{ stepIndex: 0, text: "2x = 4" }],
    domain: "algebra",
  });
  assert(missingWorkIdRes.status === 400, "Missing workId rejected with HTTP 400");

  // --- SECTION 5: RULES.md R7 Security Audit: Zero Answer Leaks ---
  console.log("\n--- [5] RULES.md R7 Security Audit: Zero Answer Leaks ---");
  const secWorkId = `sec-audit-${Date.now()}`;
  const secPayload = {
    workId: secWorkId,
    problemStatement: "Solve for y: -3(y - 2) = 15",
    steps: [
      { stepIndex: 0, text: "-3y - 6 = 15" },
      { stepIndex: 1, text: "-3y = 21" },
      { stepIndex: 2, text: "y = -7" },
    ],
    domain: "algebra",
    conceptTag: "distributive_property",
  };

  const secRes = await postJson("/api/verify-work", secPayload);
  const secBody = secRes.json;

  assert(secBody.isFlawed === undefined, "R7: 'isFlawed' omitted from client response");
  assert(secBody.errorType === undefined, "R7: 'errorType' omitted from client response");
  assert(secBody.explanationOfFlaw === undefined, "R7: 'explanationOfFlaw' omitted from client response");
  assert(secBody.flawedStepIndex === undefined, "R7: 'flawedStepIndex' omitted from client response");
  assert(secBody.steps.every((s) => s.isFlawed === undefined), "R7: Step objects contain no 'isFlawed' boolean");

  // --- SECTION 6: End-to-End Self-Audit Flow with /api/grade-attempt ---
  console.log("\n--- [6] End-to-End Self-Audit Flow with /api/grade-attempt ---");
  const gradeAttemptRes = await postJson("/api/grade-attempt", {
    problemId: secWorkId,
    selectedStepIndex: 0,
    explanation: "In step 1, multiplying -3 by -2 should be positive 6, not negative 6.",
    confidence: 4,
  });

  assert(gradeAttemptRes.status === 200, "Grading self-audit attempt returns HTTP 200");
  assert(gradeAttemptRes.json.verdict === "correct", "Correct self-audit identification returns verdict 'correct'");
  assert(typeof gradeAttemptRes.json.masteryDelta === "number", "Mastery delta calculated");
  assert(gradeAttemptRes.json.correctExplanation.length > 0, "AI explanation of flaw returned after submission");

  // Summary
  console.log("\n======================================================");
  console.log(`📊 PHASE 5c TEST SUMMARY:`);
  console.log(`   Passed: ${passedCount}`);
  console.log(`   Failed: ${failedCount}`);
  console.log(`   Total Assertions: ${passedCount + failedCount}`);
  console.log("======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
