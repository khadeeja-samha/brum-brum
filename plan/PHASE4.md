# PHASE4.md — CogniTrace Expansion (Security Hardening + New Domains)
Only start this phase because Phase 1–3 are all verified complete (confirmed in project memory). Same checkpoint discipline applies — see RULES.md R1a.

---

## Phase 4a — Security Hardening Pass (do this first, ~30 min)
**Tasks:**
- Run the full SECURITY.md §8 Pre-Demo Checklist
- Specifically verify: `.gitignore` covers `.env.local`; `git log -p | grep nvapi-` returns nothing; no `NEXT_PUBLIC_`-prefixed key anywhere
- Add a hard character cap (500) on the explanation textarea, client + server side
- Add server-side validation rejecting malformed `problemId`/`selectedStepIndex` on `/api/grade-attempt` with a clean error (not an unhandled crash)
- Run `npm audit`, resolve any high/critical findings

**Definition of Done:**
- [ ] All SECURITY.md §8 checklist items confirmed, not assumed
- [ ] Malformed grade-attempt request tested manually (bad problemId, out-of-range stepIndex) — returns clean 4xx, no server crash
- [ ] `npm audit` clean or documented as accepted risk

**🛑 CHECKPOINT** — report status before starting 4b.

---

## Phase 4b — New Domain: Physics
**Why**: Ground-truth verifiable (kinematics, forces, energy conservation), reuses 100% of existing architecture — same Generator/Grading Agent pattern, same seed-problem safety net requirement (R5), same Understanding Map node pattern already proven with the Algebra/Code dual-domain switcher.

**Tasks:**
- Add physics error archetypes to `lib/ai/prompts.ts` (mirror the structure used for `CODE_CONCEPTS`): e.g. `unit_conversion_error`, `sign_error_vectors`, `wrong_kinematic_equation`, `energy_not_conserved`, `missing_friction_term`
- Add 5 pre-vetted physics seed problems to `lib/fallback/seed-problems.ts` (satisfies R5 for the new domain — non-negotiable, same as code domain)
- Add physics concept metadata to `lib/state/SessionContext.tsx`
- Extend `UnderstandingMap.tsx`'s domain switcher from binary (Algebra/Code) to a 3-way selector
- Add "Physics" filter pill to `app/topics/page.tsx`

**Definition of Done:**
- [ ] Physics track generates problems with exactly 1 planted flaw, validated same as existing domains
- [ ] 5 seed fallback problems present and tested via forced fallback
- [ ] Understanding Map correctly shows a 3rd domain view
- [ ] Full loop tested end-to-end at least 10 times with live AI calls, zero unhandled errors

**🛑 CHECKPOINT** — report status before starting 4c.

---

## Phase 4c — New Domain: Chemistry
**Why**: Same rationale as Physics — balancing equations and stoichiometry have hard ground truth, making grading reliable (your biggest architectural risk stays low).

**Tasks:**
- Add chemistry error archetypes: `unbalanced_coefficients`, `wrong_mole_ratio`, `sig_fig_error`, `wrong_limiting_reagent`, `charge_imbalance`
- Add 5 pre-vetted seed problems
- Wire into SessionContext, UnderstandingMap (now 4-way domain switcher), topics filter

**Definition of Done:** (mirror 4b's structure)
- [ ] Chemistry track generates problems with exactly 1 planted flaw
- [ ] 5 seed fallback problems present and tested
- [ ] Understanding Map shows 4th domain correctly
- [ ] Full loop tested 10x live, zero unhandled errors

**🛑 CHECKPOINT** — report status before starting 4d.

---

## Phase 4d — Confidence Calibration Slider
**Why**: This is the single highest-leverage Educational Impact addition available. It's not just "catch the bug" anymore — it's "learn to know when you don't know," which is a distinct, research-backed metacognition mechanic (calibration between confidence and accuracy) that no other likely competitor will have.

**Tasks:**
- Add a 1-5 confidence slider to the Challenge screen, shown right before submit, styled as a Bauhaus segmented control (5 square blocks, filled state = selected)
- Store confidence alongside each attempt in `SessionContext`
- On the Verdict screen, add a calibration callout: "You were 90% confident and wrong" / "You were unsure and right — trust yourself more" — this is a strong, quotable demo beat
- Add a simple calibration stat to the Session Summary screen (e.g. "Overconfidence rate: X%")

**Definition of Done:**
- [ ] Confidence captured on every attempt
- [ ] Verdict screen displays a calibration-aware message, not just correct/incorrect
- [ ] Summary screen shows at least one calibration metric

**🛑 CHECKPOINT** — report status before starting 4e.

---

## Phase 4e — Shareable Report Card
**Why**: Cheap to build (you already compute all the session stats), strong Presentation/Business Potential signal for judges — shows you thought about growth/virality, not just the core loop.

**Tasks:**
- Generate a static shareable image (canvas-based, reuse `canvas-confetti`-adjacent approach or a simple `<canvas>` render) styled in Bauhaus: "I CAUGHT X/Y AI MISTAKES TODAY" + accuracy + streak, on the Session Summary screen
- Add a "Download/Share" button
- Keep this simple — a styled canvas snapshot, not a full image-generation pipeline

**Definition of Done:**
- [ ] Report card image generates correctly reflecting real session stats
- [ ] Downloadable/shareable from the Summary screen

**🛑 CHECKPOINT** — final report before demo video re-recording.

---

## Tier 3 — Optional, Only If Time Remains After All of the Above
Not phase-gated, pick opportunistically:
- Coding domain expansion (more archetypes) — you already have this domain, just add variety
- Teacher misconception dashboard (even a static mock view) — strong pitch beat for B2B framing
- Text-to-speech read-aloud of problem steps — cheap accessibility win

**Explicitly deprioritized (don't build unless everything else is rock solid with days to spare):**
- Timed "Bug Hunt" mode / leaderboard — real scope risk, modest ROI on judging criteria
- Multiplayer head-to-head — too much new infra this close to a deadline

---

## Note on Demo Video
Since Phase 4 adds 2 new domains + a calibration mechanic + a shareable artifact, **re-record the demo video after Phase 4e**, not before. The old script (built around Algebra + Code only) is now underselling the product. New structure suggestion:
1. Hook: "AI tutors make you feel smart. This one catches you not being." (unchanged)
2. Quick multi-domain flash: show the topic grid — Algebra, Code, Physics, Chemistry — in under 5 seconds, signals breadth fast
3. Live demo: flag a step, confidence slider moment ("90% confident and wrong" beat), verdict
4. Understanding Map lighting up across domains
5. Report card reveal + close
