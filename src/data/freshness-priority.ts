// Preferred pro slugs for homepage "featured pros" picks, most notable first.
// firstExisting() in src/app/page.tsx walks each list and takes the first N
// slugs that still exist in src/data/pros.ts, so entries can be reordered or
// removed without breaking anything.

export const PRIORITY_CS2: string[] = [
  "donk",
  "zywoo",
  "s1mple",
  "device",
  "m0nesy",
  "niko",
  "ropz",
];

export const PRIORITY_VALORANT: string[] = [
  "tenz",
  "aspas",
  "derke",
  "yay",
  "zekken",
  "boaster",
];

export const PRIORITY_R6: string[] = [
  "cameram4n",
  "solotov",
  "yuzus",
  "brid",
  "kheyze",
];
