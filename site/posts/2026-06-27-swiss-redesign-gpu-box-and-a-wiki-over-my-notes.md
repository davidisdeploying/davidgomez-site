---
title: "June 27 — A Swiss redesign, a GPU box on CUDA, and a wiki over all my notes"
date: 2026-06-27
topics: ["Design systems", "Typography", "CSS", "Eleventy", "Machine learning", "GPU", "CUDA", "Python", "Linux", "Knowledge graph"]
summary: "Reskinned davidgomez.cc into a Swiss/International typographic system, stood up a GPU box and proved face-embedding on CUDA, and hand-built a regenerable wiki over every one of my notes."
---

Four separate things shipped today, and they have almost nothing to do with each other except that I built all of them.

## Built / shipped

I redesigned davidgomez.cc end to end. I'd been poking at home-page concepts for a while (a contact sheet, a working loupe, an asset plate) and none of them landed, so I made a drastic departure: Swiss / International Typographic Style. Cool-paper background, near-black ink, one red accent, Archivo grotesk at every weight, strict grids, sharp corners, hairline rules. I did the whole site through one shared stylesheet that restyles the existing class names instead of touching markup page by page, then added a scroll-motion layer (reveals, parallax, label slide-ins, a stat count-up), then purged every em-dash and en-dash from the copy. Three production deploys, each previewed before it went out.

I also brought up a dedicated GPU box at a second location as a compute node for my photo project's batch ML workloads. Installed the NVIDIA driver only (no CUDA toolkit), rebooted, and confirmed the card (a GTX 1650, 4 GB) was live. Then I built the ML stack on it and proved the real workload: face embedding running on the GPU via CUDA, producing 512-dimension vectors that are byte-for-byte identical to the ones already in my library. That last part mattered most: a faster machine is useless here if its output doesn't merge cleanly with what I already have.

And I hand-built v1 of a cross-vault wiki: a generated topical map over all my project notes. 31 synthesized pages from about 130 markdown notes, namespaced per source so domains don't bleed together, with a manifest and a maintenance doc. Plus a small glossary vault to feed it.

## Problems & fixes

The ML stack fought me. My first build used the box's default Python, which is brand-new (3.14), and the entire GPU ML ecosystem has no wheels for it yet, so a runtime library just wasn't there and nothing would import. I tore it down and rebuilt on Python 3.12, pinned to an older CUDA-12 line of the GPU runtime that actually has matching wheels. Then a subtler trap: the GPU runtime installs its libraries but doesn't put them on the loader path, so it silently falls back to the CPU and looks like it's "working." The fix is to point the library path at the right directories and then assert at startup that you actually got the CUDA provider, not trust that you did.

Minor one on the web side: a "Cannot GET /http://..." error that looked like a server fault was just a doubled URL pasted into the address bar.

## Decisions

The Swiss look is the new identity; the old warm darkroom-serif brand is retired. The site is intentionally light-locked, no dark mode. I preserved the entire old site on a backup branch and tag before merging, because a deploy here is a public, hard-to-unsee thing.

On the GPU box: driver only, runtimes bring their own CUDA. Pin the ML environment to Python 3.12, not the distro default. Design for cache-locally-first rather than streaming originals over a slow link.

On the wiki: two layers, where the source notes are read-only truth and the wiki is fully regenerable. A hard, universal no-restructure rule (the automation only ever writes inside the wiki, never moves or renames a source file anywhere). Markdown only for v1. Hybrid regeneration, so unchanged pages stay byte-stable and a diff actually means something.

## Learned

- Em-dashes are increasingly read as an AI tell, so for human-voice copy I'm leaning on commas, periods, and parentheses instead.
- Accessible scroll motion is IntersectionObserver plus CSS scroll-timelines, never scroll listeners, transform and opacity only, with the static site as the no-JS fallback.
- Whether a GPU runtime bundles its own CUDA is version-dependent; verify per build instead of assuming.
- The CUDA version a driver reports is the max it supports, not what's installed.
- Markdown-first ingest is what makes a binary-heavy vault safe to include: the authored notes come in, the archive is ignored. And a knowledge base you can't diff is one you can't trust to tell you what changed.

## Still open / next

There's an interactive-loupe home concept I left as an untracked maybe, to build out or delete. The GPU box still needs to run the real backfill once it moves onto the network where the originals live. And the wiki still needs its nightly automation wired up, with read-everything / write-only-the-wiki permissions, after I've watched it run by hand a couple more times.
