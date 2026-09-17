import "server-only";

import type { CategoryDto, ProductDto, StorefrontResponseDto } from "@/lib/api/types";

import type {
  ContentfulAsset,
  ContentfulCategory,
  ContentfulProduct,
  StorefrontContent,
} from "./types";

export const CATEGORY_TITLE_FIELDS = {
  sr: "titleSR",
  en: "titleEN",
  hu: "titleHU",
  de: "titleDE",
  ru: "titleRU",
} as const;

export type AppLocale = keyof typeof CATEGORY_TITLE_FIELDS;

export const PRODUCT_TITLE_FIELDS = { ...CATEGORY_TITLE_FIELDS } as const;

export const PRODUCT_DESCRIPTION_FIELDS = {
  sr: "descriptionSR",
  en: "descriptionEN",
  hu: "descriptionHU",
  de: "descriptionDE",
  ru: "descriptionRU",
} as const;

function localizedValue<T, K extends keyof T>(
  entry: T,
  locale: AppLocale,
  fields: Record<AppLocale, K>,
): string {
  const allFields = [fields.sr, fields.en, fields.hu, fields.de, fields.ru];
  const preferred = [
    entry[fields[locale]],
    entry[fields.sr],
    entry[fields.en],
    ...allFields.map((field) => entry[field]),
  ];

  const value = preferred.find((candidate) => typeof candidate === "string" && candidate.trim());
  return typeof value === "string" ? value.trim() : "";
}

export function getLocalizedCategoryTitle(category: ContentfulCategory, locale: AppLocale): string {
  return localizedValue(category, locale, CATEGORY_TITLE_FIELDS);
}

export function getLocalizedProductTitle(product: ContentfulProduct, locale: AppLocale): string {
  return localizedValue(product, locale, PRODUCT_TITLE_FIELDS);
}

export function getLocalizedProductDescription(
  product: ContentfulProduct,
  locale: AppLocale,
): string {
  return localizedValue(product, locale, PRODUCT_DESCRIPTION_FIELDS);
}

function mapImage(image: ContentfulAsset | null): CategoryDto["image"] {
  if (!image?.url) return null;

  let url: URL;
  try {
    url = new URL(image.url);
  } catch {
    return null;
  }

  if (
    url.protocol !== "https:" ||
    !["images.ctfassets.net", "assets.ctfassets.net"].includes(url.hostname)
  ) {
    return null;
  }

  return {
    url: url.toString(),
    title: image.title ?? null,
    description: image.description ?? null,
    width: image.width ?? null,
    height: image.height ?? null,
  };
}

function mapCategory(category: ContentfulCategory, locale: AppLocale): CategoryDto {
  return {
    id: category.sys.id,
    title: getLocalizedCategoryTitle(category, locale),
    slug: category.slug ?? "",
    position: category.position ?? Number.MAX_SAFE_INTEGER,
    image: mapImage(category.image),
  };
}

function mapProduct(product: ContentfulProduct, locale: AppLocale): ProductDto | null {
  if (
    !product.sys.id ||
    !product.slug ||
    !product.category?.sys.id ||
    !product.category.slug ||
    typeof product.price !== "number" ||
    !Number.isFinite(product.price) ||
    product.price < 0
  ) {
    return null;
  }

  const title = getLocalizedProductTitle(product, locale);
  if (!title) return null;

  return {
    id: product.sys.id,
    title,
    description: getLocalizedProductDescription(product, locale),
    slug: product.slug,
    categoryId: product.category.sys.id,
    categorySlug: product.category.slug,
    price: product.price,
    compareAtPrice:
      typeof product.compareAtPrice === "number" && Number.isFinite(product.compareAtPrice)
        ? product.compareAtPrice
        : null,
    position: product.position ?? Number.MAX_SAFE_INTEGER,
    available: product.available === true,
    featured: product.featured === true,
    onSale: product.onSale === true,
    image: mapImage(product.image),
  };
}

export function mapStorefrontContent(
  content: StorefrontContent,
  locale: AppLocale,
): StorefrontResponseDto {
  const categories = content.categories
    .filter((category) => category.active === true)
    .map((category) => mapCategory(category, locale))
    .filter((category) => category.id && category.title && category.slug)
    .sort((a, b) => a.position - b.position);
  const categoryIds = new Set(categories.map((category) => category.id));

  return {
    categories,
    products: content.products
      .filter((product) => product.active === true)
      .map((product) => mapProduct(product, locale))
      .filter(
        (product): product is ProductDto => product !== null && categoryIds.has(product.categoryId),
      )
      .sort((a, b) => a.position - b.position),
  };
}
