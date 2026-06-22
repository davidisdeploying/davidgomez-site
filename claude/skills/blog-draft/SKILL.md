---
name: blog-draft
description: Turn a day's vault notes into a publishable devblog DRAFT. Read-only on the vault; writes only to drafts/. Never commits, pushes, or publishes.
---

# blog-draft

Turns the build log into a draft post. The vault is **read-only** here. The only thing this
skill writes is a draft file under `<site-repo>/drafts/`. It never commits, never pushes,
never touches `site/posts/`. Publishing is a separate, human-gated step.

## Inputs
- A single date `YYYY-MM-DD`, or a range (for backfill).
- Vault session notes: `~/loupe/vault/Loupe/sessions/<date>-*.md`.
- That day's new entries in `~/loupe/vault/Loupe/DECISIONS.md` and `LEARNINGS.md`
  (entries under that date's `##` header, or clearly from that day).

## Steps
1. **Read** the session note(s) for the date plus that day's DECISIONS/LEARNINGS delta.
2. **Find the one story.** A thing shipped, a hard bug, a real decision, or a failure and its
   lesson. If the day has nothing a stranger would find interesting, write **no draft** —
   report "no post" with a one-line reason. Filler is worse than silence.
3. **Draft** in David's voice: first person, plain, specific, honest about what broke. A real
   title (never "Daily log YYYY-MM-DD"), a 1–2 sentence summary, 2–4 topic tags, and a
   300–700 word body with a heading or two and a list or code block where it earns its place.
4. **Redact.** Run every item in `claude/REDACTION-CHECKLIST.md`. If the story can't be told
   without something on the list, say so in the report rather than publishing it anyway.
5. **Write** to `<site-repo>/drafts/<date>-<slug>.md` with this frontmatter (no `tags:` line —
   that is added at publish time):
   ```yaml
   ---
   title: "..."
   date: <date>
   topics: ["...", "..."]
   summary: "..."
   ---
   ```
6. **Report**: the draft path, the title, a one-line publish-readiness judgment, and a bullet
   list of every redaction made.

## Backfill
Given a range, repeat per date: one draft per publishable day. List the days you skipped and why.

## Hard rules
- Never write outside `drafts/`. Never `git add`/commit/push. Never move anything into
  `site/posts/`. The vault is read-only. Publishing is the operator's call, not yours.
