import Image from "next/image";
import { NewsletterForm } from "@/components/newsletter-form";
import { getTranslations } from "next-intl/server";

import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";

const legalLinks = ["privacy", "cookies", "terms"] as const;

export async function SiteFooter() {
  const t = await getTranslations("Footer");

  return (
    <footer className="bg-[#25221d] text-stone-100">
      <div className="mx-auto max-w-5xl px-6 pt-12 pb-6 sm:px-10 sm:pt-16">
        <div className="grid gap-12 border-b border-white/15 pb-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_1fr_0.8fr] lg:gap-16">
          <div className="max-w-sm">
            <Link href="/" aria-label={siteConfig.restaurant.name} className="inline-flex">
              <Image
                src="/Petrus-logo-yellow.png"
                alt={siteConfig.restaurant.name}
                width={152}
                height={68}
                className="h-auto w-36"
              />
            </Link>
            <p className="mt-5 text-sm leading-6 text-stone-300">{t("description")}</p>
            <div className="mt-6 flex items-center gap-3">
              <span
                role="img"
                aria-label={t("instagramSoon")}
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/25 text-[#e7c37c]"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-5"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
              </span>
              <span className="text-sm text-stone-300">Instagram</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold tracking-tight">{t("newsletterTitle")}</h2>
            <p className="mt-3 max-w-xs text-sm leading-6 text-stone-300">
              {t("newsletterDescription")}
            </p>
            <NewsletterForm />
          </div>

          <nav aria-label={t("footerNavigation")} className="sm:col-span-2 lg:col-span-1">
            <h2 className="text-lg font-semibold tracking-tight">{t("information")}</h2>
            <ul className="mt-5 grid gap-4 text-sm text-stone-300 sm:grid-cols-2 lg:grid-cols-1">
              <li>
                <Link
                  href="/info/contact"
                  className="rounded-sm transition-colors hover:text-[#e7c37c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7c37c]"
                >
                  {t("contact")}
                </Link>
              </li>
              {legalLinks.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/info/${slug}`}
                    className="rounded-sm transition-colors hover:text-[#e7c37c] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#e7c37c]"
                  >
                    {t(slug)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="pt-6 text-xs text-stone-400">
          © {new Date().getFullYear()} {siteConfig.restaurant.name}. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
