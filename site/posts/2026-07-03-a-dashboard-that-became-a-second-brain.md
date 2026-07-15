---
title: "July 3 - a dashboard that became a second brain: fleet health, my notes, and search over my own work"
date: 2026-07-03
topics: ["Homelab", "Self-hosting", "Dashboards", "Search", "Semantic search", "Python", "Knowledge base", "Access control"]
summary: "Pulled fleet health and my entire notes vault onto one gated dashboard, then added semantic search over my own work by borrowing an embedding model already running elsewhere on the network."
---

The thing that clicked today: once my machines and my notes lived on the same page, the dashboard stopped being about uptime and turned into a way to search my own work.

## Built / shipped

One page for the whole fleet. I pulled every machine's status into a single view: which nodes are up, what jobs are running, and a live feed of activity as it happens. Green when things are fine, amber when something needs a look, red when it does not. That turned five separate checks into one glance.

A reader for my notes. All of my work on these projects lives in plain-text notes, so I put a reader behind the same page. It renders them, follows the links between them, and shows me which notes point back at any given note. The backlinks are the part I reach for most, because they turn a pile of files into something closer to a map.

Search by meaning, not just by keyword. Keyword search was easy. What I wanted was to search for "the time the deploy kept shipping the wrong thing" and land on the right note even without the exact words. That needs a model to turn text into vectors.

## Problems & fixes

The small machine had no room for a second model. The box serving all of this could not load its own copy of a model into memory. Instead of buying hardware, I had the page borrow a model already running elsewhere on the network for another tool, over a local connection, and hand the results back. One model, two jobs, no extra memory.

Keeping the backlinks honest. A backlink map is only useful if it is complete, so I checked the link graph in both directions and confirmed the counts matched, no dangling edges.

## Decisions

Private by default, on my own hardware. The whole thing sits behind an access gate. That was a hard requirement, not a nice-to-have. These are my notes.

Reuse over duplicate. Borrowing the existing model instead of loading a second one was the cleaner call, and the memory limit is what forced it.

## Learned

A tight constraint can produce a better design than a roomy one. The machine being small pushed me toward reuse instead of a second copy, and reuse was the right answer anyway.

## Still open / next

The obvious next step is getting this to reach me when I am away from the desk. A dashboard I have to open is only half the value. Alerts on my phone are the other half, and that is the thread I want to pull next.
