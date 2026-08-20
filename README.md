# ByronEquipment.com

B2B equipment rental marketplace built with Astro, strict TypeScript, Tailwind CSS, MDX content collections, and the Cloudflare adapter.

## Commands

```sh
npm install --legacy-peer-deps
npm run dev
npm run build
```

`--legacy-peer-deps` is currently needed because `@astrojs/tailwind` is deprecated and its peer range has not been updated for the latest stable Astro release.

## Locales and Routes

- `en-US`: default locale, no URL prefix, e.g. `/` and `/excavators`
- `en-GB`: routed through the custom locale path `/uk`, e.g. `/uk` and `/uk/excavators`
- `pl`: routed through `/pl`, e.g. `/pl` and `/pl/koparki`

Astro's i18n helpers are used to generate alternate links and locale switcher URLs.

## Adding UI Strings

Locale-specific terminology lives in `src/content/strings/*.json`.

To add or change wording:

1. Open the matching locale file, such as `src/content/strings/en-US.json`.
2. Update the existing keys under `terminology`, `navigation`, or `market`.
3. Keep the same object shape for every locale so TypeScript and Zod can validate the collection.

Use this collection for regional business language, for example `Rent` in `en-US` and `Hire` in `en-GB`.

## Adding Categories

Category content lives in `src/content/categories/{locale-path}/`.

Create a new `.mdx` file with frontmatter like:

```mdx
---
locale: en-US
categoryId: excavators
title: Excavators
description: Tracked and wheeled excavators for commercial site work.
localizedSlug: excavators
parent: en-us/earthmoving
seo:
  title: Excavator Rental Marketplace | Byron Equipment
  description: Compare excavator rental availability across vetted equipment partners.
---

Body content for the category page.
```

Notes:

- The `localizedSlug` field controls the public URL path.
- The `categoryId` field links translations across locales and must stay identical for sibling category pages.
- Use `locale: en-GB` for files under `src/content/categories/uk`.
- `parent` is optional and should reference another category entry ID when hierarchy is needed, e.g. `en-us/excavators`, `uk/excavators`, or `pl/koparki`.
- Keep SEO descriptions under 180 characters.

## Deployment

The workflow in `.github/workflows/deploy.yml` builds on pull requests and deploys pushes to `main` with Cloudflare Pages. Configure these repository secrets before deployment:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
