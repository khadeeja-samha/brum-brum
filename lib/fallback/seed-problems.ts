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
