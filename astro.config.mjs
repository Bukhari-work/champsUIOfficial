// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  // Preserve the HTML whitespace behavior used before Astro 7.
  compressHTML: true,
  prefetch: {
    prefetchAll: true,
  },
  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
  i18n: {
    locales: ["id", "en"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
    },
  },
});
