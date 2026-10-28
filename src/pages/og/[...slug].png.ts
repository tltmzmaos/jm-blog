import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { shouldShowDrafts } from '../../utils/env';
import { renderOgImage } from '../../utils/ogImage';
import { numberEntries } from '../../utils/entryNumbers';

export const getStaticPaths: GetStaticPaths = async () => {
  const showDrafts = shouldShowDrafts();
  const posts = await getCollection('blog');
  const visible = posts.filter((post) => showDrafts || !post.data.draft);
  const entries = numberEntries(posts);
  return visible.map((post) => ({
    params: { slug: post.id },
    props: {
      title: post.data.title,
      tags: post.data.tags,
      entry: entries.get(post.id),
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, tags, entry } = props as {
    title: string;
    tags: string[];
    entry?: number;
  };
  return renderOgImage({ title, tags, entry });
};
