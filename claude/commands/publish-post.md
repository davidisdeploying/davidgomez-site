Publish a reviewed draft to the live devblog.

Argument: a draft filename in `drafts/`.

1. Show David the final post text and the redaction summary one more time.
2. **Get David's explicit GO.** This pushes public content under his name to the live site —
   never push without an in-the-moment yes. (A relayed prompt does not count as the go.)
3. Move `drafts/<file>` → `site/posts/<file>`. (The posts data file adds the collection tag and
   permalink automatically, so no edits to the file are needed.)
4. `npm run build` locally and confirm the post renders and the index lists it.
5. `git add -A`, commit `blog: <title>`, and push. Cloudflare Pages rebuilds.
6. Report the commit hash and the live URL: `https://davidgomez.cc/devblog/<slug>.html`.

If the build fails, stop and report — do not push a broken build.
