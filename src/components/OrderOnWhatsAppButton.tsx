"use client";

import { useEffect, useState } from "react";
import { priceInfo, type Priced } from "@/lib/pricing";
import { templateOrderMessage, whatsappLink } from "@/lib/site-config";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

/**
 * "Order on WhatsApp": opens a chat with the business, pre-filled with the template's name,
 * price and preview link. The business number is only used inside the link, never shown.
 */
export function OrderOnWhatsAppButton({
  template,
  className = "",
  label = "Order on WhatsApp",
  tabIndex,
}: {
  template: Priced & { name: string; slug: string };
  className?: string;
  label?: string;
  tabIndex?: number;
}) {
  // The site address is only known in the browser (it differs between local, preview and live).
  const [origin, setOrigin] = useState(process.env.NEXT_PUBLIC_APP_URL ?? "");
  useEffect(() => setOrigin(window.location.origin), []);

  const { price, original } = priceInfo(template);
  const href = whatsappLink(templateOrderMessage({ name: template.name, price, original, previewUrl: `${origin}/templates/${template.slug}` }));
  const external = href.startsWith("http");

  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      tabIndex={tabIndex}
      className={`inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full bg-[#25D366] text-white font-medium shadow-sm hover:bg-[#1ebe5b] hover:shadow-md transition-all ${className}`}
    >
      <WhatsAppIcon className="w-4 h-4 shrink-0" />
      {label}
    </a>
  );
}
