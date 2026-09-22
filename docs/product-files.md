# Fajlovi izmenjeni za prikaz proizvoda

## Kreirani

- `src/i18n/paths.ts`
- `src/i18n/metadata.ts`
- `src/lib/seo/manifest.ts`
- `src/app/[locale]/manifest.webmanifest/route.ts`
- `src/app/manifest.webmanifest/route.ts`
- `tests/localized-routing.test.ts`

- `docs/product-pages.md`
- `docs/product-seo-example.md`
- `public/apple-touch-icon.png`
- `public/favicon.png`
- `public/icon-192x192.png`
- `public/icon-512x512.png`
- `public/icon-maskable-512x512.png`
- `public/social-preview.png`
- `src/app/[locale]/products/[slug]/layout.tsx`
- `src/app/[locale]/products/[slug]/loading.tsx`
- `src/app/[locale]/products/[slug]/page.tsx`
- `src/app/[locale]/products/error.tsx`
- `src/components/product-purchase.tsx`
- `src/lib/contentful/product-seo.ts`
- `src/lib/contentful/products.server.ts`
- `tests/indexability.test.ts`
- `tests/product-language-switch.test.tsx`
- `tests/product-lookup.test.ts`
- `tests/products.test.tsx`
- `docs/product-files.md`

## Izmenjeni

- `src/i18n/routing.ts`
- `src/proxy.ts`
- `vitest.config.ts`
- `src/app/[locale]/checkout/page.tsx`
- `src/app/[locale]/info/[slug]/page.tsx`

- `.env.example`
- `messages/de.json`
- `messages/en.json`
- `messages/hu.json`
- `messages/ru.json`
- `messages/sr.json`
- `next.config.ts`
- `src/app/[locale]/layout.tsx`
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/components/locale-switcher.tsx`
- `src/components/product-card.tsx`
- `src/config/site.ts`
- `src/lib/cart/store.ts`
- `src/lib/contentful/client.server.ts`
- `src/lib/contentful/mappers.ts`
- `src/lib/contentful/queries.ts`
- `src/lib/contentful/types.ts`

## Rezultati provera

- `npm run check`: ESLint, TypeScript i Prettier.
- `npm run test`: 67 testova u 7 fajlova.
- `npm run build`: production build.
- Detalji stvarnog HTML/API testiranja: [product-pages.md](product-pages.md).

## Zamenjeni

- `src/app/manifest.ts` zamenjen je manifest route handlerima i zajedničkim lokalizovanim generatorom.
