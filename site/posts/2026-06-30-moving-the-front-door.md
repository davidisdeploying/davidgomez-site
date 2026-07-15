---
title: "June 30 - moving the front door off the busy machine so a reboot cannot take the site down"
date: 2026-06-30
topics: ["Homelab", "Self-hosting", "Networking", "Cloudflare", "Tailscale", "Reliability", "Raspberry Pi"]
summary: "Moved the public tunnel entrance off the busy compute box onto its own dedicated Raspberry Pi with its own uplink, so a reboot of any other machine can no longer take the whole public site down."
---

The thing that clicked today: the public entrance to my homelab was riding on the one machine I reboot the most, so every time I touched that box, everything I host went dark. Today I moved the front door to a machine of its own.

## Built / shipped

A dedicated machine just for the tunnel. Everything I serve to the public goes out through a single encrypted tunnel. That tunnel used to run on a busy compute box, so a reboot of that box dropped my whole public surface at once: the site, the tools, the shared views. I moved the tunnel onto a small Raspberry Pi whose only job is to be that entrance.

Its own way out. I gave that Pi its own path to the internet instead of borrowing another machine's, so it no longer depends on anything else staying up to reach the outside world.

Stable addresses everywhere. I repointed every service the tunnel serves to fixed private addresses on my mesh network, instead of ones that could change when the home network reshuffles. That was the same class of thing that had knocked routes offline before.

## Problems & fixes

The dependency was hidden until it bit. The setup worked fine right up until I rebooted for an unrelated reason and watched everything public go down with it. The fix was structural, not a patch: give the entrance its own machine and its own uplink so nothing else can take it down.

A backup entrance. Rather than fully retire the old path, I kept it as a standby, so there are two ways in if the primary has a bad day.

## Decisions

The thing everyone reaches should be boring and single-purpose. A front door should do one job and be the most stable box in the house, not share space with whatever I am actively hacking on.

Isolate, do not merge. I kept the storage network walled off instead of bridging it to solve this, because the isolation is worth more than the convenience.

## Learned

A single reboot is a great test of what is secretly coupled to what. The outage told me exactly which pieces were leaning on that one machine, and the list was longer than I expected.

## Still open / next

With the front door stable, the next annoyance was the machines themselves: I still reached each one a little differently. Making them all reachable the same way, without passwords, is the thread I pulled next.
