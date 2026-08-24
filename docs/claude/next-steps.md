# Suggested Next Steps

## Content Expansion

- Add more top-level equipment categories.
- Validate category hierarchy against an explicit taxonomy source before changing `parent` references. A `category-tree.json` file is not currently present in the repository.
- Expand UK category MDX bodies using UK rental terminology.
- Expand PL category MDX bodies using localized Polish terminology and diacritics.
- Expand `strings` files with RFQ form labels and validation copy.

## UX Expansion

- Add category search and filtering.
- Add breadcrumb navigation for nested categories.
- Add equipment detail cards within category pages.
- Improve RFQ form states while keeping submission frontend-only until backend work is requested.

## SEO Expansion

- Generate a real sitemap from known routes and content collection entries.
- Add Open Graph and Twitter metadata.
- Add structured data for marketplace/category pages.
- Add localized canonical/alternate QA tests.

## Infrastructure

- Keep Cloudflare Pages on static output directory `dist`.
- Do not switch back to `dist/server` unless the project intentionally moves to Workers SSR.
- Add a lightweight automated test for alternate URL generation.
- Add a generated sitemap for the 81 current static pages.
