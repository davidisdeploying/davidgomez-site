Draft a COMPREHENSIVE devblog post from the vault using the **blog-draft** skill.

Argument: a date `YYYY-MM-DD` (or a range for backfill).

Read ALL session notes at `~/loupe/vault/Loupe/sessions/<date>-*.md` plus that day's new
`DECISIONS.md` / `LEARNINGS.md` entries. Produce a comprehensive draft into `<site-repo>/drafts/`
exactly as the skill specifies — cover everything the day touched (built, decided, fought, learned,
still open), not a single story — applying `claude/REDACTION-CHECKLIST.md`, summarizing the
file/path/gate detail at a safe altitude. Then STOP and report the draft path, title, topic list,
publish-readiness, and the list of redactions.

Do not commit, push, or publish. Do not write into `site/posts/`.
