# GitHub Copilot instructions — Petrus Ordering

Ovaj repozitorijum je platforma za poručivanje hrane za jedan restoran. Piši TypeScript u Next.js aplikaciji, uz Tailwind CSS, shadcn/ui, Motion, Lucide, TanStack Table za admin tabele i Recharts za analitiku. Contentful je višejezični CMS i izvor aktuelnog kataloga; Supabase PostgreSQL čuva porudžbine i istoriju, a Supabase Realtime obaveštava administraciju o promenama. Cilj za deployment je Vercel. Prati postojeće konvencije i ne uvodi zamenski stack.

Aplikacija je **mobile first**. Dizajniraj i implementiraj korisnički i administrativni interfejs prvo za male ekrane, pa ih prilagodi tabletima i desktop uređajima. Proveri ključne tokove na telefonu.

Koristi `next-intl` i locale putanje `/sr`, `/hu`, `/de`, `/ru`, `/en`, sa srpskim kao podrazumevanim jezikom. UI prevode drži u `messages/`. Podatke restorana i firme čitaj iz `src/config/site.ts`; tu je i osnova za SEO. Ne dupliraj naziv, domen i kontakte niti izmišljaj nepoznate poslovne podatke.

## Faza 1

- Napravi mobilno prilagođen meni sa kategorijama, proizvodima, fotografijama, opisima, cenama, opcijama, promocijama i izdvojenim sekcijama; višejezičnost važi i za stanja greške i checkout.
- Korpa podržava količine, uklanjanje i obračun; checkout prikuplja potrebne kontakt i dostavne podatke. Plaćanje je gotovinom ili karticom pri dostavi, ako restoran omogućava tu opciju.
- Administracija prima porudžbine u realnom vremenu, prikazuje detalje i menja statuse kroz odobren tok uz istoriju promena. Dashboard prikazuje promet, broj i prosečnu vrednost porudžbina, najbolje proizvode i kategorije, promet po vremenu, trendove, povezane proizvode, učinak promocija i otkazivanja, sa zadatim i proizvoljnim periodima.

## Pravila implementacije

- Sav novi i izmenjeni kod mora proći ESLint i Prettier prema `eslint.config.mjs` i `.prettierrc.json`. Pokreni `npm run check`; za build promene pokreni i `npm run build`. Ne zaobilazi pravila isključivanjem provera.
- Server je autoritet za cenu, dostupnost i konačan iznos. Ponovo proveri katalog pri checkout-u i sačuvaj nepromenljiv snimak svake stavke u PostgreSQL. Kreiranje porudžbine mora biti atomarno i otporno na ponovljeni zahtev.
- Storefront UI poziva samo relativni `/api/storefront?locale=...` preko `src/lib/api/storefront.ts`; Next.js Route Handler server-side poziva Contentful GraphQL i vraća bezbedan DTO. Client komponente ne importuju `src/lib/contentful/`, ne pozivaju Contentful domen i ne dobijaju Delivery token ni izvorni odgovor. Koristi samo server-side `CONTENTFUL_*` env varijable, bez `NEXT_PUBLIC_CONTENTFUL_*` i bez PAT-a.
- Jedan storefront odgovor sadrži kategorije i proizvode. `StorefrontProvider` deli podatke između navigacije i grida; klik na kategoriju menja `category` u URL-u i filtrira proizvode lokalno, bez novog API poziva. Promena jezika dobavlja odgovor za novi locale uz očuvan slug kategorije.
- Zaštiti admin rute i podatke autentifikacijom, autorizacijom i RLS pravilima. Tajne drži samo na serveru; validiraj server ulaze. Realtime događaji pokreću osvežavanje, a baza ostaje izvor istine.
- Čuvaj lične podatke samo koliko treba za isporuku; ne loguj ih. Koristi pristupačne komponente, jasna loading/error/empty stanja i podršku za reduced motion.
- Uz izmene šeme dodaj migracije. Testiraj obračun cene, statusne prelaze, duplo slanje i ključne tokove. Dokumentuj env promenljive bez tajnih vrednosti.
- Ne izmišljaj poslovna pravila kao što su dostavne zone, naknade, porezi, radno vreme, minimalna porudžbina, dozvoljeni statusni prelazi i definicija prihoda; traži odluku kada su potrebna za konkretan zadatak.

## Van Faze 1

Online kartično plaćanje je Faza 2: provider, webhook, payment status, idempotentnost i sandbox testiranje. Ne čuvaj kartične podatke u aplikaciji. Korisnički nalozi, sačuvane adrese, istorija kupca i loyalty su moguća kasnija proširenja. Ne implementiraj ih bez posebnog zahteva.

Za šira projektna pravila pročitaj i `AGENTS.md`.
