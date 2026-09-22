import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { localizedPath, type AppLocale } from "@/i18n/paths";
import { getTranslations } from "next-intl/server";

export async function localizedManifest(locale: AppLocale): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations({ locale, namespace: "Meta" });
  return {
    id: "/",
    name: t("title", { name: siteConfig.restaurant.name }),
    short_name: "Petrus",
    description: t("description", { name: siteConfig.restaurant.name }),
    start_url: localizedPath(locale, "/"),
    scope: "/",
    display: "standalone",
    background_color: "#f7f5f0",
    theme_color: "#25221d",
    orientation: "portrait-primary",
    lang: locale,
    categories: ["food", "shopping", "lifestyle"],
    icons: [
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
