import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getLocalizedCategorySlug, mapStorefrontContent } from "@/lib/contentful/mappers";
import { categoryTitleSlug } from "@/lib/category-slug";
import type { ContentfulCategory } from "@/lib/contentful/types";
import { StorefrontProvider, useStorefront } from "@/components/storefront-provider";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { fetchStorefront } from "@/lib/api/storefront";
const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("@/lib/api/storefront", () => ({ fetchStorefront: vi.fn() }));
vi.mock("@/i18n/navigation", () => ({ useRouter: () => ({ replace }), usePathname: () => "/" }));
vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
}));
const category: ContentfulCategory = {
  sys: { id: "soups" },
  slug: "supe-i-corbe",
  titleSR: "Supe i čorbe",
  titleEN: "Soups and stews",
  titleHU: "Levesek",
  titleDE: "Suppen und Eintöpfe",
  titleRU: "Супы и похлёбки",
  active: true,
  position: 1,
  image: null,
};
const expected = {
  sr: "supe-i-corbe",
  en: "soups-and-stews",
  hu: "levesek",
  de: "suppen-und-eintopfe",
  ru: "supy-i-pokhlyobki",
};
function Menu() {
  const { selectedCategory, state, selectCategory } = useStorefront();
  return (
    <>
      <p data-testid="selected">{selectedCategory?.id}</p>
      {state.status === "success" &&
        state.data.categories.map((c) => (
          <button key={c.id} onClick={() => selectCategory(c)}>
            {c.title}
          </button>
        ))}
      <LocaleSwitcher />
    </>
  );
}
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.history.replaceState(null, "", "/");
});
describe("localized category URL values", () => {
  it.each(Object.keys(expected) as Array<keyof typeof expected>)(
    "maps %s title to its slug and includes translation lookup",
    (locale) => {
      expect(getLocalizedCategorySlug(category, locale)).toBe(expected[locale]);
      expect(
        mapStorefrontContent({ categories: [category], products: [] }, locale).categories[0],
      ).toMatchObject({
        slug: expected[locale],
        localizedSlugs: expected,
        legacySlug: "supe-i-corbe",
      });
    },
  );
  it("normalizes accents and punctuation", () => {
    expect(categoryTitleSlug("  Desszertek & sütemények! ")).toBe("desszertek-sutemenyek");
  });
  it("resolves legacy links, switches language and filters without another fetch", async () => {
    const data = mapStorefrontContent(
      {
        categories: [
          { ...category, sys: { id: "first" }, slug: "prva", titleEN: "First" },
          category,
        ],
        products: [],
      },
      "en",
    );
    vi.mocked(fetchStorefront).mockResolvedValue(data);
    window.history.replaceState(null, "", "/en?category=supe-i-corbe");
    render(
      <StorefrontProvider locale="en">
        <Menu />
      </StorefrontProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("selected").textContent).toBe("soups"));
    await waitFor(() => expect(window.location.search).toBe("?category=soups-and-stews"));
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "hu" } });
    expect(replace).toHaveBeenCalledWith(
      { pathname: "/", query: { kategoria: "levesek" } },
      { locale: "hu" },
    );
    fireEvent.click(screen.getByRole("button", { name: "First" }));
    expect(window.location.search).toBe("?category=first");
    expect(fetchStorefront).toHaveBeenCalledTimes(1);
  });
  it("resolves a different language slug on direct load", async () => {
    vi.mocked(fetchStorefront).mockResolvedValue(
      mapStorefrontContent({ categories: [category], products: [] }, "de"),
    );
    window.history.replaceState(null, "", "/de?category=levesek");
    render(
      <StorefrontProvider locale="de">
        <Menu />
      </StorefrontProvider>,
    );
    await waitFor(() => expect(window.location.search).toBe("?kategorie=suppen-und-eintopfe"));
  });
});
