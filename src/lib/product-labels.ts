/**
 * Danish display labels for product enum fields.
 *
 * These were previously copy-pasted across cards, detail pages, guides and the
 * compare table, which is how they drifted apart. Import from here instead of
 * redeclaring.
 */

/** Spec tables and prose — the full term. */
export const prisNiveauLabels: Record<string, string> = {
  budget: "Budget",
  mid: "Mellemklasse",
  flagship: "Flagship",
};

/**
 * Compact badges on cards, where "Mellemklasse" overflows. Deliberately
 * shorter than prisNiveauLabels — not an inconsistency to be normalized away.
 */
export const prisNiveauLabelsShort: Record<string, string> = {
  budget: "Budget",
  mid: "Mellem",
  flagship: "Flagship",
};

/** Tailwind classes for the prisNiveau badge, keyed the same way. */
export const prisNiveauBadgeClass: Record<string, string> = {
  budget: "bg-green-500/10 text-green-400",
  mid: "bg-amber-500/10 text-amber-400",
  flagship: "bg-sky-500/10 text-sky-400",
};

export const formfaktorLabels: Record<string, string> = {
  ergonomisk: "Ergonomisk",
  symmetrisk: "Symmetrisk",
  ambidextrous: "Ambidextrous",
};

export const grebLabels: Record<string, string> = {
  palm: "Palm",
  claw: "Claw",
  fingertip: "Fingertip",
};

export const haandLabels: Record<string, string> = {
  lille: "Lille",
  medium: "Medium",
  stor: "Stor",
};
