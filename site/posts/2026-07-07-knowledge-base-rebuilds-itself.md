---
title: "July 7 - a knowledge base that rebuilds and reorganizes itself every night"
date: 2026-07-07
topics: ["Homelab", "Automation", "Knowledge base", "Pipelines", "Reliability", "Self-hosting"]
summary: "I write a lot of scattered notes across a lot of projects, and instead of ever organizing them by hand, I built a pipeline that rebuilds and reorganizes the whole thing every night while I sleep."
---

The thing that clicked today: I write a lot of scattered notes across a lot of projects, and instead of ever organizing them by hand, I built a pipeline that rebuilds and reorganizes the whole thing every night while I sleep.

## Built / shipped

A nightly chain that turns raw notes into an organized reference. Every night, in order: the day's scattered notes get merged into their running logs, then a builder reads across all of them and rewrites an organized, cross-linked reference (a page per real topic, tool, project, or person, not a page per note), then the search index rebuilds, then the whole thing gets committed so there is a history.

It reorganizes by meaning, not by folder. The builder synthesizes across many notes into topic pages, each citing the source notes it drew from, so the reference stays useful even as the underlying pile grows messy.

Only what changed gets rebuilt. It keeps a fingerprint of every source note, so each night it only reworks the pages whose sources actually changed and leaves the rest untouched. That keeps the run cheap.

## Problems & fixes

A failed run must never corrupt the live copy. The build writes everything off to the side and only swaps the new version in if the whole run succeeds. When the pipeline once failed several nights running on a bad setting, the live reference stayed perfectly intact the entire time, which is exactly what I wanted.

Timing the steps so they do not collide. The steps have to run in order without stepping on each other or on the machines they use, so they are staggered through the quiet early-morning hours, each with room to finish before the next begins.

## Decisions

Synthesize, do not just list. A pile of notes is not a reference. Having the pipeline rewrite topic pages across many notes, with citations back to the sources, is what makes it something I actually read.

All-or-nothing swaps. Building to the side and swapping in only on full success means a broken run is a no-op, not an outage. I would rather have yesterday's good copy than today's half-built one.

## Learned

The best organization is the kind you never have to do. I was never going to hand-organize thousands of notes. A nightly job that does it for me, and fails safe when it breaks, turned an impossible chore into something that just happens.

Rebuild only what changed. Fingerprinting the sources so the run skips everything untouched is what keeps a nightly full-corpus rebuild from being wasteful.

## Still open / next

With the reference rebuilding itself, the next want was to search it by meaning rather than by keyword.
