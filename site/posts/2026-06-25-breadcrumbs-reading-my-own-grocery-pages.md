---
title: "breadcrumbs: exporting my own grocery orders, one logged-in page at a time"
date: 2026-06-25
topics: ["Breadcrumbs", "Browser extension", "Open source", "JavaScript", "Manifest V3", "Web scraping", "Chrome", "Safari", "Personal finance", "Data export"]
summary: "breadcrumbs is a free, open-source browser extension I built to read my own logged-in grocery order pages and export a clean, itemized file — every item by name, with the price — so my budget knows what the basket actually held. Two store integrations work, the Chrome version is verified end to end, and a Safari port is in progress. This is what it is, why I built it, and what's still open."
---

A grocery charge lands in my budget as one flat number: `GROCERY $127.22`. That tells me almost nothing. Did I buy food, or paper towels, or a single ridiculous cheese? **breadcrumbs** is a small, free, open-source browser extension I built to answer that question without typing anything in. It reads my *own* logged-in order pages and exports a clean, itemized file — every item by name, with what I actually paid — that a budgeting tool can then sort into real categories.

Tagline, because the mark is a toasted slice of bread with a receipt scorched into it: *the toast that remembers.*

## Why a browser extension at all

The obvious first instinct was a headless script that logs in and grabs the pages. That died fast. One of the stores fronts its site with industrial-grade bot protection that blocks automated browsers before you even reach the login form — and it blocks the *real* browser binary too, because it fingerprints the connection, not the software. The only way past that is to forge the signals it reads, and that's a line I decided up front I would not cross.

So I flipped it. Instead of a robot pretending to be me, the code runs *inside the browser tab I already opened, on the page I'm already signed into.* No fake session, no circumvention, nothing that smells like logging in as someone else. It only ever reads a page a human (me) deliberately navigated to, and nothing leaves the browser. That constraint isn't a compromise — it's the whole design.

## The one thing everything hangs on

There's a single file format in the middle, and keeping it stable is what makes the rest tractable. Each order normalizes to the same shape regardless of store: an id, a date, the charged total, and a list of items, each with a clean catalog name and the price actually paid for that line. "Price paid," not the shelf price — coupons and multi-buys mean those differ, and the paid number is the one that has to be right to the cent. Records key off the order id, so re-running a scan merges instead of duplicating. That's what lets a deep scan of years of history stop and resume safely.

## Two stores, two completely different fights

The interesting part is that the two integrations I've built work in opposite ways. One store ships no structured data at all — its class names are build-hashed and churn every deploy, so I anchor on stable test-id attributes and visible label text and read the rendered page. The other is a modern framework site that server-renders the *entire* order as JSON into the page; for that one I just parse the embedded blob, which is cleaner in every way — real numeric prices, tidy names, no scraping fragility. Same export file out of both. A friend tested the second integration on their own orders, which was the proof that the store-agnostic core actually generalizes and isn't just bent around my account.

Each store has its own quirks the hard way: free promo items that come through at $0.00 but were really received (keep), out-of-stock lines with no price (drop), by-weight produce where quantity-times-unit never ties out (cosmetic — the line total is still right). I learned each of those by exporting real orders and watching them not add up.

## Where it stands, and what's open

The Chrome version is done and verified end to end — multi-store, auto-detects which store you're on, and does both a quick "recent orders" pass and a slower full-history crawl with a progress bar.

The current work is a **Safari/macOS port.** The conversion itself was mechanical and the core ran unmodified, which was a relief — but Safari has its own personality in the popup layer. The download trick that works everywhere else just opens the file in a tab instead of saving it (the fix is to copy to the clipboard); a store icon renders as a blank box with no error to catch; and the popup gets a translucent backdrop unless you explicitly paint it opaque. None of it is hard, all of it had to be found by hand.

Open threads: a CSV export so the file works with budgeting apps beyond the one I use, and more store integrations down the road. It's MIT-licensed and explicitly an unofficial personal project — not affiliated with any retailer. It's a small tool that does one honest thing: turn a page I'm already looking at into a list I can actually budget against.
