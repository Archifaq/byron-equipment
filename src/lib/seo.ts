import type { CollectionEntry } from 'astro:content';
import { getAlternatePathsForCategory, getCategories, type CategoryLink } from './content';
import { getLocalizedPath, localeMeta, localePaths, type LocalePath } from './i18n';

export const defaultOgImagePath = '/images/byron-og-default.png';

export interface AlternateLink {
  hreflang: string;
  href: string;
}

export interface SitemapRoute {
  url: string;
  localePath: LocalePath;
  alternates: AlternateLink[];
}

type Category = CollectionEntry<'categories'>;

export function getAbsoluteUrl(site: URL | string, path: string): string {
  return new URL(path, site).href;
}

export function getOgLocale(localePath: LocalePath): string {
  const ogLocales: Record<LocalePath, string> = {
    'en-US': 'en_US',
    uk: 'en_GB',
    pl: 'pl_PL',
  };

  return ogLocales[localePath];
}

export function getOgImageUrl(site: URL | string, ogImage?: string): string {
  return getAbsoluteUrl(site, ogImage ?? defaultOgImagePath);
}

export function getAlternateLinks(site: URL | string, alternatePaths: Partial<Record<LocalePath, string>>): AlternateLink[] {
  return localePaths.flatMap((localePath) => {
    const slug = alternatePaths[localePath];

    if (slug === undefined) {
      return [];
    }

    return {
      hreflang: localeMeta[localePath].code,
      href: getAbsoluteUrl(site, getLocalizedPath(localePath, slug)),
    };
  });
}

export async function getSitemapRoutes(site: URL | string): Promise<SitemapRoute[]> {
  const homeAlternates = getAlternateLinks(site, { 'en-US': '', uk: '', pl: '' });
  const homeRoutes = localePaths.map((localePath) => ({
    url: getAbsoluteUrl(site, getLocalizedPath(localePath, '')),
    localePath,
    alternates: homeAlternates,
  }));

  const categoryGroups = await Promise.all(
    localePaths.map(async (localePath) => {
      const categories = await getCategories(localePath);

      return Promise.all(
        categories.map(async (category) => {
          const alternatePaths = await getAlternatePathsForCategory(category);

          return {
            url: getAbsoluteUrl(site, getLocalizedPath(localePath, category.data.localizedSlug)),
            localePath,
            alternates: getAlternateLinks(site, alternatePaths),
          };
        }),
      );
    }),
  );

  return [...homeRoutes, ...categoryGroups.flat()];
}

export function createOrganizationJsonLd(site: URL | string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ByronEquipment',
    url: getAbsoluteUrl(site, '/'),
  };
}

export function createCategoryServiceJsonLd(
  site: URL | string,
  category: Category,
  localePath: LocalePath,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: category.data.title,
    description: category.data.seo.description,
    serviceType: category.data.title,
    provider: {
      '@type': 'Organization',
      name: 'ByronEquipment',
      url: getAbsoluteUrl(site, '/'),
    },
    areaServed: {
      '@type': 'Country',
      name: localeMeta[localePath].market,
    },
    url: getAbsoluteUrl(site, getLocalizedPath(localePath, category.data.localizedSlug)),
  };
}

export function createBreadcrumbJsonLd(
  site: URL | string,
  localePath: LocalePath,
  breadcrumbs: CategoryLink[],
): Record<string, unknown> {
  const homeName = localePath === 'pl' ? 'Strona główna' : 'Home';
  const itemListElement = [
    {
      '@type': 'ListItem',
      position: 1,
      name: homeName,
      item: getAbsoluteUrl(site, getLocalizedPath(localePath, '')),
    },
    ...breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 2,
      name: breadcrumb.title,
      item: getAbsoluteUrl(site, breadcrumb.href),
    })),
  ];

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  };
}
