import { getCollection, type CollectionEntry } from 'astro:content';
import { localePathByCode, localePaths, type LocalePath } from './i18n';

export type Category = CollectionEntry<'categories'>;

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
