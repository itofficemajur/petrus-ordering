"use client";

import { useMemo } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import { siteConfig } from "@/config/site";

import { ProductCard } from "./product-card";
import { useStorefront } from "./storefront-provider";

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.035 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

export function ProductGrid() {
  const locale = useLocale();
  const t = useTranslations("Products");
  const { state, selectedCategory } = useStorefront();
  const shouldReduceMotion = useReducedMotion();
  const formatter = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: siteConfig.currency,
        maximumFractionDigits: 0,
      }),
    [locale],
  );
  const products = useMemo(() => {
    if (state.status !== "success" || !selectedCategory) return [];
    return state.data.products
      .filter((product) => product.categoryId === selectedCategory.id)
      .sort((a, b) => a.position - b.position);
  }, [state, selectedCategory]);

  if (state.status === "loading") {
    return (
      <section className="min-h-64 flex-1 py-8 sm:py-10" role="status" aria-label={t("loading")}>
        <span className="sr-only">{t("loading")}</span>
        <div
          aria-hidden="true"
          className="mb-6 h-9 w-40 rounded-lg bg-stone-200 motion-safe:animate-pulse"
        />
        <div aria-hidden="true" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-48 rounded-2xl border border-stone-200 bg-white p-5">
              <div className="mb-4 h-5 w-3/4 rounded bg-stone-200 motion-safe:animate-pulse" />
              <div className="mb-2 h-3 w-full rounded bg-stone-100 motion-safe:animate-pulse" />
              <div className="h-3 w-2/3 rounded bg-stone-100 motion-safe:animate-pulse" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (state.status === "error") {
    return (
      <section className="min-h-64 flex-1 py-10" role="status">
        <p className="text-sm text-stone-600">{t("error")}</p>
      </section>
    );
  }

  if (!selectedCategory) {
    return (
      <section className="min-h-64 flex-1 py-10" role="status">
        <p className="text-sm text-stone-600">{t("noCategories")}</p>
      </section>
    );
  }

  return (
    <div className="min-h-64 flex-1">
      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          key={selectedCategory.id}
          className="py-8 sm:py-10"
          aria-labelledby="products-heading"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: -6 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1
            id="products-heading"
            className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {selectedCategory.title}
          </h1>
          {products.length === 0 ? (
            <p className="text-sm text-stone-600">{t("empty")}</p>
          ) : (
            <motion.div
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              variants={shouldReduceMotion ? undefined : gridVariants}
              initial={shouldReduceMotion ? false : "hidden"}
              animate={shouldReduceMotion ? undefined : "visible"}
            >
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  variants={shouldReduceMotion ? undefined : cardVariants}
                  className="h-full"
                >
                  <ProductCard
                    product={product}
                    formatPrice={(price) => formatter.format(price)}
                    saleLabel={t("sale")}
                    unavailableLabel={t("unavailable")}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>
      </AnimatePresence>
    </div>
  );
}
