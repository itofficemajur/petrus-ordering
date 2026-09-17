import { hasLocale } from "next-intl";
import { NextRequest, NextResponse } from "next/server";

import { routing } from "@/i18n/routing";
import { ContentfulRequestError } from "@/lib/contentful/client.server";
import { mapStorefrontContent } from "@/lib/contentful/mappers";
import { getStorefrontContent } from "@/lib/contentful/storefront.server";

export async function GET(request: NextRequest) {
  const requestedLocale = request.nextUrl.searchParams.get("locale");
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  try {
    const content = await getStorefrontContent();
    const dto = mapStorefrontContent(content, locale);

    return NextResponse.json(dto, {
      headers: { "Cache-Control": "public, max-age=600, s-maxage=600, stale-while-revalidate=60" },
    });
  } catch (error) {
    if (error instanceof ContentfulRequestError) {
      console.error("Storefront content unavailable", {
        reason: error.reason,
        upstreamStatus: error.upstreamStatus,
      });
    } else {
      console.error("Storefront content unavailable: unexpected server error");
    }

    const status =
      error instanceof ContentfulRequestError
        ? error.reason === "configuration"
          ? 503
          : error.reason === "network"
            ? 504
            : 502
        : 500;

    return NextResponse.json(
      { error: "Storefront is temporarily unavailable" },
      {
        status,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}
