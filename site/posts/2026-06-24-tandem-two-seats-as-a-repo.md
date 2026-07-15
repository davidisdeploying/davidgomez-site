---
title: "June 24 - Tandem: turning my two-seat Claude habit into a repo anyone can clone"
date: 2026-06-24
topics: ["Tandem", "Open source", "Workflow", "Claude", "Claude Code", "Two-seat workflow"]
summary: "I already wrote up the idea of running two Claudes in tandem, one to think and one to build. This is the project cut: what Tandem actually is as a toolkit, why I bothered packaging a personal habit into an MIT repo, how the pieces fit, and what's still rough."
---

The thing that clicked today: I'd built all the scaffolding for myself already, so turning it into something anyone could clone was mostly a matter of renaming my project's specifics into placeholders. I wrote earlier about the idea of running two Claudes against one project, one seat thinking and one seat building. This post is the other half of that: the toolkit I pulled out of the habit, cleaned up, and put on GitHub as Tandem under an MIT license. Less "here's a nice way to work" and more "here's the thing you can clone."

## Built / shipped

Tandem splits the work between two named seats. The Captain steers, designs, and decides; the Stoker builds. The metaphor I kept coming back to is a tandem bicycle, two seats and one bike, where the person in front calls the line and the person in back just drives the cranks. The Captain is a Claude project set up for strategy. The Stoker is a coding agent that executes. They never talk directly. Everything passes through a shared vault folder that both seats can see, and that folder has a deliberate shape.

The core is the vault template: a set of one-way lanes between the two seats. The Captain drops work into an outbound lane; the Stoker pulls it, does it, and writes results back into a return lane. Around that, the repo ships the practical glue: slash commands for the building seat to pull and run queued work, a couple of shell scripts (one to recall past decisions by keyword, one to block and wait for the next handoff), skills that force terse, structured reports instead of rambly ones, and a `PROJECT-INSTRUCTIONS.md` you paste into the Captain seat. Clone it, sync the vault between your two seats, wire up the connection, and run a pull command.

## Problems & fixes

The honest reason I packaged this: the workflow kept earning its keep on long projects and I was tired of rebuilding the scaffolding by hand each time I started a new one. Pulling it out into a standalone, generalized repo means I never have to reconstruct it from memory again, and neither does anyone else who wants the same thing.

## Decisions

There are two flavors of work, kept separate on purpose: build prompts that change things, and recon prompts that are strictly read-only investigation. Alongside the lanes sit a small append-only decisions log, a learnings log, and per-arc session notes with owned sections, so the durable record of a project doesn't live in either chat's scrollback.

## Learned

I also wanted to be honest about what Tandem doesn't do. It is not a token-saver. It's a context-scaler. You pay a small overhead per handoff in exchange for context that grows slower, so the strategy seat never gets buried under noisy shell output and the building seat never has to hold the whole design discussion in its head. That trade wins on long, multi-stage builds and loses on quick one-offs. I'd rather say that up front than oversell it.

## Still open / next

It's early. The setup is still more manual than I'd like, the docs assume you already roughly know how I work, and the "right" granularity for a handoff is something you learn by feel rather than something the repo teaches you. I want to smooth the first-run experience and write down more of the tacit rules. If you try it and it breaks, that's genuinely useful to me. The repo is the canonical home; this site is where I'll keep narrating what changes.
