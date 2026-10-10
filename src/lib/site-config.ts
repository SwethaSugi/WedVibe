// Business contact details shown on the public site.

export const BUSINESS_NAME = "WedVibe";

// WhatsApp number for "DM us" buttons, digits only with country code (wa.me format), set via
// NEXT_PUBLIC_SUPPORT_WHATSAPP in .env (never hard-coded here: the repository is public). It is
// only used inside wa.me links — never printed on the page.
export const SUPPORT_WHATSAPP = (process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP ?? "").replace(/\D/g, "");

// Optional details for the Contact page and policies — each is shown only when set in .env.
export const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL?.trim() || "";
export const BUSINESS_ADDRESS = process.env.NEXT_PUBLIC_BUSINESS_ADDRESS?.trim() || "";
export const SUPPORT_HOURS = process.env.NEXT_PUBLIC_SUPPORT_HOURS?.trim() || "Monday to Saturday, 10:00 AM – 7:00 PM IST";

// Opens a WhatsApp chat with the business; falls back to the Contact page if no number is set.
export function whatsappLink(message?: string) {
  if (!SUPPORT_WHATSAPP) return "/contact";
  return `https://wa.me/${SUPPORT_WHATSAPP}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

// How customers order, set by NEXT_PUBLIC_ORDER_MODE:
//   "whatsapp" (default) — customers browse and preview templates, then tap "Order on WhatsApp";
//                          the team builds and publishes the invitation from the admin panel.
//                          Customer login, My Invitations, the self-serve editor and online
//                          payment are switched off (their code stays, ready for "online").
//   "online"             — the self-serve flow: WhatsApp OTP login, editor and Razorpay checkout.
export const ORDER_MODE: "whatsapp" | "online" = process.env.NEXT_PUBLIC_ORDER_MODE === "online" ? "online" : "whatsapp";

/** WhatsApp message for ordering a template: name, price (with the regular price when on offer) and preview link. */
export function templateOrderMessage(t: { name: string; price: number; original?: number | null; previewUrl: string }) {
  const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  return [
    `Hello ${BUSINESS_NAME}!`,
    "",
    "I'd like to order this wedding invitation:",
    `• Template: ${t.name}`,
    `• Price: ${inr(t.price)}${t.original ? ` (regular ${inr(t.original)})` : ""}`,
    `• Preview: ${t.previewUrl}`,
    "",
    "Please share the next steps. Thank you!",
  ].join("\n");
}
