export const siteConfig = {
  // Replace the provisional name and fill in verified business details before launch.
  restaurant: {
    name: "Petrus",
    legalName: null as string | null,
    email: null as string | null,
    phone: null as string | null,
    address: null as string | null,
    city: null as string | null,
    countryCode: null as string | null,
    logoUrl: null as string | null,
    socialLinks: [] as string[],
  },
  operator: {
    legalName: null as string | null,
    registrationNumber: null as string | null,
    taxNumber: null as string | null,
    email: null as string | null,
    address: null as string | null,
  },
  locale: {
    default: "sr",
    supported: ["sr", "hu", "de", "ru", "en"],
  },
  timeZone: "Europe/Belgrade",
  currency: "RSD",
} as const;

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || null;
export const isIndexable = Boolean(siteUrl) && process.env.VERCEL_ENV !== "preview";
