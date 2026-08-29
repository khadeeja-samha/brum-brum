import { OcrDetection } from "@/lib/ai/schemas";

export interface HandwritingSample {
  id: string;
  title: string;
  domain: "algebra" | "physics" | "chemistry" | "code";
  description: string;
  imageSvgDataUrl: string; // Bauhaus SVG representation of the handwritten worksheet
  rawText: string;
  averageConfidence: number;
  detections: OcrDetection[];
  isLowConfidence?: boolean;
}

// Generate stylized SVG data URLs for handwriting samples
function createHandwritingSvg(title: string, lines: string[], isBlurry: boolean = false): string {
  const filter = isBlurry
    ? `<filter id="blur"><feGaussianBlur stdDeviation="3.5" /></filter>`
    : `<filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="1.5" /></filter>`;

  const filterAttr = isBlurry ? `filter="url(#blur)"` : `filter="url(#rough)"`;
  const opacity = isBlurry ? "0.35" : "0.9";

  const svgLines = lines
    .map((line, i) => {
      const y = 80 + i * 36;
      return `<text x="40" y="${y}" font-family="'Comic Sans MS', 'Caveat', 'Patrick Hand', cursive, sans-serif" font-size="20" font-weight="bold" fill="#121212" opacity="${opacity}" ${filterAttr}>${line}</text>`;
    })
    .join("");

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 360" width="100%" height="100%">
  <defs>
    ${filter}
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E5E7EB" stroke-width="1"/>
    </pattern>
  </defs>
  <!-- Notebook Page Background -->
  <rect width="600" height="360" fill="#FCFCFA" stroke="#121212" stroke-width="4"/>
  <rect width="600" height="360" fill="url(#grid)" />
  <!-- Red Margin Line -->
  <line x1="80" y1="0" x2="80" y2="360" stroke="#D02020" stroke-width="2" opacity="0.6"/>
  <!-- Header Stamp -->
  <rect x="420" y="16" width="150" height="32" fill="#F0F0F0" stroke="#121212" stroke-width="2"/>
  <text x="495" y="38" font-family="'Outfit', sans-serif" font-size="11" font-weight="900" text-anchor="middle" fill="#121212" letter-spacing="1">STUDENT WORK</text>
  <!-- Content Lines -->
  ${svgLines}
</svg>
`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const HANDWRITING_SAMPLES: HandwritingSample[] = [
  {
    id: "sample-alg-001",
    title: "Algebra: Linear Distribution",
    domain: "algebra",
    description: "Handwritten solution for 4(x - 3) = 2x + 10",
    imageSvgDataUrl: createHandwritingSvg("Sample 1", [
      "Problem: 4(x - 3) = 2x + 10",
      "Step 1: 4x - 12 = 2x + 10",
      "Step 2: 4x - 2x = 10 + 12",
      "Step 3: 2x = 22",
      "Step 4: x = 11",
    ]),
    rawText: "Problem: 4(x - 3) = 2x + 10\nStep 1: 4x - 12 = 2x + 10\nStep 2: 4x - 2x = 10 + 12\nStep 3: 2x = 22\nStep 4: x = 11",
    averageConfidence: 0.96,
    detections: [
      { text: "Problem: 4(x - 3) = 2x + 10", confidence: 0.98, bbox: [40, 60, 450, 90] },
      { text: "Step 1: 4x - 12 = 2x + 10", confidence: 0.97, bbox: [40, 100, 420, 130] },
      { text: "Step 2: 4x - 2x = 10 + 12", confidence: 0.95, bbox: [40, 140, 430, 170] },
      { text: "Step 3: 2x = 22", confidence: 0.97, bbox: [40, 180, 250, 210] },
      { text: "Step 4: x = 11", confidence: 0.96, bbox: [40, 220, 240, 250] },
    ],
  },
  {
    id: "sample-alg-flawed-002",
    title: "Algebra: Distributive Sign Slip",
    domain: "algebra",
    description: "Handwritten solution with an intentional arithmetic error",
    imageSvgDataUrl: createHandwritingSvg("Sample 2", [
      "Solve: -3(2x - 4) = 18",
      "Step 1: -6x - 12 = 18",
      "Step 2: -6x = 18 + 12",
      "Step 3: -6x = 30",
      "Step 4: x = -5",
    ]),
    rawText: "Solve: -3(2x - 4) = 18\nStep 1: -6x - 12 = 18\nStep 2: -6x = 18 + 12\nStep 3: -6x = 30\nStep 4: x = -5",
    averageConfidence: 0.93,
    detections: [
      { text: "Solve: -3(2x - 4) = 18", confidence: 0.95, bbox: [40, 60, 400, 90] },
      { text: "Step 1: -6x - 12 = 18", confidence: 0.94, bbox: [40, 100, 380, 130] },
      { text: "Step 2: -6x = 18 + 12", confidence: 0.92, bbox: [40, 140, 390, 170] },
      { text: "Step 3: -6x = 30", confidence: 0.94, bbox: [40, 180, 260, 210] },
      { text: "Step 4: x = -5", confidence: 0.92, bbox: [40, 220, 240, 250] },
    ],
  },
  {
    id: "sample-phys-001",
    title: "Physics: 1D Kinematics Drop",
    domain: "physics",
    description: "Free fall kinematic displacement calculation",
    imageSvgDataUrl: createHandwritingSvg("Sample 3", [
      "Drop from rest: v_i = 0, g = 9.8 m/s^2, t = 4s",
      "Step 1: d = v_i*t + 0.5*g*t^2",
      "Step 2: d = 0 + 0.5 * 9.8 * (4)^2",
      "Step 3: d = 4.9 * 16",
      "Step 4: d = 78.4 m",
    ]),
    rawText: "Drop from rest: v_i = 0, g = 9.8 m/s^2, t = 4s\nStep 1: d = v_i*t + 0.5*g*t^2\nStep 2: d = 0 + 0.5 * 9.8 * (4)^2\nStep 3: d = 4.9 * 16\nStep 4: d = 78.4 m",
    averageConfidence: 0.95,
    detections: [
      { text: "Drop from rest: v_i = 0, g = 9.8 m/s^2, t = 4s", confidence: 0.96, bbox: [40, 60, 520, 90] },
      { text: "Step 1: d = v_i*t + 0.5*g*t^2", confidence: 0.95, bbox: [40, 100, 420, 130] },
      { text: "Step 2: d = 0 + 0.5 * 9.8 * (4)^2", confidence: 0.94, bbox: [40, 140, 460, 170] },
      { text: "Step 3: d = 4.9 * 16", confidence: 0.97, bbox: [40, 180, 280, 210] },
      { text: "Step 4: d = 78.4 m", confidence: 0.95, bbox: [40, 220, 260, 250] },
    ],
  },
  {
    id: "sample-chem-001",
    title: "Chemistry: Combustion Balancing",
    domain: "chemistry",
    description: "Propane combustion reaction balancing",
    imageSvgDataUrl: createHandwritingSvg("Sample 4", [
      "Balance: C3H8 + O2 -> CO2 + H2O",
      "Step 1: Carbon balance -> C3H8 + O2 -> 3CO2 + H2O",
      "Step 2: Hydrogen balance -> C3H8 + O2 -> 3CO2 + 4H2O",
      "Step 3: Oxygen count right side = 3(2) + 4(1) = 10",
      "Step 4: Oxygen balance -> C3H8 + 5O2 -> 3CO2 + 4H2O",
    ]),
    rawText: "Balance: C3H8 + O2 -> CO2 + H2O\nStep 1: Carbon balance -> C3H8 + O2 -> 3CO2 + H2O\nStep 2: Hydrogen balance -> C3H8 + O2 -> 3CO2 + 4H2O\nStep 3: Oxygen count right side = 3(2) + 4(1) = 10\nStep 4: Oxygen balance -> C3H8 + 5O2 -> 3CO2 + 4H2O",
    averageConfidence: 0.94,
    detections: [
      { text: "Balance: C3H8 + O2 -> CO2 + H2O", confidence: 0.95, bbox: [40, 60, 460, 90] },
      { text: "Step 1: Carbon balance -> C3H8 + O2 -> 3CO2 + H2O", confidence: 0.94, bbox: [40, 100, 520, 130] },
      { text: "Step 2: Hydrogen balance -> C3H8 + O2 -> 3CO2 + 4H2O", confidence: 0.93, bbox: [40, 140, 530, 170] },
      { text: "Step 3: Oxygen count right side = 3(2) + 4(1) = 10", confidence: 0.94, bbox: [40, 180, 510, 210] },
      { text: "Step 4: Oxygen balance -> C3H8 + 5O2 -> 3CO2 + 4H2O", confidence: 0.96, bbox: [40, 220, 540, 250] },
    ],
  },
  {
    id: "sample-blurry-001",
    title: "Blurry / Low-Contrast Sample (Retake Gate)",
    domain: "algebra",
    description: "Low-confidence messy image that triggers the retake alert",
    imageSvgDataUrl: createHandwritingSvg("Sample Blurry", [
      "? 3x - ? ~ 14 ?",
      "? x / ? ... [illegible]",
      "?? ?? = 7",
    ], true),
    rawText: "? 3x - ? ~ 14 ?\n? x / ? ... [illegible]\n?? ?? = 7",
    averageConfidence: 0.48,
    isLowConfidence: true,
    detections: [
      { text: "? 3x - ? ~ 14 ?", confidence: 0.45, bbox: [40, 60, 300, 90] },
      { text: "? x / ? ... [illegible]", confidence: 0.42, bbox: [40, 100, 320, 130] },
      { text: "?? ?? = 7", confidence: 0.58, bbox: [40, 140, 200, 170] },
    ],
  },
];

export function getHandwritingSampleById(id: string): HandwritingSample | undefined {
  return HANDWRITING_SAMPLES.find((s) => s.id === id);
}
