---
title: "July 13 - putting my notes under version control without breaking the sync that copies them everywhere"
date: 2026-07-13
topics: ["Homelab", "Self-hosting", "Git", "Reliability", "Automation", "Linux"]
summary: "My entire knowledge base had no undo, and adding one turned out to be a real distributed-systems puzzle because the same files live on four machines at once."
---

The thing that clicked today: my entire knowledge base had no undo, and adding one turned out to be a real distributed-systems puzzle because the same files live on four machines at once.

## Built / shipped

Gave my notes real history. My whole knowledge base, thousands of files, had no version control. The tool that syncs it between machines keeps no meaningful history, so one bad edit or merge was simply unrecoverable. I put the tree under git so I finally have history and rollback.

Put git on exactly one machine. The notes are synced across four machines that all write to them. If git's own internal files were allowed to sync, they would corrupt across copies the same way any file does when two machines edit it at once. So git lives on a single always-on machine and nowhere else.

Handled big files separately. Rather than just excluding documents and videos, I tracked them with a large-file extension so history and diffs stay clean for everything else.

Made commits automatic and gentle. A nightly job commits changes in the quiet hours, batched once a day rather than on every write, to be kind to the machine's storage.

## Problems & fixes

The order of operations was the whole game. The dangerous moment is letting git's internal folder exist before the sync tool is told to ignore it. I wrote the ignore rule, reloaded the sync service, and verified through its own status that the folder was excluded, all before running git for the first time. That ordering is the real safeguard against git replicating itself across the other machines.

The first run aborted cleanly. The machine was missing the large-file tool, and the build stopped at the pre-check instead of half-finishing, leaving nothing behind. I installed the tool and re-ran.

## Decisions

One owner, not a lockfile. Making a single machine the sole git owner is simpler and safer than coordinating commits from several machines. The sync tool's own file-versioning stays as the multi-writer backstop; git is purely the single-owner history layer on top.

Batch nightly. Committing once a night in the low-write window respects the machine's storage and avoids fighting the sync.

## Learned

Version control on top of a multi-writer synced folder is a real hazard, not a formality. The thing you are versioning is being edited from several places at once, so the tool that gives you history has to be kept strictly on one side of that.

## Still open / next

A few stray conflict files from before this work got swept into the first snapshot and still need cleaning out, and the first fully unattended nightly commit needs a spot-check.
