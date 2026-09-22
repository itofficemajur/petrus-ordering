import { siteUrl } from "@/config/site";
import { localizedPath, type AppLocale, type StaticPath } from "./paths";
import { routing } from "./routing";
export function staticPageAlternates(locale: AppLocale, route: StaticPath) {
  const url = (code: AppLocale) => `${siteUrl ?? ""}${localizedPath(code, route)}`;
  const languages: Record<string, string> = Object.fromEntries(
    routing.locales.map((code) => [code, url(code)]),
  );
  return {
    canonical: url(locale),
    languages: {
      ...languages,
      "x-default": url(routing.defaultLocale),
    } as Record<string, string>,
  };
}
