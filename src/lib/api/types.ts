import type { AppLocale } from "@/i18n/paths";

export type CategoryDto = {
  id: string;
  title: string;
  slug: string;
  localizedSlugs: Record<AppLocale, string>;
  legacySlug: string;
  position: number;
  image: {
    url: string;
    title: string | null;
    description: string | null;
    width: number | null;
    height: number | null;
  } | null;
};

export type StorefrontResponseDto = {
  categories: CategoryDto[];
  products: ProductDto[];
};

export type ProductDto = {
  id: string;
  title: string;
  description: string;
  slug: string;
  categoryId: string;
  categorySlug: string;
  price: number;
  compareAtPrice: number | null;
  position: number;
  available: boolean;
  featured: boolean;
  onSale: boolean;
  image: CategoryDto["image"];
};
