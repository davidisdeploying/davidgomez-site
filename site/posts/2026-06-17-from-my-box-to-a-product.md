---
title: "June 17, making Loupe leave my box: portability, a brand, and a public site"
date: 2026-06-17
topics: ["Product strategy", "Python", "Dependency management", "SQLite", "Backups", "Branding", "Design systems", "Typography", "CSS", "Web UI", "Perceptual hashing", "Data quality"]
summary: "The day Loupe stopped being a thing that only runs on my machine. I reframed it as a self-hostable product, made the pipeline portable through environment variables, scrubbed both repos clean for publishing, finalized a brand and header, fixed the photobook's repetition problem, and registered loupeculling.com for a marketing site."
---

This was a pivot day. Loupe has been a personal one-off: a photo culling tool wired to exactly my setup. Today I decided to aim it at other people who want to self-host it, and then spent the rest of the day paying down everything that assumption had let me get away with. Six threads, one throughline: make it portable, make it shareable, make it look like a product.

## The decision that started it

I reframed Loupe as something other people could run, with a friend as test customer number one (Mac plus iCloud, his own storage). The strategic call: build features that *generalize* instead of ones hardcoded to me, and narrow the initial target to Mac + iCloud so I can lean *into* the Apple-photo-library extraction rather than rebuild that intelligence from scratch. It's the highest-value, hardest-to-replace layer. A fancier "setup console" idea got explicitly deferred: build it only after the pipeline is proven end-to-end for a second person, not before.

## Built / shipped

**A portability audit, then a portable spine.** First a strictly read-only audit to find out how coupled the thing really was. The load-bearing finding: the enrichment database (aesthetic scores, people, scene labels) is 100% derived from a macOS photo library. There was *no committed builder* for it, just loose input files sitting around. That's the single biggest blocker for a Mac-less second user. So I:

- Routed every hardcoded path through two environment variables (one for originals, one for generated data), across ten files. Unset, the defaults reproduce my exact current layout, fully backward-compatible.
- Made worker counts environment-driven with host-aware defaults, so a beefier or weaker machine tunes itself instead of inheriting my conservative 4-core values.
- Made the storage-mount safety check optional and off by default, since a new user won't have my mount.
- **Recovered and committed a reproducible enrichment builder.** I'd lost the original throwaway script; I reconstructed it from the session transcript plus the live database's own provenance, packaged it properly, and gated it on a hard test: rebuilding from the raw inputs has to be *bit-for-bit identical* to the live database. All four tables matched. Wrote an onboarding runbook to go with it.

**A finished brand and a redesigned header.** I locked the wordmark: the "o" is an isometric loupe lens on a glass stand sitting over a film strip, with the frame beneath the lens lit amber, like the loupe is examining the chosen frame. Then redrew the Overview header into a compact two-row band: logo left, breadcrumb stacked above a full-width stats line, buttons right.

**A pre-deletion review surface.** The cut and kept tallies in the stat strip are now *clickable*: each opens a filtered grid of everything currently pending-cut or pending-keep. That turns a passive counter into the place you eyeball the whole set before anything becomes irreversible, which is the whole ethos of this project. The counts read from the same state mirror the stats line uses, so the grid can never silently disagree with the number above it.

**loupeculling.com.** Every `loupe.*` domain was taken, so I ran a real availability sweep over a curated candidate list. I had to hit each registry's own lookup endpoint directly because the public aggregator rate-limited me into the ground. The "Loupe Culling" family was wide open. The marketing site is a separate static site, fully decoupled from the app, with faithful app mockups rebuilt in HTML from royalty-free stock photos only: never a real photo from anyone's library.

## Problems & fixes

- **The photobook kept showing near-identical frames and the same selection every load.** Root cause wasn't randomness. It was the *opposite*. The old code returned the score-ranked top-8 per month, which is both stable (same frames every time) and clustered (a burst's frames all score alike, so they sit adjacent). The fix needs both a fresh per-load shuffle *and* a diversity guard: accept a frame only if it clears every already-picked one on perceptual-hash distance and a timestamp gap. In practice the randomization does most of the spreading and the guard is a safety net for genuine bursts.
- **A garbled tagline on the marketing site's mobile hero.** An inline SVG with no width fell back to a 300px default box, which centered the wordmark and shoved the tagline off the edge. Mobile got its own headline-first layout rather than a shrunk desktop.
- **A bumped logo grew the whole header.** I asked for a bigger logo expecting a few pixels of row growth; it grew the full delta because the logo is the *tallest* element in the row, so its height change is a row-height change, not a cosmetic one. I'd also misremembered the current size: verifying against the live file beat trusting my memory.
- **The elaborate logo turned to mud when shrunk** for the header. So the brand is now two tiers: the clean wordmark in the working header, the detailed mark reserved for hero and report headers that have room.

## Publish-safe, the careful part

Making the repos public meant scrubbing them, and that's irreversible, so every step got a gate. I found secrets that had been committed in history, untracked them, and rewrote both repos' histories to purge those along with every runtime database, personal config, model weights, and cached photo previews. The first scrub pass missed the biggest blobs (the model weights and the preview cache), so the repo barely shrank until a second pass: *always re-scan the largest objects after a history rewrite.* The whole thing was gated on a full backup, a bundle, and a byte-identical restore of the live data with a row-count match. All passed. I also de-personalized the source: real names, home locations, owner identity all moved into gitignored config, with neutral placeholders shipping in the source.

## Learned

- A move within one volume aside, the deeper lesson today: a fast-forward merge will *delete* an untracked file from your working tree if a tracked deletion is recorded for that path. I nearly lost a secrets file that way; restore from the stash before restarting anything.
- After a history scrub, re-scan the largest blobs. Don't trust the first pass.
- Derived caches (a rebuilt-at-startup database) legitimately differ after a restart: prove data integrity by row-count against a pre-op inventory, not by a remembered total that drifts as you cull live.

## Still open / next

- Fully scrubbing *old commit history* (not just the current working tree) is the last step left before the repos are publish-safe.
- Credential rotation is on the pre-publish checklist; going public makes it the right call regardless.
- Onboarding the test user on his own Mac and storage, which I can't reach from here.
