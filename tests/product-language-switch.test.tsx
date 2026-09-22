import React from "react";
import { it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next-intl", () => ({
  useLocale: () => "sr",
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/products/piletina",
  useRouter: () => ({ replace }),
}));
import { LocaleSwitcher } from "@/components/locale-switcher";
it("switches the same product to its English slug and disables missing translations", () => {
  render(<LocaleSwitcher productSlugs={{ sr: "piletina", en: "chicken" }} />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "en" } });
  expect(replace).toHaveBeenCalledWith(
    { pathname: "/products/[slug]", params: { slug: "chicken" } },
    { locale: "en" },
  );
  expect((screen.getByRole("option", { name: /locale.hu/ }) as HTMLOptionElement).disabled).toBe(
    true,
  );
});
