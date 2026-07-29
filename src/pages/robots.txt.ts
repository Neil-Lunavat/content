import type { APIRoute } from "astro";

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site?.toString() ?? "https://neillunavat.com";
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /logs/write\nDisallow: /api/\n\nSitemap: ${siteUrl}sitemap.xml\n`,
    { headers: { "Content-Type": "text/plain" } }
  );
};
