import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { localizedManifest } from "@/lib/seo/manifest";
export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return new Response(null, { status: 404 });
  return Response.json(await localizedManifest(locale), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
