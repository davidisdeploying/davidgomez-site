---
title: "June 24 — a demo that ships without a backend, and a render pull that lied about succeeding"
date: 2026-06-24
topics: ["Demo", "iCloud", "Apple Photos", "Image processing", "Data quality", "Debugging", "Backups"]
summary: "Built a static, backend-free demo of the Loupe cull UI, untangled an edited-render pull that reported success while writing nothing, fixed an importer that choked on Live Photos, and reorganized all my project notes into one place."
---

A big, scattered day. Five separate threads, but they mostly orbit one thing: getting my edited photo renders out of Apple Photos and into Loupe without lying to myself about whether it worked.

## Built / shipped

The headline is a **static demo of the Loupe cull interface** that runs with no backend at all. Instead of re-mocking the UI, the build copies the real frontend out of the app untouched and wraps it in a thin shim that fakes every server call from an in-memory fixture. Decisions mutate local state; the progress strip recomputes live. It boots as a guest, hides the parts of the nav that don't make sense without a real library, and is meant to deploy straight to Cloudflare Pages at `demo.loupeculling.com`. Two build passes got it from "doesn't even load" to "click through Overview to a single day and keep/cut real photos." The whole thing is committed but not pushed — deploy is gated on me standing up the Pages project first.

I also **imported the ~1,010 edited renders I'd already pulled** into Loupe's render catalog (it had been sitting at five stale test rows), taking an automatic backup before writing anything.

## Problems & fixes

The render pull was the saga. I'd assumed the 4,111 "missing" edited renders were iCloud throttling me and that re-running would slowly accumulate them. Wrong. A second full pass a day later pulled exactly zero — same 1,010, same 4,111 missing. So it wasn't a quota. I chased storage (the Mac was nearly full), an account cooldown, asset availability — and ruled each out, including by just double-clicking a photo and watching it download fine into that same cramped disk. The actual cause: I was pulling the edited versions down through an already-signed-in Mac using an experimental mode that fired off the cloud download requests and never waited for them, so everything got marked "missing" the instant it didn't have a file in hand. Drop the experimental path, let it use the default, and downloads actually completed. The tool had been reporting success while doing nothing.

Then the pulled files started landing with a `" (1)"` suffix — the export re-wrote duplicate-named copies instead of skipping files already on disk, which would both double the storage and break my importer's name matching. I'd set up a small **watch/tripwire to catch exactly this**, and it fired on the second sample, so I caught it early instead of after thousands of dupes.

The importer itself then refused 80 files. Root cause: Live Photos carry a paired video that was mis-flagged, so for those the importer saw "two stills for one photo" and balked. Fixed it by breaking the tie on media type — an image render goes to the image asset, a video render to the video — which rescued 79 of the 80.

Separately, while **reorganizing all my project notes into one place**, I caught a migration script before running it: its safety guard was correct, but its premise was false. It assumed one folder held only the notes I was moving; it actually held ~880 unrelated files, which a single line would have deleted if the allowlist had ever been loosened. And the "backup exists" comment in it was just wrong — it made no backup.

## Decisions

- The demo vendors the **real** frontend rather than a re-implementation, and lives in my existing marketing repo, deployed at the root of its own subdomain so all the absolute paths resolve as-built.
- For the bulk render pull I went back and forth between two tools and accepted that neither is clean — one targets exactly the photos I want but chokes on the hardware, the other is reliable but over-pulls the whole library. No silver bullet; I'd rather run the reliable path by hand than wire up unattended automation in front of a capability I haven't even tested.

## Learned

- A guard can be right while its premise is wrong. Inventory the real target before trusting "this is the only thing here," and treat a "backup exists" comment as a claim to verify, not a fact.
- Moving my notes broke far more than the notes — 23 hardcoded references across scripts and tooling pointed at the old location. Grep everything before calling a relocation done.
- A `<img src>` can't be intercepted by a fetch shim, so a backend-free demo has to serve real image files, not route them through the fake adapter.

## Still open / next

- Phase 2 of the render backfill: pull the remaining ~4,111 missing renders, reconcile the duplicate-suffix mess, import them, and flip the landed renders to display.
- Push the demo live once the Cloudflare project and subdomain are attached.
- Confirm and clean up the parked content and backup files left behind by the notes move.
