import { NewsletterError, subscribe } from "@/lib/contentful/newsletter.server";
import { parseSubscription } from "@/lib/newsletter/validation";
import type { SubscriptionResponse } from "@/lib/newsletter/types";

export const runtime = "nodejs";

function reply(body: SubscriptionResponse, status: number) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...(status === 429 ? { "Retry-After": "60" } : {}) },
  });
}

export async function POST(request: Request) {
  // TODO(deployment): configure Vercel Firewall IP rate limiting for this exact
  // POST path before production. In-memory counters do not protect serverless replicas.
  // Future CAPTCHA verification belongs here, before any Management API calls.
  let input: unknown;
  try {
    if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json"))
      return reply({ success: false, status: "invalid" }, 400);
    const raw = await request.text();
    if (raw.length > 2048) return reply({ success: false, status: "invalid" }, 400);
    input = JSON.parse(raw);
  } catch {
    return reply({ success: false, status: "invalid" }, 400);
  }
  const data = parseSubscription(input);
  if (!data) return reply({ success: false, status: "invalid" }, 400);
  try {
    return reply({ success: true, status: await subscribe(data) }, 200);
  } catch (error) {
    const limited = error instanceof NewsletterError && error.status === 429;
    return reply(
      { success: false, status: limited ? "rate_limited" : "error" },
      limited ? 429 : 502,
    );
  }
}
