import crypto from "crypto";
import { StoredProblemRecord, ClientSafeProblem } from "../ai/schemas";
import { SEED_PROBLEMS } from "../fallback/seed-problems";

/**
 * Server-side problem registry & stateless token engine (RULES.md R7)
 * Keeps answer keys (isFlawed, errorType, explanationOfFlaw) hidden from client network inspection,
 * while ensuring 100% reliability across Vercel / serverless ephemeral function instances.
 */
declare global {
  // eslint-disable-next-line no-var
  var __PROBLEM_STORE__: Map<string, StoredProblemRecord> | undefined;
}

if (!global.__PROBLEM_STORE__) {
  global.__PROBLEM_STORE__ = new Map<string, StoredProblemRecord>();
}

const store = global.__PROBLEM_STORE__;

const SECRET =
  process.env.NVIDIA_NIM_API_KEY ||
  process.env.NEXT_PUBLIC_VERCEL_ENV ||
  "cognitrace-secure-token-key-2026";
const ENCRYPTION_KEY = crypto.createHash("sha256").update(SECRET).digest();

/**
 * Encrypts a StoredProblemRecord into a tamper-proof, opaque base64url token.
 * Uses AES-256-GCM authenticated encryption.
 */
export function encodeProblemToken(record: StoredProblemRecord): string {
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
    const json = JSON.stringify(record);
    const encrypted = Buffer.concat([cipher.update(json, "utf8"), cipher.final()]);
    const tag = cipher.getAuthTag();
    // Format: iv(12) + tag(16) + ciphertext
    const packed = Buffer.concat([iv, tag, encrypted]);
    return packed.toString("base64url");
  } catch (err) {
    console.error("[encodeProblemToken] Failed to pack problem token:", err);
    return "";
  }
}

/**
 * Decrypts and validates an AES-256-GCM problem token.
 */
export function decodeProblemToken(token: string): StoredProblemRecord | null {
  try {
    const buf = Buffer.from(token, "base64url");
    if (buf.length < 28) return null; // 12 (iv) + 16 (tag) = 28 bytes min
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);
    const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return JSON.parse(decrypted.toString("utf8")) as StoredProblemRecord;
  } catch {
    return null;
  }
}

/**
 * Packs a problem record with an encrypted stateless ID for serverless resilience
 */
export function packStoredProblem(record: StoredProblemRecord): StoredProblemRecord {
  const token = encodeProblemToken(record);
  const statelessId = token ? `cgt_${record.problemId}_${token}` : record.problemId;
  const packedRecord: StoredProblemRecord = {
    ...record,
    problemId: statelessId,
  };
  saveProblem(packedRecord);
  return packedRecord;
}

export function saveProblem(problem: StoredProblemRecord): void {
  store.set(problem.problemId, problem);
  if (store.size > 500) {
    const firstKey = store.keys().next().value;
    if (firstKey) store.delete(firstKey);
  }
}

export function getProblem(problemId: string): StoredProblemRecord | undefined {
  if (!problemId) return undefined;

  // 1. Direct in-memory lookup
  const inMemory = store.get(problemId);
  if (inMemory) return inMemory;

  // 2. Stateless AES-256-GCM token decoding (for multi-lambda serverless persistence)
  if (problemId.startsWith("cgt_")) {
    const lastUnderscore = problemId.lastIndexOf("_");
    if (lastUnderscore !== -1) {
      const token = problemId.slice(lastUnderscore + 1);
      const decoded = decodeProblemToken(token);
      if (decoded) {
        // Cache back into in-memory store for subsequent calls in same lambda
        store.set(problemId, decoded);
        return decoded;
      }
    }
  }

  // 3. Fallback Seed Problem lookup (matches seed-algebra-001, seed-code-002, etc.)
  if (problemId.includes("seed-") || problemId.startsWith("seed")) {
    const matched = SEED_PROBLEMS.find(
      (p) => problemId.includes(p.problemId) || p.problemId === problemId
    );
    if (matched) return matched;

    // Fuzzy domain match if ID contains domain name
    for (const domain of ["algebra", "physics", "chem", "code"]) {
      if (problemId.includes(domain)) {
        const domainSeed = SEED_PROBLEMS.find((p) => p.problemId.includes(domain));
        if (domainSeed) return domainSeed;
      }
    }

    return SEED_PROBLEMS[0];
  }

  return undefined;
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
