# ARCHITECTURE.md — CogniTrace
Version 2.0 — reflects actual built implementation (Phases 0–3 complete)

## 1. System Overview
A single Next.js 14 (App Router, TypeScript) application. No separate backend service. AI calls happen server-side via Next.js API routes. State is client-side (React Context + sessionStorage) — no database, no auth, confirmed sufficient through Phase 3.

```
┌─────────────────────────────────────────────┐
│                Browser (Client)               │
│  Next.js App Router pages + React components  │
│  - Landing / Topics / Challenge / Summary      │
│  - SessionContext: mastery map, streak, history│
│  - sessionStorage persistence                  │
└───────────────────┬───────────────────────────┘
                     │ fetch (JSON)
┌───────────────────▼───────────────────────────┐
│         Next.js API Routes (Server)            │
│  /api/generate-problem                          │
│  /api/grade-attempt                              │
│  - Server-side problemStore (answer key,         │
│    never sent to client pre-grading — R7)        │
└───────────────────┬───────────────────────────┘
                     │ (AbortController, 7s timeout)
┌───────────────────▼───────────────────────────┐
│   NVIDIA NIM — nvidia/nemotron-3-ultra-550b-a55b │
│   https://integrate.api.nvidia.com/v1            │
│   enable_thinking: false (confirmed default)      │
└─────────────────────────────────────────────────┘
```

## 2. Folder Structure (actual, as built)
```
/app
  page.tsx                        → Landing (Bauhaus hero)
  topics/page.tsx                 → Curriculum hub, domain filter pills, Understanding Map toggle
  challenge/[topicId]/page.tsx     → Challenge screen, in-session Map drawer
  summary/page.tsx                → Session Summary + report card (Phase 4e)
  api/
    generate-problem/route.ts
    grade-attempt/route.ts
/components
  StepCard.tsx                    → click-to-flag step block, keyboard shortcuts
  VerdictPanel.tsx                → full-bleed verdict flash, confetti
  SessionStats.tsx                → streak/accuracy metric blocks
  UnderstandingMap.tsx            → React Flow, multi-domain switcher
/lib
  ai/
    client.ts                     → NIM client, AbortController timeout (7s)
    prompts.ts                    → GENERATOR_SYSTEM_PROMPT, GRADING_SYSTEM_PROMPT,
                                     domain concept sets (CODE_CONCEPTS, + PHYSICS/CHEM in Phase 4)
    schemas.ts                    → Zod schemas (GeneratedProblemSchema, ClientSafeProblem, etc.)
    parseModelJson.ts             → strips <think> traces, defensive JSON parse
  state/
    SessionContext.tsx            → mastery map, streak, history, sessionStorage sync
    problemStore.ts                → server-side answer-key store, keyed by problemId
  fallback/
    seed-problems.ts               → pre-vetted problems per domain (R5 safety net)
/styles
  tokens.css                       → Bauhaus CSS variables
```

## 3. Data Contracts (as implemented)

### `/api/generate-problem` — POST
Request: `{ "topic": string, "forceFallback"?: boolean }`
Client-safe response (`ClientSafeProblem` schema — `isFlawed`/`errorType`/`explanationOfFlaw` stripped server-side):
```json
{
  "problemId": "uuid",
  "problemStatement": "string",
  "steps": [ { "stepIndex": 0, "text": "string" } ],
  "domain": "algebra | code | physics | chemistry",
  "conceptTag": "string"
}
```

### `/api/grade-attempt` — POST
Request: `{ "problemId": "uuid", "selectedStepIndex": number, "explanation": string, "confidence"?: 1|2|3|4|5 }`
Response:
```json
{
  "verdict": "correct | partially_correct | incorrect",
  "actualFlawedStep": number,
  "correctExplanation": "string",
  "conceptTag": "string",
  "masteryDelta": number
}
```
`confidence` field added in Phase 4d — stored in SessionContext, used for calibration messaging, not sent back from grading (calibration message is computed client-side from confidence + verdict).

## 4. Client State Shape (SessionContext, as implemented)
```ts
type MasteryState = {
  [conceptTag: string]: {
    attempts: number;
    correct: number;
    status: "untested" | "red" | "yellow" | "blue";
  };
};

type Attempt = {
  problemId: string;
  verdict: string;
  conceptTag: string;
  domain: string;
  confidence?: number; // Phase 4d
};

type SessionState = {
  mastery: MasteryState;
  streak: number;
  history: Attempt[];
};
```
Mastery calculation (pure function, unchanged from original spec):
- `untested`: attempts === 0
- `red`: correct/attempts < 0.4 OR attempts < 2
- `yellow`: 0.4 ≤ correct/attempts < 0.75
- `blue`: correct/attempts ≥ 0.75 AND attempts ≥ 3

Persisted to `sessionStorage` (confirmed working, survives refresh within a browser session, resets on "Reset Session History" action).

## 5. LLM Provider — NVIDIA NIM (Nemotron 3 Ultra), Confirmed Configuration

**Benchmark results (Phase 0, actual measured data):**
| Mode | Latency | JSON Valid | Notes |
|---|---|---|---|
| `enable_thinking: false` | **1.40s** | ✅ | **Chosen default for both Generator and Grading agents** |
| `enable_thinking: true, medium_effort: true` | 8.62s | ✅ | Too slow for interactive loop |
| `enable_thinking: true` (full) | 5.53s | ✅ | Too slow |
| No kwargs (default) | 13.53s | ✅ | Unacceptable, never use implicit default (RULES.md R2a) |

**Decision**: both agents run with `enable_thinking: false`. Reliability of "exactly one flawed step" is instead enforced by the validation + retry-once + seed-fallback pipeline (§6), not by relying on deep reasoning — this tradeoff has been confirmed working across 2 live domains through Phase 3 stress testing.

**Important implementation note (resolved Phase 0 issue)**: the JS OpenAI SDK does not accept `extra_body` the way the Python SDK does — `chat_template_kwargs` must be passed directly in the request payload, not nested under `extra_body`. See `/lib/ai/client.ts`.

```ts
// /lib/ai/client.ts (as implemented)
import OpenAI from "openai";

export const nim = new OpenAI({
  apiKey: process.env.NVIDIA_NIM_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
});

export const NIM_MODEL = "nvidia/nemotron-3-ultra-550b-a55b";

// AbortController timeout wraps every call — 7s hard cutoff,
// guarantees fallback engages even on an unexpected latency spike
```

## 6. Generation Reliability Pipeline (confirmed working, Phase 1–3)
1. Call Generator Agent, `enable_thinking: false`, temperature 0.75 (raised from 0.2 after Phase 1 repetition issue)
2. Strip `<think>` trace if present, defensively parse JSON (`parseModelJson.ts`)
3. Validate against Zod schema — reject if malformed
4. Verify `flawedCount === 1` — if not, retry once with corrective system message
5. On repeated failure, NIM 503, or 7s timeout: fall back to `/lib/fallback/seed-problems.ts` for the requested domain
6. Store full validated record server-side in `problemStore.ts` keyed by `problemId`; return `ClientSafeProblem` only

This pipeline is proven across Algebra + Code Debugging in live stress testing (15+ consecutive live generations, zero >1-flaw leaks to UI). **Must be re-verified for each new Phase 4 domain independently** — a pipeline working for one domain's prompt structure doesn't guarantee another domain's prompt is equally reliable.

## 7. Deployment
- Vercel, connected to GitHub main branch, auto-deploy on push
- Environment variables set in Vercel dashboard (Production scope), never committed
- `npm run build` confirmed clean (zero TS/ESLint errors) through Phase 3

## 8. Non-Goals (unchanged)
- No microservices, no separate backend server
- No authentication/session cookies beyond anonymous session state
- No websockets/real-time sync
- No queue/job system
