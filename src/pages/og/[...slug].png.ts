import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { shouldShowDrafts } from '../../utils/env';
import { renderOgImage } from '../../utils/ogImage';

export const getStaticPaths: GetStaticPaths = async () => {
  const showDrafts = shouldShowDrafts();
  const posts = await getCollection('blog');
  const visible = posts.filter((post) => showDrafts || !post.data.draft);
  return visible.map((post) => ({
    params: { slug: post.id },
    props: {
      title: post.data.title,
      tags: post.data.tags,
    },
  }));
};

export const GET: APIRoute = async ({ props }) => {
  const { title, tags } = props as { title: string; tags: string[] };
  return renderOgImage({ title, tags });
};
