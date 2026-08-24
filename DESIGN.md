# DESIGN.md — CogniTrace × Bauhaus
Version 2.0 — reflects actual implemented tokens/classes (Phases 0–3), not just planned ones.

---

## 1. Why Bauhaus for This Product
CogniTrace's core mechanic is geometric by nature: a node-based Understanding Map, discrete click-to-select interactions, and binary correct/incorrect verdicts. Bauhaus's "form follows function" philosophy and literal circle/square/triangle vocabulary aren't decoration here — they're the actual data visualization language of the app.

## 2. Confirmed Implemented Tokens
Live in `styles/tokens.css` and `app/globals.css`:

| Token | Hex | Meaning |
|---|---|---|
| Bauhaus Red | `#D02020` | Misconception / Alert / flagged step accent |
| Bauhaus Yellow | `#F0C020` | Unstable / Warning |
| Bauhaus Blue | `#1040C0` | Mastered / Accents |
| Background | `#F0F0F0` | Page canvas |
| Foreground/Border | `#121212` | Text, all borders, all hard shadows |
| Surface | `#FFFFFF` | Cards |
| Untested grey | `#E0E0E0` | Understanding Map default node state |

**Rule (unchanged, confirmed enforced): these are the only colors used anywhere in the app.**

Typography: Google Font **Outfit**, weights 400/500/700/900 — confirmed loaded and applied.

## 3. Confirmed Implemented Component Patterns

### Buttons — `bauhaus-btn` utility class
Mechanical press physicality implemented as a reusable utility (not repeated inline per-component): `active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`. Uppercase, bold, `border-2`/`border-4 border-[#121212]`.

### Shadows
Implemented exactly as specified: `shadow-[4px_4px_0px_0px_#121212]`, `shadow-[6px_6px_0px_0px_#121212]`, `shadow-[8px_8px_0px_0px_#121212]` — hex-explicit rather than the generic `black` keyword, keeping shadow color locked to the exact foreground token.

### Background Texture
`bg-bauhaus-dots` utility implements the dot-grid pattern used on the landing page and Understanding Map background.

### Step Cards (`StepCard.tsx`)
- Numbered, bordered blocks
- Click-to-flag uses `bauhaus-btn` press physicality
- Selected state: `border-l-[12px] border-[#D02020]` (thicker than original 8px spec — confirmed this reads more clearly at a glance during live testing) + triangle flag badge

### Verdict Panel (`VerdictPanel.tsx`)
- Full-bleed color-block flash: `#1040C0` on correct, `#D02020` on incorrect
- `canvas-confetti` celebration on correct catch
- Diagnostic breakdown panel reveals the true flaw

### Understanding Map (`UnderstandingMap.tsx`)
- `@xyflow/react`, styled with raw geometric nodes, no default rounded React Flow styling
- Live 4-color mastery fill (Red/Yellow/Blue/Grey per §2)
- **3px** black straight/angular orthogonal edges, zero curves (confirmed thicker than original 2-4px spec for better visibility at map scale)
- Interactive hover tooltips: concept name, accuracy ratio, live status
- Multi-domain switcher (2-way through Phase 3, extending to 4-way in Phase 4b/4c)

### Session Stats (`SessionStats.tsx`)
Bauhaus metric blocks: streak, bugs caught, audit accuracy. `"View Report →"` link when attempts exist.

### Curriculum Hub (`app/topics/page.tsx`)
Grid of topic cards (`border-4 border-[#121212]`, `shadow-[8px_8px_0px_0px_#121212]`), rotating geometric icons (circle/square/triangle in primary colors) per card, domain filter pills.

## 4. Design Criteria (unchanged — still the checklist for any new component)
Before shipping any UI piece (including Phase 4's Physics/Chemistry cards, confidence slider, report card):
1. **Palette check** — only the 7 confirmed tokens in §2
2. **Radius check** — `rounded-none` or `rounded-full` only
3. **Shadow check** — hard offset shadow using `#121212`, never `blur`/soft shadow, never bare `black` keyword (match the confirmed hex-explicit pattern)
4. **Border check** — every major element has a visible 2px or 4px `#121212` border
5. **Typography check** — headlines uppercase + font-black/bold, body font-medium, no light/thin weights
6. **Geometric-purity check** — new icons/decorations expressible as circle/square/triangle only
7. **Motion check** — 200-300ms, `ease-out`, mechanical — never a bounce/spring curve
8. **Function-first check** — boldness never reduces legibility of problem/step text

## 5. Phase 4 Additions — Design Guidance

### Confidence Slider (4d)
Implement as a 5-block segmented control (not a native `<input type="range">`, which would break the geometric-purity rule) — 5 square blocks, filled state = selected, using the same `bauhaus-btn` press physicality on each block for consistency with StepCard's click interaction.

### Report Card (4e)
Canvas-rendered, not DOM-screenshot — render directly onto a `<canvas>` using the confirmed token hexes so the exported image matches the app's actual look exactly (a DOM screenshot risks capturing font-loading race conditions or browser-specific rendering quirks).

### Physics/Chemistry Topic Cards
Reuse the exact Curriculum Hub card pattern from §3 — new domains get new rotating icon colors/shapes assigned from the same 3-shape/3-color rotation already established, not a new icon system.

## 6. What NOT to Do (unchanged)
- Don't introduce a 5th color under any circumstance
- Don't soften anything for "usability" via rounded corners or soft shadows
- Don't build Phase 4 UI pieces as one-off styled components — extend the confirmed reusable patterns (`bauhaus-btn`, shadow utilities, card pattern) rather than duplicating styles inline
