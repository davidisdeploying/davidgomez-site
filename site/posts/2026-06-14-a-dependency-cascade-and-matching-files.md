---
title: "June 14 — a dependency cascade, and matching files back to a list"
date: 2026-06-14
topics: ["Linux", "Debugging", "Dependency management", "SQLite", "Data quality"]
summary: "An aggressive package cleanup quietly broke my storage box's admin UI through a dependency I didn't know was load-bearing. Then a filename-normalizer bug taught me to trust byte sizes over names when matching files back to a database."
---

Two unrelated things ate this day: a system service that wouldn't start because I'd removed something it secretly depended on, and a file-matching bug that came down to trusting the wrong field.

## The dependency cascade

The web admin UI on my storage box half-broke: the file browser reported "no shared folder available," and the user editor wouldn't load. Crucially, the underlying file serving and remote shell never stopped working — the data was never at risk. The breakage was confined to the management layer, which is exactly the kind of split that sends you hunting in the wrong place.

The chase went like this. A core system service was failing to start because its notification helper exited immediately, unable to load a shared library. That library was a symlink into a package I had *uninstalled* during an earlier cleanup — a remote-access feature I thought I didn't need. So: I removed a package → dangled a shared library → an unrelated core service couldn't start → the file browser and user editor broke. A classic load-bearing transitive dependency that nothing advertised.

The fix was almost anticlimactic: reinstall the package purely for its library, leave the feature itself switched off. The service started, the UI came back.

The more useful part was the audit afterward — "is anything *else* silently broken?" The service manager listed several "failed" units, and most of them were nothing:

- a one-shot check that had actually *exited 0* but still shows as "failed" (a bookkeeping artifact of how one-shot units are tracked)
- units that read "failed" with a missing-binary status because the binary was removed in the same cleanup — they never run, cost nothing, and aren't faults

The lesson: **read the exit code before you believe the word "failed."** One genuinely recurring crash turned out to predate the cleanup entirely and to be cosmetic. If I'd reacted to the red text instead of the exit codes, I'd have "fixed" four things that weren't broken.

## Matching files back to a list

The other thread: I had a hand-curated list of ~150 large videos to stage, and I needed to match each row back to its real file in the database. The first pass matched all but four.

The culprit was my own filename normalizer. The ingest process appends a `-<number>` suffix to disambiguate names, so I was stripping a trailing `-<digits>` group before matching. But some *real* filenames legitimately end in `-<digits>` (a date like `...-2`, a camera serial, a literal numeric ID). Stripping blindly mangled them.

The fix is a nice little invariant: only strip the trailing `-<digits>` when those digits exactly equal that file's byte size — because that's the only case where the suffix is actually the size-disambiguator and not part of the real name. With that, the match went to 150/150, every one a distinct file, every one byte-exact on size.

That surfaced the deeper rule: **byte-exact file size plus filename stem is the reliable join key; capture timestamps are not.** A good chunk of the matches showed a divergent capture timestamp — the photo app and my extraction disagree on timezone — yet the size and stem agreed perfectly. Size doesn't drift. Timestamps do.

## Decisions

- Reinstall the package only for its library; keep the actual feature disabled.
- Treat the "failed" units as explained and benign rather than reinstalling things reflexively.
- Match files by size + stem, with timestamp and duration only as tie-breakers, never as a hard key. The whole matching pass stayed read-only — SELECT to CSV, no moves, no writes.

## Learned

- Removing a package can dangle a shared library that something unrelated links against. Dependency graphs don't warn you which leaves are load-bearing.
- A "failed" service isn't always a live problem — a missing-binary unit or a one-shot check can read "failed" while being completely fine. Exit codes first.
- When matching extracted records back to files, trust the byte size. Names get normalized and timestamps get rewritten; the size is the thing that doesn't move.
