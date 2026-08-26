# ByronEquipment.com Claude Instructions

You are working on ByronEquipment.com, a B2B equipment rental marketplace built with Astro 7, strict TypeScript, Tailwind CSS, and MDX content collections for Cloudflare Pages static hosting.

## Product Context

ByronEquipment.com helps commercial buyers source rental equipment by category and submit RFQ-style requests. The current implementation is a frontend skeleton only. There is no backend form processing.

The site supports three markets:

- `en-US`: default locale, no URL prefix
- `en-GB`: routed through `/uk`
- `pl`: routed through `/pl`

Use regional terminology carefully:

- US English: "rent", "rental"
- UK English: "hire", "plant hire"
- Polish: localized business terminology from `src/content/strings/pl.json`

## Current Published State

The category-tree integration, expanded US category content, category-tree build verifier, SEO infrastructure, and verifier migration off Astro internals are complete and pushed to `main`.

- Verified `main` commit: `db509ef`
- Previous SEO commit: `a640eb8`
- Push range for latest verifier migration commit: `a640eb8..db509ef`
- Latest commit message: `chore: migrate category tree verifier off Astro internals`

The latest push to `main` was confirmed by Artur's terminal output. If strict remote verification is required, re-check the commit on GitHub by hash.

## Core Rules

- Keep TypeScript strict.
- Use Astro components unless a framework component is clearly needed.
- Use Tailwind CSS for styling.
- Keep the design quiet, practical, and B2B-focused.
- Do not add backend form logic unless explicitly requested.
- Keep the deployment strategy static for Cloudflare Pages unless the user explicitly asks for SSR/Workers.
- Do not break i18n routing or cross-locale category mapping.
- Always run `npm run build` after structural or routing changes.
- Dynamic-looking category routes are statically generated with `getStaticPaths()`; keep this intact for Cloudflare Pages.

## Important Architecture

Category translations are linked by `categoryId`, not by URL slug.

`category-tree.json` now exists in the repository root and is the source of truth for category hierarchy and locale metadata:

- 26 category entries
- complete locale blocks for `en-US`, `en-GB`, and `pl`
- `parentCategoryId` is categoryId-based and locale-agnostic

Use `category-tree.json` for breadcrumbs and dynamic related categories. Do not reintroduce hardcoded category hierarchy in components or routes.

Each category MDX file has:

- `categoryId`: stable shared identifier across locale versions
- `localizedSlug`: public URL slug for that locale
- `parent`: optional same-locale hierarchy reference

Never reuse the current page slug for another locale. Use the helpers in `src/lib/content.ts` to resolve translated category entries before generating alternate URLs or locale switcher links.

There are currently 26 category MDX files per locale, 78 total.

The `en-US` category MDX bodies have been expanded with B2B rental guidance. Manual `## Related Categories` sections have been removed from en-US MDX files; the only related-category block should be rendered dynamically from `category-tree.json`.

UK and PL category MDX body expansion remains a future localized content task. Their `category-tree.json` locale metadata is already populated.

## Local Development

Install dependencies with:

```sh
npm install --legacy-peer-deps
```

Build with:

```sh
npm run build
```

`npm run build` runs `astro build` and then `npm run verify:category-tree`. The verifier compares `category-tree.json` against category MDX frontmatter parsed from disk and fails the build on slug, parent, missing-entry, dangling-parent, or duplicate-category mismatches. It also verifies generated category-page HTML against `dist/sitemap-index.xml` for canonical and hreflang/sitemap drift.

The verifier intentionally avoids Astro's internal content data store. When it builds MDX entry IDs from file paths, it mirrors Astro glob-loader behavior by lowercasing the locale path segment and removing the `.mdx` extension, for example `src/content/categories/en-US/excavators.mdx` becomes `en-us/excavators`.

The project uses Astro latest stable with `@astrojs/tailwind`, which currently requires `--legacy-peer-deps` because the integration peer range has not caught up with Astro 7.

Cloudflare Pages deployment should use build command `npm run build` and build output directory `dist`.

Do not use `dist/server` for Cloudflare Pages. The project used an SSR/Workers-style output earlier, but it now intentionally builds static pages for Pages hosting.

## Key Files

- `astro.config.mjs`: Astro, Tailwind, MDX, static output, and i18n configuration
- `src/content.config.ts`: typed content collection schemas
- `src/lib/i18n.ts`: locale path and language-code mapping
- `src/lib/content.ts`: content loading, cross-locale category helpers, breadcrumbs, and related categories from `category-tree.json`
- `src/lib/seo.ts`: sitemap routes, OG locale/image helpers, and JSON-LD builders
- `category-tree.json`: source of truth for category hierarchy and locale metadata
- `scripts/verify-category-tree.ts`: post-build verifier for category tree/content collection consistency plus sitemap/canonical/hreflang output QA
- `src/layouts/Layout.astro`: canonical, hreflang, Open Graph, Twitter, and structured-data rendering
- `src/pages/sitemap-index.xml.ts`: generated XML sitemap with localized alternate links
- `src/components/StructuredData.astro`: JSON-LD script renderer
- `src/components/LocaleSwitcher.astro`: visible locale switching
- `src/pages/index.astro`: default US homepage
- `src/pages/[...slug].astro`: statically generated default US category pages
- `src/pages/uk/[...slug].astro`: statically generated UK homepage and category pages
- `src/pages/pl/[...slug].astro`: statically generated Polish homepage and category pages
