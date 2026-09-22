import { routing } from "@/i18n/routing";
import { localizedManifest } from "@/lib/seo/manifest";
export async function GET() {
  return Response.json(await localizedManifest(routing.defaultLocale), {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
