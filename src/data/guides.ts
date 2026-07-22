export interface GuideMeta {
  slug: string;
  title: string;
  description: string;
  emoji: string;
  spil: string | null;
  kategori: "mice" | "keyboards" | "monitors" | "headsets" | "mousepads" | "other";
  featured: boolean;
}

export const guides: GuideMeta[] = [
  {
    slug: "greb",
    title: "Grebsguide: palm, claw og fingertip",
    description: "Lær forskellen på palm, claw og fingertip greb. Find ud af hvilket greb du bruger, og hvilken mus der passer til dig.",
    emoji: "🖱️",
    spil: null,
    kategori: "mice",
    featured: true,
  },
  {
    slug: "bedste-mus-til-cs2",
    title: "Bedste mus til CS2 i 2026",
    description: "Find den perfekte mus til Counter-Strike 2. Vi har analyeret hvad pros bruger og fundet de bedste valg til alle budgetter.",
    emoji: "🔫",
    spil: "cs2",
    kategori: "mice",
    featured: true,
  },
  {
    slug: "bedste-mus-til-valorant",
    title: "Bedste mus til Valorant i 2026",
    description: "De bedste gaming-mus til Valorant baseret på pro-data og specs. Find den rette mus til dit greb og budget.",
    emoji: "🔫",
    spil: "valorant",
    kategori: "mice",
    featured: true,
  },
  {
    slug: "bedste-mus-under-500-kr",
    title: "Bedste gaming-mus under 500 kr.",
    description: "Budget gaming-mus der stadig leverer pro-grade performance. Find den bedste mus til under 500 kroner.",
    emoji: "💰",
    spil: null,
    kategori: "mice",
    featured: false,
  },
  {
    slug: "traadloes-eller-kablet-mus",
    title: "Trådløs eller kablet mus? Hvad skal du vælge",
    description: "Trådløs vs kablet gaming-mus: hvad er bedst til dig? Vi sammenligner latency, vægt, batteritid og pris.",
    emoji: "🔋",
    spil: null,
    kategori: "mice",
    featured: false,
  },
];
