---
title: "July 10 - how Loupe decides what to keep: labels nominate, scores order, people protect"
date: 2026-07-10
topics: ["Loupe", "Machine learning", "Product design", "Computer vision", "Self-hosting", "Python"]
summary: "Culling a hundred-thousand-photo library should never come down to one mysterious score, so I split the decision into three plain roles that each answer a different question."
---

The thing that clicked today: culling a hundred-thousand-photo library should never come down to one mysterious score, so I split the decision into three plain roles that each answer a different question.

## Built / shipped

Three roles, not one black box. Loupe, my self-hosted photo-culling app, has to help decide what to keep out of a library with over a hundred thousand photos and videos. Instead of ranking everything by a single opaque number, I split the judgment into three legible roles:
- Labels nominate. What a photo actually contains (a receipt, a screenshot, a document, a blurry near-duplicate) is what routes it into or out of the cut-candidate pile. The bulk cuts start from what something is.
- Scores order. A quality score only ranks photos within a group so the best rise to the top. It never nominates a cut on its own, because a low-scoring photo can be a precious candid.
- People protect. Photos with a recognized face (family, the dogs) are shielded from bulk cuts, so someone I love is never quietly removed.

Explainable by design. Because routing, ranking, and safety are separate, I can always answer "why is this a cut candidate," which I could never do with one blended score.

Nothing is ever deleted for me. Every cut is a candidate the human confirms. The engine nominates and orders; it never destroys on its own.

## Problems & fixes

A single score hides its own mistakes. My first instinct was one aesthetic score to rank everything, but a bad photo of an important moment and a beautiful photo of a parking receipt would sort exactly wrong. Splitting "what is it" from "how good is it" fixed that: the receipt gets nominated by its label no matter how pretty it is, and the candid survives no matter how low it scores.

Protecting people has to come before cutting. Early on, a bulk cut could sweep up a low-scoring photo that happened to have my family in it. Making recognized people an explicit shield, evaluated before any bulk cut, closed that.

## Decisions

Legible over clever. Three simple roles a person can reason about beat one sophisticated model nobody can question. For something that deletes your memories, being able to explain a decision matters more than squeezing out a little more accuracy.

Same grammar for video. The three roles carry over from photos to video unchanged, so the whole library is culled by one consistent, explainable rule.

## Learned

The hard part of culling is not ranking, it is trust. People will not let software touch their photos unless they understand why it is suggesting a cut. The three-role split exists to earn that trust, not to win a benchmark.

Safety belongs in the design, not bolted on. Making "people protect" a first-class role, rather than a filter applied after the fact, is what makes the whole thing safe to actually use.

## Still open / next

The scores that order photos came from an external source I did not control, which meant the whole thing only worked for me. Making that scoring run locally, for anyone, on their own hardware, is the pipeline I built next.
