---
title: "June 12 - culling rules that find nothing, and a bucket that wasn't what it looked like"
date: 2026-06-12
topics: ["SQLite", "FFmpeg", "Perceptual hashing", "Image processing", "Data quality"]
summary: "With the metadata database built, I started writing rules to surface delete-candidates. Two of the rules found nothing, one was secretly broken, and the biggest 'junk' bucket turned out to be footage I'd never delete. The lesson of the day: rules lie, pixels don't."
---

The thing that clicked today: rules are confident and wrong all the time, and the contact sheet is what keeps you honest. Now that every file's metadata is in a database, the next phase is generating candidates for deletion, never deleting anything, just surfacing "you probably don't want these" by rule. The photo library itself stays the source of truth; this phase only writes CSV lists and a summary. That read-only discipline turned out to matter, because several of the rules were wrong in instructive ways.

## Built / shipped

A set of documented candidate rules, split into a high-confidence tier and a human-review tier: exact duplicates, orphaned short clips, screenshots, burst extras, blurry shots, and obvious junk. Each rule is a query that emits a CSV; nothing mutates the database except one approved write (below). I also built a sampler that pulls a reproducible random 40 rows per rule and renders them into HTML contact sheets, so I could actually look at what each rule was flagging instead of trusting the count.

## Problems & fixes

Exact-duplicate detection found zero duplicates. The content hash is real (I verified it against the system hashing tool on an actual file), but there are no byte-identical files in this library. The `foo (1).jpg` twins everyone has are re-encodes, not copies, so they hash differently. Exact-hash dedup is useless here; the real follow-up is perceptual near-duplicate matching.

A rule that looked empty was actually blind. The video-duration column was 100% NULL, and in SQL `NULL < 300` evaluates to unknown, so every video silently dropped out of any duration-based rule. The rule didn't error. It just returned nothing, which reads as "no matches" when it really means "no data." I backfilled duration for all ~35,000 videos by reading container headers (resumable, batched, single-column update; three corrupt files refused and always will). Always check that a column is populated before you trust a rule's count.

The blur detector flags the wrong things. A variance-of-Laplacian score calls low-texture-but-sharp frames "blurry": a clean shot of a flat sign or a gray sky scores as blur. A single global threshold also collides with precious old soft-focus photos. It needs a texture guard and per-era tuning, not one magic number, so I made the threshold data-driven (chosen from the actual distribution) rather than hardcoded.

The single biggest flagged bucket (over 5,000 items, hundreds of gigabytes) came through as "shared album." I only caught what it really was by rendering the thumbnails and looking: it's all my own footage from a wearable camera, tagged with a naming signature my rule had misread. It must never be a delete candidate. The "shared album" flag didn't mean what I assumed it meant; it had been set entirely by that one import.

## Decisions

- This phase generates candidates only. Deletion is a separate, much later, deliberate step. The only database write all day was the video-duration backfill.
- Long videos shot at either of two home locations are treated as work product and excluded from culling entirely: protected, not candidates.
- Tagging stays in CSVs until the decision schema is designed properly; no half-baked "to_delete" column bolted onto the main table.

## Learned

- A content hash finds byte-identical files. It does nothing for near-duplicates; that's a job for perceptual hashing.
- NULL comparisons silently shrink result sets: a rule can look empty when it's actually starved of data. Check population first.
- Laplacian blur scores conflate "out of focus" with "low texture," and a global threshold punishes rare, precious soft shots. Look at the pixels.

## Still open / next

The perceptual near-dup pass, a texture-aware blur guard, smarter burst handling that scales the keep-count to the cluster size, and designing the decision schema before any tagging touches the database.
