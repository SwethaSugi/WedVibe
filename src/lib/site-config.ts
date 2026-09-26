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
