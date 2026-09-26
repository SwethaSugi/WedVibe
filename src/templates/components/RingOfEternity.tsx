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
 * RingOfEternity — Engagement.
 * Rose-gold and sapphire: couple photo hero with an orbiting ring emblem and a
 * rotating 3D carousel gallery.
 */
export function RingOfEternity({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venue = data.venueName?.trim() || "Engagement Venue";
  const address = data.venueAddress?.trim() || "";

  const hasGroomParents = !!(data.groomFatherName?.trim() || data.groomMotherName?.trim());
  const hasBrideParents = !!(data.brideFatherName?.trim() || data.brideMotherName?.trim());
  const hasFamily = hasGroomParents || hasBrideParents;

  // Only the couple's own photos — no stock fallback on a real invitation.
  const heroPhoto = data.coupleImage || data.brideImage || data.groomImage;
  const gallery = data.galleryImages?.filter(Boolean).slice(0, 3) ?? [];

  return (
    <div className="min-h-full bg-[#070A12] text-[#F1F5F9] font-sans antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Montserrat:wght@300;400;500;600&display=swap');
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-montserrat { font-family: 'Montserrat', sans-serif; }

        @keyframes re-orbit {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes re-cycle1 {
          0%, 100% { transform: perspective(800px) rotateY(0deg) scale(1.05); z-index: 30; opacity: 1; filter: brightness(1); }
          33% { transform: perspective(800px) rotateY(-25deg) scale(0.85) translateX(-40px); z-index: 10; opacity: 0.6; filter: brightness(0.7); }
          66% { transform: perspective(800px) rotateY(25deg) scale(0.85) translateX(40px); z-index: 10; opacity: 0.6; filter: brightness(0.7); }
        }
        @keyframes re-cycle2 {
          0%, 100% { transform: perspective(800px) rotateY(25deg) scale(0.85) translateX(40px); z-index: 10; opacity: 0.6; filter: brightness(0.7); }
          33% { transform: perspective(800px) rotateY(0deg) scale(1.05); z-index: 30; opacity: 1; filter: brightness(1); }
          66% { transform: perspective(800px) rotateY(-25deg) scale(0.85) translateX(-40px); z-index: 10; opacity: 0.6; filter: brightness(0.7); }
        }
        @keyframes re-cycle3 {
          0%, 100% { transform: perspective(800px) rotateY(-25deg) scale(0.85) translateX(-40px); z-index: 10; opacity: 0.6; filter: brightness(0.7); }
          33% { transform: perspective(800px) rotateY(25deg) scale(0.85) translateX(40px); z-index: 10; opacity: 0.6; filter: brightness(0.7); }
          66% { transform: perspective(800px) rotateY(0deg) scale(1.05); z-index: 30; opacity: 1; filter: brightness(1); }
        }

        .re-orbit { animation: re-orbit 30s linear infinite; }
        .re-card-1 { animation: re-cycle1 9s ease-in-out infinite; }
        .re-card-2 { animation: re-cycle2 9s ease-in-out infinite; }
        .re-card-3 { animation: re-cycle3 9s ease-in-out infinite; }

        .re-rosegold {
          background: linear-gradient(135deg, #FFF1F2 0%, #FDA4AF 40%, #FB7185 70%, #E11D48 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .re-orbit, .re-card-1, .re-card-2, .re-card-3 { animation: none !important; }
        }
      `}</style>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center bg-[#0D1424] shadow-2xl border-x border-rose-500/20 pb-12">
        {/* Hero: couple photo with the ring emblem, names in front */}
        <section className="relative w-full h-[600px] overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroPhoto ? (
              <img src={heroPhoto} alt={`${groom} and ${bride}`} className="w-full h-full object-cover brightness-[0.7]" />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_#4C1D2E_0%,_#16203A_50%,_#0D1424_100%)]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D1424] via-[#0D1424]/60 to-black/70" />
            <div className="absolute inset-0 bg-rose-950/25 mix-blend-overlay" />
          </div>

          <div className="relative z-10 pt-4 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border border-rose-300/40 flex items-center justify-center re-orbit bg-black/40 backdrop-blur-md shadow-[0_0_20px_rgba(251,113,133,0.3)]">
              <span className="text-2xl">💍</span>
            </div>
            <span className="text-[10px] tracking-[0.3em] font-montserrat uppercase text-rose-200 mt-2 font-semibold">The Engagement Ceremony</span>
          </div>

          <div className="relative z-10 text-center flex flex-col items-center pb-4">
            <h1 className={`font-cinzel ${nameSize(groom)} re-rosegold font-bold leading-tight`}>{groom}</h1>
            <div className="flex items-center gap-3 my-2 text-rose-300">
              <span className="h-[1px] w-12 bg-rose-400/40" />
              <span className="font-cinzel text-lg italic">&amp;</span>
              <span className="h-[1px] w-12 bg-rose-400/40" />
            </div>
            <h1 className={`font-cinzel ${nameSize(bride)} re-rosegold font-bold leading-tight`}>{bride}</h1>
            <div className="mt-4 px-5 py-1.5 rounded-full bg-black/60 border border-rose-500/40 text-xs font-montserrat text-rose-100">
              {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full px-6 space-y-7">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-rose-500/20 text-center text-xs space-y-2 font-montserrat text-slate-300">
                {hasGroomParents && (
                  <p>
                    <span className="text-rose-300 block text-[10px] uppercase font-bold tracking-widest">Groom&apos;s Family</span>
                    Son of {[data.groomMotherName, data.groomFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="h-[1px] w-12 bg-rose-500/20 mx-auto" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-rose-300 block text-[10px] uppercase font-bold tracking-widest">Bride&apos;s Family</span>
                    Daughter of {[data.brideMotherName, data.brideFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <Countdown weddingDate={data.weddingDate} className="text-rose-300 font-cinzel" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={200}>
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-rose-500/20 text-center font-montserrat italic text-sm text-rose-50">
                &ldquo;{data.welcomeMessage}&rdquo;
              </div>
            </Reveal>
          )}

          {data.loveStory && (
            <Reveal delay={225}>
              <div className="text-center">
                <h4 className="font-cinzel text-xl text-rose-300 font-bold mb-2">Our Story</h4>
                <p className="text-sm font-montserrat leading-relaxed text-slate-300">{data.loveStory}</p>
              </div>
            </Reveal>
          )}

          {/* Rotating 3D carousel when there are 3 photos; a simple row otherwise */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="py-2">
                <div className="text-center mb-4">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-montserrat font-bold text-rose-300">💍 Our Moments 💍</span>
                </div>
                {gallery.length === 3 ? (
                  <div className="relative h-60 w-full flex justify-center items-center overflow-hidden">
                    {gallery.map((img, idx) => (
                      <div
                        key={idx}
                        className={`absolute w-44 sm:w-48 h-52 rounded-2xl overflow-hidden border-2 border-rose-400/50 shadow-2xl re-card-${idx + 1}`}
                      >
                        <img src={img} alt="Moment" className="w-full h-full object-cover rounded-xl" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-center gap-3">
                    {gallery.map((img, idx) => (
                      <div key={idx} className="w-40 h-52 rounded-2xl overflow-hidden border-2 border-rose-400/50 shadow-2xl">
                        <img src={img} alt="Moment" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </Reveal>
          )}

          <Reveal delay={300}>
            <div className="p-6 rounded-2xl bg-[#121A2F] border border-rose-500/25 text-center">
              <span className="text-2xl">💎</span>
              <h3 className="font-cinzel text-xl text-white mt-1 font-bold">{venue}</h3>
              <p className="text-xs text-slate-400 font-montserrat mt-1 max-w-sm mx-auto">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-rose-500 to-rose-600 text-white font-montserrat font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  Get Directions
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-3 font-montserrat">
                <h4 className="text-center font-cinzel text-xl text-rose-300 font-bold">Celebration Schedule</h4>
                {data.events.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-xl bg-[#101729] border border-rose-500/20">
                    <div className="flex justify-between items-baseline gap-3 font-bold text-sm text-white">
                      <span>{evt.eventName}</span>
                      <span className="text-xs text-rose-300 shrink-0">{evt.eventTime}</span>
                    </div>
                    {evt.eventDate && <div className="text-xs text-slate-400 mt-0.5">{formatIndianDate(evt.eventDate)}</div>}
                    {evt.venue && <div className="text-xs text-slate-300 mt-1">📍 {evt.venue}</div>}
                    {evt.description && <p className="text-xs text-slate-400 mt-1 italic">{evt.description}</p>}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {data.contactDetails && <p className="text-center text-xs text-slate-400 font-montserrat">📞 {data.contactDetails}</p>}

          <div className="text-center pt-6 border-t border-rose-500/20 font-cinzel">
            <span className="text-xs text-rose-300 uppercase tracking-widest font-montserrat block mb-1">Forever begins with you</span>
            <div className="text-2xl text-white font-bold">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
