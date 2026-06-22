# Claude Code: assisted devblog workflow

A Tandem-style draft/publish pair. CC reads the vault build log and drafts posts; David reviews;
publishing is gated.

## Install (on the mini)
Copy or symlink into `~/.claude/`:
```bash
cp -r claude/skills/blog-draft ~/.claude/skills/
cp claude/commands/draft-post.md claude/commands/publish-post.md ~/.claude/commands/
```
Keep `REDACTION-CHECKLIST.md` in the repo; the skill reads it from `<site-repo>/claude/`.

## The loop
1. `/draft-post 2026-06-22`  → CC writes `drafts/2026-06-22-<slug>.md`, reports redactions.
2. You read it, edit anything, decide if it's worth shipping.
3. `/publish-post 2026-06-22-<slug>.md` → CC asks for your GO, then moves it to `site/posts/`,
   builds, commits, and pushes. Pages redeploys.

## Backfill
`/draft-post 2026-06-08..2026-06-21` drafts one post per publishable day across your existing
session notes. Triage the batch, publish the keepers. Scope is the vault's lifetime, not before it.

## Why the gate
It's public, under your name, and the source notes are full of infra and (adjacent) work detail.
CC drafts and redacts; you approve. The human step is the safety feature, not friction.
