import { afterEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/newsletter/subscribe/route";
import { parseSubscription } from "@/lib/newsletter/validation";

const email = "guest@example.com";
const input = { email, locale: "sr" };
const entry = (active = true, published = false) => ({
  sys: { id: "test", version: 2, ...(published ? { publishedVersion: 1 } : {}) },
  fields: {
    email: { "en-US": email },
    active: { "en-US": active },
    unsubscribedAt: { "en-US": "2025-01-01T00:00:00Z" },
  },
});
const model = {
  sys: { version: 2, publishedVersion: 1 },
  fields: ["email", "active", "locale", "source", "consentAt", "unsubscribedAt"].map((id) => ({
    id,
    omitted: false,
  })),
};
function mockApi(responses: Array<unknown | number>) {
  vi.stubEnv("CONTENTFUL_SPACE_ID", "test");
  vi.stubEnv("CONTENTFUL_MANAGEMENT_TOKEN", "test-secret");
  vi.stubEnv("CONTENTFUL_ENVIRONMENT_ID", "stage");
  const queue = [model, { items: [{ code: "en-US", default: true }] }, ...responses];
  const fetch = vi.fn(async () => {
    const result = queue.shift();
    if (result === undefined) throw new Error("Unexpected call");
    return typeof result === "number"
      ? new Response("{}", { status: result })
      : Response.json(result);
  });
  vi.stubGlobal("fetch", fetch);
  return fetch;
}
const request = (body: unknown = input) =>
  new Request("http://localhost/api/newsletter/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("newsletter API", () => {
  it.each([
    { email: "invalid", locale: "sr" },
    { locale: "sr" },
    { email, locale: "xx" },
    { ...input, extra: true },
  ])("rejects invalid input %j without upstream calls", async (body) => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    expect((await POST(request(body))).status).toBe(400);
    expect(fetch).not.toHaveBeenCalled();
  });
  it("normalizes uppercase and whitespace", () =>
    expect(parseSubscription({ email: " GUEST@EXAMPLE.COM ", locale: "sr" })).toEqual(input));
  it("creates and publishes via backend with Delivery-visible fields", async () => {
    const fetch = mockApi([{ items: [] }, entry(), entry(true, true)]);
    const response = await POST(request());
    expect(await response.json()).toEqual({ success: true, status: "subscribed" });
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(fetch.mock.calls).toHaveLength(5);
    const calls = vi.mocked(globalThis.fetch).mock.calls;
    expect(String(calls[3][0])).toMatch(/entries\/newsletter-/);
    expect(JSON.parse(String(calls[3][1]?.body)).fields.email).toEqual({ "en-US": email });
    expect(String(calls[4][0])).toMatch(/\/published$/);
  });
  it("returns active duplicate without writing", async () => {
    const fetch = mockApi([{ items: [entry(true, true)] }]);
    expect(await (await POST(request())).json()).toEqual({
      success: true,
      status: "already_subscribed",
    });
    expect(fetch).toHaveBeenCalledTimes(3);
  });
  it("reactivates, renews consent and removes unsubscribe date", async () => {
    mockApi([{ items: [entry(false, true)] }, entry(), entry(true, true)]);
    expect(await (await POST(request())).json()).toEqual({ success: true, status: "resubscribed" });
    const fields = JSON.parse(String(vi.mocked(fetch).mock.calls[3][1]?.body)).fields;
    expect(fields.unsubscribedAt).toBeUndefined();
    expect(fields.active).toEqual({ "en-US": true });
    expect(fields.locale).toEqual({ "en-US": "sr" });
    expect(fields.source).toEqual({ "en-US": "footer" });
    expect(Date.parse(fields.consentAt["en-US"])).not.toBeNaN();
  });
  it.each([
    [{ items: [] }, 500],
    [{ items: [] }, entry(), 500],
  ])("sanitizes create/publish failure %j", async (...responses) => {
    mockApi(responses);
    const response = await POST(request());
    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({ success: false, status: "error" });
  });
  it.each([409, 422])("recovers race/unique conflict %i", async (status) => {
    mockApi([{ items: [] }, status, { items: [entry(true, true)] }]);
    expect(await (await POST(request())).json()).toEqual({
      success: true,
      status: "already_subscribed",
    });
  });
  it("retries publishing existing draft", async () => {
    const fetch = mockApi([{ items: [entry()] }, entry(true, true)]);
    expect((await POST(request())).status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(4);
  });
  it("returns upstream rate limit", async () => {
    mockApi([429]);
    const response = await POST(request());
    expect(response.status).toBe(429);
  });
  it("rejects models with missing subscription fields", async () => {
    const fetch = mockApi([]);
    fetch.mockImplementationOnce(async () =>
      Response.json({ ...model, fields: [{ id: "email", omitted: false }] }),
    );
    expect((await POST(request())).status).toBe(502);
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
