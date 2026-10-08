import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Each entry is a folder (<collection>/<slug>/index.md) so its images sit beside it.
const entries = (base: string) => glob({ base: `./src/content/${base}`, pattern: '*/index.{md,mdx}', generateId: ({ entry }) => entry.split('/')[0] });

import type { SchemaContext } from 'astro:content';

const postSchema = ({ image }: SchemaContext) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      draft: z.boolean().default(false),
      wpUrl: z.url().optional(), // original WordPress URL (redirect source)
    });

const writing = defineCollection({ loader: entries('writing'), schema: postSchema });

// Long-lived reference pages (first aid kits, survival kits). Same shape as writing, shown under Teaching.
const guides = defineCollection({ loader: entries('guides'), schema: postSchema });

const media = z.enum(['data', 'design', 'photo', 'video', 'audio', 'research', 'code', 'workshop']);

const work = defineCollection({
  loader: entries('work'),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      year: z.number().int(),
      media: z.array(media).min(1),
      tools: z.array(z.string()).default([]),
      cover: image(),
      coverFit: z.enum(['cover', 'contain']).default('cover'),
      featured: z.boolean().default(false),
      order: z.number().default(99), // lower = earlier on the homepage
      links: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
      href: z.string().optional(), // card links here instead of a /work/<slug>/ page
      draft: z.boolean().default(false),
      wpUrl: z.url().optional(),
    }),
});

// Course pages: each lists its downloads, which live in public/teaching/<slug>/.
const courses = defineCollection({
  loader: entries('courses'),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    audience: z.string().optional(),
    updatedDate: z.coerce.date(),
    files: z.array(z.object({ label: z.string(), file: z.string(), size: z.string().optional() })).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { writing, guides, work, courses };
