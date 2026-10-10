import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { SHOWCASE_URL } from "@/showcase/config";
import "./globals.css";

// Root layout of the showcase site (only used by `npm run build:showcase`).
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(SHOWCASE_URL),
  title: "WedVibe — Digital Wedding Invitation Designs",
  description: "Explore live digital wedding invitation designs: animated openings, music, countdown, photos and maps.",
};

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#fbf6f2] text-neutral-900">{children}</body>
    </html>
  );
}
