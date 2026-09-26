import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TemplateRenderer } from "@/templates/renderer";
import { DEFAULT_INVITATION_DATA } from "@/lib/invitation-types";
import { UseTemplateButton } from "@/components/UseTemplateButton";

export default async function TemplatePreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const template = await prisma.template.findUnique({ where: { slug } });

  if (!template || template.status === "INACTIVE") {
    notFound();
  }

  // Sample photos shown only on this marketplace preview page, so shoppers can see every
  // section (hero, groom/bride portraits, gallery) filled in — never shown in the editor
  // or on a real invitation unless the couple uploads their own photos.
  const ALL_SAMPLE_PHOTOS = [
    "/defaults/royal-gold-couple.jpg",
    "/defaults/floral-love-couple.jpg",
    "/defaults/modern-elegant-couple.jpg",
  ];
  const heroPhoto = {
    "royal-gold": "/defaults/royal-gold-couple.jpg",
    "floral-love": "/defaults/floral-love-couple.jpg",
    "modern-elegant": "/defaults/modern-elegant-couple.jpg",
    "royal-rajputana": "/defaults/royal-gold-couple.jpg",
    "celestial-cinema": "/defaults/modern-elegant-couple.jpg",
    "boho-botanica": "/defaults/floral-love-couple.jpg",
    "aura-minimal": "/defaults/modern-elegant-couple.jpg",
    "haldi-sunshine": "/defaults/royal-gold-couple.jpg",
    "mehendi-nights": "/defaults/floral-love-couple.jpg",
    "modern-aura": "/defaults/modern-elegant-couple.jpg",
    "emerald-nikah": "/defaults/floral-love-couple.jpg",
    "ring-of-eternity": "/defaults/modern-elegant-couple.jpg",
    "serene-chapel": "/defaults/floral-love-couple.jpg",
    "temple-bells": "/defaults/royal-gold-couple.jpg",
    "velvet-royale": "/defaults/royal-gold-couple.jpg",
    "champagne-noir": "/defaults/modern-elegant-couple.jpg",
    "cosmic-vows": "/defaults/modern-elegant-couple.jpg",
    "riverside-heritage": "/defaults/royal-gold-couple.jpg",
    "royal-punjabi": "/defaults/royal-gold-couple.jpg",
    "wedding-chronicle": "/defaults/floral-love-couple.jpg",
    "golden-doors": "/defaults/royal-gold-couple.jpg",
    "blush-seal": "/defaults/floral-love-couple.jpg",
    "midnight-promise": "/defaults/modern-elegant-couple.jpg",
    "sacred-gates": "/defaults/royal-gold-couple.jpg",
    "beach-horizon": "/defaults/modern-elegant-couple.jpg",
    "book-of-vows": "/defaults/floral-love-couple.jpg",
    "temple-curtains": "/defaults/royal-gold-couple.jpg",
    "paper-blossom": "/defaults/floral-love-couple.jpg",
    "luxe-gift-box": "/defaults/modern-elegant-couple.jpg",
    "royal-nikah-vault": "/defaults/floral-love-couple.jpg",
    "velvet-envelope": "/defaults/royal-gold-couple.jpg",
    "silk-scroll": "/defaults/royal-gold-couple.jpg",
  }[template.componentKey];

  const sampleData = {
    ...DEFAULT_INVITATION_DATA,
    groomName: "Romeo",
    brideName: "Juliet",
    weddingDate: "2026-12-25",
    weddingTime: "09:00 AM",
    events: [
      { id: "evt-1", eventName: "Wedding", eventTime: "9:00 AM" },
      { id: "evt-2", eventName: "Reception", eventTime: "6:00 PM" },
    ],
    venueName: "Sri Mahal",
    venueAddress: "Chennai, Tamil Nadu",
    loveStory: "We met at a coffee shop in 2021 and have been inseparable ever since.",
    // No coupleImage here on purpose: leaving it unset lets the groom + bride portraits
    // render as the hero instead, so this preview demonstrates that layout too.
    groomImage: heroPhoto,
    brideImage: ALL_SAMPLE_PHOTOS.find((p) => p !== heroPhoto) ?? heroPhoto,
    galleryImages: ALL_SAMPLE_PHOTOS,
  };

  return (
    <div className="w-full">
      <div className="border-b border-neutral-200 bg-white sticky top-16 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-neutral-400">{template.category}</p>
            <h1 className="text-lg sm:text-xl font-semibold truncate">{template.name}</h1>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <p className="text-lg font-semibold">₹{template.price}</p>
            <UseTemplateButton templateId={template.id} templateSlug={template.slug} />
          </div>
        </div>
      </div>

      <div className="bg-neutral-100 py-8 sm:py-10 px-4">
        <div className="max-w-md mx-auto mb-5 text-center">
          {template.description && <p className="text-sm text-neutral-600">{template.description}</p>}
          <p className="text-xs text-neutral-400 mt-1.5">Shown with sample names and photos — your own details replace them.</p>
        </div>
        {/* `isolate` keeps the template's own z-indexed layers (opening doors/seals, petals)
            inside this card, so they never paint over the sticky site header while scrolling. */}
        <div className="relative isolate max-w-md mx-auto rounded-3xl overflow-hidden shadow-2xl border border-neutral-200">
          <TemplateRenderer componentKey={template.componentKey} data={sampleData} />
        </div>
      </div>
    </div>
  );
}
