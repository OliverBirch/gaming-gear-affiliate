<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# ProSetups.dk — Project conventions

## Core focus
Answer one question: *"What gear does this pro use, where can I buy it in Denmark, and is this info current?"* Pro data is the moat; product categories serve the pro-data.

## Source of truth
- Zod schemas in `src/lib/types.ts` are canonical. Data files must conform — transform layers map raw JSON to schemas.
- Never edit raw data inline; create a transform layer (see `src/data/mousepads.ts` for the pattern).

## Product copy (CopyPoints)
- Prices belong in `offers[].prisDkk` or `prices.json` overrides. Do NOT write price strings (`$180`, `~$200`, `399 kr.`) into `fordele`/`ulemper` or `beskrivelse`. The CopyPoints Zod refine rejects `$` + digit patterns at validation.

## Retailers
- `RETAILER_SLUGS` is a closed Zod enum. Adding a retailer requires:
  1. Update the union in `types.ts`
  2. Add a matching entry in `retailers.ts` with real payout data
  3. Do NOT add a slug before the retailer entry exists

## Route naming
- Danish for routes and UI: `/tastaturer`, `/musemaatter`, `/maerke`, `/mus`. English for code identifiers.

## Generation
- All content is statically generated at build time. Use `generateStaticParams` for dynamic routes. No runtime data fetching.

## Affiliate links
- Use `rel="sponsored nofollow"` on all outbound affiliate links.
- Route through `/api/redirect` for click logging.
- Prices resolve via: static `offers[].prisDkk` → `prices.json` overrides → no price shown.
