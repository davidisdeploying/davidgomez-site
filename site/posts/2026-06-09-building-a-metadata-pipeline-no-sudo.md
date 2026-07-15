---
title: "June 9 - building a photo-metadata pipeline with no sudo and a flaky network"
date: 2026-06-09
topics: ["SQLite", "Metadata pipeline", "ExifTool", "Perceptual hashing", "Concurrency", "Performance", "Python"]
summary: "Day one of the photo project: build an ingest tool that reads ~91,000 photos and videos into a SQLite database so I can cull systematically. The build went fine. The environment fought me, and the performance lessons were not where I expected."
---

The thing that clicked today: I have on the order of 91,000 photos and videos accumulated over twenty years, and I want to cull them systematically instead of by guilt and vibes. The first step is boring and load-bearing: read every file's metadata into a database so I can ask real questions before I delete anything. This was day one of building that ingest tool.

## Built / shipped

A single ingest script, grown over four iterations and tested on real directories at each step before moving on. It walks the library, pulls EXIF and file metadata, computes a content hash, computes perceptual hashes and a blur score for images, pairs up Live Photos, and writes it all to a SQLite database. The database lives on a local SSD with write ahead logging, never on the network share, because SQLite and network filesystems despise each other over small writes and locking.

## Problems & fixes

The brief said the metadata tools were "already installed." They were not, and there's no passwordless sudo on the box, so I couldn't just install them. The fix was to vendor the standalone Perl distribution of the EXIF tool and call it directly. No root required, fully self-contained.

Then the big Python image libraries kept dying mid-download on a flaky TLS connection (`DECRYPTION_FAILED_OR_BAD_RECORD_MAC`, over and over). The fix was a small script that fetches each wheel with a resumable download, then installs from the local folder with no index. One gotcha worth writing down: the computer-vision wheels ship as `abi3` (`cp37-abi3`), not `cp312`. A selector keyed on the exact Python version silently misses them.

## Decisions

- Create the full table schema (every column and index) up front, so later iterations only backfill columns and never have to migrate.
- Build resume in from the start: skip a file if it's already processed and its size and mtime are unchanged, and never re-hash a file that hasn't moved.
- Batch one EXIF invocation per directory instead of per file. The per-file cost was process startup, not work: spawning the EXIF tool once per file is dominated by Perl startup (~256 ms), and batching one invocation per directory cut a fresh ingest by 61%. It only helps across many directories; a single directory has nothing to overlap.
- Cap workers at four rather than guessing higher. I A/B'd 4 vs 6 vs 8 workers on a 25 GB directory. All three finished within 0.6% of each other (~39.5 minutes), zero errors. Past about four workers you buy nothing but RAM, because full-file hash reads over the network share are the bottleneck. Effective throughput landed around 10.8 MB/s, which extrapolates the whole library to roughly two days of wall time.
- Read each image's bytes exactly once and feed them to both the hasher and the decoder, no second read of the same file over a slow mount, and compute blur on a grayscale image resized to a fixed longest edge so the scores are comparable across resolutions.

## Learned

- When the environment contradicts the brief, vendor your way out: a standalone, no-root binary beats waiting on sudo.
- Flaky TLS murders large package downloads; resumable per-file fetches plus a local install index is the reliable path.
- Benchmark before you tune. I'd have happily thrown eight workers at this; the measurement said four, and said the real cost was the network, not the CPU.

## Still open / next

The full multi-day ingest run, a duration backfill for videos once a media probe tool is available, and a decision about whether to keep full-file hashing every large video over the network or sample head/tail instead. And a couple of modern formats (`webp`, `avif`) aren't in the extension list yet, so they're being silently skipped, a thing to catch before it bites.
