"use client";

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

export function LocaleSwitcher() {
  const id = useId();
  const locale = useLocale();
  const t = useTranslations("LocaleSwitcher");
  const pathname = usePathname();
  const router = useRouter();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = routing.locales.find((value) => value === event.target.value);
    if (!nextLocale || nextLocale === locale) return;

    router.replace(`${pathname}${window.location.search}${window.location.hash}`, {
      locale: nextLocale,
    });
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
          <option key={code} value={code}>
            {localeFlags[code]} {t(`locale.${code}`)}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 size-4" />
    </div>
  );
}
