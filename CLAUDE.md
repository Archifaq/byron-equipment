# ByronEquipment.com Claude Instructions

You are working on ByronEquipment.com, a B2B equipment rental marketplace built with Astro, strict TypeScript, Tailwind CSS, MDX content collections, and the Cloudflare adapter.

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

## Core Rules

- Keep TypeScript strict.
- Use Astro components unless a framework component is clearly needed.
- Use Tailwind CSS for styling.
- Keep the design quiet, practical, and B2B-focused.
- Do not add backend form logic unless explicitly requested.
- Do not break i18n routing or cross-locale category mapping.
- Always run `npm run build` after structural or routing changes.

## Important Architecture

Category translations are linked by `categoryId`, not by URL slug.

Each category MDX file has:

- `categoryId`: stable shared identifier across locale versions
- `localizedSlug`: public URL slug for that locale
- `parent`: optional same-locale hierarchy reference

Never reuse the current page slug for another locale. Use the helpers in `src/lib/content.ts` to resolve translated category entries before generating alternate URLs or locale switcher links.

## Local Development

Install dependencies with:

```sh
npm install --legacy-peer-deps
```

Build with:

```sh
npm run build
```

The project uses Astro latest stable with `@astrojs/tailwind`, which currently requires `--legacy-peer-deps` because the integration peer range has not caught up with Astro 7.

Cloudflare local dev may fail on macOS versions earlier than 13.5 because `workerd` requires macOS 13.5+.

## Key Files

- `astro.config.mjs`: Astro, Tailwind, MDX, Cloudflare, and i18n configuration
- `src/content.config.ts`: typed content collection schemas
- `src/lib/i18n.ts`: locale path and language-code mapping
- `src/lib/content.ts`: content loading and cross-locale category helpers
- `src/layouts/Layout.astro`: canonical and hreflang link generation
- `src/components/LocaleSwitcher.astro`: visible locale switching
- `src/pages/index.astro`: default US homepage
- `src/pages/[...slug].astro`: default US category pages
- `src/pages/uk/[...slug].astro`: UK homepage and category pages
- `src/pages/pl/[...slug].astro`: Polish homepage and category pages
