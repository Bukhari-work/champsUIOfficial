// src/middleware.ts
import { defineMiddleware } from "astro:middleware";

// Your i18n configuration from astro.config.mjs
const i18n = {
  defaultLocale: "en",
  locales: ["en", "id"],
};

/**
 * Determines the best locale based on the Accept-Language header or falls back to default.
 */
function getPreferredLocale(
  requestHeaders: Headers,
  config: typeof i18n,
): string {
  // 1. Check the Accept-Language header
  const acceptLanguage = requestHeaders.get("accept-language");
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().substring(0, 2));
    for (const lang of languages) {
      if (config.locales.includes(lang)) {
        return lang;
      }
    }
  }

  // 2. Fallback to the default locale
  return config.defaultLocale;
}

export const onRequest = defineMiddleware((context, next) => {
  // Corrected: Removed 'origin' as it's not needed.
  const { pathname } = context.url;

  // Skip assets and API routes from localization
  if (pathname.startsWith("/_astro/") || pathname.startsWith("/api/")) {
    return next();
  }

  // Check if the path is already localized
  const pathParts = pathname.split("/").filter(Boolean);
  const langInPath = pathParts[0];

  if (i18n.locales.includes(langInPath)) {
    return next();
  }

  // If not, detect the preferred locale from browser headers and redirect
  const preferredLocale = getPreferredLocale(context.request.headers, i18n);
  const newPath = `/${preferredLocale}${pathname}`;

  return context.redirect(newPath, 308);
});
