# Instrukcije za Codex — Petrus Ordering

## Cilj i obuhvat

Razvijaj namensku platformu za online poručivanje hrane za jedan restoran. Faza 1 obuhvata mobilno prilagođenu aplikaciju za goste, upravljanje ponudom kroz Contentful, operativni administrativni panel i poslovnu analitiku. Faza 2 dodaje online kartično plaćanje tek kada se izabere payment provider i definiše ugovor sa njim. Loyalty, korisnički nalozi, sačuvane adrese i istorija kupca su budući razvoj, van trenutnog obuhvata.

Aplikacija je **mobile first**: dizajniraj i implementiraj prvo za male ekrane, a zatim prilagodi tabletima i desktop uređajima. Ovo važi za korisničku aplikaciju i administrativni panel.

Ne uvodi funkcije iz kasnijih faza u Fazu 1 samo zato što ih arhitektura može podržati. Ne pretvaraj cenu projekta, dinamiku plaćanja, vlasništvo i infrastrukturne naknade iz ponude u funkcionalnosti aplikacije.

## Obavezni tehnološki izbori

- Next.js sa TypeScript-om za aplikaciju za goste, server logiku i administrativni panel.
- Tailwind CSS i shadcn/ui za interfejs; Lucide za ikonice; Motion za smislene, diskretne animacije.
- TanStack Table za administratorske tabele; Recharts za grafikone analitike.
- Contentful kao centralni, višejezični izvor za proizvode, kategorije, fotografije, opise, cene, dostupnost, banere, promocije, oznake i redosled prikaza.
- Supabase PostgreSQL za porudžbine, stavke, istoriju statusa i poslovne podatke; Supabase Realtime za prijem i promene porudžbina bez ručnog osvežavanja.
- Vercel kao cilj za produkciono postavljanje.
- `next-intl` za lokalizaciju sa prefiksima `/sr`, `/hu`, `/de`, `/ru` i `/en`; srpski je podrazumevani jezik. Prevodi interfejsa su u `messages/`, a Contentful lokalizuje sadržaj kataloga.

Pre uvođenja dodatne biblioteke proveri da li je već postoji rešenje u projektu ili navedenom stack-u. Prati postojeću strukturu i konvencije kada budu uspostavljene; ne menjaj stack bez izričitog zahteva.

## Granice podataka i bezbednost

- Contentful je izvor aktuelnog kataloga. PostgreSQL čuva trajne transakcione podatke. Ne koristi Contentful za porudžbine niti oslanjaj istorijske porudžbine na aktuelne Contentful vrednosti.
- Storefront UI poziva samo relativni `/api/storefront?locale=...` kroz `src/lib/api/storefront.ts`. Next.js Route Handler poziva Contentful GraphQL kroz `src/lib/contentful/*.server.ts` i vraća normalizovan DTO. Client komponente ne importuju Contentful data layer, ne pozivaju Contentful domen i ne dobijaju Delivery token ili izvorni GraphQL odgovor. Koristi isključivo server-side `CONTENTFUL_*` env varijable, bez `NEXT_PUBLIC_CONTENTFUL_*` i bez PAT-a.
- Jedan storefront odgovor sadrži kategorije i proizvode. `StorefrontProvider` deli taj odgovor između `CategoryNavigation` i `ProductGrid`; izbor kategorije filtrira proizvode lokalno i menja `category` query parametar preko History API-ja, bez novog API ili Contentful poziva. Pri promeni jezika dobavlja se lokalizovan odgovor za novi locale uz očuvan slug kategorije.
- Pri kreiranju porudžbine server ponovo proverava proizvode, dostupnost, opcije i cene iz pouzdanog izvora. Iznos poslat iz browsera nije autoritativan. U stavkama trajno sačuvaj snimak naziva, opcija, jedinične cene, količine, valute i obračunatog iznosa u trenutku kupovine.
- Validiraj sve ulaze na serveru. Kreiranje porudžbine, stavki i početnog statusa mora biti atomarno. Spreči dupliranje porudžbine pri ponovljenom slanju zahteva, npr. idempotency ključem.
- Administratorske rute, čitanje porudžbina, promene statusa i analitika zahtevaju autentifikaciju i autorizaciju na serveru. Primeni najmanje potrebne privilegije, uključujući RLS pravila u Supabase-u. Ne izlaži servisne ključeve, Contentful management token ili lične podatke u klijentskom kodu.
- Statusne promene sprovodi kroz definisan tok i beleži ko je promenio status i kada. Predloženi statusi su: Nova, Prihvaćena, U pripremi, Spremna, Preuzeta, Završena, Otkazana. Konkretnu matricu dozvoljenih prelaza potvrdi pre implementacije poslovne logike.
- Realtime događaj koristi za osvežavanje prikaza; trajno stanje u bazi ostaje izvor istine. Obradi prekid veze, ponovnu pretplatu i duple događaje.
- Podatke kupca i adresu prikupljaj samo koliko je potrebno za dostavu. Ne zapisuj tajne ili lične podatke u logove. Pravila zadržavanja i brisanja podataka definiši pre produkcije.

## Korisnički tokovi

- Početna strana prikazuje kategorije, izdvojene proizvode, banere i specijalne ponude. Meni prikazuje fotografiju, naziv, opis, cenu, akcijske oznake i raspoložive opcije. Stabilan osnovni redosled menija; kratkoročne promocije prikazuj u izdvojenim sekcijama i oznakama.
- Korpa omogućava promenu količine, uklanjanje stavki i jasan pregled iznosa. Checkout prikuplja potrebne podatke kupca i adresu dostave. U Fazi 1 podrži gotovinu i karticu pri dostavi samo kada je ta opcija omogućena za restoran; to nisu online kartične transakcije.
- Korisnički interfejs i katalog su višejezični. Koristi eksplicitne locale putanje ili dosledan postojeći i18n obrazac, prevedi i prazna stanja, greške i checkout; predvidi nedostajuće prevode.
- Administracija prikazuje nove, aktivne i završene porudžbine, detalje potrebne kuhinji i dostavi, promenu statusa i jasnu povratnu informaciju o greškama. Koristi TanStack Table kada su potrebni sortiranje, filtriranje ili paginacija.
- Dashboard podržava periode: danas, juče, poslednjih 7 ili 30 dana, tekući ili prethodni mesec i proizvoljni raspon. Prikaži promet, broj i prosečnu vrednost porudžbina, najbolje proizvode i kategorije, promet po satu i danu, trend i poređenje sa prethodnim periodom, prosečan broj stavki, proizvode koji se često naručuju zajedno, učinak akcijskih i izdvojenih proizvoda i otkazivanja. Definiši vremensku zonu restorana i pravila uključivanja otkazanih porudžbina pre izračunavanja metrika.

## Faza 2: online plaćanje

Kada faza bude odobrena, integracija mora podržati inicijalizaciju, uspeh, neuspeh, otkazivanje i webhook događaje. Webhook proverava potpis, obrađuje ponovljene i događaje van redosleda, i usklađuje payment i order status. Ne čuvaj pune brojeve kartica, CVV ili druge PCI osetljive podatke. Pre produkcije testiraj sandbox tokove. Ne pretpostavljaj konkretnog providera dok nije izabran.

## Način rada

- Centralni podaci o restoranu i firmi su u `src/config/site.ts`. Koristi ih za javni prikaz, metadata, robots, sitemap i manifest; ne dupliraj naziv, domen, kontakte i pravne podatke po komponentama. Ne popunjavaj nepoznate poslovne podatke izmišljanjem. `NEXT_PUBLIC_SITE_URL` mora biti stvarni javni domen pre indeksiranja.
- ESLint i Prettier su obavezni za sav novi i izmenjeni kod. Poštuj `eslint.config.mjs` i `.prettierrc.json`; ne isključuj pravila ili format provere da bi prošao gate. Posle izmena pokreni `npm run check`, a za promene koje utiču na build i `npm run build`.
- Pre izmene pročitaj relevantne postojeće fajlove. Implementiraj najmanju celinu koja završava traženi tok, sa jasnim server/client granicama i tipovima.
- Pristupačnost je deo gotovog interfejsa: semantički elementi, tastatura, fokus, kontrast, validacione poruke i podrška za smanjeno kretanje. Interfejs prvo proveri na telefonu, zatim na tabletu i desktopu.
- Animacije ne smeju usporavati naručivanje ili zaklanjati stanje porudžbine. Prazna, učitavajuća i neuspešna stanja obavezna su za kritične tokove.
- Dodaj migracije i bezbednosna pravila uz izmene baze. Dodaj testove za poslovna pravila, posebno obračun cene, idempotentnost, statusne prelaze i analitičke upite; proveri ključne tokove na relevantnim ekranima. Ne predstavljaj netestiranu integraciju kao završenu.
- Dokumentuj potrebne env promenljive bez vrednosti tajni, lokalno pokretanje, migracije i ručne korake za Contentful, Supabase i Vercel kada ih uvedeš.
- Ako zadatak zavisi od neodlučenog poslovnog pravila, prvo sprovedi sve nezavisne delove, zatim traži konkretnu odluku. Ne izmišljaj dostavne zone, naknade, radno vreme, minimalni iznos, poreska pravila ili payment providera.
