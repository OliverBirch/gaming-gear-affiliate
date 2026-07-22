@AGENTS.md

# ProSetups.dk
Danish esports-gear affiliate site. Core: "what pros use → verified → buy in Denmark." Statically generated, ~300 pages.

## Entry points (read these first)
- `src/lib/types.ts` — all Zod schemas, RETAILER_SLUGS, CopyPoints
- `src/lib/affiliate.ts` — generic offer resolution
- `src/data/pros.ts` — 80+ pros (the moat)
- `src/data/mice.ts` — 14 mice
- `src/data/keyboards.ts` — 8 keyboards
- `src/data/mousepads.ts` — 17 mousepads (transform layer from JSON)

## Key constraints
- Prices never in prose (CopyPoints validator)
- RETAILER_SLUGS closed enum — don't add without retailers.ts entry
- All routes Danish-named
- Full static generation, no runtime fetching
