import { describe, it, expect } from "vitest";
import { getTeamPages } from "./pro-teams";

describe("getTeamPages", () => {
  it("returns unique esport+slug pairs", () => {
    const pages = getTeamPages();
    const keys = pages.map((p) => `${p.esport}|${p.slug}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("never includes Free Agent or Retired as a team", () => {
    const pages = getTeamPages();
    expect(pages.some((p) => p.slug === "free-agent")).toBe(false);
    expect(pages.some((p) => p.slug === "retired")).toBe(false);
  });
});
