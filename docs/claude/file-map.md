# File Map for Claude

## Configuration

- `package.json`: npm scripts and dependencies
- `astro.config.mjs`: Astro integrations, static output, and i18n config
- `tsconfig.json`: strict Astro TypeScript config
- `tailwind.config.mjs`: Tailwind content paths and minimal theme tokens
- `.github/workflows/deploy.yml`: Cloudflare Pages CI workflow

## Content

- `src/content.config.ts`: content collection schemas
- `src/content/strings/en-US.json`: US terminology and UI strings
- `src/content/strings/en-GB.json`: UK terminology and UI strings
- `src/content/strings/pl.json`: Polish terminology and UI strings
- `src/content/categories/en-US/*.mdx`: US category content
- `src/content/categories/uk/*.mdx`: UK category content
- `src/content/categories/pl/*.mdx`: Polish category content

Current category counts:

- `src/content/categories/en-US/`: 26 MDX files
- `src/content/categories/uk/`: 26 MDX files
- `src/content/categories/pl/`: 26 MDX files

Content status:

- `en-US` category bodies are expanded with B2B rental guidance.
- `uk` and `pl` category bodies should be localized separately in future passes.
- Do not change category frontmatter during body-only content tasks unless explicitly requested.

## Locales and Content Helpers

- `src/lib/i18n.ts`: maps route paths to language codes
- `src/lib/content.ts`: loads strings, categories, slug lookups, and category translation lookups

## Components

- `src/layouts/Layout.astro`: page shell, canonical link, hreflang links, header/footer
- `src/components/Header.astro`: brand navigation and locale switcher
- `src/components/Footer.astro`: simple site footer
- `src/components/LocaleSwitcher.astro`: links to available translated versions
- `src/components/CategoryCard.astro`: category list card
- `src/components/HomeView.astro`: homepage content
- `src/components/CategoryView.astro`: category content and RFQ skeleton

## Routes

- `src/pages/index.astro`: US homepage
- `src/pages/[...slug].astro`: US category route with `getStaticPaths()`
- `src/pages/uk/[...slug].astro`: UK homepage and category route with `getStaticPaths()`
- `src/pages/pl/[...slug].astro`: Polish homepage and category route with `getStaticPaths()`

## Public SEO Files

- `public/robots.txt`
- `public/sitemap-index.xml`

## Generated or Local Files to Ignore

Do not upload or edit these as source of truth:

- `node_modules/`
- `dist/`
- `.astro/`
- `.DS_Store`
- `.wrangler/`
