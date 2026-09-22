import { categoryPath, localizedPath } from "@/i18n/paths";
import type { Metadata } from "next";
import { siteConfig, siteUrl, isIndexable } from "@/config/site";
import { routing } from "@/i18n/routing";
import {
  getProductUrl,
  getLocalizedProductTitle,
  getLocalizedProductDescription,
  getLocalizedCategoryTitle,
  getLocalizedCategorySlug,
  mapImage,
  type AppLocale,
} from "./mappers";
import type { ContentfulProduct } from "./types";

export const ogLocales = { sr: "sr_RS", en: "en_US", hu: "hu_HU", de: "de_DE", ru: "ru_RU" };
export function plainText(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}
export function metaDescription(value: string) {
  const text = plainText(value);
  if (text.length <= 160) return text;
  const shortened = text.slice(0, 157);
  return `${shortened.slice(0, shortened.lastIndexOf(" ") > 0 ? shortened.lastIndexOf(" ") : 157)}…`;
}
export function productLanguages(product: ContentfulProduct) {
  return Object.fromEntries(
    routing.locales.flatMap((locale) => {
      const path = getProductUrl(product, locale);
      return path && siteUrl ? [[locale, `${siteUrl}${path}`]] : [];
    }),
  );
}
export function socialImage(product: ContentfulProduct) {
  const asset = mapImage(product.socialImage ?? null) || mapImage(product.image);
  if (!asset) return siteUrl ? `${siteUrl}/social-preview.png` : undefined;
  const url = new URL(asset.url);
  if (url.hostname === "images.ctfassets.net") {
    url.searchParams.set("w", "1200");
    url.searchParams.set("h", "630");
    url.searchParams.set("fit", "fill");
    url.searchParams.set("fm", "jpg");
    url.searchParams.set("q", "85");
  }
  return url.toString();
}
export function productMetadata(product: ContentfulProduct, locale: AppLocale): Metadata {
  const name = getLocalizedProductTitle(product, locale);
  const title = `${name} | ${siteConfig.restaurant.name}`;
  const description = metaDescription(getLocalizedProductDescription(product, locale));
  const languages = productLanguages(product);
  const canonical = languages[locale];
  const image = socialImage(product);
  const index = isIndexable && !product.noIndex;
  const follow = isIndexable && !product.noFollow;
  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: { ...languages, ...(languages.sr ? { "x-default": languages.sr } : {}) },
    },
    robots: {
      index,
      follow,
      googleBot: {
        index,
        follow,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      url: canonical,
      siteName: siteConfig.restaurant.name,
      locale: ogLocales[locale],
      alternateLocale: routing.locales
        .filter((l) => l !== locale && languages[l])
        .map((l) => ogLocales[l]),
      title,
      description,
      images: image ? [{ url: image, width: 1200, height: 630, alt: name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
      ...(siteConfig.twitter ? { site: siteConfig.twitter, creator: siteConfig.twitter } : {}),
    },
    ...(siteConfig.facebookAppId ? { facebook: { appId: siteConfig.facebookAppId } } : {}),
  };
}
export function productJsonLd(product: ContentfulProduct, locale: AppLocale, homeLabel: string) {
  const url = productLanguages(product)[locale];
  if (!url) return [];
  const name = getLocalizedProductTitle(product, locale);
  const category = product.category ? getLocalizedCategoryTitle(product.category, locale) : "";
  const images = [product.image, ...(product.galleryCollection?.items ?? [])].flatMap((asset) => {
    const image = mapImage(asset);
    return image ? [image.url] : [];
  });
  return [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${url}#product`,
      name,
      description: plainText(getLocalizedProductDescription(product, locale)),
      url,
      ...(images.length ? { image: [...new Set(images)] } : {}),
      ...(product.sku?.trim() ? { sku: product.sku.trim() } : {}),
      ...(category ? { category } : {}),
      brand: { "@type": "Brand", name: siteConfig.restaurant.name },
      offers: {
        "@type": "Offer",
        url,
        priceCurrency: siteConfig.currency,
        price: Number(product.price?.toFixed(2)),
        availability:
          product.available === true
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        itemCondition: "https://schema.org/NewCondition",
        seller: { "@type": "Organization", name: siteConfig.restaurant.name },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { name: homeLabel, item: `${siteUrl}${localizedPath(locale, "/")}` },
        ...(category && product.category?.slug
          ? [
              {
                name: category,
                item: `${siteUrl}${categoryPath(locale, getLocalizedCategorySlug(product.category, locale))}`,
              },
            ]
          : []),
        { name, item: url },
      ].map((item, i) => ({ "@type": "ListItem", position: i + 1, ...item })),
    },
  ];
}
export function serializeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
