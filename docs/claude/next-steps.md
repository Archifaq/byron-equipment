# Suggested Next Steps

## Content Expansion

- Add more top-level equipment categories.
- Use `category-tree.json` as the source of truth before changing hierarchy, breadcrumbs, or related-category behavior.
- Expand UK category MDX bodies using UK rental terminology.
- Expand PL category MDX bodies using localized Polish terminology and diacritics.
- Expand `strings` files with RFQ form labels and validation copy.

## UX Expansion

- Add category search and filtering.
- Improve breadcrumb presentation if needed; baseline breadcrumb rendering is already implemented.
- Add equipment detail cards within category pages.
- Improve RFQ form states while keeping submission frontend-only until backend work is requested.

## SEO Expansion

- Add category-specific `ogImage` assets over time; the current implementation falls back to `/images/byron-og-default.png`.
- Add a real logo asset and then include it in homepage `Organization` JSON-LD.
- Add structured data for future provider/city pages only after real verified provider data exists.
- Keep `scripts/verify-category-tree.ts` aligned with `src/content.config.ts` whenever category frontmatter schema fields change.

## Verification Notes

- `scripts/verify-category-tree.ts` now uses direct MDX frontmatter parsing from disk with the installed YAML parser. This replaced the old internal Astro data-store dependency because Astro 7.2.4 does not expose typed content collection entries through a public contract outside page rendering/Vite context.

## Infrastructure

- Keep Cloudflare Pages on static output directory `dist`.
- Do not switch back to `dist/server` unless the project intentionally moves to Workers SSR.
- Add a lightweight automated test for alternate URL generation.
