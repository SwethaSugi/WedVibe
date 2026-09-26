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
 * SereneChapel — Christian Wedding.
 * Cathedral-lit couple photo hero with a shifting stained-glass light beam and an
 * auto-expanding three-panel gallery.
 */
export function SereneChapel({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venue = data.venueName?.trim() || "Church Name";
  const address = data.venueAddress?.trim() || "";

  const hasGroomParents = !!(data.groomFatherName?.trim() || data.groomMotherName?.trim());
  const hasBrideParents = !!(data.brideFatherName?.trim() || data.brideMotherName?.trim());
  const hasFamily = hasGroomParents || hasBrideParents;

  // Only the couple's own photos — no stock fallback on a real invitation.
  const heroPhoto = data.coupleImage || data.brideImage || data.groomImage;
  const gallery = data.galleryImages?.filter(Boolean).slice(0, 3) ?? [];

  return (
    <div className="min-h-full bg-[#0F172A] text-[#F8FAFC] font-serif antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Great+Vibes&family=Inter:wght@300;400;500&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-script { font-family: 'Great Vibes', cursive; }
        .font-inter { font-family: 'Inter', sans-serif; }

        @keyframes sc-breathe {
          0%, 100% { transform: scale(1) translateY(0); filter: brightness(0.7); }
          50% { transform: scale(1.07) translateY(-6px); filter: brightness(0.85); }
        }
        @keyframes sc-beam {
          0%, 100% { opacity: 0.2; transform: rotate(-25deg) translateY(-10%); }
          50% { opacity: 0.55; transform: rotate(-22deg) translateY(0%); }
        }
        @keyframes sc-panel1 { 0%, 100% { flex-grow: 2; } 33%, 66% { flex-grow: 1; } }
        @keyframes sc-panel2 { 0%, 66%, 100% { flex-grow: 1; } 33% { flex-grow: 2; } }
        @keyframes sc-panel3 { 0%, 33%, 100% { flex-grow: 1; } 66% { flex-grow: 2; } }

        .sc-breathe { animation: sc-breathe 22s ease-in-out infinite; }
        .sc-beam { animation: sc-beam 8s ease-in-out infinite; }
        .sc-panel-1 { animation: sc-panel1 9s ease-in-out infinite; }
        .sc-panel-2 { animation: sc-panel2 9s ease-in-out infinite; }
        .sc-panel-3 { animation: sc-panel3 9s ease-in-out infinite; }

        .sc-pearl {
          background: linear-gradient(135deg, #FFFFFF 0%, #FDE68A 50%, #E2E8F0 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .sc-breathe, .sc-beam, .sc-panel-1, .sc-panel-2, .sc-panel-3 { animation: none !important; }
        }
      `}</style>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center bg-[#1E293B] shadow-2xl border-x border-slate-700 pb-12">
        {/* Hero: couple photo in cathedral light, names in front */}
        <section className="relative w-full h-[600px] overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroPhoto ? (
              <img src={heroPhoto} alt={`${groom} and ${bride}`} className="w-full h-full object-cover sc-breathe origin-center" />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_#334155_0%,_#1E293B_55%,_#0F172A_100%)] flex items-center justify-center">
                <svg className="w-52 h-72 text-amber-100/10" viewBox="0 0 100 140" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                  <path d="M10 140 V60 L50 5 L90 60 V140" />
                  <path d="M25 140 V65 L50 30 L75 65 V140" />
                  <circle cx="50" cy="60" r="10" />
                </svg>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-[#1E293B]/55 to-[#0F172A]/75" />
            <div className="absolute -top-32 left-1/4 w-40 h-[700px] bg-gradient-to-b from-amber-200/30 via-rose-300/20 to-transparent sc-beam pointer-events-none blur-xl" />
          </div>

          <div className="relative z-10 text-center pt-3 flex flex-col items-center">
            <div className="w-8 h-8 rounded-full border border-amber-300/40 flex items-center justify-center text-amber-200 text-sm mb-1 backdrop-blur-md bg-white/5">✝</div>
            <span className="text-[10px] tracking-[0.3em] font-inter text-slate-300 uppercase">Joined by God in holy matrimony</span>
          </div>

          <div className="relative z-10 text-center flex flex-col items-center pb-4">
            <h1 className={`font-cormorant ${nameSize(groom)} sc-pearl font-light leading-tight drop-shadow-lg`}>{groom}</h1>
            <div className="font-script text-3xl sm:text-4xl text-amber-200 my-1">and</div>
            <h1 className={`font-cormorant ${nameSize(bride)} sc-pearl font-light leading-tight drop-shadow-lg`}>{bride}</h1>
            <div className="mt-4 px-5 py-1.5 rounded-full bg-black/50 border border-slate-600 text-xs font-inter text-slate-200 tracking-wider">
              {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full px-6 space-y-7">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-slate-700 text-center text-xs space-y-2 font-inter text-slate-300">
                {hasGroomParents && (
                  <p>
                    <span className="text-amber-200 block text-[10px] uppercase font-semibold tracking-widest">Groom&apos;s Parents</span>
                    Son of {[data.groomMotherName, data.groomFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="h-[1px] w-12 bg-slate-700 mx-auto" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-amber-200 block text-[10px] uppercase font-semibold tracking-widest">Bride&apos;s Parents</span>
                    Daughter of {[data.brideMotherName, data.brideFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <Countdown weddingDate={data.weddingDate} className="text-amber-200 font-cormorant" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={200}>
              <div className="p-5 rounded-2xl bg-white/[0.02] border-y border-amber-200/20 text-center font-cormorant italic text-base leading-relaxed text-slate-200">
                &ldquo;{data.welcomeMessage}&rdquo;
              </div>
            </Reveal>
          )}

          {data.loveStory && (
            <Reveal delay={225}>
              <div className="text-center">
                <h4 className="font-cormorant text-2xl text-amber-200 mb-2">Our Story</h4>
                <p className="text-sm font-inter font-light leading-relaxed text-slate-300">{data.loveStory}</p>
              </div>
            </Reveal>
          )}

          {/* Auto-expanding panel gallery */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="py-2">
                <div className="text-center mb-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-inter text-amber-200 font-semibold">Treasured Moments</span>
                </div>
                <div className="flex h-52 gap-2 overflow-hidden rounded-2xl border border-slate-700 p-2 bg-black/40">
                  {gallery.map((img, idx) => (
                    <div
                      key={idx}
                      className={`relative flex-1 min-w-0 overflow-hidden rounded-xl border border-amber-300/30 ${gallery.length > 1 ? `sc-panel-${idx + 1}` : ""}`}
                    >
                      <img src={img} alt="Moment" className="w-full h-full object-cover rounded-xl" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          <Reveal delay={300}>
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-slate-700 text-center">
              <span className="text-2xl">⛪</span>
              <h3 className="font-cormorant text-2xl text-white mt-1">{venue}</h3>
              <p className="text-xs text-slate-400 font-inter mt-1 max-w-sm mx-auto">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-slate-100 text-slate-900 font-inter font-semibold text-xs uppercase tracking-wider shadow-lg hover:bg-white active:scale-95 transition-all"
                >
                  Get Directions
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-3 font-inter">
                <h4 className="text-center font-cormorant text-2xl text-amber-200">Order of Service</h4>
                {data.events.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-xl bg-white/[0.02] border border-slate-700">
                    <div className="flex justify-between items-baseline gap-3 font-cormorant font-semibold text-base text-white">
                      <span>{evt.eventName}</span>
                      <span className="text-xs font-inter text-amber-200 font-normal shrink-0">{evt.eventTime}</span>
                    </div>
                    {evt.eventDate && <div className="text-xs text-slate-400 mt-0.5">{formatIndianDate(evt.eventDate)}</div>}
                    {evt.venue && <div className="text-xs text-slate-300 mt-1">📍 {evt.venue}</div>}
                    {evt.description && <p className="text-xs text-slate-400 mt-1 italic">{evt.description}</p>}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {data.contactDetails && <p className="text-center text-xs text-slate-400 font-inter">📞 {data.contactDetails}</p>}

          <div className="text-center pt-6 border-t border-slate-700 font-cormorant">
            <span className="text-xs text-slate-400 uppercase tracking-widest font-inter block mb-1">&ldquo;Love is patient, love is kind&rdquo;</span>
            <div className="text-2xl text-amber-100">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
