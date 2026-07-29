export type CompareWinner = "higher" | "lower" | "true" | "false" | null;

export type SpecValue = string | number | boolean | null;

export type SpecRowDef<T> = {
  id: string;
  label: string;
  group: "overview" | "size" | "sensor" | "features" | "social" | "price";
  getValue: (product: T) => SpecValue;
  format: (value: SpecValue) => string;
  /** null = no objective winner (categorical / preference) */
  better: CompareWinner;
  emphasize?: boolean;
};

export type HighlightSide = "a" | "b" | "both" | null;

export const COMPARE_MAX = 2 as const;
