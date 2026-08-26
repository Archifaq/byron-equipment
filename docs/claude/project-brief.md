# Project Brief for Claude

## Project

ByronEquipment.com is a multilingual B2B rental marketplace for commercial equipment. The current codebase is an Astro frontend foundation with typed content, localized routes, SEO basics, and an RFQ UI skeleton.

## Current Stack

- Astro `7.x`
- Strict TypeScript
- Tailwind CSS
- MDX content collections
- Cloudflare Pages static hosting
- `@astrojs/tailwind`
- `@astrojs/mdx`

## Business Goal

Create a clean, scalable frontend foundation for equipment rental category pages across multiple markets. Buyers should be able to browse equipment categories and see a placeholder RFQ interface.

## Supported Locales

- `en-US`: default market, URLs like `/` and `/aerial-lifts`
- `en-GB`: UK market, URLs like `/uk` and `/uk/access-platforms`
- `pl`: Polish market, URLs like `/pl` and `/pl/podesty-ruchome`

## Current Pages

- `/`
- `/uk`
- `/pl`
- 26 category pages in the default `en-US` locale
- 26 category pages under `/uk`
- 26 category pages under `/pl`

The generated static build currently produces 81 pages total: 3 locale homepages plus 78 category pages.

## Current Published State

The current verified `main` state includes the category tree integration, expanded US category content, the category-tree build verifier, SEO infrastructure, verifier migration off Astro internals, and Claude context refresh.

- HEAD commit: `2c4877a`
- Previous verifier migration commit: `db509ef`
- Latest commit message: `docs: update Claude context after verifier migration`
- Verified push range for latest context commit: `db509ef..2c4877a`

## Current Content State

The `en-US` category MDX bodies have been expanded from placeholders into practical B2B rental guidance. Each US category body now follows the approved pattern:

- Intro
- Common Use Cases
- What to Consider Before Renting
- Typical Specifications Range
- FAQ

UK and PL category bodies have not yet received the same content expansion and should be handled in separate localized passes.

Manual `## Related Categories` sections have been removed from en-US MDX. Related categories now render dynamically from `category-tree.json`.

## Category Tree

`category-tree.json` exists in the repository root and is the source of truth for category hierarchy and locale metadata.

- 26 category entries
- complete locale blocks for `en-US`, `en-GB`, and `pl`
- `parentCategoryId` is locale-agnostic and categoryId-based
- breadcrumbs and dynamic related categories are generated from this file

UK/PL locale metadata in `category-tree.json` is populated. UK/PL MDX body expansion remains a separate future content task.

## Current Category Translation Sets

### Aerial Access Lifts

Shared `categoryId`: `aerial-access-lifts`

- `en-US`: `aerial-lifts`
- `en-GB`: `access-platforms`
- `pl`: `podesty-ruchome`

### Excavators

Shared `categoryId`: `excavators`

- `en-US`: `excavators`
- `en-GB`: `excavators`
- `pl`: `koparki`

### Plate Compactors

Shared `categoryId`: `plate-compactors`

- `en-US`: `plate-compactors`
- `en-GB`: `wacker-plates`
- `pl`: `zageszczarki-plytowe`

## Critical i18n Rule

Localized slugs are not interchangeable. Always resolve alternate locale category pages by `categoryId`, then use that locale's own `localizedSlug`.

## Current SEO State

The project now generates `/sitemap-index.xml` dynamically from `src/pages/sitemap-index.xml.ts`; the previous static `public/sitemap-index.xml` placeholder was removed.

SEO coverage includes:

- 81 sitemap URLs: 3 locale homepages plus 78 category pages
- localized sitemap alternates generated from real category translation mappings
- canonical, hreflang, Open Graph, and Twitter metadata in `Layout.astro`
- `Service` and `BreadcrumbList` JSON-LD on category pages
- `Organization` JSON-LD on homepages
- optional category `ogImage` frontmatter with fallback to `/images/byron-og-default.png`

`scripts/verify-category-tree.ts` performs both category-tree consistency checks and generated HTML/sitemap canonical-hreflang drift checks after `astro build`. It reads category MDX frontmatter from disk with the installed YAML parser and mirrors Astro glob-loader entry IDs by lowercasing the locale path segment and removing `.mdx`.

## Deployment State

The project is configured for Cloudflare Pages static deployment, not Cloudflare Workers SSR.

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: empty

`npm run build` includes the category-tree and SEO output verifier after `astro build`. The verifier fails the build if `category-tree.json` drifts from category MDX frontmatter, or if generated category HTML drifts from sitemap canonical/hreflang entries.

The project previously used `@astrojs/cloudflare` SSR output, which generated `dist/server`, but that did not work with Pages static deployment. Do not reintroduce SSR/Workers unless explicitly requested.
