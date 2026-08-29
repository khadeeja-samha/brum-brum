export const DOMAIN_CONCEPTS: Record<string, string[]> = {
  algebra: [
    "sign_handling",
    "distributive_property",
    "variable_isolation",
    "fraction_elimination",
    "order_of_operations",
  ],
  physics: [
    "unit_conversion_error",
    "sign_error_vectors",
    "wrong_kinematic_equation",
    "energy_not_conserved",
    "missing_friction_term",
  ],
  chemistry: [
    "unbalanced_coefficients",
    "wrong_mole_ratio",
    "sig_fig_error",
    "wrong_limiting_reagent",
    "charge_imbalance",
  ],
  code: [
    "off_by_one",
    "mutable_default_args",
    "shallow_copy_mutation",
    "async_missing_await",
    "scope_shadowing",
  ],
};

export const UNCATEGORIZED_TAG = "self_audit_uncategorized";

/**
 * Resolves an arbitrary candidate tag or problem/error text into an authentic
 * Understanding Map concept tag for the specified domain.
 *
 * Per Phase 5d Amendment 1:
 * If no candidate tag or text-context match clears a high confidence threshold,
 * assigns "self_audit_uncategorized" rather than force-guessing a wrong concept.
 */
export function resolveConceptTag(
  domain: string,
  candidateTag?: string | null,
  textContext?: string | null
): string {
  const normDomain = (domain || "").toLowerCase().trim();
  const validConcepts = DOMAIN_CONCEPTS[normDomain] || [];

  // 1. Exact match on candidate tag
  if (candidateTag) {
    const cleanTag = candidateTag.toLowerCase().trim();
    if (validConcepts.includes(cleanTag)) {
      return cleanTag;
    }
  }

  // 2. High-confidence heuristic keyword mapping on candidateTag and textContext
  const combined = `${candidateTag || ""} ${textContext || ""}`.toLowerCase();

  if (normDomain === "algebra") {
    if (combined.includes("distribut") || combined.includes("parenthes") || combined.includes("expand") || combined.includes("(") || combined.includes(")")) {
      return "distributive_property";
    }
    if (combined.includes("sign") || combined.includes("negative") || combined.includes("minus sign")) {
      return "sign_handling";
    }
    if (combined.includes("fraction") || combined.includes("denominator") || combined.includes("lcd")) {
      return "fraction_elimination";
    }
    if (combined.includes("isolate") || combined.includes("isolation") || combined.includes("subtract from both")) {
      return "variable_isolation";
    }
    if (combined.includes("order of operation") || combined.includes("pemdas") || combined.includes("precedence")) {
      return "order_of_operations";
    }
  } else if (normDomain === "physics") {
    if (combined.includes("unit") || combined.includes("conversion") || combined.includes("km/h") || combined.includes("m/s")) {
      return "unit_conversion_error";
    }
    if (combined.includes("vector") || combined.includes("coordinate") || combined.includes("upward") || combined.includes("downward") || combined.includes("sign")) {
      return "sign_error_vectors";
    }
    if (combined.includes("kinematic") || combined.includes("velocity") || combined.includes("acceleration") || combined.includes("displacement") || combined.includes("formula")) {
      return "wrong_kinematic_equation";
    }
    if (combined.includes("energy") || combined.includes("joule") || combined.includes("potential") || combined.includes("kinetic")) {
      return "energy_not_conserved";
    }
    if (combined.includes("friction") || combined.includes("normal force") || combined.includes("friction term")) {
      return "missing_friction_term";
    }
  } else if (normDomain === "chemistry") {
    if (combined.includes("coefficient") || combined.includes("balance") || combined.includes("unbalanced") || combined.includes("combustion")) {
      return "unbalanced_coefficients";
    }
    if (combined.includes("ratio") || combined.includes("mole") || combined.includes("stoichiomet")) {
      return "wrong_mole_ratio";
    }
    if (combined.includes("sig fig") || combined.includes("significant") || combined.includes("decimal") || combined.includes("precision")) {
      return "sig_fig_error";
    }
    if (combined.includes("limiting") || combined.includes("excess") || combined.includes("reagent") || combined.includes("theoretical yield")) {
      return "wrong_limiting_reagent";
    }
    if (combined.includes("charge") || combined.includes("ion") || combined.includes("redox") || combined.includes("electron")) {
      return "charge_imbalance";
    }
  } else if (normDomain === "code") {
    if (combined.includes("bound") || combined.includes("off_by_one") || combined.includes("index") || combined.includes("range")) {
      return "off_by_one";
    }
    if (combined.includes("default") || combined.includes("mutable") || combined.includes("param")) {
      return "mutable_default_args";
    }
    if (combined.includes("shallow") || combined.includes("spread") || combined.includes("mutation") || combined.includes("copy")) {
      return "shallow_copy_mutation";
    }
    if (combined.includes("async") || combined.includes("await") || combined.includes("promise")) {
      return "async_missing_await";
    }
    if (combined.includes("scope") || combined.includes("shadow") || combined.includes("closure")) {
      return "scope_shadowing";
    }
  }

  // 3. Fallback: If no clear match clears threshold, assign uncategorized tag (Amendment 1)
  return UNCATEGORIZED_TAG;
}
