"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { addToCart } from "@/lib/cart/store";
export function ProductPurchase({ id, available }: { id: string; available: boolean }) {
  const t = useTranslations("Product");
  const products = useTranslations("Products");
  const [message, setMessage] = useState("");
  return (
    <div>
      <button
        type="button"
        disabled={!available}
        className="min-h-12 w-full rounded-xl bg-stone-900 px-6 py-3 font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={() => {
          if (available) setMessage(addToCart(id) ? t("added") : t("cartError"));
        }}
      >
        {available ? t("add") : products("unavailable")}
      </button>
      <p role="status" className="mt-2 text-sm">
        {message}
      </p>
    </div>
  );
}
