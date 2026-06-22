---
title: "Three ways to ship the wrong thing to Cloudflare Pages"
date: 2026-06-22
topics: ["cloudflare-pages", "eleventy", "deploy", "git"]
summary: "Adding a devblog to my site took three tries to deploy — a nested zip, a misplaced git init, and a commit Cloudflare refused to stop rebuilding. All three were the same mistake wearing different hats."
---

I spent an evening adding a devblog to my personal site, and the writing turned out to be the easy part. Getting it to actually deploy took three tries, and each failure was a different, instructive way of shipping the wrong files.

The stack is boring on purpose: an [Eleventy](https://www.11ty.dev/) static build, hosted on Cloudflare Pages, wired to a Git repo so a push triggers a build. The trouble was never Eleventy. It was everything around getting the right bytes into the repo.

## 1. The nested-zip trap

I built the scaffold elsewhere and moved it over as a batch download. The download helpfully bundled everything into a single archive — with the real project zip nested *inside* it. So when I unzipped, I got a pile of loose files plus a same-named inner zip, and never a clean project folder. I pushed what looked right, and the first build died:

```
The "site" input parameter must exist
```

My `eleventy.config.js` had made it in; the entire `site/` input directory had not. Lesson: move one file at a time, under a distinct name, so nothing gets silently re-archived on you.

## 2. git init from the wrong directory

Re-extracted, tried again — and ran `git init` from *inside* `site/`. Git happily made that subfolder the repo root, which pushed the site's contents to the top level and left `package.json` and `eleventy.config.js` one directory up, outside the repo entirely. The exact mirror image of the first failure: last time `site/` was missing, this time everything *but* the config was missing. Now I `ls` for `package.json` before I ever type `git init`.

## 3. The commit that wouldn't die

Third time the content was finally correct. I force-pushed over the broken commit... and Cloudflare kept rebuilding the original broken one (`f8de612`) anyway. It turns out a force-push doesn't reliably trigger a Pages build, and the "Retry deployment" button just re-runs the *pinned* old commit — so it cheerfully rebuilds the exact thing you're trying to replace.

The fix was almost stupid:

```
git commit --allow-empty -m "rebuild"
```

A normal new commit fires a clean webhook on the new HEAD, and the build finally went green — `Copied 4, Wrote 3 files`, upload complete. As a bonus, with `package.json` now sitting at the repo root where Cloudflare expects it, the build auto-ran `npm install` and used my pinned Eleventy version instead of fetching a fresh one each time.

## The pattern

Three failures, and all three were the same mistake wearing different hats: I assumed the files I *thought* I was shipping were the files actually in the repo. The zip lied, the working directory lied, and the build cache lied. The cure each time was to verify the literal state — what's actually in the archive, what's actually the repo root, what commit the build log is actually on (`HEAD is now at <sha>`) — instead of trusting my intent. Boring advice, but the deploy doesn't care about your intent.
