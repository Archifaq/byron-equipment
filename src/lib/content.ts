import { getCollection, type CollectionEntry } from 'astro:content';
import categoryTree from '../../category-tree.json';
import {
  getLocalizedPath,
  localeMeta,
  localePathByCode,
  localePaths,
  type LanguageCode,
  type LocalePath,
} from './i18n';

export type Category = CollectionEntry<'categories'>;

export interface CategoryTreeLocale {
  localizedSlug: string;
  title: string;
}

export interface CategoryTreeEntry {
  categoryId: string;
  parentCategoryId: string | null;
  locales: Record<LanguageCode, CategoryTreeLocale>;
}

interface CategoryTree {
  categories: CategoryTreeEntry[];
}

export interface CategoryLink {
  title: string;
  href: string;
}

const typedCategoryTree = categoryTree as CategoryTree;
const categoryTreeEntries = typedCategoryTree.categories;
const categoryTreeById = new Map(categoryTreeEntries.map((entry) => [entry.categoryId, entry]));

function getCategoryTreeEntry(categoryId: string): CategoryTreeEntry {
  const entry = categoryTreeById.get(categoryId);

  if (!entry) {
    throw new Error(`Missing category-tree.json entry for categoryId: ${categoryId}`);
  }

  return entry;
}

function getTreeLocale(entry: CategoryTreeEntry, localePath: LocalePath): CategoryTreeLocale {
  const languageCode = localeMeta[localePath].code;
  const locale = entry.locales[languageCode];

  if (!locale) {
    throw new Error(`Missing category-tree.json locale ${languageCode} for categoryId: ${entry.categoryId}`);
  }

  return locale;
}

function toCategoryLink(entry: CategoryTreeEntry, localePath: LocalePath): CategoryLink {
  const locale = getTreeLocale(entry, localePath);

  return {
    title: locale.title,
    href: getLocalizedPath(localePath, locale.localizedSlug),
  };
}

export async function getStrings(localePath: LocalePath) {
  const strings = await getCollection('strings');
  const languageCode = localePath === 'uk' ? 'en-GB' : localePath;
  const entry = strings.find((item) => item.data.locale === languageCode);

  if (!entry) {
    throw new Error(`Missing strings for locale: ${languageCode}`);
  }

  return entry.data;
}

export async function getCategories(localePath: LocalePath) {
  const categories = await getCollection('categories');

  return categories.filter((category) => localePathByCode[category.data.locale] === localePath);
}

export async function getCategoryBySlug(localePath: LocalePath, slug: string) {
  const categories = await getCategories(localePath);

  return categories.find((category) => category.data.localizedSlug === slug);
}

export async function getCategoryByCategoryId(categoryId: string, localePath: LocalePath) {
  const categories = await getCategories(localePath);

  return categories.find((category) => category.data.categoryId === categoryId);
}

export async function getAlternatePathsForCategory(category: Category) {
  const entries = await Promise.all(
    localePaths.map(async (localePath) => {
      const translatedCategory = await getCategoryByCategoryId(category.data.categoryId, localePath);

      return translatedCategory ? [localePath, translatedCategory.data.localizedSlug] : undefined;
    }),
  );

  return Object.fromEntries(entries.filter(Boolean) as Array<[LocalePath, string]>);
}

export function getBreadcrumbs(categoryId: string, localePath: LocalePath): CategoryLink[] {
  const breadcrumbs: CategoryTreeEntry[] = [];
  const seenCategoryIds = new Set<string>();
  let currentEntry: CategoryTreeEntry | undefined = getCategoryTreeEntry(categoryId);

  while (currentEntry) {
    if (seenCategoryIds.has(currentEntry.categoryId)) {
      throw new Error(`Circular category-tree.json parent chain detected at categoryId: ${currentEntry.categoryId}`);
    }

    seenCategoryIds.add(currentEntry.categoryId);
    breadcrumbs.unshift(currentEntry);

    currentEntry = currentEntry.parentCategoryId
      ? getCategoryTreeEntry(currentEntry.parentCategoryId)
      : undefined;
  }

  return breadcrumbs.map((entry) => toCategoryLink(entry, localePath));
}

export function getRelatedCategories(categoryId: string, localePath: LocalePath): CategoryLink[] {
  const currentEntry = getCategoryTreeEntry(categoryId);

  if (currentEntry.parentCategoryId === null) {
    return [];
  }

  return categoryTreeEntries
    .filter(
      (entry) =>
        entry.categoryId !== currentEntry.categoryId &&
        entry.parentCategoryId === currentEntry.parentCategoryId,
    )
    .map((entry) => toCategoryLink(entry, localePath));
}

export async function getLocalizedCategoryPaths() {
  const categories = await getCollection('categories');

  return categories.map((category) => ({
    params: {
      slug: category.data.localizedSlug,
    },
    props: {
      category,
      localePath: localePathByCode[category.data.locale],
    },
  }));
}
