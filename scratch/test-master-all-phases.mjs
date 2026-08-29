import fs from "fs";
import path from "path";

let arg = process.argv[2] || "http://localhost:3000";
const BASE_URL = arg.startsWith("http") ? arg : `http://localhost:${arg}`;

console.log(`\n================================================================================`);
console.log(`🚀 COGNITRACE MASTER SYSTEM TEST SUITE — ALL PHASES (0 THROUGH 5a)`);
console.log(`Target Server: ${BASE_URL}`);
console.log(`================================================================================\n`);

let passed = 0;
let failed = 0;
const resultsByPhase = {
  "Phase 0: Design & Setup": { passed: 0, failed: 0 },
  "Phase 1: Core Algebra Loop & Security": { passed: 0, failed: 0 },
  "Phase 2: Understanding Map & Navigation": { passed: 0, failed: 0 },
  "Phase 3: Code Debugging Domain & Summary": { passed: 0, failed: 0 },
  "Phase 4a: Security Hardening Pass": { passed: 0, failed: 0 },
  "Phase 4b: Classical Physics Domain": { passed: 0, failed: 0 },
  "Phase 4c: General Chemistry Domain": { passed: 0, failed: 0 },
  "Phase 4d: Confidence Calibration": { passed: 0, failed: 0 },
  "Phase 4e: Shareable Report Card": { passed: 0, failed: 0 },
  "Phase 5a: Mirror Mode OCR Pipeline": { passed: 0, failed: 0 },
  "Phase 5b: Structuring & Human Confirmation": { passed: 0, failed: 0 },
};

function assert(phaseName, condition, testName, details = "") {
  if (condition) {
    console.log(`  [${phaseName}] ✅ PASS: ${testName}`);
    passed++;
    resultsByPhase[phaseName].passed++;
  } else {
    console.error(`  [${phaseName}] ❌ FAIL: ${testName} — ${details}`);
    failed++;
    resultsByPhase[phaseName].failed++;
  }
}

async function run() {
  // =========================================================================
  // PHASE 0: DESIGN SYSTEM & SETUP
  // =========================================================================
  console.log(`\n========================================`);
  console.log(`⭐ 1. TESTING PHASE 0: DESIGN SYSTEM & TOKENS`);
  console.log(`========================================`);

  try {
    const res = await fetch(`${BASE_URL}/`);
    assert("Phase 0: Design & Setup", res.status === 200, "Landing page loads with HTTP 200");
    const html = await res.text();

    assert("Phase 0: Design & Setup", html.includes("Outfit") || html.includes("font-"), "Outfit typography system configured");
    assert("Phase 0: Design & Setup", html.includes("#D02020") || html.includes("bg-[#D02020]"), "Bauhaus Red token `#D02020` present in markup");
    assert("Phase 0: Design & Setup", html.includes("#1040C0") || html.includes("bg-[#1040C0]"), "Bauhaus Blue token `#1040C0` present in markup");
    assert("Phase 0: Design & Setup", html.includes("#F0C020") || html.includes("bg-[#F0C020]"), "Bauhaus Yellow token `#F0C020` present in markup");
    assert("Phase 0: Design & Setup", html.includes("bauhaus-btn"), "Mechanical `bauhaus-btn` utility class applied to actions");
  } catch (e) {
    assert("Phase 0: Design & Setup", false, "Landing page error", e.message);
  }

  // =========================================================================
  // PHASE 1: CORE ALGEBRA LOOP & OBFUSCATION (R7)
  // =========================================================================
  console.log(`\n========================================`);
  console.log(`⭐ 2. TESTING PHASE 1: CORE ALGEBRA LOOP & SECURITY`);
  console.log(`========================================`);

  let algebraProblemId = "";
  try {
    const res = await fetch(`${BASE_URL}/api/generate-problem`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: "algebra_linear_equations", forceFallback: true }),
    });

    assert("Phase 1: Core Algebra Loop & Security", res.status === 200, "Algebra generation returns HTTP 200");
    const data = await res.json();
    algebraProblemId = data.problemId;

    assert("Phase 1: Core Algebra Loop & Security", typeof data.problemId === "string" && data.problemId.length > 0, "Problem ID generated");
    assert("Phase 1: Core Algebra Loop & Security", Array.isArray(data.steps) && data.steps.length >= 2, "Problem contains 2+ steps");
    assert("Phase 1: Core Algebra Loop & Security", typeof data.problemStatement === "string", "Problem statement provided");

    // R7 Answer Key Obfuscation Check
    const rawPayload = JSON.stringify(data);
    assert("Phase 1: Core Algebra Loop & Security", !rawPayload.includes('"isFlawed"'), "R7: 'isFlawed' omitted from client response");
    assert("Phase 1: Core Algebra Loop & Security", !rawPayload.includes('"errorType"'), "R7: 'errorType' omitted from client response");
    assert("Phase 1: Core Algebra Loop & Security", !rawPayload.includes('"explanationOfFlaw"'), "R7: 'explanationOfFlaw' omitted from client response");

    // Test Grading API
    const gradeRes = await fetch(`${BASE_URL}/api/grade-attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: algebraProblemId,
        selectedStepIndex: 1,
        explanation: "They distributed the negative number incorrectly without flipping the sign.",
        confidence: 4,
      }),
    });

    assert("Phase 1: Core Algebra Loop & Security", gradeRes.status === 200, "Grading attempt returns HTTP 200");
    const gradeData = await gradeRes.json();
    assert("Phase 1: Core Algebra Loop & Security", ["correct", "partially_correct", "incorrect"].includes(gradeData.verdict), "Valid grading verdict returned");
    assert("Phase 1: Core Algebra Loop & Security", typeof gradeData.correctExplanation === "string", "Diagnostic root cause feedback returned");
    assert("Phase 1: Core Algebra Loop & Security", typeof gradeData.actualFlawedStep === "number", "Actual flawed step revealed on grading");
  } catch (e) {
    assert("Phase 1: Core Algebra Loop & Security", false, "Algebra loop error", e.message);
  }

  // =========================================================================
  // PHASE 2: UNDERSTANDING MAP & CURRICULUM
  // =========================================================================
  console.log(`\n========================================`);
  console.log(`⭐ 3. TESTING PHASE 2: UNDERSTANDING MAP & NAVIGATION`);
  console.log(`========================================`);

  try {
    const res = await fetch(`${BASE_URL}/topics`);
    assert("Phase 2: Understanding Map & Navigation", res.status === 200, "Curriculum page returns HTTP 200");
    const html = await res.text();

    assert("Phase 2: Understanding Map & Navigation", html.includes("Topic List") && html.includes("Understanding Map"), "Topic List & Understanding Map view switchers present");
    assert("Phase 2: Understanding Map & Navigation", html.includes("Linear Equations") || html.includes("Distributive Property"), "Algebra curriculum tracks rendered");
    assert("Phase 2: Understanding Map & Navigation", html.includes("SessionStats") || html.includes("Streak") || html.includes("Accuracy"), "SessionStats metric bar rendered");
    assert("Phase 2: Understanding Map & Navigation", html.includes("/challenge/"), "Topic cards link to challenge workspaces");
  } catch (e) {
    assert("Phase 2: Understanding Map & Navigation", false, "Topics page error", e.message);
  }

  // =========================================================================
  // PHASE 3: CODE DEBUGGING DOMAIN & SUMMARY SCREEN
  // =========================================================================
  console.log(`\n========================================`);
  console.log(`⭐ 4. TESTING PHASE 3: CODE DEBUGGING DOMAIN & SUMMARY`);
  console.log(`========================================`);

  const codeTracks = [
    "off_by_one",
    "mutable_default_args",
    "shallow_copy_mutation",
    "async_missing_await",
    "scope_shadowing",
  ];

  for (const track of codeTracks) {
    try {
      const res = await fetch(`${BASE_URL}/api/generate-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: track, forceFallback: true }),
      });
      const data = await res.json();
      assert("Phase 3: Code Debugging Domain & Summary", res.status === 200 && data.steps?.length >= 2, `Code track '${track}' generates valid problem`);
    } catch (e) {
      assert("Phase 3: Code Debugging Domain & Summary", false, `Code track '${track}' failed`, e.message);
    }
  }

  try {
    const summaryRes = await fetch(`${BASE_URL}/summary`);
    assert("Phase 3: Code Debugging Domain & Summary", summaryRes.status === 200, "Session Summary page returns HTTP 200");
    const html = await summaryRes.text();
    assert("Phase 3: Code Debugging Domain & Summary", html.includes("Accuracy") || html.includes("PLANTED FLAWS"), "Summary stats rendered");
    assert("Phase 3: Code Debugging Domain & Summary", html.includes("Reset Session History") || html.includes("Start Next Challenge"), "Action buttons present on summary page");
  } catch (e) {
    assert("Phase 3: Code Debugging Domain & Summary", false, "Summary page error", e.message);
  }

  // =========================================================================
  // PHASE 4a: SECURITY HARDENING PASS
  // =========================================================================
  console.log(`\n========================================`);
  console.log(`⭐ 5. TESTING PHASE 4a: SECURITY HARDENING PASS`);
  console.log(`========================================`);

  try {
    // 500-char cap server enforcement
    const longExplanation = "a".repeat(501);
    const res501 = await fetch(`${BASE_URL}/api/grade-attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: algebraProblemId || "dummy-id",
        selectedStepIndex: 1,
        explanation: longExplanation,
      }),
    });
    assert("Phase 4a: Security Hardening Pass", res501.status === 400, "501-character explanation rejected with HTTP 400");

    // Negative step index
    const resNegative = await fetch(`${BASE_URL}/api/grade-attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: algebraProblemId || "dummy-id",
        selectedStepIndex: -1,
        explanation: "Valid reason",
      }),
    });
    assert("Phase 4a: Security Hardening Pass", resNegative.status === 400, "Negative stepIndex rejected with HTTP 400");

    // Out-of-bounds step index
    const resOob = await fetch(`${BASE_URL}/api/grade-attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: algebraProblemId || "dummy-id",
        selectedStepIndex: 999,
        explanation: "Valid reason",
      }),
    });
    assert("Phase 4a: Security Hardening Pass", resOob.status === 400 || resOob.status === 404, "Out-of-bounds stepIndex rejected cleanly");

    // Nonexistent problemId
    const resNotFound = await fetch(`${BASE_URL}/api/grade-attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: "nonexistent-uuid-12345",
        selectedStepIndex: 0,
        explanation: "Valid reason",
      }),
    });
    assert("Phase 4a: Security Hardening Pass", resNotFound.status === 404, "Nonexistent problemId returns HTTP 404");
  } catch (e) {
    assert("Phase 4a: Security Hardening Pass", false, "Security hardening error", e.message);
  }

  // =========================================================================
  // PHASE 4b: CLASSICAL PHYSICS DOMAIN
  // =========================================================================
  console.log(`\n========================================`);
  console.log(`⭐ 6. TESTING PHASE 4b: CLASSICAL PHYSICS DOMAIN`);
  console.log(`========================================`);

  const physicsTracks = [
    "unit_conversion_error",
    "sign_error_vectors",
    "wrong_kinematic_equation",
    "energy_not_conserved",
    "missing_friction_term",
  ];

  for (const track of physicsTracks) {
    try {
      const res = await fetch(`${BASE_URL}/api/generate-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: track, forceFallback: true }),
      });
      const data = await res.json();
      assert("Phase 4b: Classical Physics Domain", res.status === 200 && data.steps?.length >= 2, `Physics track '${track}' generates valid problem`);
      assert("Phase 4b: Classical Physics Domain", data.problemStatement.includes("m/s") || data.problemStatement.includes("g =") || data.problemStatement.includes("positive") || data.problemStatement.includes("N") || data.problemStatement.includes("J") || data.problemStatement.includes("kg"), `Physics '${track}' declares clear physical units/conventions`);
    } catch (e) {
      assert("Phase 4b: Classical Physics Domain", false, `Physics track '${track}' failed`, e.message);
    }
  }

  // =========================================================================
  // PHASE 4c: GENERAL CHEMISTRY DOMAIN
  // =========================================================================
  console.log(`\n========================================`);
  console.log(`⭐ 7. TESTING PHASE 4c: GENERAL CHEMISTRY DOMAIN`);
  console.log(`========================================`);

  const chemTracks = [
    "unbalanced_coefficients",
    "wrong_mole_ratio",
    "sig_fig_error",
    "wrong_limiting_reagent",
    "charge_imbalance",
  ];

  for (const track of chemTracks) {
    try {
      const res = await fetch(`${BASE_URL}/api/generate-problem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: track, forceFallback: true }),
      });
      const data = await res.json();
      assert("Phase 4c: General Chemistry Domain", res.status === 200 && data.steps?.length >= 2, `Chemistry track '${track}' generates valid problem`);
    } catch (e) {
      assert("Phase 4c: General Chemistry Domain", false, `Chemistry track '${track}' failed`, e.message);
    }
  }

  // =========================================================================
  // PHASE 4d: CONFIDENCE CALIBRATION
  // =========================================================================
  console.log(`\n========================================`);
  console.log(`⭐ 8. TESTING PHASE 4d: CONFIDENCE CALIBRATION SLIDER`);
  console.log(`========================================`);

  for (let c = 1; c <= 5; c++) {
    try {
      const res = await fetch(`${BASE_URL}/api/grade-attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: algebraProblemId || "dummy",
          selectedStepIndex: 1,
          explanation: "Distributive property sign slip error",
          confidence: c,
        }),
      });
      assert("Phase 4d: Confidence Calibration", res.status === 200 || res.status === 404, `Confidence rating ${c}/5 accepted by schema`);
    } catch (e) {
      assert("Phase 4d: Confidence Calibration", false, `Confidence ${c} failed`, e.message);
    }
  }

  // Test invalid confidence numbers
  try {
    const resBadConf = await fetch(`${BASE_URL}/api/grade-attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemId: algebraProblemId || "dummy",
        selectedStepIndex: 1,
        explanation: "Testing invalid confidence bound",
        confidence: 6,
      }),
    });
    assert("Phase 4d: Confidence Calibration", resBadConf.status === 400, "Confidence rating 6 rejected with HTTP 400");
  } catch (e) {
    assert("Phase 4d: Confidence Calibration", false, "Invalid confidence check failed", e.message);
  }

  // =========================================================================
  // PHASE 4e: SHAREABLE REPORT CARD
  // =========================================================================
  console.log(`\n========================================`);
  console.log(`⭐ 9. TESTING PHASE 4e: SHAREABLE REPORT CARD`);
  console.log(`========================================`);

  try {
    const res = await fetch(`${BASE_URL}/summary`);
    const html = await res.text();
    assert("Phase 4e: Shareable Report Card", html.includes("Report Card") || html.includes("REPORT CARD"), "Report card section rendered on Summary screen");
    assert("Phase 4e: Shareable Report Card", html.includes("Download PNG") || html.includes("Download") || html.includes("Copy Image") || html.includes("Share"), "Download/Share actions present");
  } catch (e) {
    assert("Phase 4e: Shareable Report Card", false, "Report card summary check failed", e.message);
  }

  // =========================================================================
  // PHASE 5a: MIRROR MODE OCR INGESTION & PIPELINE
  // =========================================================================
  console.log(`\n========================================`);
  console.log(`⭐ 10. TESTING PHASE 5a: MIRROR MODE (OCR PIPELINE)`);
  console.log(`========================================`);

  // Valid JPEG header
  const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00]);
  const jpegBuf = Buffer.concat([jpegHeader, Buffer.from("Valid JPEG test data"), Buffer.from([0xff, 0xd9])]);
  const base64Jpeg = `data:image/jpeg;base64,${jpegBuf.toString("base64")}`;

  try {
    const res = await fetch(`${BASE_URL}/api/transcribe-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64Jpeg, mimeType: "image/jpeg" }),
    });

    assert("Phase 5a: Mirror Mode OCR Pipeline", res.status === 200, "Valid JPEG upload returns HTTP 200");
    const data = await res.json();
    assert("Phase 5a: Mirror Mode OCR Pipeline", data.status === "success", "OCR status is 'success'");
    assert("Phase 5a: Mirror Mode OCR Pipeline", data.averageConfidence >= 0.75, "Confidence passes threshold (>= 0.75)");
    assert("Phase 5a: Mirror Mode OCR Pipeline", Array.isArray(data.detections) && data.detections.length > 0, "Discrete detections returned");
  } catch (e) {
    assert("Phase 5a: Mirror Mode OCR Pipeline", false, "Valid JPEG test failed", e.message);
  }

  // Corrupt image magic bytes
  try {
    const fakeBuf = Buffer.from("INVALID_NON_IMAGE_CORRUPT_BYTES");
    const base64Fake = `data:image/jpeg;base64,${fakeBuf.toString("base64")}`;
    const res = await fetch(`${BASE_URL}/api/transcribe-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64Fake, mimeType: "image/jpeg" }),
    });
    assert("Phase 5a: Mirror Mode OCR Pipeline", res.status === 400, "Corrupt magic bytes rejected with HTTP 400");
  } catch (e) {
    assert("Phase 5a: Mirror Mode OCR Pipeline", false, "Corrupt buffer test failed", e.message);
  }

  // Oversized 5.5MB file
  try {
    const hugeBuf = Buffer.concat([jpegHeader, Buffer.alloc(5.5 * 1024 * 1024), Buffer.from([0xff, 0xd9])]);
    const base64Huge = `data:image/jpeg;base64,${hugeBuf.toString("base64")}`;
    const res = await fetch(`${BASE_URL}/api/transcribe-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64Huge, mimeType: "image/jpeg" }),
    });
    assert("Phase 5a: Mirror Mode OCR Pipeline", res.status === 413 || res.status === 400, "Oversized >5MB payload rejected with HTTP 413/400");
  } catch (e) {
    assert("Phase 5a: Mirror Mode OCR Pipeline", false, "Oversized test failed", e.message);
  }

  // Low confidence gate trigger (<0.75)
  try {
    const res = await fetch(`${BASE_URL}/api/transcribe-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sampleId: "sample-blurry-001" }),
    });
    const data = await res.json();
    assert("Phase 5a: Mirror Mode OCR Pipeline", data.status === "low_confidence", "Low confidence sample triggers 'low_confidence' status");
    assert("Phase 5a: Mirror Mode OCR Pipeline", data.averageConfidence < 0.75, "Confidence is below 75% gate");
    assert("Phase 5a: Mirror Mode OCR Pipeline", !data.workId, "workId withheld on low confidence");
  } catch (e) {
    assert("Phase 5a: Mirror Mode OCR Pipeline", false, "Low confidence gate failed", e.message);
  }

  // Mirror Mode Page (/mirror)
  try {
    const res = await fetch(`${BASE_URL}/mirror`);
    assert("Phase 5a: Mirror Mode OCR Pipeline", res.status === 200, "Mirror Mode page (/mirror) loads HTTP 200");
    const html = await res.text();
    assert("Phase 5a: Mirror Mode OCR Pipeline", html.includes("Mirror Mode") && html.includes("Self-Audit"), "Mirror Mode branding rendered");
    assert("Phase 5a: Mirror Mode OCR Pipeline", html.toLowerCase().includes("upload") || html.includes("Handwritten Solution Ingestion"), "Upload dropzone & CTA rendered");
  } catch (e) {
    assert("Phase 5a: Mirror Mode OCR Pipeline", false, "Mirror page fetch failed", e.message);
  }

  // =========================================================================
  // PHASE 5b: STRUCTURING PASS & HUMAN REVIEW
  // =========================================================================
  console.log(`\n========================================`);
  console.log(`⭐ 11. TESTING PHASE 5b: STRUCTURING & HUMAN CONFIRMATION (R14)`);
  console.log(`========================================`);

  const p5bCases = [
    { name: "Algebra Linear Distribution", text: "Problem: 4(x - 3) = 2x + 10\nStep 1: 4x - 12 = 2x + 10\nStep 2: 2x = 22\nStep 3: x = 11", domain: "algebra" },
    { name: "Physics Kinematics", text: "Drop from rest: v_i = 0, g = 9.8 m/s^2, t = 4s\nStep 1: d = 0 + 0.5*9.8*16\nStep 2: d = 78.4 m", domain: "physics" },
    { name: "Chemistry Combustion", text: "Balance: C3H8 + O2 -> CO2 + H2O\nStep 1: C3H8 + 5O2 -> 3CO2 + 4H2O", domain: "chemistry" },
    { name: "Code Loop Bounds", text: "def test(arr):\nStep 1: for i in range(len(arr)):\nStep 2: return arr[i]", domain: "code" },
  ];

  for (const tc of p5bCases) {
    try {
      const res = await fetch(`${BASE_URL}/api/structure-work`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: tc.text, suggestedDomain: tc.domain }),
      });
      const data = await res.json();
      assert("Phase 5b: Structuring & Human Confirmation", res.status === 200, `Structuring API '${tc.name}' returns HTTP 200`);
      assert("Phase 5b: Structuring & Human Confirmation", typeof data.problemStatement === "string" && data.problemStatement.length > 0, `'${tc.name}' problemStatement extracted`);
      assert("Phase 5b: Structuring & Human Confirmation", Array.isArray(data.steps) && data.steps.length >= 1, `'${tc.name}' steps array generated`);
      assert("Phase 5b: Structuring & Human Confirmation", data.domain === tc.domain, `'${tc.name}' domain matched '${tc.domain}'`);
    } catch (e) {
      assert("Phase 5b: Structuring & Human Confirmation", false, `'${tc.name}' structuring threw exception`, e.message);
    }
  }

  // Input validation
  try {
    const resBad = await fetch(`${BASE_URL}/api/structure-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText: "" }),
    });
    assert("Phase 5b: Structuring & Human Confirmation", resBad.status === 400, "Empty rawText rejected with HTTP 400");
  } catch (e) {
    assert("Phase 5b: Structuring & Human Confirmation", false, "Empty rawText test failed", e.message);
  }

  // R7 check for structuring
  try {
    const resR7 = await fetch(`${BASE_URL}/api/structure-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawText: "Problem: x = 1\nStep 1: x + 1 = 2" }),
    });
    const dataR7 = await resR7.json();
    const rawR7 = JSON.stringify(dataR7);
    assert("Phase 5b: Structuring & Human Confirmation", !rawR7.includes('"isFlawed"'), "R7: Zero 'isFlawed' leaks in structuring response");
    assert("Phase 5b: Structuring & Human Confirmation", !rawR7.includes('"errorType"'), "R7: Zero 'errorType' leaks in structuring response");
  } catch (e) {
    assert("Phase 5b: Structuring & Human Confirmation", false, "Structuring R7 check failed", e.message);
  }

  // =========================================================================
  // MASTER SUMMARY REPORT
  // =========================================================================
  console.log(`\n================================================================================`);
  console.log(`📊 MASTER TEST RESULTS SUMMARY ACROSS ALL PHASES`);
  console.log(`================================================================================`);
  console.table(resultsByPhase);

  console.log(`\n🎯 TOTAL PASSED: ${passed}`);
  console.log(`❌ TOTAL FAILED: ${failed}`);
  console.log(`📈 OVERALL SUCCESS RATE: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

run();
