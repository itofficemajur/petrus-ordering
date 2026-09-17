import localFont from "next/font/local";
import { getTranslations } from "next-intl/server";

const signatureFont = localFont({
  src: "../assets/fonts/Caveat-signature.ttf",
  weight: "400",
  display: "swap",
  fallback: ["Brush Script MT", "cursive"],
});

export async function BrandSignature() {
  const t = await getTranslations("Header");

  return (
    <div
      className={`${signatureFont.className} relative top-1 shrink-0 text-brand-gold sm:top-1.5 max-[360px]:top-0`}
    >
      <span className="block -rotate-[5deg] text-center text-[1.7rem] leading-none whitespace-nowrap sm:text-[2.2rem]">
        {t("orderOnline")}
      </span>
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 220 42"
        fill="none"
        className="ml-4 block h-6 w-32 sm:ml-8 sm:h-9 sm:w-52 max-[360px]:hidden"
      >
        <path
          d="M3 31C60 8 143 6 206 25"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="m191 17 15 8-15 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
