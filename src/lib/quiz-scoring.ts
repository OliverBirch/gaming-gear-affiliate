import type { Mouse, FinderInput } from "./types";
import { mice } from "@/data/mice";

export interface ScoredMouse {
  mouse: Mouse;
  score: number;
  matchReasons: string[];
}

const prisNiveauOrder = ["budget", "mid", "flagship"] as const;

function prisDistance(a: string, b: string): number {
  const ai = prisNiveauOrder.indexOf(a as typeof prisNiveauOrder[number]);
  const bi = prisNiveauOrder.indexOf(b as typeof prisNiveauOrder[number]);
  return Math.abs(ai - bi);
}

export function scoreMice(input: FinderInput): ScoredMouse[] {
  const scored: ScoredMouse[] = [];

  for (const mouse of mice) {
    let score = 0;
    const reasons: string[] = [];

    if (input.greb !== "ved-ikke") {
      if (mouse.greb.includes(input.greb)) {
        score += 3;
        reasons.push("greb");
      } else {
        score -= 2;
        reasons.push("forkert-greb");
      }
    }

    if (mouse.haandStoerrelse.includes(input.haand)) {
      score += 2;
      reasons.push("haand");
    }

    if (input.wireless === true && mouse.wireless) {
      score += 2;
      reasons.push("traadloes");
    } else if (input.wireless === false && !mouse.wireless) {
      score += 2;
      reasons.push("kablet");
    }

    const dist = prisDistance(input.budget, mouse.prisNiveau);
    if (dist === 0) {
      score += 3;
      reasons.push("budget");
    } else if (dist === 1) {
      score += 1;
      reasons.push("naer-budget");
    } else {
      score -= 1;
    }

    if (mouse.vaegtGram < 65) {
      score += 1;
      reasons.push("letvaegt");
    }

    scored.push({ mouse, score, matchReasons: reasons });
  }

  return scored.sort((a, b) => b.score - a.score);
}
