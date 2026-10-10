import type { Metadata } from "next";

// Private customer links: keep them out of search engines.
export const metadata: Metadata = {
  title: "Your wedding details",
  robots: { index: false, follow: false },
};

export default function DetailsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
