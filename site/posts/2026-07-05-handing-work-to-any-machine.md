---
title: "July 5 - handing a job to whichever machine should run it, then walking away"
date: 2026-07-05
topics: ["Homelab", "Automation", "Distributed systems", "SSH", "Orchestration", "Self-hosting"]
summary: "I stopped doing my machines' work at the keyboard and built a way to hand a task to whichever machine should run it, let it run on its own, and pick up the result later."
---

The thing that clicked today: I stopped doing my machines' work at the keyboard and built a way to hand a task to whichever machine should run it, let it run on its own, and pick up the result later.

## Built / shipped

A relay for delegating work across the fleet. I can write a scoped request, send it to the machine best suited to run it (the GPU box for heavy compute, a spare box for a long job, a small local model for cheap checks), and have it run detached while I do something else. When it finishes it writes its own result back, and that syncs to me automatically.

Two kinds of job, on purpose. A read-only job can look at things and report but not change them; a build job is allowed to make changes. Keeping those separate means I can fire off an investigation without worrying it will touch anything.

It survives me closing the laptop. Jobs run detached on the target machine, not on my screen, so I can start a long one, walk away, and check on it later from my phone.

## Problems & fixes

Every job carries a unique token. Early on it was too easy to fire a job against a stale request, or to read yesterday's answer by mistake. So every request carries a fresh token, and I confirm the answer's token matches before I act on it. That one rule killed a whole class of "acted on the wrong result" bugs.

Read before write. A job that changes shared files has to read the current state first and only add its own part, never blindly overwrite. Several near-misses turned that from a habit into a hard rule.

## Decisions

Status is a hint, not the truth. A job reporting "done" is not proof it worked. I verify through the actual result: the file it wrote, the service it changed, the token matching. I trust ground truth, not the status line.

One job per machine at a time. Jobs run serially on any single machine and in parallel across different machines, so two never fight over the same box.

## Learned

Delegating real work needs guardrails, not just a way to launch it. The launch was the easy part. The value came from the token discipline, the read-before-write rule, and verifying against ground truth. Without those, automation just fails faster.

The safest job is the one that cannot change anything. Making "look but do not touch" a first-class mode let me investigate freely and reserve the riskier mode for when I really meant it.

## Still open / next

The obvious next step was cost: some of these jobs do not need an expensive model at all, which pushed me toward running smaller models locally for the routine work.
