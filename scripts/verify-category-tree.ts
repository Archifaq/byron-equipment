import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import YAML from 'yaml';

type LanguageCode = 'en-US' | 'en-GB' | 'pl';

interface CategoryTreeLocale {
  localizedSlug: string;
  title: string;
}

interface CategoryTreeEntry {
  categoryId: string;
  parentCategoryId: string | null;
  locales: Partial<Record<LanguageCode, CategoryTreeLocale>>;
}

interface CategoryTree {
  categories: CategoryTreeEntry[];
}

interface CategoryFrontmatter {
  locale: LanguageCode;
  categoryId: string;
  title: string;
  description: string;
  localizedSlug: string;
  parent?: string;
  ogImage?: string;
  seo: {
    title: string;
    description: string;
  };
}

interface CategoryEntry {
  file: string;
  locale: LanguageCode;
  entryId: string;
  categoryId: string;
  localizedSlug: string;
  parent: string | null;
}

interface Issue {
  lines: string[];
}

interface SitemapEntry {
  loc: string;
  alternates: Map<string, string>;
}

interface HtmlEntry {
  canonical: string | null;
  alternates: Map<string, string>;
}

const locales: LanguageCode[] = ['en-US', 'en-GB', 'pl'];
const categoriesRoot = 'src/content/categories';
const site = 'https://byronequipment.com';
const sitemapPath = 'dist/sitemap-index.xml';
const categoryPathPattern = /^\/(?:uk\/|pl\/)?[^/]+\/$/;
const localeByFolder: Record<string, LanguageCode> = {
  'en-us': 'en-US',
  uk: 'en-GB',
  pl: 'pl',
};

function readJson(filePath: string): CategoryTree {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as CategoryTree;
}

function getMdxFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        return getMdxFiles(entryPath);
      }

      return entry.isFile() && entry.name.endsWith('.mdx') ? [entryPath] : [];
    })
    .sort();
}

function getEntryId(filePath: string): string {
  const relativePath = path.relative(categoriesRoot, filePath).split(path.sep).join('/');
  const parts = relativePath.split('/');

  if (parts.length < 2) {
    throw new Error(`Category MDX file must be inside a locale directory: ${filePath}`);
  }

  parts[0] = parts[0].toLowerCase();

  return parts.join('/').replace(/\.mdx$/, '');
}

function getExpectedLocale(filePath: string): LanguageCode {
  const localeFolder = path.relative(categoriesRoot, filePath).split(path.sep)[0]?.toLowerCase();
  const locale = localeFolder ? localeByFolder[localeFolder] : undefined;

  if (!locale) {
    throw new Error(`Unsupported category locale folder in file path: ${filePath}`);
  }

  return locale;
}

function getFrontmatterBlock(filePath: string): string {
  const file = fs.readFileSync(filePath, 'utf8');
  const match = file.match(/^---\r?\n([\s\S]*?)\r?\n---/);

  if (!match) {
    throw new Error(`Missing frontmatter block: ${filePath}`);
  }

  return match[1];
}

function assertString(value: unknown, field: string, filePath: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Invalid or missing ${field} in ${filePath}`);
  }

  return value;
}

function assertOptionalString(value: unknown, field: string, filePath: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return assertString(value, field, filePath);
}

function assertMaxLength(value: string, field: string, maxLength: number, filePath: string): void {
  if (value.length > maxLength) {
    throw new Error(`Invalid ${field} length in ${filePath}: expected <= ${maxLength}, actual ${value.length}`);
  }
}

function parseCategoryFrontmatter(filePath: string): CategoryFrontmatter {
  const parsed = YAML.parse(getFrontmatterBlock(filePath)) as Record<string, unknown> | null;

  if (!parsed || typeof parsed !== 'object') {
    throw new Error(`Invalid frontmatter object: ${filePath}`);
  }

  const expectedLocale = getExpectedLocale(filePath);
  const locale = assertString(parsed.locale, 'locale', filePath) as LanguageCode;

  if (!locales.includes(locale)) {
    throw new Error(`Invalid locale in ${filePath}: ${locale}`);
  }

  if (locale !== expectedLocale) {
    throw new Error(`Locale mismatch in ${filePath}: expected ${expectedLocale}, actual ${locale}`);
  }

  const description = assertString(parsed.description, 'description', filePath);
  assertMaxLength(description, 'description', 180, filePath);

  const seo = parsed.seo;

  if (!seo || typeof seo !== 'object' || Array.isArray(seo)) {
    throw new Error(`Invalid or missing seo in ${filePath}`);
  }

  const seoRecord = seo as Record<string, unknown>;
  const seoDescription = assertString(seoRecord.description, 'seo.description', filePath);
  assertMaxLength(seoDescription, 'seo.description', 180, filePath);

  return {
    locale,
    categoryId: assertString(parsed.categoryId, 'categoryId', filePath),
    title: assertString(parsed.title, 'title', filePath),
    description,
    localizedSlug: assertString(parsed.localizedSlug, 'localizedSlug', filePath),
    parent: assertOptionalString(parsed.parent, 'parent', filePath),
    ogImage: assertOptionalString(parsed.ogImage, 'ogImage', filePath),
    seo: {
      title: assertString(seoRecord.title, 'seo.title', filePath),
      description: seoDescription,
    },
  };
}

function loadMdxCategories(): CategoryEntry[] {
  return getMdxFiles(categoriesRoot).map((file) => {
    const frontmatter = parseCategoryFrontmatter(file);

    return {
      file,
      locale: frontmatter.locale,
      entryId: getEntryId(file),
      categoryId: frontmatter.categoryId,
      localizedSlug: frontmatter.localizedSlug,
      parent: frontmatter.parent ?? null,
    };
  });
}

function printSection(title: string, issues: Issue[]): void {
  console.log(`=== ${title} (${issues.length}) ===`);

  for (const issue of issues) {
    for (const line of issue.lines) {
      console.log(`  ${line}`);
    }
  }
}

function parseAttributes(tag: string): Map<string, string> {
  const attributes = new Map<string, string>();
  const attributePattern = /([\w:-]+)="([^"]*)"/g;
  let match: RegExpExecArray | null;

  while ((match = attributePattern.exec(tag)) !== null) {
    attributes.set(match[1], match[2]);
  }

  return attributes;
}

function parseSitemap(xml: string): SitemapEntry[] {
  const entries: SitemapEntry[] = [];
  const urlPattern = /<url>([\s\S]*?)<\/url>/g;
  let match: RegExpExecArray | null;

  while ((match = urlPattern.exec(xml)) !== null) {
    const loc = match[1].match(/<loc>(.*?)<\/loc>/)?.[1] ?? '';
    const alternates = new Map<string, string>();
    const linkPattern = /<xhtml:link\b[^>]*>/g;
    let linkMatch: RegExpExecArray | null;

    while ((linkMatch = linkPattern.exec(match[1])) !== null) {
      const attributes = parseAttributes(linkMatch[0]);
      const hreflang = attributes.get('hreflang');
      const href = attributes.get('href');

      if (hreflang && href) {
        alternates.set(hreflang, href);
      }
    }

    entries.push({ loc, alternates });
  }

  return entries;
}

function urlToHtmlPath(url: string): string {
  const parsedUrl = new URL(url);
  const pathname = parsedUrl.pathname === '/' ? '/index.html' : `${parsedUrl.pathname}index.html`;

  return path.join('dist', pathname);
}

function parseHtml(html: string): HtmlEntry {
  const canonicalTag = html.match(/<link\b[^>]*rel="canonical"[^>]*>/)?.[0] ?? null;
  const canonical = canonicalTag ? parseAttributes(canonicalTag).get('href') ?? null : null;
  const alternates = new Map<string, string>();
  const linkPattern = /<link\b[^>]*rel="alternate"[^>]*>/g;
  let match: RegExpExecArray | null;

  while ((match = linkPattern.exec(html)) !== null) {
    const attributes = parseAttributes(match[0]);
    const hreflang = attributes.get('hreflang');
    const href = attributes.get('href');

    if (hreflang && href && hreflang !== 'x-default') {
      alternates.set(hreflang, new URL(href, site).href);
    }
  }

  return { canonical, alternates };
}

function verifySeoOutput(): number {
  if (!fs.existsSync(sitemapPath)) {
    throw new Error(`Missing sitemap output: ${sitemapPath}`);
  }

  const sitemapEntries = parseSitemap(fs.readFileSync(sitemapPath, 'utf8'));
  const categoryEntries = sitemapEntries.filter((entry) => {
    const pathname = new URL(entry.loc).pathname;

    return categoryPathPattern.test(pathname) && pathname !== '/uk/' && pathname !== '/pl/';
  });
  const canonicalMismatch: Issue[] = [];
  const alternateMismatch: Issue[] = [];
  const missingHtml: Issue[] = [];

  for (const sitemapEntry of categoryEntries) {
    const htmlPath = urlToHtmlPath(sitemapEntry.loc);

    if (!fs.existsSync(htmlPath)) {
      missingHtml.push({
        lines: [`url=${sitemapEntry.loc}`, `file=${htmlPath}`],
      });
      continue;
    }

    const htmlEntry = parseHtml(fs.readFileSync(htmlPath, 'utf8'));

    if (htmlEntry.canonical !== sitemapEntry.loc) {
      canonicalMismatch.push({
        lines: [
          `url=${sitemapEntry.loc}`,
          `expectedCanonical=${sitemapEntry.loc}`,
          `actualCanonical=${htmlEntry.canonical ?? '(missing)'}`,
          `file=${htmlPath}`,
        ],
      });
    }

    for (const [hreflang, href] of sitemapEntry.alternates) {
      const actualHref = htmlEntry.alternates.get(hreflang);

      if (actualHref !== href) {
        alternateMismatch.push({
          lines: [
            `url=${sitemapEntry.loc}`,
            `hreflang=${hreflang}`,
            `expectedHref=${href}`,
            `actualHref=${actualHref ?? '(missing)'}`,
            `file=${htmlPath}`,
          ],
        });
      }
    }

    for (const [hreflang, href] of htmlEntry.alternates) {
      const expectedHref = sitemapEntry.alternates.get(hreflang);

      if (expectedHref !== href) {
        alternateMismatch.push({
          lines: [
            `url=${sitemapEntry.loc}`,
            `hreflang=${hreflang}`,
            `expectedHref=${expectedHref ?? '(missing in sitemap)'}`,
            `actualHref=${href}`,
            `file=${htmlPath}`,
          ],
        });
      }
    }
  }

  const totalIssues = canonicalMismatch.length + alternateMismatch.length + missingHtml.length;

  printSection('MISSING HTML', missingHtml);
  printSection('CANONICAL MISMATCH', canonicalMismatch);
  printSection('HREFLANG/SITEMAP MISMATCH', alternateMismatch);
  console.log('');
  console.log(`SUMMARY: ${totalIssues} SEO output mismatch found across ${categoryEntries.length} category pages.`);
  console.log(`EXIT CODE: ${totalIssues === 0 ? 0 : 1}`);

  return totalIssues;
}

function verifyCategoryTree(tree: CategoryTree, mdxEntries: CategoryEntry[]): number {
  const treeByCategoryId = new Map(tree.categories.map((entry) => [entry.categoryId, entry]));
  const mdxByLocaleAndCategoryId = new Map(
    mdxEntries.map((entry) => [`${entry.locale}:${entry.categoryId}`, entry]),
  );
  const mdxByEntryId = new Map(mdxEntries.map((entry) => [entry.entryId, entry]));

  const missingInTree: Issue[] = [];
  const missingInMdx: Issue[] = [];
  const slugMismatch: Issue[] = [];
  const parentMismatch: Issue[] = [];
  const danglingParentCategoryId: Issue[] = [];
  const duplicateCategoryId: Issue[] = [];

  for (const entry of mdxEntries) {
    if (!treeByCategoryId.has(entry.categoryId)) {
      missingInTree.push({
        lines: [
          `categoryId=${entry.categoryId} locale=${entry.locale}`,
          `entryId=${entry.entryId}`,
          `file=${entry.file}`,
        ],
      });
    }
  }

  for (const treeEntry of tree.categories) {
    if (treeEntry.parentCategoryId && !treeByCategoryId.has(treeEntry.parentCategoryId)) {
      danglingParentCategoryId.push({
        lines: [
          `categoryId=${treeEntry.categoryId}`,
          `parentCategoryId=${treeEntry.parentCategoryId}`,
        ],
      });
    }

    for (const locale of locales) {
      const treeLocale = treeEntry.locales[locale];
      const mdxEntry = mdxByLocaleAndCategoryId.get(`${locale}:${treeEntry.categoryId}`);

      if (!treeLocale) {
        missingInMdx.push({
          lines: [
            `categoryId=${treeEntry.categoryId} locale=${locale}`,
            'expected=locale block in category-tree.json',
            'actual=missing locale block in category-tree.json',
          ],
        });
        continue;
      }

      if (!mdxEntry) {
        missingInMdx.push({
          lines: [
            `categoryId=${treeEntry.categoryId} locale=${locale}`,
            `expected=MDX entry with localizedSlug="${treeLocale.localizedSlug}"`,
            'actual=missing MDX frontmatter entry',
          ],
        });
        continue;
      }

      if (mdxEntry.localizedSlug !== treeLocale.localizedSlug) {
        slugMismatch.push({
          lines: [
            `categoryId=${treeEntry.categoryId} locale=${locale} expected="${treeLocale.localizedSlug}" actual="${mdxEntry.localizedSlug}"`,
            `entryId=${mdxEntry.entryId}`,
            `file=${mdxEntry.file}`,
          ],
        });
      }

      const expectedParentCategoryId = treeEntry.parentCategoryId;
      let actualParentCategoryId: string | null = null;

      if (mdxEntry.parent) {
        const actualParentEntry = mdxByEntryId.get(mdxEntry.parent);
        actualParentCategoryId = actualParentEntry?.categoryId ?? null;
      }

      if (actualParentCategoryId !== expectedParentCategoryId) {
        parentMismatch.push({
          lines: [
            `categoryId=${treeEntry.categoryId} locale=${locale}`,
            `expectedParentCategoryId=${expectedParentCategoryId ?? 'null'} actualParentCategoryId=${actualParentCategoryId ?? 'null'}`,
            `parent=${mdxEntry.parent ?? '(absent)'}`,
            `entryId=${mdxEntry.entryId}`,
            `file=${mdxEntry.file}`,
          ],
        });
      }
    }
  }

  for (const locale of locales) {
    const seen = new Map<string, CategoryEntry[]>();

    for (const entry of mdxEntries.filter((item) => item.locale === locale)) {
      seen.set(entry.categoryId, [...(seen.get(entry.categoryId) ?? []), entry]);
    }

    for (const [categoryId, entries] of seen) {
      if (entries.length > 1) {
        duplicateCategoryId.push({
          lines: [
            `categoryId=${categoryId} locale=${locale}`,
            `entries=${entries.map((entry) => entry.entryId).join(', ')}`,
            `files=${entries.map((entry) => entry.file).join(', ')}`,
          ],
        });
      }
    }
  }

  const totalIssues =
    missingInTree.length +
    missingInMdx.length +
    slugMismatch.length +
    parentMismatch.length +
    danglingParentCategoryId.length +
    duplicateCategoryId.length;

  printSection('MISSING IN TREE', missingInTree);
  printSection('MISSING IN MDX', missingInMdx);
  printSection('SLUG MISMATCH', slugMismatch);
  printSection('PARENT MISMATCH', parentMismatch);
  printSection('DANGLING parentCategoryId', danglingParentCategoryId);
  printSection('DUPLICATE categoryId', duplicateCategoryId);
  console.log('');
  console.log(`SUMMARY: ${totalIssues} mismatch found across ${tree.categories.length} tree entries / ${mdxEntries.length} MDX files.`);
  console.log(`EXIT CODE: ${totalIssues === 0 ? 0 : 1}`);

  return totalIssues;
}

function main(): void {
  const tree = readJson('category-tree.json');
  const mdxEntries = loadMdxCategories();
  const categoryIssues = verifyCategoryTree(tree, mdxEntries);

  console.log('');

  const seoIssues = verifySeoOutput();

  process.exitCode = categoryIssues + seoIssues === 0 ? 0 : 1;
}

try {
  main();
} catch (error: unknown) {
  console.error(error);
  process.exitCode = 1;
}
