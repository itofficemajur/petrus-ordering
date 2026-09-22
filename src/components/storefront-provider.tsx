"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

import { readCategoryQuery, setCategoryQuery } from "@/i18n/category-query";
import { fetchStorefront } from "@/lib/api/storefront";
import type { CategoryDto, StorefrontResponseDto } from "@/lib/api/types";

type StorefrontState =
  { status: "loading" } | { status: "success"; data: StorefrontResponseDto } | { status: "error" };

type StorefrontContextValue = {
  state: StorefrontState;
  selectedCategory: CategoryDto | null;
  selectedSlug: string | null;
  selectCategory: (category: CategoryDto) => void;
};

const StorefrontContext = createContext<StorefrontContextValue | null>(null);
const CATEGORY_CHANGE_EVENT = "storefront-category-change";

function subscribeToCategoryChange(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener(CATEGORY_CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener(CATEGORY_CHANGE_EVENT, callback);
  };
}

function getCategoryFromUrl() {
  return window.location.search;
}

function getServerCategory() {
  return "";
}

export function StorefrontProvider({ locale, children }: { locale: string; children: ReactNode }) {
  const [state, setState] = useState<StorefrontState>({ status: "loading" });
  const search = useSyncExternalStore(
    subscribeToCategoryChange,
    getCategoryFromUrl,
    getServerCategory,
  );

  const requestedSlug = readCategoryQuery(new URLSearchParams(search), locale);

  useEffect(() => {
    let current = true;

    fetchStorefront(locale)
      .then((data) => {
        if (current) setState({ status: "success", data });
      })
      .catch(() => {
        if (current) setState({ status: "error" });
      });

    return () => {
      current = false;
    };
  }, [locale]);

  const selectedCategory =
    state.status === "success"
      ? (state.data.categories.find((category) => category.slug === requestedSlug) ??
        state.data.categories.find(
          (category) =>
            category.legacySlug === requestedSlug ||
            Object.values(category.localizedSlugs).includes(requestedSlug ?? ""),
        ) ??
        state.data.categories[0] ??
        null)
      : null;

  useEffect(() => {
    if (!selectedCategory) return;

    const url = new URL(window.location.href);
    setCategoryQuery(url.searchParams, locale, selectedCategory.slug);
    if (url.search === window.location.search) return;
    window.history.replaceState(null, "", url);
    window.dispatchEvent(new Event(CATEGORY_CHANGE_EVENT));
  }, [search, locale, selectedCategory]);

  function selectCategory(category: CategoryDto) {
    if (category.slug === selectedCategory?.slug) return;

    const url = new URL(window.location.href);
    setCategoryQuery(url.searchParams, locale, category.slug);
    window.history.pushState(null, "", url);
    window.dispatchEvent(new Event(CATEGORY_CHANGE_EVENT));
  }

  return (
    <StorefrontContext.Provider
      value={{
        state,
        selectedCategory,
        selectedSlug: selectedCategory?.slug ?? requestedSlug,
        selectCategory,
      }}
    >
      {children}
    </StorefrontContext.Provider>
  );
}

export function useStorefront() {
  const context = useContext(StorefrontContext);
  if (!context) throw new Error("StorefrontProvider is missing");
  return context;
}

export function useOptionalStorefront() {
  return useContext(StorefrontContext);
}
