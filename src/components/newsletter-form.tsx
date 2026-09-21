"use client";

import { useId, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { isValidEmail, normalizeEmail } from "@/lib/newsletter/validation";

export function NewsletterForm() {
  const t = useTranslations("Footer");
  const locale = useLocale();
  const id = useId();
  const pending = useRef(false);
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<"success" | "duplicate" | "invalid" | "error" | null>(
    null,
  );
  const valid = isValidEmail(email);
  const invalid = touched && !valid;

  return (
    <form
      className="mt-6 max-w-sm"
      noValidate
      aria-busy={loading}
      onSubmit={async (event) => {
        event.preventDefault();
        if (pending.current) return;
        if (!valid) {
          setTouched(true);
          setMessage("invalid");
          return;
        }
        pending.current = true;
        setLoading(true);
        setMessage(null);
        try {
          const response = await fetch("/api/newsletter/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: normalizeEmail(email), locale }),
            cache: "no-store",
            signal: AbortSignal.timeout(15_000),
          });
          const result: unknown = await response.json();
          if (!result || typeof result !== "object" || !("status" in result))
            throw new Error("Invalid response");
          if (
            response.ok &&
            "success" in result &&
            result.success === true &&
            ["subscribed", "resubscribed", "already_subscribed"].includes(String(result.status))
          ) {
            setMessage(result.status === "already_subscribed" ? "duplicate" : "success");
            setEmail("");
            setTouched(false);
          } else setMessage(response.status === 400 ? "invalid" : "error");
        } catch {
          setMessage("error");
        } finally {
          pending.current = false;
          setLoading(false);
        }
      }}
    >
      <label htmlFor={id} className="sr-only">
        {t("emailLabel")}
      </label>
      <div className="flex items-center gap-2 rounded-[1.25rem] border-2 border-white/30 bg-white/10 p-1.5 focus-within:border-[#e7c37c]">
        <input
          id={id}
          type="email"
          name="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          required
          maxLength={254}
          value={email}
          disabled={loading}
          aria-invalid={invalid || message === "invalid"}
          aria-describedby={`${id}-consent ${id}-message`}
          placeholder={t("emailPlaceholder")}
          onBlur={() => {
            setEmail(normalizeEmail(email));
            setTouched(true);
          }}
          onChange={(event) => {
            setEmail(event.target.value);
            setMessage(null);
          }}
          className="min-w-0 flex-1 rounded-xl bg-transparent px-3 py-3 text-sm text-white placeholder:text-stone-400 focus-visible:outline-2 focus-visible:outline-[#e7c37c] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!valid || loading}
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-[0.875rem] bg-[#d6ad63] text-stone-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e7c37c] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="sr-only">{t(loading ? "loading" : "subscribe")}</span>
          {loading ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-6 animate-spin motion-reduce:animate-none"
            />
          ) : (
            <ArrowRight aria-hidden="true" className="size-6" />
          )}
        </button>
      </div>
      <p id={`${id}-consent`} className="mt-3 text-xs leading-5 text-stone-300">
        {t("consent")}
      </p>
      <p
        id={`${id}-message`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="mt-3 text-sm leading-5 text-stone-100"
      >
        {message ? t(message) : invalid ? t("invalid") : ""}
      </p>
    </form>
  );
}
