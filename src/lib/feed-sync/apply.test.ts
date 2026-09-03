import { describe, it, expect, vi, beforeEach } from "vitest";
import { join } from "path";

const files = new Map<string, string>();

vi.mock("fs", () => ({
  readFileSync: (path: string) => {
    const content = files.get(path);
    if (content == null) throw new Error(`ENOENT: ${path}`);
    return content;
  },
  writeFileSync: (path: string, content: string) => {
    files.set(path, content);
  },
}));

vi.mock("@/data/retailers", () => ({
  getRetailer: (slug: string) => {
    const table: Record<string, { basePayoutPct: number }> = {
      proshop: { basePayoutPct: 3.5 },
      komplett: { basePayoutPct: 2.5 },
    };
    return table[slug];
  },
}));

const { applyCandidateToCatalog } = await import("./apply");

function micePath(): string {
  return join(process.cwd(), "src", "data", "mice.json");
}
function headsetsPath(): string {
  return join(process.cwd(), "src", "data", "headsets.json");
}
function mousepadsPath(): string {
  return join(process.cwd(), "src", "data", "mousepads.json");
}
function keyboardsPath(): string {
  return join(process.cwd(), "src", "data", "keyboards.json");
}
function monitorsPath(): string {
  return join(process.cwd(), "src", "data", "monitors.json");
}

const MICE_FIXTURE = {
  mice: [
    { slug: "test-mouse", navn: "Test Mouse", brand: "TestBrand", offers: [] },
  ],
};

const HEADSETS_FIXTURE = {
  headsets: [
    {
      slug: "test-headset-no-offers-key",
      navn: "Test Headset",
      brand: "TestBrand",
      priser: { proshop: null },
      beskrivelse: "x",
      sidstOpdateret: "2026-07-22",
    },
    {
      slug: "test-headset-with-offers",
      navn: "Test Headset Two",
      brand: "TestBrand",
      offers: [{ retailer: "proshop", produktUrl: "https://x.test", affiliateUrl: "https://x.test", prisDkk: 100, payoutPct: 3.5, inStock: true }],
    },
  ],
};

const MOUSEPADS_FIXTURE = {
  mousepads: [{ slug: "test-pad", brand: "TestBrand", priser: { proshop: null } }],
};

const KEYBOARDS_FIXTURE = {
  keyboards: [{ slug: "test-kb", navn: "Test KB", brand: "TestBrand", retailers: ["proshop"] }],
};

const MONITORS_FIXTURE = {
  monitors: [{ slug: "test-monitor", navn: "Test Monitor", brand: "TestBrand", priser: { proshop: null } }],
};

beforeEach(() => {
  files.clear();
  files.set(micePath(), JSON.stringify(MICE_FIXTURE, null, 2) + "\n");
  files.set(headsetsPath(), JSON.stringify(HEADSETS_FIXTURE, null, 2) + "\n");
  files.set(mousepadsPath(), JSON.stringify(MOUSEPADS_FIXTURE, null, 2) + "\n");
  files.set(keyboardsPath(), JSON.stringify(KEYBOARDS_FIXTURE, null, 2) + "\n");
  files.set(monitorsPath(), JSON.stringify(MONITORS_FIXTURE, null, 2) + "\n");
});

describe("applyCandidateToCatalog", () => {
  it("appends a new offer to a mouse with an empty offers array", () => {
    applyCandidateToCatalog({
      retailer: "proshop",
      slug: "test-mouse",
      category: "mus",
      produktUrl: "https://proshop.dk/p/1",
      affiliateUrl: "https://proshop.dk/p/1?aff=1",
      prisDkk: 499,
    });
    const data = JSON.parse(files.get(micePath())!);
    const mouse = data.mice.find((m: { slug: string }) => m.slug === "test-mouse");
    expect(mouse.offers).toEqual([
      {
        affiliateUrl: "https://proshop.dk/p/1?aff=1",
        inStock: true,
        payoutPct: 3.5,
        prisDkk: 499,
        produktUrl: "https://proshop.dk/p/1",
        retailer: "proshop",
      },
    ]);
  });

  it("inserts an offers key when the target entry never had one", () => {
    applyCandidateToCatalog({
      retailer: "komplett",
      slug: "test-headset-no-offers-key",
      category: "headset",
      produktUrl: "https://komplett.dk/p/1",
      affiliateUrl: "https://komplett.dk/p/1?aff=1",
      prisDkk: 709,
    });
    const data = JSON.parse(files.get(headsetsPath())!);
    const headset = data.headsets.find((h: { slug: string }) => h.slug === "test-headset-no-offers-key");
    expect(headset.offers).toHaveLength(1);
    expect(headset.offers[0]).toMatchObject({ retailer: "komplett", prisDkk: 709, payoutPct: 2.5 });
    // priser and other pre-existing fields must survive untouched
    expect(headset.priser).toEqual({ proshop: null });
    expect(headset.sidstOpdateret).toBe("2026-07-22");
  });

  it("appends to an existing non-empty offers array without disturbing prior entries", () => {
    applyCandidateToCatalog({
      retailer: "komplett",
      slug: "test-headset-with-offers",
      category: "headset",
      produktUrl: "https://komplett.dk/p/2",
      affiliateUrl: "https://komplett.dk/p/2?aff=1",
      prisDkk: 850,
    });
    const data = JSON.parse(files.get(headsetsPath())!);
    const headset = data.headsets.find((h: { slug: string }) => h.slug === "test-headset-with-offers");
    expect(headset.offers).toHaveLength(2);
    expect(headset.offers[0].retailer).toBe("proshop");
    expect(headset.offers[1]).toMatchObject({ retailer: "komplett", prisDkk: 850 });
  });

  it("appends a real per-product offer for a mousepad, from any retailer, leaving priser untouched", () => {
    applyCandidateToCatalog({
      retailer: "komplett",
      slug: "test-pad",
      category: "musemaatter",
      produktUrl: "https://komplett.dk/p/pad",
      affiliateUrl: "https://komplett.dk/p/pad?aff=1",
      prisDkk: 199,
    });
    const data = JSON.parse(files.get(mousepadsPath())!);
    const pad = data.mousepads[0];
    expect(pad.offers).toEqual([
      {
        affiliateUrl: "https://komplett.dk/p/pad?aff=1",
        inStock: true,
        payoutPct: 2.5,
        prisDkk: 199,
        produktUrl: "https://komplett.dk/p/pad",
        retailer: "komplett",
      },
    ]);
    // the generic proshop fallback this mousepad still relies on is untouched
    expect(pad.priser).toEqual({ proshop: null });
  });

  it("appends a real per-product offer for a keyboard, on top of the generic retailers fallback", () => {
    applyCandidateToCatalog({
      retailer: "proshop",
      slug: "test-kb",
      category: "tastaturer",
      produktUrl: "https://proshop.dk/p/kb",
      affiliateUrl: "https://proshop.dk/p/kb?aff=1",
      prisDkk: 899,
    });
    const data = JSON.parse(files.get(keyboardsPath())!);
    const kb = data.keyboards[0];
    expect(kb.offers).toEqual([
      {
        affiliateUrl: "https://proshop.dk/p/kb?aff=1",
        inStock: true,
        payoutPct: 3.5,
        prisDkk: 899,
        produktUrl: "https://proshop.dk/p/kb",
        retailer: "proshop",
      },
    ]);
    expect(kb.retailers).toEqual(["proshop"]);
  });

  it("appends a real per-product offer for a monitor", () => {
    applyCandidateToCatalog({
      retailer: "komplett",
      slug: "test-monitor",
      category: "skaerme",
      produktUrl: "https://komplett.dk/p/monitor",
      affiliateUrl: "https://komplett.dk/p/monitor?aff=1",
      prisDkk: 2999,
    });
    const data = JSON.parse(files.get(monitorsPath())!);
    expect(data.monitors[0].offers).toHaveLength(1);
    expect(data.monitors[0].offers[0]).toMatchObject({ retailer: "komplett", prisDkk: 2999, payoutPct: 2.5 });
  });

  it("rejects a candidate with no price", () => {
    expect(() =>
      applyCandidateToCatalog({
        retailer: "proshop",
        slug: "test-mouse",
        category: "mus",
        produktUrl: "https://proshop.dk/p/1",
        affiliateUrl: "https://proshop.dk/p/1",
        prisDkk: null,
      })
    ).toThrow(/no price/);
  });

  it("round-trips the untouched parts of the file byte-for-byte", () => {
    const before = files.get(headsetsPath())!;
    applyCandidateToCatalog({
      retailer: "komplett",
      slug: "test-headset-with-offers",
      category: "headset",
      produktUrl: "https://komplett.dk/p/2",
      affiliateUrl: "https://komplett.dk/p/2?aff=1",
      prisDkk: 850,
    });
    const after = files.get(headsetsPath())!;
    // the untouched first entry's text must appear verbatim in the result
    const untouchedSlice = before.slice(before.indexOf('"test-headset-no-offers-key"') - 20, before.indexOf('"test-headset-with-offers"'));
    expect(after).toContain(untouchedSlice.trim());
  });
});
