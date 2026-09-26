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

const PRISM_CAPTIONS = ["Blessings 🌿", "Music & Dance 💃", "Colours 🌸"];

/**
 * JashnEMehendi (marketplace name: "Mehendi Nights") — Mehendi.
 * Fairy-lit night garden in teal and fuchsia: couple photo hero with a jewel-toned
 * vignette, twinkling lights, and a diamond-cut prism gallery.
 */
export function JashnEMehendi({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venue = data.venueName?.trim() || "Mehendi Garden";
  const address = data.venueAddress?.trim() || "";

  const hasGroomParents = !!(data.groomFatherName?.trim() || data.groomMotherName?.trim());
  const hasBrideParents = !!(data.brideFatherName?.trim() || data.brideMotherName?.trim());
  const hasFamily = hasGroomParents || hasBrideParents;

  // Only the couple's own photos — no stock fallback on a real invitation.
  const heroPhoto = data.coupleImage || data.brideImage || data.groomImage;
  const gallery = data.galleryImages?.filter(Boolean) ?? [];

  return (
    <div className="min-h-full bg-[#04201A] text-[#FDF2F8] font-sans antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Aref+Ruqaa:wght@700&family=Outfit:wght@400;500;600;700&display=swap');
        .font-aref { font-family: 'Aref Ruqaa', serif; }
        .font-outfit { font-family: 'Outfit', sans-serif; }

        @keyframes mn-twinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); filter: drop-shadow(0 0 8px #F43F5E); }
        }
        @keyframes mn-diamond {
          0%, 100% { transform: scale(1) rotate(0deg); }
          50% { transform: scale(1.06) rotate(1deg); }
        }

        .mn-fairy-1 { animation: mn-twinkle 2.5s ease-in-out infinite; }
        .mn-fairy-2 { animation: mn-twinkle 3.2s ease-in-out infinite 0.7s; }
        .mn-diamond { animation: mn-diamond 4s ease-in-out infinite; }

        .mn-gradient-text {
          background: linear-gradient(135deg, #FDE047 0%, #F43F5E 50%, #FB7185 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .mn-fairy-1, .mn-fairy-2, .mn-diamond { animation: none !important; }
        }
      `}</style>

      {/* Fairy lights — absolute so they stay inside the invitation (e.g. the editor preview) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden" aria-hidden>
        <div className="absolute top-4 left-[15%] text-lg mn-fairy-1">💡</div>
        <div className="absolute top-2 left-[38%] text-sm mn-fairy-2">✨</div>
        <div className="absolute top-5 left-[62%] text-lg mn-fairy-1" style={{ animationDelay: "1.2s" }}>💡</div>
        <div className="absolute top-3 left-[85%] text-base mn-fairy-2" style={{ animationDelay: "0.4s" }}>✨</div>
      </div>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center bg-[#072F27] shadow-2xl border-x-2 border-[#14B8A6]/30 pb-12">
        {/* Hero: couple photo with a teal-fuchsia night vignette, names in front */}
        <section className="relative w-full h-[580px] overflow-hidden flex flex-col justify-end p-6">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroPhoto ? (
              <img src={heroPhoto} alt={`${groom} and ${bride}`} className="w-full h-full object-cover brightness-[0.72] contrast-[1.1]" />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_#9D174D_0%,_#134E4A_45%,_#04201A_100%)] flex items-start justify-center pt-24">
                <span className="text-7xl opacity-50 mn-diamond">🪷</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#072F27] via-[#072F27]/60 to-[#04201A]/70" />
            <div className="absolute inset-0 bg-[#BE185D]/25 mix-blend-color" />
          </div>

          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="px-3.5 py-1 rounded-full bg-[#134E4A]/80 border border-[#F43F5E]/60 text-[10px] tracking-[0.25em] font-outfit uppercase text-[#FDE047] mb-3 backdrop-blur-md">
              🪔 An Evening of Mehendi 🪔
            </div>

            <h1 className={`font-aref ${nameSize(groom)} mn-gradient-text leading-tight drop-shadow-md`}>{groom}</h1>
            <div className="font-aref text-2xl text-[#F43F5E] my-1">&amp;</div>
            <h1 className={`font-aref ${nameSize(bride)} mn-gradient-text leading-tight drop-shadow-md`}>{bride}</h1>

            <div className="mt-4 px-4 py-1.5 rounded-full bg-black/60 border border-[#14B8A6]/50 text-xs font-outfit text-amber-200">
              📅 {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ⏰ ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full px-5 py-6 space-y-7">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 rounded-2xl bg-[#0F3E35] border border-[#14B8A6]/30 text-center text-xs space-y-2 font-outfit text-teal-100">
                {hasGroomParents && (
                  <p>
                    <span className="text-[#FDE047] block text-[10px] uppercase font-bold tracking-widest">Groom&apos;s Side</span>
                    Son of {[data.groomMotherName, data.groomFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="h-[1px] w-12 bg-teal-400/20 mx-auto" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-[#FDE047] block text-[10px] uppercase font-bold tracking-widest">Bride&apos;s Side</span>
                    Daughter of {[data.brideMotherName, data.brideFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <Countdown weddingDate={data.weddingDate} className="text-[#FDE047] font-outfit" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={200}>
              <div className="p-4 rounded-xl bg-[#0F3E35]/60 border-y border-[#14B8A6]/40 text-center font-outfit italic text-sm text-pink-100">
                &ldquo;{data.welcomeMessage}&rdquo;
              </div>
            </Reveal>
          )}

          {/* Diamond-cut prism gallery */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="py-4">
                <div className="text-center mb-6">
                  <span className="text-xs uppercase tracking-widest font-outfit font-bold text-[#FDE047]">💎 Mehendi Moments 💎</span>
                </div>

                <div className="flex justify-center gap-4 sm:gap-6 px-2">
                  {gallery.slice(0, 3).map((img, idx) => (
                    <div key={idx} className="flex flex-col items-center mn-diamond" style={{ animationDelay: `${idx * 0.8}s` }}>
                      <div className="w-[4.5rem] h-[4.5rem] sm:w-24 sm:h-24 rotate-45 overflow-hidden rounded-2xl border-2 border-[#F43F5E] shadow-[0_0_15px_rgba(244,63,94,0.35)] bg-black/50 p-1">
                        <img src={img} alt="Mehendi moment" className="w-full h-full object-cover -rotate-45 scale-[1.45] rounded-xl" />
                      </div>
                      <span className="mt-6 text-[10px] uppercase tracking-wider font-outfit font-semibold text-teal-200 whitespace-nowrap">
                        {PRISM_CAPTIONS[idx]}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          <Reveal delay={300}>
            <div className="p-6 rounded-2xl bg-[#0A382F] border border-[#14B8A6]/40 text-center">
              <span className="text-2xl text-[#F43F5E]">🪷</span>
              <h3 className="font-aref text-2xl text-[#FDE047] mt-1">{venue}</h3>
              <p className="text-xs text-teal-200 font-outfit mt-1 max-w-sm mx-auto">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-gradient-to-r from-[#F43F5E] to-[#BE185D] text-white font-outfit font-semibold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  View Venue on Map
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-3 font-outfit">
                <h4 className="text-center font-aref text-2xl text-[#FDE047]">Music, Mehendi &amp; Dance</h4>
                {data.events.map((evt) => (
                  <div key={evt.id} className="p-3.5 rounded-xl bg-[#0A382F]/70 border border-[#14B8A6]/25">
                    <div className="flex justify-between items-center gap-3 text-[#F43F5E] font-bold">
                      <span>{evt.eventName}</span>
                      <span className="text-xs text-amber-200 font-mono shrink-0">{evt.eventTime}</span>
                    </div>
                    {evt.eventDate && <div className="text-xs text-teal-300 mt-0.5">{formatIndianDate(evt.eventDate)}</div>}
                    {evt.venue && <div className="text-xs text-teal-100 mt-1">📍 {evt.venue}</div>}
                    {evt.description && <p className="text-xs text-teal-200/80 mt-1 italic">{evt.description}</p>}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          <div className="text-center pt-6 border-t border-[#14B8A6]/30 font-aref">
            <span className="text-xs text-teal-300 uppercase tracking-widest font-outfit block mb-1">
              Dress Code: Peacock Teal &amp; Fuchsia Pink
            </span>
            <div className="text-2xl text-[#FDE047]">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
