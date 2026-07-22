# ProSetups.dk — What Buyers Actually Look For, and What to Put on the Site

**Deep dive: gaming mice, keyboards, headsets, mousepads, monitors**
Prepared July 2026. Written against the current state of prosetups.dk (mice-only, 14 mice, 156 pros, CS2/Valorant/R6, affiliate to Proshop / MaxGaming / Computersalg).

---

## 0. TL;DR

**Build order:** deepen mice → mousepads → keyboards → monitors → headsets.

**The five highest-impact changes, in order:**

1. **Add physical dimensions + hand-size fit to every mouse.** Shape fit is the #1 purchase driver in the entire peripheral market and it is the one thing you currently don't publish. Weight/sensor/DPI are the easy specs; they are not the deciding ones.
2. **Show all three retailer prices on every product, not one.** Local price comparison is your only real moat against prosettings.net. Right now you show a single retailer per product and throw away the advantage.
3. **Label pro gear as "player-chosen" vs "sponsor/tournament-supplied."** This is the credibility differentiator, and it's the honest answer to why headset and monitor data means much less than mouse data.
4. **Add ISO-DK (nordisk layout) availability to every keyboard.** No international competitor covers this. It is a genuine blocker for Danish keyboard buyers and a category nobody owns.
5. **Turn eDPI into a mousepad-size recommender.** You already hold eDPI for 156 pros. Nobody else can build "pros at your sensitivity use this pad size" from real data.

**The uncomfortable point up front:** your "what pros use" angle is strong for mice and mousepads, moderate for keyboards, and weak for headsets and monitors — because at that end of the list, the gear is supplied by team sponsors and tournament organisers rather than chosen by the player. Plan the expansion around that gradient, not around category size.

---

## 1. The strategic frame

You are not building a review site. You can't out-test RTINGS and you can't out-scale prosettings.net. What you have that they don't:

| Asset | Who else has it |
|---|---|
| DKK pricing across DK retailers | Pricerunner (but no esports context) |
| Danish-language esports gear content | Essentially nobody |
| Pro settings + eDPI database | prosettings.net (but in English, no DK prices) |
| ISO-DK layout / DK stock / DK warranty info | Nobody |

So the site's job is: **"a Danish player knows what pros use, understands whether it fits them, and sees the best Danish price — in one page."** Every data field you add should serve one of those three. Fields that serve none of them (RGB modes, driver diameter, max DPI beyond 8000) are cost without return.

### Pro-signal quality by category

This should drive your priorities more than search volume does.

| Category | Is pro usage a real signal? | Why |
|---|---|---|
| **Mouse** | **Very strong** | Pros routinely buy their own, refuse sponsor mice, or play sponsor shells with modded internals. Choice is genuinely performance-driven. |
| **Mousepad** | **Strong** | Cheap, personal, easy to bring to LAN. Pros pick these freely. |
| **Keyboard** | **Moderate** | Real preferences exist (HE vs mechanical, layout), but team sponsors push specific boards hard. |
| **Monitor** | **Weak** | Tournament stage monitors are supplied by the organiser (Zowie/Alienware deals). "Pro uses X" often means "the tournament had X." |
| **Headset** | **Weakest** | Almost pure sponsor placement. Many pros wear the sponsor headset over IEMs/earbuds for isolation at LAN — the visible headset is not what they're listening through. |

Publishing this distinction openly makes you *more* trustworthy, not less. It's also a content piece in itself ("Derfor kan du ikke stole på pro-headset-data").

---

## 2. Mice

You already run this category. The gap is not coverage, it's depth on the fields that actually decide the purchase.

### What buyers decide on

**Tier 1 — decides the purchase**
- **Shape and dimensions.** Length × width × height in mm, hump position (front/mid/rear), side profile (flared, straight, egg), symmetric vs ergo. This is the single biggest cause of both purchase and regret.
- **Hand size fit.** Buyers measure their hand in cm and want to know if it fits. Nobody in Denmark publishes this mapping.
- **Weight.** The competitive band is now roughly 45–70 g. Below ~50 g is a distinct sub-segment.
- **Grip compatibility** (you already have this — good).
- **Wireless vs wired**, and battery hours as a hard number.
- **Price and DK availability.**

**Tier 2 — narrows the shortlist**
- Switch type (optical vs mechanical) and **double-click failure risk** — a real, widely-discussed reliability issue buyers actively check for.
- Click feel and pre/post-travel.
- Polling rate: 1000 vs 4000 vs 8000 Hz. Real but marginal, and 8 kHz carries a CPU cost worth stating honestly.
- Sensor: effectively a solved problem — every flagship sensor tracks 1:1. Useful as a trust marker, not a differentiator. LOD (lift-off distance) is the one sensor spec that still matters in practice.
- Skates/feet quality, coating, shell creak.
- Software: does it need a background app, or does it hold settings onboard?

**Spec noise (people search it; don't lead with it)**
- Max DPI. 32K, 44K — irrelevant. Pros play at 400–1600. Keep the field because people search "DPI," but never rank on it.
- RGB, button count beyond 6 for FPS.

### What to add to your mouse pages

Your current spec table is: Brand / Vægt / Formfaktor / Sensor / Max DPI / Polling rate / Prisniveau.

Add:

```
Længde / Bredde / Højde (mm)
Anbefalet håndstørrelse (cm)          ← derived, your own scoring
Forbindelse (kabel / 2,4 GHz / BT)
Batteritid (timer)
Switch-type (optisk / mekanisk)
Knapper (antal)
LOD (mm)
Software påkrævet (ja/nej)
Pris hos alle 3 forhandlere + billigste
Lagerstatus
```

### Data accuracy — audit this now

With only 14 mice, every error is a large share of the database. On the front page the DeathAdder V3 is listed as *Trådløs / 1000 Hz*, which mixes the wired V3 (8000 Hz) with the wireless V3 Pro. The Zowie EC2-DW shows "3K DPI," which reads like a display/rounding artefact. Fix these before scaling — a Danish audience that spots one wrong spec stops trusting the price data too.

### Moat opportunity

**A hand-size → shape finder.** Extend `/find-mus` so the first question is hand length in cm, second is grip, third is game. Output: 3 mice, with reasoning, with DK prices. That's the conversion engine, and it's defensible because it requires the dimension data nobody else in DK has entered.

---

## 3. Mousepads

**Do this second.** It's the cheapest category to build, the pro data is genuinely meaningful, it's badly served in Danish, and it converts well because the price point is low enough for an impulse purchase.

### What buyers decide on

**Tier 1**
- **Glide characteristic: speed / balanced / control.** The entire category organises around this axis. Control pads dominate tactical shooters; speed pads suit low-sens sweeping players and tracking-heavy games.
- **Size.** XL is the default; XXL/desk-mat for very low sensitivity. Publish exact mm, not just "XL" — sizes vary by brand.
- **Material: cloth / hard (plastic) / glass.** Glass has grown fast: faster, more consistent, easier to clean, but louder and it eats PTFE skates. Cloth stays the default for comfort and skate life.
- **Thickness** (2–5 mm) — affects wrist comfort and desk feel.
- **Price.**

**Tier 2**
- Edge treatment (stitched vs heat-sealed) and fraying.
- Base grip — does it slide during flicks?
- Coating durability: cheap pads lose consistent glide in 3–6 months; good ones hold a year-plus. This is the strongest value argument in the category and worth stating.
- Surface consistency across the pad (a worn pad isn't a "control pad," it's an inconsistent pad).
- Washability / water resistance.
- Noise.

**Spec noise:** RGB edges, artwork, "gaming-optimised weave" marketing.

### Moat opportunity — the big one

You hold eDPI for 156 pros. Build:

**"Hvilken størrelse musemåtte passer til din sensitivitet?"**
Input eDPI → output recommended size and glide type, backed by "X% af pros under 250 eDPI kører XL control."

That is a proprietary, data-backed tool derived from a dataset you already own. It cross-sells directly from your existing mouse pages, and it's exactly the kind of page that earns links.

### Fields to publish

```
Type (speed / balanced / control)
Materiale (stof / hard / glas)
Størrelse (mm × mm)
Tykkelse (mm)
Kant (syet / forseglet)
Bund (gummi-type)
Vaskbar (ja/nej)
Skate-slid (lav/mellem/høj)   ← especially for glass
Pris hos alle 3 + billigste
```

---

## 4. Keyboards

**Do this third.** Highest search momentum of any category right now, because Hall Effect went mainstream and buyers are confused.

### What buyers decide on

**Tier 1**
- **Switch technology: Hall Effect / magnetic vs mechanical vs optical.** This is *the* axis in 2026. HE boards now start around 350–500 DKK, so the "enthusiast-only" objection is dead.
- **Rapid Trigger + adjustable actuation.** Publish two hard numbers: minimum actuation (mm) and minimum rapid-trigger sensitivity (mm). 0.1 mm is the current floor; 0.2 mm is a real step down.
- **Layout/size:** 60% / 65% / 75% / TKL / full-size.
- **ISO-DK availability.** See below — this is your local moat.
- **SOCD / Snap Tap / Rapid Tap — and whether it's legal in the game you play.** See below.
- **Wired vs wireless**, polling rate.
- **Price.**

**Tier 2**
- **Software quality.** Genuinely decisive here: a 0.1 mm sensor is worthless behind buggy firmware. Wootility is the reference; some competitors run always-on background apps eating 150–250 MB RAM. Worth a field: `Software` + `Kræver baggrundsapp (ja/nej)`.
- Hot-swap support (and whether it takes both HE and MX switches).
- Build: gasket mount, plate material, foam, case material.
- Sound profile — HE switches are almost universally linear and can sound thin on cheap boards.
- Keycaps: PBT vs ABS, doubleshot.
- Onboard profile storage, N-key rollover.

**Spec noise:** RGB, media knobs, mini-screens, "anti-ghosting" (universal), wrist rests.

### The two content pieces that will carry this category

**1. ISO-DK / nordisk layout availability.**
Half the enthusiast keyboard market ships ANSI-only. A Danish buyer who orders a Wooting or a boutique 60% and discovers they can't type æ/ø/å comfortably is a returned product. Adding a single field — `Layout: ISO-DK tilgængelig (ja/nej/kun via keycap-sæt)` — plus a guide page ("ANSI vs ISO-DK til gaming — hvad taber du?") gives you a page no international site will ever write. This is the highest-value single field on the whole site.

**2. Er Snap Tap / SOCD tilladt?**
The current state, which buyers get wrong constantly:

- **CS2: banned.** Valve drew the line in August 2024 — hardware or script automation of multiple actions from one input is prohibited on official servers, and in-game null-binds and jump-throw binds were disabled. Still in force. Applies to Razer Snap Tap, Wooting Snappy Tappy, ASUS Speed Tap and equivalents.
- **Valorant: not currently banned.** Riot has not taken Valve's line.
- **Rapid Trigger itself is fine in both.** It's the SOCD/null-bind behaviour that's prohibited, not adjustable actuation or fast reset.

That distinction is exactly the kind of thing a Danish CS2 player searches for and can't find in Danish. Write it once, keep it dated, link it from every HE keyboard page.

### Fields to publish

```
Switch-teknologi (HE / mekanisk / optisk)
Switch-model
Min. aktiveringspunkt (mm)
Min. rapid trigger (mm)
SOCD-funktion (ja/nej) + CS2-status
Layout (60/65/75/TKL/full)
ISO-DK tilgængelig (ja/nej)
Forbindelse + polling rate
Hot-swap (ja/nej, HE/MX)
Software + baggrundsapp påkrævet
Keycaps (PBT/ABS)
Pris hos alle 3 + billigste
```

---

## 5. Monitors

**Do this fourth.** Highest revenue per conversion by a wide margin — a monitor affiliate commission is worth several mice. But: longest consideration cycle, heaviest competition (Pricerunner, Prisjagt, RTINGS), and the weakest pro signal. Build it once mice/pads/keyboards are solid, unless you specifically want to chase ticket value early — in which case accept that it's the hardest category to rank in.

### What buyers decide on

**Tier 1**
- **Refresh rate — framed against achievable FPS.** The honest framing, which almost nobody gives, is: a 500 Hz+ panel is wasted unless your PC actually sustains those frame rates in CS2/Valorant. That framing is more useful to a Danish buyer than a spec table and it builds trust.
- **Panel technology.** The old "TN for esports" shortcut is breaking down:
  - **TN / E-TN** — raw speed, 0.2–0.5 ms, 540–600 Hz tier. Genuinely still the elite esports choice, but colour and viewing angles are materially worse and it's a single-purpose display.
  - **Fast IPS** — has replaced TN for most players. Fast enough, far better for everything else.
  - **OLED / QD-OLED** — best motion clarity and contrast, now mainstream at 240–360 Hz. Burn-in risk with static HUDs is the real objection for competitive players.
  - **VA / Mini-LED** — contrast play, model-dependent.
- **Size + resolution combo.** 24–25" 1080p is the competitive standard; 27" 1440p is the all-round pick.
- **Motion clarity tech:** DyAc 2, ULMB 2, backlight strobing. This is what actually separates panels at similar Hz.
- **Measured input lag** (not manufacturer claims).
- **Price.**

**Tier 2**
- Adaptive sync — largely a non-issue now; VESA Adaptive-Sync works with both current GPU vendors.
- Stand ergonomics / VESA mount.
- Coating (glossy vs matte) and text clarity / subpixel layout.
- Connectivity: DP 2.1 for the highest refresh tiers.
- **Warranty terms, especially OLED burn-in coverage** — pair with Danish `reklamationsret` (2 years statutory) vs manufacturer warranty. A local angle nobody covers.

**Spec noise:** DisplayHDR 400 badges, "1 ms MPRT," built-in speakers, RGB backlight.

### Honest positioning

Label monitors clearly: `Turneringsudstyr` vs `Spillerens eget valg`. When you write "used by 40 pros," a reader who knows the scene knows those 40 pros played on whatever the tournament provided. Saying so first makes the rest of your data credible.

The genuinely interesting, searchable angle here isn't "what pros own" — it's **"hvad står der på scenen til de store CS2-turneringer"**, which is a real question with a real answer.

---

## 6. Headsets

**Do this last.** Big search volume, but weakest pro signal, most crowded market, and the buying decision hinges on comfort — something you cannot convey through a spec table.

### What buyers decide on

**Tier 1**
- **Comfort: weight in grams, clamp force, pad material.** The dominant cause of regret and returns. A headset that hurts at hour two loses regardless of audio.
- **Positional accuracy — soundstage and imaging.** For CS2/Valorant this is the performance argument: can you place footsteps.
- **Open-back vs closed-back.** Open = wider soundstage, better positional accuracy, zero isolation. Closed = isolation and bass. Many competitive players use open-back at home and closed at LAN.
- **Mic quality**, if it's their only microphone.
- **Wired vs wireless**, latency, battery hours.
- **Platform compatibility** — Danish buyers include a lot of PS5/Xbox users; this is a real filter.
- **Price.**

**Tier 2**
- Driver type (dynamic vs planar) — planar is the current premium detail-retrieval story.
- Replaceable earpads and cable — determines lifespan.
- EQ/software, and whether it's mandatory for decent sound.
- Sidetone, ANC, simultaneous BT + 2.4 GHz.

**Spec noise — actively push back on these**
- "20 Hz–20 kHz frequency response." Meaningless; it's the range of human hearing.
- Virtual 7.1 branding. Weak substitute for a good stereo soundstage.
- Driver diameter in mm. Bigger ≠ better.
- RGB.

### Honest positioning

Write the "pros use IEMs under the sponsor headset at LAN" piece. It's true, it's interesting, it explains why your usage data looks the way it does, and it's exactly the kind of insider content that makes a settings site feel authoritative rather than scraped.

---

## 7. Cross-category priorities (these matter more than any single category)

### 7.1 Price is the product

You're currently showing **one** retailer per product. That discards your main advantage. Minimum viable:

- All three retailers, sorted, cheapest highlighted
- Stock status ("På lager / 3-5 dage / Udsolgt")
- Price history sparkline, or at minimum "laveste pris de sidste 90 dage"
- Price-drop alert signup — this is also your email list

An out-of-stock cheapest price is worse than useless; stock status is doing real work here.

### 7.2 Danish-specific data nobody else publishes

This is the moat. Concretely:

| Field | Why it matters |
|---|---|
| ISO-DK layout availability | Blocks keyboard purchases; nobody covers it |
| Danish stock + delivery time | Decides where they buy |
| Reklamationsret (2 år) vs producentgaranti | Especially relevant for OLED burn-in and mouse switch failure |
| Fortrydelsesret (14 dage) | **Critical for mice** — the shape-fit problem is only solvable by trying it. Tell people they can return it. This *increases* conversion, it doesn't reduce it. |
| Priser i DKK inkl. moms | Obvious, but state it |

### 7.3 Tools beat databases

`/find-mus` is the right instinct. Extend the pattern:
- `/find-musemåtte` (eDPI → size + glide)
- `/find-tastatur` (game + layout + budget → HE or mechanical)
- `/edpi-beregner` (calculator; strong evergreen search traffic, links into everything)
- `/find-skærm` (FPS you actually get → Hz tier you should buy)

Tools convert. Spec lists inform. You need both, but the tools are what earn the affiliate click.

### 7.4 Trust infrastructure

- **`Sidst verificeret: [dato]`** on every pro's gear. Settings sites rot fast and readers know it.
- **Source per entry** — stream / interview / team post / photo. One line, huge credibility gain.
- **`Sponsoreret udstyr` vs `Spillerens eget valg`** flag. Your most important honesty signal.
- Keep the transparens page prominent. You already do this — it's a genuine asset.

---

## 8. Recommended build order

| # | Category | Effort | Why here |
|---|---|---|---|
| 1 | **Mice — depth** | Low | You already rank. Adding dimensions + hand-size fit + 3-retailer pricing fixes the biggest gap in the highest-value category. Do not expand sideways before this is done. |
| 2 | **Mousepads** | Low | Cheap data, strong pro signal, underserved in DK, and the eDPI tool is a genuine differentiator built from data you already hold. |
| 3 | **Keyboards** | Medium | Strongest search momentum (HE/rapid trigger). ISO-DK and the SOCD legality page are content nobody else will write in Danish. |
| 4 | **Monitors** | High | Best revenue per conversion, but weak pro signal and brutal competition. Worth doing — just not before the above. |
| 5 | **Headsets** | Medium | Highest volume, lowest signal quality, most crowded. Do it for completeness of the "setup" story, not as a growth bet. |

A reasonable alternative: if you want to test high-ticket affiliate revenue early, slot monitors in at #3 and accept slower ranking. Don't slot headsets earlier under any reading.

---

## 9. Content pages worth writing (Danish, evergreen)

Ranked by opportunity — search intent that exists in Danish and is currently unserved:

1. `Er Snap Tap / SOCD forbudt i CS2?` — high confusion, clear answer, links to every HE keyboard
2. `ANSI vs ISO-DK tastatur til gaming` — nobody owns this
3. `Hvilken størrelse musemåtte skal du have?` (eDPI-based)
4. `eDPI-beregner` — evergreen, links everywhere
5. `Hvad er Rapid Trigger — og er det pengene værd?`
6. `Hvor mange Hz kan din PC faktisk udnytte?` — the honest monitor framing
7. `Håndstørrelse og musefacon` — feeds `/find-mus`
8. `Derfor bruger pros ikke det headset du tror` — sponsor transparency piece
9. `Speed vs control musemåtte` — high commercial intent
10. `OLED burn-in og dansk reklamationsret` — local angle, genuinely useful

---

## 10. What to deliberately skip

- **Chairs, desks, GPUs.** Prosettings.net covers them; margins and relevance are poor; they dilute your positioning as an *aim/peripherals* site.
- **Writing your own reviews.** You can't test at RTINGS scale and half-tested reviews damage trust more than having none. Aggregate and cite instead.
- **Ranking on max DPI, driver size, or HDR badges.** Spec noise. Include the fields for search coverage; never sort or recommend on them.
- **Chasing every new release.** 14 accurate mice beats 60 mice with three wrong spec sheets — particularly at your current size, where one visible error costs a disproportionate amount of credibility.

---

## Appendix: minimum data schema per category

**Shared across all categories**
```
brand, model, variant
billede
prisniveau (budget / mid / flagship)
priser: proshop / maxgaming / computersalg
billigste_pris, lagerstatus, sidst_opdateret
pro_antal, pro_liste
udstyrskilde: spillerens_valg | sponsoreret | turneringsudstyr
fordele[], ulemper[]
```

**Mouse** — vægt_g, længde/bredde/højde_mm, formfaktor, hump-position, anbefalet_håndstørrelse_cm, greb[], sensor, max_dpi, polling_hz, forbindelse, batteritid_t, switch_type, knapper, lod_mm, software_påkrævet

**Mousepad** — type (speed/balanced/control), materiale, størrelse_mm, tykkelse_mm, kant, bund, vaskbar, skate_slid, anbefalet_edpi_interval

**Keyboard** — switch_teknologi, switch_model, min_aktivering_mm, min_rapid_trigger_mm, socd_funktion, cs2_lovlig, layout, iso_dk_tilgængelig, forbindelse, polling_hz, hotswap, software, baggrundsapp_påkrævet, keycaps

**Monitor** — panel (TN/IPS/VA/OLED/QD-OLED), størrelse_tommer, opløsning, refresh_hz, responstid_ms, motion_clarity_tech, målt_input_lag_ms, adaptive_sync, tilslutninger, vesa, garanti_burnin

**Headset** — vægt_g, åben/lukket, driver_type, forbindelse, latency_ms, batteritid_t, mikrofon_type, aftagelig_mik, udskiftelige_puder, platform[], sidetone, anc
