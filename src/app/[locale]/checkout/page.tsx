import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Cart");

  return {
    title: t("comingSoon"),
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage() {
  const t = await getTranslations("Cart");

  return (
    <main className="flex min-h-svh items-center justify-center px-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
        {t("comingSoon")}
      </h1>
    </main>
  );
}
