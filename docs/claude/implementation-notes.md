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

## Cross-Locale Alternates

For category pages:

1. Resolve the current category by route slug.
2. Read its `categoryId`.
3. For each target locale, find the category with the same `categoryId`.
4. Use that target category's `localizedSlug`.
5. Omit locale links where no translation exists.

This logic lives in `src/lib/content.ts` and is consumed by the localized `[...slug].astro` routes.

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
