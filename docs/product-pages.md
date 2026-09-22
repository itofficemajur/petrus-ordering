# Stranice proizvoda i SEO

## Arhitektura

`/{locale}/{localizedProductSegment}/{localizedSlug}` koristi Server Components i `generateMetadata`.
Postojeći Contentful GraphQL klijent ostaje jedini klijent za katalog. `products.server.ts`
traži samo aktivan proizvod preko tačnog `slugSR/EN/HU/DE/RU` filtera. GraphQL izlaz
koristi `slugSr/En/Hu/De/Ru` sa aliasima; nazivi filtera i izlaznih polja nisu identični.
CMS šema nije menjana. Delivery API vraća samo objavljene podatke.

React `cache()` deli lookup između layouta, stranice i metadata. Next fetch keš se
revalidira na 600 sekundi uz postojeći tag `contentful-storefront`. Stranice se
renderuju na zahtev; nema masovnog prebuild učitavanja proizvoda i novi proizvodi
postaju dostupni bez redeploya. Projekat nema postojeći webhook za revalidaciju.
Lookup je izvan loading granice da nepostojeći proizvod dobije stvarni HTTP 404.
Nedostajući lokalizovani slug i nepoznati stari slug vraćaju 404. Nema istorije slugova
niti pouzdanog ID-a u starom URL-u, pa nema globalnog pretraživanja ili nagađanja redirecta.

UI dobija samo normalizovane podatke i lokalne putanje za promenu jezika. Katalog i dalje
koristi `/api/storefront` i lokalno filtriranje kategorija. Linkovi kategorija ostaju
`/{locale}?category={slug}`. Vrednost sluga je lokalizovana. To su postojeći filter URL-ovi, ne nove zasebne kategorijske
landing stranice. Sitemap uključuje te postojeće URL-ove; početna stranica zadržava svoj
postojeći canonical.

Koristi se postojeća localStorage korpa, uz povratnu informaciju o uspehu ili neuspehu.
Nedostupan proizvod ima onemogućeno dugme. Checkout još nije implementiran kao transakcioni
tok; server validacija cene i dostupnosti ostaje obavezna pri njegovoj implementaciji.

## Sitemap i datumi

Sitemap paginira kategorije i proizvode po 100 zapisa, sortiranih po ID-u. Isključuje
neaktivne i noIndex proizvode, nedostajuće slugove i nevažeće cene. Funkcija `buildSitemap`
je odvojena od paginacije radi budućeg deljenja sitemap-a.

Stvarni Contentful GraphQL `Sys` **nema `updatedAt`** (provereno API pozivom).
Koristimo `updatedAt: publishedAt` alias: poslednja objava je datum izmene javnog sadržaja,
bez uključivanja neobjavljenih CMS izmena. Taj datum se koristi u `lastModified`.

## Konfiguracija i pokretanje

- `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ENVIRONMENT_ID`, `CONTENTFUL_DELIVERY_TOKEN`: postojeći server-only Delivery pristup.
- `NEXT_PUBLIC_SITE_URL`: stvarni javni HTTPS origin pre produkcijskog builda. Query, hash i putanja se uklanjaju; HTTP i `*.vercel.app` domeni se odbacuju.
- Vercel indeksiranje dozvoljeno samo za `VERCEL_ENV=production`, uz validan javni URL.
- Van Vercel-a postaviti `DEPLOYMENT_ENV=production` samo u pravoj produkciji.
- `FACEBOOK_APP_ID` i `NEXT_PUBLIC_TWITTER_HANDLE`: opcioni, samo proverene postojeće vrednosti.

Lokalni `.env.local` trenutno koristi `http://localhost:3000`: indeksiranje je zato zabranjeno.
Za lokalnu proveru apsolutnih linkova korišćen je `NEXT_PUBLIC_SITE_URL=https://example.com`
u procesu test servera; `.env.local` nije promenjen. Bez validnog javnog URL-a product
canonical/alternate apsolutni linkovi i JSON-LD se izostavljaju umesto izmišljanja domena.

`npm run dev` pokreće lokalni server. `npm run check`, `npm test` i `npm run build`
proveravaju kod. Za Vercel postaviti navedene promenljive, pa napraviti production deployment.
Nisu uvedene migracije, Supabase promene, novi CMS fields ili zavisnosti.

## Slike i ručni koraci

PNG ikone 192, 512, maskable 512, Apple 180 i favicon 32, kao i fallback OG 1200×630,
izvedeni su iz postojećeg `public/Petrus-logo-yellow.png` na postojećoj tamnoj brand pozadini.
Maskable logo ostaje u bezbednoj centralnoj oblasti. Nema nedostajućih obaveznih asseta.
Contentful social slika ima prioritet nad glavnom; Image API transformacija daje 1200×630 JPEG.

Pre objavljivanja postaviti pravi HTTPS domen, proveriti objavljene prevode i dostupnost
slika na tom domenu. Opciona društvena podešavanja mogu ostati prazna. Potrebna je vizuelna
provera u pravom browseru na telefonu, tabletu i desktopu; ovaj radni prostor nema instaliran
browser automation alat. HTML i interakcije pokriveni su zasebnim proverama i testovima.

## Provere

- Stvarni Contentful lookup uspešno proverен za objavljeni proizvod u svih pet jezika.
- HTML: odgovarajući naslov i H1, self canonical, pet hreflang linkova i x-default,
  OG locale, Twitter large image, Product i BreadcrumbList JSON-LD.
- Nepostojeći proizvod: HTTP 404 za Googlebot i Twitterbot.
- Lokalna produkcijska grana sitemap-a: HTTP 200, 755 URL-ova, ispravni jezički slugovi.
- Produkcijska i razvojna robots grana i globalni noindex header provereni lokalno.
- Manifest: HTTP 200, sve potrebne dimenzije ikona navedene.
- Nije izvršen deployment; dostupnost na stvarnom produkcijskom domenu nije testirana.

Pun primer izlaza je u [product-seo-example.md](product-seo-example.md).
Next sitemap API: https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

## Potpuno prevedene javne putanje

Jedini izvor prevedenih segmenata je `src/i18n/paths.ts`. `next-intl` koristi istu mapu za
Link/router i rewrite ka postojećim App Router fajlovima. CMS slug ostaje slug odgovarajućeg jezika.

| Jezik | Proizvod                 | Poručivanje             | Kontakt                     |
| ----- | ------------------------ | ----------------------- | --------------------------- |
| sr    | `/sr/proizvodi/{slugSR}` | `/sr/porucivanje`       | `/sr/informacije/kontakt`   |
| hu    | `/hu/termekek/{slugHU}`  | `/hu/penztar`           | `/hu/informaciok/kapcsolat` |
| de    | `/de/produkte/{slugDE}`  | `/de/kasse`             | `/de/informationen/kontakt` |
| ru    | `/ru/produkty/{slugRU}`  | `/ru/oformlenie-zakaza` | `/ru/informatsiya/kontakty` |
| en    | `/en/products/{slugEN}`  | `/en/checkout`          | `/en/info/contact`          |

Prevedene su i putanje privatnosti, kolačića i uslova korišćenja. Stare interne putanje
trajno preusmeravaju statusom 308, sa očuvanim query parametrima. Ručni Metadata API daje
hreflang za stvarne CMS slugove; automatski middleware alternate Link header je isključen,
jer bi isti slug pogrešno ponovio za svih pet jezika.

Svaka stranica koristi `/{locale}/manifest.webmanifest`: lokalizovane name/description/lang
vrednosti i `start_url=/{locale}`. `id=/` i `scope=/` ostaju zajednički da promena jezika ne
napravi pet zasebnih instaliranih aplikacija. Globalni `/manifest.webmanifest` ostaje srpski
fallback. Standardna imena tehničkih resursa, API rute, ikone i `sitemap.xml` se ne prevode.

Sitemap, canonical, hreflang, OG i JSON-LD koriste prevedene putanje iz iste mape. Checkout
ili informativne stranice imaju sopstvene lokalizovane canonical/alternate vrednosti, ali
ostaju noindex kao postojeće privremene stranice i ne dodaju se u sitemap.

Kategorije u CMS šemi imaju jedan `slug` i prevedene nazive. Srpski URL zadržava postojeći
slug; ostali slugovi izvode se iz prevedenih naziva (mala slova, bez dijakritika, transliteracija
ćirilice). DTO šalje `localizedSlugs` i `legacySlug`; izbor i dalje filtrira po stabilnom ID-u.
Promena jezika odmah koristi slug iste kategorije. Stari ili drugi jezički slug prepoznaje se
nakon učitavanja kataloga i normalizuje preko History API-ja, bez novog API poziva.
Sitemap, link proizvoda ka kategoriji i BreadcrumbList koriste isti mapper.

Za objavljenu kategoriju „Supe & Čorbe“ URL vrednosti su:
`sr: supe-i-corbe`, `en: soups-broths`, `hu: levesek`, `de: suppen-eintopfe`,
`ru: supy-i-pokhlyobki`. Postojeći CMS prevodi su provereni; nema nedostajućih ili dupliranih
naziva. Promena prevedenog naziva menja izvedeni slug; trajni srpski slug ostaje podržan alias.
Manifest počinje od jezičke početne stranice i zato ne zahteva category parametar.

Završna provera lokalizacije: 67 testova, check i build prolaze. Stari mađarski product URL vraća 308, prevedeni URL vraća 200. Svih pet manifesta provereno preko lokalnog production servera; pravi produkcijski domen i dalje treba podesiti pre indeksiranja.

Query ključ je takođe lokalizovan: `sr=kategorija`, `en=category`, `hu=kategoria`,
`de=kategorie`, `ru=kategoriya`. Čitanje prihvata stare i druge jezičke ključeve, sa prioritetom
trenutnog jezika. Upis uklanja prethodne category ključeve, čuva ostale query parametre i koristi
jedini ključ trenutnog jezika. Navigacija, sitemap i BreadcrumbList koriste iste funkcije iz
`src/i18n/category-query.ts`.
