---
title: "July 8 - searching my notes by meaning, not by keyword"
date: 2026-07-08
topics: ["Homelab", "Search", "Semantic search", "RAG", "Knowledge base", "Self-hosting"]
summary: "I taught my notes to answer questions by meaning, so I can ask what I decided about X and why and land on the right note even without remembering a single word from it."
---

The thing that clicked today: I taught my notes to answer questions by meaning, so I can ask "what did I decide about X and why" and land on the right note even when I do not remember a single word from it.

## Built / shipped

Semantic search over everything I have written. Keyword search only finds the words you already remember. I wanted to search by meaning, so I turned every note into a list of numbers (a vector) that captures what it is about, using an open-weight model running on my own hardware. At query time I turn the question into a vector the same way and find the notes whose vectors are closest. Ask a fuzzy question, get the right note.

Whole notes, no chopping them up. I picked a model with a long enough context window to embed each note whole, so I did not need to split notes into fragments first. That keeps each note's meaning intact and the whole design simpler.

Ask from anywhere, in plain language. I connected the search to the AI assistant I already use, so from my phone I can ask my own knowledge base a question in plain English and get an answer grounded in my actual notes, not a guess.

## Problems & fixes

A few notes are too long even for a whole-note model. My biggest running logs exceed the model's context window and get truncated when embedded. I accepted that, because the real content lives in the individual session notes, which fit whole, and the oversized logs are just thin indexes into them.

Search that fails silently. This is the trap with this kind of search: if the index and the query use even slightly different settings, the vectors stop lining up and the results quietly get worse, with no error to tell you. The fix was discipline: the exact same model and the exact same processing on both sides, pinned so they can never drift apart.

## Decisions

Embed whole, do not chunk. Choosing a long-context model to avoid splitting notes was worth it, because a fragment loses the context that makes a note meaningful.

Two lenses, not one. This meaning-based search and the nightly-built organized reference are two different ways into the same notes: one to find the right note by a fuzzy memory, one to read a clean overview of a topic. I kept both rather than making one replace the other, because they answer different questions.

## Learned

Retrieval breaks quietly, which makes it dangerous. A wrong setting here does not crash, it just returns slightly worse answers, which is the kind of bug you do not notice until it has misled you. Pinning both ends to the same model and recipe is not optional.

Meaning-search changes what you write down. Once I could find notes by a fuzzy memory instead of exact words, I stopped trying to file everything perfectly and just wrote, because retrieval by meaning forgives disorganization.

## Still open / next

My whole knowledge base is now something I can question from my phone in plain language. The next want is to take these same patterns, embeddings, retrieval, and grounding, and build them at cloud scale, which is exactly where I am pointing my studies next.
