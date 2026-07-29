---
name: re-verify-pros
description: Use when the user types "re-verify pros", "update pro data", "check for stale pros", or wants to batch re-verify pro gear from prosettings.net. Reads the admin stale-pro list or freshness-priority.ts and re-checks each pro's mouse, settings, peripherals, and team.
---

# Re-Verify Pros

Batch re-verification of pro player gear data against prosettings.net.

## When to use

- Admin shows stale pros (>90 days since `sidstVerificeret`)
- Priority pros (CS2 tier-1, VCT rosters) >30 days stale
- After a major roster event or mouse release cycle
- Weekly maintenance cadence

## Data sources

| Data | Primary source | Fallback |
|------|---------------|----------|
| **Mouse, DPI, settings** | `https://prosettings.net/players/{slug}/` | — |
| **Team (hold)** | `https://liquipedia.net/{game}/api.php?action=parse&page={slug}&format=json&prop=text&section=0` | prosettings.net |
| **Peripherals** (KB, pad, headset) | prosettings.net player page | — |
| **Status** (Active/Retired) | Liquipedia API (infobox Status field) | prosettings.net |

**Team data rationale:** Liquipedia is the authoritative source for roster tracking — it's a community-maintained wiki with full transfer history and real-time updates. prosettings.net team data can lag behind roster moves. Liquipedia covers all three esports (CS2, Valorant, R6). See `src/lib/liquipedia.ts` for the fetch utility.

## Before re-verify: Apply answered tickets from KV

Before starting a re-verify run, check if the user has answered any tickets:

1. Fetch `GET /api/tickets` to get all ticket states from Vercel KV
2. For each ticket with `status: "answered"`:
   - Read the `answer` field
   - Apply it to the relevant source file:
     - `slug-mismatch`: Update Liquipedia page title mapping
     - `team-change`: Update `hold` in `pros.ts`
     - `retired-pro`: Update `hold` or mark as retired
     - `free-agent`: Update `hold` to "Free Agent"
   - After applying: mark as `applied` by writing `ticket:{id}` with `status: "applied"`
   - Remove the ticket from `src/data/freshness-tasks.ts` when done
3. Report how many tickets were applied

## Modes

### Mode A: Priority-only (recommended weekly)
Re-verify only the tier-1 pros listed in `src/data/freshness-priority.ts` that are >30 days stale.

1. Run: read `src/data/freshness-priority.ts`
2. Filter to pros in `src/data/pros.ts` whose `sidstVerificeret` is >30 days old
3. Process each (max 20 per session)

### Mode B: Stale-pros from admin
Re-verify pros that the admin dashboard flagged as stale (>90 days).

1. Read `/admin` or import from `src/lib/data-health.ts`: use `getStaleProsByAge(pros)` 
2. Process oldest first (max 15 per session)

### Mode C: Named list
Re-verify a specific list of pro slugs. Useful for targeted re-checks.

### Mode D: Esport batch
Re-verify all pros for one esport (cs2 / valorant / r6) older than N days.

## Step-by-step (per pro)

### 1. Fetch player data

**Team data (Liquipedia API):**
Fetch `https://liquipedia.net/{game}/api.php?action=parse&page={slug}&format=json&prop=text&section=0`

Where `{game}` is: `counterstrike` (cs2), `valorant`, or `rainbowsix` (r6).
Rate limit: 200ms between requests (Wikimedia standard).
Extract: Team name from infobox `Team:` field, Status from `Status:` field.

**Gear data (prosettings.net):**
Fetch `https://prosettings.net/players/{slug}/`

Rate limit: 1–2 seconds between requests.

If the player is no longer listed on prosettings.net → check Liquipedia Status. If Retired/Inactive → flag, do not remove entry, still bump `sidstVerificeret`.

### 2. Extract current data

| Field | Source on page | Notes |
|-------|---------------|-------|
| Mouse | prosettings Mouse column / gear section | Map to internal `musSlug` in `mice.json` |
| DPI | prosettings DPI value | Number |
| Sensitivity | prosettings In-game sense | Number |
| Polling rate | prosettings Polling rate column | Number (omit if missing) |
| **Team** | **Liquipedia API** (`Team:` field in infobox) | e.g. "Team Vitality" |
| Status | Liquipedia API (`Status:` field) | Active / Inactive / Retired |
| Monitor | prosettings Peripherals section | Free text |
| Keyboard | prosettings Peripherals section | Free text |
| Mousepad | prosettings Peripherals section | Free text |
| Headset | prosettings Peripherals section | Free text |

### 3. Diff against stored data

Compare what you extracted against `src/data/pros.ts` entry:

| Diff | Action |
|------|--------|
| Mouse changed | Update `musSlug`. If new mouse not in `mice.json`, follow `add-pro` step 4 (stub + mice-todo) |
| DPI/Sens changed | Update `settings` field, recalculate `edpi` |
| Team changed | Update `hold` |
| Peripherals changed | Update `src/data/pros-peripherals.json` |
| Peripherals new text can be mapped | Add `match()` rule to `src/data/pros-peripherals-mapping.ts` |
| Everything same | Just update `sidstVerificeret` |

### 4. Update `sidstVerificeret`

Set to today's date (`YYYY-MM-DD`) regardless of whether changes were found. This is the timestamp of verification, not necessarily change.

### 5. Report

Track changes in the output. Format:

```
jimpphat: mouse changed (Razer DeathAdder V4 Pro → Logitech G Pro X Superlight 2), team unchanged
donk: no changes, verified 2026-07-23
m0nesy: new mousepad (SteelSeries QcK Heavy → Artisan Ninja FX Zero), mapping added
```

## Unknown mouse handling

Same as `add-pro` step 4:
1. Create stub in `src/data/mice.json` with placeholder values
2. Add entry to `src/data/mice-todo.ts`
3. Report: "New mouse `{slug}` created as a stub. Use `add-mouse` skill to complete."

## Batch summary

After processing all pros, output a summary:

```
Re-verified 10 pros:
- 6 unchanged (sidstVerificeret bumped)
- 2 mouse changes (2 existing mice)
- 1 team change → wrote ticket (team-change)
- 1 Liquipedia 404 → wrote ticket (slug-mismatch)
- 1 free agent → wrote ticket (free-agent)
- Tickets written to src/data/freshness-tasks.ts
```

## Writing tickets for manual cases

When the agent can't auto-resolve a case, write a ticket to `src/data/freshness-tasks.ts`:

### slug-mismatch

```ts
freshnessTickets.push({
  id: `${slug}-slug-mismatch-${today}`,
  type: "slug-mismatch",
  slug,
  label: `${navn} — Liquipedia returned 404 for "${slug}"`,
  question: `What is the correct Liquipedia page title for ${navn}?`,
  context: {
    esport,
    storedTeam: hold,
    liquipediaUrl: `https://liquipedia.net/${gamePath}/?search=${encodeURIComponent(slug)}`,
    instructions: `Find the correct Liquipedia page for ${navn} and tell the agent: "resolve ${slug}-slug-mismatch — the correct page is {title}"`,
  },
  createdAt: todayISO,
  status: "pending",
});
```

### team-change

```ts
freshnessTickets.push({
  id: `${slug}-team-change-${today}`,
  type: "team-change",
  slug,
  label: `${navn} — team differs: stored "${storedTeam}", Liquipedia "${liquipediaTeam}"`,
  question: `${navn}'s team differs. We have "${storedTeam}", Liquipedia says "${liquipediaTeam}". Which is correct?`,
  context: {
    esport,
    storedTeam,
    liquipediaTeam,
    liquipediaUrl: `https://liquipedia.net/${gamePath}/${pageTitle}`,
    instructions: `Verify which team is current and tell the agent: "resolve ${slug}-team-change — update to {team}" or "resolve ${slug}-team-change — keep {team}"`,
  },
  createdAt: todayISO,
  status: "pending",
});
```

### retired-pro

```ts
freshnessTickets.push({
  id: `${slug}-retired-${today}`,
  type: "retired-pro",
  slug,
  label: `${navn} — Liquipedia shows status: Retired`,
  question: `${navn} is marked as Retired on Liquipedia. Keep or update?`,
  context: {
    esport,
    storedTeam: hold,
    liquipediaStatus: "Retired",
    liquipediaUrl: `https://liquipedia.net/${gamePath}/${pageTitle}`,
    instructions: `Decide: "resolve ${slug}-retired — mark as Retired" or "resolve ${slug}-retired — keep as active"`,
  },
  createdAt: todayISO,
  status: "pending",
});
```

### free-agent

```ts
freshnessTickets.push({
  id: `${slug}-freeagent-${today}`,
  type: "free-agent",
  slug,
  label: `${navn} — no team on Liquipedia (likely free agent)`,
  question: `${navn} has no team listed on Liquipedia. Update hold to "Free Agent"?`,
  context: {
    esport,
    storedTeam: hold,
    liquipediaUrl: `https://liquipedia.net/${gamePath}/${pageTitle}`,
    instructions: `If confirmed: "resolve ${slug}-freeagent — update to Free Agent". If they have a team not yet on Liquipedia: provide team name.`,
  },
  createdAt: todayISO,
  status: "pending",
});
```

## Key reference files

- `src/lib/liquipedia.ts` — Liquipedia API integration (fetchLiquipediaPro for team data)
- `src/data/pros.ts` — Pro data (musSlug, settings, hold, sidstVerificeret)
- `src/data/freshness-tasks.ts` — Ticket array for manual-verification cases
- `src/data/pros-peripherals.json` — Free-text peripheral data
- `src/data/pros-peripherals-mapping.ts` — Text → catalog slug mapping
- `src/data/mice.json` — Mouse catalog (check if mouse exists)
- `src/data/mice-todo.ts` — Incomplete mouse tracking
- `src/data/freshness-priority.ts` — Priority pro lists for re-verify
- `src/lib/data-health.ts` — `getStaleProsByAge(pros)`, `STALE_DAYS`
- `.opencode/skills/add-pro/SKILL.md` — Pro creation workflow (for stubs, peripherals)
