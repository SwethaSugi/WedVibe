import { InvitationData } from "@/lib/invitation-types";
import { Countdown } from "../Countdown";
import { Reveal } from "../Reveal";

// Formats "YYYY-MM-DD" as Indian-style "25 December 2026".
function formatIndianDate(dateStr?: string): string {
  if (!dateStr || !dateStr.trim()) return "Select Date";
  const parts = dateStr.trim().split("-");
  const d =
    parts.length === 3
      ? new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10))
      : new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

// Rozha One is heavy: step long names down a size so words don't split on phones.
const nameSize = (name: string) =>
  name.length > 16 ? "text-2xl sm:text-3xl" : name.length > 11 ? "text-[1.8rem] sm:text-4xl" : "text-4xl sm:text-5xl";

const FLIP_BACKS = [
  { icon: "👑", text: "Blessed" },
  { icon: "🥁", text: "Celebrate" },
  { icon: "💛", text: "Forever" },
];

/**
 * RoyalPunjabi — North Indian.
 * Saffron and crimson festivity: couple photo hero, sparkling bursts and
 * auto-flipping photo cards.
 */
export function RoyalPunjabi({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venue = data.venueName?.trim() || "Wedding Venue";
  const address = data.venueAddress?.trim() || "";

  const hasGroomParents = !!(data.groomFatherName?.trim() || data.groomMotherName?.trim());
  const hasBrideParents = !!(data.brideFatherName?.trim() || data.brideMotherName?.trim());
  const hasFamily = hasGroomParents || hasBrideParents;

  // Only the couple's own photos — no stock fallback on a real invitation.
  const heroPhoto = data.coupleImage || data.brideImage || data.groomImage;
  const gallery = data.galleryImages?.filter(Boolean).slice(0, 3) ?? [];

  return (
    <div className="min-h-full bg-[#3B0713] text-[#FFF7ED] font-serif antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rozha+One&family=Plus+Jakarta+Sans:wght@500;700&display=swap');
        .font-rozha { font-family: 'Rozha One', serif; }
        .font-sans-festive { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes rp-flip {
          0%, 45% { transform: rotateY(0deg); }
          50%, 95% { transform: rotateY(180deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes rp-burst {
          0%, 100% { transform: scale(0.9); opacity: 0.3; }
          50% { transform: scale(1.15); opacity: 0.8; filter: drop-shadow(0 0 12px #F59E0B); }
        }

        .rp-burst { animation: rp-burst 3s ease-in-out infinite; }
        .rp-flip-1 { animation: rp-flip 8s ease-in-out infinite; transform-style: preserve-3d; }
        .rp-flip-2 { animation: rp-flip 8s ease-in-out infinite 2.5s; transform-style: preserve-3d; }
        .rp-flip-3 { animation: rp-flip 8s ease-in-out infinite 5s; transform-style: preserve-3d; }

        .rp-gold-text {
          background: linear-gradient(135deg, #FFFBEB 0%, #FBBF24 45%, #F59E0B 75%, #D97706 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .rp-burst, .rp-flip-1, .rp-flip-2, .rp-flip-3 { animation: none !important; }
        }
      `}</style>

      {/* Sparkle bursts — absolute so they stay inside the invitation (e.g. the editor preview) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden" aria-hidden>
        <div className="absolute top-24 left-4 text-xl rp-burst">✨</div>
        <div className="absolute top-40 right-4 text-2xl rp-burst" style={{ animationDelay: "1s" }}>🎆</div>
        <div className="absolute top-[70%] left-3 text-xl rp-burst" style={{ animationDelay: "2s" }}>✨</div>
      </div>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center bg-[#4A0A19] shadow-2xl border-x-4 border-[#F59E0B]/40 pb-12">
        {/* Hero: couple photo in saffron and crimson, names in front */}
        <section className="relative w-full h-[600px] overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroPhoto ? (
              <img src={heroPhoto} alt={`${groom} and ${bride}`} className="w-full h-full object-cover brightness-[0.7] contrast-[1.1]" />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_#C2410C_0%,_#7F1D1D_45%,_#4A0A19_100%)] flex items-start justify-center pt-24">
                <svg className="w-56 h-56 text-amber-300/20" viewBox="0 0 100 100" fill="currentColor" aria-hidden>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <ellipse key={i} cx="50" cy="22" rx="6" ry="20" transform={`rotate(${i * 30} 50 50)`} />
                  ))}
                  <circle cx="50" cy="50" r="10" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#4A0A19] via-[#4A0A19]/55 to-black/60" />
            <div className="absolute inset-0 bg-[#EA580C]/20 mix-blend-color" />
          </div>

          <div className="relative z-10 flex justify-center pt-2">
            <div className="px-4 py-1 rounded-full bg-[#780E28]/80 border border-[#F59E0B]/60 backdrop-blur-md">
              <span className="text-[11px] font-sans-festive font-bold tracking-widest text-[#FDE68A] uppercase">🥁 Wedding Celebration 🥁</span>
            </div>
          </div>

          <div className="relative z-10 text-center pb-4">
            <span className="text-xs uppercase tracking-[0.3em] font-sans-festive text-[#FBBF24] font-bold block mb-1">With joy, we invite you to the wedding of</span>
            <h1 className={`font-rozha ${nameSize(groom)} rp-gold-text leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]`}>{groom}</h1>
            <div className="font-rozha text-2xl text-[#F97316] my-1">weds</div>
            <h1 className={`font-rozha ${nameSize(bride)} rp-gold-text leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]`}>{bride}</h1>
            <div className="mt-4 px-5 py-2 rounded-full bg-[#2A050E]/90 border border-[#F59E0B]/50 text-xs font-sans-festive font-semibold text-[#FDE68A] inline-block shadow-lg">
              📅 {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ⏰ ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full px-6 space-y-7 bg-gradient-to-b from-[#4A0A19] to-[#2E0510]">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 rounded-2xl bg-[#610C22]/60 border border-[#F59E0B]/30 text-center text-xs space-y-2 font-sans-festive text-amber-100">
                {hasGroomParents && (
                  <p>
                    <span className="text-[#FBBF24] block text-[10px] uppercase font-bold tracking-widest">Groom&apos;s Family</span>
                    Son of {[data.groomMotherName, data.groomFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="h-[1px] w-12 bg-amber-400/30 mx-auto" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-[#FBBF24] block text-[10px] uppercase font-bold tracking-widest">Bride&apos;s Family</span>
                    Daughter of {[data.brideMotherName, data.brideFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <Countdown weddingDate={data.weddingDate} className="text-[#FBBF24] font-rozha" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={200}>
              <div className="p-5 rounded-2xl bg-[#590B1F]/60 border-y-2 border-[#F59E0B]/40 text-center font-rozha text-sm sm:text-base leading-relaxed text-[#FEF3C7]">
                &ldquo;{data.welcomeMessage}&rdquo;
              </div>
            </Reveal>
          )}

          {data.loveStory && (
            <Reveal delay={225}>
              <div className="text-center">
                <h4 className="font-rozha text-xl text-[#FBBF24] mb-2">Our Story</h4>
                <p className="text-sm font-sans-festive leading-relaxed text-amber-100/90">{data.loveStory}</p>
              </div>
            </Reveal>
          )}

          {/* Auto-flipping photo cards */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="py-2">
                <div className="text-center mb-4">
                  <span className="text-xs uppercase tracking-widest font-sans-festive font-bold text-[#FBBF24]">✨ Our Moments ✨</span>
                </div>
                <div className={`grid gap-2.5 sm:gap-3 px-1 [perspective:800px] ${gallery.length === 1 ? "grid-cols-1 max-w-[180px] mx-auto" : gallery.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {gallery.map((img, idx) => (
                    <div key={idx} className={`relative h-44 sm:h-48 rounded-2xl shadow-xl rp-flip-${idx + 1}`}>
                      <div className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-[#F59E0B] bg-black [backface-visibility:hidden]">
                        <img src={img} alt="Moment" className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute inset-0 rounded-2xl overflow-hidden border-2 border-[#F59E0B] bg-gradient-to-br from-[#881337] to-[#4C0519] [transform:rotateY(180deg)] [backface-visibility:hidden] flex flex-col items-center justify-center p-3 text-center">
                        <span className="text-2xl mb-1">{FLIP_BACKS[idx].icon}</span>
                        <span className="text-xs font-rozha text-[#FDE68A]">{FLIP_BACKS[idx].text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          <Reveal delay={300}>
            <div className="p-6 rounded-2xl bg-[#610C22]/70 border border-[#F59E0B]/40 text-center">
              <span className="text-2xl">🏰</span>
              <h3 className="font-rozha text-2xl text-[#FEF3C7] mt-1">{venue}</h3>
              <p className="text-xs text-amber-200/80 font-sans-festive mt-1 max-w-sm mx-auto">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#2E0510] font-sans-festive font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  Get Directions
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-3 font-sans-festive">
                <h4 className="text-center font-rozha text-2xl text-[#FBBF24]">Wedding Functions</h4>
                {data.events.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-xl bg-[#590B1F]/60 border border-[#F59E0B]/25">
                    <div className="flex justify-between items-baseline gap-3 font-bold">
                      <span className="text-[#FEF3C7] font-rozha text-base">{evt.eventName}</span>
                      <span className="text-xs text-[#FBBF24] shrink-0">{evt.eventTime}</span>
                    </div>
                    {evt.eventDate && <div className="text-xs text-amber-300 mt-0.5">{formatIndianDate(evt.eventDate)}</div>}
                    {evt.venue && <div className="text-xs text-amber-100/80 mt-1">📍 {evt.venue}</div>}
                    {evt.description && <p className="text-xs text-amber-200/70 mt-1 italic">{evt.description}</p>}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {data.contactDetails && <p className="text-center text-xs text-amber-200/80 font-sans-festive">📞 {data.contactDetails}</p>}

          <div className="text-center pt-6 border-t border-[#F59E0B]/30 font-rozha">
            <span className="text-xs text-amber-300 uppercase tracking-widest font-sans-festive block mb-1">Music, dance and celebrations await you!</span>
            <div className="text-2xl text-[#FEF3C7]">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
