"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

import { useStorefront } from "./storefront-provider";

export function CategoryNavigation() {
  const t = useTranslations("CategoryNavigation");
  const { state, selectedCategory, selectCategory } = useStorefront();
  const shouldReduceMotion = useReducedMotion();
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    listRef.current?.querySelector('[aria-current="true"]')?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [selectedCategory?.id, shouldReduceMotion]);

  if (state.status !== "success" || state.data.categories.length === 0) return null;

  return (
    <nav aria-label={t("label")} className="mt-3 border-b border-stone-200 sm:mt-4">
      <ul
        ref={listRef}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {state.data.categories.map((category) => (
          <li key={category.id} className="shrink-0 snap-start">
            <button
              type="button"
              onClick={() => selectCategory(category)}
              aria-current={selectedCategory?.id === category.id ? "true" : undefined}
              className="relative isolate inline-flex min-h-11 cursor-pointer items-center rounded-full px-4 text-sm font-medium whitespace-nowrap text-stone-700 transition-colors hover:text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 aria-[current=true]:text-white aria-[current=true]:hover:text-white"
            >
              {selectedCategory?.id === category.id &&
                (shouldReduceMotion ? (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 rounded-full bg-stone-900"
                  />
                ) : (
                  <motion.span
                    aria-hidden="true"
                    layoutId="active-category-indicator"
                    className="absolute inset-0 -z-10 rounded-full bg-stone-900"
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  />
                ))}
              <span className="relative z-10">{category.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
