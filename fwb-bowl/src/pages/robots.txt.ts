// robots.txt follows preview mode: block everything while this is a concept,
// open it up (and point to the sitemap) once previewMode is false.
import type { APIRoute } from 'astro';
import { business, previewMode } from '../data/site';

export const GET: APIRoute = () => {
  const body = previewMode
    ? 'User-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${business.siteUrl}/sitemap-index.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
