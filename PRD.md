# PRD — CogniTrace
**"Catch the AI's mistake before it catches you."**

Version: 2.0 (post Phase 0–3, reflects current built state)
Owner: Laik (solo)
Timeline: 13 days (Aug 17 – Sep 5, 2026)
Hackathon: Prometheus September AI Challenge

---

## 1. Problem Statement
Students using AI tutors passively read explanations and mistake fluency-of-reading for understanding (the "illusion of competence"). No mainstream tool forces active verification of a claimed solution — every tool is built to *answer*, not to be *audited*.

## 2. Goal
A web app where a student is shown a fully worked AI-generated solution containing exactly one planted logical error, and must locate + explain the error to prove real understanding. Track proven mastery per concept over a session, across multiple STEM domains.

## 3. Target Users
- **Primary**: High school / early college students studying Algebra or learning to program, who use AI tutors and want to actually retain concepts
- **Secondary (now live)**: Self-taught programmers / bootcamp students — served directly by the Code Debugging domain
- **Tertiary (future)**: Teachers wanting a diagnostic tool for class-wide misconception tracking

## 4. Current Scope (what's actually built, as of Phase 3 completion)
- **Domain 1 — Algebra**: linear equations, 8+ archetypes (sign_handling, distributive_property, order_of_operations, fraction_elimination, variable_isolation, arithmetic_slip, etc.)
- **Domain 2 — Code Debugging**: Python/JS, 5 archetypes (off_by_one, mutable_default_args, shallow_copy_mutation, async_missing_await, scope_shadowing)
- Full generate → flag → explain → grade → verdict loop, live on both domains
- Understanding Map (React Flow) with dual-domain switcher, live mastery updates
- Session Summary screen with stats, concept breakdown, confetti at ≥70% accuracy
- Fallback seed-problem safety net for both domains (R5 satisfied)
- Keyboard navigation (`1`–`5` flag, `Ctrl+Enter` submit), accessible status indicators

## 5. Phase 4 Scope (in progress)
- Security hardening pass (see SECURITY.md)
- **Domain 3 — Physics**: kinematics/forces/energy, ground-truth verifiable
- **Domain 4 — Chemistry**: balancing equations/stoichiometry, ground-truth verifiable
- Confidence calibration slider (1-5, captured per attempt) — new metacognition mechanic
- Shareable report card (canvas-rendered session stats image)

## 6. Out of Scope (still, even post-Phase 4)
- User authentication / persistent accounts across sessions
- Voice input
- Payments/monetization implementation
- Mobile native app (responsive web only)
- Multiplayer/leaderboard features (explicitly deprioritized, see PHASE4.md)

## 7. Success Criteria (Definition of "Done" for Demo Day)
- [x] Full core loop works with zero crashes (verified Phase 1)
- [x] Answer key (`isFlawed`/`errorType`/`explanationOfFlaw`) never leaks to client pre-grading (verified Phase 1, R7)
- [x] Understanding Map accurately reflects mastery state changes in real time (verified Phase 2)
- [x] 8+ distinct problem/error variations avoid visible repetition (verified Phase 2)
- [x] Second domain (Code Debugging) fully wired with its own seed fallback (verified Phase 3)
- [x] Security checklist (SECURITY.md §8) fully confirmed, not assumed (verified Phase 4a)
- [x] Third domain (Physics Mechanics) live, 10x tested with live AI calls & seed safety net (verified Phase 4b)
- [ ] Fourth domain (Chemistry) live and tested (Phase 4c)
- [ ] Confidence calibration mechanic live and demo-ready (Phase 4d)
- [ ] Shareable report card functional (Phase 4e)
- [ ] Demo video re-recorded to reflect full Phase 4 scope, ≤120 seconds

## 8. Functional Requirements (current + Phase 4 additions)

### FR1 — Problem Generation (live, all domains)
Generates a problem, full step-by-step solution, injects exactly one identifiable error tagged by archetype. Validated via Zod schema; retried once on failure; falls back to seed problem on repeated failure or NIM 503/timeout.

### FR2 — Challenge Presentation (live)
Displays problem + all steps, clickable/selectable. User selects the flawed step and types an explanation before submitting. Keyboard shortcuts supported.

### FR3 — Grading (live)
Compares selected step against ground truth via Grading Agent; returns `correct | partially_correct | incorrect` + concept tag + mastery delta.

### FR4 — Understanding Map (live, extending to 4 domains in Phase 4)
React Flow node graph, one node per concept, color-coded by rolling mastery: Red (misconception) → Yellow (unstable) → Blue (mastered) → Grey (untested).

### FR5 — Session Loop (live)
Streak/score tracking, session summary on demand, sessionStorage persistence within a browser session.

### FR6 — Confidence Calibration (Phase 4d, new)
Before submitting a flag, user rates confidence 1-5. Verdict screen surfaces a calibration-aware message (e.g. "90% confident and wrong"). Summary screen shows an overconfidence/underconfidence stat.

### FR7 — Shareable Report Card (Phase 4e, new)
Canvas-rendered image summarizing session stats in Bauhaus style, downloadable from the Summary screen.

## 9. Non-Functional Requirements
- **Reliability over completeness** — proven by the Phase 1 fallback pipeline design, must hold for Physics/Chemistry too
- **Latency**: generation/grading calls complete well under 5s using `enable_thinking: false` (benchmarked at ~1.4s in Phase 0) as the default for both agents
- **Determinism**: JSON schema-constrained model outputs everywhere, `<think>` trace stripping confirmed working
- **No auth, no persistent backend infra** — sessionStorage + in-memory server-side problem store is sufficient

## 10. Risks & Mitigations (updated post-build)
| Risk | Status |
|---|---|
| Generator produces 2+ errors | Mitigated — validation + retry-once pipeline confirmed working across 2 domains, must be re-verified per new domain |
| NIM transient 503s | Mitigated — confirmed graceful fallback to seed problems during Phase 1 stress testing |
| Problem repetition | Mitigated — temperature raised to 0.75, 8+ archetypes, expanded seed pool |
| Security: answer leakage | Verified clean in Phase 1; re-verify after any schema/route changes in Phase 4 |
| Scope creep into Tier 3 features (leaderboard, multiplayer) | Explicitly deprioritized in PHASE4.md |

## 11. Acceptance Criteria for Submission
- Public GitHub repo, README complete (already written, update for Phase 4 domains before submission)
- Live deployed URL, tested in fresh incognito
- 2-minute video, ≤120 seconds, re-recorded post-Phase 4 per the structure in PHASE4.md
