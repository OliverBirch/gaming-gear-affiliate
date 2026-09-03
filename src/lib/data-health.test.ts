import { describe, it, expect } from "vitest";
import { checkMissingImages, checkMissingImagesPros } from "./data-health";

const pro = (slug: string, billede?: string) => ({ slug, navn: slug, billede });
const product = (slug: string, billede?: string | null) => ({ slug, navn: slug, billede });

describe("checkMissingImagesPros", () => {
  it("flags only pros with no billede at all", () => {
    const issues = checkMissingImagesPros([
      pro("a", "/images/pros/a.png"),
      pro("b"),
    ]);
    expect(issues.map((i) => i.slug)).toEqual(["b"]);
    expect(issues[0].type).toBe("missing-pro-image");
  });

  it("flags a billede whose file isn't on disk once paths are supplied", () => {
    // The real bug this guards: techno4k's image was saved as .webp while the
    // data said .png, so the pro read as "has an image" and rendered a monogram.
    const issues = checkMissingImagesPros(
      [pro("techno4k", "/images/pros/techno4k.png")],
      new Set(["/images/pros/techno4k.webp"])
    );
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe("broken-pro-image");
    expect(issues[0].context.path).toBe("/images/pros/techno4k.png");
  });

  it("stays silent when the billede resolves to a real file", () => {
    expect(
      checkMissingImagesPros([pro("a", "/images/pros/a.png")], new Set(["/images/pros/a.png"]))
    ).toEqual([]);
  });

  it("checks nothing when no path set is supplied (pure, back-compatible)", () => {
    expect(checkMissingImagesPros([pro("a", "/images/pros/nope.png")])).toEqual([]);
  });
});

describe("checkMissingImages", () => {
  it("separates a missing billede from a broken one", () => {
    const issues = checkMissingImages(
      [product("has", "/images/mice/has.png"), product("none", null), product("broken", "/images/mice/gone.png")],
      "mice",
      new Set(["/images/mice/has.png"])
    );
    expect(issues.map((i) => [i.slug, i.type])).toEqual([
      ["none", "missing-image"],
      ["broken", "broken-image"],
    ]);
  });

  it("leaves remote image URLs alone — they can't be resolved on disk", () => {
    expect(
      checkMissingImages([product("cdn", "https://example.com/x.png")], "mice", new Set())
    ).toEqual([]);
  });
});
