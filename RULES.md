# RULES.md — Agent Build Rules for CogniTrace
Version 2.0. Read PRD.md, ARCHITECTURE.md, DESIGN.md, and SECURITY.md first — this file governs *how* to build, not *what*. Phases 0–3 were built under v1.0 of these rules and passed all Definition of Done checks; v2.0 adds refinements learned from that build.

## R1 — Phase Discipline (most important rule)
Never start a new phase's work until every prior phase's "Definition of Done" item is checked off and manually verified working end-to-end. This discipline is proven: Phases 0–3 shipped with zero unresolved Definition of Done items. Keep doing exactly this for Phase 4 and beyond.

## R1a — Mandatory Checkpoint Before Every Phase Transition
Before moving between phases, the agent MUST:
1. Print the Definition of Done checklist for the phase just completed, with real pass/fail status
2. State which items were verified by actually running the app, not just "the code should do this"
3. Flag known risks/shortcuts/TODOs introduced
4. **Wait for explicit user confirmation before writing any code for the next phase**
Do not self-approve and continue, even under time pressure.

## R2 — Structured Output Only
Every LLM call goes through NVIDIA NIM (ARCHITECTURE.md §5) and every response is validated against a Zod schema before touching app state. Parse defensively via `parseModelJson.ts` (strips `<think>` traces — confirmed necessary even with `enable_thinking: false`, as trace fragments can still appear). Never parse free-form text with regex for app logic. On schema failure: retry once with a corrective system message, then fall back to a seed problem.

## R2a — Reasoning Mode Is Explicit and Now Fixed
Per the Phase 0 benchmark, both Generator and Grading agents use `enable_thinking: false` (1.4s latency vs 5.5–13.5s for reasoning modes). **Do not silently change this default in later phases** — if a new domain's error-planting logic seems to need more reasoning depth, that's a signal to strengthen the prompt/few-shot examples first, not to flip reasoning on and reintroduce the latency risk that was deliberately engineered out. If reasoning mode ever needs to change, treat it as a flagged architectural decision (R13), not a quiet tweak.

## R2b — JS SDK Parameter Handling (learned from Phase 0)
The JS OpenAI SDK does not support `extra_body` the way the Python SDK does. `chat_template_kwargs` must be passed directly in the request payload. Do not reintroduce the `extra_body` pattern from older documentation/examples — it will fail with a 400 validation error, as already discovered once.

## R3 — Design Token Discipline
All UI uses only the tokens in DESIGN.md §2 and §4. No ad-hoc hex colors, no default Tailwind gray/blue/green, no `rounded-md`/`rounded-lg`. This has held cleanly through Phase 0–3 (confirmed: strict 4-color palette, binary radius rule) — keep it that way for Physics/Chemistry domain UI and the report card in Phase 4.

## R4 — Centralize Prompts
All LLM prompts live in `/lib/ai/prompts.ts`. New domain archetypes (Physics, Chemistry) get added here following the exact pattern already used for `CODE_CONCEPTS` — don't invent a new prompt organization scheme for new domains.

## R4a — API Key Handling
`NVIDIA_NIM_API_KEY` lives only in `.env.local` (gitignored) and Vercel's environment variable dashboard. Never hardcoded, logged, committed, or shown in the demo video/README/screenshots. If exposed, rotate immediately at build.nvidia.com. See SECURITY.md for the full pre-submission verification checklist — Phase 4a runs this explicitly before any new feature work.

## R5 — Fallback-First for Demo Safety
Every domain must ship with 5+ hardcoded seed problems in `/lib/fallback/seed-problems.ts` before that domain is considered done — this was correctly applied to both Algebra and Code Debugging and must be applied identically to Physics and Chemistry in Phase 4. No domain skips this step, regardless of how reliable live generation seems in testing.

## R6 — No Premature Backend Complexity
Client-side state (SessionContext + sessionStorage) plus a server-side in-memory `problemStore` has proven sufficient through Phase 3. Do not introduce Supabase, auth, or persistent cross-session storage — there is no remaining phase in this plan that requires it.

## R7 — Never Leak Answers to the Client
`isFlawed`/`errorType`/`explanationOfFlaw` must never reach the client before grading. Verified clean via Network tab inspection through Phase 3. **Re-verify this explicitly after any schema or route change** — adding new fields (e.g. `confidence` in Phase 4d) is exactly the kind of change that can accidentally reintroduce a leak if the client-safe schema isn't updated in lockstep.

## R8 — Commit and Checkpoint Frequently
Commit after every completed feature, referencing phase/task (e.g. `feat: physics domain generator - Phase 4b`). Rollback safety net, unchanged from v1.0.

## R9 — Test the Unhappy Path
For every AI-dependent feature: API timeout (AbortController 7s, confirmed implemented), malformed JSON, empty/nonsensical user input. Extend this discipline to Physics/Chemistry — a pipeline proven reliable for Algebra doesn't guarantee reliability for a new prompt structure without the same unhappy-path testing.

## R10 — Match Existing Patterns
New domains, new components, and new features (confidence slider, report card) must match established folder/naming/state-management conventions (ARCHITECTURE.md §2). No new styling approach, no new state library, no new component pattern introduced mid-build.

## R11 — Explain Non-Obvious Choices Briefly
Comment non-trivial logic with *why*, not just *what* — especially the reasoning-mode tradeoff (R2a) and the JS SDK parameter quirk (R2b), since both were non-obvious discoveries during the actual build and are easy to accidentally "fix" incorrectly later without the context.

## R12 — Accessibility Baseline
Keyboard navigation (`1`-`5` flag, `Ctrl+Enter` submit) and text/icon indicators alongside all color-coded states are implemented and confirmed working. Extend identically to any new interactive elements added in Phase 4 (confidence slider must be keyboard-operable too).

## R13 — Stop and Flag, Don't Silently Guess
If a new domain's requirements are ambiguous, or a Phase 4 feature seems to conflict with an established pattern, stop and flag it rather than silently deciding. This includes: if Physics/Chemistry error archetypes turn out to need looser grading tolerance than Algebra's exact-match logic, flag that explicitly rather than quietly loosening the Grading Agent's rubric.

## R14 — Mirror Mode: Never Audit an Unconfirmed Transcription (Phase 5)
OCR output must be shown to the student for confirmation/correction before the Verifier Agent runs. Do not skip this step even if OCR confidence scores look high in testing — a demo-day handwriting sample can always be the exception. Auditing a mis-transcribed step asks the student to defend against an error the OCR introduced, not one they made — this is a trust-breaking failure mode, not a minor UX gap.

## R15 — Mirror Mode: Live-Computed Ground Truth Gets the Same Rigor as Generated Ground Truth
The Verifier Agent computes correctness live (re-solving the problem itself) rather than retrieving a pre-planted answer key. This is a fundamentally less-tested code path than the Generator Agent's — apply the same validation/retry/graceful-fallback discipline (R2, R5) to it, and explicitly stress-test it with intentionally messy/ambiguous handwritten samples before considering Phase 5 done, not just clean test cases.
