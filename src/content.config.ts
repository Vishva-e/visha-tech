import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string().min(10).max(110),
    description: z.string().min(40).max(190),
    category: z.enum(['laptops','developer-gear','smartphones','audio','storage','work-from-home']),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    reviewType: z.enum(['desk-research', 'hands-on']),
    readMinutes: z.number().int().min(1).max(60),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    references: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
  })
});
export const collections = { guides };
