"use client";

import { ShoppingCart } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { useCartCount } from "@/lib/cart/store";

export function CartLink() {
  const t = useTranslations("Cart");
  const count = useCartCount();

  return (
    <Link
      href="/checkout"
      aria-label={`${t("label")}: ${count}`}
      className="relative inline-flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-stone-300 text-stone-900 transition-colors hover:border-stone-500 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-800"
    >
      <ShoppingCart aria-hidden="true" className="size-6" strokeWidth={1.8} />
      <span
        aria-hidden="true"
        className="absolute -top-1 -right-2 flex min-h-7 min-w-7 items-center justify-center rounded-full bg-stone-900 px-1 text-xs font-medium text-white"
      >
        {count > 99 ? "99+" : count}
      </span>
    </Link>
  );
}
