---
title: "Two seats, one bike"
date: 2026-06-21
topics: ["Tandem", "Claude", "Workflow"]
summary: "I pulled the two-seat workflow I use to build Loupe out into an open-source kit. The idea, and why it's a context-scaler, not a token-saver."
---
I spend most of my free hours building **[Loupe](https://loupeculling.com)**: a self-hosted app for culling my photo library. But the thing I actually shipped today wasn't a Loupe feature. It was the *way* I build Loupe.

## Two seats

Working on Loupe with Claude, I kept hitting the same wall: one chat window trying to be both the architect and the bricklayer. It would design something thoughtful, then burn its context window grinding through the actual edits, and by the time the work was done it had half-forgotten why it started.

So I split the work across two seats:

- **The Captain**: a strategy seat that holds the plan, makes the calls, and writes precise prompts.
- **The Stoker**: an engineering seat (Claude Code, on my Mac mini) that does the shell work, the edits, the deploys.

They don't share a chat. They pass work back and forth through a synced folder: four one-way "lanes," each carrying a prompt or a report, every message stamped with a token so a stale reply never gets mistaken for a fresh one.

```bash
# the Captain writes a build prompt to a lane; the Stoker pulls and runs it
/pull-build
```

## Not a token-saver

The honest part, and the part I made sure the README says out loud: this does **not** save tokens. Moving work through a vault costs about what pasting it would. What it buys you is *context hygiene*. Each seat only ever holds what it needs: the plan doesn't get buried under build logs, and the engineering seat never has to re-derive the architecture from scratch.

> It's not a sprint you win on efficiency. It's a marathon you finish because neither seat ever runs out of room to think.

## Why I open-sourced it

I'd built all the scaffolding for myself: skills, pull commands, a compaction routine that keeps the project's decision log from bloating over time. Once it was working, generalizing it was mostly a matter of renaming my project's specifics into placeholders. So I did it, called it **Tandem** (two seats, one bike), drew it a little line-art logo, and pushed it.

It's on [GitHub](https://github.com/davidisdeploying/tandem) under MIT. If you work with Claude on anything that outlives a single session, it might save you the wall I kept hitting.

---

*First post. This blog is fed by the build notes I keep every day, so expect more of these: shorter, about whatever I happened to learn.*
