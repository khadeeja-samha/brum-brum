# CogniTrace

> **"Catch the AI's mistake before it catches you."**

[![Next.js](https://img.shields.io/badge/Next.js-14%2B-black?style=flat&logo=next.js)](https://nextjs.org/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA%20NIM-Nemotron--3%20Ultra-76B900?style=flat&logo=nvidia)](https://build.nvidia.com/)
[![React Flow](https://img.shields.io/badge/React%20Flow-Understanding%20Map-FF0072?style=flat)](https://reactflow.dev/)
[![Design System](https://img.shields.io/badge/Aesthetics-Bauhaus%20Constructivism-D02020?style=flat)](#design-philosophy)

---

## 💡 The Problem: The Illusion of Competence

When students and engineers learn using AI tutors, they read fluent, authoritative explanations and mistake **fluency of reading** for **true understanding**. 

Current AI education tools are built to *answer*, not to be *audited*. Students passively consume AI outputs and atrophy their critical verification and debugging intuition.

## 🎯 The Solution: Active Cognitive Verification

**CogniTrace** reverses the tutor dynamic:
1. **The AI Plants a Flaw**: NVIDIA NIM generates a full step-by-step worked solution (in Algebra or Code Debugging) containing **exactly one planted logical or algebraic mistake**.
2. **The Student Audits the Trace**: The student must pinpoint the exact corrupted line and articulate *why* it violates the underlying mathematical or computational rule.
3. **The AI Evaluates the Rationale**: The Diagnostic Grading Agent checks both the step selection and explanation quality, rewarding conceptual understanding over lucky guesses.
4. **Live Understanding Map**: A real-time node graph dynamically transitions colors based on rolling concept mastery.

---

## 🏛️ Bauhaus Design System (Constructivist Modernism)

Form follows function. The UI avoids soft gradients, decorative fluff, or generic templates in favor of a raw geometric vocabulary:
- **Strict 4-Color Semantic Palette**:
  - 🔴 **Bauhaus Red (`#D02020`)**: Misconception / Needs Review
  - 🟡 **Bauhaus Yellow (`#F0C020`)**: Unstable / Developing
  - 🔵 **Bauhaus Blue (`#1040C0`)**: Mastered / Locked-in
  - ⚪ **Bauhaus Base (`#F0F0F0` / `#121212`)**: High-contrast canvas & borders
- **Physicality**: Hard offset shadows (`shadow-[6px_6px_0px_0px_#121212]`), thick black borders (`border-4`), and decisive button-press click mechanics.
- **Typography**: Google Font **Outfit** (Display Bold & 900 Black).

---

## ⚡ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Browser (Client)                       │
│  - Next.js App Router (/topics, /challenge, /summary)       │
│  - React Flow Understanding Map                             │
│  - React Session Context (rolling mastery state)            │
└──────────────────────────────┬──────────────────────────────┘
                               │ fetch JSON (Sanitized)
┌──────────────────────────────▼──────────────────────────────┐
│                  Next.js API Layer (Server)                 │
│  /api/generate-problem                                      │
│  - Generates trace via NVIDIA NIM                           │
│  - Strips reasoning traces & validates via Zod              │
│  - Self-check: ensures exactly 1 planted flaw               │
│  - Obfuscates answer key (zero client devtools leaks)       │
│  - Auto-retries & falls back to 12 pre-vetted seed problems │
│  /api/grade-attempt                                         │
│  - Evaluates student explanation & computes mastery delta   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│           NVIDIA NIM Hosted Endpoint (build.nvidia.com)     │
│           Model: nvidia/nemotron-3-ultra-550b-a55b          │
│           - Explicit thinking mode & 7s timeout protection  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart & Setup

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
NVIDIA_NIM_MODEL=nvidia/nemotron-3-ultra-550b-a55b
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Multi-Domain Curriculum

CogniTrace covers two core diagnostic domains across 11 tracks:

### Domain 1: High School Algebra
- **Distributive Property & Negatives**: Parenthetical expansion with negative signs.
- **Sign Handling & Equal Transformations**: Sign flips across equations.
- **Fraction Elimination & Rational Forms**: Clearing LCD denominators across terms.
- **Order of Operations**: Grouping symbols and operator hierarchy.
- **Variable Isolation & Balancing**: Division by negative coefficients.
- **Combining Like Terms**: Simplifying algebraic expressions.

### Domain 2: Code Debugging
- **Array Indexing & Loop Bounds**: Python off-by-one errors in iterators.
- **Mutable Default Arguments**: Python function parameter state retention.
- **Reference & Shallow Copy Mutation**: JavaScript object spread side-effects.
- **Async Promises & Missing Awaits**: JavaScript unawaited execution traces.
- **Closure Scope & Unbound Variables**: Python closure variable bindings.

---

## 🔒 Reliability & Security Guarantees
- **Zero Answer Leaks (R7)**: `isFlawed` and answer keys remain server-side; network payload inspections confirm no answers can be discovered via browser devtools.
- **Fault-Tolerant Fallback (R5)**: If remote AI endpoints encounter rate limits or timeouts, the app seamlessly serves from a repository of 12 pre-vetted problems with zero crashes.
- **Defensive Parsing**: Strips reasoning `<think>` traces and parses malformed JSON outputs automatically.

---

## 📜 License
MIT License.
