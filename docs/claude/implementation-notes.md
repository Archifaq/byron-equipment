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
```

`parent` is for same-locale hierarchy only. It is not used for translations. With the current Astro 7 glob loader, use the collection entry ID rather than a filesystem-like `categories/...` prefix, for example `en-us/excavators`, `uk/excavators`, or `pl/koparki`.

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

## Verification Checklist

After i18n or route changes:

```sh
npm run build
```

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
