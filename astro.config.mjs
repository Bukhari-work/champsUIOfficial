// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  adapter: vercel({ imageService: false, maxDuration: 60 }),
  // Preserve the HTML whitespace behavior used before Astro 7.
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
  },
  vite: {
    plugins: [tailwindcss()],
    server: { watch: { ignored: ["**/.vercel/**"] } },
  },

  integrations: [mdx(), react()],
  i18n: {
    locales: ["id", "en"],
    defaultLocale: "en",
  },
});
