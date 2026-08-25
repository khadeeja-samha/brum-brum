# SECURITY.md — CogniTrace

**Status**: Phase 1 already verified R7 (no answer-key leakage) via live Network-tab inspection. This document's §8 checklist is the full Phase 4a task list — run it in order, check items off for real, don't assume prior verification covers new code paths (e.g. adding `confidence` to the grade-attempt schema in Phase 4d needs its own R7 re-check).

Scope note: this is a solo, 13-day hackathon MVP with no user accounts and no real user data at stake. The goal here isn't enterprise-grade security — it's closing the specific holes that would (a) leak your NVIDIA API key, (b) leak the answer key and embarrass you live in front of judges, or (c) let a malicious input break the demo. Treat this as a pre-flight checklist, not a compliance audit.

## 1. API Key Protection (Highest Priority)
The `NVIDIA_NIM_API_KEY` is the single most sensitive secret in this project — a leaked key means someone else burns your quota/spend.

- **Storage**: only in `.env.local` (must be in `.gitignore` — verify this on Day 1, not Day 10) and Vercel's Environment Variables dashboard. Never anywhere else.
- **Never**: hardcode it in a file, paste it into a commit, log it to console (even in dev — `console.log(process.env)` is an easy accidental leak), include it in a screenshot, or read it aloud/show it on screen in the demo video.
- **Server-only access**: the key must only ever be referenced inside `/lib/ai/client.ts` and used from Next.js **API routes** (server-side). Never expose it to a client component, never prefix the env var with `NEXT_PUBLIC_` (that would bundle it into client-side JS and expose it to anyone opening devtools).
- **If exposed**: rotate immediately at build.nvidia.com. Don't "fix it later" — a hackathon judge or a bot scraping public GitHub repos for leaked keys works fast.
- **Pre-submission check**: before making the GitHub repo public, grep the full commit history for the key pattern (`nvapi-`), not just the current file state — a key committed once and later deleted is still in git history and still exposed.

## 2. Never Leak the Answer Key to the Client
This is the specific, product-shaped security risk in CogniTrace (see RULES.md R7). The `isFlawed` / `errorType` fields are the "answer key" — if they're visible in the browser before grading, a judge (or anyone) opening devtools mid-demo sees the app "cheating."

- The Generator Agent's full response (including which step is flawed and why) is validated and stored **server-side only** (in-memory map keyed by `problemId` is fine for MVP).
- The response sent to the client for `/api/generate-problem` must be a **sanitized subset**: problem statement + step text only, no `isFlawed`/`errorType` fields, no hints.
- **Verify this concretely, not by assumption**: open browser devtools → Network tab → inspect the actual JSON response body of `/api/generate-problem` before every phase checkpoint. "The code shouldn't send it" is not the same as "confirmed it doesn't."
- Grading (`/api/grade-attempt`) is the only point where the correct answer is revealed to the client, and only after the user has already submitted their guess — never send it earlier "for convenience."

## 3. Prompt Injection Awareness (Low Risk, Still Worth a Guardrail)
The user's typed explanation (`explanation` field) gets sent to the Grading Agent as part of an LLM prompt. In a hackathon demo context this isn't a serious attack surface (no real users, no sensitive backend actions the model can take), but it's worth one cheap guardrail:

- Treat the user's explanation text as **untrusted input** inside the prompt: wrap it clearly (e.g. inside a labeled `<student_explanation>` block or delimiter) in the prompt template, so the model can't easily be confused into treating it as new instructions.
- The Grading Agent should never be given tool access, file access, or the ability to call other APIs — it's a pure text-in/JSON-out evaluator. This limits the blast radius of any injection attempt to "the AI gives a wrong grade," not "the AI does something harmful."
- Don't build anything (even later, in Phase 3+) where model output triggers a real-world action (sending emails, hitting external APIs, modifying files) without a human in the loop — not relevant to MVP scope, but worth flagging so it isn't accidentally added under time pressure.

## 4. Input Validation
- Cap explanation input length client-side and server-side (e.g. 500 chars) — prevents accidentally-huge payloads from blowing up token usage/cost on a single request.
- Validate `problemId` and `selectedStepIndex` server-side before using them to look up the in-memory answer map — reject malformed/out-of-range requests with a clean error, don't let a bad index throw an unhandled server exception mid-demo.
- Sanitize/escape any user-provided text before rendering it back in the UI (React does this by default via JSX, but double-check if you ever use `dangerouslySetInnerHTML` anywhere — don't, unless there's a very specific reason).

## 5. Rate Limits & Cost Control
- NVIDIA NIM's free developer tier has usage limits — check current limits at build.nvidia.com before the build, and again before demo day (limits/pricing can change).
- Add a simple client-side debounce/disable-button-while-loading on the "Generate" and "Submit" actions to prevent accidental double-fires from burning quota.
- If you add any kind of loop/retry logic (per R2's retry-once-then-fallback pipeline), cap it hard at 1 retry — never let a bug create an infinite retry loop against a paid API.

## 6. Deployment & Environment Hygiene
- Single Vercel production environment is fine for a hackathon (per ARCHITECTURE.md §6) — no need for staging, but do confirm environment variables are set in the Vercel dashboard for the **Production** environment specifically, not left only in a preview/dev scope.
- Before recording the demo video or submitting: reload the live Vercel URL in a fresh incognito window and confirm it works with zero local `.env.local` reliance — this also catches "works on my machine" env var mistakes.
- `.gitignore` must include `.env.local` and any `.env*.local` variants — verify this is in place on Day 1, before the first commit that could accidentally include it.

## 7. Dependency Hygiene (Lightweight, Not a Full Audit)
- Stick to well-known, actively maintained packages (Next.js, Zod, React Flow, the official `openai` SDK) — don't pull in obscure/unmaintained npm packages under time pressure just because they save 10 minutes.
- Run `npm audit` once before final submission — fix anything flagged as high/critical if it's a quick fix; don't rabbit-hole on low-severity findings during a 13-day sprint.

## 9. Image Upload Security (Phase 5 — new attack surface)
Mirror Mode is the first feature accepting user-uploaded files, which introduces a genuinely new risk category the rest of the app doesn't have.

- **File type validation**: accept only `image/jpeg` and `image/png` (check actual content-type/magic bytes server-side, not just the file extension — a renamed file is trivial to fake)
- **File size cap**: enforce a hard limit (e.g. 5MB) both client-side (before upload) and server-side (reject oversized payloads before they reach the OCR call) — prevents accidental cost/abuse from oversized images
- **No persistent storage**: uploaded images are processed in-memory/transient only for the OCR call and discarded — do not write them to disk or any persistent store; there's no product reason to retain them and every reason not to
- **No execution of uploaded content**: this should be obvious, but confirm the image is only ever passed as data to the OCR API, never interpreted, rendered as HTML, or used to construct file paths
- **Rate limiting consideration**: image uploads hit two chained model calls (OCR + Verifier Agent) — apply the same debounce/disable-while-loading pattern from §5, doubly important here since the cost per request is higher

## 10. Pre-Demo Security Checklist (run this before recording the video / submitting)
- [ ] `.env.local` confirmed in `.gitignore`, key never appears in git history (`git log -p | grep nvapi-` returns nothing)
- [ ] `/api/generate-problem` response inspected in Network tab — no `isFlawed`/`errorType` fields present before grading
- [ ] No `NEXT_PUBLIC_`-prefixed API key anywhere in the codebase
- [ ] Live Vercel URL tested in fresh incognito window, works with no local dependency
- [ ] Explanation input has a length cap, and malformed `problemId`/`selectedStepIndex` requests fail gracefully (no unhandled server crash)
- [ ] `npm audit` run, no unresolved high/critical findings
- [ ] README does not contain the API key, even as a "here's an example" placeholder that looks real
- [ ] (Phase 5) Uploaded image file type/size validation confirmed server-side, not just client-side
- [ ] (Phase 5) Confirmed no uploaded images are persisted to disk/storage anywhere in the pipeline
