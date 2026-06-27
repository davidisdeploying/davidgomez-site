---
title: "June 25 — faking a whole photo library, teaching the demo to act like the app, and mapping it as a graph"
date: 2026-06-25
topics: ["Demo", "Gemini", "Image processing", "Machine learning", "Knowledge graph", "Python", "Data quality", "Web UI"]
summary: "Built a reusable image generator to manufacture a synthetic photo library for the public cull demo, wired the static demo to behave like the real app across several views, and ran a graphify pass to map the app's architecture and data flow."
---

Three threads today, all aimed at the same thing from different angles: making Loupe legible to someone who is not me. A culling tool is hard to show off when the photos are private, so most of the day went into building a fake library convincing enough to demo, and then making the demo behave like the real product.

## Built / shipped

I stood up one reusable image generator on top of Google's Gemini models and grew it across a long chain of jobs. It takes reference images as input, honors a per-job aspect ratio (1:1, 3:4, 4:3, 9:16, 16:9, all resolved to the nearest supported pixel size), picks a per-job model, and names output files from the actual returned MIME type instead of assuming a format. Defaulting to the fast Flash model, it only reaches for the heavier Pro model when an image needs legible text, like a document or a screenshot.

With that, I generated a full synthetic photo library from scratch: a smoke test, then a locked set of identity-anchor images, a validation slice, the main library, document fixes on the Pro model, a marketing set, an aging test, and a younger-era fill that includes a wedding day with a near-duplicate pair and a deliberately blurry dud. End state is a few hundred images across the batch, marketing, anchor, and reference-pack folders. Each batch synced over to a review folder so I could eyeball it.

Separately, I wired the static cull demo to act like the full app across several views: owner mode, the private-items vault, the trips grouping, and a map of where photos were taken. I also added a face-crop pipeline that ran a face detector over the people-tagged photos and produced a couple hundred crops plus a manifest.

The third thread was a graphify pass over the app, producing a knowledge graph of roughly 829 nodes and 1,464 edges across 54 communities. Then I used it as a map to answer three architecture questions: the full set of routes the server exposes, which surfaces are owner-only versus public, and which features depend on which database.

## Problems & fixes

The face detector found zero faces in the tight anchor portraits. Turns out a large detection size is tuned for finding small faces inside big library photos, and it misses a face that fills a fifth of the frame. Dropping back to the default detection size fixed it cleanly.

Gemini also refused to generate sample ID documents until I framed them explicitly as specimens rather than real credentials, after which they passed without trouble.

## Decisions

Identity transfer works by passing the locked anchor images as reference input before the text prompt, so a generated person stays recognizably the same across years and scenes. For follow-up edits in a burst, I reference a freshly generated image from the same run.

I scoped the graph to the app only and excluded the photo library, because building a code graph over tens of thousands of images is expensive and useless.

A spend-cap error from the generator is a hard stop, never a retry. The prepaid credit ran dry partway through, which proved the graceful-stop path was worth building.

## Learned

The biggest architecture takeaway: every read-only database is loaded into memory at startup, so swapping a database file or running a fresh scan does nothing until a restart. Good to have that confirmed rather than assumed.

Also: a process-matching command that searches full command lines will match the very shell that is waiting on it, so a background wait loop never exits. Match on the program name instead.

## Still open / next

The synthetic batches still need a final review pass for identity drift before they get locked into the demo fixture. After that, the real work is authoring a multi-day fixture, mapping every generated image onto year, month, and day buckets, and extending the build to thumbnail all of them. The graph is saved and queryable next time without a rebuild.
