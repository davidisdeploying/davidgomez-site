---
title: "June 19 — the day Loupe got its name, its face, and its front door"
date: 2026-06-19
topics: ["Python", "SQLite", "Face recognition", "Maps", "Branding", "Design systems", "Typography", "CSS", "Web UI", "systemd", "Cloudflare", "Debugging", "Data quality", "Performance"]
summary: "A long, many-threaded day: renamed both repos to loupe, shipped the Map and Cutting Room pages, built the in-app People view on top of face embeddings, redrew the brand mark down to the favicon, and stood up the onboarding front door."
---

This was one of those days where I touched almost every part of the project at once. No single big feature — more like five threads braided together, each going recon → build → verify → ship. Writing it down so I remember what actually moved.

## Built / shipped

**Renamed the project to Loupe, for real.** The two repos finally got the names I'd been calling them in my head: the app became `loupe`, the pipeline became `loupe-pipeline`. This had been sitting as a planning doc for a while — I'd even talked myself *out* of a physical rename earlier in favor of symlinks. This time I reversed that and just did it: stop everything, move the directories, fix the hardcoded sibling-path literal in seven app files, restart, verify the app still serves live data from both database layers. It does. Felt good to stop apologizing for the old names.

**Map and Cutting Room went live.** Promoted two things from buried sub-tabs to real top-level pages. The Map draws a vendored, public-domain basemap (no external tiles, no API calls at all) under ~48k geotagged points with clustering and a time scrubber; selecting a place opens a preview card before you commit to reviewing it. The Cutting Room turns the old "candidates" filter toggle into a designed page — six rule piles with real reclaim numbers, contact-sheet strips, a "review all" path into the existing flow.

**The People view.** This is the one I'm most excited about. The pipeline had already detected faces across the library and stored their embeddings, but nothing in the app ever read them — totally greenfield. I built a Faces module that lazy-loads all the embeddings into one normalized numpy matrix on first request and computes "find more faces like this" with a single cosine matmul (no FAISS needed at this scale). Phase 1 was read-only suggestions; Phase 2 added the confirm/reject/snowball loop — the first writes the app makes to that database. Confirm a face, it becomes an anchor, the next round of suggestions gets better. I validated it by rendering montages of my own top matches: the top ~100 are unambiguously me, and quality only starts drifting around a cosine of 0.87.

**A real brand.** Redrew the identity around a "loupe-cup" lens-on-film mark and pushed it everywhere — the animated loading spinner, the static header mark, and a self-contained SVG favicon plus a full raster icon set (16 through 512). Same icons shipped to the live davidgomez.cc marketing site so the tab looks identical in both places. Also changed the page title to the tagline: *Loupe — look · cull · loop*. And I wrote up the whole CSS/SVG design system as a dossier so the visual language is documented, not just vibes.

**The onboarding front door.** Started the setup flow that picks where your library lives and, at altitude, handles connecting to your photo library / signing in. The whole thing is reachable only on my home network, never from the public side. (More on what I'm deliberately not detailing below.)

## Problems & fixes

- **The People button "did nothing."** Classic. The click handler was wired perfectly — the view just rendered *behind* the main app because it wasn't a full-screen fixed overlay like every other working view. Mirrored the overlay pattern and it appeared. The lesson logged itself: a dead-looking button is as often CSS layering as it is broken JS.
- **Face crops were going to hammer the network storage.** Every original lives on a slow network mount. I derived face crops from the existing thumbnail cache instead, only reaching for hi-res on tiny group faces, and cached each crop by face id.
- **Insightface embeddings aren't normalized.** They come out at ~22 norm, so cosine scores are meaningless until you L2-normalize. Found it the way you'd expect — by getting nonsense scores first.
- **Favicon rendering with no rasterizer.** No SVG-to-PNG tool installed and no way to sudo one in, but the Cairo library was present, so I rendered the whole icon set through a throwaway virtualenv.

## Decisions

- Faces lives in its own module; embeddings load once into a process-cached matrix; writes touch *only* the assignment and rejection tables, never the detected-face rows or embeddings — gated behind a pre-write backup and a byte-identical check after.
- Per-person rejections needed their own table, because the assignments table keys on the face, which can't express "this face is not person A but might still be person B."
- Map uses an offline reverse-geocoder and a vendored basemap — zero external map API calls, by design.
- Committed the favicon PNGs into the repo (un-ignored them) so a fresh clone renders icons with no build step.

## Learned

- A restart only helps if the running process post-dates your edit — verify the *served* code, not just that you issued a restart.
- When checking that images loaded headlessly, count successful network responses, not `<img>` tags — the map library creates tile elements even when their source 404s.
- Safari's Cmd-Shift-R is Reader mode, not hard refresh, and favicons live in a cache that survives normal reloads. Cost me a few "why isn't it updating" minutes.

## Still open / next

- The People view wants a Phase 3: creating new people, manually seeding someone with zero anchors, and filtering out the tiniest faces that confuse the threshold.
- The map loads about 48,800 geotagged points where I expected closer to 61k — need to reconcile where the gap is.
- The setup/onboarding flow has a piece I still have to drive by hand on my home network, and a security review I want done before I take it any further. Treating that thread with extra care.
