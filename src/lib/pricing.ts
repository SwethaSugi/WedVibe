// Template pricing with an optional offer. The offer only applies while it is a positive amount
// below the regular price, so an outdated offer (e.g. the price was later lowered below it) is
// ignored rather than charged. Used for both display and the amount actually charged.

export interface Priced {
  price: number;
  offerPrice?: number | null;
}

export interface PriceInfo {
  /** What the customer pays. */
  price: number;
  /** The regular price to show struck through, or null when there's no offer. */
  original: number | null;
  /** Whole-number discount percentage, 0 when there's no offer. */
  percentOff: number;
}

export function priceInfo(t: Priced): PriceInfo {
  const offer = t.offerPrice;
  if (offer == null || offer <= 0 || offer >= t.price) return { price: t.price, original: null, percentOff: 0 };
  return { price: offer, original: t.price, percentOff: Math.round((1 - offer / t.price) * 100) };
}

/** The amount charged for a template. */
export function effectivePrice(t: Priced): number {
  return priceInfo(t).price;
}
