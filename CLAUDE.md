# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A Jekyll-based personal blog (kodare.net) by Anders Hovmöller. Uses the `jekyll-theme-slate` theme with GitHub Pages.

## Commands

- **Local dev server:** `make live` (runs `bundle exec jekyll serve`)
- **Install deps:** `bundle install`

## Blog Post Format

Posts go in `_posts/` as markdown files named `YYYY-MM-DD-slug.markdown`. Drafts go in `drafts/`. Front matter:

```yaml
---
title: Post Title
date: YYYY-MM-DD
tags: [tag1, tag2]
author: Anders Hovmöller
---
```

## Structure

- `_layouts/default.html` — single layout used for all pages, includes nav tabs (About, Blog, Apps), post navigation, and claps widget
- `custom.css` / `custom.js` — site-level styling and JS overrides on top of the slate theme
- `index.md` — homepage (About page with blog archive)
- `blog.md` — blog listing page
- `tags.markdown` — tag-based post index
- `_config.yml` — Jekyll config; tag-based RSS feeds enabled via `jekyll-feed`
