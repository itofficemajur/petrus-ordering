import "server-only";

export type ContentfulAsset = {
  url: string | null;
  title: string | null;
  description: string | null;
  width: number | null;
  height: number | null;
};

export type ContentfulCategory = {
  sys: { id: string; updatedAt?: string };
  titleSR: string | null;
  titleEN: string | null;
  titleHU: string | null;
  titleDE: string | null;
  titleRU: string | null;
  slug: string | null;
  position: number | null;
  active: boolean | null;
  image: ContentfulAsset | null;
};

export type ContentfulProduct = {
  sys: { id: string; updatedAt?: string };
  titleSR: string | null;
  titleEN: string | null;
  titleHU: string | null;
  titleDE: string | null;
  titleRU: string | null;
  descriptionSR: string | null;
  descriptionEN: string | null;
  descriptionHU: string | null;
  descriptionDE: string | null;
  descriptionRU: string | null;
  slugSR: string | null;
  slugEN: string | null;
  slugHU: string | null;
  slugDE: string | null;
  slugRU: string | null;
  price: number | null;
  compareAtPrice: number | null;
  position: number | null;
  active: boolean | null;
  available: boolean | null;
  featured: boolean | null;
  onSale: boolean | null;
  image: ContentfulAsset | null;
  category: ContentfulCategory | null;
  galleryCollection?: { items: Array<ContentfulAsset | null> };
  allergenReferencesCollection?: { items: Array<ContentfulCategory | null> };
  socialImage?: ContentfulAsset | null;
  sku?: string | null;
  noIndex?: boolean | null;
  noFollow?: boolean | null;
};

export type StorefrontQueryData = {
  categoryCollection: {
    total: number;
    items: Array<ContentfulCategory | null>;
  } | null;
  productCollection: {
    total: number;
    items: Array<ContentfulProduct | null>;
  } | null;
};

export type StorefrontContent = {
  categories: ContentfulCategory[];
  products: ContentfulProduct[];
};
