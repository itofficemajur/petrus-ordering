import { describe, it, expect, vi, beforeEach } from "vitest";
vi.mock("@/lib/contentful/client.server", () => ({
  contentfulGraphQlRequest: vi.fn(),
  ContentfulRequestError: class extends Error {},
}));
import { contentfulGraphQlRequest } from "@/lib/contentful/client.server";
import { getProduct, getSitemapContent } from "@/lib/contentful/products.server";
const request = vi.mocked(contentfulGraphQlRequest);
beforeEach(() => {
  request.mockReset();
});
describe("product lookup", () => {
  it("excludes inactive and missing products", async () => {
    request.mockResolvedValueOnce({ productCollection: { total: 1, items: [{ active: false }] } });
    expect(await getProduct("sr", "inactive")).toBeNull();
    request.mockResolvedValueOnce({ productCollection: { total: 0, items: [] } });
    expect(await getProduct("sr", "missing")).toBeNull();
  });
  it("rejects invalid slugs before API call", async () => {
    expect(await getProduct("sr", "bad?slug")).toBeNull();
    expect(request).not.toHaveBeenCalled();
  });
  it.each(["sr", "en", "hu", "de", "ru"] as const)(
    "uses exact %s filter and variables",
    async (locale) => {
      request.mockResolvedValue({ productCollection: { total: 1, items: [{ active: true }] } });
      await getProduct(locale, "valid-slug");
      expect(request).toHaveBeenCalledWith(
        expect.stringContaining(`slug${locale.toUpperCase()}: $slug`),
        { variables: { slug: "valid-slug" } },
      );
      expect(request.mock.calls[0][0]).toContain("active: true");
    },
  );
  it("paginates sitemap collections", async () => {
    request.mockImplementation(async (query, options) => {
      if (query.includes("categoryCollection"))
        return { categoryCollection: { total: 0, items: [] } };
      return {
        productCollection: {
          total: 2,
          items: [{ sys: { id: options?.variables?.skip ? "second" : "first" } }],
        },
      };
    });
    const data = await getSitemapContent();
    expect(data.products.map((p) => p.sys.id)).toEqual(["first", "second"]);
  });
});
