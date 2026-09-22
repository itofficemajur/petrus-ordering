import { Link } from "@/i18n/navigation";
import Image from "next/image";

import type { ProductDto } from "@/lib/api/types";

type Props = {
  product: ProductDto;
  formatPrice: (price: number) => string;
  saleLabel: string;
  unavailableLabel: string;
};

export function ProductCard({ product, formatPrice, saleLabel, unavailableLabel }: Props) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      {product.image && (
        <div className="relative aspect-[4/3] overflow-hidden bg-stone-100">
          <Image
            src={product.image.url}
            alt={product.image.description || product.image.title || product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {(product.onSale || !product.available) && (
          <div className="flex flex-wrap gap-2 text-xs font-semibold">
            {product.onSale && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-amber-900">
                {saleLabel}
              </span>
            )}
            {!product.available && (
              <span className="rounded-full bg-stone-200 px-2.5 py-1 text-stone-700">
                {unavailableLabel}
              </span>
            )}
          </div>
        )}
        <h2 className="text-lg font-semibold leading-snug text-stone-900">
          <Link
            href={{ pathname: "/products/[slug]", params: { slug: product.slug } }}
            className="hover:underline focus-visible:outline-2"
          >
            {product.title}
          </Link>
        </h2>
        {product.description && (
          <p className="text-sm leading-relaxed text-stone-600">{product.description}</p>
        )}
        <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-2">
          <span className="text-lg font-semibold text-stone-900">{formatPrice(product.price)}</span>
          {product.compareAtPrice !== null && product.compareAtPrice > product.price && (
            <span className="text-sm text-stone-500 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
