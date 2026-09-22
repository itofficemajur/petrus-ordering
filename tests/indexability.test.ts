import { afterEach, it, expect, vi } from "vitest";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});
it.each(["preview", "development", "staging"])("blocks %s indexing", async (env) => {
  vi.stubEnv("VERCEL_ENV", env);
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com");
  const { isIndexable } = await import("@/config/site");
  expect(isIndexable).toBe(false);
  const robots = (await import("@/app/robots")).default();
  expect(robots.rules).toEqual({ userAgent: "*", disallow: "/" });
});
it("normalizes canonical origin and rejects preview origins", async () => {
  const { normalizeSiteUrl } = await import("@/config/site");
  expect(normalizeSiteUrl("https://example.com///?q=x#hash")).toBe("https://example.com");
  expect(normalizeSiteUrl("https://preview.vercel.app")).toBeNull();
  expect(normalizeSiteUrl("http://example.com")).toBeNull();
});
