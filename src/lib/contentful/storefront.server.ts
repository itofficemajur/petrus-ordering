import "server-only";

import { ContentfulRequestError, contentfulGraphQlRequest } from "./client.server";
import { GET_STOREFRONT_CONTENT } from "./queries";
import type { StorefrontContent, StorefrontQueryData } from "./types";

export async function getStorefrontContent(): Promise<StorefrontContent> {
  const data = await contentfulGraphQlRequest<StorefrontQueryData>(GET_STOREFRONT_CONTENT, {
    revalidate: 600,
    tags: ["contentful-storefront"],
  });

  if (
    !Array.isArray(data.categoryCollection?.items) ||
    !Array.isArray(data.productCollection?.items) ||
    data.categoryCollection.total > 100 ||
    data.productCollection.total > 500
  ) {
    throw new ContentfulRequestError("invalid_response");
  }

  return {
    categories: data.categoryCollection.items.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    ),
    products: data.productCollection.items.filter(
      (item): item is NonNullable<typeof item> => item !== null,
    ),
  };
}
