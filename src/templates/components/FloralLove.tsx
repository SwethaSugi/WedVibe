import { InvitationData } from "@/lib/invitation-types";
import { Countdown } from "../Countdown";
import { Reveal } from "../Reveal";

const PETALS = [
  { left: "6%", duration: "9s", delay: "0s", size: "text-lg" },
  { left: "20%", duration: "12s", delay: "2s", size: "text-sm" },
  { left: "38%", duration: "10s", delay: "4s", size: "text-xl" },
  { left: "55%", duration: "14s", delay: "1s", size: "text-sm" },
  { left: "72%", duration: "11s", delay: "3s", size: "text-lg" },
  { left: "88%", duration: "13s", delay: "5s", size: "text-base" },
];

export function FloralLove({ data }: { data: InvitationData }) {
  const groomName = data.groomName || "Groom Name";
  const brideName = data.brideName || "Bride Name";
  const venueName = data.venueName || "Wedding Venue";
  const venueAddress = data.venueAddress || "";

  return (
    <div className="relative min-h-full bg-gradient-to-b from-rose-50 via-white to-rose-50 text-rose-900 font-sans overflow-hidden">
      <div className="absolute inset-0" aria-hidden>
        {PETALS.map((p, i) => (
          <span
            key={i}
            className={`tpl-petal ${p.size}`}
            style={{ left: p.left, animationDuration: p.duration, animationDelay: p.delay }}
          >
            🌸
          </span>
        ))}
      </div>

      <div className="max-w-xl mx-auto px-6 py-14 text-center relative">
        <Reveal>
          <p className="text-3xl tpl-float inline-block">🌸</p>
          <p className="tracking-wide text-sm uppercase text-rose-400 mt-2">We&apos;re getting married</p>
        </Reveal>

        {data.coupleImage ? (
          <Reveal delay={100}>
            <img
              src={data.coupleImage}
              alt="Couple"
              className="w-44 h-44 object-cover rounded-full mx-auto my-6 shadow-lg transition-transform duration-500 hover:scale-105"
            />
          </Reveal>
        ) : (
          (data.groomImage || data.brideImage) && (
            <Reveal delay={100}>
              <div className="flex items-center justify-center gap-6 my-6">
                {data.groomImage && (
                  <img
                    src={data.groomImage}
                    alt={groomName}
                    className="w-28 h-28 object-cover rounded-full shadow-lg transition-transform duration-500 hover:scale-105"
                  />
                )}
                {data.groomImage && data.brideImage && <span className="text-2xl text-rose-400">&amp;</span>}
                {data.brideImage && (
                  <img
                    src={data.brideImage}
                    alt={brideName}
                    className="w-28 h-28 object-cover rounded-full shadow-lg transition-transform duration-500 hover:scale-105"
                  />
                )}
              </div>
            </Reveal>
          )
        )}

        <Reveal delay={150}>
          <h1 className="text-4xl font-light">
            {groomName} <span className="text-rose-400">&amp;</span> {brideName}
          </h1>
        </Reveal>

        <Reveal>
          <p className="mt-6 text-lg">
            {data.weddingDate
              ? new Date(data.weddingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : "Select Date"}
          </p>
          <p className="text-rose-500">{data.weddingTime}</p>
        </Reveal>

        <Reveal delay={100}>
          <Countdown weddingDate={data.weddingDate} className="my-8 text-rose-700" />
        </Reveal>

        <Reveal>
          <p className="mt-6 max-w-sm mx-auto text-rose-700">{data.welcomeMessage}</p>
        </Reveal>

        {data.loveStory && (
          <Reveal delay={100}>
            <div className="mt-10 bg-white/60 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
              <h2 className="text-lg font-semibold mb-2">💕 Our Story</h2>
              <p className="text-rose-700 leading-relaxed">{data.loveStory}</p>
            </div>
          </Reveal>
        )}

        <Reveal delay={100}>
          <div className="mt-10 bg-white/60 rounded-2xl p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
            <h2 className="text-lg font-semibold mb-1">📍 {venueName}</h2>
            <p className="text-sm text-rose-600">{venueAddress}</p>
            {data.googleMapsUrl && (
              <a
                href={data.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 text-sm px-4 py-2 rounded-full bg-rose-500 text-white transition-transform hover:scale-105 hover:bg-rose-600"
              >
                View Location
              </a>
            )}
          </div>
        </Reveal>

        {data.events?.length > 0 && (
          <div className="mt-10">
            <Reveal>
              <h2 className="text-lg font-semibold mb-4">Wedding Events</h2>
            </Reveal>
            <div className="grid gap-3">
              {data.events.map((e, i) => (
                <Reveal key={e.id} delay={i * 100}>
                  <div className="bg-white/70 rounded-xl p-4 transition-transform hover:-translate-y-0.5 hover:shadow-md">
                    <p className="font-medium">{e.eventName}</p>
                    <p className="text-sm text-rose-600">
                      {e.eventDate ? new Date(e.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + " · " : ""}
                      {e.eventTime}
                      {e.venue ? ` · ${e.venue}` : ""}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {data.galleryImages && data.galleryImages.length > 0 && (
          <Reveal>
            <div className="mt-10 grid grid-cols-3 gap-2">
              {data.galleryImages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-full h-24 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                />
              ))}
            </div>
          </Reveal>
        )}

        {data.quote && (
          <Reveal>
            <p className="mt-10 italic text-rose-500">&ldquo;{data.quote}&rdquo;</p>
          </Reveal>
        )}

        <Reveal>
          <p className="mt-10 text-sm">With Love,</p>
          <p className="text-xl">{groomName} &amp; {brideName}</p>
        </Reveal>
      </div>
    </div>
  );
}
