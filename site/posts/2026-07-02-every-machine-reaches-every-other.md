---
title: "July 2 - every machine can now reach every other, with no passwords and no key juggling"
date: 2026-07-02
topics: ["Homelab", "Self-hosting", "Tailscale", "SSH", "Networking", "Automation", "Linux"]
summary: "Turned the fleet into a full mesh where every machine can reach every other one directly, passwordless, without hand-managed keys, laying the groundwork for running work anywhere in the fleet."
---

The thing that clicked today: I stopped treating my machines as separate boxes I log into one at a time, and turned them into a mesh where any of them can reach any other the same way, without a password prompt or a pile of keys to manage.

## Built / shipped

A full mesh, every pair. I set up encrypted connections so every machine in the fleet can reach every other one directly, both directions, over my private network. No machine is an island anymore.

Passwordless, without key sprawl. Instead of scattering login keys across boxes and hoping I keep them straight, access rides on the mesh's own identity layer, so a machine proves who it is without me managing a drawer full of keys.

The groundwork for running work anywhere. Once every box can reach every box cleanly, I can stage a task, send it to whichever machine should do it, and have it run on its own and report back. This mesh is what makes that possible.

## Problems & fixes

The machine that could not talk to itself. One node kept failing to connect in a way that looked like a permissions problem but was really a quirk of how it referred to itself. Once I saw it was a self-reference issue and not a real access denial, the fix was small.

Two kinds of login trail. Connections over the mesh and older-style connections leave separate records, so "who logged in when" is not a single list. Knowing that up front saved me from chasing a ghost later.

## Decisions

Identity over key sprawl. Leaning on the mesh's built-in identity instead of hand-managed keys is fewer moving parts and one less thing to leak or lose.

Same door on every machine. Reaching each box the exact same way is worth more than any per-machine cleverness, because it makes everything built on top simpler.

## Learned

"Remote-safe" is about where your hands are, not where you are. A command is only as safe as the machine you are actually touching, no matter how you got there. That reframing changed how I think about running things across the fleet.

## Still open / next

Now that the machines are one reachable mesh, checking their health one at a time felt silly. The next step was pulling all of them onto a single screen.
