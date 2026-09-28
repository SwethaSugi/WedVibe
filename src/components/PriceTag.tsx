import { priceInfo, type Priced } from "@/lib/pricing";

const inr = (n: number) => n.toLocaleString("en-IN");

const SIZES = {
  sm: { price: "text-base", original: "text-xs", badge: "text-[10px] px-1.5 py-0.5" },
  md: { price: "text-lg", original: "text-sm", badge: "text-[11px] px-2 py-0.5" },
};

/**
 * A template's price. With an active offer it shows the regular price struck through, the offer
 * price, and a "% OFF" badge; otherwise just the price.
 */
export function PriceTag({
  template,
  size = "sm",
  priceClassName = "text-rose-700",
  className = "",
}: {
  template: Priced;
  size?: keyof typeof SIZES;
  priceClassName?: string;
  className?: string;
}) {
  const { price, original, percentOff } = priceInfo(template);
  const s = SIZES[size];

  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 ${className}`}>
      {original !== null && (
        <span className={`${s.original} text-neutral-400 line-through decoration-neutral-400/80`}>
          <span className="sr-only">Regular price </span>₹{inr(original)}
        </span>
      )}
      <span className={`${s.price} font-semibold ${priceClassName}`}>
        {original !== null && <span className="sr-only">Offer price </span>}₹{inr(price)}
      </span>
      {percentOff > 0 && (
        <span className={`${s.badge} self-center rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 whitespace-nowrap`}>
          {percentOff}% OFF
        </span>
      )}
    </span>
  );
}
