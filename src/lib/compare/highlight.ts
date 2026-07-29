import type { HighlightSide, SpecRowDef, SpecValue } from "./types";

function isNullish(v: SpecValue): boolean {
  return v === null || v === undefined;
}

/**
 * Decide which side(s) win a row. Only when both values are present.
 * Ties highlight both.
 */
export function highlightWinner<T>(
  row: SpecRowDef<T>,
  a: SpecValue,
  b: SpecValue
): HighlightSide {
  if (row.better === null) return null;
  if (isNullish(a) || isNullish(b)) return null;

  if (row.better === "true" || row.better === "false") {
    const want = row.better === "true";
    const aWin = a === want;
    const bWin = b === want;
    if (aWin && bWin) return "both";
    if (aWin) return "a";
    if (bWin) return "b";
    return null;
  }

  if (typeof a !== "number" || typeof b !== "number") return null;
  if (Number.isNaN(a) || Number.isNaN(b)) return null;

  if (a === b) return "both";

  if (row.better === "higher") {
    return a > b ? "a" : "b";
  }
  // lower
  return a < b ? "a" : "b";
}
