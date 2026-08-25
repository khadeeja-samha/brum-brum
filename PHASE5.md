# PHASE5.md — Mirror Mode (Multimodal Self-Audit)
Only start this phase because Phase 4 (security + Physics/Chemistry + confidence slider + report card) is complete and verified. This is the highest-risk phase in the build — it introduces file upload, a second AI model (OCR), and a live-computed (not pre-planted) ground truth. Budget real time for it, don't treat it as a quick add-on.

---

## Phase 5a — OCR Pipeline Foundation
**Tasks:**
- Set up `/api/transcribe-work` route calling Nemotron OCR v2's `/v1/ocr` endpoint (ARCHITECTURE.md §8a/8b)
- Implement server-side file validation: content-type check (not just extension), 5MB size cap (SECURITY.md §9)
- Implement confidence-gate logic: if average OCR confidence < 0.75, return a "please retake" response rather than proceeding
- Build the Upload Screen UI (DESIGN.md §6)

**Definition of Done:**
- [ ] Upload accepts valid JPEG/PNG, rejects invalid file types with a clean error (not a crash)
- [ ] Oversized files rejected server-side even if a malicious client skips the client-side check
- [ ] Low-confidence OCR result correctly triggers the retake flow, tested with an intentionally blurry/messy test image
- [ ] High-confidence OCR result correctly proceeds to structuring

**🛑 CHECKPOINT** — report status before 5b.

---

## Phase 5b — Structuring + Human Confirmation (Reliability-Critical, R14)
**Tasks:**
- Build the structuring pass: raw OCR text → discrete numbered steps via Nemotron 3 Ultra (`enable_thinking: false`)
- Build the Transcription Review Screen (DESIGN.md §6) — editable step cards, yellow "needs confirmation" state
- Wire "Confirm & Audit" CTA — must be explicitly clicked, no auto-proceed even on high OCR confidence

**Definition of Done:**
- [ ] Structuring pass reliably turns messy OCR text into clean numbered steps across 10+ test images of varying handwriting quality
- [ ] Student can edit any transcribed step before proceeding
- [ ] Confirmed: audit cannot begin without explicit user confirmation (test by trying to skip it)

**🛑 CHECKPOINT** — report status before 5c.

---

## Phase 5c — Verifier Agent (Live Ground Truth)
**Tasks:**
- Build `/api/verify-work` — Verifier Agent independently re-solves the problem and checks each confirmed step
- Apply the same Zod validation + retry-once discipline as the Generator Agent (RULES.md R15) — this is a *new* code path with less real-world testing than the proven Generator pipeline, treat it with equal or greater suspicion
- Handle the two outcomes: `fully_correct` (skip to celebration) and `has_error` (store first error server-side, return `ClientSafeProblem`-shaped response, R7 applies identically)
- Build the graceful failure fallback (ARCHITECTURE.md §8e — text-input fallback if OCR/Verifier fails, not a dead end)

**Definition of Done:**
- [ ] Verifier Agent correctly identifies planted errors in 10+ test cases where you deliberately write flawed work
- [ ] Verifier Agent correctly returns `fully_correct` on 5+ test cases of genuinely correct work (no false positives)
- [ ] Answer (which step, if any, is wrong) confirmed NOT visible in network tab before the student submits their flag
- [ ] Failure fallback tested: force an OCR/Verifier failure, confirm the app offers a clear alternative path, not a dead end

**🛑 CHECKPOINT** — report status before 5d.

---

## Phase 5d — Integration + Stress Test
**Tasks:**
- Wire Mirror Mode into the existing Challenge/Verdict UI — confirm StepCard/VerdictPanel work correctly reused for this flow, not just Algebra/Code/Physics/Chemistry
- Add Mirror Mode as a new entry point from the Topics/Landing screen
- Stress-test with deliberately messy handwriting samples, ambiguous phrasing, and at least one genuinely multi-error sample (confirm the "first error chronologically" rule holds)

**Definition of Done:**
- [ ] Full Mirror Mode loop (upload → transcribe → confirm → verify → audit → verdict) works end-to-end with zero unhandled errors across 10+ live runs
- [ ] Understanding Map correctly incorporates Mirror Mode results into existing mastery tracking (same concept tags, no separate/orphaned tracking system)
- [ ] Deployed and tested on live Vercel URL

**🛑 CHECKPOINT** — final report before demo video re-record.

---

## Escalation Rule (Phase 5 specific)
Mirror Mode is a genuine differentiator but it's also the riskiest feature in the entire build — it's the only one with two chained AI calls, a new input modality, and live-computed (not pre-planted) ground truth. **If Phase 5c isn't reliably passing its Definition of Done by your self-imposed cutoff, do not bring it into the live demo.** A confident 4-domain CogniTrace without Mirror Mode beats a 5-capability CogniTrace where the newest, least-tested feature might glitch on stage. If time runs short, it's completely reasonable to build Mirror Mode, demo it via a pre-recorded clip in the video (clearly working, just not live-clicked), and mention live availability in the README — this de-risks the demo while still showcasing the feature.

## Updated Pitch Structure (final version, incorporating Mirror Mode)
1. Hook: "AI tutors make you feel smart. This one catches you not being." (unchanged)
2. Quick multi-domain flash: Algebra, Code, Physics, Chemistry topic grid
3. Live demo: flag an AI-planted step, confidence slider ("90% confident and wrong") beat, verdict
4. **New closing beat**: "But it doesn't stop at auditing the AI." → show a photo of real handwritten work being uploaded → transcribed → audited → student catches their own mistake. This is your strongest, most memorable closing image — end on it.
5. Report card reveal + close
