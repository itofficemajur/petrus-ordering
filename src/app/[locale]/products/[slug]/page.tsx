import { categoryQueryKey } from "@/i18n/category-query";
import Image from "next/image";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { routing } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { getProduct } from "@/lib/contentful/products.server";
import {
  getLocalizedProductSlug,
  getLocalizedCategoryTitle,
  mapImage,
  mapProduct,
} from "@/lib/contentful/mappers";
import {
  productMetadata,
  productJsonLd,
  serializeJsonLd,
  plainText,
} from "@/lib/contentful/product-seo";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { CartLink } from "@/components/cart-link";
import { ProductPurchase } from "@/components/product-purchase";
import { siteConfig } from "@/config/site";

type Props = { params: Promise<{ locale: string; slug: string }> };
export const revalidate = 600;
async function resolveProduct(params: Props["params"]) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const product = await getProduct(locale, slug);
  if (!product || !product.active) notFound();
  const dto = mapProduct(product, locale);
  if (!dto) notFound();
  return { locale, product, dto };
}
export async function generateMetadata({ params }: Props) {
  const { locale, product } = await resolveProduct(params);
  return productMetadata(product, locale);
}
export default async function ProductPage({ params }: Props) {
  const { locale, product, dto } = await resolveProduct(params);
  const t = await getTranslations({ locale, namespace: "Product" });
  const labels = await getTranslations({ locale, namespace: "Products" });
  const formatPrice = (price: number) =>
    new Intl.NumberFormat(locale, { style: "currency", currency: siteConfig.currency }).format(
      price,
    );
  const category = product.category ? getLocalizedCategoryTitle(product.category, locale) : "";
  const categoryHref = {
    pathname: "/" as const,
    query: { [categoryQueryKey(locale)]: dto.categorySlug },
  };
  const paths = Object.fromEntries(
    routing.locales.flatMap((code) => {
      const slug = getLocalizedProductSlug(product, code);
      return slug ? [[code, slug]] : [];
    }),
  );
  const gallery = (product.galleryCollection?.items ?? []).flatMap((asset) => {
    const image = mapImage(asset);
    return image ? [image] : [];
  });
  return (
    <main className="mx-auto max-w-6xl px-5 py-6 sm:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(productJsonLd(product, locale, t("home"))),
        }}
      />
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="text-xl font-semibold">
          {siteConfig.restaurant.name}
        </Link>
        <LocaleSwitcher productSlugs={paths} />
        <CartLink />
      </header>
      <nav aria-label={t("home")} className="mb-6 text-sm text-stone-600">
        <ol className="flex flex-wrap gap-2">
          <li>
            <Link href="/">{t("home")}</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={categoryHref}>{category}</Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page">{dto.title}</li>
        </ol>
      </nav>
      <article className="grid gap-8 md:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-stone-100">
            {dto.image ? (
              <Image
                src={dto.image.url}
                alt={dto.image.description || dto.title}
                fill
                priority
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <p className="flex h-full items-center justify-center text-stone-600">
                {t("noImage")}
              </p>
            )}
          </div>
          {gallery.length > 0 && (
            <ul className="mt-4 grid grid-cols-2 gap-3">
              {gallery.map((image, index) => (
                <li key={`${image.url}-${index}`}>
                  <a
                    href={image.url}
                    className="relative block aspect-square overflow-hidden rounded-xl focus-visible:outline-2"
                  >
                    <Image
                      src={image.url}
                      alt={image.description || `${dto.title} — ${index + 1}`}
                      fill
                      sizes="(max-width: 767px) 45vw, 25vw"
                      className="object-cover"
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex flex-col gap-5">
          <Link href={categoryHref} className="text-sm underline">
            {category}
          </Link>
          <h1 className="text-3xl font-semibold sm:text-4xl">{dto.title}</h1>
          <p className="whitespace-pre-line leading-relaxed text-stone-700">
            {plainText(dto.description)}
          </p>
          {dto.onSale && (
            <span className="w-fit rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">
              {labels("sale")}
            </span>
          )}
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-semibold">{formatPrice(dto.price)}</span>
            {dto.compareAtPrice !== null && (
              <del className="text-stone-600">{formatPrice(dto.compareAtPrice)}</del>
            )}
          </div>
          <p>{dto.available ? t("available") : labels("unavailable")}</p>
          {!!product.allergenReferencesCollection?.items.length && (
            <section>
              <h2 className="mb-2 font-semibold">{t("allergens")}</h2>
              <ul className="flex flex-wrap gap-3">
                {product.allergenReferencesCollection.items.map(
                  (allergen) =>
                    allergen && (
                      <li key={allergen.sys.id} className="flex items-center gap-2 text-sm">
                        <CircleAlert aria-hidden="true" className="size-4" />
                        {getLocalizedCategoryTitle(allergen, locale)}
                      </li>
                    ),
                )}
              </ul>
            </section>
          )}
          <ProductPurchase id={dto.id} available={dto.available} />
        </div>
      </article>
    </main>
  );
}
