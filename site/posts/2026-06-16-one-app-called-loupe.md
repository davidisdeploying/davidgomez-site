---
title: "June 16 — a kernel reboot, two apps becoming one, and an enrichment layer pulled from Apple"
date: 2026-06-16
topics: ["SQLite", "systemd", "Cloudflare", "FFmpeg", "Image processing", "Performance", "Concurrency", "Metadata pipeline", "rclone", "Backups", "Branding", "Data quality", "Debugging", "Product strategy"]
summary: "The day the project got a name and a spine: I came back to a box that had silently rebooted, merged two sibling photo-review apps into one productionized service called Loupe, added a cloud backup and AI-written period summaries, and built an enrichment layer that joins Apple's own labels, people, and scores back onto my library by UUID."
---

This was the day the project stopped being two experiments and became one thing with a name. It opened with a recovery I didn't ask for and ended with the app — now called **Loupe** — running as a real service, backed up to the cloud, writing prose summaries of where I'd been, and carrying an enrichment layer pulled straight out of Apple Photos. A lot of threads. Here's the whole day.

## Built / shipped

- **Two apps merged into one.** I had two sibling review tools running side by side. I folded them into a single app — Loupe — built from the broader library tool as the base, with the candidate-review view (rule badges, per-rule chips, false-positive rescue) layered back in, all backed by **one unified decisions database**. I migrated the six real cuts from the old tool, cut over to the new app, gave it a public hostname, and deleted the two old server programs and their separate decision databases — but only after verifying the cutover, and only after tarballing the old code and backing up the database first.
- **Made it survive a reboot.** The whole stack had been hand-started terminal sessions with no auto-start (which is exactly why the morning went the way it did — more below). I turned Loupe into a managed system service that restarts on crash and comes back after a reboot. Verified by killing it and watching it return in about three seconds.
- **Brand and media.** The app got a real identity: a wordmark, an icon, a favicon, an animated loading spinner, an italic display-serif header. On the media side I added on-demand video transcoding (capped at 720p, cached) and a 2048px preview-JPEG path so HEIC files actually render in a browser, plus portrait contact-sheet cards with cycling backdrops sampled only from the local thumbnail cache.
- **Full-library thumbnail backfill.** A one-time job to pre-generate thumbnails for the whole library — about 91,000 of them. Ran roughly five and a half hours, finished all but five (corrupt videos), then I disabled it.
- **Cloud backup of the originals.** An upload-and-verify backup of ~1.65 TB of original files to cloud storage — deletes nothing, with a resume loop around the provider's daily upload cap.
- **AI period summaries.** A three-layer feature: deterministic facts first (counts, time-of-day, cameras, location clustering, modal home area, busiest day), then a venue name per cluster, then short grounded prose. Day, week, and overview views, cached forever after first generation.
- **An enrichment layer from Apple.** The biggest architectural win of the day — a read-only database that joins Apple's own scene labels, OCR text, people, and aesthetic scores back onto my library.

## Problems & fixes

**The box had silently rebooted.** I came back to a dropped connection and a dead stack and assumed the worst — a crash, a storage fault, a power event. It was none of those. The reboot log plus a bumped kernel version told the real story: an unattended security upgrade had cleanly rebooted the machine overnight, and because the whole stack was hand-started with no auto-start, everything died with it. Checking reboot history *before* assuming a fault saved me an hour of chasing a phantom. Everything on disk was intact; I just had to restart it. This is the exact pain that motivated making Loupe a managed service later the same day.

**The thumbnail generator was failing 100% — and it was OOM.** It wasn't a code bug in the obvious sense. It was trying to decode up to 200 large HEIC images at once on a machine with only about 8 GB of RAM, and the box ran out of memory. The fix was to cap concurrency hard (twelve image workers) and split the work into an image phase and a video phase. That cap is now load-bearing — every path that touches decoding respects it, and I've written down: never raise it.

**Two silent write-path failures.** Both the OpenCV image writer and FFmpeg infer the output format from the file extension. Writing to a temp name ending in `.jpg.tmp` makes both of them *silently* fail — no error, no file. The fix: encode to a JPEG in memory and write the bytes, or write to a `…tmp.jpg` name and rename afterward.

**The public site was returning 502.** The fix was binding the app to all interfaces and pointing the tunnel's ingress at the right origin — the tunnel runs on a different host than the app, so pointing it at localhost could never have worked.

**Summaries kept naming home after a nearby business.** The venue resolver was labeling clusters by whatever shop sat a few meters away, so a quiet day at home came out labeled after some random nearby café or restaurant. And an earlier "discount far outliers" heuristic had *erased a real trip* — a genuine drive out to a ranch got filtered as noise. Two lessons collided here: an erased real place is invisible and unrecoverable, while a wrong label is at least catchable. So I ripped the outlier discount out entirely and kept only a minimum-cluster-size filter — under-filter, never over-filter. For home specifically, I suppress to the suburb name plus a distance gate, rather than fighting it with radius tuning that the geometry didn't support anyway.

**The location provider rejected the call.** The legacy geocoding API returned a flat denial for a new project. The newer nearby-search API worked, and skipping sub-feature points of interest (bathrooms, parking lots) let the real venue resolve.

## Decisions

- **One app, one decisions database** — with a hard gate: all six existing cuts verified present before any old database got deleted. It passed.
- **Never proxy full-resolution originals over the public tunnel.** Only derived previews and transcoded video cross it; the raw full-resolution path stays reachable only on my home network.
- **The backup deletes nothing**, ever — upload-and-verify only.
- **Anchor enrichment to the Apple UUID, not fuzzy filename matching.** My pipeline database has no Photos UUID, so the only join available was fuzzy filename matching at ~79% with ambiguity. The better call was to fix the root cause: do a one-time export from Photos keyed on the stable UUID, so labels, people, *and* scores all join on one key — and it's reusable for any future Apple pull.
- **Accept the ~80% coverage ceiling honestly.** The UUID bridge landed at 73,157 of 91,537 assets — about where the fuzzy join already was. But the structural reason is sound: ~10k of my rows are derivatives and duplicates that were never distinct Photos assets, plus ~8.6k with recycled names and junk timestamps. What the bridge bought wasn't more coverage — it was *exactness*: confidence-tiered matches, and a refusal to mis-assign the ambiguous rows rather than inflate the number by guessing.

## Learned

- **Check reboot history before assuming a crash.** A dead stack and dropped connection look identical whether the cause was a fault or a clean upgrade reboot. The logs tell you which in seconds.
- **Decode concurrency is a denial-of-service against your own machine.** Two hundred large-image decodes on a small box is an out-of-memory event, not a throughput win.
- **Image and video writers pick their codec from the file extension** — a `.jpg.tmp` temp name makes them fail silently.
- **Apple's timestamps are a mix, not a drift.** Some capture timestamps are true UTC and some are local wall-clock stored *as if* it were a UTC value. That's not a fixable offset — it forced a wide disambiguation window for matching and it biases any time-of-day bucketing. This is now the most consequential open data-quality issue I have.
- **Two independent signals agreeing is a real signal.** Apple's OCR/document labels and its aesthetic score *separately* agree that screenshots are the lowest-value content in my library. That's the first category to attack in any bulk cull.

## Still open / next

- The cloud backup is still uploading (~1.65 TB, multi-day) — needs a final verification pass when it finishes.
- Five unreadable videos need a re-pull from the source library; I wrote a manifest for it.
- Summaries generate lazily on view — only one day has been produced live so far.
- The enrichment work spawned a set of design prompts — wiring the labels and scores into the actual cull workflow under a "labels nominate, score orders, people protect" principle, a per-frame signal panel showing scores as library-relative percentile bars, and a Live Photo pairing treatment — that were issued but not all confirmed built. That's the next session's thread.
