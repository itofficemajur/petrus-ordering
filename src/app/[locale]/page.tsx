import Image from "next/image";
import { getLocale } from "next-intl/server";

import { CategoryNavigation } from "@/components/category-navigation";
import { BrandSignature } from "@/components/brand-signature";
import { CartLink } from "@/components/cart-link";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { ProductGrid } from "@/components/product-grid";
import { StorefrontProvider } from "@/components/storefront-provider";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";

export default async function HomePage() {
  const locale = await getLocale();

  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col px-6 pt-3 pb-4 sm:px-10 sm:pt-4 sm:pb-5">
      <StorefrontProvider key={locale} locale={locale}>
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <div className="flex min-w-0 items-center gap-x-3 max-[360px]:flex-col max-[360px]:items-start max-[360px]:gap-y-0">
            <Link href="/" aria-label={siteConfig.restaurant.name} className="inline-flex shrink-0">
              <Image
                src="/Petrus-logo-yellow.png"
                alt={siteConfig.restaurant.name}
                width={128}
                height={57}
                priority
                className="block h-auto w-32"
              />
            </Link>
            <BrandSignature />
          </div>
          <div className="flex w-full items-center justify-between gap-4 sm:w-auto">
            <LocaleSwitcher />
            <CartLink />
          </div>
        </header>
        <CategoryNavigation />
        <ProductGrid />
      </StorefrontProvider>
    </main>
  );
}
