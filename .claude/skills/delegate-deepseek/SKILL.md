---
name: delegate-deepseek
description: Use when a subtask is small, self-contained, and mechanical (a standalone script, a repetitive data-mapping transform, boilerplate, non-critical copy drafting) and could be offloaded to the user's opencode/deepseek-v4-pro subscription instead of spending Claude usage on it. Always confirm with the user before delegating, and never let deepseek write files directly — review-only.
---

# Delegate to deepseek-v4-pro (via opencode)

The user has an OpenCode Go subscription (separate from Claude usage) giving access to
`deepseek-v4-pro` through the `opencode` CLI. For small, low-ambiguity jobs, offload the
work to deepseek instead of burning Claude usage, then review and apply the result myself.

## When this applies

Good candidates:
- A standalone script (e.g. something for `scripts/`)
- A repetitive/mechanical data-mapping transform with a clear spec
- Boilerplate (a new card component modeled on an existing one, a straightforward transform layer)
- Drafting non-critical copy (not `fordele`/`ulemper`/`beskrivelse` that must pass the CopyPoints
  Zod refine — draft those myself, or have deepseek draft and I validate carefully)

Not good candidates — do these myself:
- Anything touching pro data (`src/data/pros.ts`) — this is the site's moat, needs judgment
- Anything requiring interpretation of `src/lib/types.ts` Zod schemas or `RETAILER_SLUGS`
- Anything where getting it subtly wrong is expensive to catch later

## Rules

1. **Always confirm first.** Even when I judge a subtask delegable, ask the user with a short
   one-line confirmation before running anything. Never delegate silently.
2. **Review-only, always.** Never pass `--auto`. Every prompt to deepseek must explicitly say
   not to edit any files — it should only return code/text in its response. I apply the result
   myself via Edit/Write.
3. **Self-contained prompts.** Since deepseek doesn't have this conversation's context, include
   the task, any relevant file contents or schema excerpts inline, and the explicit
   "do not edit files, just return the code/text" instruction in every prompt.

## Command

```
opencode run -m opencode-go/deepseek-v4-pro "<self-contained prompt>"
```

Run from the project root. Use exactly `opencode-go/deepseek-v4-pro` — do not confuse it with
`opencode/deepseek-v4-flash-free`, a different (weaker, free-tier) model on a different provider
prefix.

Optional: add `--format json` if the output needs to be parsed programmatically rather than
read as text.

## After delegating

1. Apply the returned code/text via Edit/Write.
2. Run `npm run build` and/or `npm run validate-data` to confirm it satisfies the project's
   Zod schemas and CopyPoints validation — deepseek isn't primed on these conventions the way
   I am, so don't skip this.
3. Proceed as normal (this doesn't replace any other step in a workflow, e.g. a data-freshness
   ticket or admin health check).
