import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA = resolve(ROOT, "src/data");

function readJson(filename) {
  const full = resolve(DATA, filename);
  if (!existsSync(full)) return null;
  return JSON.parse(readFileSync(full, "utf-8"));
}

const errors = [];
const warnings = [];

function error(file, msg) { errors.push(file + ": " + msg); }
function warn(file, msg) { warnings.push(file + ": " + msg); }

// prices.json validation
const prices = readJson("prices.json");
if (!prices) {
  error("prices.json", "file not found");
} else {
  if (typeof prices.scrapedAt !== "string") error("prices.json", "missing scrapedAt");
  if (!prices.overrides || typeof prices.overrides !== "object") error("prices.json", "missing overrides");
  for (const [key, val] of Object.entries(prices.overrides ?? {})) {
    if (!key.includes("__")) {
      error("prices.json", "override key '" + key + "' must be productSlug__retailerSlug");
    }
    if (typeof val.prisDkk !== "number" || val.prisDkk <= 0) {
      warn("prices.json", "key '" + key + "' has invalid prisDkk: " + JSON.stringify(val));
    }
  }
}

// CopyPoints check (no dollar sign + digit in copy)
const COPY_FIELDS = ["beskrivelse", "fordele", "ulemper"];
function checkCopyPoints(data, file, getNavn) {
  if (!data) return;
  const items = Array.isArray(data) ? data : (data.mousepads ?? data.headsets ?? []);
  for (const item of items) {
    const name = getNavn ? getNavn(item) : (item.slug ?? item.navn ?? "?");
    for (const field of COPY_FIELDS) {
      const value = item[field];
      const texts = Array.isArray(value) ? value : [value];
      for (const text of texts) {
        if (typeof text === "string" && /\$\s?\d/.test(text)) {
          error(file, name + ": " + field + " contains price literal: \"" + text.slice(0, 60) + "\"");
        }
      }
    }
  }
}
checkCopyPoints(readJson("mousepads.json"), "mousepads.json", (m) => m.slug ?? "?");
checkCopyPoints(readJson("headsets.json"), "headsets.json", (h) => h.slug ?? "?");

// pros-peripherals.json validation
const peripherals = readJson("pros-peripherals.json");
if (peripherals) {
  const pFields = ["monitor", "keyboard", "mousepad", "headset"];
  let count = 0;
  for (const [slug, data] of Object.entries(peripherals)) {
    count++;
    if (typeof data !== "object" || data === null) {
      error("pros-peripherals.json", "entry '" + slug + "' is not an object");
      continue;
    }
    for (const f of pFields) {
      if (!(f in data)) warn("pros-peripherals.json", "'" + slug + "' missing field '" + f + "'");
    }
  }
  if (count === 0) warn("pros-peripherals.json", "no entries");
}

// mousepads.json structure
const pads = readJson("mousepads.json");
if (pads) {
  if (!Array.isArray(pads.mousepads)) error("mousepads.json", "missing mousepads array");
  for (const p of pads.mousepads ?? []) {
    for (const r of ["slug", "brand", "model", "type", "materiale", "bund", "vaskbar"]) {
      if (!(r in p)) warn("mousepads.json", (p.slug ?? "?") + " missing '" + r + "'");
    }
  }
}

// headsets.json structure
const hs = readJson("headsets.json");
if (hs) {
  if (!Array.isArray(hs.headsets)) error("headsets.json", "missing headsets array");
  for (const h of hs.headsets ?? []) {
    for (const r of ["slug", "navn", "brand", "wireless", "prisNiveau", "beskrivelse"]) {
      if (!(r in h)) warn("headsets.json", (h.slug ?? "?") + " missing '" + r + "'");
    }
  }
}

// Summary
console.log("");
if (errors.length === 0 && warnings.length === 0) {
  console.log("All validations passed.");
  process.exit(0);
}
if (errors.length > 0) {
  console.log("ERRORS (" + errors.length + "):");
  for (const e of errors) console.log("  [ERROR] " + e);
}
if (warnings.length > 0) {
  console.log("WARNINGS (" + warnings.length + "):");
  for (const w of warnings) console.log("  [WARN] " + w);
}
console.log("");
process.exit(errors.length > 0 ? 1 : 0);