import { localizedPath } from "@/i18n/paths";
import type { MetadataRoute } from "next";

import { isIndexable, siteUrl } from "@/config/site";
import { routing } from "@/i18n/routing";

export default function robots(): MetadataRoute.Robots {
  if (!isIndexable || !siteUrl) return { rules: { userAgent: "*", disallow: "/" } };

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api",
        ...routing.locales.map((locale) => localizedPath(locale, "/checkout")),
        ...["admin", "checkout", "cart", "account"].flatMap((path) => [
          `/${path}`,
          ...routing.locales.map((locale) => `/${locale}/${path}`),
        ]),
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
