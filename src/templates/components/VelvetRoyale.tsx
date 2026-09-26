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

// Cinzel Bold is wide: step long names down a size so words don't split on phones.
const nameSize = (name: string) =>
  name.length > 14 ? "text-2xl sm:text-3xl" : name.length > 10 ? "text-[1.8rem] sm:text-4xl" : "text-4xl sm:text-5xl";

/**
 * VelvetRoyale — Reception.
 * Midnight velvet gala: couple photo hero with a slow drift, gold lettering and an
 * auto-scrolling gallery track.
 */
export function VelvetRoyale({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venue = data.venueName?.trim() || "Reception Venue";
  const address = data.venueAddress?.trim() || "";

  const hasGroomParents = !!(data.groomFatherName?.trim() || data.groomMotherName?.trim());
  const hasBrideParents = !!(data.brideFatherName?.trim() || data.brideMotherName?.trim());
  const hasFamily = hasGroomParents || hasBrideParents;

  // Only the couple's own photos — no stock fallback on a real invitation.
  const heroPhoto = data.coupleImage || data.brideImage || data.groomImage;
  const gallery = data.galleryImages?.filter(Boolean) ?? [];

  return (
    <div className="min-h-full bg-[#090C19] text-[#F8FAFC] font-sans antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Montserrat:wght@300;400;600;700&display=swap');
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }

        @keyframes vr-breathe {
          0%, 100% { transform: scale(1) translate(0, 0); filter: brightness(0.68); }
          50% { transform: scale(1.09) translate(-1%, -1%); filter: brightness(0.8); }
        }
        @keyframes vr-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        .vr-breathe { animation: vr-breathe 24s ease-in-out infinite; }
        .vr-track { display: flex; width: max-content; animation: vr-marquee 16s linear infinite; }
        .vr-track:hover { animation-play-state: paused; }

        .vr-gold-text {
          background: linear-gradient(135deg, #FFF9D2 0%, #F3D072 40%, #D4A733 70%, #996515 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .vr-gold-btn { background: linear-gradient(135deg, #F3D072 0%, #D4A733 60%, #996515 100%); }

        @media (prefers-reduced-motion: reduce) {
          .vr-breathe, .vr-track { animation: none !important; }
        }
      `}</style>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center bg-[#0F1528] shadow-2xl border-x border-[#F3D072]/25">
        {/* Hero: couple photo in the background, names in front */}
        <section className="relative w-full h-[600px] overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroPhoto ? (
              <img src={heroPhoto} alt={`${groom} and ${bride}`} className="w-full h-full object-cover vr-breathe origin-center" />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_#312E81_0%,_#151D3B_50%,_#0F1528_100%)]">
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-[#F3D072]/10 blur-3xl vr-breathe" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F1528] via-[#0F1528]/55 to-black/60" />
            <div className="absolute inset-0 bg-[#312E81]/25 mix-blend-overlay" />
          </div>

          <div className="relative z-10 flex justify-center pt-2">
            <div className="px-4 py-1 rounded-full bg-black/60 border border-[#F3D072]/40 backdrop-blur-md">
              <span className="text-[10px] font-montserrat font-bold tracking-[0.25em] text-[#F3D072] uppercase">★ You Are Invited ★</span>
            </div>
          </div>

          <div className="relative z-10 text-center flex flex-col items-center pb-4">
            <div className="text-[10px] tracking-[0.35em] font-montserrat uppercase text-zinc-300 font-semibold mb-2">
              The Wedding Reception of
            </div>
            <h1 className={`font-cinzel ${nameSize(groom)} vr-gold-text font-bold leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}>{groom}</h1>
            <div className="flex items-center gap-3 my-2 text-[#F3D072]">
              <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#F3D072]" />
              <span className="font-cinzel text-xl italic">&amp;</span>
              <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#F3D072]" />
            </div>
            <h1 className={`font-cinzel ${nameSize(bride)} vr-gold-text font-bold leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}>{bride}</h1>
            <div className="mt-5 px-5 py-2 rounded-xl bg-black/60 border border-[#F3D072]/40 backdrop-blur-md text-xs font-montserrat font-medium text-amber-200 shadow-xl">
              {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full px-5 py-8 space-y-7 bg-gradient-to-b from-[#0F1528] to-[#0A0D1B]">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 rounded-xl bg-white/[0.03] border border-[#F3D072]/30 text-center text-xs space-y-2 font-montserrat text-zinc-300">
                {hasGroomParents && (
                  <p>
                    <span className="text-[#F3D072] block text-[10px] uppercase font-bold tracking-widest">Groom&apos;s Family</span>
                    Son of {[data.groomMotherName, data.groomFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="h-[1px] w-12 bg-white/10 mx-auto" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-[#F3D072] block text-[10px] uppercase font-bold tracking-widest">Bride&apos;s Family</span>
                    Daughter of {[data.brideMotherName, data.brideFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <Countdown weddingDate={data.weddingDate} className="text-[#F3D072] font-cinzel" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={200}>
              <div className="p-5 rounded-xl bg-[#151D36] border border-[#F3D072]/20 text-center font-montserrat italic text-sm text-zinc-200">
                &ldquo;{data.welcomeMessage}&rdquo;
              </div>
            </Reveal>
          )}

          {data.loveStory && (
            <Reveal delay={225}>
              <div className="text-center">
                <h4 className="font-cinzel text-xl text-[#F3D072] font-bold mb-2">Our Story</h4>
                <p className="text-sm font-montserrat font-light leading-relaxed text-zinc-300">{data.loveStory}</p>
              </div>
            </Reveal>
          )}

          {/* Auto-scrolling gallery (set is duplicated for a seamless loop) */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="overflow-hidden">
                <div className="text-center mb-3">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-montserrat font-bold text-[#F3D072]">Our Moments</span>
                </div>
                <div className="relative w-full overflow-hidden rounded-2xl border border-[#F3D072]/30 bg-black/40">
                  <div className="vr-track py-2.5">
                    {[...gallery, ...gallery].map((img, i) => (
                      <div key={i} className="shrink-0 px-1.5 w-[150px] sm:w-[190px]">
                        <img
                          src={img}
                          alt="Moment"
                          className="w-full h-36 object-cover rounded-xl shadow-lg border border-[#F3D072]/20 hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </Reveal>
          )}

          <Reveal delay={300}>
            <div className="p-6 rounded-2xl bg-[#141B32] border border-[#F3D072]/30 text-center">
              <span className="text-2xl">👑</span>
              <h3 className="font-cinzel text-xl text-[#F8FAFC] mt-1 font-bold">{venue}</h3>
              <p className="text-xs text-zinc-400 font-montserrat mt-1 max-w-sm mx-auto">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full vr-gold-btn text-[#090C19] font-montserrat font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  Get Directions
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-3 font-montserrat">
                <h4 className="text-center font-cinzel text-xl text-[#F3D072] font-bold">Event Schedule</h4>
                {data.events.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-xl bg-[#12192F] border border-[#F3D072]/20">
                    <div className="flex justify-between items-baseline gap-3">
                      <span className="font-cinzel font-bold text-sm text-[#F3D072]">{evt.eventName}</span>
                      <span className="text-xs text-zinc-400 shrink-0">{evt.eventTime}</span>
                    </div>
                    {evt.eventDate && <div className="text-xs text-amber-200/80 mt-0.5">{formatIndianDate(evt.eventDate)}</div>}
                    {evt.venue && <div className="text-xs text-zinc-400 mt-1">📍 {evt.venue}</div>}
                    {evt.description && <p className="text-xs text-zinc-400 mt-1 italic">{evt.description}</p>}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {data.contactDetails && <p className="text-center text-xs text-zinc-400 font-montserrat">📞 {data.contactDetails}</p>}

          <div className="text-center pt-6 border-t border-[#F3D072]/20 font-montserrat">
            <span className="text-[10px] uppercase tracking-widest text-[#F3D072]">Cordially Invited</span>
            <div className="font-cinzel text-2xl text-amber-100 font-bold mt-1">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
