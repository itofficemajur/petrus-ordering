import type { AppLocale } from "./paths";

export const categoryQueryKeys = {
  sr: "kategorija",
  en: "category",
  hu: "kategoria",
  de: "kategorie",
  ru: "kategoriya",
} as const satisfies Record<AppLocale, string>;

export function categoryQueryKey(locale: string) {
  return categoryQueryKeys[locale as AppLocale] ?? categoryQueryKeys.en;
}

export function readCategoryQuery(params: URLSearchParams, locale: string) {
  return (
    params.get(categoryQueryKey(locale)) ??
    Object.values(categoryQueryKeys)
      .map((key) => params.get(key))
      .find((value) => value !== null) ??
    null
  );
}

export function setCategoryQuery(params: URLSearchParams, locale: string, slug: string) {
  for (const key of Object.values(categoryQueryKeys)) params.delete(key);
  params.set(categoryQueryKey(locale), slug);
}
