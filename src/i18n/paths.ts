import { categoryQueryKey } from "./category-query";
import { siteConfig } from "@/config/site";

export type AppLocale = (typeof siteConfig.locale.supported)[number];
export const pathnames = {
  "/": "/",
  "/products/[slug]": {
    sr: "/proizvodi/[slug]",
    en: "/products/[slug]",
    hu: "/termekek/[slug]",
    de: "/produkte/[slug]",
    ru: "/produkty/[slug]",
  },
  "/checkout": {
    sr: "/porucivanje",
    en: "/checkout",
    hu: "/penztar",
    de: "/kasse",
    ru: "/oformlenie-zakaza",
  },
  "/info/contact": {
    sr: "/informacije/kontakt",
    en: "/info/contact",
    hu: "/informaciok/kapcsolat",
    de: "/informationen/kontakt",
    ru: "/informatsiya/kontakty",
  },
  "/info/privacy": {
    sr: "/informacije/privatnost",
    en: "/info/privacy",
    hu: "/informaciok/adatvedelem",
    de: "/informationen/datenschutz",
    ru: "/informatsiya/konfidentsialnost",
  },
  "/info/cookies": {
    sr: "/informacije/kolacici",
    en: "/info/cookies",
    hu: "/informaciok/sutik",
    de: "/informationen/cookies",
    ru: "/informatsiya/fayly-cookie",
  },
  "/info/terms": {
    sr: "/informacije/uslovi-koriscenja",
    en: "/info/terms",
    hu: "/informaciok/felhasznalasi-feltetelek",
    de: "/informationen/nutzungsbedingungen",
    ru: "/informatsiya/usloviya-ispolzovaniya",
  },
} as const;
export type StaticPath = Exclude<keyof typeof pathnames, "/products/[slug]">;
export function localizedPath(locale: AppLocale, route: StaticPath): string;
export function localizedPath(locale: AppLocale, route: "/products/[slug]", slug: string): string;
export function localizedPath(locale: AppLocale, route: keyof typeof pathnames, slug?: string) {
  const entry = pathnames[route];
  const path = typeof entry === "string" ? entry : entry[locale];
  return `/${locale}${path === "/" ? "" : path.replace("[slug]", encodeURIComponent(slug ?? ""))}`;
}
export function categoryPath(locale: AppLocale, slug: string) {
  return `${localizedPath(locale, "/")}?${categoryQueryKey(locale)}=${encodeURIComponent(slug)}`;
}
export function manifestPath(locale: AppLocale) {
  return `/${locale}/manifest.webmanifest`;
}
