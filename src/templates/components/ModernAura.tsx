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

const INSTAGRAM_PATH =
  "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z";

/**
 * ModernAura — Modern.
 * Frosted-glass editorial card on a softly glowing aurora background, with couple
 * or groom + bride portraits, love story, gallery grid and an events timeline.
 */
export function ModernAura({ data }: { data: InvitationData }) {
  const groom = data.groomName?.trim() || "Groom Name";
  const bride = data.brideName?.trim() || "Bride Name";
  const venue = data.venueName?.trim() || "Wedding Venue";
  const address = data.venueAddress?.trim() || "";

  const hasGroomParents = !!(data.groomFatherName?.trim() || data.groomMotherName?.trim());
  const hasBrideParents = !!(data.brideFatherName?.trim() || data.brideMotherName?.trim());
  const groomParentsText = [data.groomMotherName?.trim(), data.groomFatherName?.trim()].filter(Boolean).join(" & ");
  const brideParentsText = [data.brideMotherName?.trim(), data.brideFatherName?.trim()].filter(Boolean).join(" & ");
  const gallery = data.galleryImages?.filter(Boolean).slice(0, 3) ?? [];

  return (
    <div className="min-h-full bg-[#0A0D14] text-[#F3F4F6] font-sans antialiased selection:bg-[#E2B89B] selection:text-[#0A0D14] relative overflow-hidden flex flex-col items-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-sans-modern { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; }

        @keyframes ma-aura {
          0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.35; filter: blur(40px); }
          50% { transform: scale(1.15) rotate(180deg); opacity: 0.55; filter: blur(55px); }
        }
        @keyframes ma-float {
          0% { transform: translateY(0px) scale(0.8); opacity: 0; }
          30% { opacity: 0.7; }
          70% { opacity: 0.7; }
          100% { transform: translateY(-380px) scale(1.2); opacity: 0; }
        }
        @keyframes ma-ring { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .ma-aura-1 { animation: ma-aura 14s ease-in-out infinite; }
        .ma-aura-2 { animation: ma-aura 18s ease-in-out infinite reverse; }
        .ma-ring { animation: ma-ring 35s linear infinite; }
        .ma-mote { animation: ma-float linear infinite; }

        .ma-text {
          background: linear-gradient(135deg, #FFFFFF 0%, #F5E6D3 40%, #E2B89B 75%, #D4AF37 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .ma-glass {
          background: rgba(18, 23, 34, 0.65);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(226, 184, 155, 0.18);
        }
        .ma-btn {
          background: linear-gradient(135deg, #E2B89B 0%, #D4A373 50%, #C08552 100%);
          box-shadow: 0 4px 20px rgba(226, 184, 155, 0.25);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .ma-btn:hover { box-shadow: 0 6px 28px rgba(226, 184, 155, 0.45); transform: translateY(-2px); }

        @media (prefers-reduced-motion: reduce) {
          .ma-aura-1, .ma-aura-2, .ma-ring, .ma-mote { animation: none !important; }
        }
      `}</style>

      {/* Ambient glows — absolute so they stay inside the invitation (e.g. the editor preview) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden>
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[340px] sm:w-[480px] h-[340px] sm:h-[480px] rounded-full bg-gradient-to-tr from-[#9B51E0]/20 via-[#E2B89B]/25 to-[#4A90E2]/15 ma-aura-1" />
        <div className="absolute top-[45%] left-1/4 w-[280px] h-[280px] rounded-full bg-gradient-to-br from-[#E2B89B]/15 via-[#C08552]/15 to-transparent ma-aura-2" />
        <div className="absolute bottom-10 right-1/4 w-[320px] h-[320px] rounded-full bg-gradient-to-t from-[#D4AF37]/15 via-[#9B51E0]/15 to-transparent ma-aura-1" />
        <div className="ma-mote absolute text-[#E2B89B]/40 text-xs left-[15%] bottom-[10%]" style={{ animationDuration: "14s" }}>✦</div>
        <div className="ma-mote absolute text-white/30 text-[9px] left-[78%] bottom-[20%]" style={{ animationDuration: "18s", animationDelay: "4s" }}>✧</div>
        <div className="ma-mote absolute text-[#E2B89B]/40 text-sm left-[48%] bottom-[5%]" style={{ animationDuration: "16s", animationDelay: "8s" }}>✦</div>
        <div className="ma-mote absolute text-[#D4A373]/30 text-[10px] left-[25%] bottom-[35%]" style={{ animationDuration: "20s", animationDelay: "11s" }}>✧</div>
      </div>

      <main className="relative z-10 w-full max-w-[576px] px-4 py-8 sm:px-6 flex flex-col items-center">
        <div className="w-full ma-glass rounded-[36px] shadow-[0_25px_70px_rgba(0,0,0,0.8)] p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1.5px] tpl-shimmer-line tpl-grow-line" />

          {/* Opening */}
          <Reveal delay={0}>
            <section className="text-center pt-2 pb-6 flex flex-col items-center">
              <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                <svg className="w-16 h-16 text-[#E2B89B]/30 ma-ring absolute" viewBox="0 0 100 100" fill="none" aria-hidden>
                  <circle cx="50" cy="50" r="46" stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" />
                  <circle cx="50" cy="50" r="38" stroke="currentColor" strokeWidth="0.5" />
                </svg>
                <div className="z-10 text-[#E2B89B] tpl-sparkle">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 0 0 9-9 9 9 0 0 0-9-9 9 9 0 0 0-9 9 9 9 0 0 0 9 9Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 17a5 5 0 0 0 5-5 5 5 0 0 0-5-5 5 5 0 0 0-5 5 5 5 0 0 0 5 5Z" opacity="0.6" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 mb-2.5 backdrop-blur-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E2B89B] animate-pulse" />
                <span className="text-[11px] uppercase tracking-[0.28em] font-sans-modern font-semibold text-[#E2B89B]">Together Forever</span>
              </div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#9CA3AF] font-sans-modern font-light">
                Request the pleasure of your company
              </p>
            </section>
          </Reveal>

          {/* Names & photos */}
          <Reveal delay={100}>
            <section className="text-center py-2 flex flex-col items-center">
              <h1 className={`font-cormorant ${nameSize(groom)} font-normal tracking-tight ma-text leading-tight px-2`}>{groom}</h1>
              <div className="flex items-center justify-center my-3 w-full max-w-[280px]">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#E2B89B]/40 to-transparent" />
                <span className="mx-4 text-xl sm:text-2xl font-cormorant italic text-[#E2B89B]/90 font-light">and</span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-[#E2B89B]/40 to-transparent" />
              </div>
              <h1 className={`font-cormorant ${nameSize(bride)} font-normal tracking-tight ma-text leading-tight px-2`}>{bride}</h1>

              {/* coupleImage → one arched photo; otherwise groom/bride portraits; otherwise nothing */}
              {data.coupleImage ? (
                <div className="mt-8 relative group w-64 sm:w-72 mx-auto">
                  <div className="absolute -inset-2 rounded-[28px] bg-gradient-to-tr from-[#E2B89B]/30 via-transparent to-[#9B51E0]/20 blur-xl opacity-75" />
                  <div className="relative p-1.5 rounded-[28px] bg-white/[0.06] border border-white/15 backdrop-blur-md overflow-hidden shadow-2xl">
                    <img
                      src={data.coupleImage}
                      alt={`${groom} & ${bride}`}
                      className="w-full h-80 sm:h-96 object-cover rounded-[22px] transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>
                </div>
              ) : data.groomImage || data.brideImage ? (
                <div className={`mt-8 grid gap-3.5 w-full max-w-md mx-auto ${data.groomImage && data.brideImage ? "grid-cols-2" : "grid-cols-1 max-w-[220px]"}`}>
                  {[
                    { img: data.groomImage, name: groom },
                    { img: data.brideImage, name: bride },
                  ]
                    .filter((p) => p.img)
                    .map((p) => (
                      <div key={p.name} className="flex flex-col items-center">
                        <div className="relative p-1 rounded-2xl bg-white/[0.05] border border-white/10 overflow-hidden w-full aspect-[4/5] shadow-lg">
                          <img src={p.img} alt={p.name} className="w-full h-full object-cover rounded-xl" />
                        </div>
                        <span className="text-[11px] uppercase tracking-wider text-[#E2B89B] mt-2 font-sans-modern font-medium">{p.name}</span>
                      </div>
                    ))}
                </div>
              ) : null}
            </section>
          </Reveal>

          {(hasGroomParents || hasBrideParents) && (
            <Reveal delay={150}>
              <section className="my-6 px-4 py-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-center text-xs sm:text-sm font-sans-modern font-light text-[#D1D5DB] leading-relaxed space-y-2.5">
                {hasGroomParents && (
                  <p>
                    <span className="text-[#E2B89B] uppercase tracking-wider block text-[10px] font-semibold">Groom&apos;s Parents</span>
                    Son of {groomParentsText}
                  </p>
                )}
                {hasGroomParents && hasBrideParents && <div className="w-12 h-[1px] bg-white/10 mx-auto" />}
                {hasBrideParents && (
                  <p>
                    <span className="text-[#E2B89B] uppercase tracking-wider block text-[10px] font-semibold">Bride&apos;s Parents</span>
                    Daughter of {brideParentsText}
                  </p>
                )}
              </section>
            </Reveal>
          )}

          {/* Date & time */}
          <Reveal delay={200}>
            <section className="my-6 text-center">
              <div className="inline-flex flex-col items-center p-5 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-[#E2B89B]/25 w-full max-w-sm shadow-md">
                <span className="text-[10px] uppercase tracking-[0.3em] font-sans-modern font-semibold text-[#E2B89B] mb-1">Save The Date</span>
                <div className="text-2xl sm:text-3xl font-cormorant font-semibold ma-text tracking-wide my-1">{formatIndianDate(data.weddingDate)}</div>
                {data.weddingTime && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-[#9CA3AF] font-sans-modern mt-1">
                    <svg className="w-4 h-4 text-[#E2B89B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                    <span>{data.weddingTime}</span>
                  </div>
                )}
              </div>
            </section>
          </Reveal>

          <Reveal delay={250}>
            <Countdown weddingDate={data.weddingDate} className="my-4 text-[#F5E6D3] font-cormorant" />
          </Reveal>

          {data.welcomeMessage && (
            <Reveal delay={300}>
              <section className="my-6 px-3 text-center">
                <div className="py-5 px-6 rounded-2xl bg-white/[0.03] border border-white/[0.08]">
                  <p className="text-sm sm:text-base font-cormorant italic text-[#F3F4F6] leading-relaxed">&ldquo;{data.welcomeMessage}&rdquo;</p>
                </div>
              </section>
            </Reveal>
          )}

          {data.loveStory && (
            <Reveal delay={350}>
              <section className="my-8 text-center px-3">
                <h2 className="text-2xl sm:text-3xl font-cormorant ma-text">Our Story</h2>
                <div className="h-[1px] w-14 bg-[#E2B89B]/50 mx-auto mt-1 mb-3" />
                <div className="text-xs sm:text-sm text-[#D1D5DB] font-sans-modern font-light leading-relaxed bg-white/[0.02] p-5 rounded-2xl border border-white/[0.06]">
                  {data.loveStory}
                </div>
              </section>
            </Reveal>
          )}

          {gallery.length > 0 && (
            <Reveal delay={400}>
              <section className="my-8">
                <div className="text-center mb-4">
                  <h2 className="text-2xl sm:text-3xl font-cormorant ma-text">Captured Memories</h2>
                  <div className="h-[1px] w-14 bg-[#E2B89B]/50 mx-auto mt-1" />
                </div>
                <div className={`grid gap-3 ${gallery.length === 1 ? "grid-cols-1" : gallery.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                  {gallery.map((imgUrl, idx) => (
                    <div key={idx} className="group relative rounded-2xl overflow-hidden border border-white/10 aspect-square bg-slate-900/60 shadow-lg">
                      <img
                        src={imgUrl}
                        alt={`Moment ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          <Reveal delay={450}>
            <section className="my-8 text-center px-3">
              <div className="p-6 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] border border-white/10 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-white/[0.05] border border-white/10 mx-auto flex items-center justify-center text-[#E2B89B] mb-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </div>
                <h3 className="text-xl sm:text-2xl font-cormorant font-semibold text-[#F3F4F6] mb-1">{venue}</h3>
                <p className="text-xs sm:text-sm text-[#9CA3AF] font-sans-modern font-light max-w-sm mx-auto leading-relaxed mb-5">{address}</p>
                {data.googleMapsUrl && (
                  <a
                    href={data.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full ma-btn text-[#0A0D14] font-sans-modern text-xs sm:text-sm font-semibold tracking-wider uppercase active:scale-95"
                  >
                    View Location
                  </a>
                )}
              </div>
            </section>
          </Reveal>

          {data.events && data.events.length > 0 && (
            <Reveal delay={500}>
              <section className="my-8 px-2">
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-3xl font-cormorant ma-text">Order of Events</h2>
                  <div className="h-[1px] w-14 bg-[#E2B89B]/50 mx-auto mt-1" />
                </div>
                <div className="relative pl-6 sm:pl-8 space-y-5 before:content-[''] before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-gradient-to-b before:from-[#E2B89B] before:via-[#E2B89B]/40 before:to-transparent">
                  {data.events.map((evt) => (
                    <div key={evt.id} className="relative">
                      <div className="absolute -left-[23px] sm:-left-[27px] top-2 w-3.5 h-3.5 rounded-full bg-[#E2B89B] border-2 border-[#0A0D14] ring-2 ring-white/10" />
                      <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-[#E2B89B]/40 transition-colors">
                        <h4 className="text-base sm:text-lg font-cormorant font-semibold text-[#F5E6D3]">{evt.eventName}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#E2B89B] font-sans-modern font-medium mt-1">
                          {evt.eventDate && <span>📅 {formatIndianDate(evt.eventDate)}</span>}
                          {evt.eventTime && <span>⏰ {evt.eventTime}</span>}
                        </div>
                        {evt.venue && <div className="text-xs text-[#9CA3AF] font-sans-modern font-light mt-1.5">📍 {evt.venue}</div>}
                        {evt.description && (
                          <p className="text-xs text-[#D1D5DB]/80 italic font-sans-modern mt-2 border-t border-white/[0.06] pt-2 leading-relaxed">{evt.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </Reveal>
          )}

          {(data.quote || data.contactDetails || data.instagramLink) && (
            <Reveal delay={550}>
              <section className="my-8 px-3 text-center space-y-4">
                {data.quote && (
                  <div className="p-4 rounded-2xl bg-white/[0.02] border-y border-white/[0.08]">
                    <p className="text-xs sm:text-sm font-cormorant italic text-[#F3F4F6] leading-relaxed">&ldquo;{data.quote}&rdquo;</p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  {data.contactDetails && (
                    <div className="text-xs font-sans-modern text-[#E2B89B] px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/10">📞 {data.contactDetails}</div>
                  )}
                  {data.instagramLink && (
                    <a
                      href={data.instagramLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-sans-modern text-[#F5E6D3] flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/15 hover:border-[#E2B89B] transition-all hover:scale-105"
                    >
                      <svg className="w-3.5 h-3.5 fill-current text-[#E2B89B]" viewBox="0 0 24 24" aria-hidden>
                        <path d={INSTAGRAM_PATH} />
                      </svg>
                      <span>Follow our story</span>
                    </a>
                  )}
                </div>
              </section>
            </Reveal>
          )}

          <Reveal delay={600}>
            <section className="text-center pt-8 pb-3 flex flex-col items-center border-t border-white/[0.08]">
              <span className="text-[10px] uppercase tracking-[0.3em] font-sans-modern font-semibold text-[#E2B89B]">With Gratitude &amp; Love</span>
              <div className="font-cormorant text-3xl sm:text-4xl ma-text tracking-wide mt-2">
                {groom} &amp; {bride}
              </div>
              <div className="text-[#9CA3AF] text-xs font-sans-modern font-light mt-2">✦ We can&apos;t wait to celebrate with you ✦</div>
            </section>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
