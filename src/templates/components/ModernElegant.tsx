import { InvitationData } from "@/lib/invitation-types";
import { Countdown } from "../Countdown";
import { Reveal } from "../Reveal";

export function ModernElegant({ data }: { data: InvitationData }) {
  const groomName = data.groomName || "Groom Name";
  const brideName = data.brideName || "Bride Name";
  const venueName = data.venueName || "Wedding Venue";
  const venueAddress = data.venueAddress || "";

  return (
    <div
      className="tpl-gradient-pan relative min-h-full text-white font-sans"
      style={{ background: "linear-gradient(120deg, #0a0a0a, #171717, #0a0a0a, #1c1c1c)" }}
    >
      <div className="max-w-xl mx-auto px-6 py-16 text-center relative">
        <Reveal>
          <p className="text-xs tracking-[0.4em] uppercase text-neutral-400">The Wedding Of</p>
          <h1 className="text-5xl font-light mt-4 tracking-tight">
            {groomName}
            <span className="block text-neutral-500 text-3xl my-1">+</span>
            {brideName}
          </h1>
        </Reveal>

        {data.coupleImage ? (
          <Reveal delay={100}>
            <img
              src={data.coupleImage}
              alt="Couple"
              className="w-full h-64 object-cover rounded-2xl mx-auto my-8 transition-transform duration-500 hover:scale-[1.02]"
            />
          </Reveal>
        ) : (
          (data.groomImage || data.brideImage) && (
            <Reveal delay={100}>
              <div className="flex items-center justify-center gap-4 my-8">
                {data.groomImage && (
                  <img
                    src={data.groomImage}
                    alt={groomName}
                    className="w-32 h-40 object-cover rounded-xl transition-transform duration-500 hover:scale-[1.02]"
                  />
                )}
                {data.brideImage && (
                  <img
                    src={data.brideImage}
                    alt={brideName}
                    className="w-32 h-40 object-cover rounded-xl transition-transform duration-500 hover:scale-[1.02]"
                  />
                )}
              </div>
            </Reveal>
          )
        )}

        <Reveal delay={150}>
          <div className="grid grid-cols-2 gap-4 mt-8 text-left max-w-sm mx-auto">
            <div>
              <p className="text-xs uppercase text-neutral-500">Date</p>
              <p>
                {data.weddingDate
                  ? new Date(data.weddingDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                  : "TBD"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-neutral-500">Time</p>
              <p>{data.weddingTime}</p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <Countdown weddingDate={data.weddingDate} className="my-10" />
        </Reveal>

        <Reveal>
          <p className="text-neutral-300 max-w-sm mx-auto">{data.welcomeMessage}</p>
        </Reveal>

        {data.loveStory && (
          <Reveal delay={100}>
            <div className="mt-10 text-left">
              <p className="text-xs uppercase text-neutral-500 mb-2 text-center">Our Story</p>
              <p className="text-neutral-300 leading-relaxed">{data.loveStory}</p>
            </div>
          </Reveal>
        )}

        {data.galleryImages && data.galleryImages.length > 0 && (
          <Reveal>
            <div className="mt-10">
              <p className="text-xs uppercase text-neutral-500 mb-4 text-center">Gallery</p>
              <div className="grid grid-cols-3 gap-2">
                {data.galleryImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-full h-24 object-cover rounded-lg transition-transform duration-300 hover:scale-105"
                  />
                ))}
              </div>
            </div>
          </Reveal>
        )}

        <Reveal delay={100}>
          <div className="mt-10 border border-neutral-800 rounded-2xl p-6 text-left transition-colors hover:border-neutral-600">
            <p className="text-xs uppercase text-neutral-500 mb-1">Venue</p>
            <p className="text-lg">{venueName}</p>
            <p className="text-neutral-400 text-sm">{venueAddress}</p>
            {data.googleMapsUrl && (
              <a
                href={data.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-4 text-sm underline decoration-neutral-600 hover:decoration-white transition-colors"
              >
                View on Google Maps →
              </a>
            )}
          </div>
        </Reveal>

        {data.events?.length > 0 && (
          <div className="mt-10 text-left">
            <Reveal>
              <p className="text-xs uppercase text-neutral-500 mb-4 text-center">Schedule</p>
            </Reveal>
            <div className="space-y-4">
              {data.events.map((e, i) => (
                <Reveal key={e.id} delay={i * 100}>
                  <div className="flex justify-between border-b border-neutral-800 pb-2 group">
                    <span className="transition-transform group-hover:translate-x-1">{e.eventName}</span>
                    <span className="text-neutral-400 text-sm">{e.eventTime}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        )}

        {data.instagramLink && (
          <Reveal>
            <a
              href={data.instagramLink}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-8 text-sm text-neutral-400 underline hover:text-white transition-colors"
            >
              Follow our journey
            </a>
          </Reveal>
        )}

        <Reveal>
          <p className="mt-12 text-neutral-500 text-sm">With Love, {groomName} &amp; {brideName}</p>
        </Reveal>
      </div>
    </div>
  );
}
