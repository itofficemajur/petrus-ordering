import type { MetadataRoute } from "next";

import { siteConfig } from "@/config/site";
import { routing } from "@/i18n/routing";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.restaurant.name,
    short_name: siteConfig.restaurant.name,
    description: `${siteConfig.restaurant.name} food ordering`,
    start_url: `/${routing.defaultLocale}`,
    scope: "/",
    display: "standalone",
    background_color: "#f7f5f0",
    theme_color: "#25221d",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
