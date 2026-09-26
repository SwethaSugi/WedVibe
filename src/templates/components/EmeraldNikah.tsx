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

// Step long names down a size so words don't split on phones.
const nameSize = (name: string) =>
  name.length > 16 ? "text-3xl sm:text-4xl" : name.length > 11 ? "text-[2.1rem] sm:text-5xl" : "text-4xl sm:text-5xl";

/**
 * EmeraldNikah — Muslim Wedding / Nikah.
 * Emerald and gold pavilion: couple photo hero, swaying lanterns and an
 * auto-scrolling gallery track.
 */
export function EmeraldNikah({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venue = data.venueName?.trim() || "Wedding Venue";
  const address = data.venueAddress?.trim() || "";

  const hasGroomParents = !!(data.groomFatherName?.trim() || data.groomMotherName?.trim());
  const hasBrideParents = !!(data.brideFatherName?.trim() || data.brideMotherName?.trim());
  const hasFamily = hasGroomParents || hasBrideParents;

  // Only the couple's own photos — no stock fallback on a real invitation.
  const heroPhoto = data.coupleImage || data.brideImage || data.groomImage;
  const gallery = data.galleryImages?.filter(Boolean) ?? [];

  return (
    <div className="min-h-full bg-[#061C16] text-[#FFFBEB] font-serif antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@600;700&display=swap');
        .font-amiri { font-family: 'Amiri', serif; }
        .font-cinzel { font-family: 'Cinzel', serif; }

        @keyframes en-swing {
          0%, 100% { transform: rotate(0deg); }
          30% { transform: rotate(6deg); }
          70% { transform: rotate(-6deg); }
        }
        @keyframes en-marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes en-breathe {
          0%, 100% { transform: scale(1.02); filter: brightness(0.7); }
          50% { transform: scale(1.07); filter: brightness(0.82); }
        }

        .en-lantern { transform-origin: top center; animation: en-swing 3.6s ease-in-out infinite; }
        .en-lantern-alt { transform-origin: top center; animation: en-swing 4.2s ease-in-out infinite 0.7s; }
        .en-breathe { animation: en-breathe 24s ease-in-out infinite; }
        .en-track { display: flex; width: max-content; animation: en-marquee 17s linear infinite; }
        .en-track:hover { animation-play-state: paused; }

        .en-gold-text {
          background: linear-gradient(135deg, #FFF6D3 0%, #F5D77F 45%, #D4AF37 80%, #996515 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .en-lantern, .en-lantern-alt, .en-breathe, .en-track { animation: none !important; }
        }
      `}</style>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center bg-[#0B2B23] shadow-2xl border-x border-[#F5D77F]/30">
        {/* Hero: couple photo with swaying lanterns, names in front */}
        <section className="relative w-full h-[590px] overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroPhoto ? (
              <img src={heroPhoto} alt={`${groom} and ${bride}`} className="w-full h-full object-cover en-breathe origin-center" />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_#0F5B46_0%,_#0B2B23_55%,_#04120E_100%)] flex items-center justify-center">
                <svg className="w-56 h-72 text-[#F5D77F]/15" viewBox="0 0 100 130" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                  <path d="M10 130 V55 Q10 20 50 5 Q90 20 90 55 V130" />
                  <path d="M22 130 V60 Q22 32 50 18 Q78 32 78 60 V130" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B2B23] via-[#0B2B23]/60 to-[#04120E]/80" />
            <div className="absolute inset-0 bg-[#047857]/20 mix-blend-color" />
          </div>

          <div className="relative z-10 flex justify-between items-start px-2 pt-1">
            <div className="flex flex-col items-center en-lantern" aria-hidden>
              <div className="w-[1px] h-14 bg-[#F5D77F]" />
              <div className="text-2xl">🏮</div>
            </div>
            <div className="text-center pt-3 px-2">
              <span className="text-[10px] tracking-[0.25em] font-cinzel text-emerald-100/90 uppercase block leading-relaxed">
                In the name of Allah,
                <br />
                the Most Gracious, the Most Merciful
              </span>
            </div>
            <div className="flex flex-col items-center en-lantern-alt" aria-hidden>
              <div className="w-[1px] h-14 bg-[#F5D77F]" />
              <div className="text-2xl">🏮</div>
            </div>
          </div>

          <div className="relative z-10 text-center flex flex-col items-center pb-4">
            <div className="px-3.5 py-1 rounded-full bg-[#041D17]/80 border border-[#F5D77F]/40 backdrop-blur-md mb-2">
              <span className="text-[10px] tracking-[0.3em] font-cinzel uppercase text-[#F5D77F]">Nikah Ceremony</span>
            </div>
            <h1 className={`font-amiri ${nameSize(groom)} en-gold-text leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]`}>{groom}</h1>
            <div className="my-1 text-xl font-amiri text-[#F5D77F] italic">&amp;</div>
            <h1 className={`font-amiri ${nameSize(bride)} en-gold-text leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]`}>{bride}</h1>
            <div className="mt-4 px-4 py-1.5 rounded-full bg-[#062019]/90 border border-[#F5D77F]/30 text-xs font-cinzel text-[#F5D77F]">
              {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full px-5 py-8 space-y-7 bg-gradient-to-b from-[#0B2B23] to-[#061813]">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-[#F5D77F]/30 text-center text-xs space-y-2 font-cinzel text-emerald-100">
                {hasGroomParents && (
                  <p>
                    <span className="text-[#F5D77F] block text-[10px] uppercase font-bold tracking-widest">Groom&apos;s Family</span>
                    Son of {[data.groomMotherName, data.groomFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="h-[1px] w-12 bg-[#F5D77F]/30 mx-auto" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-[#F5D77F] block text-[10px] uppercase font-bold tracking-widest">Bride&apos;s Family</span>
                    Daughter of {[data.brideMotherName, data.brideFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <Countdown weddingDate={data.weddingDate} className="text-[#F5D77F] font-cinzel" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={200}>
              <div className="text-center p-4 rounded-xl bg-emerald-900/20 border-y border-[#F5D77F]/40 font-amiri text-base leading-relaxed text-emerald-50">
                &ldquo;{data.welcomeMessage}&rdquo;
              </div>
            </Reveal>
          )}

          {data.loveStory && (
            <Reveal delay={225}>
              <div className="text-center">
                <h4 className="font-amiri text-2xl text-[#F5D77F] mb-2">Our Story</h4>
                <p className="text-sm font-amiri leading-relaxed text-emerald-100/90">{data.loveStory}</p>
              </div>
            </Reveal>
          )}

          {/* Auto-scrolling gallery (set is duplicated for a seamless loop) */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="overflow-hidden">
                <div className="text-center mb-3">
                  <span className="text-[11px] font-cinzel uppercase tracking-widest text-[#F5D77F]">Cherished Moments</span>
                </div>
                <div className="relative w-full overflow-hidden rounded-xl border border-[#F5D77F]/30 bg-[#041510]">
                  <div className="en-track py-2.5">
                    {[...gallery, ...gallery].map((img, i) => (
                      <div key={i} className="shrink-0 px-1.5 w-[150px] sm:w-[190px]">
                        <img
                          src={img}
                          alt="Moment"
                          className="w-full h-36 object-cover rounded-lg border border-[#F5D77F]/30 shadow-md hover:scale-105 transition-transform"
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
            <div className="p-6 rounded-2xl bg-emerald-950/40 border border-[#F5D77F]/35 text-center">
              <div className="text-2xl mb-1">🕌</div>
              <h3 className="font-amiri text-2xl text-[#F5D77F]">{venue}</h3>
              <p className="text-xs text-emerald-200/80 font-cinzel mt-1 max-w-sm mx-auto">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-[#F5D77F] to-[#D4AF37] text-[#061C16] font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  Get Directions
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-3 font-cinzel">
                <h4 className="text-center font-amiri text-2xl text-[#F5D77F]">Wedding Celebrations</h4>
                {data.events.map((evt) => (
                  <div key={evt.id} className="p-3.5 rounded-xl bg-emerald-950/30 border border-[#F5D77F]/20">
                    <div className="flex justify-between items-center gap-3">
                      <span className="font-bold text-[#F5D77F] text-sm">{evt.eventName}</span>
                      <span className="text-xs text-emerald-300 font-sans shrink-0">{evt.eventTime}</span>
                    </div>
                    {evt.eventDate && <div className="text-xs text-emerald-200/70 mt-0.5">{formatIndianDate(evt.eventDate)}</div>}
                    {evt.venue && <div className="text-xs text-emerald-100/80 mt-1">📍 {evt.venue}</div>}
                    {evt.description && <p className="text-xs text-emerald-200/70 mt-1 italic font-amiri">{evt.description}</p>}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {data.contactDetails && (
            <p className="text-center text-xs text-emerald-200/80 font-cinzel">📞 {data.contactDetails}</p>
          )}

          <div className="text-center pt-6 border-t border-[#F5D77F]/25 font-amiri">
            <span className="text-xs text-[#F5D77F] italic">May Allah bless this union and fill it with love and mercy</span>
            <div className="text-2xl text-emerald-100 mt-1">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
