import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getProduct } from "@/lib/contentful/products.server";
import { mapProduct } from "@/lib/contentful/mappers";

// Resolve existence outside loading.tsx's Suspense boundary so missing products
// return an HTTP 404 before any loading shell is streamed.
export default async function ProductLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const product = await getProduct(locale, slug);
  if (!product || !mapProduct(product, locale)) notFound();
  return children;
}
