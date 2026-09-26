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

// Cinzel Black is wide: step long names down a size so words don't split on phones.
const nameSize = (name: string) =>
  name.length > 14 ? "text-2xl sm:text-3xl" : name.length > 10 ? "text-[1.8rem] sm:text-4xl" : "text-4xl sm:text-5xl";

/**
 * ChampagneNoir — Reception.
 * Art-deco black and gold: couple photo hero, rising champagne sparkles and a
 * fanned-out photo deck gallery.
 */
export function ChampagneNoir({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venue = data.venueName?.trim() || "Reception Venue";
  const address = data.venueAddress?.trim() || "";

  const hasGroomParents = !!(data.groomFatherName?.trim() || data.groomMotherName?.trim());
  const hasBrideParents = !!(data.brideFatherName?.trim() || data.brideMotherName?.trim());
  const hasFamily = hasGroomParents || hasBrideParents;

  // Only the couple's own photos — no stock fallback on a real invitation.
  const heroPhoto = data.coupleImage || data.brideImage || data.groomImage;
  const gallery = data.galleryImages?.filter(Boolean).slice(0, 3) ?? [];

  return (
    <div className="min-h-full bg-[#09090B] text-[#FAFAFA] font-sans antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Montserrat:wght@300;400;600;700&display=swap');
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }

        @keyframes cn-fanLeft {
          0%, 100% { transform: rotate(-14deg) translateY(0) translateX(-18px); }
          50% { transform: rotate(-10deg) translateY(-8px) translateX(-12px); }
        }
        @keyframes cn-fanCenter {
          0%, 100% { transform: rotate(0deg) translateY(-14px) scale(1.05); }
          50% { transform: rotate(0deg) translateY(-18px) scale(1.08); }
        }
        @keyframes cn-fanRight {
          0%, 100% { transform: rotate(14deg) translateY(0) translateX(18px); }
          50% { transform: rotate(10deg) translateY(-8px) translateX(12px); }
        }
        @keyframes cn-bubble {
          0% { transform: translateY(0px) scale(0.8); opacity: 0; }
          40% { opacity: 0.8; }
          100% { transform: translateY(-280px) scale(1.3); opacity: 0; }
        }

        .cn-fan-1 { animation: cn-fanLeft 6s ease-in-out infinite; }
        .cn-fan-2 { animation: cn-fanCenter 6s ease-in-out infinite; }
        .cn-fan-3 { animation: cn-fanRight 6s ease-in-out infinite; }
        .cn-bubble-1 { animation: cn-bubble 8s linear infinite; }
        .cn-bubble-2 { animation: cn-bubble 10s linear infinite 2.5s; }

        .cn-gold-text {
          background: linear-gradient(135deg, #FFFBEB 0%, #FDE047 35%, #D4AF37 70%, #996515 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .cn-fan-1, .cn-fan-2, .cn-fan-3, .cn-bubble-1, .cn-bubble-2 { animation: none !important; }
        }
      `}</style>

      {/* Rising sparkles — absolute so they stay inside the invitation (e.g. the editor preview) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden" aria-hidden>
        <div className="absolute left-[15%] top-[40%] text-[#D4AF37]/50 text-sm cn-bubble-1">🥂</div>
        <div className="absolute right-[20%] top-[70%] text-[#FDE047]/40 text-xs cn-bubble-2">✦</div>
        <div className="absolute left-[50%] top-[90%] text-[#D4AF37]/40 text-base cn-bubble-1" style={{ animationDelay: "4s" }}>✧</div>
      </div>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center bg-[#111116] shadow-2xl border-x border-[#D4AF37]/30 pb-12 font-montserrat">
        {/* Hero: couple photo in the background, names in front */}
        <section className="relative w-full h-[600px] overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroPhoto ? (
              <img src={heroPhoto} alt={`${groom} and ${bride}`} className="w-full h-full object-cover brightness-[0.65] contrast-[1.2]" />
            ) : (
              <div className="w-full h-full bg-[#111116] flex items-center justify-center">
                <svg className="w-64 h-80 text-[#D4AF37]/15" viewBox="0 0 100 125" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden>
                  <path d="M10 125 V50 Q50 0 90 50 V125" />
                  <path d="M50 12 V125 M20 45 L50 80 L80 45 M28 38 L50 62 L72 38" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-[#111116]/50 to-black/70" />
            <div className="absolute inset-0 bg-[#854D0E]/20 mix-blend-color" />
          </div>

          <div className="relative z-10 flex justify-center pt-2">
            <div className="px-4 py-1 rounded-full bg-black/70 border border-[#D4AF37]/50 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-[#FDE047]">★ Wedding Reception ★</span>
            </div>
          </div>

          <div className="relative z-10 text-center pb-4">
            <span className="text-[10px] tracking-[0.35em] uppercase text-zinc-300 font-bold mb-2 block">Please join us to celebrate</span>
            <h1 className={`font-cinzel ${nameSize(groom)} cn-gold-text font-black leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}>{groom}</h1>
            <div className="flex items-center justify-center gap-3 my-2 text-[#D4AF37]">
              <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
              <span className="font-cinzel text-lg italic">&amp;</span>
              <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
            </div>
            <h1 className={`font-cinzel ${nameSize(bride)} cn-gold-text font-black leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}>{bride}</h1>
            <div className="mt-4 px-5 py-2 rounded-xl bg-black/70 border border-[#D4AF37]/40 text-xs font-semibold text-amber-200 inline-block shadow-lg">
              {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full px-6 space-y-7 bg-[#111116]">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-[#D4AF37]/25 text-center text-xs space-y-2 text-zinc-300">
                {hasGroomParents && (
                  <p>
                    <span className="text-[#FDE047] block text-[10px] uppercase font-bold tracking-widest">Groom&apos;s Family</span>
                    Son of {[data.groomMotherName, data.groomFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="h-[1px] w-12 bg-white/10 mx-auto" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-[#FDE047] block text-[10px] uppercase font-bold tracking-widest">Bride&apos;s Family</span>
                    Daughter of {[data.brideMotherName, data.brideFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <Countdown weddingDate={data.weddingDate} className="text-[#FDE047] font-cinzel" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={200}>
              <div className="p-5 rounded-2xl bg-[#1A1A22] border border-[#D4AF37]/20 text-center italic text-sm text-zinc-200">
                &ldquo;{data.welcomeMessage}&rdquo;
              </div>
            </Reveal>
          )}

          {data.loveStory && (
            <Reveal delay={225}>
              <div className="text-center">
                <h4 className="font-cinzel text-xl text-[#FDE047] font-bold mb-2">Our Story</h4>
                <p className="text-sm font-light leading-relaxed text-zinc-300">{data.loveStory}</p>
              </div>
            </Reveal>
          )}

          {/* Fanned photo deck (3 photos); a simple row otherwise */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="py-2">
                <div className="text-center mb-5">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#FDE047]">🥂 Our Moments 🥂</span>
                </div>
                {gallery.length === 3 ? (
                  <div className="relative h-60 w-full flex justify-center items-center overflow-hidden">
                    {gallery.map((img, idx) => (
                      <div
                        key={idx}
                        className={`absolute w-40 sm:w-48 h-52 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 shadow-[0_10px_25px_rgba(0,0,0,0.8)] p-1 bg-black cn-fan-${idx + 1} ${idx === 1 ? "z-30" : "z-10"}`}
                      >
                        <img src={img} alt="Moment" className="w-full h-full object-cover rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center gap-3">
                    {gallery.map((img, idx) => (
                      <div key={idx} className="w-40 h-52 rounded-2xl overflow-hidden border-2 border-[#D4AF37]/60 p-1 bg-black">
                        <img src={img} alt="Moment" className="w-full h-full object-cover rounded-xl" />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </Reveal>
          )}

          <Reveal delay={300}>
            <div className="p-6 rounded-2xl bg-[#181820] border border-[#D4AF37]/30 text-center">
              <span className="text-2xl">🏛️</span>
              <h3 className="font-cinzel text-xl text-white font-bold mt-1">{venue}</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#996515] text-black font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  Get Directions
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-3">
                <h4 className="text-center font-cinzel text-xl text-[#FDE047] font-bold">Programme</h4>
                {data.events.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-xl bg-[#181820] border border-[#D4AF37]/20">
                    <div className="flex justify-between items-baseline gap-3 font-bold">
                      <span className="font-cinzel text-white text-sm">{evt.eventName}</span>
                      <span className="text-xs text-[#D4AF37] shrink-0">{evt.eventTime}</span>
                    </div>
                    {evt.eventDate && <div className="text-xs text-amber-200 mt-0.5">{formatIndianDate(evt.eventDate)}</div>}
                    {evt.venue && <div className="text-xs text-zinc-400 mt-1">📍 {evt.venue}</div>}
                    {evt.description && <p className="text-xs text-zinc-300 mt-1 italic">{evt.description}</p>}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {data.contactDetails && <p className="text-center text-xs text-zinc-400">📞 {data.contactDetails}</p>}

          <div className="text-center pt-6 border-t border-[#D4AF37]/20 font-cinzel">
            <span className="text-xs text-zinc-400 uppercase tracking-widest font-montserrat block mb-1">Dress Code: Black Tie</span>
            <div className="text-2xl text-[#FDE047] font-bold">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
