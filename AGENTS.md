# ByronEquipment.com Codex Instructions

You are working on ByronEquipment.com, a multilingual B2B equipment rental marketplace built with Astro 7, strict TypeScript, Tailwind CSS, and MDX content collections.

## Product Context

ByronEquipment.com helps commercial buyers browse rental equipment categories and submit RFQ-style requests. The current implementation is a frontend/static content foundation only. Do not add backend form processing unless Artur explicitly asks for it.

Supported locales:

- `en-US`: default locale, no URL prefix, use "rent" and "rental"
- `en-GB`: routed through `/uk`, use "hire" and UK terminology
- `pl`: routed through `/pl`, use localized Polish terminology from `src/content/strings/pl.json`

## Core Rules

- Keep TypeScript strict.
- Use Astro components unless a framework component is clearly needed.
- Use Tailwind CSS for styling.
- Keep the UI quiet, practical, and B2B-focused.
- Keep deployment static for Cloudflare Pages unless SSR/Workers is explicitly requested.
- Do not break i18n routing or cross-locale category mapping.
- Do not add backend RFQ/form logic unless explicitly requested.
- Run `npm run build` after content collection, routing, i18n, or component changes.

## Content and i18n

Category translations are linked by `categoryId`, not by URL slug.

Each category MDX file uses:

- `categoryId`: stable shared identifier across locale versions
- `localizedSlug`: public URL slug for that locale
- `parent`: optional same-locale hierarchy reference

Never reuse the current page slug for another locale. Resolve the target locale category by `categoryId`, then use that locale's `localizedSlug`.

Current category counts:

- `src/content/categories/en-US/`: 26 MDX files
- `src/content/categories/uk/`: 26 MDX files
- `src/content/categories/pl/`: 26 MDX files

The `en-US` category bodies have been expanded with B2B rental guidance. UK and PL bodies may still need separate localized expansion in future work.

`category-tree.json` exists in the repository root and is the source of truth for category hierarchy and locale metadata. It contains 26 categories with complete `en-US`, `en-GB`, and `pl` locale blocks. Use it through helpers in `src/lib/content.ts` for breadcrumbs and related categories.

Manual `## Related Categories` sections have been removed from en-US MDX files. Do not add manual related-category sections back into MDX; use the dynamic related-category rendering from `CategoryView.astro`.

## Deployment

Cloudflare Pages settings:

```txt
Build command: npm run build
Build output directory: dist
Root directory: leave empty
```

Do not use `dist/server`. This project previously used SSR/Workers-style output, but it now intentionally builds static pages for Pages hosting.

Dynamic-looking category routes are statically generated with `getStaticPaths()` in:

- `src/pages/[...slug].astro`
- `src/pages/uk/[...slug].astro`
- `src/pages/pl/[...slug].astro`

Keep those static path generators intact.

## Known QA Notes

The known cross-locale sanity triplet is:

```txt
/plate-compactors/
/uk/wacker-plates/
/pl/zageszczarki-plytowe/
```

For `/uk/access-platforms`, alternates should resolve to:

```txt
/aerial-lifts/
/uk/access-platforms/
/pl/podesty-ruchome/
```

Hierarchy changes must be made in `category-tree.json` first, then reflected through typed helpers. Do not change category `parent` frontmatter or localized slugs from memory.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Project context files:

- `CLAUDE.md`
- `docs/claude/project-brief.md`
- `docs/claude/implementation-notes.md`
- `docs/claude/file-map.md`
- `docs/claude/next-steps.md`

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)
