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
 * BohoBotanica — Floral / Garden.
 * Botanical lookbook: couple photo hero with a slow breathing drift, drifting leaves,
 * and an auto-scrolling gallery track.
 */
export function BohoBotanica({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venue = data.venueName?.trim() || "Botanical Garden Venue";
  const address = data.venueAddress?.trim() || "";

  const hasGroomParents = !!(data.groomFatherName?.trim() || data.groomMotherName?.trim());
  const hasBrideParents = !!(data.brideFatherName?.trim() || data.brideMotherName?.trim());
  const hasFamily = hasGroomParents || hasBrideParents;

  // Only the couple's own photos — no stock fallback on a real invitation.
  const heroPhoto = data.coupleImage || data.brideImage || data.groomImage;
  const gallery = data.galleryImages?.filter(Boolean) ?? [];

  return (
    <div className="min-h-full bg-[#1A221E] text-[#F3EFE6] font-serif antialiased relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Alex+Brush&family=Plus+Jakarta+Sans:wght@300;400;500&display=swap');
        .font-playfair { font-family: 'Playfair Display', serif; }
        .font-script { font-family: 'Alex Brush', cursive; }
        .font-modern { font-family: 'Plus Jakarta Sans', sans-serif; }

        @keyframes bb-leafDrift {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(900px) rotate(180deg); opacity: 0; }
        }
        @keyframes bb-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes bb-breathe {
          0%, 100% { transform: scale(1.03) translateY(0); }
          50% { transform: scale(1.08) translateY(-8px); }
        }

        .bb-leaf-1 { animation: bb-leafDrift 14s linear infinite; }
        .bb-leaf-2 { animation: bb-leafDrift 18s linear infinite 3s; }
        .bb-breathe { animation: bb-breathe 22s ease-in-out infinite; }
        .bb-track { display: flex; width: max-content; animation: bb-marquee 17s linear infinite; }
        .bb-track:hover { animation-play-state: paused; }

        .bb-gold-text {
          background: linear-gradient(135deg, #FFF6E5 0%, #D8B18A 50%, #C49A6C 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        @media (prefers-reduced-motion: reduce) {
          .bb-leaf-1, .bb-leaf-2, .bb-breathe, .bb-track { animation: none !important; }
        }
      `}</style>

      {/* Drifting foliage — absolute so it stays inside the invitation (e.g. the editor preview) */}
      <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden" aria-hidden>
        <div className="absolute top-0 left-[15%] text-[#8FA89B]/40 text-lg bb-leaf-1">🌿</div>
        <div className="absolute top-0 left-[80%] text-[#D8B18A]/30 text-base bb-leaf-2">🍃</div>
        <div className="absolute top-0 left-[50%] text-[#8FA89B]/30 text-xl bb-leaf-1" style={{ animationDelay: "7s" }}>🌸</div>
      </div>

      <main className="w-full max-w-[576px] relative z-10 flex flex-col items-center bg-[#212B26] shadow-2xl border-x border-[#8FA89B]/20">
        {/* Hero: couple photo in the background, names in front */}
        <section className="relative w-full h-[580px] overflow-hidden flex flex-col justify-end p-6 sm:p-8">
          <div className="absolute inset-0 z-0 overflow-hidden">
            {heroPhoto ? (
              <img
                src={heroPhoto}
                alt={`${groom} and ${bride}`}
                className="w-full h-full object-cover bb-breathe origin-center brightness-[0.7] contrast-[1.05]"
              />
            ) : (
              <div className="w-full h-full bg-[radial-gradient(ellipse_at_top,_#3E5447_0%,_#27332D_50%,_#212B26_100%)] flex items-start justify-center pt-20">
                <span className="text-7xl opacity-40 bb-breathe">🌿</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#212B26] via-[#212B26]/50 to-black/30" />
            <div className="absolute inset-0 bg-[#2E3C34]/30 mix-blend-soft-light" />
          </div>

          <div className="relative z-10 text-center flex flex-col items-center">
            <div className="px-3 py-1 rounded-full bg-[#34463C]/80 border border-[#8FA89B]/40 mb-3 backdrop-blur-md">
              <span className="text-[10px] tracking-[0.3em] font-modern uppercase text-[#D8B18A]">Together In The Garden of Love</span>
            </div>

            <h1 className={`font-playfair ${nameSize(groom)} bb-gold-text leading-tight drop-shadow-md`}>{groom}</h1>
            <div className="font-script text-3xl sm:text-4xl text-[#E8C5A5] my-1">and</div>
            <h1 className={`font-playfair ${nameSize(bride)} bb-gold-text leading-tight drop-shadow-md`}>{bride}</h1>

            <div className="mt-4 px-4 py-1.5 rounded-full bg-[#18201C]/80 border border-[#8FA89B]/30 text-xs font-modern text-[#D8B18A]">
              {formatIndianDate(data.weddingDate)} {data.weddingTime && `• ${data.weddingTime}`}
            </div>
          </div>
        </section>

        <div className="w-full px-5 py-8 space-y-7 bg-[#212B26]">
          {hasFamily && (
            <Reveal delay={100}>
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-[#8FA89B]/30 text-center text-xs space-y-2 font-modern text-[#D1D8D4]">
                {hasGroomParents && (
                  <p>
                    <span className="text-[#D8B18A] block text-[10px] uppercase font-bold tracking-wider">Groom&apos;s Parents</span>
                    Son of {[data.groomMotherName, data.groomFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="h-[1px] w-12 bg-[#8FA89B]/20 mx-auto" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-[#D8B18A] block text-[10px] uppercase font-bold tracking-wider">Bride&apos;s Parents</span>
                    Daughter of {[data.brideMotherName, data.brideFatherName].filter(Boolean).join(" & ")}
                  </p>
                )}
              </div>
            </Reveal>
          )}

          <Reveal delay={150}>
            <Countdown weddingDate={data.weddingDate} className="text-[#D8B18A] font-playfair" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={200}>
              <div className="p-5 rounded-2xl bg-[#2A3730] border border-[#8FA89B]/20 text-center font-playfair italic text-sm text-[#E2EBE5]">
                &ldquo;{data.welcomeMessage}&rdquo;
              </div>
            </Reveal>
          )}

          {/* Auto-scrolling gallery track (set is duplicated for a seamless loop) */}
          {gallery.length > 0 && (
            <Reveal delay={250}>
              <section className="overflow-hidden">
                <div className="text-center mb-3">
                  <span className="text-[10px] uppercase tracking-[0.25em] font-modern text-[#D8B18A]">Botanical Memories</span>
                </div>
                <div className="relative w-full overflow-hidden rounded-2xl border border-[#8FA89B]/30 bg-[#161D19]">
                  <div className="bb-track py-2.5">
                    {[...gallery, ...gallery].map((img, i) => (
                      <div key={i} className="shrink-0 px-1.5 w-[150px] sm:w-[190px]">
                        <img
                          src={img}
                          alt="Memory"
                          className="w-full h-36 object-cover rounded-xl shadow-md hover:scale-105 transition-transform"
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
            <div className="p-6 rounded-2xl bg-[#28342E] border border-[#8FA89B]/25 text-center">
              <span className="text-2xl text-[#8FA89B]">🌿</span>
              <h3 className="font-playfair text-xl text-[#F3EFE6] mt-1">{venue}</h3>
              <p className="text-xs text-[#AEBCB4] font-modern mt-1 max-w-sm mx-auto">{address}</p>
              {data.googleMapsUrl && (
                <a
                  href={data.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#D8B18A] text-[#1A221E] font-modern font-semibold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-transform"
                >
                  View Garden Map
                </a>
              )}
            </div>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={350}>
              <div className="space-y-3 font-modern">
                <h4 className="text-center font-playfair text-xl text-[#D8B18A]">Wedding Festivities</h4>
                {data.events.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-xl bg-[#26312B] border border-[#8FA89B]/20">
                    <div className="flex justify-between items-baseline gap-3">
                      <span className="font-playfair font-bold text-sm text-[#F3EFE6]">{evt.eventName}</span>
                      <span className="text-xs text-[#D8B18A] shrink-0">{evt.eventTime}</span>
                    </div>
                    {evt.eventDate && <div className="text-xs text-[#8FA89B] mt-0.5">{formatIndianDate(evt.eventDate)}</div>}
                    {evt.venue && <div className="text-xs text-[#B2C1B8] mt-1">📍 {evt.venue}</div>}
                    {evt.description && <p className="text-xs text-[#9BB0A4] mt-1 italic">{evt.description}</p>}
                  </div>
                ))}
              </div>
            </Reveal>
          )}

          <div className="text-center pt-6 border-t border-[#8FA89B]/20 font-playfair">
            <span className="text-[10px] uppercase tracking-widest text-[#8FA89B]">With Love Always</span>
            <div className="font-script text-3xl text-[#D8B18A] mt-1">
              {groom} &amp; {bride}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
