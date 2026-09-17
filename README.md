# Petrus Ordering

Next.js osnova za višejezičnu platformu za poručivanje hrane. Trenutna stranica prikazuje kategorije i proizvode iz Contentfula; korpa, checkout, administracija i Supabase integracija još nisu implementirani.

## Lokalno pokretanje

Potrebni su Node.js 22 i npm. Pokrenite:

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Aplikacija je dostupna na `http://localhost:3000/sr`. Podržane putanje su `/sr`, `/hu`, `/de`, `/ru` i `/en`.

## Provere

```bash
npm run check
npm run build
```

`npm run check` pokreće ESLint, TypeScript i Prettier proveru. `npm run format` formatira fajlove prema `.prettierrc.json`.

## Konfiguracija sajta i SEO

Podatke restorana i firme unesite u `src/config/site.ts` kada budu potvrđeni. Trenutno je naziv „Petrus“ privremen, a nepoznati kontakt i pravni podaci su prazni. Naslovi, opisi, canonical i hreflang veze, `robots.txt`, `sitemap.xml` i web manifest generišu se iz iste konfiguracije i prevoda u `messages/`.

`NEXT_PUBLIC_SITE_URL` mora biti puni javni origin, na primer `https://example.com`, bez putanje. Dok nije podešen, robots blokira indeksiranje i sitemap je prazan. Vercel preview okruženja se takođe ne indeksiraju. Pre produkcionog lansiranja unesite pravi domen i poslovne podatke, zamenite privremenu ikonicu i tekst naslovne strane, pa proverite svih pet jezika.

## Vercel

Repozitorijum se može povezati sa Vercel projektom kao Next.js aplikacija; `vercel.json` eksplicitno postavlja framework. U Vercel Environment Variables dodajte `NEXT_PUBLIC_SITE_URL` sa stvarnim produkcionim domenom. Vercel pokreće `npm run build` koristeći `package-lock.json`. Build skripta koristi webpack, pošto Turbopack u ovom lokalnom sandboxu ne može da otvori interni port pri obradi CSS-a.

Kategorije i proizvodi se čitaju jednim Contentful GraphQL upitom na serveru. Podesite `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ENVIRONMENT_ID` i `CONTENTFUL_DELIVERY_TOKEN` u `.env.local` i Vercel Environment Variables. Browser poziva samo `/api/storefront?locale=...`; odgovor sadrži normalizovane kategorije i proizvode. Izbor kategorije menja `?category=slug` i lokalno filtrira već učitane proizvode, bez novog zahteva. Server poziv se kešira 600 sekundi sa tagom `contentful-storefront`. Supabase paket je instaliran, ali baza još nije povezana. Tajne nikada ne stavljati u `NEXT_PUBLIC_` promenljive.
