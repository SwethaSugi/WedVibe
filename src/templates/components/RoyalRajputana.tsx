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

const CORNER_PATH = "M2,2 L18,2 C12,6 6,12 2,18 Z M2,2 L2,24 C5,16 16,5 24,2 Z M6,6 L14,6 C10,9 9,10 6,14 Z";

export function RoyalRajputana({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venue = data.venueName?.trim() || "Wedding Venue";
  const address = data.venueAddress?.trim() || "";
  // Cinzel Decorative is wide: step long names down a size so words don't split on phones.
  const nameSize = (name: string) =>
    name.length > 16 ? "text-2xl sm:text-3xl" : name.length > 11 ? "text-[1.7rem] sm:text-4xl" : "text-3xl sm:text-4xl md:text-5xl";

  const hasGroomParents = !!(data.groomFatherName?.trim() || data.groomMotherName?.trim());
  const hasBrideParents = !!(data.brideFatherName?.trim() || data.brideMotherName?.trim());
  const groomParentsText = [data.groomMotherName?.trim(), data.groomFatherName?.trim()].filter(Boolean).join(" & ");
  const brideParentsText = [data.brideMotherName?.trim(), data.brideFatherName?.trim()].filter(Boolean).join(" & ");

  return (
    <div className="min-h-full bg-[#2A050B] text-[#FFF9EF] font-serif antialiased selection:bg-[#E6C158] selection:text-[#2A050B] relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Cinzel:wght@500;600;700&family=Marcellus&display=swap');

        .font-cinzel-dec { font-family: 'Cinzel Decorative', serif; }
        .font-cinzel { font-family: 'Cinzel', serif; }
        .font-marcellus { font-family: 'Marcellus', serif; }

        @keyframes rr-slowRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes rr-pulseGaze {
          0%, 100% { transform: scale(1); opacity: 0.85; }
          50% { transform: scale(1.04); opacity: 1; }
        }
        @keyframes rr-diyaFlicker {
          0%, 100% { transform: scale(1) translateY(0); filter: drop-shadow(0 0 6px rgba(245, 197, 66, 0.8)); }
          50% { transform: scale(1.08) translateY(-2px); filter: drop-shadow(0 0 14px rgba(255, 160, 20, 1)); }
        }
        @keyframes rr-floatPetal {
          0% { transform: translateY(-10px) rotate(0deg); opacity: 0; }
          20% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateY(700px) rotate(360deg); opacity: 0; }
        }

        .rr-spin { animation: rr-slowRotate 45s linear infinite; }
        .rr-diya { animation: rr-diyaFlicker 2.5s ease-in-out infinite; }
        .rr-glow { animation: rr-pulseGaze 4s ease-in-out infinite; }
        .rr-petal { animation: rr-floatPetal linear infinite; }

        .rr-gold-text {
          background: linear-gradient(135deg, #FFF0B3 0%, #E6C158 35%, #FFDF79 65%, #C29633 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .rr-gold-btn {
          background: linear-gradient(135deg, #E6C158 0%, #D4A733 50%, #B3861B 100%);
          background-size: 200% auto;
          transition: all 0.3s ease;
        }
        .rr-gold-btn:hover { background-position: right center; box-shadow: 0 0 20px rgba(230, 193, 88, 0.45); }

        @media (prefers-reduced-motion: reduce) {
          .rr-spin, .rr-diya, .rr-glow, .rr-petal { animation: none !important; }
        }
      `}</style>

      {/* Background ambience — absolute so it stays inside the invitation (e.g. the editor preview) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[700px] h-[700px] bg-gradient-to-b from-[#5C0A15]/70 via-[#3B060D]/40 to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[700px] h-[600px] bg-gradient-to-t from-[#42060E]/80 via-[#2A050B]/60 to-transparent blur-3xl" />
        <div className="rr-petal absolute top-0 text-[#E6C158]/30 text-lg left-[10%]" style={{ animationDuration: "18s", animationDelay: "0s" }}>❀</div>
        <div className="rr-petal absolute top-0 text-[#FFDF79]/20 text-base left-[85%]" style={{ animationDuration: "22s", animationDelay: "4s" }}>❁</div>
        <div className="rr-petal absolute top-0 text-[#E6C158]/25 text-xl left-[45%]" style={{ animationDuration: "20s", animationDelay: "9s" }}>❀</div>
        <div className="rr-petal absolute top-0 text-[#D4A733]/25 text-sm left-[28%]" style={{ animationDuration: "24s", animationDelay: "13s" }}>✦</div>
      </div>

      <main className="relative z-10 w-full max-w-[576px] px-4 py-8 sm:px-6 flex flex-col items-center">
        <div className="w-full bg-[#34070D]/90 backdrop-blur-md rounded-3xl border border-[#E6C158]/35 shadow-[0_20px_60px_rgba(0,0,0,0.85)] p-5 sm:p-7 relative overflow-hidden">
          {/* Ornate corners */}
          {["top-2 left-2", "top-2 right-2 rotate-90", "bottom-2 left-2 -rotate-90", "bottom-2 right-2 rotate-180"].map((pos) => (
            <div key={pos} className={`absolute ${pos} w-10 h-10 pointer-events-none text-[#E6C158]/60`} aria-hidden>
              <svg viewBox="0 0 40 40" fill="currentColor">
                <path d={CORNER_PATH} />
              </svg>
            </div>
          ))}

          {/* 1. Opening blessing & sacred motif */}
          <Reveal delay={0}>
            <section className="text-center pt-3 pb-6 flex flex-col items-center">
              <div className="relative w-20 h-20 mb-4 flex items-center justify-center">
                <svg className="w-20 h-20 text-[#E6C158]/40 rr-spin absolute" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
                  <circle cx="50" cy="50" r="46" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="38" />
                  <path d="M50 4 L50 96 M4 50 L96 50 M17 17 L83 83 M17 83 L83 17" strokeWidth="0.8" />
                  <circle cx="50" cy="50" r="28" strokeDasharray="2 4" />
                </svg>
                <div className="z-10 rr-diya text-[#FFDF79]">
                  <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" aria-hidden>
                    <path d="M24 6C24 6 29 13 29 18C29 21.3 26.8 24 24 24C21.2 24 19 21.3 19 18C19 13 24 6 24 6Z" fill="url(#rrDiyaFlame)" />
                    <path d="M9 25C11 34 17 38 24 38C31 38 37 34 39 25C30 28 18 28 9 25Z" fill="url(#rrDiyaGold)" />
                    <path d="M20 38L18 42H30L28 38H20Z" fill="#B3861B" />
                    <defs>
                      <linearGradient id="rrDiyaFlame" x1="24" y1="6" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FFF3A8" />
                        <stop offset="0.5" stopColor="#FFA41C" />
                        <stop offset="1" stopColor="#E53935" />
                      </linearGradient>
                      <linearGradient id="rrDiyaGold" x1="9" y1="25" x2="39" y2="38" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FDE68A" />
                        <stop offset="0.5" stopColor="#D97706" />
                        <stop offset="1" stopColor="#78350F" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className="inline-block px-4 py-1 rounded-full bg-[#E6C158]/10 border border-[#E6C158]/40 mb-2">
                <span className="text-xs uppercase tracking-[0.3em] font-cinzel text-[#FFDF79]">✦ Auspicious Wedding ✦</span>
              </div>
              <p className="text-xs sm:text-sm tracking-[0.25em] uppercase text-[#F3E5AB]/75 font-marcellus">
                Together With Their Families
              </p>
            </section>
          </Reveal>

          {/* 2. Couple names & photos */}
          <Reveal delay={100}>
            <section className="text-center py-4 flex flex-col items-center">
              <h1 className={`font-cinzel-dec ${nameSize(groom)} font-bold leading-tight rr-gold-text px-2 tracking-wide break-words max-w-full`}>
                {groom}
              </h1>

              <div className="flex items-center justify-center my-3 w-full">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#E6C158]/60 to-transparent" />
                <span className="mx-4 text-xl sm:text-2xl font-cinzel text-[#FFDF79] italic flex items-center gap-1">
                  <span className="text-xs text-[#E6C158]/60">❖</span>&amp;<span className="text-xs text-[#E6C158]/60">❖</span>
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#E6C158]/60 to-transparent" />
              </div>

              <h1 className={`font-cinzel-dec ${nameSize(bride)} font-bold leading-tight rr-gold-text px-2 tracking-wide break-words max-w-full`}>
                {bride}
              </h1>

              {data.coupleImage ? (
                <div className="mt-8 relative group w-64 sm:w-72 mx-auto">
                  <div className="absolute -inset-1 rounded-t-[140px] bg-gradient-to-r from-[#E6C158]/40 via-[#FFDF79]/50 to-[#B8860B]/40 blur-sm rr-glow" />
                  <div className="relative p-1.5 bg-[#420811] rounded-t-[140px] rounded-b-2xl border-2 border-[#E6C158] shadow-2xl overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={data.coupleImage}
                      alt={`${groom} & ${bride}`}
                      className="w-full h-80 sm:h-96 object-cover rounded-t-[136px] rounded-b-xl transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                </div>
              ) : data.groomImage || data.brideImage ? (
                <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md mx-auto">
                  {[
                    { src: data.groomImage, name: groom },
                    { src: data.brideImage, name: bride },
                  ]
                    .filter((p) => p.src)
                    .map((p) => (
                      <div key={p.name} className="flex flex-col items-center">
                        <div className="relative p-1 bg-[#420811] rounded-t-[90px] rounded-b-xl border border-[#E6C158] shadow-lg overflow-hidden w-full">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.src} alt={p.name} className="w-full h-44 sm:h-52 object-cover rounded-t-[86px] rounded-b-lg" loading="lazy" />
                        </div>
                        <span className="text-xs uppercase tracking-widest text-[#FFDF79] mt-2 font-cinzel">{p.name}</span>
                      </div>
                    ))}
                </div>
              ) : null}
            </section>
          </Reveal>

          {/* 3. Family line */}
          {(hasGroomParents || hasBrideParents) && (
            <Reveal delay={150}>
              <section className="my-6 px-4 py-5 rounded-2xl bg-[#4A0A13]/60 border border-[#E6C158]/25 text-center text-xs sm:text-sm font-marcellus leading-relaxed space-y-3">
                {hasGroomParents && (
                  <p className="text-[#FCECD7]">
                    <span className="text-[#FFDF79] uppercase tracking-wider block text-[11px] font-cinzel">Groom&apos;s Family</span>
                    Son of {groomParentsText}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="w-16 h-[1px] bg-[#E6C158]/30 mx-auto" />}
                {hasBrideParents && (
                  <p className="text-[#FCECD7]">
                    <span className="text-[#FFDF79] uppercase tracking-wider block text-[11px] font-cinzel">Bride&apos;s Family</span>
                    Daughter of {brideParentsText}
                  </p>
                )}
              </section>
            </Reveal>
          )}

          {/* 4. Date & time */}
          <Reveal delay={200}>
            <section className="my-6 text-center">
              <div className="inline-flex flex-col items-center p-5 rounded-2xl bg-gradient-to-b from-[#4A0A13] to-[#2B0409] border border-[#E6C158]/40 shadow-inner w-full max-w-sm">
                <span className="text-[11px] tracking-[0.3em] uppercase text-[#E6C158] font-cinzel mb-1">Save The Auspicious Date</span>
                <div className="text-2xl sm:text-3xl font-bold font-cinzel rr-gold-text tracking-wide my-1">
                  {formatIndianDate(data.weddingDate)}
                </div>
                {data.weddingTime && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-[#F7E59E] font-marcellus mt-1">
                    <svg className="w-4 h-4 text-[#E6C158]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{data.weddingTime}</span>
                  </div>
                )}
              </div>
            </section>
          </Reveal>

          {/* 5. Countdown */}
          <Reveal delay={250}>
            <section className="my-4 w-full flex justify-center text-[#FFDF79]">
              <Countdown weddingDate={data.weddingDate} />
            </section>
          </Reveal>

          {/* 6. Welcome message */}
          {data.welcomeMessage && (
            <Reveal delay={300}>
              <section className="my-6 px-4 text-center">
                <div className="relative py-4 px-5 rounded-2xl bg-[#3B070E]/80 border border-[#E6C158]/20">
                  <div className="text-2xl text-[#E6C158]/40 leading-none mb-1">“</div>
                  <p className="text-sm sm:text-base font-marcellus text-[#FFF2DF] leading-relaxed italic">{data.welcomeMessage}</p>
                  <div className="text-2xl text-[#E6C158]/40 leading-none mt-1">”</div>
                </div>
              </section>
            </Reveal>
          )}

          {/* 7. Our story */}
          {data.loveStory && (
            <Reveal delay={350}>
              <section className="my-8 text-center px-4">
                <div className="inline-block mb-3">
                  <h2 className="text-xl sm:text-2xl font-cinzel font-bold rr-gold-text tracking-wide">Our Story</h2>
                  <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-[#E6C158] to-transparent mx-auto mt-1" />
                </div>
                <div className="text-sm sm:text-base text-[#FCECD7] font-marcellus leading-relaxed bg-[#420A12]/50 p-5 rounded-2xl border border-[#E6C158]/20">
                  {data.loveStory}
                </div>
              </section>
            </Reveal>
          )}

          {/* 8. Gallery */}
          {data.galleryImages && data.galleryImages.length > 0 && (
            <Reveal delay={400}>
              <section className="my-8">
                <div className="text-center mb-4">
                  <h2 className="text-xl sm:text-2xl font-cinzel font-bold rr-gold-text tracking-wide">Moments of Joy</h2>
                  <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-[#E6C158] to-transparent mx-auto mt-1" />
                </div>
                <div
                  className={`grid gap-3 sm:gap-4 ${
                    data.galleryImages.length === 1 ? "grid-cols-1" : data.galleryImages.length === 2 ? "grid-cols-2" : "grid-cols-3"
                  }`}
                >
                  {data.galleryImages.slice(0, 3).map((imgUrl, idx) => (
                    <div key={idx} className="group relative rounded-xl overflow-hidden border border-[#E6C158]/40 shadow-lg aspect-square bg-[#220307]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imgUrl}
                        alt={`Gallery moment ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2A050B]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {/* 9. Venue */}
          <Reveal delay={450}>
            <section className="my-8 text-center px-4">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#4A0A13] to-[#2B0409] border border-[#E6C158]/35 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-[#E6C158]/15 border border-[#E6C158]/40 mx-auto flex items-center justify-center text-[#FFDF79] mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-cinzel font-bold text-[#FFDF79] mb-1">{venue}</h3>
                <p className="text-xs sm:text-sm text-[#F7E59E]/85 font-marcellus max-w-sm mx-auto leading-relaxed mb-4">{address}</p>
                {data.googleMapsUrl && (
                  <a
                    href={data.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full rr-gold-btn text-[#2A050B] font-cinzel text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
                  >
                    <span>View Location</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </section>
          </Reveal>

          {/* 10. Events timeline */}
          {data.events && data.events.length > 0 && (
            <Reveal delay={500}>
              <section className="my-8 px-2">
                <div className="text-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-cinzel font-bold rr-gold-text tracking-wide">Wedding Celebrations</h2>
                  <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#E6C158] to-transparent mx-auto mt-1" />
                </div>
                <div className="relative pl-6 sm:pl-8 space-y-6 before:content-[''] before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#E6C158] before:via-[#FFDF79]/70 before:to-[#8B6508]">
                  {data.events.map((evt) => (
                    <div key={evt.id} className="relative group">
                      <div className="absolute -left-[23px] sm:-left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#FFDF79] border-2 border-[#2A050B] ring-2 ring-[#E6C158]/50 group-hover:scale-125 transition-transform" />
                      <div className="p-4 rounded-xl bg-[#3B070E]/80 border border-[#E6C158]/25 hover:border-[#E6C158]/60 transition-colors shadow-md">
                        <h4 className="text-base sm:text-lg font-cinzel font-bold text-[#FFDF79]">{evt.eventName}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#E6C158] font-marcellus mt-1.5">
                          {evt.eventDate && <span>📅 {formatIndianDate(evt.eventDate)}</span>}
                          {evt.eventTime && <span>⏰ {evt.eventTime}</span>}
                        </div>
                        {evt.venue && (
                          <div className="text-xs text-[#FCECD7]/85 font-marcellus mt-2 flex items-start gap-1">
                            <span>📍</span>
                            <span>{evt.venue}</span>
                          </div>
                        )}
                        {evt.description && (
                          <p className="text-xs text-[#F7E59E]/75 italic font-marcellus mt-2 leading-relaxed border-t border-[#E6C158]/15 pt-2">
                            {evt.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {/* 11. Quote, contact & instagram */}
          {(data.quote || data.contactDetails || data.instagramLink) && (
            <Reveal delay={550}>
              <section className="my-8 px-4 text-center space-y-4">
                {data.quote && (
                  <div className="p-4 rounded-xl bg-[#4A0A13]/40 border-y border-[#E6C158]/30">
                    <p className="text-xs sm:text-sm font-marcellus italic text-[#FFF0D4] leading-relaxed">&ldquo;{data.quote}&rdquo;</p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  {data.contactDetails && (
                    <div className="text-xs font-marcellus text-[#E6C158] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E6C158]/10 border border-[#E6C158]/20">
                      <span>📞</span>
                      <span>{data.contactDetails}</span>
                    </div>
                  )}
                  {data.instagramLink && (
                    <a
                      href={data.instagramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-cinzel text-[#FFDF79] flex items-center gap-1.5 px-4 py-2 rounded-full bg-gradient-to-r from-purple-900/40 to-pink-900/40 border border-[#E6C158]/30 hover:border-[#E6C158] transition-all hover:scale-105"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden>
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      <span>Wedding Moments</span>
                    </a>
                  )}
                </div>
              </section>
            </Reveal>
          )}

          {/* 12. Closing */}
          <Reveal delay={600}>
            <section className="text-center pt-8 pb-4 flex flex-col items-center border-t border-[#E6C158]/25">
              <span className="text-xs uppercase tracking-[0.3em] font-cinzel text-[#E6C158]">With Love &amp; Blessings</span>
              <div
                className={`font-cinzel-dec ${groom.length + bride.length > 24 ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"} font-bold rr-gold-text tracking-wide mt-2 break-words max-w-full`}
              >
                {groom} &amp; {bride}
              </div>
              <div className="text-[#FFDF79]/70 text-xs mt-3 flex items-center gap-2">
                <span>✦</span>
                <span className="font-marcellus">We Look Forward To Celebrating With You</span>
                <span>✦</span>
              </div>
            </section>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
