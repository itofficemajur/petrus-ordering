import { describe, expect, it } from "vitest";
import { categoryQueryKeys, readCategoryQuery, setCategoryQuery } from "@/i18n/category-query";
import { categoryPath } from "@/i18n/paths";

describe("localized category parameter", () => {
  it.each(Object.entries(categoryQueryKeys))("reads and writes %s key %s", (locale, key) => {
    const query = new URLSearchParams("ref=menu&category=soup&kategorie=old");
    setCategoryQuery(query, locale, "new-soup");
    expect(query.toString()).toBe(`ref=menu&${key}=new-soup`);
    expect(readCategoryQuery(query, locale)).toBe("new-soup");
    expect(readCategoryQuery(new URLSearchParams("category=legacy"), locale)).toBe("legacy");
  });
  it("prioritizes current language and produces localized SEO URLs", () => {
    expect(readCategoryQuery(new URLSearchParams("category=old&kategoria=levesek"), "hu")).toBe(
      "levesek",
    );
    expect(categoryPath("hu", "levesek")).toBe("/hu?kategoria=levesek");
    expect(categoryPath("sr", "supe-i-corbe")).toBe("/sr?kategorija=supe-i-corbe");
  });
});
