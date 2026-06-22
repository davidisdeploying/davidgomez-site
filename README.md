# davidgomez.cc

The personal site + devblog, built with [Eleventy](https://www.11ty.dev/). No client-side
rendering — every page is static HTML at deploy time, so posts are indexable and there's an RSS feed.

## Run locally
```bash
npm install
npm start        # dev server with live reload at http://localhost:8080
npm run build    # one-off build into _site/
```

## Structure
```
site/                     # Eleventy input
  index.html              # hand-built static pages (passed through verbatim)
  work.html
  davidisdeploying.html
  resume.html
  devblog.njk             # blog index  -> /devblog.html
  feed.njk                # RSS         -> /feed.xml
  posts/
    posts.11tydata.js     # makes every .md here a post (layout + auto permalink)
    YYYY-MM-DD-slug.md     # one post per file (frontmatter + Markdown body)
  _includes/
    base.njk              # shared shell: head, CSS, nav, footer
    post.njk              # post layout
drafts/                   # CC writes drafts here; NOT built or published
claude/                   # the draft/publish skill pair for Claude Code
```

## Publishing a post
A post is one Markdown file in `site/posts/` with this frontmatter:
```yaml
---
title: "Your title"
date: 2026-06-22
topics: ["Loupe", "Learning"]
summary: "One or two sentences for the index and RSS."
---
Body in Markdown.
```
The slug (and URL `/devblog/<slug>.html`) comes from the filename. Drop the file, commit, push —
Cloudflare Pages rebuilds. See `claude/` for the assisted draft-from-vault workflow.

## Deploy (Cloudflare Pages, Git-connected)
Build command: `npx @11ty/eleventy`  ·  Output directory: `_site`  ·  Framework preset: None.
