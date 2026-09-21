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

## Newsletter (Contentful stage)

Footer šalje samo `POST /api/newsletter/subscribe` sa email adresom i jezikom.
Backend normalizuje i validira podatke, proverava postojeći unos preko Management
API-ja i kreira ili ponovo aktivira `subscribedEmail`, pa ga objavljuje. Odgovor
sadrži samo status; zahtevi i odgovori se ne keširaju, a email i upstream greške se
ne loguju. Javni storefront GraphQL upit ostaje ograničen na proizvode i kategorije.

Potrebne server promenljive: `CONTENTFUL_SPACE_ID`,
`CONTENTFUL_ENVIRONMENT_ID=stage` i `CONTENTFUL_DELIVERY_TOKEN`.
Delivery token ostaje samo za katalog. Management token podesiti lokalno i u
Vercel Environment Variables, sa najmanjim dostupnim pravima za newsletter model
u stage okruženju. Ne stavljati ga u `NEXT_PUBLIC_*` niti u Git. Servis koristi
podrazumevani Contentful locale za strukturu polja; `locale` polje čuva jezik gosta.

### Vidljivost kroz Delivery API

Newsletter polja ostaju `omitted: false` radi naknadnog čitanja objavljenih
pretplata kroz Delivery API. Svako ko ima odgovarajući Delivery token može čitati
ta polja, uključujući email adrese. Token držati na serveru.
Servis proverava da je model objavljen i da sadrži očekivana polja, ali ne zahteva
`omitted: true`. Zadržati required/unique validaciju emaila. Javni storefront upit
ne uključuje newsletter, a subscribe endpoint vraća samo status. Upis i provera
duplikata i dalje koriste isključivo Management API na backendu.

### Provera i preostali deployment koraci

- `npm test`: mock testovi, bez stvarnih Contentful upisa.
- `npm run check` i `npm run build`: lint, tipovi, format i produkcioni build.
- U browseru otvoriti svih pet jezika na telefonu (375 px), tabletu (768 px) i
  desktopu (1280 px); proveriti tastaturu, fokus, duge prevode i status poruke.
- Sa test adresom u stage proveriti novu prijavu, duplikat, pa deaktivaciju kroz
  Contentful i ponovnu prijavu: isti entry, novi consentAt, bez unsubscribedAt.
  Proveriti published stanje. Ručno ukloniti test podatke nakon provere.
- Simulirati offline/502 i spor zahtev; forma mora prikazati grešku, odnosno
  onemogućiti slanje dok zahtev traje. Success poruka ostaje do nove izmene inputa.
- TODO pre produkcije: u Vercel Firewall dodati rate-limit pravilo za
  `POST /api/newsletter/subscribe`, po izvornoj IP adresi (predlog: 5 zahteva u
  60 sekundi, potom prilagoditi saobraćaju), sa odgovorom 429. Ne oslanjati se na
  korisnički prosleđen X-Forwarded-For ili memoriju jedne serverless instance.
  Contentful 429 već se prevodi u javni 429 sa Retry-After.
- Mesto za buduću CAPTCHA proveru označeno je u ruti, pre Contentful poziva.
- Pre produkcije definisati zadržavanje podataka i operativni postupak odjave;
  slanje kampanja i javni unsubscribe endpoint nisu deo ove implementacije.
