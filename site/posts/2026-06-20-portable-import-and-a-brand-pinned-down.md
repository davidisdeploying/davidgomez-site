---
title: "June 20: a portable enrichment import, a console that runs the pipeline, and a brand pinned down"
date: 2026-06-20
topics: ["Python", "SQLite", "Metadata pipeline", "Image processing", "Concurrency", "systemd", "Cloudflare", "Branding", "Design systems", "Typography", "CSS", "Web UI", "Product strategy", "Face recognition", "Debugging", "Data quality"]
summary: "A long, many-threaded day. I built the full path that lets a second person's Apple-photo metadata become my app's enrichment database, turned the setup console into something that can actually start the pipeline stages itself, split the frontend out of the monolith, unified the brand across app and marketing site, stood up real email, and fixed a couple of bugs that had been silently breaking the photo pipeline for a while."
---

This was a sprawling day, closer to a week's worth of small fronts than one story. The throughline, if there is one: most of it was about making Loupe runnable by someone who isn't me, and the rest was making it *look* like one coherent product while I was in there anyway.

## Built / shipped

**The portable Apple-enrichment path, end to end.** This is the big one. Loupe's enrichment database (aesthetic scores, scene labels, people seeds) is derived entirely from a macOS photo library, which until now meant *my* macOS photo library. I built the whole chain so a second person can produce theirs:

- A standalone Mac-side helper that extracts the records and the search index, packages everything into a single archive.
- A generalized builder that consumes that archive and reconstructs the database. I proved the join key the Apple label index uses is the photo's own UUID (99.6% match), not the other identifiers I'd assumed might work.
- A new upload endpoint and a "Read the negatives" card in the setup console: drop in the archive, it builds to a scratch database, sanity-checks the row counts, backs up the live one, swaps it in, and reloads. No command line anywhere in the flow.

I validated it against my own 81,000-photo library: the new build went from ~73,000 bridged records to ~76,800, zero regressions, and it actually corrected 700-odd previously mis-stamped photos. A filesize-tightened matcher recovered files that the old, stricter logic had refused.

**A setup console that can run the pipeline.** The console used to be a read-only status page. Now it can *start* the hand-run stages (ingest, contact-sheet generation, face detection) as detached, single-flighted, resumable jobs, each with its own trigger card. You click "Develop," it kicks off ingestion in the background and streams progress with a live rate and ETA; the same machinery generalizes across all three stages.

**Frontend out of the monolith.** The app's frontend was 2,000+ lines of HTML/CSS/JS embedded inside a 4,400-line Python server file. I lifted it out into its own files in two stages (first the whole page as one literal, then splitting the CSS and JS into real static assets) verified at each step by a byte-for-byte diff of the served page.

**A unified brand, and real email.** I rebuilt the marketing site's wordmark from the app's exact mark so the site and the app now render identically, synced the site's mockup navigation to the app's real nav, added a People feature section, folded in a founder origin beat and a "how it decides" section, and swapped the closer to the brand tagline. On the design side, I produced a canonical design-system spec and a self-demonstrating visual-system teaching guide, and confirmed the design tooling is now at parity with both the app and the site. I also stood up real email on the marketing domain: diagnosed that the early-access form had no backend *and* the address couldn't even receive mail, then set up a proper custom-domain mailbox with the full DNS record set verified live.

## Problems & fixes

- **A bug had been silently breaking the face pipeline.** When I'd consolidated shared constants earlier, the set of video extensions became a frozenset, and two places were dropping that set straight into a SQL string. SQLite chokes on it (`unrecognized token "{"`). It had quietly broken every full face-detection pass since the consolidation; the live app only looked fine because its face data came from an *older* run. The fix: bind the values as proper placeholders instead of interpolating. I swept for sibling sites and caught a second one in the pipeline repo.
- **The setup console's "Done" message kept vanishing.** The console rebuilds its cards from a static template every few seconds, so any terminal state got wiped on the next poll. Fix was to make the card's state replayable: store it, re-apply it after every rebuild.
- **The marketing site's mockups rendered broken: full-width images, bare "?" rows.** It read like a CSS bug, but the live CSS was correct. The real cause: I'd reused the same cache-buster query string across several CSS edits, so returning browsers kept serving a stale stylesheet. Bumping the version fixed it. Lesson logged: bump the cache-buster on *every* CSS change, ideally automatically in the deploy script.
- **The site kept deploying to the wrong place.** My local branch was named one thing while the host's production branch was another, so every plain deploy silently landed as a *preview* and the live site stayed stale. Two generations behind, it turned out. Fixed by pinning the production branch explicitly and writing a deploy script that hard-codes it, refuses a dirty tree, and verifies the live site after.

## Decisions

- **Detached pipeline jobs run in their own cgroup, not as plain background processes.** The service kills its whole process group on restart, so a naively-detached child gets taken down with it, including by the restart the import flow itself triggers. Putting each run in its own transient scope lets it survive, which matters for a multi-hour ingest.
- **Cold-start by guarding the readers, not by bootstrapping a database.** The app couldn't boot a truly empty library. Rather than have the server write a starter database, I guarded the three readers that crashed on the empty path: the server never writes the metadata store; the "Develop" click creates it, because the pipeline owns it.
- **The design system is the canonical source of truth.** The live app's colors are a tracked drift that reconciles *up* to canonical, not the other way around.
- **Backed off a downloadable Mac app** for the test user: code-signing and bundling is a whole second product to maintain, and a script does the job for now.

## Learned

- A container interpolated into SQL is a recurring trap: bind, never interpolate, and audit siblings the moment one surfaces.
- Reusing a cache-buster query while editing the file it points at ships stale assets to returning browsers; the symptom masquerades as a content bug.
- For a direct-upload static host, a deploy lands on production *only* when the branch matches the host's production branch: keep the local branch name aligned and pin it.

## Still open / next

- The marketing early-access form is still a leaky mailto capture; a real backend is deferred until it's worth building.
- The in-process reload of one pipeline stage still falls back to a full service restart. A cleaner version waits for a focused refactor window.
- Some app views still need a design reconciliation pass; the People view was the priority gap and it's done.
