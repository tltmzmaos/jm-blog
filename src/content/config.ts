import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Anonymous'),
    draft: z.boolean().default(false),
    featured: z.boolean().default(false),
  }),
});

const series = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    dir: z.string(),
    status: z.enum(['complete', 'ongoing']),
    sortBy: z.enum(['part', 'date']).default('part'),
    featured: z.boolean().default(true),
  }),
});

export const collections = { blog, series };
