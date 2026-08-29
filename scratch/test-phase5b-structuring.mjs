import fs from "fs";
import path from "path";
import { z } from "zod";

let arg = process.argv[2] || "http://localhost:3000";
const BASE_URL = arg.startsWith("http") ? arg : `http://localhost:${arg}`;

const StructuredStepSchema = z.object({
  stepIndex: z.number().int().min(0),
  text: z.string().trim().min(1),
});

const ConfirmedWorkSchema = z.object({
  workId: z.string().min(1),
  problemStatement: z.string().trim().min(1),
  steps: z.array(StructuredStepSchema).min(1),
  domain: z.enum(["algebra", "physics", "chemistry", "code"]),
  conceptTag: z.string().optional(),
});

console.log(`\n======================================================`);
console.log(`🧪 STARTING PHASE 5b STRUCTURING & CONFIRMATION TEST SUITE`);
console.log(`Target: ${BASE_URL}/api/structure-work`);
console.log(`======================================================\n`);

let passed = 0;
let failed = 0;

function assert(condition, name, details = "") {
  if (condition) {
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${name} — ${details}`);
    failed++;
  }
}

const TEST_CASES = [
  {
    name: "1. Algebra: Linear Distribution",
    rawText: "Problem: 4(x - 3) = 2x + 10\nStep 1: 4x - 12 = 2x + 10\nStep 2: 4x - 2x = 10 + 12\nStep 3: 2x = 22\nStep 4: x = 11",
    expectedDomain: "algebra",
    minSteps: 4,
  },
  {
    name: "2. Algebra: Distributive with Negative Multipliers",
    rawText: "Solve: -3(2x - 4) = 18\nStep 1: -6x + 12 = 18\nStep 2: -6x = 6\nStep 3: x = -1",
    expectedDomain: "algebra",
    minSteps: 3,
  },
  {
    name: "3. Algebra: Fraction Elimination",
    rawText: "Problem: (x + 2)/3 - x/4 = 1\nStep 1: 12*(x + 2)/3 - 12*x/4 = 12*1\nStep 2: 4(x + 2) - 3x = 12\nStep 3: 4x + 8 - 3x = 12\nStep 4: x = 4",
    expectedDomain: "algebra",
    minSteps: 4,
  },
  {
    name: "4. Algebra: Variable Isolation Across Equal Sign",
    rawText: "Solve for y: -5y + 14 = 2y - 21\nStep 1: -7y + 14 = -21\nStep 2: -7y = -35\nStep 3: y = 5",
    expectedDomain: "algebra",
    minSteps: 3,
  },
  {
    name: "5. Physics: Free Fall Kinematics Drop",
    rawText: "Drop from rest: v_i = 0, g = 9.8 m/s^2, t = 4s\nStep 1: d = v_i*t + 0.5*g*t^2\nStep 2: d = 0 + 0.5 * 9.8 * 16\nStep 3: d = 78.4 m",
    expectedDomain: "physics",
    minSteps: 3,
  },
  {
    name: "6. Physics: Constant Acceleration Velocity",
    rawText: "Problem: v_f = v_i + a*t with v_i = 5 m/s, a = 3 m/s^2, t = 6s\nStep 1: v_f = 5 + 3(6)\nStep 2: v_f = 5 + 18\nStep 3: v_f = 23 m/s",
    expectedDomain: "physics",
    minSteps: 3,
  },
  {
    name: "7. Physics: Mechanical Energy Conservation",
    rawText: "Problem: mgh = 0.5*m*v^2 with h = 20m, g = 9.8 m/s^2\nStep 1: gh = 0.5*v^2\nStep 2: 9.8 * 20 = 0.5*v^2\nStep 3: 196 = 0.5*v^2\nStep 4: v = 19.8 m/s",
    expectedDomain: "physics",
    minSteps: 4,
  },
  {
    name: "8. Chemistry: Propane Combustion Balancing",
    rawText: "Balance: C3H8 + O2 -> CO2 + H2O\nStep 1: C3H8 + O2 -> 3CO2 + H2O\nStep 2: C3H8 + O2 -> 3CO2 + 4H2O\nStep 3: Oxygen sum = 3(2) + 4 = 10\nStep 4: C3H8 + 5O2 -> 3CO2 + 4H2O",
    expectedDomain: "chemistry",
    minSteps: 4,
  },
  {
    name: "9. Chemistry: Stoichiometric Mole Ratio",
    rawText: "Problem: 2Al + 6HCl -> 2AlCl3 + 3H2. Find moles H2 from 4 mol Al.\nStep 1: Mole ratio H2 / Al = 3 / 2\nStep 2: Moles H2 = 4 mol Al * (3 / 2)\nStep 3: Moles H2 = 6 mol",
    expectedDomain: "chemistry",
    minSteps: 3,
  },
  {
    name: "10. Chemistry: Net Ionic Charge Balance",
    rawText: "Problem: Net ionic reaction Ag+ + Cl- -> AgCl\nStep 1: Reactant charge = (+1) + (-1) = 0\nStep 2: Product charge = 0\nStep 3: Net charge is balanced",
    expectedDomain: "chemistry",
    minSteps: 3,
  },
  {
    name: "11. Code: Python Array Loop Bounds",
    rawText: "def find_max(arr):\nStep 1: max_val = arr[0]\nStep 2: for i in range(len(arr)):\nStep 3: return max_val",
    expectedDomain: "code",
    minSteps: 3,
  },
  {
    name: "12. Messy/Noisy OCR Handwriting Extraction",
    rawText: "?? Target: 6x - 7 = 29 ??\n ~ Line 1: 6x = 29 + 7\n  ~ Line 2: 6x = 36\n  ~ Line 3: x = 6",
    expectedDomain: "algebra",
    minSteps: 3,
  },
];

async function run() {
  console.log(`--- [1] Structuring Across 12 Diverse OCR Test Cases (Definition of Done §5b) ---`);

  for (const tc of TEST_CASES) {
    try {
      const res = await fetch(`${BASE_URL}/api/structure-work`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: tc.rawText,
          suggestedDomain: tc.expectedDomain,
        }),
      });

      assert(res.status === 200, `${tc.name}: returns HTTP 200`, `Status: ${res.status}`);
      const data = await res.json();

      assert(
        typeof data.problemStatement === "string" && data.problemStatement.length > 0,
        `${tc.name}: problemStatement extracted (${data.problemStatement.slice(0, 35)}...)`
      );
      assert(
        Array.isArray(data.steps) && data.steps.length >= tc.minSteps,
        `${tc.name}: discrete steps structured (got ${data.steps?.length}, expected >= ${tc.minSteps})`
      );
      assert(
        data.domain === tc.expectedDomain,
        `${tc.name}: domain matched '${tc.expectedDomain}'`
      );
      assert(
        typeof data.conceptTag === "string" && data.conceptTag.length > 0,
        `${tc.name}: conceptTag assigned`
      );
    } catch (e) {
      assert(false, `${tc.name}: threw unhandled exception`, e.message);
    }
  }

  // ----------------------------------------------------
  // TEST 2: Empty/Malformed Input Rejection
  // ----------------------------------------------------
  console.log(`\n--- [2] Input Validation & Bounds Safety ---`);
  try {
    const resEmpty = await fetch(`${BASE_URL}/api/structure-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText: "" }),
    });

    assert(resEmpty.status === 400, "Empty rawText rejected with HTTP 400", `Got status: ${resEmpty.status}`);
  } catch (e) {
    assert(false, "Empty rawText test threw unhandled exception", e.message);
  }

  // ----------------------------------------------------
  // TEST 3: ConfirmedWork Schema Validation (R14 Client Invariant)
  // ----------------------------------------------------
  console.log(`\n--- [3] ConfirmedWork Schema Compliance (RULES.md R14) ---`);
  try {
    const validConfirmed = {
      workId: "work-test-12345",
      problemStatement: "Solve 4(x - 3) = 2x + 10",
      steps: [
        { stepIndex: 0, text: "4x - 12 = 2x + 10" },
        { stepIndex: 1, text: "2x = 22" },
        { stepIndex: 2, text: "x = 11" },
      ],
      domain: "algebra",
    };

    const parsed = ConfirmedWorkSchema.safeParse(validConfirmed);
    assert(parsed.success, "Valid ConfirmedWork payload passes schema validation");

    const invalidConfirmed = {
      workId: "",
      problemStatement: "",
      steps: [],
      domain: "invalid_domain",
    };
    const parsedInvalid = ConfirmedWorkSchema.safeParse(invalidConfirmed);
    assert(!parsedInvalid.success, "Invalid/empty ConfirmedWork payload rejected by schema");
  } catch (e) {
    assert(false, "ConfirmedWork schema test threw unhandled exception", e.message);
  }

  // ----------------------------------------------------
  // TEST 4: RULES.md R7 Security Audit: Zero Answer Leaks
  // ----------------------------------------------------
  console.log(`\n--- [4] RULES.md R7 Security Audit: Zero Answer Leaks ---`);
  try {
    const res = await fetch(`${BASE_URL}/api/structure-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rawText: "Problem: 4(x - 3) = 2x + 10\nStep 1: 4x - 12 = 2x + 10\nStep 2: 2x = 22\nStep 3: x = 11",
      }),
    });

    const data = await res.json();
    const rawString = JSON.stringify(data);

    assert(!rawString.includes('"isFlawed"'), "R7: 'isFlawed' omitted from structuring response");
    assert(!rawString.includes('"errorType"'), "R7: 'errorType' omitted from structuring response");
    assert(!rawString.includes('"explanationOfFlaw"'), "R7: 'explanationOfFlaw' omitted from structuring response");
  } catch (e) {
    assert(false, "R7 leak check threw unhandled exception", e.message);
  }

  console.log(`\n======================================================`);
  console.log(`📊 PHASE 5b TEST SUMMARY:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total Assertions: ${passed + failed}`);
  console.log(`======================================================\n`);

  if (failed > 0) process.exit(1);
}

run();
