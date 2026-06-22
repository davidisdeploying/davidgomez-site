---
name: blog-draft
description: Turn a day's vault logbook into a COMPREHENSIVE devblog DRAFT — the full record of what was built, decided, fought, learned, and shipped that day, not one curated story. Read-only on the vault; writes only to drafts/. Never commits, pushes, or publishes.
---

# blog-draft (comprehensive daily log)

Turns a day's build log into a thorough draft — a build-in-public daily record, not a single
story. The goal is COVERAGE: everything the day's sources contain that a reader could learn from
or find interesting — what got built and shipped, the decisions and why, the problems hit and how
they were solved, the durable learnings, and what's still open. The vault is **read-only**. The
only thing this skill writes is a draft under `<site-repo>/drafts/`. It never commits, never
pushes, never touches `site/posts/`. Publishing is a separate, human-gated step.

## Inputs
- A single date `YYYY-MM-DD`, or a range (for backfill).
- ALL session notes for the date: `~/loupe/vault/Loupe/sessions/<date>-*.md` (there may be several
  for one day — read every one).
- That day's new entries in `~/loupe/vault/Loupe/DECISIONS.md` and `LEARNINGS.md` (under that
  date's `## ` header, or clearly from that day).

## What "comprehensive" means
Cover every distinct thread the day touched — do not pick one. A full day is usually several
hundred words and several topics. Be comprehensive about the WORK, the LEARNING, and the
EXPERIENCE (including dead ends and frustration) — NOT about infrastructure internals. The
source's "Files & scripts touched" and "Gates / irreversibility" sections are the highest-risk:
summarize them at altitude (what kind of change, what was verified) and never reproduce exact
paths, commands, IPs, hostnames, or security mechanics. See `claude/REDACTION-CHECKLIST.md`.

## Steps
1. **Read** every session note for the date plus that day's DECISIONS/LEARNINGS delta. Build the
   full picture before writing.
2. **Draft** in David's voice: first person, plain, specific, honest about what broke and how it
   felt. Keep coverage readable by grouping the day into the sections that actually have content:
   - **Built / shipped** — what changed and went out.
   - **Problems & fixes** — what fought back and how it was solved (usually the best part for
     readers; keep the debugging narrative, drop the literal paths/commands).
   - **Decisions** — the calls made and the reasoning, especially tradeoffs.
   - **Learned** — durable takeaways a stranger could reuse.
   - **Still open / next** — lightly, what the next session picks up.
   Use headings and lists where they earn their place; prose elsewhere. Omit empty sections.
3. **Title** — real and specific; a date plus the day's throughline is fine
   (e.g. "June 21 — shipping Tandem and a devblog that fought back"), never a bare "Daily log".
4. **Topics** — list EVERY distinct technology, tool, concept, or theme the day touched. These
   become the post's chips and feed the site-wide collected Topics index, so be thorough (a full
   day is usually 4–10) and use CONSISTENT names across days (always "Cloudflare Pages", never
   sometimes "CF Pages") so the index aggregates cleanly.
5. **Redact** — run every item in `claude/REDACTION-CHECKLIST.md`. Comprehensive coverage raises
   the redaction load; apply it harder, not softer. If a thread can't be told without something on
   the list, tell it at a safe altitude or note in the report that it was held back.
6. **Write** to `<site-repo>/drafts/<date>-<slug>.md` with this frontmatter (no `tags:` line —
   that is added at publish time):
```yaml
   ---
   title: "..."
   date: <date>
   topics: ["...", "..."]
   summary: "..."
   ---
```
7. **Report**: the draft path, the title, the topic list, a one-line readiness judgment, and a
   bullet list of every redaction made.

## Backfill
Given a range, repeat per date: one comprehensive post per day that has a session note. List any
days you skipped and why (e.g. no session note on disk). Scope is the vault's lifetime, not before.

## Hard rules
- Never write outside `drafts/`. Never `git add`/commit/push. Never move anything into
  `site/posts/`. The vault is read-only. Publishing is the operator's call, not yours.
- Comprehensive about work and learning; disciplined about infrastructure, security,
  employer/customer detail, and anything on the redaction checklist.
