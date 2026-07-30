import { describe, it, expect } from "vitest";
import { match, matchMonitor } from "./pros-peripherals-mapping";

/**
 * These pin the substring-matching traps AGENTS.md calls out. The mapping runs
 * fuzzy `includes()` over free-text peripheral names from prosettings.net, so a
 * too-greedy rule silently attributes the wrong product to a pro. Each case
 * below is a pair that a naive rule would collapse.
 */
describe("headset matching — false-positive traps", () => {
  it("distinguishes ROG Delta II from ROG Pelta", () => {
    expect(match("Asus ROG Delta II")).toBe("asus-rog-delta-ii");
    expect(match("Asus ROG Pelta")).toBeUndefined();
  });

  it("distinguishes Cloud II from Cloud Stinger II", () => {
    expect(match("HyperX Cloud II")).toBe("hyperx-cloud-ii");
    expect(match("HyperX Cloud Stinger II")).toBeUndefined();
  });

  it("distinguishes wireless Cloud II from wired", () => {
    expect(match("HyperX Cloud II Wireless")).toBe("hyperx-cloud-ii-wireless");
    expect(match("HyperX Cloud II")).toBe("hyperx-cloud-ii");
  });

  it("does not let Cloud III leak into Cloud II", () => {
    expect(match("HyperX Cloud III")).toBe("hyperx-cloud-iii");
    expect(match("HyperX Cloud III Wireless")).toBe("hyperx-cloud-iii-wireless");
  });

  it("keeps BlackShark v2 and v3 apart", () => {
    expect(match("Razer BlackShark V2 Pro")).toBe("razer-blackshark-v2-pro");
    expect(match("Razer BlackShark V3 Pro")).toBe("razer-blackshark-v3-pro");
  });

  it("handles the Danish 'trådløs' spelling as wireless", () => {
    expect(match("HyperX Cloud III trådløs")).toBe("hyperx-cloud-iii-wireless");
  });
});

describe("keyboard and mousepad matching", () => {
  it("matches keyboards by brand plus model", () => {
    expect(match("Wooting 80HE")).toBe("wooting-80he");
    expect(match("Razer Huntsman V3 Pro")).toBe("razer-huntsman-v3-pro");
  });

  it("keeps Zowie G-SR II and G-SR III apart", () => {
    expect(match("Zowie G-SR III")).toBe("zowie-g-sr-iii");
    expect(match("Zowie G-SR II")).toBe("zowie-g-sr-ii");
  });

  it("is case insensitive", () => {
    expect(match("wooting 80he")).toBe("wooting-80he");
    expect(match("WOOTING 80HE")).toBe("wooting-80he");
  });
});

describe("match — empty and unknown input", () => {
  it("returns undefined for null, undefined and empty string", () => {
    expect(match(null)).toBeUndefined();
    expect(match(undefined)).toBeUndefined();
    expect(match("")).toBeUndefined();
  });

  it("returns undefined rather than guessing on unknown products", () => {
    expect(match("Some Unreleased Headset 9000")).toBeUndefined();
  });
});

describe("matchMonitor", () => {
  it("distinguishes PG27AQDM from the broader PG27AQ prefix", () => {
    expect(matchMonitor("asus rog swift pg27aqdm")).toBe("asus-rog-swift-pg27aqdm");
    expect(matchMonitor("asus rog swift pg27aq")).toBe("asus-rog-swift-pg27aqdm");
  });

  it("matches Zowie models including the '+' variants", () => {
    expect(matchMonitor("zowie xl2586x+")).toBe("zowie-xl2586x-plus");
    expect(matchMonitor("zowie xl2566k")).toBe("zowie-xl2566k");
  });

  it("returns undefined for unknown monitors", () => {
    expect(matchMonitor("dell u2720q")).toBeUndefined();
  });

  it("does not mismap XL2566X+ or XL2746K onto the unrelated XL2566K catalog entry", () => {
    expect(matchMonitor("zowie xl2566x+")).toBeUndefined();
    expect(matchMonitor("zowie xl2746k")).toBeUndefined();
  });
});
