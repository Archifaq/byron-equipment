export const localePaths = ['en-US', 'uk', 'pl'] as const;
export const languageCodes = ['en-US', 'en-GB', 'pl'] as const;

export type LocalePath = (typeof localePaths)[number];
export type LanguageCode = (typeof languageCodes)[number];

export const localeMeta: Record<LocalePath, { code: LanguageCode; label: string; market: string }> = {
  'en-US': {
    code: 'en-US',
    label: 'US',
    market: 'United States',
  },
  uk: {
    code: 'en-GB',
    label: 'UK',
    market: 'United Kingdom',
  },
  pl: {
    code: 'pl',
    label: 'PL',
    market: 'Polska',
  },
};

export const localePathByCode: Record<LanguageCode, LocalePath> = {
  'en-US': 'en-US',
  'en-GB': 'uk',
  pl: 'pl',
};

export function getCurrentLocalePath(url: URL): LocalePath {
  const firstSegment = url.pathname.split('/').filter(Boolean)[0];

  if (firstSegment === 'uk' || firstSegment === 'pl') {
    return firstSegment;
  }

  return 'en-US';
}

export function normalizeSlug(slug?: string | string[]): string {
  if (!slug) {
    return '';
  }

  return Array.isArray(slug) ? slug.join('/') : slug;
}
