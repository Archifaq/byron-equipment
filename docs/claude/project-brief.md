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
- `/aerial-lifts`
- `/excavators`
- `/uk`
- `/uk/access-platforms`
- `/uk/excavators`
- `/pl`
- `/pl/podesty-ruchome`
- `/pl/koparki`

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

## Critical i18n Rule

Localized slugs are not interchangeable. Always resolve alternate locale category pages by `categoryId`, then use that locale's own `localizedSlug`.
