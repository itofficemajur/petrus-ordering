import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { staticPageAlternates } from "@/i18n/metadata";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { Link } from "@/i18n/navigation";

const slugs = ["privacy", "cookies", "terms", "contact"] as const;
type InfoSlug = (typeof slugs)[number];

type Props = { params: Promise<{ locale: string; slug: string }> };

function isInfoSlug(slug: string): slug is InfoSlug {
  return slugs.some((item) => item === slug);
}

export function generateStaticParams() {
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isInfoSlug(slug) || !hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations("Footer");

  return {
    title: t(slug),
    alternates: staticPageAlternates(locale, `/info/${slug}`),
    openGraph: { url: staticPageAlternates(locale, `/info/${slug}`).canonical },
    robots: { index: false, follow: false },
  };
}

export default async function InfoPage({ params }: Props) {
  const { slug } = await params;
  if (!isInfoSlug(slug)) notFound();
  const t = await getTranslations("Footer");

  return (
    <main className="mx-auto flex min-h-[60svh] max-w-5xl flex-col items-start justify-center px-6 py-20 sm:px-10">
      <Link
        href="/"
        className="text-sm font-medium text-[#8b611c] underline-offset-4 hover:underline"
      >
        ← {t("backHome")}
      </Link>
      <h1 className="mt-8 text-3xl font-semibold tracking-tight text-stone-900 sm:text-5xl">
        {t(slug)}
      </h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-stone-600">{t("placeholderPage")}</p>
    </main>
  );
}
