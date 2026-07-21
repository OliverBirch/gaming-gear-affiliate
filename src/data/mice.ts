import type { Mouse } from "@/lib/types";

export const mice: Mouse[] = [
  {
    slug: "logitech-g-pro-x-superlight-2",
    navn: "G Pro X Superlight 2",
    brand: "Logitech",
    vaegtGram: 60,
    formfaktor: "symmetrisk",
    greb: ["palm", "claw", "fingertip"],
    haandStoerrelse: ["medium", "stor"],
    wireless: true,
    sensor: "Hero 2",
    maxDpi: 32000,
    pollingHz: 4000,
    prisNiveau: "flagship",
    beskrivelse:
      "Den mest brugte mus blandt CS2-pros. 60 grams vægt, 4000 Hz polling rate og Hero 2-sensoren gør den til førstevalget for konkurrencespillere.",
    fordele: [
      "Ekstremt letvægt (60g)",
      "4000 Hz polling rate",
      "Fantastisk batteritid (95 timer)",
      "Brugt af flest CS2-pros",
    ],
    ulemper: [
      "Høj pris",
      "Ingen RGB",
      "Kræver software til DPI-justering",
    ],
    proBrugere: ["donk", "s1mple", "device", "ropz", "m0nesy", "broky"],
    offers: [
      {
        retailer: "proshop",
        produktUrl: "https://www.proshop.dk/Mus/Logitech-G-Pro-X-Superlight-2/3173290",
        affiliateUrl: "https://www.proshop.dk/Mus/Logitech-G-Pro-X-Superlight-2/3173290",
        payoutPct: 3.5,
        inStock: true,
      },
      {
        retailer: "maxgaming",
        produktUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/logitech-g-pro-x-superlight-2",
        affiliateUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/logitech-g-pro-x-superlight-2",
        payoutPct: 4.0,
        inStock: true,
      },
    ],
  },
  {
    slug: "razer-viper-v3-pro",
    navn: "Viper V3 Pro",
    brand: "Razer",
    vaegtGram: 55,
    formfaktor: "symmetrisk",
    greb: ["claw", "fingertip"],
    haandStoerrelse: ["medium", "stor"],
    wireless: true,
    sensor: "Focus Pro 35K",
    maxDpi: 35000,
    pollingHz: 4000,
    prisNiveau: "flagship",
    beskrivelse:
      "Razers letteste konkurrencemus. Med 55 gram og Razers Focus Pro-sensor er den et populært valg blandt CS2-pros — inklusive ZywOo.",
    fordele: [
      "Kun 55 gram — ekstremt let",
      "Razers hurtigste sensor",
      "4000 Hz polling rate",
    ],
    ulemper: [
      "Høj pris",
      "Ikke velegnet til palm-greb",
      "Overfladen kan være glat for nogle",
    ],
    proBrugere: ["zywoo", "flamez", "jks"],
    offers: [
      {
        retailer: "proshop",
        produktUrl: "https://www.proshop.dk/Mus/Razer-Viper-V3-Pro/3173291",
        affiliateUrl: "https://www.proshop.dk/Mus/Razer-Viper-V3-Pro/3173291",
        payoutPct: 3.5,
        inStock: true,
      },
      {
        retailer: "maxgaming",
        produktUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/razer-viper-v3-pro",
        affiliateUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/razer-viper-v3-pro",
        payoutPct: 4.0,
        inStock: true,
      },
    ],
  },
  {
    slug: "zowie-ec2-dw",
    navn: "EC2-DW",
    brand: "ZOWIE",
    vaegtGram: 73,
    formfaktor: "ergonomisk",
    greb: ["palm", "claw"],
    haandStoerrelse: ["lille", "medium"],
    wireless: true,
    sensor: "3360",
    maxDpi: 3200,
    pollingHz: 1000,
    prisNiveau: "mid",
    beskrivelse:
      "ZOWIE EC2-DW er trådløsversionen af den legendariske EC2-serie. Ergonomisk højrehåndsdesign og pålidelig 3360-sensor — en solid indgang til pro-grade udstyr.",
    fordele: [
      "Ergonomisk design — behagelig i længere sessioner",
      "Ingen software nødvendig (plug and play)",
      "Lavere pris end flagship-mus",
    ],
    ulemper: [
      "Ældre sensor (3360)",
      "Kun 1000 Hz polling rate",
      "Mikro-USB (ikke USB-C)",
    ],
    proBrugere: ["niko", "elige", "twistzz"],
    offers: [
      {
        retailer: "computersalg",
        produktUrl: "https://www.computersalg.dk/mus/zowie-ec2-dw",
        affiliateUrl: "https://www.computersalg.dk/mus/zowie-ec2-dw",
        payoutPct: 3.0,
        inStock: true,
      },
      {
        retailer: "maxgaming",
        produktUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/zowie-ec2-dw",
        affiliateUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/zowie-ec2-dw",
        payoutPct: 4.0,
        inStock: true,
      },
    ],
  },
  {
    slug: "logitech-g403-hero",
    navn: "G403 Hero",
    brand: "Logitech",
    vaegtGram: 87,
    formfaktor: "ergonomisk",
    greb: ["palm", "claw"],
    haandStoerrelse: ["medium", "stor"],
    wireless: false,
    sensor: "Hero 25K",
    maxDpi: 25600,
    pollingHz: 1000,
    prisNiveau: "budget",
    beskrivelse:
      "Logitech G403 Hero er en pålidelig kablet mus med Hero 25K-sensor. Prisen gør den til det bedste budgetvalg for CS2-spillere, der vil have pro-grade sensor uden flagship-prisen.",
    fordele: [
      "Hero 25K-sensor til en lav pris",
      "God ergonomi",
      "Pålidelig kablet forbindelse — ingen latency",
    ],
    ulemper: [
      "Tungere end konkurrenterne (87g)",
      "Kun kablet",
      "Ikke velegnet til fingertip-greb",
    ],
    proBrugere: [],
    offers: [
      {
        retailer: "proshop",
        produktUrl: "https://www.proshop.dk/Mus/Logitech-G403-Hero/3173292",
        affiliateUrl: "https://www.proshop.dk/Mus/Logitech-G403-Hero/3173292",
        payoutPct: 3.5,
        inStock: true,
      },
      {
        retailer: "coolshop",
        produktUrl: "https://www.coolshop.dk/mus/logitech-g403-hero",
        affiliateUrl: "https://www.coolshop.dk/mus/logitech-g403-hero",
        payoutPct: 3.0,
        inStock: true,
      },
    ],
  },
  {
    slug: "razer-deathadder-v3",
    navn: "DeathAdder V3",
    brand: "Razer",
    vaegtGram: 63,
    formfaktor: "ergonomisk",
    greb: ["palm", "claw"],
    haandStoerrelse: ["medium", "stor"],
    wireless: true,
    sensor: "Focus Pro 30K",
    maxDpi: 30000,
    pollingHz: 1000,
    prisNiveau: "flagship",
    beskrivelse:
      "DeathAdder V3 er Razers letteste ergonomiske mus nogensinde. 63 gram og Focus Pro 30K-sensor giver præcision og komfort til CS2-spillere med palm-greb.",
    fordele: [
      "Letvægt ergonomisk design (63g)",
      "Fantastisk til palm-greb",
      "Razer Focus Pro 30K sensor",
    ],
    ulemper: [
      "Høj pris",
      "Ikke til venstrehåndede",
      "Kun 1000 Hz polling rate (upgraded i V3 Pro)",
    ],
    proBrugere: ["s1mple"],
    offers: [
      {
        retailer: "proshop",
        produktUrl: "https://www.proshop.dk/Mus/Razer-DeathAdder-V3/3173293",
        affiliateUrl: "https://www.proshop.dk/Mus/Razer-DeathAdder-V3/3173293",
        payoutPct: 3.5,
        inStock: true,
      },
    ],
  },
  {
    slug: "finalmouse-starlight-pro-small",
    navn: "Starlight Pro Small",
    brand: "Finalmouse",
    vaegtGram: 38,
    formfaktor: "symmetrisk",
    greb: ["claw", "fingertip"],
    haandStoerrelse: ["lille", "medium"],
    wireless: true,
    sensor: "Finalmouse Gen 2",
    maxDpi: 16000,
    pollingHz: 1000,
    prisNiveau: "flagship",
    beskrivelse:
      "Finalmouse Starlight Pro Small er en af de letteste gaming-mus på markedet med kun 38 gram. Den er et status-symbol blandt pros, men svær at få fat i.",
    fordele: [
      "Ekstremt letvægt (38g)",
      "Magnesium-konstruktion",
      "Eksklusiv — brugt af mange pros",
    ],
    ulemper: [
      "Meget dyr",
      "Svær at få fat i (limited drops)",
      "Lille — kun til små/medium hænder",
    ],
    proBrugere: ["twistzz", "elige"],
    offers: [
      {
        retailer: "maxgaming",
        produktUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/finalmouse-starlight-pro-small",
        affiliateUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/finalmouse-starlight-pro-small",
        payoutPct: 4.0,
        inStock: false,
      },
    ],
  },
  {
    slug: "pulsar-x2h",
    navn: "X2H",
    brand: "Pulsar",
    vaegtGram: 52,
    formfaktor: "symmetrisk",
    greb: ["claw", "fingertip"],
    haandStoerrelse: ["medium", "stor"],
    wireless: true,
    sensor: "PAW3395",
    maxDpi: 26000,
    pollingHz: 1000,
    prisNiveau: "mid",
    beskrivelse:
      "Pulsar X2H er designet specifikt til claw-greb med en højere bagdel, der giver bedre støtte. PAW3395-sensoren matcher langt dyrere mus.",
    fordele: [
      "Designet til claw-greb",
      "God værdi for prisen",
      "PAW3395 flagskibssensor",
    ],
    ulemper: [
      "Ikke til palm-greb",
      "Mindre kendt brand",
      "Software kunne være bedre",
    ],
    proBrugere: ["ropz"],
    offers: [
      {
        retailer: "maxgaming",
        produktUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/pulsar-x2h",
        affiliateUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/pulsar-x2h",
        payoutPct: 4.0,
        inStock: true,
      },
    ],
  },
  {
    slug: "vaxee-xe-wireless",
    navn: "XE Wireless",
    brand: "Vaxee",
    vaegtGram: 68,
    formfaktor: "symmetrisk",
    greb: ["palm", "claw"],
    haandStoerrelse: ["medium", "stor"],
    wireless: true,
    sensor: "3395",
    maxDpi: 26000,
    pollingHz: 1000,
    prisNiveau: "mid",
    beskrivelse:
      "Vaxee XE Wireless er skabt af tidligere ZOWIE-medarbejdere. Byggekvaliteten er exceptionel, og formen passer de fleste claw/palm-spillere.",
    fordele: [
      "Overlegen byggekvalitet",
      "God form til claw og palm",
      "Plug and play — ingen software",
    ],
    ulemper: [
      "Dyr for et mindre brand",
      "Ikke til små hænder",
      "Kun sort/hvid farver",
    ],
    proBrugere: ["device"],
    offers: [
      {
        retailer: "maxgaming",
        produktUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/vaxee-xe-wireless",
        affiliateUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/vaxee-xe-wireless",
        payoutPct: 4.0,
        inStock: true,
      },
    ],
  },
  {
    slug: "g-wolves-hts-pro-4k",
    navn: "HTS Pro 4K",
    brand: "G-Wolves",
    vaegtGram: 47,
    formfaktor: "symmetrisk",
    greb: ["claw", "fingertip"],
    haandStoerrelse: ["lille", "medium"],
    wireless: true,
    sensor: "PAW3395",
    maxDpi: 26000,
    pollingHz: 4000,
    prisNiveau: "mid",
    beskrivelse:
      "G-Wolves HTS Pro 4K er en ultralet mus med 4000 Hz polling rate til en fornuftig pris. Ideel til spillere med små hænder og claw/fingertip-greb.",
    fordele: [
      "Letvægt (47g)",
      "4000 Hz polling rate",
      "God værdi",
    ],
    ulemper: [
      "Kun til små/medium hænder",
      "Byggekvalitet kan variere",
      "Upålidelig software",
    ],
    proBrugere: ["m0nesy"],
    offers: [
      {
        retailer: "maxgaming",
        produktUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/g-wolves-hts-pro-4k",
        affiliateUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/g-wolves-hts-pro-4k",
        payoutPct: 4.0,
        inStock: true,
      },
    ],
  },
  {
    slug: "lamzu-maya-x",
    navn: "Maya X",
    brand: "Lamzu",
    vaegtGram: 50,
    formfaktor: "symmetrisk",
    greb: ["claw", "fingertip"],
    haandStoerrelse: ["medium", "stor"],
    wireless: true,
    sensor: "PAW3395",
    maxDpi: 26000,
    pollingHz: 4000,
    prisNiveau: "mid",
    beskrivelse:
      "Lamzu Maya X kombinerer et slankt design med 50 grams vægt og 4000 Hz polling rate. Den er hurtigt blevet populær blandt konkurrencespillere.",
    fordele: [
      "Let (50g) med 4K Hz polling",
      "Flot design",
      "Konkurrencedygtig pris",
    ],
    ulemper: [
      "Ikke til palm-greb",
      "Nyere brand med mindre track record",
    ],
    proBrugere: ["broky"],
    offers: [
      {
        retailer: "maxgaming",
        produktUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/lamzu-maya-x",
        affiliateUrl: "https://www.maxgaming.dk/da/tilbehoer/mus/lamzu-maya-x",
        payoutPct: 4.0,
        inStock: true,
      },
    ],
  },
];

export function getMouse(slug: string): Mouse | undefined {
  return mice.find((m) => m.slug === slug);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getMiceByEsport(esportSlug: string): Mouse[] {
  return mice.filter((m) => m.proBrugere.length > 0);
}

export function getMiceByPro(proSlug: string): Mouse[] {
  return mice.filter((m) => m.proBrugere.includes(proSlug));
}
