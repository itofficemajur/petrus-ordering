import type { StorefrontResponseDto } from "./types";

const CACHE_TTL_MS = 600_000;
const requests = new Map<string, { promise: Promise<StorefrontResponseDto>; expiresAt: number }>();

export function fetchStorefront(locale: string): Promise<StorefrontResponseDto> {
  const cached = requests.get(locale);
  if (cached && cached.expiresAt > Date.now()) return cached.promise;

  const promise = fetch(`/api/storefront?locale=${encodeURIComponent(locale)}`, {
    cache: "no-store",
  }).then(async (response) => {
    if (!response.ok) throw new Error("Storefront is unavailable");
    return (await response.json()) as StorefrontResponseDto;
  });

  const entry = { promise, expiresAt: Date.now() + CACHE_TTL_MS };
  requests.set(locale, entry);
  promise.catch(() => {
    if (requests.get(locale) === entry) requests.delete(locale);
  });

  return promise;
}
