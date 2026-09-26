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
  name.length > 16 ? "text-3xl sm:text-4xl" : name.length > 11 ? "text-[2.1rem] sm:text-5xl" : "text-4xl sm:text-5xl md:text-6xl";

/**
 * CelestialCinema — Modern / Cinematic.
 * Full-bleed couple photo hero with a slow Ken-Burns drift, floating gold names,
 * and an auto-scrolling marquee gallery.
 */
export function CelestialCinema({ data }: { data: InvitationData }) {
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
    <div className="min-h-full bg-[#07090E] text-[#F3F4F6] font-sans antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Italiana&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        .font-italiana { font-family: 'Italiana', serif; }

        @keyframes cc-kenBurns {
          0% { transform: scale(1) translate(0, 0); }
          50% { transform: scale(1.1) translate(-1%, -1%); }
          100% { transform: scale(1) translate(0, 0); }
        }
        @keyframes cc-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes cc-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        .cc-kenburns { animation: cc-kenBurns 26s ease-in-out infinite; }
        .cc-track { display: flex; width: max-content; animation: cc-marquee 18s linear infinite; }
        .cc-track:hover { animation-play-state: paused; }
        .cc-glow { animation: cc-pulse 6s ease-in-out infinite; }

        .cc-gold-text {
          background: linear-gradient(180deg, #FFFFFF 20%, #F5E6D3 60%, #D4AF37 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .cc-kenburns, .cc-track, .cc-glow { animation: none !important; }
        }
      `}</style>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center shadow-2xl">
        {/* Hero: couple photo in the background, names in front */}
        <section className="relative w-full h-[580px] sm:h-[640px] overflow-hidden flex flex-col justify-end p-6 sm:p-8">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroPhoto ? (
              <img
                src={heroPhoto}
                alt={`${groom} and ${bride}`}
                className="w-full h-full object-cover cc-kenburns origin-center brightness-[0.72] contrast-[1.08]"
              />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_#3b2f14_0%,_#12151f_55%,_#07090E_100%)]">
                <div className="cc-glow absolute top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-amber-400/20 blur-3xl" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#07090E] via-[#07090E]/40 to-black/30" />
          </div>

          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-3 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-amber-200">A Cinematic Wedding Story</span>
            </div>

            <h1 className={`font-italiana ${nameSize(groom)} cc-gold-text leading-[1.05] tracking-wide drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]`}>
              {groom}
            </h1>
            <div className="my-2 text-xl font-italiana italic text-amber-200/80">— &amp; —</div>
            <h1 className={`font-italiana ${nameSize(bride)} cc-gold-text leading-[1.05] tracking-wide drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]`}>
              {bride}
            </h1>

            <div className="mt-5 px-4 py-1.5 rounded-xl bg-black/40 backdrop-blur-md border border-white/15 text-xs tracking-[0.2em] uppercase text-zinc-300">
              {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full bg-[#07090E] px-4 sm:px-6 pb-12 space-y-8">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center text-xs text-zinc-300 leading-relaxed">
                {hasGroomParents && (
                  <p>
                    <span className="text-amber-300 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Groom&apos;s Parents</span>
                    Son of {[data.groomMotherName, data.groomFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="h-[1px] w-12 bg-white/10 mx-auto my-2" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-amber-300 block text-[10px] uppercase font-bold tracking-wider mb-0.5">Bride&apos;s Parents</span>
                    Daughter of {[data.brideMotherName, data.brideFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <Countdown weddingDate={data.weddingDate} className="text-amber-300 font-italiana" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={200}>
              <div className="text-center p-5 rounded-2xl bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10">
                <p className="text-sm font-italiana italic text-zinc-200 leading-relaxed">&ldquo;{data.welcomeMessage}&rdquo;</p>
              </div>
            </Reveal>
          )}

          {/* Auto-scrolling marquee gallery (set is duplicated for a seamless loop) */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="overflow-hidden py-2">
                <div className="text-center mb-3">
                  <span className="text-[10px] tracking-[0.3em] uppercase text-amber-300 font-semibold">Gallery Reel</span>
                </div>
                <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                  <div className="cc-track py-2">
                    {[...gallery, ...gallery].map((img, i) => (
                      <div key={i} className="shrink-0 px-1.5 w-[150px] sm:w-[190px]">
                        <img
                          src={img}
                          alt="Gallery"
                          className="w-full h-36 sm:h-44 object-cover rounded-xl shadow-lg hover:scale-105 transition-transform"
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
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <span className="text-amber-300 text-lg">📍</span>
              <h3 className="font-italiana text-2xl text-amber-100 mt-1">{venue}</h3>
              <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-black text-xs font-bold uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all"
                >
                  View Location on Map
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-3">
                <h4 className="text-center font-italiana text-2xl text-amber-200">The Schedule</h4>
                {data.events.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                    <div className="flex justify-between items-baseline gap-3">
                      <span className="font-italiana text-lg text-amber-300">{evt.eventName}</span>
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

          {(data.quote || data.instagramLink) && (
            <Reveal delay={400}>
              <div className="text-center space-y-3 pt-2">
                {data.quote && <p className="text-xs italic text-zinc-300">&ldquo;{data.quote}&rdquo;</p>}
                {data.instagramLink && (
                  <a href={data.instagramLink} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-amber-300 hover:underline">
                    Follow the wedding story ↗
                  </a>
                )}
              </div>
            </Reveal>
          )}

          <div className="text-center pt-6 border-t border-white/10">
            <span className="text-[10px] uppercase tracking-[0.25em] text-zinc-400">With love</span>
            <div className="font-italiana text-2xl text-amber-200 mt-1">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
