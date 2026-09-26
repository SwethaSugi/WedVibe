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

// Syne ExtraBold is wide: step long names down a size so words don't split on phones.
const nameSize = (name: string) =>
  name.length > 14 ? "text-2xl sm:text-4xl" : name.length > 10 ? "text-3xl sm:text-5xl" : "text-4xl sm:text-5xl";

/**
 * AuraMinimal — Minimal.
 * Swiss editorial grid with hairline rules, a duotone couple photo hero,
 * and a vertical film-strip gallery reel.
 */
export function AuraMinimal({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venue = data.venueName?.trim() || "Gallery Pavilion";
  const address = data.venueAddress?.trim() || "";

  const hasGroomParents = !!(data.groomFatherName?.trim() || data.groomMotherName?.trim());
  const hasBrideParents = !!(data.brideFatherName?.trim() || data.brideMotherName?.trim());
  const hasFamily = hasGroomParents || hasBrideParents;

  // Only the couple's own photos — no stock fallback on a real invitation.
  const heroPhoto = data.coupleImage || data.brideImage || data.groomImage;
  const gallery = data.galleryImages?.filter(Boolean) ?? [];

  return (
    <div className="min-h-full bg-[#141210] text-[#E7E5E4] font-mono antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-space { font-family: 'Space Grotesk', monospace; }

        @keyframes am-drift {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.05); }
        }
        @keyframes am-filmScroll {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }

        .am-drift { animation: am-drift 20s ease-in-out infinite; }
        .am-reel { display: flex; flex-direction: column; animation: am-filmScroll 14s linear infinite; }
        .am-reel:hover { animation-play-state: paused; }

        @media (prefers-reduced-motion: reduce) {
          .am-drift, .am-reel { animation: none !important; }
        }
      `}</style>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center bg-[#1C1917] shadow-2xl border-x border-stone-800 pb-12 font-space">
        {/* Hero: Swiss editorial grid over a duotone couple photo */}
        <section className="relative w-full h-[580px] overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroPhoto ? (
              <img
                src={heroPhoto}
                alt={`${groom} and ${bride}`}
                className="w-full h-full object-cover am-drift grayscale contrast-125 brightness-[0.55]"
              />
            ) : (
              <div className="w-full h-full bg-[#1C1917] bg-[linear-gradient(rgba(120,113,108,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(120,113,108,0.12)_1px,transparent_1px)] bg-[size:48px_48px]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/50 to-black/60" />
          </div>

          <div className="relative z-10 flex justify-between items-center text-[10px] tracking-widest text-stone-400 border-b border-stone-700/60 pb-2">
            <span>WEDDING INVITATION</span>
            <span className="text-amber-500 font-bold">● SAVE THE DATE</span>
          </div>

          <div className="relative z-10 text-left pb-4">
            <span className="text-[10px] tracking-[0.3em] uppercase text-amber-400 font-semibold block mb-1">Together with their families</span>
            <h1 className={`font-syne ${nameSize(groom)} font-extrabold text-white tracking-tighter leading-none break-words`}>{groom}</h1>
            <div className="text-xs text-stone-400 my-2 tracking-[0.4em] uppercase font-bold">&amp;</div>
            <h1 className={`font-syne ${nameSize(bride)} font-extrabold text-white tracking-tighter leading-none break-words`}>{bride}</h1>

            <div className="mt-5 inline-block px-3 py-1 bg-stone-900 border border-stone-700 text-xs text-stone-300">
              {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full px-6 space-y-7">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 bg-stone-900/80 border border-stone-800 text-xs space-y-2 text-stone-400">
                {hasGroomParents && (
                  <p>
                    <span className="text-stone-200 block text-[10px] uppercase font-bold tracking-widest">Groom Side</span>
                    Son of {[data.groomMotherName, data.groomFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="h-[1px] w-full bg-stone-800" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-stone-200 block text-[10px] uppercase font-bold tracking-widest">Bride Side</span>
                    Daughter of {[data.brideMotherName, data.brideFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <Countdown weddingDate={data.weddingDate} className="text-white font-syne" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={200}>
              <div className="p-5 bg-stone-900/60 border-l-2 border-amber-500 text-xs text-stone-300 leading-relaxed font-sans">
                &ldquo;{data.welcomeMessage}&rdquo;
              </div>
            </Reveal>
          )}

          {/* Vertical film-strip reel (set is duplicated for a seamless loop) */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="py-2">
                <div className="flex justify-between items-center mb-2 text-[10px] tracking-widest text-stone-400 border-b border-stone-800 pb-1">
                  <span>OUR MOMENTS</span>
                  <span className="text-amber-400 font-bold">✦</span>
                </div>

                <div className="relative h-64 overflow-hidden border border-stone-800 bg-black/60 px-2">
                  <div className="am-reel pt-2">
                    {[...gallery, ...gallery].map((img, idx) => (
                      <div key={idx} className="mb-2 border border-stone-700/60 p-1 bg-stone-900">
                        <img
                          src={img}
                          alt="Film frame"
                          className="w-full h-32 object-cover grayscale contrast-110 hover:grayscale-0 transition-all duration-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </Reveal>
          )}

          <Reveal delay={300}>
            <div className="p-5 bg-stone-900 border border-stone-800 text-left">
              <div className="text-[10px] text-amber-500 uppercase tracking-widest mb-1">VENUE</div>
              <h3 className="font-syne text-xl text-white font-bold">{venue}</h3>
              <p className="text-xs text-stone-400 mt-1">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block px-5 py-2 bg-stone-200 text-stone-900 font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors"
                >
                  Open Map
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-2">
                <div className="text-[10px] tracking-widest text-stone-400 border-b border-stone-800 pb-1">SCHEDULE</div>
                {data.events.map((evt) => (
                  <div key={evt.id} className="p-3 bg-stone-900/50 border border-stone-800 flex justify-between items-start gap-3">
                    <div>
                      <div className="font-syne font-bold text-sm text-stone-100">{evt.eventName}</div>
                      {evt.venue && <div className="text-xs text-stone-400 mt-0.5">{evt.venue}</div>}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-amber-400 font-bold">{evt.eventTime}</div>
                      {evt.eventDate && <div className="text-[10px] text-stone-500">{formatIndianDate(evt.eventDate)}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          <div className="text-left pt-6 border-t border-stone-800">
            <span className="text-[10px] uppercase tracking-widest text-stone-500 block mb-1">With love</span>
            <div className="font-syne text-xl text-white font-bold">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
