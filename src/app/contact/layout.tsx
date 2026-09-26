import type { Metadata } from "next";
import type { ReactNode } from "react";
import { BUSINESS_NAME } from "@/lib/site-config";

// The contact page itself is a client component (it has a form), so its metadata lives here.
export const metadata: Metadata = {
  title: `Contact Us — ${BUSINESS_NAME}`,
  description: `Get in touch with the ${BUSINESS_NAME} team about your invitation, payments or a custom design.`,
};

export default function ContactLayout({ children }: { children: ReactNode }) {
  return children;
}
