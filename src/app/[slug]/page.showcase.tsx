import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TemplateRenderer } from "@/templates/renderer";
import { sampleInvitationData } from "@/lib/sample-invitation";
import { SHOWCASE_TEMPLATES } from "@/showcase/config";
import { ShareButton } from "@/showcase/ShareButton";

// One live design per link, e.g. /silk-scroll: the full invitation with sample details.
export const dynamicParams = false;

export function generateStaticParams() {
  return SHOWCASE_TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const t = SHOWCASE_TEMPLATES.find((x) => x.slug === slug);
  if (!t) return {};
  const title = `${t.name} — Digital Wedding Invitation | WedVibe`;
  const description = t.description ?? "Open this live digital wedding invitation design.";
  return {
    title,
    description,
    alternates: { canonical: `/${t.slug}` },
    openGraph: { title, description, url: `/${t.slug}`, type: "website", images: [{ url: `/og/${t.slug}.png`, width: 1200, height: 630, alt: t.name }] },
    twitter: { card: "summary_large_image", title, description, images: [`/og/${t.slug}.png`] },
  };
}

export default async function ShowcaseDesign({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = SHOWCASE_TEMPLATES.find((x) => x.slug === slug);
  if (!t) notFound();

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#f3e6dc] to-[#fbf6f2]">
      <div className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-[#ead9cc]">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2 min-w-0" aria-label="See all designs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-wedvibe.webp" alt="" className="w-9 h-9 rounded-full shrink-0" />
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[#5b1530] truncate">{t.name}</span>
              <span className="block text-[11px] text-neutral-500">All designs</span>
            </span>
          </a>
          <ShareButton title={`${t.name} — WedVibe`} />
        </div>
      </div>

      {/* `isolate` keeps the template's own layers (opening doors, seals, petals) under the bar. */}
      <div className="w-full max-w-md mx-auto sm:my-6 relative isolate overflow-hidden sm:rounded-3xl sm:shadow-2xl bg-white">
        <TemplateRenderer componentKey={t.componentKey} data={sampleInvitationData(t.componentKey, { groom: "Arjun", bride: "Meera" })} />
      </div>

      <p className="text-center text-xs text-neutral-400 py-6 px-4">Shown with sample names and photos · WedVibe digital wedding invitations</p>
    </div>
  );
}
