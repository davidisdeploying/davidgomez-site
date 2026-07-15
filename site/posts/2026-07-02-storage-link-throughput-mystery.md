---
title: "July 2 - reads that fell from 96 to 12 MB/s on a link that swore it was fine"
date: 2026-07-02
topics: ["Homelab", "Networking", "Storage", "Troubleshooting", "Reliability", "Self-hosting"]
summary: "Every cheap health check told me my storage link was perfectly healthy while it was actually running at a tenth of its speed, and the real work was proving which piece was lying."
---

The thing that clicked today: every cheap health check told me my storage link was perfectly healthy while it was actually running at a tenth of its speed, and the real work was proving which piece was lying.

## Built / shipped

Confirmed the symptom was real. Bulk reads from my storage box to my compute box had dropped from about 96 MB/s two days earlier to about 12 MB/s, roughly 100 megabit on a gigabit link.

Ruled out the easy answers one by one. The link reported full gigabit, not a fallback. The interface counters showed zero errors and no carrier flaps, so it was not a failing cable retransmitting. Latency was bad until I turned off an energy-saving feature, but fixing the latency did not fix the speed, so that was at most part of the story.

Ran a disk-independent test. The trick that localizes this kind of fault is a raw network throughput test that never touches the disk. A fast network test plus slow file reads means the storage box cannot pull data off its disks fast enough. A slow network test means the wire itself is capping despite reporting gigabit.

## Problems & fixes

Concurrency made it worse, which is the tell. Running four readers at once dropped the total throughput instead of sharing it, which points away from a wire (which would roughly split bandwidth) and toward something thrashing under load.

The culprit was the wire, not the disk. After walking the decision tree, the link was negotiating gigabit but moving data at 100 megabit, and the durable fix was to force it to gigabit and make that survive a reboot.

## Decisions

Eliminate the wire before blaming it. I keep separate cheap tests for each layer (link speed, error counts, latency, a disk-free throughput probe) so I am not guessing which piece is at fault.

Read-only, one command at a time. I was driving this over a phone connection, so I worked in small explicit steps with no risky changes on the storage box.

## Learned

A link can report perfect health and still be broken. Speed negotiation, error counts, and latency all said "fine" while throughput was a tenth of normal. The only thing that caught it was a test built specifically to separate the disk from the wire.

## Still open / next

The fix is in and verified, and the same class of cabling fault has shown up in this house before, so it stays on the watch list.
