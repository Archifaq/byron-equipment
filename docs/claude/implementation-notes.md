# Implementation Notes for Claude

## Content Collections

The project uses Astro 7 content collections. The content config must live at:

```txt
src/content.config.ts
```

Do not move it back to `src/content/config.ts`; that is the legacy Astro 5 style and will fail in Astro 7.

## Category Frontmatter

Each category file must include:

```yaml
locale: en-US
categoryId: stable-shared-id
title: Category Title
description: Short description under 180 characters.
localizedSlug: localized-url-slug
seo:
  title: SEO title
  description: SEO description under 180 characters.
```

Optional:

```yaml
parent: en-us/parent-category
ogImage: /images/category-specific-og.png
```

`parent` is for same-locale hierarchy only. It is not used for translations. With the current Astro 7 glob loader, use the collection entry ID rather than a filesystem-like `categories/...` prefix, for example `en-us/excavators`, `uk/excavators`, or `pl/koparki`.

`ogImage` is optional. If omitted, SEO metadata falls back to `/images/byron-og-default.png`.

## Category Tree

`category-tree.json` exists at the repository root and is the source of truth for hierarchy and locale metadata.

The file contains 26 category entries with complete locale blocks for:

- `en-US`
- `en-GB`
- `pl`

Use `parentCategoryId` from `category-tree.json` for hierarchy features. It is categoryId-based and locale-agnostic. Resolve locale-specific URLs by looking up the target category's `localizedSlug` for the current locale.

Do not hardcode category hierarchy in routes, components, or MDX body content.

## Cross-Locale Alternates

For category pages:

1. Resolve the current category by route slug.
2. Read its `categoryId`.
3. For each target locale, find the category with the same `categoryId`.
4. Use that target category's `localizedSlug`.
5. Omit locale links where no translation exists.

This logic lives in `src/lib/content.ts` and is consumed by the localized `[...slug].astro` routes.

Because deployment is static, each catch-all route must export `getStaticPaths()` so Astro generates concrete HTML files for every category slug.

## Breadcrumbs and Related Categories

`src/lib/content.ts` exposes:

- `getBreadcrumbs(categoryId, localePath)`
- `getRelatedCategories(categoryId, localePath)`

Both functions read from `category-tree.json`.

`getRelatedCategories()` returns sibling categories with the same `parentCategoryId`, excluding the current category. For top-level categories where `parentCategoryId === null`, it returns an empty array.

`CategoryView.astro` renders breadcrumbs and the dynamic related-category block. Manual `## Related Categories` sections should not be added to MDX category bodies.

## URL Generation

Astro i18n `getRelativeLocaleUrl()` expects language codes such as:

- `en-US`
- `en-GB`
- `pl`

The visible route folder for UK is `uk`, but the locale code remains `en-GB`. Use `localeMeta[localePath].code` from `src/lib/i18n.ts` when generating URLs.

## SEO Output

`src/lib/seo.ts` centralizes SEO helpers:

- `getSitemapRoutes(site)` generates the 81 sitemap routes.
- `getAlternateLinks(site, alternatePaths)` converts per-locale paths into absolute sitemap alternates.
- `getOgLocale(localePath)` maps Astro locale paths to Open Graph locale values: `en_US`, `en_GB`, `pl_PL`.
- `createCategoryServiceJsonLd()` emits `Service` JSON-LD for category pages.
- `createBreadcrumbJsonLd()` emits `BreadcrumbList` JSON-LD from existing breadcrumbs.
- `createOrganizationJsonLd()` emits homepage `Organization` JSON-LD without a logo unless a real logo asset exists.

`src/pages/sitemap-index.xml.ts` generates a `urlset` sitemap at `/sitemap-index.xml`, not a sitemap index that points elsewhere. The old static `public/sitemap-index.xml` placeholder was removed.

`src/components/StructuredData.astro` renders JSON-LD blocks. Do not add fake price, rating, review, availability, or Product schema fields; the site is RFQ/lead-generation oriented, so category pages use `Service`.

## Verification Checklist

After i18n or route changes:

```sh
npm run build
```

`npm run build` runs `astro build && npm run verify:category-tree`.

`scripts/verify-category-tree.ts` checks `category-tree.json` against category MDX frontmatter parsed from disk with the installed YAML parser. It verifies:

- category IDs present in content but missing in the tree
- tree entries/locales missing in content
- localized slug mismatches
- category parent mismatches after resolving same-locale `parent` references back to `categoryId`
- dangling `parentCategoryId` values in `category-tree.json`
- duplicate `categoryId` values within a locale
- generated category-page canonical tags against `dist/sitemap-index.xml`
- generated category-page hreflang tags against `dist/sitemap-index.xml`

The script intentionally avoids Astro's internal content data store. It builds entry IDs from file paths by taking the path relative to `src/content/categories/`, lowercasing the locale directory segment, and removing `.mdx`, for example `src/content/categories/en-US/excavators.mdx` becomes `en-us/excavators`. Raw `parent` frontmatter is read as a same-locale string such as `en-us/excavators`.

Then verify `/uk/access-platforms` source should include:

```html
<link rel="alternate" hreflang="en-US" href="/aerial-lifts/">
<link rel="alternate" hreflang="en-GB" href="/uk/access-platforms/">
<link rel="alternate" hreflang="pl" href="/pl/podesty-ruchome/">
```

Locale switcher should link to the same locale-specific paths.

The known category triplet for deployment sanity checks is:

```txt
/plate-compactors/
/uk/wacker-plates/
/pl/zageszczarki-plytowe/
```

## Cloudflare Pages Deployment

This project is currently configured for static Astro output so Cloudflare Pages can serve generated category routes directly.

Use these Pages settings:

```txt
Build command: npm run build
Build output directory: dist
Root directory: leave empty
```

Do not set the output directory to `dist/server`; that is only relevant for the previous SSR/Workers-style output and will not serve the static Pages build correctly.

The production Pages URL (`https://byronequipment.pages.dev`) reflects the production branch, usually `main`. Branch preview URLs are separate. If a branch preview works but the production URL does not, confirm the branch has been merged and production deployment has completed.
