import { siteConfig } from "@/config/site";
import type { SubscriptionRequest } from "./types";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  const normalized = normalizeEmail(email);
  const [local] = normalized.split("@");
  return (
    normalized.length <= 254 &&
    local.length <= 64 &&
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(
      normalized,
    )
  );
}

export function parseSubscription(value: unknown): SubscriptionRequest | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (
    Object.keys(body).some((key) => key !== "email" && key !== "locale") ||
    typeof body.email !== "string" ||
    !isValidEmail(body.email) ||
    !siteConfig.locale.supported.some((locale) => locale === body.locale)
  )
    return null;
  return {
    email: normalizeEmail(body.email),
    locale: body.locale as SubscriptionRequest["locale"],
  };
}
