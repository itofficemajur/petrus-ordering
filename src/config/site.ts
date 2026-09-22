export const siteConfig = {
  // Replace the provisional name and fill in verified business details before launch.
  restaurant: {
    name: "Petrus Caffe",
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
  facebookAppId: process.env.FACEBOOK_APP_ID || null,
  twitter: process.env.NEXT_PUBLIC_TWITTER_HANDLE || null,
  timeZone: "Europe/Belgrade",
  currency: "RSD",
} as const;

export function normalizeSiteUrl(value: string | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname.endsWith(".vercel.app")) return null;
    return url.origin;
  } catch {
    return null;
  }
}
export const siteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
export const isIndexable =
  Boolean(siteUrl) &&
  (process.env.VERCEL_ENV === "production" ||
    (!process.env.VERCEL_ENV && process.env.DEPLOYMENT_ENV === "production"));
