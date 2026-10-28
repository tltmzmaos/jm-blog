import type { APIRoute } from 'astro';
import { SITE_DESCRIPTION } from '../utils/site';
import { renderOgImage } from '../utils/ogImage';

// Card for pages that aren't posts (home, about, tags, series).
export const GET: APIRoute = () => renderOgImage({ title: SITE_DESCRIPTION });
