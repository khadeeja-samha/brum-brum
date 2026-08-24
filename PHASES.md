# PHASES.md — CogniTrace Build Phases
Version 2.0. Phases 0–3 are complete and verified (see project memory log). This document now reflects actual status and folds in Phase 4.

> **Agent instruction (RULES.md R1a): at the end of every open phase below, stop, print the Definition of Done checklist with real pass/fail status verified by actually running the app, flag any risks/TODOs, and wait for explicit user confirmation before starting the next phase. Do not self-approve.**

---

## Phase 0 — Setup ✅ COMPLETE
Next.js + Tailwind + Bauhaus tokens live. NVIDIA NIM client configured (`nvidia/nemotron-3-ultra-550b-a55b`). Reasoning-mode benchmark run: `enable_thinking: false` chosen as default (1.40s latency, clean JSON, exact 1-flaw count). Deployed to Vercel.

**Resolved issues**: `create-next-app` directory collision, Windows file-lock on cleanup, JS SDK `extra_body` incompatibility (fixed by passing `chat_template_kwargs` directly — see RULES.md R2b).

---

## Phase 1 — Must Have: Single-Topic Core Loop ✅ COMPLETE
Generator/Grading agents, Zod schemas, centralized prompts, server-side `problemStore` (answer-key obfuscation, R7 satisfied), retry+fallback pipeline, seed-problem safety net (12 Algebra items), full Challenge→Verdict loop wired.

**Verified**: full loop zero-crash; 1-flaw generation confirmed across repeated live tests; seed fallback tested via forced fallback and real 503 handling; answer key confirmed absent from network payload; production build clean.

---

## Phase 2 — Good to Have: Understanding Map & Variety ✅ COMPLETE
React Flow Understanding Map (Bauhaus node styling, live mastery colors), Curriculum hub with topic filtering, in-challenge Map drawer, keyboard navigation (`1`-`5`, `Ctrl+Enter`), NIM client timeout (AbortController, 7s).

**Verified**: map updates match mastery formula in real time; 8+ archetypes confirmed non-repetitive; keyboard nav + accessible indicators confirmed; production build clean (1.4s Turbopack).

---

## Phase 3 — Winning Features ✅ COMPLETE
Second domain (Code Debugging: 5 archetypes, Python/JS), dedicated seed problems, Session Summary screen (stats, confetti, mastery breakdown), multi-domain topic filtering, README.

**Verified**: dual-domain core loop confirmed live (Algebra + Code); code domain seed fallback present; summary screen renders correctly; full end-to-end browser verification run completed and recorded; production build clean (1.04s).

---

## Phase 4 — Security Hardening + Domain Expansion (IN PROGRESS)
See **PHASE4.md** for full detail. Summary:

### 4a — Security Hardening Pass
Run SECURITY.md §8 checklist in full. Add explanation-length cap, malformed-request validation on `/api/grade-attempt`, `npm audit` pass.

### 4b — Domain 3: Physics
Kinematics/forces/energy archetypes, ground-truth verifiable, mirrors the Code Debugging build pattern exactly (prompts → seed problems → SessionContext → Understanding Map 3-way switch → topics filter).

### 4c — Domain 4: Chemistry
Balancing equations/stoichiometry archetypes, same pattern, Understanding Map becomes 4-way switch.

### 4d — Confidence Calibration Slider
1-5 confidence rating per attempt, calibration-aware verdict messaging, summary-screen calibration stat. New `confidence` field added to grade-attempt request — **must re-verify R7 after this schema change**.

### 4e — Shareable Report Card
Canvas-rendered session stats image, downloadable from Summary screen.

**🛑 CHECKPOINT after each sub-phase (4a→4b→4c→4d→4e)** — same discipline as Phases 0–3. See PHASE4.md for individual Definition of Done per sub-phase.

---

## Day 13 — Buffer / Submission Day
- No new features beyond Phase 4. Only bug fixes discovered during final run-throughs.
- Re-record demo video AFTER Phase 4e (old script undersells the now-4-domain product — see PHASE4.md's updated video structure)
- Full run-through of the demo exactly as it will be recorded/shown, at least twice
- Update README to reflect Physics/Chemistry domains and confidence mechanic before making repo public
- Submit to Devpost well before the deadline — do not wait until the final hour

---

## Escalation Rule (unchanged, still applies)
If Phase 4 work threatens to run past Day 11 without 4a–4c (security + both new domains) complete, stop adding scope — 4d and 4e are enhancements, not requirements. A working 4-domain (or even 2-domain, security-hardened) app beats an ambitious but broken 4-domain-plus-extras app in every judged criterion.
