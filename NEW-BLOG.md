# How to Write a New Post

## What is BlogPostLayout?

It's the shared shell every post lives inside. It handles:
- The 3-column grid (TOC on the left, your content in the center, support quote card on the right)
- The gradient `h1` title and `h2` subtitle at the top
- The date + read time bar
- The sticky table of contents that auto-populates from your frontmatter

You never touch this file when writing a post. You just fill in the frontmatter and write.

---

## Steps

### 1. Create the file

```
src/pages/content/your-post-slug.mdx
```

The filename becomes the URL: `/content/your-post-slug`

---

### 2. Copy this frontmatter and fill it in

```yaml
---
layout: ../../layouts/BlogPostLayout.astro
title: "SEO title shown in browser tab and Google"
description: "One sentence shown in search results and link previews."
heroTitle: "The big gradient heading displayed on the page"
subtitle: "The series or post name shown below the hero title"
pubDate: "YYYY-MM-DD"
readTime: 10
toc:
  - id: section-slug
    text: Section Title
  - id: another-section
    text: Another Section
---
```

- `title` — SEO only, not shown on page
- `heroTitle` — what readers actually see as the main heading
- `subtitle` — shown below heroTitle (e.g. "3 AM Conversations with AI, Vol. 1")
- `toc` ids must exactly match the `id` attributes on your `<section>` tags

---

### 3. Import components you need

```mdx
import Tooltip from '../../components/ui/Tooltip.astro';
import GradientText from '../../components/ui/GradientText.astro';
```

---

### 4. Write content

Plain paragraphs and headings are just markdown:

```md
Regular paragraph text just like this. **Bold** and _italic_ work normally.
```

Wrap each section in a `<section>` tag with an id matching your TOC:

```mdx
<section id="section-slug" class="space-y-6">

<h3 class="text-3xl text-zinc-100" style="font-family: var(--font-serif);">Section Title</h3>

Plain paragraph text here.

**Key takeaway:** Bold summary at the end of a section.

</section>
```

---

### 5. Tooltips

Any paragraph containing a `<Tooltip>` **must be wrapped in a `<p>` tag**. Plain markdown paragraphs won't work with inline components.

```mdx
<p>Some text with a <Tooltip definition="What this thing is." link="https://example.com">Term</Tooltip> inline.</p>
```

Tooltip props:
| Prop | Required | Description |
|---|---|---|
| `definition` | yes | Text shown in the popup |
| `link` | no | URL opened on click (desktop) or shown as link (mobile) |
| `pronunciation` | no | Shown as `/phonetic/` below the term |
| `imageUrl` | no | Image displayed in the popup (use `/filename.ext` from public/) |
| `imageAlt` | no | Alt text for the image |

> If your link contains `&` (e.g. YouTube URLs), write it as `&amp;` in the attribute.

---

### 6. Lists with custom styling

Standard markdown lists won't get the `›` bullet style. Use this JSX pattern:

```mdx
<ul class="list-none space-y-2 [&>li]:relative [&>li]:pl-5 [&>li]:before:content-['›'] [&>li]:before:absolute [&>li]:before:left-0 [&>li]:before:text-zinc-400">
  <li><strong>Label</strong> — description</li>
  <li>Another item</li>
</ul>
```

---

### 7. Footer nav

Copy and adjust at the bottom of every post:

```mdx
<div class="pt-8 border-t border-zinc-800 mt-12">
  <div class="text-zinc-400 italic mb-6 text-center text-sm" style="font-family: var(--font-sans);">
    Series note or closing line here.
  </div>
  <div class="grid grid-cols-3 items-center gap-4">
    <a href="/content" class="justify-self-start inline-flex items-center justify-center px-6 py-2 border border-zinc-700 rounded-md text-sm uppercase tracking-wider text-white bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-200" style="font-family: var(--font-sans);">
      <GradientText colors={["#8DE5FF", "#A0B8FF", "#BFA0FF", "#8DE5FF"]} animationSpeed={3}>All Posts</GradientText>
    </a>
    <div></div>
    <!-- Add a next-post link here if there's a Part 2, otherwise leave as <div></div> -->
    <div></div>
  </div>
</div>
```

---

### 8. Register the post

Add it to **two** places so it appears in the listing and RSS feed.

**`src/pages/content/index.astro`** — there is no single `posts` array. There are four category arrays at the top of the frontmatter. Pick the one your post belongs to:

| Array | Section heading on the page | What goes here |
|---|---|---|
| `blogs` | Blogs | Personal writing on tech and ideas. Currently empty — the section is hidden until it has at least one entry |
| `guides` | Guides | Frameworks on learning, cognition, mental models |
| `conversations` | 3 AM Conversations with AI | Entries in the transcript series |
| `articles` | Articles | Standalone essays and reviews |

Entry shape (same for all four):
```js
{
  title: "Your Post Title",
  slug: "your-post-slug",
  excerpt: "One line description.",
  pubDate: new Date("YYYY-MM-DDT00:00:00.000Z"),
  featured: false, // true shows the card with a gradient border
},
```

The `blogs` array is typed explicitly, so if you add the first entry there, keep the fields matching its type annotation.

**`src/pages/rss.xml.ts`** — add to the `items` array (note the `/content/` link prefix):
```js
{
  title: "Your Post Title",
  pubDate: new Date("YYYY-MM-DD"),
  description: "One line description.",
  link: "/content/your-post-slug",
},
```

---

## Checklist

- [ ] File created at `src/pages/content/your-slug.mdx`
- [ ] Frontmatter filled in (all fields)
- [ ] TOC ids match section ids
- [ ] Tooltip paragraphs wrapped in `<p>` tags
- [ ] `&` in URLs written as `&amp;`
- [ ] Post added to the right category array in `content/index.astro`
- [ ] Post added to `rss.xml.ts` with a `/content/` link
- [ ] Run `bun run dev` and check it looks right
