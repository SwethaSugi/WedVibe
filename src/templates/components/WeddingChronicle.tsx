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

// Cinzel Decorative is wide: step long names down a size so words don't split on phones.
const nameSize = (name: string) =>
  name.length > 16 ? "text-2xl sm:text-3xl" : name.length > 11 ? "text-[1.7rem] sm:text-4xl" : "text-3xl sm:text-4xl";

/**
 * WeddingChronicle — Multi-Event.
 * Indigo and saffron itinerary: drifting panorama couple photo, numbered
 * multi-day schedule and a spotlight gallery that focuses each photo in turn.
 */
export function WeddingChronicle({ data }: { data: InvitationData }) {
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
    <div className="min-h-full bg-[#0F1026] text-[#F8FAFC] font-sans antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Plus+Jakarta+Sans:wght@400;600;700&family=Playfair+Display:ital,wght@0,600;1,400&display=swap');
        .font-cinzel-dec { font-family: 'Cinzel Decorative', serif; }
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes wc-panorama {
          0%, 100% { transform: scale(1) translateX(0); }
          50% { transform: scale(1.08) translateX(-15px); }
        }
        @keyframes wc-focus1 {
          0%, 100% { transform: scale(1.08); border-color: #F59E0B; filter: brightness(1.05); }
          33%, 66% { transform: scale(0.92); border-color: #475569; filter: brightness(0.7); }
        }
        @keyframes wc-focus2 {
          0%, 66%, 100% { transform: scale(0.92); border-color: #475569; filter: brightness(0.7); }
          33% { transform: scale(1.08); border-color: #F59E0B; filter: brightness(1.05); }
        }
        @keyframes wc-focus3 {
          0%, 33%, 100% { transform: scale(0.92); border-color: #475569; filter: brightness(0.7); }
          66% { transform: scale(1.08); border-color: #F59E0B; filter: brightness(1.05); }
        }

        .wc-panorama { animation: wc-panorama 24s ease-in-out infinite; }
        .wc-focus-1 { animation: wc-focus1 9s ease-in-out infinite; }
        .wc-focus-2 { animation: wc-focus2 9s ease-in-out infinite; }
        .wc-focus-3 { animation: wc-focus3 9s ease-in-out infinite; }

        .wc-gold-text {
          background: linear-gradient(135deg, #FFFFFF 0%, #FDE68A 50%, #F59E0B 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .wc-panorama, .wc-focus-1, .wc-focus-2, .wc-focus-3 { animation: none !important; }
        }
      `}</style>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center bg-[#181B38] shadow-2xl border-x border-[#F59E0B]/30 pb-12 font-jakarta">
        {/* Hero: drifting panorama couple photo, names in front */}
        <section className="relative w-full h-[600px] overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroPhoto ? (
              <img src={heroPhoto} alt={`${groom} and ${bride}`} className="w-full h-full object-cover wc-panorama brightness-[0.7]" />
            ) : (
              <div className="w-full h-full bg-[linear-gradient(180deg,_#312E81_0%,_#7C2D12_55%,_#181B38_100%)]">
                <div className="absolute top-[38%] left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-amber-400/30 blur-2xl" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#181B38] via-[#181B38]/50 to-black/60" />
            <div className="absolute inset-0 bg-[#312E81]/30 mix-blend-color" />
          </div>

          <div className="relative z-10 flex justify-center pt-2">
            <span className="px-4 py-1 rounded-full bg-black/60 border border-[#F59E0B]/50 text-[10px] uppercase font-bold tracking-[0.25em] text-[#FDE68A] backdrop-blur-md">
              ✦ Wedding Celebrations ✦
            </span>
          </div>

          <div className="relative z-10 text-center pb-4">
            <span className="text-[10px] tracking-[0.3em] uppercase text-indigo-200 font-semibold mb-2 block">Join us for the celebrations of</span>
            <h1 className={`font-cinzel-dec ${nameSize(groom)} wc-gold-text font-bold leading-tight`}>{groom}</h1>
            <div className="font-playfair text-xl italic text-[#F59E0B] my-1">&amp;</div>
            <h1 className={`font-cinzel-dec ${nameSize(bride)} wc-gold-text font-bold leading-tight`}>{bride}</h1>
            <div className="mt-4 px-5 py-2 rounded-xl bg-black/70 border border-[#F59E0B]/40 text-xs font-medium text-amber-200 inline-block shadow-lg">
              {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full px-6 space-y-7 bg-[#181B38]">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center text-xs space-y-2 text-indigo-100">
                {hasGroomParents && (
                  <p>
                    <span className="text-[#FDE68A] block text-[10px] uppercase font-bold tracking-widest">Groom&apos;s Parents</span>
                    Son of {[data.groomMotherName, data.groomFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="h-[1px] w-12 bg-white/10 mx-auto" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-[#FDE68A] block text-[10px] uppercase font-bold tracking-widest">Bride&apos;s Parents</span>
                    Daughter of {[data.brideMotherName, data.brideFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <Countdown weddingDate={data.weddingDate} className="text-[#FDE68A] font-playfair" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={200}>
              <div className="p-5 rounded-2xl bg-white/[0.03] border-l-4 border-[#F59E0B] text-center font-playfair italic text-sm text-indigo-100">
                &ldquo;{data.welcomeMessage}&rdquo;
              </div>
            </Reveal>
          )}

          {data.loveStory && (
            <Reveal delay={225}>
              <div className="text-center">
                <h4 className="font-playfair text-xl text-[#FDE68A] mb-2">Our Story</h4>
                <p className="text-sm leading-relaxed text-indigo-100/90">{data.loveStory}</p>
              </div>
            </Reveal>
          )}

          {/* Spotlight gallery: each photo takes focus in turn (3 photos); a simple row otherwise */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="py-2">
                <div className="text-center mb-3">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#FDE68A]">Our Moments</span>
                </div>
                <div className="flex justify-center items-center gap-2 sm:gap-3 py-4 overflow-hidden">
                  {gallery.map((img, idx) => (
                    <div
                      key={idx}
                      className={`w-[6.5rem] sm:w-40 h-44 sm:h-48 rounded-2xl overflow-hidden border-2 border-[#F59E0B] shadow-2xl ${gallery.length === 3 ? `wc-focus-${idx + 1}` : ""}`}
                    >
                      <img src={img} alt="Moment" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          <Reveal delay={300}>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-[#F59E0B]/30 text-center">
              <span className="text-2xl">📍</span>
              <h3 className="font-playfair text-xl text-white font-bold mt-1">{venue}</h3>
              <p className="text-xs text-indigo-200 mt-1 max-w-sm mx-auto">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  Get Directions
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-3">
                <h4 className="text-center font-cinzel-dec text-xl text-[#FDE68A]">Schedule of Events</h4>
                {data.events.map((evt, index) => (
                  <div key={evt.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F59E0B]/20 border border-[#F59E0B]/40 flex items-center justify-center font-bold text-xs text-[#FDE68A] shrink-0 mt-0.5">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-baseline gap-3">
                        <span className="font-playfair font-bold text-sm text-white">{evt.eventName}</span>
                        <span className="text-xs text-[#F59E0B] shrink-0">{evt.eventTime}</span>
                      </div>
                      {evt.eventDate && <div className="text-xs text-indigo-300 mt-0.5">{formatIndianDate(evt.eventDate)}</div>}
                      {evt.venue && <div className="text-xs text-indigo-200 mt-1">📍 {evt.venue}</div>}
                      {evt.description && <p className="text-xs text-slate-300 mt-1 italic">{evt.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {data.contactDetails && <p className="text-center text-xs text-indigo-200">📞 {data.contactDetails}</p>}

          <div className="text-center pt-6 border-t border-white/10">
            <span className="text-xs text-indigo-300 uppercase tracking-widest block mb-1">We look forward to celebrating with you</span>
            <div className="font-cinzel-dec text-xl text-[#FDE68A]">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
