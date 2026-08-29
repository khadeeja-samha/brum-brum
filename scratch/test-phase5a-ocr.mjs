import http from "http";
import fs from "fs";
import path from "path";

// Generate valid JPEG buffer in memory (FF D8 FF E0 ...)
function createValidJpegBuffer() {
  const header = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00]);
  const content = Buffer.from("Valid JPEG mock image content for OCR testing");
  const footer = Buffer.from([0xff, 0xd9]);
  return Buffer.concat([header, content, footer]);
}

// Generate valid PNG buffer in memory (89 50 4E 47 0D 0A 1A 0A ...)
function createValidPngBuffer() {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const content = Buffer.from("Valid PNG mock image content for OCR testing");
  const footer = Buffer.from([0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);
  return Buffer.concat([header, content, footer]);
}

// Generate invalid/fake image (corrupt magic bytes)
function createInvalidImageBuffer() {
  return Buffer.from("NOT_AN_IMAGE_FILE_JUST_PLAIN_TEXT_CONTENT_WITH_BAD_BYTES");
}

// Generate oversized buffer (>5MB, e.g. 5.5MB)
function createOversizedJpegBuffer() {
  const header = Buffer.from([0xff, 0xd8, 0xff, 0xe0]);
  const padding = Buffer.alloc(5.5 * 1024 * 1024);
  const footer = Buffer.from([0xff, 0xd9]);
  return Buffer.concat([header, padding, footer]);
}

async function runTests(baseUrl = "http://localhost:3000") {
  console.log(`\n======================================================`);
  console.log(`🧪 STARTING PHASE 5a AUTOMATED OCR VERIFICATION SUITE`);
  console.log(`Target: ${baseUrl}/api/transcribe-work`);
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

  // ----------------------------------------------------
  // TEST 1: Valid JPEG Base64 Payload
  // ----------------------------------------------------
  console.log(`--- [1] Valid JPEG Upload ---`);
  try {
    const jpegBuf = createValidJpegBuffer();
    const base64 = `data:image/jpeg;base64,${jpegBuf.toString("base64")}`;
    const res = await fetch(`${baseUrl}/api/transcribe-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg" }),
    });

    assert(res.status === 200, "Valid JPEG returns HTTP 200", `Got status ${res.status}`);
    const data = await res.json();
    assert(data.status === "success", "Response status is 'success'", `Got: ${data.status}`);
    assert(data.averageConfidence >= 0.75, "Confidence passes threshold (>= 0.75)", `Got: ${data.averageConfidence}`);
    assert(Array.isArray(data.detections) && data.detections.length > 0, "Detections array returned", `Length: ${data.detections?.length}`);
    assert(typeof data.workId === "string" && data.workId.startsWith("work-"), "workId assigned for audit tracking", `workId: ${data.workId}`);
  } catch (e) {
    assert(false, "Valid JPEG upload threw unhandled exception", e.message);
  }

  // ----------------------------------------------------
  // TEST 2: Valid PNG Base64 Payload
  // ----------------------------------------------------
  console.log(`\n--- [2] Valid PNG Upload ---`);
  try {
    const pngBuf = createValidPngBuffer();
    const base64 = `data:image/png;base64,${pngBuf.toString("base64")}`;
    const res = await fetch(`${baseUrl}/api/transcribe-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mimeType: "image/png" }),
    });

    assert(res.status === 200, "Valid PNG returns HTTP 200", `Got status ${res.status}`);
    const data = await res.json();
    assert(data.status === "success", "PNG response status is 'success'", `Got: ${data.status}`);
    assert(data.averageConfidence >= 0.75, "PNG confidence >= 0.75", `Got: ${data.averageConfidence}`);
  } catch (e) {
    assert(false, "Valid PNG upload threw unhandled exception", e.message);
  }

  // ----------------------------------------------------
  // TEST 3: Invalid Magic Bytes (Fake Image / Corrupted)
  // ----------------------------------------------------
  console.log(`\n--- [3] Invalid Magic Bytes Rejection ---`);
  try {
    const fakeBuf = createInvalidImageBuffer();
    const base64 = `data:image/jpeg;base64,${fakeBuf.toString("base64")}`;
    const res = await fetch(`${baseUrl}/api/transcribe-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg" }),
    });

    assert(res.status === 400, "Corrupted/non-image buffer rejected with HTTP 400", `Got status ${res.status}`);
    const data = await res.json();
    assert(data.error?.includes("Invalid image format"), "Structured rejection message returned", `Error: ${data.error}`);
  } catch (e) {
    assert(false, "Corrupted image check threw unhandled exception", e.message);
  }

  // ----------------------------------------------------
  // TEST 4: Oversized Payload (>5MB Server Cap, SECURITY.md §9)
  // ----------------------------------------------------
  console.log(`\n--- [4] Oversized File Server-Side Cap ---`);
  try {
    const hugeBuf = createOversizedJpegBuffer();
    const base64 = `data:image/jpeg;base64,${hugeBuf.toString("base64")}`;
    const res = await fetch(`${baseUrl}/api/transcribe-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg" }),
    });

    assert(res.status === 413 || res.status === 400, "Oversized >5MB payload rejected with HTTP 413/400", `Got status ${res.status}`);
    const data = await res.json();
    assert(data.error?.includes("5MB limit"), "Explains 5MB cap in error message", `Error: ${data.error}`);
  } catch (e) {
    assert(false, "Oversized file check threw unhandled exception", e.message);
  }

  // ----------------------------------------------------
  // TEST 5: Preset Handwriting Sample (Clear Algebra)
  // ----------------------------------------------------
  console.log(`\n--- [5] Handwriting Preset: sample-alg-001 ---`);
  try {
    const res = await fetch(`${baseUrl}/api/transcribe-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sampleId: "sample-alg-001" }),
    });

    assert(res.status === 200, "Preset returns HTTP 200", `Got status ${res.status}`);
    const data = await res.json();
    assert(data.status === "success", "Status is 'success'", `Got: ${data.status}`);
    assert(data.averageConfidence >= 0.75, "Confidence >= 0.75", `Got: ${data.averageConfidence}`);
    assert(data.suggestedDomain === "algebra", "Correctly identified as algebra domain", `Got: ${data.suggestedDomain}`);
    assert(data.detections.length === 5, "Extracted all 5 discrete lines", `Lines: ${data.detections.length}`);
  } catch (e) {
    assert(false, "Preset test threw unhandled exception", e.message);
  }

  // ----------------------------------------------------
  // TEST 6: Low Confidence Gate (< 0.75 Retake Trigger, RULES.md R14)
  // ----------------------------------------------------
  console.log(`\n--- [6] Confidence Gate: sample-blurry-001 ---`);
  try {
    const res = await fetch(`${baseUrl}/api/transcribe-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sampleId: "sample-blurry-001" }),
    });

    assert(res.status === 200, "Low-confidence returns HTTP 200 with structured status", `Got status ${res.status}`);
    const data = await res.json();
    assert(data.status === "low_confidence", "Status is 'low_confidence'", `Got: ${data.status}`);
    assert(data.averageConfidence < 0.75, "Average confidence is below threshold (< 0.75)", `Got: ${data.averageConfidence}`);
    assert(typeof data.message === "string" && data.message.includes("75%"), "Includes retake instruction message", `Message: ${data.message}`);
    assert(!data.workId, "workId is withheld when confidence gate fails", `workId: ${data.workId}`);
  } catch (e) {
    assert(false, "Low confidence gate check threw unhandled exception", e.message);
  }

  // ----------------------------------------------------
  // TEST 7: Zero Answer Key Leakage (RULES.md R7)
  // ----------------------------------------------------
  console.log(`\n--- [7] RULES.md R7 Security Audit: Zero Answer Leaks ---`);
  try {
    const res = await fetch(`${baseUrl}/api/transcribe-work`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sampleId: "sample-alg-flawed-002" }),
    });

    const data = await res.json();
    const rawString = JSON.stringify(data);

    assert(!rawString.includes('"isFlawed"'), "Payload does NOT contain 'isFlawed'", "Clean");
    assert(!rawString.includes('"errorType"'), "Payload does NOT contain 'errorType'", "Clean");
    assert(!rawString.includes('"explanationOfFlaw"'), "Payload does NOT contain 'explanationOfFlaw'", "Clean");
    assert(!rawString.includes('"flawedStepIndex"'), "Payload does NOT contain 'flawedStepIndex'", "Clean");
  } catch (e) {
    assert(false, "R7 leak check threw unhandled exception", e.message);
  }

  console.log(`\n======================================================`);
  console.log(`📊 PHASE 5a TEST SUMMARY:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total Assertions: ${passed + failed}`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

// Read port from args or default to 3000
const port = process.argv[2] || 3000;
runTests(`http://localhost:${port}`);
