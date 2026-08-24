import { StoredProblemRecord, ClientSafeProblem } from "../ai/schemas";

/**
 * Server-side problem registry (RULES.md R7)
 * Keeps answer keys (isFlawed, errorType, explanationOfFlaw) hidden from client network inspection.
 */
declare global {
  // eslint-disable-next-line no-var
  var __PROBLEM_STORE__: Map<string, StoredProblemRecord> | undefined;
}

if (!global.__PROBLEM_STORE__) {
  global.__PROBLEM_STORE__ = new Map<string, StoredProblemRecord>();
}

const store = global.__PROBLEM_STORE__;

export function saveProblem(problem: StoredProblemRecord): void {
  store.set(problem.problemId, problem);
  if (store.size > 500) {
    const firstKey = store.keys().next().value;
    if (firstKey) store.delete(firstKey);
  }
}

export function getProblem(problemId: string): StoredProblemRecord | undefined {
  return store.get(problemId);
}

export function toClientSafeProblem(problem: StoredProblemRecord): ClientSafeProblem {
  return {
    problemId: problem.problemId,
    problemStatement: problem.problemStatement,
    conceptTag: problem.conceptTag,
    steps: problem.steps.map((s) => ({
      stepIndex: s.stepIndex,
      text: s.text,
    })),
  };
}
