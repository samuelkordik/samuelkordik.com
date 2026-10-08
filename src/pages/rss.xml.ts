import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { site } from '../data/site';

export async function GET(context: APIContext) {
  const posts = (await getCollection('writing', (e) => !e.data.draft)).sort((a, b) => +b.data.pubDate - +a.data.pubDate);
  return rss({
    title: `${site.name}: Writing`,
    description: site.description,
    site: context.site!,
    items: posts.map((p) => ({ title: p.data.title, description: p.data.description, pubDate: p.data.pubDate, link: `/writing/${p.id}/` })),
  });
}
