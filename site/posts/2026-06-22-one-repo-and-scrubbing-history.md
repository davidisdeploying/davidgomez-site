---
title: "June 22: folding two repos into one, then scrubbing my git history clean before the first push"
date: 2026-06-22
topics: ["Git", "git filter-repo", "Repo consolidation", "Python", "Environment configuration", "Data privacy", "Security", "AI agents", "Backups"]
summary: "I merged Loupe's pipeline repo into the app repo as a subtree, untangled a code-vs-data path coupling that would have quietly broken everything, and then (right before the first push to a private GitHub repo) ran a full-history audit that came back dirty. It found a home address, GPS coordinates, and a dump of my home network's internal layout buried in old commits. The rest of the day was rewriting history to purge all of it, normalizing my commit identity, and collapsing everything to a single clean branch."
---

Loupe has lived as two sibling git repos on my machine: the app, and the pipeline that feeds it (ingest, thumbnails, the candidate rules). Today's goal was to get it ready for its first real push to a private GitHub repo, which meant first making it *one* repo, and then making sure nothing in its history would embarrass me the moment it left my box. Both halves turned out to be more interesting than I expected.

## Built / shipped

**Two repos became one.** I folded the pipeline into the app repo as a subtree under a `pipeline/` directory, keeping its commit history rather than flattening it. Only the *source* moved. The actual data (the metadata database, the thumbnail cache, exports) stays where it was. That distinction sounds trivial and was the source of every hard problem below.

**A clean split between code and data.** The old setup leaned on a single variable that meant *both* "where the pipeline code lives" and "where the pipeline data lives," because historically those were the same folder. Once the code moved and the data didn't, that conflation had to be broken into two explicit ideas (one path for code, one for data) threaded through the few places that import pipeline modules or launch the ingest process.

**The repo is now genuinely publish-ready.** By end of day: a single branch, a clean working tree, history audited and scrubbed, commit identity normalized, and a verified backup sitting beside it. I didn't do the push myself (that's mine to do by hand from an authenticated machine) but everything up to it is done.

## Problems & fixes

**The coupling that would have silently broken everything.** The two pipeline modules the app imports figure out where their data lives by looking at their *own folder* on disk. That worked only because they used to sit *in* the data folder. Move the code to a new home and leave the data behind, and they'd cheerfully start looking for the database next to the code (where there's nothing) and the whole Candidates view plus thumbnail generation would quietly read from the wrong place.

The obvious fix (set a global "data lives here" variable) was a trap. That same variable also decides where the *app's own* databases live, so setting it globally would have relocated everything, including stores that were exactly where they belonged. The fix that actually works is surgical: pin the data location only for the moment those two modules get imported, then immediately put the environment back the way it was. Everything else stays correct, and the imported code resolves to the right place. I only trust this because I exercised it for real afterward: restarted the app, watched it load the right number of candidates from the right database, and confirmed the app's own stores hadn't moved.

**The bundled tool that stayed behind.** The ingest step shells out to a metadata-extraction binary that ships *with the data*, not the code. And it found that binary by looking next to itself. Same disease as above. The fix was to make ingest resolve that tool from the data location it's already pointed at, with the old behavior kept as a last-resort fallback so a co-located setup can't regress.

**Then the audit came back dirty.** Before pushing, I ran a full-history secret scan: not just the current files, but every commit, because once a repo has a remote, history is what's exposed, and public makes it permanent. It found three things I really did not want on GitHub:

- A **home address and GPS coordinates** sitting in an early version of a pipeline script. I'd removed them from the current code weeks ago. But "removed in a later commit" is not "gone." The original values were still right there in the commit that introduced them.
- An old **log file that had captured my home network's internal layout**: effectively a map of which internal service sits where. It had been committed once, then gitignored, but the commit that added it lived on in history.
- A stray internal IP in a code comment.

**The fix nobody likes: rewriting history.** You cannot remove a secret from git with a normal "delete it" commit: the original still sits in the commit that introduced it, and a history scan will keep finding it forever. The only real fix is to rewrite history so the offending content never existed in any commit. So that's what I did: strip the stray log/cache files out of every commit, and replace the personal strings with redactions across the entire history. Then I re-ran the exact same scan and watched every count go to zero.

I also took the chance to normalize my **commit author identity** (older commits carried a couple of different email addresses) down to a single consistent one across the whole history, and collapsed the branches down to one clean main line.

Every one of these rewrites is irreversible, so every one got the same discipline: a full backup bundle of the entire repo first, verified complete, *then* the rewrite, *then* a re-scan to prove it worked. When the clean repo was finally confirmed live, I deleted the one backup that still contained the address, keeping a newer, already-scrubbed backup as the rollback. That deletion itself was gated: I refused to remove the safety net until the push was actually confirmed.

## The part that's genuinely new to write about: working through the guardrails

I'm doing this work with an AI coding agent, and the irreversible history rewrites kept getting *blocked*: not by a bug, by a safety guardrail that refuses to run a destructive, unrecoverable history rewrite unless a human explicitly and specifically authorizes it in the moment. A generic "you have my permission" wasn't enough; a standing allow-rule wasn't enough; it wanted a direct, current, specific yes for that exact action, every time. It even refused to let the agent grant *itself* the permission.

Honestly? Correct call. The thing it was guarding was "permanently rewrite all of my git history," and the right number of accidental ways to trigger that is zero. The friction was real, but the friction is the feature. The workflow that emerged was: the agent stages everything (the exact patterns to scrub, a one-shot script, a verified backup) and then stops and hands me a single, reviewable action to run myself. I got to read exactly what was about to happen before it happened. That's a good shape for irreversible work, human or machine.

## Decisions

- **Consolidate via subtree, not a flat copy**: keep the pipeline's history instead of throwing it away.
- **Source moves, data stays put**: the pipeline code now lives in the app repo; the databases and caches stay where they are.
- **Pin the data location per-import, never globally**, because the global knob is overloaded and would have moved the app's own stores too.
- **Rewrite history to purge the PII** rather than forward-deleting it: the only approach that actually makes a history scan come back clean.
- **Back up, then rewrite, then re-scan**: every irreversible step gated on a verified bundle and a clean re-scan, and the final backup deletion gated on a confirmed push.

## Learned

- **You can't delete a secret from git with a normal commit.** The value survives in the commit that introduced it; a history scan keeps finding it. Rewriting history is the only real fix. And it's *cheap and reversible while the repo is still local*, and effectively impossible once anyone has a copy. Audit before the first push, not after.
- **"Removed in a later commit" is not "gone."** Old commits are forever until you rewrite them. The home address I'd scrubbed from the working tree weeks ago was still sitting in history the whole time.
- **Watch for one variable that means two things.** A single path that quietly meant both "code" and "data" was fine right up until those two things lived in different places: then it became a landmine. When you split them, split the *concept*, don't just point the one knob somewhere new.
- **Friction on irreversible actions is a feature.** Being forced to stage, review, and explicitly approve each unrecoverable step caught nothing wrong this time. But the cost of it catching something is enormous, and the cost of the friction is small.

## Still open / next

- The push itself, and confirming the live repo is private: done by hand from an authenticated machine.
- My running notes file is getting close to the size where I compact it; that's the next bit of housekeeping.
