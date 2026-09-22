import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
vi.mock("@/config/site", () => ({
  siteUrl: "https://example.com",
  isIndexable: true,
  siteConfig: {
    restaurant: { name: "Petrus Caffe" },
    currency: "RSD",
    locale: { default: "sr", supported: ["sr", "hu", "de", "ru", "en"] },
  },
}));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
import {
  getLocalizedProductTitle,
  getLocalizedProductDescription,
  getLocalizedProductSlug,
  getProductUrl,
  mapImage,
} from "@/lib/contentful/mappers";
import {
  productMetadata,
  productLanguages,
  socialImage,
  productJsonLd,
  serializeJsonLd,
} from "@/lib/contentful/product-seo";
import { buildSitemap } from "@/app/sitemap";
import { ProductPurchase } from "@/components/product-purchase";
import type { ContentfulProduct } from "@/lib/contentful/types";
import { routing } from "@/i18n/routing";
const product: ContentfulProduct = {
  sys: { id: "p1", updatedAt: "2026-09-22T00:00:00Z" },
  titleSR: "Piletina",
  titleEN: "Chicken",
  titleHU: "Csirke",
  titleDE: "Hähnchen",
  titleRU: "Курица",
  descriptionSR: "Opis",
  descriptionEN: "Description",
  descriptionHU: "Leírás",
  descriptionDE: "Beschreibung",
  descriptionRU: "Описание",
  slugSR: "piletina",
  slugEN: "chicken",
  slugHU: "csirke",
  slugDE: "hahnchen",
  slugRU: "kurica",
  price: 900,
  compareAtPrice: null,
  active: true,
  available: true,
  featured: false,
  onSale: false,
  position: 1,
  image: null,
  category: {
    sys: { id: "c1" },
    slug: "grill",
    titleSR: "Roštilj",
    titleEN: "Grill",
    titleHU: "Grill",
    titleDE: "Grill",
    titleRU: "Гриль",
    position: 1,
    active: true,
    image: null,
  },
};
const asset = (name: string) => ({
  url: `//images.ctfassets.net/space/${name}.jpg`,
  title: null,
  description: null,
  width: 800,
  height: 800,
});
beforeEach(() => {
  cleanup();
  localStorage.clear();
});
describe("localized product SEO", () => {
  it.each(routing.locales)("selects fields and destination for %s", (locale) => {
    const suffix = locale.toUpperCase() as "SR" | "EN" | "HU" | "DE" | "RU";
    expect(getLocalizedProductTitle(product, locale)).toBe(product[`title${suffix}`]);
    expect(getLocalizedProductDescription(product, locale)).toBe(product[`description${suffix}`]);
    expect(getLocalizedProductSlug(product, locale)).toBe(product[`slug${suffix}`]);
    expect(getProductUrl(product, locale)).toBe(
      `/${locale}/${{ sr: "proizvodi", en: "products", hu: "termekek", de: "produkte", ru: "produkty" }[locale]}/${product[`slug${suffix}`]}`,
    );
  });
  it("does not borrow a missing slug", () =>
    expect(getProductUrl({ ...product, slugEN: null }, "en")).toBeNull());
  it("uses Serbian description fallback", () =>
    expect(getLocalizedProductDescription({ ...product, descriptionEN: null }, "en")).toBe("Opis"));
  it("has self canonical, five alternates and x-default without duplicated brand", () => {
    for (const locale of routing.locales) {
      const meta = productMetadata(product, locale);
      expect(meta.alternates?.canonical).toBe(productLanguages(product)[locale]);
      expect(Object.keys(meta.alternates?.languages ?? {})).toHaveLength(6);
      expect(meta.alternates?.languages?.["x-default"]).toBe(
        "https://example.com/sr/proizvodi/piletina",
      );
      expect(JSON.stringify(meta.title).match(/Petrus Caffe/g)).toHaveLength(1);
    }
  });
  it("uses social, main, then global image and normalizes HTTPS", () => {
    expect(
      socialImage({ ...product, image: asset("main"), socialImage: asset("social") }),
    ).toContain("https://images.ctfassets.net/space/social.jpg");
    expect(socialImage({ ...product, image: asset("main") })).toContain("/main.jpg");
    expect(socialImage(product)).toBe("https://example.com/social-preview.png");
    expect(mapImage(asset("main"))?.url).toMatch(/^https:/);
  });
  it("maps robot flags", () =>
    expect(
      productMetadata({ ...product, noIndex: true, noFollow: true }, "sr").robots,
    ).toMatchObject({ index: false, follow: false, googleBot: { index: false, follow: false } }));
  it("serializes factual JSON-LD safely", () => {
    const data = productJsonLd(
      { ...product, titleEN: "</script>", available: false },
      "en",
      "Home",
    );
    const json = serializeJsonLd(data);
    expect(json).not.toContain("<");
    expect(json).not.toMatch(/undefined|null|"sku"|"image"|rating|review/);
    expect(data[0]).toMatchObject({
      offers: { price: 900, availability: "https://schema.org/OutOfStock" },
    });
  });
  it("filters sitemap and uses localized URLs", () => {
    const entries = buildSitemap({
      categories: [],
      products: [
        product,
        { ...product, active: false, slugSR: "inactive" },
        { ...product, noIndex: true, slugSR: "hidden" },
      ],
    });
    expect(entries).toHaveLength(10);
    for (const url of Object.values(productLanguages(product)))
      expect(entries.some((entry) => entry.url === url)).toBe(true);
  });
  it("disables purchase of unavailable products", () => {
    render(<ProductPurchase id="p1" available={false} />);
    const button = screen.getByRole("button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.click(button);
    expect(localStorage.getItem("petrus-cart")).toBeNull();
  });
  it("adds available product to existing cart", () => {
    render(<ProductPurchase id="p1" available />);
    fireEvent.click(screen.getByRole("button"));
    expect(JSON.parse(localStorage.getItem("petrus-cart")!)).toEqual([
      { productId: "p1", quantity: 1 },
    ]);
  });
});

it("uses localized category slugs in sitemap and product breadcrumbs", () => {
  const category = {
    ...product.category!,
    slug: "supe-i-corbe",
    titleEN: "Soups & Broths",
    titleHU: "Levesek",
  };
  const entries = buildSitemap({ categories: [category], products: [] });
  expect(
    entries.some((entry) => entry.url === "https://example.com/en?category=soups-broths"),
  ).toBe(true);
  expect(entries.some((entry) => entry.url === "https://example.com/hu?kategoria=levesek")).toBe(
    true,
  );
  expect(serializeJsonLd(productJsonLd({ ...product, category }, "hu", "Kezdőlap"))).toContain(
    "https://example.com/hu?kategoria=levesek",
  );
});
