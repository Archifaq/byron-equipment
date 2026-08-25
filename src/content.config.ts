import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const strings = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/strings' }),
  schema: z.object({
    locale: z.enum(['en-US', 'en-GB', 'pl']),
    terminology: z.object({
      rent: z.string(),
      rental: z.string(),
      quote: z.string(),
      requestForQuote: z.string(),
      categories: z.string(),
      equipment: z.string(),
      availability: z.string(),
      deposit: z.string().optional(),
      operatorIncluded: z.string().optional(),
      selfOperated: z.string().optional(),
      dailyRate: z.string().optional(),
      weeklyRate: z.string().optional(),
      monthlyRate: z.string().optional(),
      minimumRentalPeriod: z.string().optional(),
      deliveryAvailable: z.string().optional(),
      pickupAvailable: z.string().optional(),
      damageWaiver: z.string().optional(),
      fuelPolicy: z.string().optional(),
    }),
    navigation: z.object({
      home: z.string(),
      categories: z.string(),
      rfq: z.string(),
    }),
    market: z.object({
      headline: z.string(),
      subheadline: z.string(),
      cta: z.string(),
    }),
  }),
});

const categories = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/categories' }),
  schema: z.object({
    locale: z.enum(['en-US', 'en-GB', 'pl']),
    categoryId: z.string(),
    title: z.string(),
    description: z.string().max(180),
    localizedSlug: z.string(),
    ogImage: z.string().optional(),
    parent: reference('categories').optional(),
    seo: z.object({
      title: z.string(),
      description: z.string().max(180),
    }),
  }),
});

export const collections = {
  strings,
  categories,
};
