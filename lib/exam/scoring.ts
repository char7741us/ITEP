import type { MCQItem } from "@/lib/types/content";
import type { MCQResponse } from "@/lib/types/attempt";

/**
 * iTEP's real raw-score-to-scaled-score algorithm is proprietary and unpublished.
 * This is a documented, tunable approximation: a piecewise-linear curve from
 * percent-correct to a 0.0-6.0 scaled score, calibrated so that roughly 75%
 * correct lands near the C1 threshold (4.5), matching the general difficulty
 * curve described in iTEP's public score-band guidance. Adjust CURVE_POINTS
 * to retune without touching call sites.
 */
const CURVE_POINTS: [percent: number, score: number][] = [
  [0, 0],
  [30, 1.2],
  [45, 2.2],
  [55, 3.0],
  [65, 3.6],
  [75, 4.5],
  [85, 5.1],
  [95, 5.7],
  [100, 6.0],
];

function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10;
}

export function percentToScaledScore(percentCorrect: number): number {
  const p = Math.max(0, Math.min(100, percentCorrect));
  for (let i = 0; i < CURVE_POINTS.length - 1; i++) {
    const [p0, s0] = CURVE_POINTS[i];
    const [p1, s1] = CURVE_POINTS[i + 1];
    if (p >= p0 && p <= p1) {
      const ratio = p1 === p0 ? 0 : (p - p0) / (p1 - p0);
      return roundToTenth(s0 + ratio * (s1 - s0));
    }
  }
  return 6.0;
}

export function scoreObjectiveSection(items: MCQItem[], responses: MCQResponse[]): number {
  if (items.length === 0) return 0;
  const answerMap = new Map(responses.map((r) => [r.itemId, r.selectedIndex]));
  const correctCount = items.reduce((sum, item) => {
    const selected = answerMap.get(item.id);
    return sum + (selected === item.correctIndex ? 1 : 0);
  }, 0);
  const percent = (correctCount / items.length) * 100;
  return percentToScaledScore(percent);
}

export function countCorrect(items: MCQItem[], responses: MCQResponse[]): { correct: number; total: number } {
  const answerMap = new Map(responses.map((r) => [r.itemId, r.selectedIndex]));
  const correct = items.reduce((sum, item) => sum + (answerMap.get(item.id) === item.correctIndex ? 1 : 0), 0);
  return { correct, total: items.length };
}

export function averageScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return roundToTenth(scores.reduce((a, b) => a + b, 0) / scores.length);
}
