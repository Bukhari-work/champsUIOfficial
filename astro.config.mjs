// @ts-check
import { defineConfig, fontProviders } from "astro/config";
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

  // Fonts are self-hosted from /_astro/fonts with metric-matched fallbacks.
  fonts: [
    {
      provider: fontProviders.local(),
      name: "Lexend",
      cssVariable: "--font-family-lexend",
      fallbacks: ["sans-serif"],
      options: {
        variants: [
          {
            // Google Fonts' latin subset; site copy uses no latin-ext characters.
            src: ["./src/assets/fonts/lexend/Lexend-latin.woff2"],
            weight: "100 900",
            style: "normal",
            unicodeRange: [
              "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
            ],
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Libron",
      cssVariable: "--font-family-libron",
      fallbacks: ["serif"],
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/libron/Libron-Regular.woff2"],
            weight: 400,
            style: "normal",
          },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: "Cinzel",
      cssVariable: "--font-family-cinzel",
      fallbacks: ["serif"],
      options: {
        variants: [
          {
            // Google Fonts' latin subset of the OFL Trajan-style capitals.
            src: ["./src/assets/fonts/cinzel/Cinzel-latin.woff2"],
            weight: 400,
            style: "normal",
            unicodeRange: [
              "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
            ],
          },
        ],
      },
    },
  ],

  integrations: [mdx(), react()],
  i18n: {
    locales: ["id", "en"],
    defaultLocale: "en",
  },
});
