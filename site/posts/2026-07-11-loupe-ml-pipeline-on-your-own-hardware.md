---
title: "July 11 - Loupe's machine-learning pipeline runs entirely on your own hardware"
date: 2026-07-11
topics: ["Loupe", "Machine learning", "Computer vision", "GPU", "Self-hosting", "Semantic search"]
summary: "For an app that looks at your private photos, the machine learning cannot phone home, so every model in Loupe runs on your own machine, on a single consumer graphics card."
---

The thing that clicked today: for an app that looks at your private photos, the machine learning cannot phone home, so every model in Loupe runs on your own machine, on a single consumer graphics card.

## Built / shipped

Every signal computed locally. Loupe needs to understand a photo library to help cull it: who is in a photo, how good it is, what it contains, and what it is of. I built each of those as a stage that runs entirely on the user's own hardware, with no cloud service and no paid API anywhere in the product. For private photos, that is not a nice-to-have, it is the point.

Face recognition that snowballs. The pipeline detects faces, turns each one into a numerical signature, and groups similar faces together. The user confirms one person once, and the app snowballs that identity across the whole library, turning tens of thousands of frames into a browsable "people" view.

Search your photos by describing them. Every image is turned into a vector that captures what it depicts, so you can search "dog on the couch" or "beach at sunset" and get matches with no tags and no folders. It is the same idea as searching notes by meaning, pointed at pictures.

A quality score anyone can run. The score that ordered photos used to come from an external source that only worked on my setup. I replaced it by training a small model on top of the image vectors to predict that score locally, so it works for any user on their own hardware.

## Problems & fixes

Built to run on modest hardware. Loupe is for self-hosters, whose machines range from a big card to a small one, so I built the pipeline to run lean either way: compact models, batched inference, and a CPU fallback for anything that does not fit a smaller GPU. My own dev machine is a 16 GB card, but nothing in the pipeline assumes that.

Keeping stages from colliding. The different models have different, sometimes conflicting software needs, so I isolated the face pipeline in its own environment to keep its dependencies from fighting the rest. Boring, but it is what keeps the whole thing runnable.

## Decisions

Local only, on purpose. No cloud model, ever, in the product. It costs some accuracy and some engineering effort, but it means a user's photos never leave their house, which is the whole promise.

Reuse the vectors. The same image vectors power both search and the local quality score. Computing them once and using them twice is cheaper and simpler than a separate model for each job.

## Learned

Privacy is an architecture, not a policy. Saying "we do not upload your photos" is easy; building so there is no upload path at all is the honest version, and it shapes every model choice.

The vector is the workhorse. Turning an image into a vector that captures its meaning is the single most reusable thing in the pipeline: it drives search, it feeds the quality score, and it would feed more if I asked it to.

## Still open / next

The pipeline runs comfortably on my own hardware now. The natural next step is the one my studies point at: taking these same patterns and standing them up at cloud scale, with the reliability and automation to match.
