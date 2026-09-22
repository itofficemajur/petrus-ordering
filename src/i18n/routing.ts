import { pathnames } from "./paths";
import { defineRouting } from "next-intl/routing";

import { siteConfig } from "@/config/site";

export const routing = defineRouting({
  locales: siteConfig.locale.supported,
  defaultLocale: siteConfig.locale.default,
  localePrefix: "always",
  pathnames,
  alternateLinks: false,
});
