---
title: "June 15 - the 462 GB move that took 0.09 seconds, and two review tools"
date: 2026-06-15
topics: ["SMB", "rclone", "Backups", "SQLite", "Web UI", "FFmpeg", "Concurrency"]
summary: "A long day: turning a 462 GB copy into an instant rename by understanding the filesystem, catching two backup processes about to trample each other, and building two browser tools to actually review ~91,000 photos without ever deleting one by accident."
---

The thing that clicked today: do the irreversible things slowly and the reversible things fast. This was a four-arc day: a storage trick that saved hours, a backup that nearly tripped over itself, and two interactive review tools.

## Built / shipped

An interactive browser tool for deciding what to keep: stdlib-only, decisions written to a separate database, three states (keep / cut / undecided), and, the part I care most about, nothing is ever deleted. A "cut" only adds an ID to an exported list. I reorganized it from a rule-bucket grid into a time-based view (month, week, day) with a swipe-to-decide focus mode and a warm "darkroom" skin, leading each item with when and where it was taken, because for personal photos that's the real keep/cut anchor. Full-resolution originals stay on my home network; only thumbnails go over the public path.

Then a sibling tool for reviewing the entire library day by day. The key adaptation for ~91,000 items is a "mark the rest of this day kept" sweep: you swipe-cut the few you want gone, then one tap closes the day. Thumbnails generate on demand as you open each day (no pre-rendering 91k of them) into a shared cache, so overlapping items are free.

I also replaced hand-babysitting the off-site backup with an orchestrator: wait for the live copy to finish, idempotently re-run to guarantee completion (the copy tool skips already-uploaded files), run the second folder strictly afterward, and verify at the end, with cause-aware backoff (long pause on a quota hit, short pause on a transient error).

## Problems & fixes

I needed to relocate ~150 large videos (about 462 GB) from one folder to another. The obvious copy-and-verify approach was a 12-18 hour job at the share's throughput. Then I noticed both folders live on the same underlying volume, which means a move is just a rename: zero bytes travel. The risk is that a "move" silently degrades into a slow full copy across a device boundary and you don't notice until hours in. So I proved it first. `os.rename` raises an error on a cross-device move rather than quietly copying, which makes it a perfect instant-or-fail probe: I ran it on the single largest file (~22 GB) and timed it at 0.092 seconds. A real copy would've taken over an hour. That sub-second result is definitive proof it was a true server-side rename, not a copy. (`shutil.move` would have hidden the fallback; `os.rename` is the one to reach for when you specifically want to prove no bytes moved.) The whole set then renamed in about three seconds.

Setting up the off-site backup, I caught a real hazard while babysitting the transfer: two copy processes were running against the same destination at once, the intended one plus an accidental second launch. That's dangerous for two reasons: the destination allows multiple files with the same name in one folder (so you can get silent duplicates), and it double-spends the daily upload quota. Worse, the obvious verification (a one-way check) is structurally blind to duplicates, because it only flags files that are missing, never extras. I killed the duplicate before it did damage. The headless OAuth setup had the usual sharp edges too, the kind where the consent screen and actually enabling the API are two separate steps you both have to get right.

Building the review tools surfaced two more: 200 concurrent video-frame jobs is a denial-of-service against your own box. They thrashed a small, memory-limited machine and the network mount into a timeout storm, and throughput collapsed. The fix is asymmetric concurrency: throttle the heavy video work (~16 at a time), let the light image work fan wide. And the image-writing call picks its codec from the file extension: writing to a `.jpg.tmp` temp name fails with "no writer for the specified extension." The fix is to encode to a JPEG in memory, then write the bytes atomically under the temp name.

## Decisions

- Repointed the database paths for the 462 GB move in a single guarded transaction, set to roll back unless exactly the expected number of rows changed, with a verified snapshot taken first. This was the one genuinely irreversible step of the day (the originals get destroyed), so it got the proof, the snapshot, and the row-count guard.
- Never run two copy processes against one backup destination at once; babysit until the orchestrator replaces the need to.
- Throttle heavy video decode work asymmetrically instead of capping everything to the same concurrency.

## Learned

- A move within one volume is a metadata-only rename. Prove it with the call that fails on a cross-device move instead of one that silently copies.
- Idempotent transfer tools make "re-run to resume" safe, but never run two against one destination; the one-way verify can't see the duplicates that creates.
- Guard irreversible database writes with a row-count check and a fresh snapshot. Make the easy thing fast and the dangerous thing slow.

## Still open / next

The off-site backup orchestrator was left running unattended once the near-collision was resolved. The two review tools were the day's newest surface; no other threads were left open.
