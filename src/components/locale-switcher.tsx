"use client";

import { readCategoryQuery, setCategoryQuery } from "@/i18n/category-query";
import { useOptionalStorefront } from "@/components/storefront-provider";
import { ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useId, type ChangeEvent } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const localeFlags = {
  sr: "🇷🇸",
  hu: "🇭🇺",
  de: "🇩🇪",
  ru: "🇷🇺",
  en: "🇬🇧",
} as const;

export function LocaleSwitcher({
  productSlugs,
}: {
  productSlugs?: Partial<Record<(typeof routing.locales)[number], string>>;
}) {
  const id = useId();
  const locale = useLocale();
  const t = useTranslations("LocaleSwitcher");
  const pathname = usePathname();
  const router = useRouter();
  const storefront = useOptionalStorefront();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = routing.locales.find((value) => value === event.target.value);
    if (!nextLocale || nextLocale === locale) return;

    if (productSlugs) {
      const slug = productSlugs[nextLocale];
      if (slug)
        router.replace({ pathname: "/products/[slug]", params: { slug } }, { locale: nextLocale });
      return;
    }

    if (pathname === "/products/[slug]") return;
    const params = new URLSearchParams(window.location.search);
    const category =
      storefront?.selectedCategory?.localizedSlugs[nextLocale] ?? readCategoryQuery(params, locale);
    if (pathname === "/" && category) setCategoryQuery(params, nextLocale, category);
    const query = Object.fromEntries(params);
    router.replace(
      {
        pathname,
        query,
      },
      {
        locale: nextLocale,
      },
    );
  }

  return (
    <div className="relative inline-flex shrink-0 items-center">
      <label htmlFor={id} className="sr-only">
        {t("label")}
      </label>
      <select
        id={id}
        value={locale}
        onChange={handleChange}
        className="min-h-11 cursor-pointer appearance-none rounded-full border border-stone-300 bg-white py-2 pr-9 pl-3 text-sm font-medium text-stone-900 transition-colors hover:border-stone-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800"
      >
        {routing.locales.map((code) => (
          <option
            key={code}
            value={code}
            disabled={productSlugs !== undefined && !productSlugs[code]}
          >
            {localeFlags[code]} {t(`locale.${code}`)}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-4" />
    </div>
  );
}
