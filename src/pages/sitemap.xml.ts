import type { APIRoute } from "astro";

/**
 * Search Console (and most people) expect /sitemap.xml. @astrojs/sitemap emits
 * sitemap-index.xml + sitemap-0.xml and can't be renamed, so this is the index
 * that ties both halves of the site together:
 *
 *   sitemap-0.xml     prerendered pages, generated at build time
 *   sitemap-logs.xml  /logs/N pages, which are SSR and so unknown at build time
 */
export const GET: APIRoute = ({ site }) => {
  const base = (site?.toString() ?? "https://neillunavat.com/").replace(/\/$/, "");

  const children = ["/sitemap-0.xml", "/sitemap-logs.xml"];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${children.map((path) => `  <sitemap><loc>${base}${path}</loc></sitemap>`).join("\n")}
</sitemapindex>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
