import "server-only";

import { createHash } from "node:crypto";
import type { SubscriptionRequest, SubscriptionStatus } from "@/lib/newsletter/types";

type Fields = Record<string, Record<string, string | boolean>>;
export type SubscriptionEntry = {
  sys: { id: string; version: number; publishedVersion?: number };
  fields: Fields;
};

export class NewsletterError extends Error {
  constructor(public readonly status: number) {
    super("Newsletter service unavailable");
  }
}

async function management<T>(path: string, init: RequestInit = {}): Promise<T> {
  const space = process.env.CONTENTFUL_SPACE_ID;
  const environment = process.env.CONTENTFUL_ENVIRONMENT_ID || "stage";
  const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!space || !token || environment !== "stage") throw new NewsletterError(500);
  const response = await fetch(
    `https://api.contentful.com/spaces/${encodeURIComponent(space)}/environments/${encodeURIComponent(environment)}/${path}`,
    {
      ...init,
      headers: {
        "Content-Type": "application/vnd.contentful.management.v1+json",
        Authorization: `Bearer ${token}`,
        ...init.headers,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!response.ok) throw new NewsletterError(response.status);
  return (await response.json()) as T;
}

async function getModelLocale() {
  const model = await management<{
    fields: { id: string }[];
    sys: { version: number; publishedVersion?: number };
  }>("content_types/subscribedEmail");
  // Delivery visibility is configured in Contentful; validate only model readiness.
  const required = ["email", "active", "locale", "source", "consentAt", "unsubscribedAt"];
  if (
    model.sys.publishedVersion !== model.sys.version - 1 ||
    required.some((id) => !model.fields.some((field) => field.id === id))
  )
    throw new NewsletterError(500);
  const locales = await management<{ items: { code: string; default: boolean }[] }>("locales");
  const locale = locales.items.find((item) => item.default)?.code;
  if (!locale) throw new NewsletterError(500);
  return locale;
}

export async function findSubscriptionByEmail(email: string) {
  const query = new URLSearchParams({
    content_type: "subscribedEmail",
    "fields.email": email,
    limit: "1",
  });
  const result = await management<{ items: SubscriptionEntry[] }>(`entries?${query}`);
  return result.items[0];
}

function subscriptionFields(data: SubscriptionRequest, fieldLocale: string): Fields {
  return Object.fromEntries(
    Object.entries({
      ...data,
      active: true,
      source: "footer",
      consentAt: new Date().toISOString(),
    }).map(([key, value]) => [key, { [fieldLocale]: value }]),
  );
}

export function createSubscription(data: SubscriptionRequest, fieldLocale: string) {
  // A stable ID makes simultaneous creates conflict even while entries are drafts.
  const id = `newsletter-${createHash("sha256").update(data.email).digest("hex").slice(0, 48)}`;
  return management<SubscriptionEntry>(`entries/${id}`, {
    method: "PUT",
    headers: { "X-Contentful-Content-Type": "subscribedEmail" },
    body: JSON.stringify({ fields: subscriptionFields(data, fieldLocale) }),
  });
}

export function reactivateSubscription(
  entry: SubscriptionEntry,
  data: SubscriptionRequest,
  fieldLocale: string,
) {
  const fields = { ...entry.fields, ...subscriptionFields(data, fieldLocale) };
  delete fields.unsubscribedAt;
  return management<SubscriptionEntry>(`entries/${encodeURIComponent(entry.sys.id)}`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(entry.sys.version) },
    body: JSON.stringify({ fields }),
  });
}

export function publishSubscription(entry: SubscriptionEntry) {
  return management<SubscriptionEntry>(`entries/${encodeURIComponent(entry.sys.id)}/published`, {
    method: "PUT",
    headers: { "X-Contentful-Version": String(entry.sys.version) },
  });
}

export async function subscribe(data: SubscriptionRequest): Promise<SubscriptionStatus> {
  const fieldLocale = await getModelLocale();
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const existing = await findSubscriptionByEmail(data.email);
      if (existing?.fields.active?.[fieldLocale] === true) {
        // Recover a draft left behind by a failed publish before reporting success.
        if (existing.sys.publishedVersion !== existing.sys.version - 1)
          await publishSubscription(existing);
        return "already_subscribed";
      }
      const entry = existing
        ? await reactivateSubscription(existing, data, fieldLocale)
        : await createSubscription(data, fieldLocale);
      await publishSubscription(entry);
      return existing ? "resubscribed" : "subscribed";
    } catch (error) {
      if (
        !(error instanceof NewsletterError) ||
        ![409, 422].includes(error.status) ||
        attempt === 2
      )
        throw error;
    }
  }
  throw new NewsletterError(502);
}
