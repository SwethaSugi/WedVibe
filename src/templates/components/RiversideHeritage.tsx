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
  name.length > 16 ? "text-2xl sm:text-3xl" : name.length > 11 ? "text-[1.8rem] sm:text-4xl" : "text-4xl sm:text-5xl";

/**
 * RiversideHeritage — Traditional.
 * Crimson brocade and temple gold: couple photo hero, glowing river lamps and
 * gently bobbing lotus-arch photo frames.
 */
export function RiversideHeritage({ data }: { data: InvitationData }) {
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
    <div className="min-h-full bg-[#2A0508] text-[#FFFBEB] font-serif antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rozha+One&family=Marcellus&display=swap');
        .font-rozha { font-family: 'Rozha One', serif; }
        .font-marcellus { font-family: 'Marcellus', serif; }

        @keyframes rh-bob1 { 0%, 100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-10px) rotate(2deg); } }
        @keyframes rh-bob2 { 0%, 100% { transform: translateY(-8px) rotate(-1.5deg); } 50% { transform: translateY(2px) rotate(1deg); } }
        @keyframes rh-bob3 { 0%, 100% { transform: translateY(2px) rotate(2deg); } 50% { transform: translateY(-8px) rotate(-1deg); } }
        @keyframes rh-lamp {
          0%, 100% { opacity: 0.6; filter: drop-shadow(0 0 8px #F59E0B); }
          50% { opacity: 1; filter: drop-shadow(0 0 18px #EF4444); }
        }

        .rh-lotus-1 { animation: rh-bob1 4.5s ease-in-out infinite; }
        .rh-lotus-2 { animation: rh-bob2 5.2s ease-in-out infinite 0.7s; }
        .rh-lotus-3 { animation: rh-bob3 4.8s ease-in-out infinite 1.4s; }
        .rh-lamp { animation: rh-lamp 3s ease-in-out infinite; }

        .rh-gold-text {
          background: linear-gradient(135deg, #FFF9D2 0%, #FFD700 50%, #D4AF37 80%, #996515 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .rh-lotus-1, .rh-lotus-2, .rh-lotus-3, .rh-lamp { animation: none !important; }
        }
      `}</style>

      {/* Glowing lamps — absolute so they stay inside the invitation (e.g. the editor preview) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden" aria-hidden>
        <div className="absolute top-[20%] left-[5%] text-xl rh-lamp">🪔</div>
        <div className="absolute top-[55%] right-[5%] text-2xl rh-lamp" style={{ animationDelay: "1.2s" }}>🪔</div>
        <div className="absolute top-[80%] left-[4%] text-lg rh-lamp" style={{ animationDelay: "2s" }}>🪔</div>
      </div>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center bg-[#3D080D] shadow-2xl border-x-4 border-amber-500/40 pb-12">
        {/* Hero: couple photo in crimson and gold, names in front */}
        <section className="relative w-full h-[600px] overflow-hidden flex flex-col justify-between p-6">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroPhoto ? (
              <img src={heroPhoto} alt={`${groom} and ${bride}`} className="w-full h-full object-cover brightness-[0.68]" />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_#7F1D1D_0%,_#450A0A_50%,_#2A0508_100%)] flex items-end justify-center pb-40">
                <span className="text-8xl opacity-30">🪷</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3D080D] via-[#3D080D]/60 to-black/70" />
            <div className="absolute inset-0 bg-[#991B1B]/25 mix-blend-color" />
          </div>

          <div className="relative z-10 text-center pt-2">
            <div className="inline-block px-4 py-1.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 backdrop-blur-md">
              <span className="text-[11px] font-marcellus tracking-widest text-[#FDE68A] uppercase">✦ With the blessings of the Almighty ✦</span>
            </div>
            <span className="text-[10px] tracking-[0.25em] font-marcellus text-amber-200/80 uppercase block mt-2">Wedding Ceremony</span>
          </div>

          <div className="relative z-10 text-center pb-4">
            <h1 className={`font-rozha ${nameSize(groom)} rh-gold-text leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}>{groom}</h1>
            <div className="flex items-center justify-center gap-3 my-2 text-amber-400 text-xl">
              <span>✦</span>
              <span className="font-marcellus italic text-amber-200">weds</span>
              <span>✦</span>
            </div>
            <h1 className={`font-rozha ${nameSize(bride)} rh-gold-text leading-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)]`}>{bride}</h1>
            <div className="mt-4 px-5 py-2 rounded-full bg-[#1F0306]/90 border border-amber-500/40 text-xs font-marcellus text-amber-200 inline-block shadow-lg">
              {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full px-6 space-y-7 bg-gradient-to-b from-[#3D080D] to-[#250407]">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 rounded-2xl bg-[#520C13]/60 border border-amber-500/30 text-center text-xs space-y-2 font-marcellus text-amber-100">
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
              <div className="p-5 rounded-2xl bg-[#520C13]/50 border-y border-amber-500/30 text-center font-marcellus text-sm leading-relaxed text-[#FFF1D0]">
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

          {/* Bobbing lotus-arch photo frames */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="py-2">
                <div className="text-center mb-4">
                  <span className="text-xs uppercase tracking-widest font-marcellus text-amber-300">🪷 Precious Moments 🪷</span>
                </div>
                <div className="flex justify-center items-center gap-2 sm:gap-3 py-2">
                  {gallery.map((img, idx) => (
                    <div
                      key={idx}
                      className={`w-[6.5rem] sm:w-36 h-40 sm:h-44 rounded-t-[50px] rounded-b-2xl overflow-hidden border-2 border-amber-400/60 p-1 bg-gradient-to-b from-amber-500 to-[#7F1D1D] shadow-xl rh-lotus-${idx + 1}`}
                    >
                      <img src={img} alt="Moment" className="w-full h-full object-cover rounded-t-[46px] rounded-b-xl" />
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          <Reveal delay={300}>
            <div className="p-6 rounded-2xl bg-[#520C13]/70 border border-amber-500/40 text-center font-marcellus">
              <div className="text-2xl mb-1">🛕</div>
              <h3 className="font-rozha text-2xl text-[#FFF1D0]">{venue}</h3>
              <p className="text-xs text-amber-200/80 mt-1 max-w-sm mx-auto">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 text-[#2A0508] font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  Get Directions
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-3 font-marcellus">
                <h4 className="text-center font-rozha text-2xl text-amber-300">Wedding Ceremonies</h4>
                {data.events.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-xl bg-[#4C0910]/60 border border-amber-500/25">
                    <div className="flex justify-between items-baseline gap-3 font-bold text-amber-100">
                      <span className="font-rozha text-base">{evt.eventName}</span>
                      <span className="text-xs text-amber-400 font-sans shrink-0">{evt.eventTime}</span>
                    </div>
                    {evt.eventDate && <div className="text-xs text-amber-300/80 mt-0.5">{formatIndianDate(evt.eventDate)}</div>}
                    {evt.venue && <div className="text-xs text-amber-200/80 mt-1">📍 {evt.venue}</div>}
                    {evt.description && <p className="text-xs text-amber-100/70 mt-1 italic">{evt.description}</p>}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          {data.contactDetails && <p className="text-center text-xs text-amber-200/80 font-marcellus">📞 {data.contactDetails}</p>}

          <div className="text-center pt-6 border-t border-amber-500/30 font-rozha">
            <span className="text-xs text-amber-400 uppercase tracking-widest font-marcellus block mb-1">
              Your gracious presence is humbly requested
            </span>
            <div className="text-2xl text-[#FFF1D0]">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
