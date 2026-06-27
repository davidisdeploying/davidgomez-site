---
title: "June 26 — the demo stops faking it: every view wired, real face crops, live in production"
date: 2026-06-26
topics: ["Demo", "Web UI", "Cloudflare Pages", "JavaScript", "Python", "Image processing", "Computer vision", "Product strategy"]
summary: "The marketing demo stopped being a screenshot tour and became the actual Loupe app running over a hand-authored fixture — every view wired in owner mode, real detected face crops, a library full of believable junk frames, and a production deploy."
---

The thing that clicked today: the demo IS the app. The demo at demo.loupeculling.com isn't a guided screenshot tour anymore. It's the real Loupe frontend, byte-for-byte, running over a hand-authored fixture with a small shim that answers every `/api/*` call from in-memory data. No server, no database, no backend at all — and the whole thing now behaves like the owner's logged-in view.

## Built / shipped

Every view is live now. I wired up the last holdouts so the demo runs in full owner mode: Vault, Trips/Places, the Map, the Cutting Room, Settings, and People. Owner mode itself turned out to be a single flag flip at build time; surfacing a view was mostly removing it from the hide list and adding the route it needs.

Trips and the Map got real geography. The fixture generator now emits four non-home clusters — Lisbon, a coast trip, the Alps, Tokyo — 49 frames in all, and the Map derives its points from each photo's GPS, drawing the cluster map from a mapping library loaded at runtime.

The People view shows actual faces. I ran a face-detection model over the ~74 people-tagged photos and got 236 real crops plus a manifest, so the People grid is detected faces, not placeholders.

I ran a "realism" image campaign to make the library feel lived-in. The trap with a demo is that every frame is too good. So I validated a deliberately-mediocre "real iPhone snapshot" look — mundane subjects, vertical framing, flat or harsh light, ordinary phone-camera imperfection — and generated dozens of throwaway frames (36 for 2021, 32 for 2022) to fill empty months. They all land as unreviewed backlog: the believable, cuttable clutter a real photo library actually has.

Writes persist now. Vaulting and confirming/rejecting people used to fake success and revert on navigation; they now mutate session state and stick for the visit. And I wired a contract-drift guard into the build, then deployed to Cloudflare Pages production once I'd explicitly given the go-ahead.

## Problems & fixes

The face detector found zero faces in the tight portrait anchors at first. Counterintuitive: the large detection size I'd reused is tuned to find *small* faces in big photos, so it sailed right past faces filling a third of the frame. Dropping back to the default size found all of them, at higher confidence.

A few small landmines: the Map's "home" flag has to be an integer 1 — the app compares it strictly, so a boolean true silently never matches. Image and video loads bypass the fetch shim entirely (they're `<img>`/`<video>` requests, not fetches), so those have to be real files or explicit allowlist entries, not shim routes. And the generated images kept leaking brand logos until I made a brand-avoidance line mandatory on every generation prompt.

## Decisions

A fresh, un-interacted load has to stay byte-identical to before — so session writes ride on session-only flags kept separate from the authored state. The contract guard now fails the build if the real app grows an endpoint the demo can't answer; that's the intended signal to come back and update the demo. And production deploys require my explicit say-so in the moment — the agent correctly refused twice when it was only acting on a relayed instruction.

## Learned

Big detection windows hunt for small faces; use the default size for portraits. The cleanest way to prove a fixture change is safe is to deep-compare every read endpoint old-versus-new on a fresh fixture — 183 of them, byte-identical, done.

## Still open / next

The Map is online-only for now (its mapping library loads from a CDN); self-hosting it is parked. The 2023–2025 months still need their realism fills. And both project ledgers are over their size cap — compaction is due.
