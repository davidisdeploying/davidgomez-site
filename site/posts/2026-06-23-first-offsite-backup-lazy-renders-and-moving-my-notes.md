---
title: "June 23 - Loupe's first offsite backup, lazy render lookups, and getting my notes out of iCloud's way"
date: 2026-06-23
topics: ["Git", "Backups", "Image processing", "Web UI", "Python", "iCloud"]
summary: "The whole project finally lives somewhere other than my one machine: I pushed a private backup of the repo. Then a small but careful change to how the app resolves edited renders so it stops statting thousands of network files on every restart, plus a power-outage readiness check and a move of my project notes vault out of the folders iCloud sweeps."
---

The thing that clicked today: three of the four threads today were the kind of thing you only notice when it's missing, an offsite backup, a startup that doesn't grind, and a notes setup that isn't quietly corrupting itself. None of it changes what Loupe does on screen, but it's the plumbing everything else depends on.

## Built / shipped

An offsite backup that exists at all. Until today the entire Loupe codebase lived in exactly one place: my machine. If the disk died, the project died with it. So I pushed a private backup of the repo. It's private first on purpose, a public release is still gated behind hardening the write endpoints and doing a proper disclosure pass, but the point of this step was just to stop being one bad drive away from zero. The whole thing now exists somewhere else.

Render lookups got lazy, in the good way. The app keeps a table of "edited" versions of photos, the rendered, retouched copies, and a lot of those files live on a slow, network-backed store. On startup the app used to walk that whole table and check each file existed on disk, which means thousands of slow network stat calls every single time the server restarts. I dropped that boot-time sweep entirely and moved the existence check to serve time, inside the one function that resolves which file to hand back. Now it only checks the disk when a render is actually requested, and if a registered render file is missing it quietly falls back to the original instead of erroring. It mirrors how the originals already resolve, lazily, on demand. Committed but not deployed yet; I wanted it to land before the first big restart that loads all those render rows.

Notes vault moved out of iCloud's way. I want to turn on iCloud syncing for my Desktop and Documents folders, but my project knowledge vault, the durable log of decisions and gotchas I keep for Loupe, was sitting inside Documents, where iCloud and my own sync tool would fight over the same files. So I moved the vault to a top-level folder that iCloud doesn't touch, rebuilt the cross-machine sync from scratch, and treated the parent folder as a single sync unit so future projects just appear everywhere without new setup.

A power-outage readiness check. Read-only audit to confirm the box comes back on its own after a power cut and stays reachable remotely. Verdict: green.

## Problems & fixes

Credentials for the second repo. Getting the backup repo authenticated took two tries, the first push didn't take the credentials cleanly, the second went through. The lasting lesson was the credential storage: it only captures your token if you set it up before the authenticating operation. A push that prompts you for the token, with no storage configured at that moment, saves nothing, so the very next command asks again. Configure the helper first, then do one authenticating op to seed it.

Dropping the boot sweep broke an assumption. That old startup walk had a side effect: it pre-filtered the render table down to only files that exist, so the serve path could safely assume every entry was real. Kill the sweep and that assumption is suddenly false, a missing file would 404 or throw at the actual open sites. The fix was the single fallback at the one resolution chokepoint, so I didn't have to touch each open site individually.

The migration script that assumed too much. My first sketch of the vault move ended in a delete of the old directory, on the premise that the vault folder was the only thing in there. A real listing said otherwise, the directory also held close to 900 files of other stuff I'd half-forgotten. I parked all of it somewhere reversible instead of deleting, and I'm glad I inventoried before trusting the destructive tail.

## Decisions

- Backup goes up private first; public is a separate, later step behind endpoint hardening and a disclosure pass.
- Render existence is checked at serve time, not boot, stat only on a hit, only when something's actually served.
- The vault lives outside any folder iCloud sweeps, as one sync unit at the parent rather than one per project.

## Learned

A clean working tree is not a clean history. History keeps everything you've ever committed, so a forward "delete it" edit doesn't remove the original, scan full history before the first push, and do any rewrite while the only copy is still local and trivial to redo.

`systemctl is-enabled ssh` reading `disabled` does not mean SSH won't survive a reboot. On Ubuntu it's socket-activated, the service is off but the socket spawns it on the first connection. Check the socket unit, not just the service.

Moving a notes vault breaks a couple dozen hardcoded path references scattered through tooling outside the vault. Grep everything for the old path before you call the move done.

## Still open / next

Restart the app to actually activate the lazy-render change. Public release: endpoint hardening plus a disclosure pass, on my own timeline. A now-stale code comment to fix and a logbook compaction that's overdue. And I cleaned up an old local backup that predated my history scrub, keeping only the clean copy.
