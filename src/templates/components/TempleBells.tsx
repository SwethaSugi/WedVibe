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
  name.length > 16 ? "text-2xl sm:text-3xl" : name.length > 11 ? "text-[1.7rem] sm:text-4xl" : "text-3xl sm:text-4xl md:text-5xl";

/**
 * TempleBells — South Indian / Traditional.
 * Crimson silk and temple gold: couple photo hero with swaying temple bells and an
 * auto-scrolling gold-framed gallery.
 */
export function TempleBells({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venue = data.venueName?.trim() || "Wedding Hall";
  const address = data.venueAddress?.trim() || "";

  const hasGroomParents = !!(data.groomFatherName?.trim() || data.groomMotherName?.trim());
  const hasBrideParents = !!(data.brideFatherName?.trim() || data.brideMotherName?.trim());
  const hasFamily = hasGroomParents || hasBrideParents;

  // Only the couple's own photos — no stock fallback on a real invitation.
  const heroPhoto = data.coupleImage || data.brideImage || data.groomImage;
  const gallery = data.galleryImages?.filter(Boolean) ?? [];

  return (
    <div className="min-h-full bg-[#2D0B0A] text-[#FFF7ED] font-serif antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rozha+One&family=Marcellus&display=swap');
        .font-rozha { font-family: 'Rozha One', serif; }
        .font-marcellus { font-family: 'Marcellus', serif; }

        @keyframes tb-sway {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(8deg); }
          75% { transform: rotate(-8deg); }
        }
        @keyframes tb-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes tb-breathe {
          0%, 100% { transform: scale(1.02); filter: brightness(0.65); }
          50% { transform: scale(1.08); filter: brightness(0.75); }
        }

        .tb-bell { transform-origin: top center; animation: tb-sway 3s ease-in-out infinite; }
        .tb-bell-alt { transform-origin: top center; animation: tb-sway 3.4s ease-in-out infinite 0.5s; }
        .tb-breathe { animation: tb-breathe 20s ease-in-out infinite; }
        .tb-track { display: flex; width: max-content; animation: tb-marquee 16s linear infinite; }
        .tb-track:hover { animation-play-state: paused; }

        .tb-gold-text {
          background: linear-gradient(135deg, #FFF9D2 0%, #FFD700 50%, #D4AF37 80%, #B8860B 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .tb-bell, .tb-bell-alt, .tb-breathe, .tb-track { animation: none !important; }
        }
      `}</style>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center bg-[#380E0C] shadow-2xl border-x border-[#F59E0B]/30">
        {/* Hero: couple photo with swaying temple bells, names in front */}
        <section className="relative w-full h-[580px] overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroPhoto ? (
              <img src={heroPhoto} alt={`${groom} and ${bride}`} className="w-full h-full object-cover tb-breathe origin-center" />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_#7C2D12_0%,_#450A0A_50%,_#2D0B0A_100%)] flex items-center justify-center">
                <svg className="w-60 h-72 text-amber-300/15" viewBox="0 0 100 120" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                  <path d="M20 120 V40 H80 V120" />
                  <path d="M25 40 V30 H75 V40 M30 30 V20 H70 V30 M36 20 V10 H64 V20 M42 10 V3 H58 V10" />
                  <path d="M40 120 V80 Q50 68 60 80 V120" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#380E0C] via-[#380E0C]/60 to-[#200504]/70" />
            <div className="absolute inset-0 bg-[#831843]/20 mix-blend-overlay" />
          </div>

          <div className="relative z-10 flex justify-between items-start px-4 pt-2">
            <div className="flex flex-col items-center tb-bell" aria-hidden>
              <div className="w-[1.5px] h-12 bg-amber-400" />
              <div className="text-2xl">🔔</div>
            </div>
            <div className="px-3 py-1.5 mt-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 backdrop-blur-md text-center">
              <span className="text-[10px] font-marcellus tracking-[0.2em] text-amber-200 uppercase leading-relaxed block">
                With the blessings
                <br />
                of the Almighty
              </span>
            </div>
            <div className="flex flex-col items-center tb-bell-alt" aria-hidden>
              <div className="w-[1.5px] h-12 bg-amber-400" />
              <div className="text-2xl">🔔</div>
            </div>
          </div>

          <div className="relative z-10 text-center flex flex-col items-center pb-4">
            <div className="text-xs uppercase tracking-[0.25em] text-amber-300/90 font-marcellus mb-1">The Auspicious Wedding of</div>
            <h1 className={`font-rozha ${nameSize(groom)} tb-gold-text leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]`}>{groom}</h1>
            <div className="flex items-center gap-3 my-2 text-amber-400">
              <span className="text-sm">✦</span>
              <span className="font-marcellus text-lg italic text-amber-200">weds</span>
              <span className="text-sm">✦</span>
            </div>
            <h1 className={`font-rozha ${nameSize(bride)} tb-gold-text leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]`}>{bride}</h1>
            <div className="mt-4 px-4 py-1.5 rounded-full bg-[#1C0403]/80 border border-amber-400/40 text-xs font-marcellus text-amber-200">
              {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full px-5 py-8 space-y-7 bg-gradient-to-b from-[#380E0C] to-[#250706]">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-center text-xs space-y-2 font-marcellus text-amber-100">
                {hasGroomParents && (
                  <p>
                    <span className="text-amber-400 block text-[10px] uppercase font-bold tracking-widest">Groom&apos;s Family</span>
                    Son of {[data.groomMotherName, data.groomFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="h-[1px] w-12 bg-amber-400/30 mx-auto" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-amber-400 block text-[10px] uppercase font-bold tracking-widest">Bride&apos;s Family</span>
                    Daughter of {[data.brideMotherName, data.brideFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <Countdown weddingDate={data.weddingDate} className="text-amber-300 font-marcellus" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={200}>
              <div className="text-center p-4 rounded-xl bg-amber-900/20 border-y border-amber-500/40 font-marcellus text-sm leading-relaxed text-amber-100">
                &ldquo;{data.welcomeMessage}&rdquo;
              </div>
            </Reveal>
          )}

          {data.loveStory && (
            <Reveal delay={225}>
              <div className="text-center">
                <h4 className="font-rozha text-xl text-amber-300 mb-2">Our Story</h4>
                <p className="text-sm font-marcellus leading-relaxed text-amber-100/90">{data.loveStory}</p>
              </div>
            </Reveal>
          )}

          {/* Auto-scrolling gold-framed gallery (set is duplicated for a seamless loop) */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="overflow-hidden">
                <div className="text-center mb-3">
                  <span className="text-[11px] font-marcellus uppercase tracking-widest text-amber-300">Precious Moments</span>
                </div>
                <div className="relative w-full overflow-hidden rounded-xl border border-amber-500/40 bg-black/40">
                  <div className="tb-track py-2.5">
                    {[...gallery, ...gallery].map((img, i) => (
                      <div key={i} className="shrink-0 px-1.5 w-[155px] sm:w-[195px]">
                        <div className="p-1 rounded-lg bg-gradient-to-r from-amber-400 to-amber-600 shadow-md">
                          <img src={img} alt="Moment" className="w-full h-36 object-cover rounded" loading="lazy" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </Reveal>
          )}

          <Reveal delay={300}>
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/40 to-transparent border border-amber-500/40 text-center font-marcellus">
              <div className="text-2xl mb-2">🛕</div>
              <h3 className="text-xl font-rozha text-amber-200">{venue}</h3>
              <p className="text-xs text-amber-300/80 mt-1 max-w-sm mx-auto">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-[#2D0B0A] font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-transform"
                >
                  Get Directions
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-3 font-marcellus">
                <h4 className="text-center font-rozha text-xl text-amber-300">Auspicious Ceremonies</h4>
                {data.events.map((evt) => (
                  <div key={evt.id} className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/25">
                    <div className="flex justify-between items-center gap-3">
                      <span className="font-bold text-amber-200 text-sm">{evt.eventName}</span>
                      <span className="text-xs text-amber-400 font-sans shrink-0">{evt.eventTime}</span>
                    </div>
                    {evt.eventDate && <div className="text-xs text-amber-300/70 mt-0.5">{formatIndianDate(evt.eventDate)}</div>}
                    {evt.venue && <div className="text-xs text-amber-200/80 mt-1">📍 {evt.venue}</div>}
                    {evt.description && <p className="text-xs text-amber-100/70 mt-1 italic">{evt.description}</p>}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {data.contactDetails && <p className="text-center text-xs text-amber-300/80 font-marcellus">📞 {data.contactDetails}</p>}

          <div className="text-center pt-6 border-t border-amber-500/30 font-marcellus">
            <span className="text-[10px] uppercase tracking-widest text-amber-400">Seeking your blessings</span>
            <div className="font-rozha text-2xl text-amber-200 mt-1">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
