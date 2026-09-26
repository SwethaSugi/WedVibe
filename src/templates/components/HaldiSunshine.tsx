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

// Shrikhand is heavy and wide: step long names down a size so words don't split on phones.
const nameSize = (name: string) =>
  name.length > 14 ? "text-2xl sm:text-3xl" : name.length > 10 ? "text-[1.7rem] sm:text-4xl" : "text-3xl sm:text-4xl";

const POLAROID_CAPTIONS = ["Golden Sunshine 🌼", "Colours & Laughter 💛", "Blessed Moments ✨"];

/**
 * HaldiSunshine — Haldi.
 * Marigold fiesta: couple photo in a pulsing sunburst circle, floating marigolds,
 * and a shuffling polaroid-stack gallery.
 */
export function HaldiSunshine({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venue = data.venueName?.trim() || "Haldi Courtyard";
  const address = data.venueAddress?.trim() || "";

  const hasGroomParents = !!(data.groomFatherName?.trim() || data.groomMotherName?.trim());
  const hasBrideParents = !!(data.brideFatherName?.trim() || data.brideMotherName?.trim());
  const hasFamily = hasGroomParents || hasBrideParents;

  // Only the couple's own photos — no stock fallback on a real invitation.
  const heroPhoto = data.coupleImage || data.brideImage || data.groomImage;
  const gallery = data.galleryImages?.filter(Boolean) ?? [];

  return (
    <div className="min-h-full bg-[#FFFBEB] text-[#78350F] font-sans antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Shrikhand&family=Baloo+2:wght@500;600;700;800&display=swap');
        .font-shrikhand { font-family: 'Shrikhand', cursive; }
        .font-baloo { font-family: 'Baloo 2', cursive; }

        @keyframes hs-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes hs-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(15deg); }
        }
        @keyframes hs-shuffle {
          0%, 100% { transform: rotate(-3deg) translateY(0); }
          33% { transform: rotate(4deg) translateY(-6px); }
          66% { transform: rotate(-2deg) translateY(4px); }
        }
        @keyframes hs-pulse {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.4)); }
          50% { transform: scale(1.04); filter: drop-shadow(0 0 20px rgba(234, 88, 12, 0.6)); }
        }

        .hs-sun-spin { animation: hs-spin 40s linear infinite; }
        .hs-float { animation: hs-float 4s ease-in-out infinite; }
        .hs-polaroid-1 { animation: hs-shuffle 6s ease-in-out infinite; }
        .hs-polaroid-2 { animation: hs-shuffle 6s ease-in-out infinite 2s; }
        .hs-polaroid-3 { animation: hs-shuffle 6s ease-in-out infinite 4s; }
        .hs-sunburst { animation: hs-pulse 4s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .hs-sun-spin, .hs-float, .hs-polaroid-1, .hs-polaroid-2, .hs-polaroid-3, .hs-sunburst { animation: none !important; }
        }
      `}</style>

      {/* Floating marigolds — absolute so they stay inside the invitation (e.g. the editor preview) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden" aria-hidden>
        <div className="absolute top-[6%] left-[6%] text-3xl hs-float">🌼</div>
        <div className="absolute top-[35%] right-[5%] text-2xl hs-float" style={{ animationDelay: "1.5s" }}>🌻</div>
        <div className="absolute top-[62%] left-[4%] text-3xl hs-float" style={{ animationDelay: "3s" }}>🌼</div>
        <div className="absolute top-[85%] right-[8%] text-2xl hs-float" style={{ animationDelay: "2s" }}>🌻</div>
      </div>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center bg-[#FEF3C7] shadow-2xl border-x-4 border-[#F59E0B]/30 pb-12">
        {/* Hero: couple photo inside a sunburst circle, cheerful names in front */}
        <section className="relative w-full pt-8 pb-6 px-6 flex flex-col items-center text-center overflow-hidden">
          <div className="absolute top-12 w-80 h-80 text-[#F59E0B]/20 hs-sun-spin pointer-events-none" aria-hidden>
            <svg viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 0 L58 35 L93 25 L68 50 L93 75 L58 65 L50 100 L42 65 L7 75 L32 50 L7 25 L42 35 Z" />
            </svg>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F59E0B] text-white font-baloo font-bold text-xs uppercase tracking-widest shadow-md mb-4 z-10">
            <span>✨</span>
            <span>Haldi &amp; Flower Shower</span>
            <span>✨</span>
          </div>

          <div className="relative z-10 w-64 h-64 sm:w-72 sm:h-72 my-2 hs-sunburst">
            <div className="w-full h-full rounded-full border-4 border-[#F59E0B] p-1.5 bg-white shadow-xl overflow-hidden relative">
              {heroPhoto ? (
                <>
                  <img src={heroPhoto} alt={`${groom} and ${bride}`} className="w-full h-full object-cover rounded-full saturate-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#B45309]/50 via-transparent to-transparent rounded-full" />
                </>
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#FDE68A] via-[#FBBF24] to-[#F59E0B] flex items-center justify-center">
                  <span className="font-shrikhand text-6xl text-white drop-shadow-md">
                    {groom.charAt(0)}
                    <span className="text-3xl mx-1">&amp;</span>
                    {bride.charAt(0)}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-3">
            <h1 className={`font-shrikhand ${nameSize(groom)} text-[#B45309] tracking-wide drop-shadow-sm`}>{groom}</h1>
            <div className="font-baloo font-extrabold text-2xl text-[#D97706] my-0.5">&amp;</div>
            <h1 className={`font-shrikhand ${nameSize(bride)} text-[#B45309] tracking-wide drop-shadow-sm`}>{bride}</h1>

            <div className="mt-4 px-5 py-1.5 rounded-full bg-white border-2 border-[#F59E0B] text-xs font-baloo font-bold text-[#92400E] shadow-sm inline-block">
              📅 {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ⏰ ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full px-6 space-y-6">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 rounded-2xl bg-white/80 border-2 border-[#FCD34D] text-center text-xs font-baloo space-y-1.5 shadow-sm">
                {hasGroomParents && (
                  <p>
                    <span className="text-[#D97706] font-bold block uppercase text-[10px]">Groom&apos;s Family</span>
                    Son of {[data.groomMotherName, data.groomFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="h-[1px] w-12 bg-[#FCD34D] mx-auto my-1" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-[#D97706] font-bold block uppercase text-[10px]">Bride&apos;s Family</span>
                    Daughter of {[data.brideMotherName, data.brideFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <Countdown weddingDate={data.weddingDate} className="text-[#B45309] font-baloo" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={200}>
              <div className="p-5 rounded-2xl bg-[#FEF9C3] border-2 border-[#FDE047] text-center font-baloo font-medium text-sm text-[#78350F] shadow-inner">
                &ldquo;{data.welcomeMessage}&rdquo;
              </div>
            </Reveal>
          )}

          {/* Shuffling polaroid stack */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="py-2">
                <div className="text-center mb-4">
                  <span className="text-xs uppercase tracking-widest font-baloo font-bold text-[#B45309]">🌻 Sunshine Snapshots 🌻</span>
                </div>

                <div className="flex flex-wrap sm:flex-nowrap justify-center items-center gap-3 sm:gap-4 px-2">
                  {gallery.slice(0, 3).map((img, idx) => (
                    <div
                      key={idx}
                      className={`w-36 sm:w-40 bg-white p-2.5 pb-4 rounded-xl shadow-lg border border-amber-200 transition-all hs-polaroid-${idx + 1}`}
                    >
                      <img src={img} alt="Haldi moment" className="w-full h-32 object-cover rounded-lg" />
                      <div className="text-center mt-2 font-baloo text-[11px] font-bold text-[#92400E]">{POLAROID_CAPTIONS[idx]}</div>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          <Reveal delay={300}>
            <div className="p-6 rounded-3xl bg-white border-2 border-[#F59E0B] text-center shadow-md">
              <div className="text-3xl mb-1">🏡</div>
              <h3 className="font-shrikhand text-xl text-[#B45309]">{venue}</h3>
              <p className="text-xs text-[#92400E] font-baloo mt-1">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-[#F59E0B] text-white font-baloo font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#D97706] active:scale-95 transition-all"
                >
                  📍 Open Location Map
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-3 font-baloo">
                <h4 className="text-center font-shrikhand text-xl text-[#B45309]">The Celebrations</h4>
                {data.events.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-2xl bg-white border-2 border-[#FDE047] shadow-sm">
                    <div className="flex justify-between items-center gap-3 font-bold text-[#B45309]">
                      <span>{evt.eventName}</span>
                      {evt.eventTime && (
                        <span className="text-xs bg-[#FEF3C7] px-2 py-0.5 rounded-full text-[#92400E] shrink-0">{evt.eventTime}</span>
                      )}
                    </div>
                    {evt.eventDate && <div className="text-xs text-[#D97706] mt-0.5">{formatIndianDate(evt.eventDate)}</div>}
                    {evt.venue && <div className="text-xs text-[#78350F] mt-1">📍 {evt.venue}</div>}
                    {evt.description && <p className="text-xs text-[#92400E] mt-1 italic">{evt.description}</p>}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          <div className="text-center pt-6 border-t-2 border-[#FCD34D] font-shrikhand">
            <span className="text-xs text-[#D97706] uppercase tracking-widest font-baloo font-bold block mb-1">
              Dress Code: Bright Yellow &amp; Floral
            </span>
            <div className="text-2xl text-[#B45309]">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
