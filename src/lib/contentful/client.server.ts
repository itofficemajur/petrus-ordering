import "server-only";

type GraphQlResponse<T> = {
  data?: T | null;
  errors?: Array<{ message?: string }>;
};

export class ContentfulRequestError extends Error {
  constructor(
    public readonly reason: "configuration" | "network" | "upstream" | "invalid_response",
    public readonly upstreamStatus?: number,
  ) {
    super(`Contentful request failed: ${reason}`);
    this.name = "ContentfulRequestError";
  }
}

export async function contentfulGraphQlRequest<T>(
  query: string,
  options: { revalidate?: number; tags?: string[] } = {},
): Promise<T> {
  const spaceId = process.env.CONTENTFUL_SPACE_ID;
  const environmentId = process.env.CONTENTFUL_ENVIRONMENT_ID;
  const token = process.env.CONTENTFUL_DELIVERY_TOKEN;

  if (!spaceId || !environmentId || !token) {
    throw new ContentfulRequestError("configuration");
  }

  const endpoint = `https://graphql.contentful.com/content/v1/spaces/${encodeURIComponent(spaceId)}/environments/${encodeURIComponent(environmentId)}`;
  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query }),
      next: {
        revalidate: options.revalidate ?? 600,
        tags: options.tags ?? ["contentful-storefront"],
      },
      signal: AbortSignal.timeout(10_000),
    });
  } catch {
    throw new ContentfulRequestError("network");
  }

  if (!response.ok) {
    throw new ContentfulRequestError("upstream", response.status);
  }

  let payload: GraphQlResponse<T>;
  try {
    payload = (await response.json()) as GraphQlResponse<T>;
  } catch {
    throw new ContentfulRequestError("invalid_response");
  }

  if (payload.errors?.length || !payload.data) {
    throw new ContentfulRequestError("invalid_response");
  }

  return payload.data;
}
