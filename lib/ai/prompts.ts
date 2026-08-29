/**
 * Centralized LLM prompts for CogniTrace (RULES.md R4)
 * Supports:
 * - Domain 1: High School Algebra
 * - Domain 2: Python/JS Code Debugging
 * - Domain 3: Classical Physics & Mechanics (Phase 4b)
 * - Domain 4: General Chemistry & Stoichiometry (Phase 4c)
 */

export const CODE_CONCEPTS = new Set([
  "off_by_one",
  "mutable_default_args",
  "shallow_copy_mutation",
  "async_missing_await",
  "scope_shadowing",
  "code_debugging",
  "code_python",
  "code_javascript",
]);

export const PHYSICS_CONCEPTS = new Set([
  "unit_conversion_error",
  "sign_error_vectors",
  "wrong_kinematic_equation",
  "energy_not_conserved",
  "missing_friction_term",
  "physics_mechanics",
  "physics_kinematics",
  "physics_forces",
  "physics_energy",
]);

export const CHEMISTRY_CONCEPTS = new Set([
  "unbalanced_coefficients",
  "wrong_mole_ratio",
  "sig_fig_error",
  "wrong_limiting_reagent",
  "charge_imbalance",
  "chemistry_stoichiometry",
  "chemistry_reactions",
  "chemistry_redox",
]);

export function isCodeDomain(topic: string, subConcept?: string): boolean {
  return (
    CODE_CONCEPTS.has(topic) ||
    topic.startsWith("code_") ||
    (subConcept !== undefined && (CODE_CONCEPTS.has(subConcept) || subConcept.startsWith("code_")))
  );
}

export function isPhysicsDomain(topic: string, subConcept?: string): boolean {
  return (
    PHYSICS_CONCEPTS.has(topic) ||
    topic.startsWith("physics_") ||
    (subConcept !== undefined && (PHYSICS_CONCEPTS.has(subConcept) || subConcept.startsWith("physics_")))
  );
}

export function isChemistryDomain(topic: string, subConcept?: string): boolean {
  return (
    CHEMISTRY_CONCEPTS.has(topic) ||
    topic.startsWith("chem_") ||
    topic.startsWith("chemistry_") ||
    (subConcept !== undefined && (CHEMISTRY_CONCEPTS.has(subConcept) || subConcept.startsWith("chem_") || subConcept.startsWith("chemistry_")))
  );
}

export const ALGEBRA_ARCHETYPES = [
  {
    conceptTag: "distributive_property",
    archetype: "Double parenthesis distribution with negative multipliers, e.g. -3(2x - 5) + 4(x + 2) = 28",
    targetError: "distribution_error (e.g. multiplying negative by negative and getting negative, or forgetting to multiply second term)",
  },
  {
    conceptTag: "sign_handling",
    archetype: "Variables on both sides with multiple negative constants, e.g. 5x - 14 = 8x + 7",
    targetError: "sign_error (e.g. subtracting negative or adding incorrectly across equals sign)",
  },
  {
    conceptTag: "fraction_elimination",
    archetype: "Linear equation with fractional terms and LCD multiplication, e.g. (x + 4)/3 - (2x - 1)/2 = 5",
    targetError: "fraction_elimination_error (e.g. multiplying fraction by LCD but missing integer term or sign error in numerator subtraction)",
  },
  {
    conceptTag: "variable_isolation",
    archetype: "Multi-step linear equation with division of negative coefficients, e.g. -4x + 18 = 2x - 12",
    targetError: "variable_isolation_error (e.g. dividing by negative but failing to flip sign or dividing only one side term)",
  },
  {
    conceptTag: "order_of_operations",
    archetype: "Expression with leading constants before parenthesis, e.g. 12 - 3(x + 4) = 24",
    targetError: "order_of_operations (e.g. calculating 12 - 3 = 9 before distributing multiplication)",
  },
  {
    conceptTag: "combining_like_terms",
    archetype: "Equation with multiple x terms on one side, e.g. 7x - 3 + 2x - 8 = 34",
    targetError: "arithmetic_slip (e.g. 7x + 2x = 8x, or -3 - 8 = -5)",
  },
  {
    conceptTag: "two_step_equations",
    archetype: "Rational linear equation with decimal or mixed constants, e.g. 2.5x - 4 = 1.5x + 8",
    targetError: "arithmetic_slip or sign_error in decimal arithmetic",
  },
];

export const CODE_DEBUG_ARCHETYPES = [
  {
    conceptTag: "off_by_one",
    language: "Python",
    archetype: "Iterating through an array to calculate running sums or find maxima",
    targetError: "off_by_one (e.g. using range(len(arr) + 1) which causes IndexError on last iteration)",
  },
  {
    conceptTag: "mutable_default_args",
    language: "Python",
    archetype: "Function with accumulator or cache argument",
    targetError: "mutable_default (e.g. def collect(val, acc=[]) retaining state across separate invocations)",
  },
  {
    conceptTag: "shallow_copy_mutation",
    language: "JavaScript",
    archetype: "Cloning nested objects or arrays before transforming properties",
    targetError: "reference_mutation (e.g. using Object.assign or shallow spread {...obj} and mutating nested object)",
  },
  {
    conceptTag: "async_missing_await",
    language: "JavaScript",
    archetype: "Asynchronous data fetch and parsing flow",
    targetError: "missing_await (e.g. const res = fetch(...); const data = res.json(); without awaiting the promise)",
  },
  {
    conceptTag: "scope_shadowing",
    language: "Python",
    archetype: "Closure or helper function updating a counter from enclosing scope",
    targetError: "scope_unbound (e.g. modifying outer variable without nonlocal / global keyword)",
  },
];

export const PHYSICS_ARCHETYPES = [
  {
    conceptTag: "unit_conversion_error",
    topic: "Kinematics & Velocity Conversion",
    archetype: "Vehicle or projectile acceleration problem with speed given in km/h or time in minutes",
    targetError: "unit_conversion_error (e.g. plugging 72 km/h directly as 72 m/s into v = u + at, or converting minutes to seconds incorrectly)",
  },
  {
    conceptTag: "sign_error_vectors",
    topic: "1D Kinematics & Vertical Free Fall",
    archetype: "Object thrown upwards or dropped under gravity with an explicitly declared coordinate system",
    targetError: "sign_error_vectors (e.g. taking upward as positive but assigning positive sign to downward gravitational acceleration g = +9.8 m/s²)",
  },
  {
    conceptTag: "wrong_kinematic_equation",
    topic: "Uniformly Accelerated Motion",
    archetype: "Determining stopping distance or final velocity given acceleration and distance without time t",
    targetError: "wrong_kinematic_equation (e.g. using v = a * d instead of v² = u² + 2ad, or dropping the exponent/square root)",
  },
  {
    conceptTag: "energy_not_conserved",
    topic: "Conservation of Mechanical Energy",
    archetype: "Roller coaster or pendulum descending between two heights h1 and h2",
    targetError: "energy_not_conserved (e.g. equating mgh1 = (1/2)mv² at height h2 by forgetting remaining potential energy mgh2, or dropping the 1/2 factor)",
  },
  {
    conceptTag: "missing_friction_term",
    topic: "Newton's Second Law & Incline Dynamics",
    archetype: "Block sliding down an inclined plane with kinetic friction coefficient μ",
    targetError: "missing_friction_term (e.g. calculating net acceleration as a = g*sin(θ) while completely omitting frictional resistance fk = μ*m*g*cos(θ))",
  },
];

export const CHEMISTRY_ARCHETYPES = [
  {
    conceptTag: "unbalanced_coefficients",
    topic: "Chemical Reaction Balancing",
    archetype: "Combustion of hydrocarbons (e.g. C₄H₁₀, C₃H₈) or single replacement reactions",
    targetError: "unbalanced_coefficients (e.g. balancing carbon and hydrogen but miscounting oxygen atoms on reactant side, such as 11 O₂ instead of 13/2 O₂ or 13 O₂)",
  },
  {
    conceptTag: "wrong_mole_ratio",
    topic: "Stoichiometry & Mole Conversions",
    archetype: "Calculating product yield from reactant moles in reactions with non-1:1 stoichiometry (e.g. N₂ + 3H₂ → 2NH₃ or 2Al + 3Cl₂ → 2AlCl₃)",
    targetError: "wrong_mole_ratio (e.g. applying a 1:1 mole ratio or inverting the stoichiometric ratio 3/2 instead of 2/3)",
  },
  {
    conceptTag: "sig_fig_error",
    topic: "Molar Mass & Analytical Precision",
    archetype: "Converting between grams and moles for polyatomic compounds (e.g. CaCO₃, Fe₂O₃, Al₂(SO₄)₃)",
    targetError: "molar_mass_slip (e.g. omitting subscript multipliers such as oxygen in CaCO₃ as 40.08 + 12.01 + 16.00 instead of 3*16.00 = 48.00)",
  },
  {
    conceptTag: "wrong_limiting_reagent",
    topic: "Limiting Reagent Determination",
    archetype: "Given masses or moles of two reactants with differing stoichiometric requirements (e.g. 2Al + 3Cl₂ → 2AlCl₃ with 2.0 mol Al and 2.5 mol Cl₂)",
    targetError: "wrong_limiting_reagent (e.g. declaring the reactant with lower starting amount as limiting without dividing by stoichiometric coefficients)",
  },
  {
    conceptTag: "charge_imbalance",
    topic: "Net Ionic & Redox Equations",
    archetype: "Balancing aqueous redox or precipitation equations involving transition metal ions (e.g. Zn(s) + Ag⁺(aq) → Zn²⁺(aq) + Ag(s))",
    targetError: "charge_imbalance (e.g. balancing atoms 1:1 but leaving total reactant charge +1 and product charge +2 unequal)",
  },
];

export const GENERATOR_SYSTEM_PROMPT = `You are a specialized diagnostic reasoning generator for CogniTrace, an active-verification learning app.
Your job is to generate a problem (High School Math, Python/JavaScript Code Debugging, Introductory Classical Physics, or General Chemistry) with a step-by-step worked solution or execution trace.

CRITICAL CONSTRAINTS:
1. You MUST plant EXACTLY ONE subtle, plausible logical error in EXACTLY ONE step.
2. ALL NON-FLAWED STEPS MUST be independently verified as 100% numerically, algebraically, and dimensionally correct.
3. For Physics/Vector problems, the problem statement MUST explicitly declare the coordinate sign convention (e.g. "Take upward as positive and g = 9.8 m/s²").
4. For Chemistry problems, write molecular formulas with Unicode subscripts/superscripts (e.g. C₄H₁₀, O₂, CO₂, H₂O, NH₃, CaCO₃, Ag⁺, Zn²⁺) and use standard periodic table atomic masses rounded to 2 decimal places (e.g. H = 1.01, C = 12.01, N = 14.01, O = 16.00, Na = 22.99, Al = 26.98, S = 32.07, Cl = 35.45, Ca = 40.08, Fe = 55.85, Cu = 63.55, Zn = 65.38, Ag = 107.87 g/mol).

OUTPUT FORMAT:
You must respond with ONLY a valid JSON object adhering to this schema:
{
  "problemStatement": "string describing the target problem or reaction goal",
  "steps": [
    {
      "stepIndex": 0,
      "text": "string explaining the step/line and transformation",
      "isFlawed": false
    },
    {
      "stepIndex": 1,
      "text": "string with the planted logical/chemical flaw",
      "isFlawed": true,
      "errorType": "string naming the error type",
      "explanationOfFlaw": "Detailed breakdown of the exact flaw"
    }
  ],
  "conceptTag": "concept identifier tag"
}

RULES:
1. Steps must be sequential, crisp, and numbered sequentially.
2. The problem statement MUST be unique, creative, and vary numbers/compounds every time.
3. The flawed step must look plausible to someone reviewing quickly.
4. EXACTLY ONE step must have "isFlawed": true. If more than 1 or 0 steps are flawed, the output is invalid.`;

export function createGeneratorUserPrompt(topic: string, subConcept?: string): string {
  const isCode = isCodeDomain(topic, subConcept);
  const isPhysics = isPhysicsDomain(topic, subConcept);
  const isChemistry = isChemistryDomain(topic, subConcept);

  if (isChemistry) {
    const targetTag = subConcept || topic;
    const matchingArchetype = CHEMISTRY_ARCHETYPES.find((a) => a.conceptTag === targetTag);
    const chosenArchetype = matchingArchetype || CHEMISTRY_ARCHETYPES[Math.floor(Math.random() * CHEMISTRY_ARCHETYPES.length)];
    const randomSeed = Math.floor(Math.random() * 10000);

    return `Generate a FRESH, UNIQUE general chemistry problem for concept: "${chosenArchetype.conceptTag}".
Topic Area: ${chosenArchetype.topic}.
Archetype Pattern: ${chosenArchetype.archetype}.
Target Flaw Archetype: ${chosenArchetype.targetError}.
Entropy Seed: #${randomSeed}.

CRITICAL REQUIREMENTS:
- Use Unicode subscripts for formulas (e.g. C₄H₁₀, O₂, CO₂, H₂O, CaCO₃) and superscripts for charges (e.g. Ag⁺, Zn²⁺).
- Use standard atomic weights rounded to 2 decimal places (e.g. H = 1.01, C = 12.01, N = 14.01, O = 16.00, Ca = 40.08, Cl = 35.45 g/mol).
- Provide 3 to 5 clear sequential solution steps.
- All non-flawed steps MUST be 100% chemically, mathematically, and dimensionally accurate.
- Plant EXACTLY ONE clean chemistry error/misconception in one step.
- Return STRICT JSON only matching schema with "conceptTag": "${chosenArchetype.conceptTag}".`;
  }

  if (isPhysics) {
    const targetTag = subConcept || topic;
    const matchingArchetype = PHYSICS_ARCHETYPES.find((a) => a.conceptTag === targetTag);
    const chosenArchetype = matchingArchetype || PHYSICS_ARCHETYPES[Math.floor(Math.random() * PHYSICS_ARCHETYPES.length)];
    const randomSeed = Math.floor(Math.random() * 10000);

    return `Generate a FRESH, UNIQUE classical physics problem for concept: "${chosenArchetype.conceptTag}".
Topic Area: ${chosenArchetype.topic}.
Archetype Pattern: ${chosenArchetype.archetype}.
Target Flaw Archetype: ${chosenArchetype.targetError}.
Entropy Seed: #${randomSeed}.

CRITICAL REQUIREMENTS:
- Problem Statement MUST explicitly specify coordinate sign conventions (e.g. "Take upward as positive and g = 9.8 m/s²", "Assume rightward as positive") and values of constants (e.g. g = 9.8 m/s² or g = 10 m/s²).
- Provide 3 to 5 clear sequential solution steps with standard SI units.
- All non-flawed steps MUST be 100% numerically, mathematically, and dimensionally accurate.
- Plant EXACTLY ONE clean physics misconception/error in one step.
- Return STRICT JSON only matching schema with "conceptTag": "${chosenArchetype.conceptTag}".`;
  }

  if (isCode) {
    const targetTag = subConcept || topic;
    const matchingArchetype = CODE_DEBUG_ARCHETYPES.find((a) => a.conceptTag === targetTag);
    const chosenArchetype = matchingArchetype || CODE_DEBUG_ARCHETYPES[Math.floor(Math.random() * CODE_DEBUG_ARCHETYPES.length)];
    const randomSeed = Math.floor(Math.random() * 10000);

    return `Generate a FRESH, UNIQUE code-debugging challenge in ${chosenArchetype.language} for concept: "${chosenArchetype.conceptTag}".
Archetype: ${chosenArchetype.archetype}.
Planted Flaw: ${chosenArchetype.targetError}.
Entropy Seed: #${randomSeed}.

REQUIREMENTS:
- Provide 3 to 5 clear code execution/implementation steps.
- All non-flawed lines must be syntactically and logically correct.
- Plant EXACTLY ONE clean software bug in one step.
- Return STRICT JSON only matching schema with "conceptTag": "${chosenArchetype.conceptTag}".`;
  }

  // Math / Algebra Domain
  const targetTag = subConcept || topic;
  const matchingArchetype = ALGEBRA_ARCHETYPES.find((a) => a.conceptTag === targetTag);
  const chosenArchetype = matchingArchetype || ALGEBRA_ARCHETYPES[Math.floor(Math.random() * ALGEBRA_ARCHETYPES.length)];
  const variables = ["x", "y", "a", "m", "t", "n", "k"];
  const randomVar = variables[Math.floor(Math.random() * variables.length)];
  const randomSeed = Math.floor(Math.random() * 10000);

  return `Generate a FRESH, UNIQUE algebra problem for concept: "${chosenArchetype.conceptTag}".
Equation Pattern: ${chosenArchetype.archetype} using variable "${randomVar}".
Target Flaw Archetype: ${chosenArchetype.targetError}.
Random Entropy Seed: #${randomSeed}.

REQUIREMENTS:
- Do NOT repeat standard textbook clichés. Use varied coefficients (e.g. -6, 7, 13, 24).
- 3 to 5 clear sequential solution steps.
- All non-flawed steps must be 100% algebraically and numerically accurate.
- Plant EXACTLY ONE clean error in one step.
- Return STRICT JSON only matching schema with "conceptTag": "${chosenArchetype.conceptTag}".`;
}

export function createGeneratorRetryPrompt(reason: string): string {
  return `Your previous response was rejected because: ${reason}.
Please regenerate the problem ensuring:
1. STRICT JSON output matching the required schema.
2. EXACTLY ONE step has "isFlawed": true (not zero, not multiple).
3. All other steps are verified 100% numerically, dimensionally, and logically correct.
4. The error is clean and clearly explained in "explanationOfFlaw".`;
}

export const GRADING_SYSTEM_PROMPT = `You are the Diagnostic Grading Agent for CogniTrace.
A student was shown a multi-step solution/code trace with one planted logical flaw.
You will receive:
1. The Problem/Code Goal
2. The Full Solution Steps with the Actual Flawed Step identified
3. The Student's Selected Step Index
4. The Student's Explanation of what is wrong

PRECISION CONVENTIONS:
- For Chemistry: use standard periodic table atomic masses rounded to 2 decimal places (e.g. H = 1.01, C = 12.01, N = 14.01, O = 16.00, Ca = 40.08, Cl = 35.45 g/mol).

YOUR RUBRIC:
- If the student selected the WRONG step: verdict is "incorrect".
- If the student selected the CORRECT step AND correctly articulated the underlying flaw: verdict is "correct".
- If the student selected the CORRECT step but their explanation is overly vague, incomplete, or guesses without clear reasoning: verdict is "partially_correct".

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this schema:
{
  "verdict": "correct" | "partially_correct" | "incorrect",
  "feedback": "A concise, 1-2 sentence encouraging feedback directly addressing the student's reasoning.",
  "correctExplanation": "A clear, precise 1-sentence breakdown of the true flaw in the designated step."
}`;

export function createGradingUserPrompt(params: {
  problemStatement: string;
  steps: Array<{ stepIndex: number; text: string; isFlawed: boolean; explanationOfFlaw?: string }>;
  actualFlawedStepIndex: number;
  actualFlawExplanation: string;
  selectedStepIndex: number;
  studentExplanation: string;
}): string {
  return `TARGET:
${params.problemStatement}

STEPS:
${params.steps.map((s) => `[Step ${s.stepIndex + 1}] ${s.text} ${s.isFlawed ? `(ACTUAL FLAWED STEP: ${params.actualFlawExplanation})` : ""}`).join("\n")}

ACTUAL FLAW: Step ${params.actualFlawedStepIndex + 1} (${params.actualFlawExplanation})
STUDENT SELECTION: Step ${params.selectedStepIndex + 1}

  <student_explanation>
${params.studentExplanation}
  </student_explanation>

Evaluate the reasoning inside the <student_explanation> tags and return the JSON verdict.`;
}

// ==========================================
// PHASE 5b: STRUCTURING PROMPTS (OCR -> STEPS)
// ==========================================

export const STRUCTURE_WORK_SYSTEM_PROMPT = `You are a STEM transcription structuring assistant for CogniTrace.
Your task is to take raw, potentially noisy OCR text extracted from a student's handwritten math/science worksheet and organize it into:
1. A clean problem statement
2. Discrete, sequentially numbered solution steps
3. The detected STEM domain ("algebra" | "physics" | "chemistry" | "code")
4. A concept tag (e.g. "linear_equations", "kinematics", "combustion_balancing", "code_debugging")

CRITICAL RULES:
- Preserve the student's exact math equations, expressions, and logic verbatim (do NOT correct their mistakes — if the student wrote a flawed step, preserve that exact flaw so they can audit it).
- Separate the overarching initial problem or question into "problemStatement".
- Break down each working line into a discrete entry in "steps" with "stepIndex" starting at 0.
- Clean up OCR noise (e.g. extraneous line numbers, stray punctuation artifacts) while maintaining algebraic/mathematical integrity.
- Output ONLY valid JSON matching this schema:
{
  "problemStatement": "Clean initial problem statement or equation",
  "steps": [
    { "stepIndex": 0, "text": "First line of working" },
    { "stepIndex": 1, "text": "Second line of working" }
  ],
  "domain": "algebra" | "physics" | "chemistry" | "code",
  "conceptTag": "algebra_linear_equations"
}`;

export function createStructureWorkUserPrompt(rawText: string, suggestedDomain?: string): string {
  return `RAW OCR TEXT:
---
${rawText}
---
${suggestedDomain ? `SUGGESTED DOMAIN: ${suggestedDomain}` : ""}

Structure the above OCR transcription into a clean problemStatement and ordered discrete steps. Return STRICT JSON only.`;
}

// ==========================================
// PHASE 5c: VERIFIER AGENT PROMPTS (LIVE GROUND TRUTH)
// ==========================================

export const VERIFIER_SYSTEM_PROMPT = `You are the Expert Diagnostic Verifier Agent for CogniTrace.
Your mission is to independently re-solve the target problem and rigorously check a student's confirmed solution step-by-step against mathematical, physical, chemical, and algorithmic ground truth.

CRITICAL EVALUATION RULES:
1. First, independently solve the initial problem statement from scratch to establish unassailable ground truth.
2. Examine each student step in strict chronological order (Step 1, Step 2, Step 3, etc.).
3. Check if every equation transformation, algebraic expansion, arithmetic calculation, unit conversion, chemical balance, and logical operation is 100% sound. For code domains, explicitly check for common semantic bugs (e.g., off-by-one errors in loop bounds, mutable default arguments in Python, missing await in async functions) even if the syntax is valid.
4. If ALL steps are mathematically, scientifically, and logically correct:
   - "verificationStatus": "fully_correct"
   - "flawedStepIndex": null
   - "errorType": null
   - "explanationOfFlaw": null
5. If one or more steps contain a flaw or mistake:
   - "verificationStatus": "has_error"
   - Identify the FIRST chronological step where an error occurred. Note: If a problem has multiple subsequent errors caused by or following an initial mistake, you MUST flag ONLY the FIRST chronological error.
   - "flawedStepIndex": the 0-based integer index of the FIRST flawed step (0 for Step 1, 1 for Step 2, etc.).
   - "errorType": a concise archetype tag (e.g. "distributive_property", "sign_handling", "fraction_elimination", "variable_isolation", "arithmetic_slip", "unit_conversion_error", "sign_error_vectors", "wrong_kinematic_equation", "energy_not_conserved", "unbalanced_coefficients", "wrong_mole_ratio", "charge_imbalance", "off_by_one", "mutable_default_args").
   - "explanationOfFlaw": a clear, pedagogical 1-2 sentence explanation of exactly what error was made in that designated step and why it violates correct principles.
6. The "flawedStepIndex" MUST be a valid 0-based index between 0 and (total_steps - 1).

OUTPUT FORMAT:
Return ONLY valid JSON matching this schema:
{
  "verificationStatus": "fully_correct" | "has_error",
  "flawedStepIndex": 0 | null,
  "errorType": "string or null",
  "explanationOfFlaw": "string or null",
  "verifiedSolution": "Brief correct step-by-step working"
}`;

export function createVerifierUserPrompt(params: {
  problemStatement: string;
  steps: Array<{ stepIndex: number; text: string }>;
  domain: string;
}): string {
  return `DOMAIN: ${params.domain.toUpperCase()}
TARGET PROBLEM STATEMENT:
${params.problemStatement}

STUDENT CONFIRMED STEPS (${params.steps.length} steps):
${params.steps.map((s) => `[Step ${s.stepIndex + 1} (index ${s.stepIndex})] ${s.text}`).join("\n")}

Independently solve the problem, check each step chronologically, identify the first error (if any) or certify the work as fully correct. Return STRICT JSON only.`;
}

export function createVerifierRetryPrompt(params: {
  problemStatement: string;
  steps: Array<{ stepIndex: number; text: string }>;
  domain: string;
  previousError: string;
}): string {
  return `CORRECTIVE RE-EVALUATION (RETRY):
Your previous response failed verification validation: ${params.previousError}

DOMAIN: ${params.domain.toUpperCase()}
TARGET PROBLEM STATEMENT:
${params.problemStatement}

STUDENT STEPS (${params.steps.length} steps, valid 0-based index range: 0 to ${params.steps.length - 1}):
${params.steps.map((s) => `[Step ${s.stepIndex + 1} (index ${s.stepIndex})] ${s.text}`).join("\n")}

CRITICAL INSTRUCTIONS:
- If all steps are correct: "verificationStatus": "fully_correct", "flawedStepIndex": null.
- If there is an error: "verificationStatus": "has_error", and "flawedStepIndex" MUST be an integer between 0 and ${params.steps.length - 1} representing the FIRST chronological mistake.

Return STRICT JSON only.`;
}
