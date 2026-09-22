import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import proxy from "@/proxy";
import { pathnames, localizedPath, manifestPath } from "@/i18n/paths";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { staticPageAlternates } from "@/i18n/metadata";
vi.mock("next-intl/server", () => ({
  getTranslations:
    async ({ locale }: { locale: string }) =>
    (key: string) =>
      `${locale}:${key}`,
}));
import { localizedManifest } from "@/lib/seo/manifest";
import { GET } from "@/app/[locale]/manifest.webmanifest/route";

describe("localized public routing", () => {
  it.each(routing.locales)("shares %s paths between navigation and SEO", (locale) => {
    for (const route of Object.keys(pathnames) as Array<keyof typeof pathnames>) {
      const href =
        route === "/products/[slug]"
          ? ({ pathname: route, params: { slug: "test-slug" } } as const)
          : route;
      const expected =
        route === "/products/[slug]"
          ? localizedPath(locale, route, "test-slug")
          : localizedPath(locale, route);
      expect(getPathname({ locale, href })).toBe(expected);
      const response = proxy(new NextRequest(`https://example.com${expected}`));
      expect(response.status).toBe(200);
      expect(
        response.headers.get("x-middleware-rewrite") ?? `https://example.com${expected}`,
      ).toContain(
        `/${locale}${route.replace("[slug]", "test-slug") === "/" ? "" : route.replace("[slug]", "test-slug")}`,
      );
      expect(response.headers.get("link")).toBeNull();
    }
  });
  it("permanently redirects legacy Hungarian product URL preserving query", () => {
    const response = proxy(
      new NextRequest("https://example.com/hu/products/omlett-tukortojas-vagy-rantotta?ref=menu"),
    );
    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "https://example.com/hu/termekek/omlett-tukortojas-vagy-rantotta?ref=menu",
    );
  });
  it("localizes legal page canonical and alternates", () => {
    const result = staticPageAlternates("hu", "/info/privacy");
    expect(result.canonical).toMatch(/\/hu\/informaciok\/adatvedelem$/);
    expect(result.languages.de).toMatch(/\/de\/informationen\/datenschutz$/);
  });
  it.each(routing.locales)(
    "serves %s manifest with the selected language and start URL",
    async (locale) => {
      const manifest = await localizedManifest(locale);
      expect(manifest).toMatchObject({
        id: "/",
        lang: locale,
        start_url: `/${locale}`,
        name: `${locale}:title`,
      });
      const response = await GET(new Request(`https://example.com${manifestPath(locale)}`), {
        params: Promise.resolve({ locale }),
      });
      expect(response.headers.get("content-type")).toBe("application/manifest+json");
      expect(await response.json()).toMatchObject({ lang: locale, start_url: `/${locale}` });
    },
  );
  it("rejects unsupported manifest locale", async () => {
    expect(
      (
        await GET(new Request("https://example.com/xx/manifest.webmanifest"), {
          params: Promise.resolve({ locale: "xx" }),
        })
      ).status,
    ).toBe(404);
  });
});
