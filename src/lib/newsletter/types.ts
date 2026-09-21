import type { siteConfig } from "@/config/site";

export type NewsletterLocale = (typeof siteConfig.locale.supported)[number];
export type SubscriptionRequest = { email: string; locale: NewsletterLocale };
export type SubscriptionStatus = "subscribed" | "already_subscribed" | "resubscribed";
export type SubscriptionResponse =
  | { success: true; status: SubscriptionStatus }
  | { success: false; status: "invalid" | "error" | "rate_limited" };
