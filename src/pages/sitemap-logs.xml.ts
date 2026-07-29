import type { APIRoute } from "astro";
import { getEnv, requireEnv } from "../lib/env";
import { readLogs } from "../lib/sheets";

// Logs live in a sheet, so their URLs aren't knowable at build time.
export const prerender = false;

export const GET: APIRoute = async ({ site, locals }) => {
  const base = (site?.toString() ?? "https://neillunavat.com/").replace(/\/$/, "");

  let entries: { loc: string; lastmod: string }[] = [];

  try {
    const env = getEnv(locals);
    requireEnv(env);
    entries = (await readLogs(env)).map((log) => ({
      loc: `${base}/logs/${log.number}`,
      lastmod: Number.isNaN(log.date.getTime())
        ? new Date().toISOString()
        : log.date.toISOString(),
    }));
  } catch {
    // A sheet outage shouldn't hand Google a 500 — an empty sitemap just means
    // "nothing new here", and the next crawl picks the logs back up.
    entries = [];
  }

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map((e) => `  <url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod></url>`)
  .join("\n")}
</urlset>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
