"use client";
import { useTranslations } from "next-intl";
export default function ErrorPage({ reset }: { reset: () => void }) {
  const t = useTranslations("Products");
  const p = useTranslations("Product");
  return (
    <main className="mx-auto min-h-[60vh] max-w-6xl p-6">
      <p role="alert">{t("error")}</p>
      <button onClick={reset} className="mt-4 min-h-11 rounded-lg border px-4">
        {p("retry")}
      </button>
    </main>
  );
}
