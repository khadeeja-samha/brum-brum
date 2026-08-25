import { StoredProblemRecord } from "../ai/schemas";

/**
 * Pre-vetted fallback seed problems (RULES.md R5)
 * Guaranteed safety net for live runs and offline demos.
 * Includes both High School Algebra and Code Debugging domains.
 */
export const SEED_PROBLEMS: StoredProblemRecord[] = [
  // --- DOMAIN 1: ALGEBRA ---
  {
    problemId: "seed-algebra-001",
    problemStatement: "Solve for x: 4(x - 3) = 2x + 10",
    conceptTag: "sign_handling",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Distribute 4: 4x - 12 = 2x + 10", isFlawed: false },
      { stepIndex: 1, text: "Subtract 2x from both sides: 2x - 12 = 10", isFlawed: false },
      { stepIndex: 2, text: "Add 12 to both sides: 2x = -2", isFlawed: true, errorType: "sign_error", explanationOfFlaw: "Calculated 10 - 12 = -2 instead of 10 + 12 = 22 when adding 12 to both sides." },
      { stepIndex: 3, text: "Divide both sides by 2: x = -1", isFlawed: false },
    ],
  },
  {
    problemId: "seed-algebra-002",
    problemStatement: "Solve for x: -3(2x - 5) = 21",
    conceptTag: "distributive_property",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Distribute -3 to both terms: -6x - 15 = 21", isFlawed: true, errorType: "distribution_error", explanationOfFlaw: "Multiplied -3 by -5 and incorrectly got -15 instead of +15 (negative times negative is positive)." },
      { stepIndex: 1, text: "Add 15 to both sides: -6x = 36", isFlawed: false },
      { stepIndex: 2, text: "Divide both sides by -6: x = -6", isFlawed: false },
    ],
  },
  {
    problemId: "seed-algebra-003",
    problemStatement: "Solve for x: 7 + 2(x + 4) = 25",
    conceptTag: "order_of_operations",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Add 7 and 2 first: 9(x + 4) = 25", isFlawed: true, errorType: "order_of_operations", explanationOfFlaw: "Violated order of operations by adding 7 + 2 before performing multiplication/distribution with (x + 4)." },
      { stepIndex: 1, text: "Distribute 9: 9x + 36 = 25", isFlawed: false },
      { stepIndex: 2, text: "Subtract 36 from both sides: 9x = -11", isFlawed: false },
      { stepIndex: 3, text: "Divide by 9: x = -11/9", isFlawed: false },
    ],
  },
  {
    problemId: "seed-algebra-004",
    problemStatement: "Solve for x: (x / 3) + 5 = 11",
    conceptTag: "fraction_elimination",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Multiply entire equation by 3: x + 5 = 33", isFlawed: true, errorType: "fraction_elimination_error", explanationOfFlaw: "Multiplied (x/3) and 11 by 3, but forgot to multiply the constant term +5 by 3 (should be +15)." },
      { stepIndex: 1, text: "Subtract 5 from both sides: x = 28", isFlawed: false },
    ],
  },
  {
    problemId: "seed-algebra-005",
    problemStatement: "Solve for x: 5(x + 2) - 3x = 22",
    conceptTag: "variable_isolation",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Distribute 5: 5x + 10 - 3x = 22", isFlawed: false },
      { stepIndex: 1, text: "Combine like terms: 2x + 10 = 22", isFlawed: false },
      { stepIndex: 2, text: "Subtract 10 from both sides: 2x = 12", isFlawed: false },
      { stepIndex: 3, text: "Divide both sides by 2: x = 7", isFlawed: true, errorType: "arithmetic_slip", explanationOfFlaw: "Calculated 12 / 2 = 7 instead of the correct value 6." },
    ],
  },
  {
    problemId: "seed-algebra-006",
    problemStatement: "Solve for x: 3x - 8 = 7x + 12",
    conceptTag: "sign_handling",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Subtract 3x from both sides: -8 = 4x + 12", isFlawed: false },
      { stepIndex: 1, text: "Subtract 12 from both sides: 4 = 4x", isFlawed: true, errorType: "sign_error", explanationOfFlaw: "Calculated -8 - 12 = 4 instead of -20 (negative minus positive)." },
      { stepIndex: 2, text: "Divide both sides by 4: x = 1", isFlawed: false },
    ],
  },

  // --- DOMAIN 2: CODE DEBUGGING ---
  {
    problemId: "seed-code-001",
    problemStatement: "Python: Calculate running sum of elements in a list 'nums'",
    conceptTag: "off_by_one",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Initialize total = 0 and result = []", isFlawed: false },
      { stepIndex: 1, text: "Loop using: for i in range(len(nums) + 1):", isFlawed: true, errorType: "off_by_one", explanationOfFlaw: "range(len(nums) + 1) runs out of bounds on index len(nums), raising an IndexError." },
      { stepIndex: 2, text: "Accumulate total += nums[i] and append total to result", isFlawed: false },
      { stepIndex: 3, text: "Return result array", isFlawed: false },
    ],
  },
  {
    problemId: "seed-code-002",
    problemStatement: "Python: Append user tag to a persistent accumulator function",
    conceptTag: "mutable_default_args",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Define function signature: def add_tag(tag, tags_list=[]):", isFlawed: true, errorType: "mutable_default", explanationOfFlaw: "Using default argument `tags_list=[]` binds a single mutable list instance shared across all function calls." },
      { stepIndex: 1, text: "Append tag to tags_list: tags_list.append(tag.strip())", isFlawed: false },
      { stepIndex: 2, text: "Return tags_list", isFlawed: false },
    ],
  },
  {
    problemId: "seed-code-003",
    problemStatement: "JavaScript: Clone settings object and update nested theme preferences",
    conceptTag: "shallow_copy_mutation",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Accept original config: const config = { user: 'dev', ui: { theme: 'dark' } };", isFlawed: false },
      { stepIndex: 1, text: "Clone settings using shallow spread: const updated = { ...config };", isFlawed: false },
      { stepIndex: 2, text: "Mutate nested property: updated.ui.theme = 'light';", isFlawed: true, errorType: "reference_mutation", explanationOfFlaw: "Shallow spread does not deep-clone nested objects, inadvertently mutating the original config.ui object." },
      { stepIndex: 3, text: "Return updated object", isFlawed: false },
    ],
  },
  {
    problemId: "seed-code-004",
    problemStatement: "JavaScript: Fetch user telemetry and parse JSON payload",
    conceptTag: "async_missing_await",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Define async handler: async function getTelemetry(endpoint) {", isFlawed: false },
      { stepIndex: 1, text: "Initiate network request: const res = await fetch(endpoint);", isFlawed: false },
      { stepIndex: 2, text: "Parse body: const data = res.json();", isFlawed: true, errorType: "missing_await", explanationOfFlaw: "`res.json()` returns a Promise and must be awaited; without await, data is an unresolved Promise rather than the parsed JSON object." },
      { stepIndex: 3, text: "Return data.metrics", isFlawed: false },
    ],
  },
  {
    problemId: "seed-code-005",
    problemStatement: "Python: Implement a closure function to track call frequency",
    conceptTag: "scope_shadowing",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Define outer generator: def create_counter(): count = 0", isFlawed: false },
      { stepIndex: 1, text: "Define inner incrementer: def increment(): count += 1; return count", isFlawed: true, errorType: "unbound_local", explanationOfFlaw: "Without declaring `nonlocal count`, assigning to `count` inside the inner function treats it as an UnboundLocalError." },
      { stepIndex: 2, text: "Return increment function", isFlawed: false },
    ],
  },

  // --- DOMAIN 3: PHYSICS (Phase 4b) ---
  {
    problemId: "seed-physics-001",
    problemStatement: "A car traveling at 72 km/h brakes uniformly to rest in 5 seconds. Calculate its acceleration. (Take forward motion as positive).",
    conceptTag: "unit_conversion_error",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Identify given parameters: initial speed u = 72 km/h, final speed v = 0 m/s, time t = 5 s.", isFlawed: false },
      { stepIndex: 1, text: "Use acceleration definition directly: a = (v - u) / t = (0 - 72) / 5 = -14.4 m/s²", isFlawed: true, errorType: "unit_conversion_error", explanationOfFlaw: "Failed to convert initial speed from km/h to m/s (72 km/h = 20 m/s). Correct acceleration is (0 - 20)/5 = -4.0 m/s²." },
      { stepIndex: 2, text: "State final deceleration rate: the vehicle decelerates at 14.4 m/s².", isFlawed: false },
    ],
  },
  {
    problemId: "seed-physics-002",
    problemStatement: "A ball is launched vertically upwards at 25 m/s. Find the maximum height reached. (Take upward as positive and g = 9.8 m/s² downward, so a = -9.8 m/s²).",
    conceptTag: "sign_error_vectors",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "At maximum height, vertical velocity reaches v = 0 m/s, initial velocity u = +25 m/s.", isFlawed: false },
      { stepIndex: 1, text: "Apply kinematic relation: v² = u² + 2ah, so 0² = (25)² + 2(+9.8)h", isFlawed: true, errorType: "sign_error_vectors", explanationOfFlaw: "Assigned positive acceleration (+9.8 m/s²) to gravity instead of negative (-9.8 m/s²) under the declared upward-positive coordinate convention." },
      { stepIndex: 2, text: "Solve for height: -625 = 19.6h => h = 31.89 m", isFlawed: false },
    ],
  },
  {
    problemId: "seed-physics-003",
    problemStatement: "A dragster starts from rest (u = 0) and accelerates uniformly at 8.0 m/s² over a distance of 100 m. Find its final speed. (Take forward direction as positive).",
    conceptTag: "wrong_kinematic_equation",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "List known quantities: u = 0 m/s, a = 8.0 m/s², displacement d = 100 m.", isFlawed: false },
      { stepIndex: 1, text: "Calculate final velocity using direct product formula: v = a * d = 8.0 * 100 = 800 m/s", isFlawed: true, errorType: "wrong_kinematic_equation", explanationOfFlaw: "Applied inappropriate formula v = a * d (which has units m²/s³) instead of constant acceleration formula v² = u² + 2ad => v = sqrt(2 * 8 * 100) = 40 m/s." },
      { stepIndex: 2, text: "Conclude final velocity is 800 m/s.", isFlawed: false },
    ],
  },
  {
    problemId: "seed-physics-004",
    problemStatement: "A frictionless 500 kg roller coaster cart starts from rest at height h1 = 20 m and descends to a hill of height h2 = 8 m. Find its speed at h2. (Take g = 10 m/s²).",
    conceptTag: "energy_not_conserved",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Calculate initial mechanical energy at top: E_initial = m * g * h1 = 500 * 10 * 20 = 100,000 J.", isFlawed: false },
      { stepIndex: 1, text: "At height h2, equate total initial potential energy purely to kinetic energy: 100,000 J = (1/2) * m * v²", isFlawed: true, errorType: "energy_not_conserved", explanationOfFlaw: "Violated conservation of energy by failing to subtract the remaining potential energy at h2 (m*g*h2 = 40,000 J); available kinetic energy is 60,000 J, not 100,000 J." },
      { stepIndex: 2, text: "Solve for velocity: v = sqrt((2 * 100,000) / 500) = 20 m/s.", isFlawed: false },
    ],
  },
  {
    problemId: "seed-physics-005",
    problemStatement: "A 10 kg block slides down a 30° incline with kinetic friction coefficient μk = 0.2. Calculate the acceleration down the plane. (Take down the incline as positive, g = 9.8 m/s²).",
    conceptTag: "missing_friction_term",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Compute parallel component of gravity along incline: F_parallel = m * g * sin(30°) = 10 * 9.8 * 0.5 = 49.0 N.", isFlawed: false },
      { stepIndex: 1, text: "Apply Newton's Second Law to find acceleration: a = F_parallel / m = 49.0 / 10 = 4.90 m/s²", isFlawed: true, errorType: "missing_friction_term", explanationOfFlaw: "Completely omitted opposing kinetic friction force fk = μk * m * g * cos(30°) = 0.2 * 10 * 9.8 * 0.866 = 16.97 N from the net force equation." },
      { stepIndex: 2, text: "Conclude net acceleration down the incline is 4.90 m/s².", isFlawed: false },
    ],
  },

  // --- DOMAIN 4: CHEMISTRY (Phase 4c) ---
  {
    problemId: "seed-chem-001",
    problemStatement: "Balance the complete combustion reaction of butane gas: _ C₄H₁₀ + _ O₂ → _ CO₂ + _ H₂O",
    conceptTag: "unbalanced_coefficients",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Balance carbon atoms first: place coefficient 4 in front of CO₂ (4 C atoms on both sides).", isFlawed: false },
      { stepIndex: 1, text: "Balance hydrogen atoms: place coefficient 5 in front of H₂O (10 H atoms on both sides).", isFlawed: false },
      { stepIndex: 2, text: "Count oxygen atoms in products: 4×2 (CO₂) + 5×1 (H₂O) = 13 O atoms. Balance by writing 11 O₂ on reactants side: C₄H₁₀ + 11 O₂ → 4 CO₂ + 5 H₂O.", isFlawed: true, errorType: "unbalanced_coefficients", explanationOfFlaw: "Wrote 11 O₂ (which is 22 oxygen atoms) instead of 13/2 O₂ (13 oxygen atoms), resulting in an unbalanced oxygen count across reactants and products." },
      { stepIndex: 3, text: "Multiply all coefficients by 2: 2 C₄H₁₀ + 22 O₂ → 8 CO₂ + 10 H₂O.", isFlawed: false },
    ],
  },
  {
    problemId: "seed-chem-002",
    problemStatement: "Calculate the moles of ammonia (NH₃) produced when 6.00 mol of hydrogen gas (H₂) reacts with excess nitrogen gas (N₂) via N₂ + 3H₂ → 2NH₃.",
    conceptTag: "wrong_mole_ratio",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Identify stoichiometric ratio from balanced equation: 3 mol H₂ produces 2 mol NH₃ (ratio: 2 mol NH₃ / 3 mol H₂).", isFlawed: false },
      { stepIndex: 1, text: "Calculate ammonia yield using a 1:1 mole conversion: moles NH₃ = 6.00 mol H₂ × (1 mol NH₃ / 1 mol H₂) = 6.00 mol NH₃.", isFlawed: true, errorType: "wrong_mole_ratio", explanationOfFlaw: "Applied an incorrect 1:1 mole ratio instead of the stoichiometric ratio (2 mol NH₃ / 3 mol H₂), which yields 4.00 mol NH₃." },
      { stepIndex: 2, text: "Conclude that 6.00 mol NH₃ is produced.", isFlawed: false },
    ],
  },
  {
    problemId: "seed-chem-003",
    problemStatement: "Calculate the mass in grams of 0.450 mol of calcium carbonate (CaCO₃). (Atomic masses: Ca = 40.08, C = 12.01, O = 16.00 g/mol).",
    conceptTag: "sig_fig_error",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Compute molar mass of CaCO₃: M = 40.08 (Ca) + 12.01 (C) + 16.00 (O) = 68.09 g/mol.", isFlawed: true, errorType: "molar_mass_slip", explanationOfFlaw: "Omitted the subscript 3 on oxygen (3 × 16.00 = 48.00 g/mol); true molar mass is 40.08 + 12.01 + 48.00 = 100.09 g/mol." },
      { stepIndex: 1, text: "Calculate mass in grams: mass = moles × molar mass = 0.450 mol × 68.09 g/mol = 30.64 g.", isFlawed: false },
      { stepIndex: 2, text: "Round to 3 significant figures: final mass = 30.6 g.", isFlawed: false },
    ],
  },
  {
    problemId: "seed-chem-004",
    problemStatement: "Aluminum reacts with chlorine gas according to 2Al + 3Cl₂ → 2AlCl₃. If 2.00 mol Al and 2.50 mol Cl₂ are mixed, determine the limiting reactant.",
    conceptTag: "wrong_limiting_reagent",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Compare initial quantities: since 2.00 mol Al is less than 2.50 mol Cl₂, aluminum (Al) is the limiting reactant.", isFlawed: true, errorType: "wrong_limiting_reagent", explanationOfFlaw: "Declared Al limiting simply because 2.00 < 2.50; according to stoichiometry, 2.00 mol Al requires 3.00 mol Cl₂, meaning Cl₂ (only 2.50 mol available) runs out first and is the true limiting reactant." },
      { stepIndex: 1, text: "Calculate product theoretical yield from Al: 2.00 mol Al × (2 mol AlCl₃ / 2 mol Al) = 2.00 mol AlCl₃.", isFlawed: false },
      { stepIndex: 2, text: "Conclude 2.00 mol AlCl₃ is produced.", isFlawed: false },
    ],
  },
  {
    problemId: "seed-chem-005",
    problemStatement: "Balance the net ionic oxidation-reduction reaction between solid zinc and aqueous silver ions: Zn(s) + Ag⁺(aq) → Zn²⁺(aq) + Ag(s).",
    conceptTag: "charge_imbalance",
    createdAt: Date.now(),
    steps: [
      { stepIndex: 0, text: "Count atoms of each element on reactant and product sides: 1 Zn atom on both sides, 1 Ag atom on both sides.", isFlawed: false },
      { stepIndex: 1, text: "Declare equation balanced as written: Zn(s) + Ag⁺(aq) → Zn²⁺(aq) + Ag(s), since atom count is conserved.", isFlawed: true, errorType: "charge_imbalance", explanationOfFlaw: "Ignored electrical charge conservation: total reactant charge is +1 whereas product charge is +2. Correct balanced net ionic equation is Zn(s) + 2Ag⁺(aq) → Zn²⁺(aq) + 2Ag(s)." },
      { stepIndex: 2, text: "State final balanced equation: Zn(s) + Ag⁺(aq) → Zn²⁺(aq) + Ag(s).", isFlawed: false },
    ],
  },
];

let lastPickedIndex = -1;

export function getRandomSeedProblem(conceptTag?: string): StoredProblemRecord {
  const filtered = conceptTag
    ? SEED_PROBLEMS.filter((p) => p.conceptTag === conceptTag)
    : SEED_PROBLEMS;
  const list = filtered.length > 0 ? filtered : SEED_PROBLEMS;

  let randomIndex = Math.floor(Math.random() * list.length);
  if (list.length > 1 && randomIndex === lastPickedIndex) {
    randomIndex = (randomIndex + 1) % list.length;
  }
  lastPickedIndex = randomIndex;

  const picked = list[randomIndex];
  return {
    ...picked,
    problemId: `seed-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: Date.now(),
  };
}


