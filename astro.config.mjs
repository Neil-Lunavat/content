import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://neillunavat.com',
  // Pages stay prerendered by default; the /logs routes opt in to SSR
  // individually with `export const prerender = false`.
  output: 'static',
  adapter: cloudflare(),
  integrations: [
    sitemap({ filter: (page) => !page.includes("/logs/write") }),
    mdx(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
