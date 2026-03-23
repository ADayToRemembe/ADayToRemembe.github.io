# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server at localhost:4321
npm run build      # Production build (type-checks + static generation)
npm run preview    # Preview production build locally
```

## Tech Stack

- **Astro** (static site generation) + **TypeScript** (strict mode)
- **Tailwind CSS v4** via `@tailwindcss/vite` (no tailwind.config.js — configured in CSS)
- **MDX** for blog posts and project pages with math support
- **KaTeX** via `remark-math` + `rehype-katex` (imported in `global.css`)
- **Supabase** for comments (client-side only, no server routes)

## Architecture

### Content System
Content lives in `src/content/` as `.mdx` files. Two collections are defined in `src/content.config.ts` using the **Astro v5 glob loader** (not the legacy `type: 'content'` API):
- `blog/` — posts with `draft`, `math`, `tags` fields
- `projects/` — with `status` (active/completed/archived), `github`, `paper` links

**Important:** With the glob loader, entries use `entry.id` (not `entry.slug`). All routes and `<PostCard>` components pass `post.id` as the slug prop. Do not use `entry.slug` — it does not exist in Astro v5+.

Add `math: true` to frontmatter on posts that use KaTeX — this is informational only (KaTeX CSS is always loaded globally).

### Routing
All routes are statically generated:
- `/blog/[...slug]` — rendered from `blog` collection
- `/projects/[...slug]` — rendered from `projects` collection
- `/blog/tag/[tag]` — auto-generated from all tags in blog posts

### Supabase / Comments
`src/lib/supabase.ts` exports the client. Comments are fetched and submitted client-side in `src/components/Comments.astro` (uses `<script>` block). Before using comments, run `supabase-schema.sql` in the Supabase SQL editor.

Environment variables required (copy `.env.example` → `.env`):
```
PUBLIC_SUPABASE_URL=
PUBLIC_SUPABASE_ANON_KEY=
```

### Styling
Global styles and prose typography are defined in `src/styles/global.css`. Tailwind v4 uses CSS-first config — add custom tokens in `:root` there, not in a config file. The `.prose` class styles MDX content (headings, code blocks, links, blockquotes).

## Writing Content

### Blog post frontmatter
```yaml
---
title: "Post Title"
description: "One sentence summary"
pubDate: 2024-03-15
tags: ["CFD", "RANS"]
math: true        # include if post has LaTeX
draft: false      # omit or false to publish
---
```

### Math syntax (KaTeX)
- Inline: `$E = mc^2$`
- Block: `$$\nabla \cdot \mathbf{u} = 0$$`
