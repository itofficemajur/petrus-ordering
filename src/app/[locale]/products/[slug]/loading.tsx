import { getTranslations } from "next-intl/server";
export default async function Loading() {
  const t = await getTranslations("Products");
  return (
    <main className="mx-auto min-h-[60vh] max-w-6xl p-6" role="status">
      <p>{t("loading")}</p>
      <div className="mt-6 h-80 rounded-2xl bg-stone-100 motion-safe:animate-pulse" />
    </main>
  );
}
