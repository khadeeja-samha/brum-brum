# CogniTrace

> **"Catch the AI's mistake before it catches you."**

### 🔗 [Live Demo — cognitrace.vercel.app](https://cognitrace-3q5oskrz7-lyk-02s-projects.vercel.app/)

[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black?style=flat&logo=next.js)](https://nextjs.org/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA%20NIM-Nemotron--3%20Ultra-76B900?style=flat&logo=nvidia)](https://build.nvidia.com/)
[![React Flow](https://img.shields.io/badge/React%20Flow-Understanding%20Map-FF0072?style=flat)](https://reactflow.dev/)
[![Design System](https://img.shields.io/badge/Aesthetics-Bauhaus%20Constructivism-D02020?style=flat)](#design-philosophy)

---

## 💡 The Problem: The Illusion of Competence

When students learn using AI tutors, they read fluent, authoritative explanations and mistake **fluency of reading** for **true understanding**.

Current AI education tools are built to *answer*, not to be *audited*. Students passively consume AI outputs and atrophy their critical verification and debugging intuition — a documented pattern across educators, self-taught programmers, and STEM students alike.

## 🎯 The Solution: Active Cognitive Verification

**CogniTrace** reverses the tutor dynamic:
1. **The AI Plants a Flaw**: NVIDIA NIM generates a full step-by-step worked solution — across Algebra, Physics, Chemistry, or Code Debugging — containing **exactly one planted logical error**.
2. **The Student Audits the Trace**: The student pinpoints the exact corrupted step, rates their **confidence (1–5)**, and articulates *why* it violates the underlying rule.
3. **The AI Evaluates the Rationale**: The Diagnostic Grading Agent checks step selection, explanation quality, *and* how well the student's confidence matched reality — rewarding genuine understanding over lucky guesses, and flagging overconfident misses.
4. **Live Understanding Map**: A real-time node graph transitions colors across all four domains based on rolling concept mastery.
5. **Mirror Mode — Audit Yourself**: Beyond AI-planted errors, students can photograph their own real handwritten work. CogniTrace transcribes it, independently re-solves it, and — if a genuine mistake exists — challenges the student to find it in **their own** solution, using the exact same audit mechanic.

**👉 Try it now: [cognitrace-3q5oskrz7-lyk-02s-projects.vercel.app](https://cognitrace-3q5oskrz7-lyk-02s-projects.vercel.app/)**

---

## 🏛️ Bauhaus Design System (Constructivist Modernism)

Form follows function. The UI avoids soft gradients, decorative fluff, or generic templates in favor of a raw geometric vocabulary:
- **Strict 4-Color Semantic Palette**:
  - 🔴 **Bauhaus Red (`#D02020`)**: Misconception / Needs Review
  - 🟡 **Bauhaus Yellow (`#F0C020`)**: Unstable / Developing
  - 🔵 **Bauhaus Blue (`#1040C0`)**: Mastered / Locked-in
  - ⚪ **Bauhaus Base (`#F0F0F0` / `#121212`)**: High-contrast canvas & borders
- **Physicality**: Hard offset shadows (`shadow-[6px_6px_0px_0px_#121212]`), thick black borders (`border-4`), and decisive button-press click mechanics on every interaction — including flagging a step and setting your confidence level.
- **Typography**: Google Font **Outfit** (Display Bold & 900 Black), always uppercase for headlines.

---

## ⚡ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                       │
│  - Next.js App Router (/topics, /challenge, /summary, /mirror)│
│  - React Flow Understanding Map (4-domain switcher)          │
│  - React Session Context (rolling mastery + calibration)     │
└──────────────────────────────┬──────────────────────────────┘
                               │ fetch JSON (Sanitized)
┌──────────────────────────────▼──────────────────────────────┐
│                  Next.js API Layer (Server)                  │
│  /api/generate-problem   → plants 1 flaw, Algebra/Physics/   │
│                             Chemistry/Code                    │
│  /api/grade-attempt      → verdict + confidence calibration   │
│  /api/transcribe-work    → Mirror Mode: OCR on uploaded photo │
│  /api/structure-work     → Mirror Mode: raw text → steps      │
│  /api/verify-work        → Mirror Mode: live ground-truth      │
│                             audit of the student's real work  │
│  - Zod-validated everywhere, answer keys never leave server   │
│    pre-grading (R7), retry-once + seed-problem fallback (R5)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│              NVIDIA NIM Hosted Endpoints (build.nvidia.com)   │
│  Reasoning: nvidia/nemotron-3-ultra-550b-a55b (enable_thinking:false)│
│  Vision/OCR: meta/llama-3.2-11b-vision-instruct               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart & Setup

Want to run it locally instead of using the [live demo](https://cognitrace.vercel.app/)?

### 1. Prerequisites
- Node.js 18+ (tested on Node v20/v24)
- npm or yarn

### 2. Clone & Install
```bash
git clone https://github.com/your-repo/cognitrace.git
cd cognitrace
npm install
```

### 3. Configure Environment
Create a `.env.local` file in the root directory:
```bash
# NVIDIA NIM API Key from build.nvidia.com
NVIDIA_NIM_API_KEY=your_nvidia_nim_api_key_here

# Reasoning model — powers problem generation, grading, structuring, and verification
NVIDIA_NIM_MODEL=nvidia/nemotron-3-ultra-550b-a55b

# Vision model — powers Mirror Mode's handwriting OCR
NVIDIA_NIM_VISION_MODEL=meta/llama-3.2-11b-vision-instruct
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Multi-Domain Curriculum

CogniTrace covers **four STEM diagnostic domains** across 21 tracks, each with its own error archetypes, live generation, and seed-problem safety net:

### Domain 1: High School Algebra
- Distributive Property & Negatives · Sign Handling · Fraction Elimination · Order of Operations · Variable Isolation · Combining Like Terms

### Domain 2: Classical Physics & Mechanics
- Unit Conversion Errors · Sign Errors on Vectors · Wrong Kinematic Equation Selection · Energy Not Conserved · Missing Friction Terms
- Every problem explicitly states its coordinate sign convention up front, so grading is never ambiguous.

### Domain 3: General Chemistry & Stoichiometry
- Unbalanced Coefficients · Wrong Mole Ratios · Significant Figure Errors · Wrong Limiting Reagent · Charge Imbalance
- Renders proper chemical notation with Unicode subscripts/superscripts (e.g. `C₄H₁₀`, `Zn²⁺`) and fixed 2-decimal atomic mass precision for consistent grading.

### Domain 4: Code Debugging (Python & JavaScript)
- Off-by-One Loop Bounds · Mutable Default Arguments · Shallow Copy Mutation · Missing `await` on Promises · Closure Scope Shadowing

---

## 🎚️ Confidence Calibration — Metacognition, Not Just Correctness

Before submitting an audit, students rate their confidence (1–5) via a 5-segment Bauhaus geometric selector (`[Alt+1–5]`). CogniTrace then tells them not just whether they were right, but whether their *certainty* matched reality:
- **Master Calibration**: high confidence, correct
- **Overconfidence Blindspot**: high confidence, wrong — the most educationally valuable signal in the whole app
- **Hidden Intuition**: low confidence, correct — you knew more than you thought
- **Prudent Caution**: low confidence, wrong — appropriately uncertain

A rolling **Calibration Index** and 4-quadrant breakdown appear on the Session Summary screen.

---

## 🪞 Mirror Mode — Multimodal Self-Audit

The same "audit, don't answer" lens, turned on your own real work:

1. **Photograph** your handwritten solution to any problem
2. **Transcribe**: a vision model reads the handwriting into raw text
3. **Confirm**: you review and correct the transcription before anything is graded — CogniTrace never audits a transcription you haven't personally verified
4. **Verify**: a Verifier Agent independently re-solves your problem from scratch to compute ground truth live — it doesn't already know the answer, unlike every other mode in the app
5. **Audit**: if a real mistake exists, you're challenged to find it in your own work; if your work is flawless, you get an instant "Flawless!" celebration instead

**Engineering note on live reliability**: Mirror Mode's Verifier Agent depends on two chained calls to NVIDIA's public NIM endpoint. Under load-testing, the public endpoint showed intermittent `503` overload responses, which our pipeline handles gracefully (clean error banners, manual-entry fallback, zero crashes) — but this makes ad-hoc live success rate variable enough that our demo video showcases Mirror Mode via a recorded walkthrough rather than a live on-stage call, while the four core domains (which run on a single, faster call) are demoed live. The code path is fully built, tested, and functional on the [live deployment](https://cognitrace.vercel.app/mirror) — this is a deliberate demo-reliability decision, not a missing feature.

---

## 🔒 Reliability & Security Guarantees
- **Zero Answer Leaks (R7)**: `isFlawed`, `errorType`, and Mirror Mode's live-computed flaw data remain server-side across all four domains and Mirror Mode; network payload inspections confirm nothing is discoverable via browser devtools before grading.
- **Credential Protection**: Full client bundle and HTML audits verify zero exposure of `NVIDIA_NIM_API_KEY`, API tokens, or server secrets in browser JavaScript chunks or network payloads.
- **Fault-Tolerant Fallback (R5)**: If remote AI endpoints rate-limit or time out, the app seamlessly serves from 20+ pre-vetted seed problems across all domains, with zero crashes.
- **Prompt Injection Guarding**: Student explanations are wrapped in explicit delimiter tags before being sent to the Grading Agent, so free-form user text can't be interpreted as new instructions.
- **Defensive Parsing**: Strips reasoning `<think>` traces and parses malformed JSON automatically, with a retry-once-then-fallback pipeline on every AI call.
- **Image Upload Hardening**: Magic-byte file validation (not just extension checks), a 5MB server-side cap, and zero disk persistence of uploaded photos.

---

## 🌐 Deployment (Vercel)

CogniTrace is optimized for zero-config serverless deployment on Vercel:

1. **Repository Setup**: Push your branch to GitHub/GitLab.
2. **Import Project**: Import the repository in [Vercel](https://vercel.com).
3. **Environment Variables**: Configure the following under **Project Settings > Environment Variables**:
   - `NVIDIA_NIM_API_KEY`: Your NVIDIA NIM API key (from [build.nvidia.com](https://build.nvidia.com/)).
   - `NVIDIA_NIM_MODEL`: `nvidia/nemotron-3-ultra-550b-a55b` (or preferred model).
   - `NVIDIA_NIM_VISION_MODEL`: `meta/llama-3.2-11b-vision-instruct` (for Mirror Mode OCR).
4. **Deploy**: Build automatically triggers (`npm run build`), routing dynamic endpoints to isolated serverless functions and pre-rendering static routes.

Live URL: **[https://cognitrace-3q5oskrz7-lyk-02s-projects.vercel.app/](https://cognitrace-3q5oskrz7-lyk-02s-projects.vercel.app/)** | **[https://cognitrace.vercel.app](https://cognitrace.vercel.app/)**

---

## ✅ Verified & Tested

Every phase of this build passed its own automated test suite before moving forward — 88/88 assertions passing on the full master test suite as of the final build, spanning all 4 domains, the confidence calibration system, and the complete Mirror Mode pipeline. `npx tsc --noEmit` runs clean with zero TypeScript errors.

An automated live penetration audit on the production URL (`cognitrace.vercel.app`) confirmed all 14 Next.js production JavaScript bundles, HTML documents, and API responses are 100% free of credential leaks and client-side answer key vulnerabilities.

---

## 📜 License
MIT License.