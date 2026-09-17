import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { isIndexable, siteConfig, siteUrl } from "@/config/site";
import { routing } from "@/i18n/routing";

import "../globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "Meta" });
  const canonical = `/${locale}`;
  const languages = Object.fromEntries(routing.locales.map((code) => [code, `/${code}`]));

  return {
    metadataBase: new URL(siteUrl ?? "http://localhost:3000"),
    title: {
      default: t("title", { name: siteConfig.restaurant.name }),
      template: `%s | ${siteConfig.restaurant.name}`,
    },
    description: t("description", { name: siteConfig.restaurant.name }),
    applicationName: siteConfig.restaurant.name,
    alternates: {
      canonical,
      languages: { ...languages, "x-default": `/${routing.defaultLocale}` },
    },
    robots: { index: isIndexable, follow: isIndexable },
    openGraph: {
      type: "website",
      locale,
      siteName: siteConfig.restaurant.name,
      title: t("title", { name: siteConfig.restaurant.name }),
      description: t("description", { name: siteConfig.restaurant.name }),
      url: canonical,
    },
    twitter: { card: "summary", title: t("title", { name: siteConfig.restaurant.name }) },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
