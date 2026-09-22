import createMiddleware from "next-intl/middleware";
import { hasLocale } from "next-intl";
import { NextResponse, type NextRequest } from "next/server";
import { localizedPath, pathnames, type StaticPath } from "./i18n/paths";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);
export default function proxy(request: NextRequest) {
  const [, locale, ...segments] = request.nextUrl.pathname.split("/");
  if (hasLocale(routing.locales, locale)) {
    const internalPath = `/${segments.join("/")}`;
    let destination: string | undefined;
    if (segments[0] === "products" && segments.length === 2) {
      try {
        destination = localizedPath(locale, "/products/[slug]", decodeURIComponent(segments[1]));
      } catch {
        return new NextResponse(null, { status: 400 });
      }
    } else if (Object.hasOwn(pathnames, internalPath) && internalPath !== "/products/[slug]") {
      destination = localizedPath(locale, internalPath as StaticPath);
    }
    if (destination && destination !== request.nextUrl.pathname) {
      const url = request.nextUrl.clone();
      url.pathname = destination;
      return NextResponse.redirect(url, 308);
    }
  }
  return handleI18nRouting(request);
}
export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
