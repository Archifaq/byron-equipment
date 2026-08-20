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

## Deployment State

The project is configured for Cloudflare Pages static deployment, not Cloudflare Workers SSR.

- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: empty

The project previously used `@astrojs/cloudflare` SSR output, which generated `dist/server`, but that did not work with Pages static deployment. Do not reintroduce SSR/Workers unless explicitly requested.
