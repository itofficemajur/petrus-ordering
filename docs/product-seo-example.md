# Primer proverenog SEO izlaza

Stvarni objavljeni proizvod: Rižoto sa piletinom. Test domen je https://example.com; nije produkcijski domen restorana. Izlaz proveravan u lokalnom okruženju sa zabranjenim indeksiranjem.

```html
<link rel="canonical" href="https://example.com/sr/proizvodi/rizoto-sa-piletinom" />
<link rel="alternate" hreflang="sr" href="https://example.com/sr/proizvodi/rizoto-sa-piletinom" />
<link rel="alternate" hreflang="hu" href="https://example.com/hu/termekek/rizotto-csirkevel" />
<link rel="alternate" hreflang="de" href="https://example.com/de/produkte/risotto-mit-huhnchen" />
<link rel="alternate" hreflang="ru" href="https://example.com/ru/produkty/rizotto-s-kuritsey" />
<link rel="alternate" hreflang="en" href="https://example.com/en/products/risotto-with-chicken" />
<link
  rel="alternate"
  hreflang="x-default"
  href="https://example.com/sr/proizvodi/rizoto-sa-piletinom"
/>
<meta property="og:title" content="Rižoto sa piletinom | Petrus Caffe" />
<meta
  property="og:description"
  content="Kremasti rižoto od Carnaroli pirinča sa šafranom i graškom, marinirani pileći file, sušeni paradajz i parmezan."
/>
<meta property="og:url" content="https://example.com/sr/proizvodi/rizoto-sa-piletinom" />
<meta property="og:site_name" content="Petrus Caffe" />
<meta property="og:locale" content="sr_RS" />
<meta property="og:image" content="https://example.com/social-preview.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Rižoto sa piletinom" />
<meta property="og:locale:alternate" content="hu_HU" />
<meta property="og:locale:alternate" content="de_DE" />
<meta property="og:locale:alternate" content="ru_RU" />
<meta property="og:locale:alternate" content="en_US" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="Rižoto sa piletinom | Petrus Caffe" />
<meta
  name="twitter:description"
  content="Kremasti rižoto od Carnaroli pirinča sa šafranom i graškom, marinirani pileći file, sušeni paradajz i parmezan."
/>
<meta name="twitter:image" content="https://example.com/social-preview.png" />
```

```json
[
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": "https://example.com/sr/proizvodi/rizoto-sa-piletinom#product",
    "name": "Rižoto sa piletinom",
    "description": "Kremasti rižoto od Carnaroli pirinča sa šafranom i graškom, marinirani pileći file, sušeni paradajz i parmezan.",
    "url": "https://example.com/sr/proizvodi/rizoto-sa-piletinom",
    "category": "Paste i rižota",
    "brand": {
      "@type": "Brand",
      "name": "Petrus Caffe"
    },
    "offers": {
      "@type": "Offer",
      "url": "https://example.com/sr/proizvodi/rizoto-sa-piletinom",
      "priceCurrency": "RSD",
      "price": 1430,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "Petrus Caffe"
      }
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Početna",
        "item": "https://example.com/sr"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Paste i rižota",
        "item": "https://example.com/sr?kategorija=paste-i-rizota"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Rižoto sa piletinom",
        "item": "https://example.com/sr/proizvodi/rizoto-sa-piletinom"
      }
    ]
  }
]
```
