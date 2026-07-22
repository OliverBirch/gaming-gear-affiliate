import type { ProPeripherals } from "@/lib/types";
import prosPeripherals from "./pros-peripherals.json";

const raw = prosPeripherals as Record<string, ProPeripherals>;

function match(s: string | null | undefined): string | undefined {
  if (!s) return undefined;

  const lower = s.toLowerCase();

  if (lower.includes("wooting") && lower.includes("80he")) return "wooting-80he";
  if (lower.includes("razer") && (lower.includes("huntsman v3 pro") || lower.includes("huntsman-v3-pro"))) return "razer-huntsman-v3-pro";
  if (lower.includes("steelseries") && lower.includes("apex pro tkl gen 3")) return "steelseries-apex-pro-tkl-gen-3";
  if (lower.includes("corsair") && lower.includes("k100")) return "corsair-k100-rgb";

  if (lower.includes("steelseries") && lower.includes("qck heavy")) return "steelseries-qck-heavy";
  if (lower.includes("zowie") && (lower.includes("g-sr iii") || lower.includes("g-sr3"))) return "zowie-g-sr-iii";
  if (lower.includes("artisan") && lower.includes("zero")) return "artisan-ninja-fx-zero";
  if (lower.includes("artisan") && lower.includes("hien")) return "artisan-fx-hien";
  if (lower.includes("artisan") && lower.includes("type-99")) return "artisan-type-99";
  if (lower.includes("razer") && lower.includes("gigantus v2")) return "razer-gigantus-v2";
  if (lower.includes("zowie") && lower.includes("h-sr iii")) return "zowie-h-sr-iii";
  if (lower.includes("zowie") && lower.includes("g-tr")) return "zowie-g-tr";
  if (lower.includes("logitech") && lower.includes("g740")) return "logitech-g740";
  if (lower.includes("logitech") && lower.includes("g640")) return "logitech-g640";
  if (lower.includes("steelseries") && lower.includes("qck large")) return "steelseries-qck-large";
  if (lower.includes("vaxee") && lower.includes("pa")) return "vaxee-pa";
  if (lower.includes("zowie") && lower.includes("g-sr ii")) return "zowie-g-sr-ii";
  if (lower.includes("pulsar") && lower.includes("saturn pro")) return "pulsar-es-saturn-pro";
  if (lower.includes("xtrfy") && lower.includes("gp4")) return "xtrfy-gp4";
  if (lower.includes("fnatic") && (lower.includes("focus 3") || lower.includes("focus3"))) return "fnatic-focus-3";
  if (lower.includes("corsair") && lower.includes("mm250")) return "corsair-mm250";

  const hsMatch = matchHeadset(lower);
  if (hsMatch) return hsMatch;

  return undefined;
}

function matchHeadset(lower: string): string | undefined {
  if (lower.includes("hyperx")) {
    if ((lower.includes("cloud ii") || lower.includes("cloud 2")) && (lower.includes("wireless") || lower.includes("trådløs"))) return "hyperx-cloud-ii-wireless";
    if ((lower.includes("cloud iii") || lower.includes("cloud 3")) && (lower.includes("wireless") || lower.includes("trådløs"))) return "hyperx-cloud-iii-wireless";
    if (lower.includes("cloud iii") || lower.includes("cloud 3")) return "hyperx-cloud-iii";
    if (lower.includes("cloud ii") || lower.includes("cloud 2")) return "hyperx-cloud-ii";
    return undefined;
  }

  if (lower.includes("logitech") || lower.includes("astro")) {
    if (lower.includes("pro x 2") || lower.includes("lightspeed") || (lower.includes("g pro x") && lower.includes("wireless"))) return "logitech-g-pro-x-2";
    if (lower.includes("g pro x") || lower.includes("pro x")) return "logitech-g-pro-x";
    return undefined;
  }

  if (lower.includes("razer")) {
    if (lower.includes("blackshark v3")) return "razer-blackshark-v3-pro";
    if (lower.includes("blackshark v2")) return "razer-blackshark-v2-pro";
    return undefined;
  }

  if (lower.includes("asus") && (lower.includes("delta") || lower.includes("rog"))) return "asus-rog-delta-ii";
  if (lower.includes("corsair") && lower.includes("hs80")) return "corsair-hs80-rgb-usb";
  if (lower.includes("steelseries") && lower.includes("arctis nova pro") && (lower.includes("wireless") || lower.includes("trådløs"))) return "steelseries-arctis-nova-pro-wireless";
  if (lower.includes("sony") && (lower.includes("inzone h9") || lower.includes("inzone h9"))) return "sony-inzone-h9-ii";

  return undefined;
}

export function getKeyboardSlug(proSlug: string): string | undefined {
  const peri = raw[proSlug];
  if (!peri) return undefined;
  return match(peri.keyboard);
}

export function getMousepadSlug(proSlug: string): string | undefined {
  const peri = raw[proSlug];
  if (!peri) return undefined;
  return match(peri.mousepad);
}

export function getKeyboardProSlugs(keyboardSlug: string): string[] {
  return Object.keys(raw).filter((proSlug) => getKeyboardSlug(proSlug) === keyboardSlug);
}

export function getMousepadProSlugs(mousepadSlug: string): string[] {
  return Object.keys(raw).filter((proSlug) => getMousepadSlug(proSlug) === mousepadSlug);
}

export function getHeadsetSlug(proSlug: string): string | undefined {
  const peri = raw[proSlug];
  if (!peri) return undefined;
  return match(peri.headset);
}

export function getHeadsetProSlugs(headsetSlug: string): string[] {
  return Object.keys(raw).filter((proSlug) => getHeadsetSlug(proSlug) === headsetSlug);
}
