import { localizedPath, categoryPath } from "@/i18n/paths";
import { getLocalizedCategorySlug } from "@/lib/contentful/mappers";
import type { MetadataRoute } from "next";
import { isIndexable, siteUrl } from "@/config/site";
import { routing } from "@/i18n/routing";
import { getSitemapContent } from "@/lib/contentful/products.server";
import { productLanguages } from "@/lib/contentful/product-seo";
import type { StorefrontContent } from "@/lib/contentful/types";
export const revalidate = 600;
export function buildSitemap(content: StorefrontContent): MetadataRoute.Sitemap {
  if (!isIndexable || !siteUrl) return [];
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${siteUrl}${localizedPath(locale, "/")}`]),
  );
  const entries: MetadataRoute.Sitemap = routing.locales.map((locale) => ({
    url: languages[locale],
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages },
  }));
  for (const category of content.categories) {
    if (!category.active || !category.slug) continue;
    const urls = Object.fromEntries(
      routing.locales.map((locale) => [
        locale,
        `${siteUrl}${categoryPath(locale, getLocalizedCategorySlug(category, locale))}`,
      ]),
    );
    for (const locale of routing.locales)
      entries.push({
        url: urls[locale],
        lastModified: category.sys.updatedAt,
        changeFrequency: "weekly",
        priority: 0.7,
        alternates: { languages: urls },
      });
  }
  for (const product of content.products) {
    if (
      !product.active ||
      product.noIndex ||
      typeof product.price !== "number" ||
      !Number.isFinite(product.price) ||
      product.price < 0 ||
      !product.category?.slug
    )
      continue;
    const urls = productLanguages(product);
    for (const url of Object.values(urls))
      entries.push({
        url,
        lastModified: product.sys.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
        alternates: { languages: urls },
      });
  }
  return [...new Map(entries.map((entry) => [entry.url, entry])).values()];
}
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isIndexable || !siteUrl) return [];
  return buildSitemap(await getSitemapContent());
}
