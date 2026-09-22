import { localizedPath, manifestPath } from "@/i18n/paths";
import type { Metadata, Viewport } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { isIndexable, siteConfig, siteUrl } from "@/config/site";
import { SiteFooter } from "@/components/site-footer";
import { routing } from "@/i18n/routing";

import "../globals.css";

export const viewport: Viewport = { themeColor: "#25221d" };

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
  const canonical = localizedPath(locale, "/");
  const languages = Object.fromEntries(
    routing.locales.map((code) => [code, localizedPath(code, "/")]),
  );

  return {
    metadataBase: new URL(siteUrl ?? "http://localhost:3000"),
    title: {
      default: t("title", { name: siteConfig.restaurant.name }),
      template: `%s | ${siteConfig.restaurant.name}`,
    },
    description: t("description", { name: siteConfig.restaurant.name }),
    manifest: manifestPath(locale),
    icons: {
      icon: [{ url: "/favicon.png", sizes: "32x32", type: "image/png" }],
      apple: "/apple-touch-icon.png",
    },
    appleWebApp: { capable: true, statusBarStyle: "default", title: siteConfig.restaurant.name },
    formatDetection: { telephone: false },
    applicationName: siteConfig.restaurant.name,
    alternates: {
      canonical,
      languages: { ...languages, "x-default": localizedPath(routing.defaultLocale, "/") },
    },
    robots: { index: isIndexable, follow: isIndexable },
    openGraph: {
      type: "website",
      locale: { sr: "sr_RS", en: "en_US", hu: "hu_HU", de: "de_DE", ru: "ru_RU" }[locale],
      images: siteUrl
        ? [
            {
              url: `${siteUrl}/social-preview.png`,
              width: 1200,
              height: 630,
              alt: siteConfig.restaurant.name,
            },
          ]
        : [],
      siteName: siteConfig.restaurant.name,
      title: t("title", { name: siteConfig.restaurant.name }),
      description: t("description", { name: siteConfig.restaurant.name }),
      url: canonical,
    },
    twitter: {
      images: siteUrl ? [`${siteUrl}/social-preview.png`] : [],
      card: "summary_large_image",
      title: t("title", { name: siteConfig.restaurant.name }),
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          {children}
          <SiteFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
