import { redirect } from "next/navigation";
import { ORDER_MODE } from "@/lib/site-config";

// Customer login, My Invitations, the self-serve editor and online payment only exist in the
// "online" ordering mode; with WhatsApp ordering (the default) these pages send visitors to the
// templates instead. See ORDER_MODE in src/lib/site-config.ts.
export default function OnlineOrderingOnly({ children }: { children: React.ReactNode }) {
  if (ORDER_MODE !== "online") redirect("/templates");
  return children;
}