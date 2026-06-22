Draft a devblog post from the vault using the **blog-draft** skill.

Argument: a date `YYYY-MM-DD` (or a range for backfill).

Read the session note(s) at `~/loupe/vault/Loupe/sessions/<date>-*.md` and that day's new
`DECISIONS.md` / `LEARNINGS.md` entries. Produce a draft into `<site-repo>/drafts/` exactly
as the skill specifies, applying `claude/REDACTION-CHECKLIST.md`. Then STOP and report the
draft path, title, publish-readiness, and the list of redactions.

Do not commit, push, or publish. Do not write into `site/posts/`.
