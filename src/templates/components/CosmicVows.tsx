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
 * CosmicVows — Modern.
 * Twilight starry night: couple photo hero with nebula glows, a slowly turning
 * constellation ring and floating photo cards.
 */
export function CosmicVows({ data }: { data: InvitationData }) {
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
    <div className="min-h-full bg-[#030712] text-[#F8FAFC] font-sans antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Italiana&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap');
        .font-italiana { font-family: 'Italiana', serif; }
        .font-jakarta { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes cv-nebula {
          0%, 100% { opacity: 0.35; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.65; transform: scale(1.1) rotate(4deg); }
        }
        @keyframes cv-float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        @keyframes cv-float2 {
          0%, 100% { transform: translateY(-8px) rotate(-2deg); }
          50% { transform: translateY(4px) rotate(1deg); }
        }
        @keyframes cv-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes cv-twinkle { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }

        .cv-nebula { animation: cv-nebula 12s ease-in-out infinite; }
        .cv-constellation { animation: cv-rotate 80s linear infinite; }
        .cv-float-1 { animation: cv-float1 5s ease-in-out infinite; }
        .cv-float-2 { animation: cv-float2 6s ease-in-out infinite 1s; }
        .cv-float-3 { animation: cv-float1 5.5s ease-in-out infinite 2s; }
        .cv-star { animation: cv-twinkle 3s ease-in-out infinite; }

        .cv-text {
          background: linear-gradient(135deg, #FFFFFF 0%, #A5F3FC 40%, #C084FC 80%, #F472B6 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .cv-nebula, .cv-constellation, .cv-float-1, .cv-float-2, .cv-float-3, .cv-star { animation: none !important; }
        }
      `}</style>

      {/* Nebula glows — absolute so they stay inside the invitation (e.g. the editor preview) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        <div className="absolute top-10 left-[20%] w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl cv-nebula" />
        <div className="absolute bottom-20 right-[15%] w-80 h-80 rounded-full bg-purple-600/15 blur-3xl cv-nebula" style={{ animationDelay: "3s" }} />
      </div>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center bg-[#080D1A] shadow-2xl border-x border-cyan-500/20 pb-12 font-jakarta">
        {/* Hero: couple photo under a turning constellation ring, names in front */}
        <section className="relative w-full h-[600px] overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroPhoto ? (
              <img src={heroPhoto} alt={`${groom} and ${bride}`} className="w-full h-full object-cover brightness-[0.65] contrast-[1.15]" />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_#1E1B4B_0%,_#0B1026_50%,_#080D1A_100%)]">
                {[
                  [12, 18], [30, 8], [70, 14], [85, 30], [55, 25], [20, 45], [80, 55], [40, 60], [65, 42],
                ].map(([x, y], i) => (
                  <span key={i} className="cv-star absolute w-1 h-1 rounded-full bg-white" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.4}s` }} />
                ))}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080D1A] via-[#080D1A]/50 to-black/60" />
            <svg className="absolute -top-24 left-1/2 -translate-x-1/2 w-[420px] h-[420px] text-cyan-300/20 cv-constellation" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.3" aria-hidden>
              <circle cx="50" cy="50" r="48" strokeDasharray="1 2" />
              <circle cx="50" cy="50" r="36" />
              <path d="M20 30 L35 22 L50 28 L62 18 L78 26 M28 70 L42 62 L58 70 L72 64" />
              {[[20, 30], [35, 22], [50, 28], [62, 18], [78, 26], [28, 70], [42, 62], [58, 70], [72, 64]].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="0.9" fill="currentColor" />
              ))}
            </svg>
          </div>

          <div className="relative z-10 flex justify-center pt-2">
            <div className="px-4 py-1 rounded-full bg-black/60 border border-cyan-400/40 backdrop-blur-md">
              <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-cyan-300">✦ Written in the Stars ✦</span>
            </div>
          </div>

          <div className="relative z-10 text-center pb-4">
            <span className="text-[10px] tracking-[0.35em] uppercase text-cyan-200/80 font-semibold mb-2 block">Together with their families</span>
            <h1 className={`font-italiana ${nameSize(groom)} cv-text leading-tight`}>{groom}</h1>
            <div className="my-1 text-cyan-400 font-italiana text-xl italic">— &amp; —</div>
            <h1 className={`font-italiana ${nameSize(bride)} cv-text leading-tight`}>{bride}</h1>
            <div className="mt-4 px-5 py-2 rounded-xl bg-black/70 border border-cyan-500/30 text-xs font-medium text-cyan-100 inline-block shadow-lg">
              {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full px-6 space-y-7 bg-[#080D1A]">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-cyan-500/20 text-center text-xs space-y-2 text-slate-300">
                {hasGroomParents && (
                  <p>
                    <span className="text-cyan-300 block text-[10px] uppercase font-bold tracking-widest">Groom&apos;s Parents</span>
                    Son of {[data.groomMotherName, data.groomFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="h-[1px] w-12 bg-cyan-500/20 mx-auto" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-cyan-300 block text-[10px] uppercase font-bold tracking-widest">Bride&apos;s Parents</span>
                    Daughter of {[data.brideMotherName, data.brideFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <Countdown weddingDate={data.weddingDate} className="text-cyan-300 font-italiana" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={200}>
              <div className="p-5 rounded-2xl bg-white/[0.02] border-y border-cyan-500/30 text-center font-italiana text-base leading-relaxed text-cyan-50">
                &ldquo;{data.welcomeMessage}&rdquo;
              </div>
            </Reveal>
          )}

          {data.loveStory && (
            <Reveal delay={225}>
              <div className="text-center">
                <h4 className="font-italiana text-2xl text-cyan-300 mb-2">Our Story</h4>
                <p className="text-sm font-light leading-relaxed text-slate-300">{data.loveStory}</p>
              </div>
            </Reveal>
          )}

          {/* Floating photo cards */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="py-2">
                <div className="text-center mb-4">
                  <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-cyan-300">✦ Our Moments ✦</span>
                </div>
                <div className="flex justify-center items-center gap-2.5 sm:gap-4 py-2">
                  {gallery.map((img, idx) => (
                    <div
                      key={idx}
                      className={`w-[6.5rem] sm:w-36 h-40 sm:h-44 rounded-2xl overflow-hidden border border-cyan-400/50 p-1 bg-gradient-to-b from-cyan-900/60 to-purple-950/60 shadow-[0_0_15px_rgba(6,182,212,0.25)] cv-float-${idx + 1}`}
                    >
                      <img src={img} alt="Moment" className="w-full h-full object-cover rounded-xl" />
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          <Reveal delay={300}>
            <div className="p-6 rounded-2xl bg-[#0D1527] border border-cyan-500/30 text-center">
              <span className="text-2xl">🌌</span>
              <h3 className="font-italiana text-2xl text-white mt-1">{venue}</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  Get Directions
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-3">
                <h4 className="text-center font-italiana text-2xl text-cyan-300">The Celebrations</h4>
                {data.events.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-xl bg-white/[0.02] border border-cyan-500/20">
                    <div className="flex justify-between items-baseline gap-3 font-bold">
                      <span className="font-italiana text-white text-lg">{evt.eventName}</span>
                      <span className="text-xs text-cyan-400 shrink-0">{evt.eventTime}</span>
                    </div>
                    {evt.eventDate && <div className="text-xs text-purple-300 mt-0.5">{formatIndianDate(evt.eventDate)}</div>}
                    {evt.venue && <div className="text-xs text-slate-300 mt-1">📍 {evt.venue}</div>}
                    {evt.description && <p className="text-xs text-slate-400 mt-1 italic">{evt.description}</p>}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {data.contactDetails && <p className="text-center text-xs text-slate-400">📞 {data.contactDetails}</p>}

          <div className="text-center pt-6 border-t border-cyan-500/20 font-italiana">
            <span className="text-xs text-cyan-400 uppercase tracking-widest font-jakarta block mb-1">Forever and always</span>
            <div className="text-2xl text-white">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
