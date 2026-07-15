---
title: "July 6 - running my own models so the routine work costs nothing"
date: 2026-07-06
topics: ["Homelab", "GPU", "Local models", "Cost", "Automation", "Self-hosting"]
summary: "A lot of the small jobs I was paying a hosted model to do did not need a frontier model at all, so I started running open-weight models on my own GPU box and let the routine work run for free."
---

The thing that clicked today: a lot of the small jobs I was paying a hosted model to do did not need a frontier model at all, so I started running open-weight models on my own GPU box and let the routine work run for free.

## Built / shipped

A local model stack on my own hardware. I run open-weight models on the GPU box at home for the everyday work: quick read-only checks, scanning text for issues, and turning my notes into the vectors that power search. None of it bills per token, because it never leaves my hardware.

Frontier models only where they earn it. I reserve the paid, hosted models for the few tasks that genuinely need the best reasoning and route everything routine to the local ones. The volume work is effectively free and the paid spend is small and deliberate.

A trimmed, purpose-built set. Rather than hoard every model I tried, I keep a small production set: one for code and text checks, one for the embeddings that feed search, one for reading images. Everything else got removed.

## Problems & fixes

The models were filling up the boot drive. Model files are large, and by default they landed on the machine's small system drive. I moved the whole store onto the big data drive and pointed the service at the new location, then proved the move was intact by checking counts and sizes matched before deleting the originals, without having to load anything onto the GPU to test it.

Making the local model reachable. The model server started out listening only to itself, so other machines could not reach it. Opening it to my private network, and only my private network, let the rest of the fleet borrow it.

## Decisions

Match the model to the job. Cheap, fast, local for the routine; expensive and hosted only for real judgment. Treating those as two rails keeps both quality and cost where I want them.

Own the store's location. Putting the model files on the data drive on purpose, not wherever the tool defaulted, is the difference between a tidy machine and a full boot drive three weeks later.

## Learned

Most automation does not need a frontier model. Once I looked honestly at what each job required, the majority were fine on a small local model, and paying for the best on all of them had just been a habit.

Verify a data move by parity, not by faith. Counts and byte sizes matching on both sides proved the store copied cleanly, a cheaper and surer test than loading a model to see if it works.

## Still open / next

With local models handling the routine and the fleet able to run jobs anywhere, the next thing worth automating was the knowledge base itself.
