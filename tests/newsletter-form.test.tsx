import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { NewsletterForm } from "@/components/newsletter-form";
import sr from "../messages/sr.json";
import en from "../messages/en.json";
import hu from "../messages/hu.json";
import de from "../messages/de.json";
import ru from "../messages/ru.json";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function form(locale = "sr", messages = sr) {
  render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <NewsletterForm />
    </NextIntlClientProvider>,
  );
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: " GUEST@EXAMPLE.COM " } });
  return screen.getByRole("button") as HTMLButtonElement;
}
it("disables invalid submission and displays validation", () => {
  const button = form();
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "bad" } });
  fireEvent.blur(screen.getByRole("textbox"));
  expect(button.disabled).toBe(true);
  expect(screen.getByRole("status").textContent).toBe(sr.Footer.invalid);
});
it("shows loading and prevents repeat requests", async () => {
  let resolve!: (response: Response) => void;
  const fetch = vi.fn(
    () =>
      new Promise<Response>((done) => {
        resolve = done;
      }),
  );
  vi.stubGlobal("fetch", fetch);
  const button = form();
  fireEvent.click(button);
  expect(button.disabled).toBe(true);
  expect(button.textContent).toBe(sr.Footer.loading);
  fireEvent.submit(button.closest("form")!);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(JSON.parse(String(vi.mocked(globalThis.fetch).mock.calls[0][1]?.body))).toEqual({
    email: "guest@example.com",
    locale: "sr",
  });
  resolve(Response.json({ success: true, status: "subscribed" }));
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe(sr.Footer.success));
  expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe("");
});
it.each(["subscribed", "resubscribed", "already_subscribed", "error"])(
  "renders %s response",
  async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json(
          { success: status !== "error", status },
          { status: status === "error" ? 502 : 200 },
        ),
      ),
    );
    fireEvent.click(form());
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toBe(
        sr.Footer[
          status === "error" ? "error" : status === "already_subscribed" ? "duplicate" : "success"
        ],
      ),
    );
  },
);
it.each([
  ["sr", sr],
  ["en", en],
  ["hu", hu],
  ["de", de],
  ["ru", ru],
] as const)("renders and submits %s locale", async (locale, messages) => {
  const fetch = vi.fn(async () => Response.json({ success: true, status: "subscribed" }));
  vi.stubGlobal("fetch", fetch);
  const button = form(locale, messages);
  expect(button.textContent).toBe(messages.Footer.subscribe);
  fireEvent.click(button);
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe(messages.Footer.success));
});
it("shows network failure", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => {
      throw new Error("offline");
    }),
  );
  fireEvent.click(form());
  await waitFor(() => expect(screen.getByRole("status").textContent).toBe(sr.Footer.error));
});
