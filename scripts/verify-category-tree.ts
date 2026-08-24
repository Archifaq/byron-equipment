import fs from 'node:fs';
import process from 'node:process';
// Internal Astro API, not a public contract. When updating Astro, verify this path still resolves.
import { MutableDataStore } from '../node_modules/astro/dist/content/mutable-data-store.js';

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

interface ContentReference {
  id: string;
  collection: string;
}

interface AstroCategoryEntry {
  id: string;
  data: {
    locale: LanguageCode;
    categoryId: string;
    localizedSlug: string;
    parent?: ContentReference | string;
  };
  filePath?: string;
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

const locales: LanguageCode[] = ['en-US', 'en-GB', 'pl'];
const dataStorePath = new URL('../node_modules/.astro/data-store.json', import.meta.url);

function readJson(filePath: string): CategoryTree {
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as CategoryTree;
}

function normalizeParent(parent: ContentReference | string | undefined): string | null {
  if (!parent) {
    return null;
  }

  if (typeof parent === 'string') {
    return parent;
  }

  return parent.id;
}

async function loadMdxCategories(): Promise<CategoryEntry[]> {
  if (!fs.existsSync(dataStorePath)) {
    throw new Error(
      'Missing Astro content data store at node_modules/.astro/data-store.json. Run `astro build` or `astro sync` before `npm run verify:category-tree`.',
    );
  }

  const store = await MutableDataStore.fromFile(dataStorePath);
  const entries = store.values('categories') as AstroCategoryEntry[];

  return entries
    .map((entry) => {
      if (!entry.data.categoryId || !entry.data.localizedSlug || !entry.data.locale) {
        throw new Error(`Missing categoryId, localizedSlug, or locale in content entry: ${entry.id}`);
      }

      return {
        file: entry.filePath ?? `(no filePath for ${entry.id})`,
        locale: entry.data.locale,
        entryId: entry.id,
        categoryId: entry.data.categoryId,
        localizedSlug: entry.data.localizedSlug,
        parent: normalizeParent(entry.data.parent),
      };
    })
    .sort((a, b) => a.file.localeCompare(b.file));
}

function printSection(title: string, issues: Issue[]): void {
  console.log(`=== ${title} (${issues.length}) ===`);

  for (const issue of issues) {
    for (const line of issue.lines) {
      console.log(`  ${line}`);
    }
  }
}

async function main(): Promise<void> {
  const tree = readJson('category-tree.json');
  const mdxEntries = await loadMdxCategories();
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
            'actual=missing Astro content collection entry',
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
  console.log(`SUMMARY: ${totalIssues} mismatch found across ${tree.categories.length} tree entries / ${mdxEntries.length} Astro content collection entries.`);
  console.log(`EXIT CODE: ${totalIssues === 0 ? 0 : 1}`);

  process.exitCode = totalIssues === 0 ? 0 : 1;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
