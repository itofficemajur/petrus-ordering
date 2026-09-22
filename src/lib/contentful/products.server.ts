import "server-only";
import { cache } from "react";
import { contentfulGraphQlRequest, ContentfulRequestError } from "./client.server";
import { PRODUCT_DETAIL_FIELDS, PRODUCT_FIELDS, CATEGORY_FIELDS } from "./queries";
import { localeFieldMap, type AppLocale } from "./mappers";
import type { ContentfulProduct, ContentfulCategory } from "./types";

type Collection<T> = { total: number; items: Array<T | null> };
export const getProduct = cache(async (locale: AppLocale, slug: string) => {
  if (!slug || slug.length > 200 || !/^[\p{L}\p{N}_-]+$/u.test(slug)) return null;
  const field = localeFieldMap[locale].slug;
  const data = await contentfulGraphQlRequest<{ productCollection: Collection<ContentfulProduct> }>(
    `query Product($slug: String!) { productCollection(where: {active: true, ${field}: $slug}, limit: 2) { total items { ${PRODUCT_DETAIL_FIELDS} } } }`,
    { variables: { slug } },
  );
  const products = data.productCollection?.items?.filter((p) => p?.active === true);
  return products?.length === 1 ? products[0] : null;
});

export async function getSitemapContent() {
  async function collect<T>(name: string, fields: string): Promise<T[]> {
    const items: T[] = [];
    let skip = 0;
    while (true) {
      const data = await contentfulGraphQlRequest<Record<string, Collection<T>>>(
        `query Entries($skip: Int!) { ${name}(where: {active: true}, order: sys_id_ASC, limit: 100, skip: $skip) { total items { ${fields} } } }`,
        { variables: { skip } },
      );
      const page = data[name];
      if (!page || !Array.isArray(page.items)) throw new ContentfulRequestError("invalid_response");
      items.push(...page.items.filter((item): item is T => item !== null));
      skip += page.items.length;
      if (skip >= page.total) return items;
      if (!page.items.length) throw new ContentfulRequestError("invalid_response");
    }
  }
  const [products, categories] = await Promise.all([
    collect<ContentfulProduct>("productCollection", `${PRODUCT_FIELDS} noIndex noFollow`),
    collect<ContentfulCategory>("categoryCollection", CATEGORY_FIELDS),
  ]);
  return { products, categories };
}
