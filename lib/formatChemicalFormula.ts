/**
 * Utility to format chemical formulas and equations with proper Unicode
 * subscripts, superscripts, and reaction arrows (User Amendment Phase 4c).
 */

const SUBSCRIPT_MAP: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
};

const SUPERSCRIPT_MAP: Record<string, string> = {
  "+": "⁺",
  "-": "⁻",
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
};

export function formatChemicalFormula(text: string): string {
  if (!text) return "";

  // 1. Replace ASCII reaction arrows "->" or "-->" with Unicode "→"
  let formatted = text.replace(/-->?/g, "→");

  // 2. Convert explicit caret superscripts like Zn^2+, SO4^2-
  formatted = formatted.replace(/\^([0-9]*[+-])/g, (_, charge) => {
    return charge
      .split("")
      .map((c: string) => SUPERSCRIPT_MAP[c] || c)
      .join("");
  });

  // 3. Convert ionic charges following element symbols (e.g. Ag+, Zn2+, Fe3+, Cl-)
  formatted = formatted.replace(/([A-Z][a-z]?)(\d*)([+-])(?=[\s,.)\]]|$|\()/g, (_, elem, num, sign) => {
    if (!elem) return _;
    const superNum = num
      .split("")
      .map((d: string) => SUPERSCRIPT_MAP[d] || d)
      .join("");
    const superSign = SUPERSCRIPT_MAP[sign] || sign;
    return `${elem}${superNum}${superSign}`;
  });

  // 4. Convert molecular formula subscripts (e.g. C4H10, CO2, H2O, CaCO3, AlCl3, NH3)
  formatted = formatted.replace(/([A-Z][a-z]?)(\d+)(?=[A-Z\s,.)\]+-=→]|$|\()/g, (match, elem, nums) => {
    if (!elem) return match;
    const subNums = nums
      .split("")
      .map((d: string) => SUBSCRIPT_MAP[d] || d)
      .join("");
    return `${elem}${subNums}`;
  });

  return formatted;
}
