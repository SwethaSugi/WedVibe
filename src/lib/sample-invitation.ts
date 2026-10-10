import { DEFAULT_INVITATION_DATA, type InvitationData } from "@/lib/invitation-types";

// Sample photos shown only on template previews/demos, so every section (hero, groom/bride
// portraits, gallery) appears filled in. Never used on a real invitation unless uploaded.
const SAMPLE_PHOTOS = ["/defaults/royal-gold-couple.jpg", "/defaults/floral-love-couple.jpg", "/defaults/modern-elegant-couple.jpg"];

const HERO_PHOTO: Record<string, string> = {
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
};

/** Filled-in sample details for previewing a template (sample names, dates and photos). */
export function sampleInvitationData(componentKey: string, couple: { groom: string; bride: string } = { groom: "Romeo", bride: "Juliet" }): InvitationData {
  const hero = HERO_PHOTO[componentKey] ?? SAMPLE_PHOTOS[0];
  return {
    ...DEFAULT_INVITATION_DATA,
    groomName: couple.groom,
    brideName: couple.bride,
    weddingDate: "2026-12-25",
    weddingTime: "09:00 AM",
    events: [
      { id: "evt-1", eventName: "Wedding", eventTime: "9:00 AM" },
      { id: "evt-2", eventName: "Reception", eventTime: "6:00 PM" },
    ],
    venueName: "Sri Mahal",
    venueAddress: "Chennai, Tamil Nadu",
    loveStory: "We met at a coffee shop in 2021 and have been inseparable ever since.",
    // No coupleImage on purpose: the groom + bride portraits then render as the hero, so the
    // preview shows that layout too.
    groomImage: hero,
    brideImage: SAMPLE_PHOTOS.find((p) => p !== hero) ?? hero,
    galleryImages: SAMPLE_PHOTOS,
  };
}
