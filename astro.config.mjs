// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Sitio 100 % estatico. `format: 'file'` genera index.html, privacidad.html y
// 404.html en la raiz de dist/, igual que el sitio anterior: vercel.json
// (cleanUrls, trailingSlash) sigue valiendo sin cambios y ninguna URL cambia.
export default defineConfig({
  site: 'https://ordenfinanciero.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  integrations: [
    sitemap({
      // La pagina post-agenda (diagnostico.ordenfinanciero.com) y el 404 no
      // compiten con la home en Google: fuera del sitemap.
      filter: (page) => !page.endsWith('/diagnostico') && !page.endsWith('/404'),
    }),
  ],
  vite: { plugins: [tailwindcss()] },
});
