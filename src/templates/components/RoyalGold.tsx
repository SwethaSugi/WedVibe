import { InvitationData } from "@/lib/invitation-types";
import { Countdown } from "../Countdown";
import { Reveal } from "../Reveal";

function Divider() {
  return <div className="tpl-shimmer-line tpl-grow-line h-px w-24 mx-auto" />;
}

function Sparkle({ style }: { style?: React.CSSProperties }) {
  return (
    <span
      className="tpl-sparkle absolute text-[#c9a24b] text-xs select-none"
      style={style}
      aria-hidden
    >
      ✦
    </span>
  );
}

export function RoyalGold({ data }: { data: InvitationData }) {
  const groomName = data.groomName || "Groom Name";
  const brideName = data.brideName || "Bride Name";
  const venueName = data.venueName || "Wedding Venue";
  const venueAddress = data.venueAddress || "";

  return (
    <div className="relative min-h-full bg-[#1a0f00] text-[#f3d9a4] font-serif overflow-hidden">
      <Sparkle style={{ top: "6%", left: "12%", animationDelay: "0s" }} />
      <Sparkle style={{ top: "14%", right: "16%", animationDelay: "0.8s" }} />
      <Sparkle style={{ top: "38%", left: "8%", animationDelay: "1.4s" }} />
      <Sparkle style={{ bottom: "22%", right: "10%", animationDelay: "0.4s" }} />
      <Sparkle style={{ bottom: "10%", left: "18%", animationDelay: "1.8s" }} />

      <div className="max-w-xl mx-auto px-6 py-14 text-center relative">
        <Reveal>
          <p className="tracking-[0.3em] text-xs uppercase opacity-80">Together with their families</p>
        </Reveal>

        <div className="my-8">
          <Divider />
        </div>

        {data.coupleImage ? (
          <Reveal delay={100}>
            <div className="tpl-float inline-block mb-6">
              <img
                src={data.coupleImage}
                alt="Couple"
                className="w-40 h-40 object-cover rounded-full mx-auto border-4 border-[#c9a24b] shadow-[0_0_30px_rgba(201,162,75,0.35)]"
              />
            </div>
          </Reveal>
        ) : (
          (data.groomImage || data.brideImage) && (
            <Reveal delay={100}>
              <div className="flex items-center justify-center gap-6 mb-6">
                {data.groomImage && (
                  <img
                    src={data.groomImage}
                    alt={groomName}
                    className="w-28 h-28 object-cover rounded-full border-4 border-[#c9a24b] shadow-[0_0_20px_rgba(201,162,75,0.3)]"
                  />
                )}
                {data.groomImage && data.brideImage && <span className="text-2xl text-[#c9a24b]">&amp;</span>}
                {data.brideImage && (
                  <img
                    src={data.brideImage}
                    alt={brideName}
                    className="w-28 h-28 object-cover rounded-full border-4 border-[#c9a24b] shadow-[0_0_20px_rgba(201,162,75,0.3)]"
                  />
                )}
              </div>
            </Reveal>
          )
        )}

        <Reveal delay={150}>
          <h1 className="text-4xl leading-tight">
            {groomName}
            <span className="block text-[#c9a24b] text-2xl my-2">&amp;</span>
            {brideName}
          </h1>
        </Reveal>

        {(data.groomFatherName || data.brideFatherName) && (
          <Reveal delay={200}>
            <p className="mt-6 text-sm opacity-80">
              {data.groomFatherName && <>S/o {data.groomFatherName} &amp; {data.groomMotherName}</>}
              {data.groomFatherName && data.brideFatherName && <br />}
              {data.brideFatherName && <>D/o {data.brideFatherName} &amp; {data.brideMotherName}</>}
            </p>
          </Reveal>
        )}

        <div className="my-8">
          <Divider />
        </div>

        <Reveal>
          <p className="text-lg">
            {data.weddingDate
              ? new Date(data.weddingDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
              : "Select Date"}
          </p>
          <p className="opacity-80">{data.weddingTime}</p>
        </Reveal>

        <Reveal delay={100}>
          <Countdown weddingDate={data.weddingDate} className="my-8" />
        </Reveal>

        <div className="my-8">
          <Divider />
        </div>

        <Reveal>
          <p className="italic max-w-sm mx-auto">{data.welcomeMessage}</p>
        </Reveal>

        {data.loveStory && (
          <>
            <div className="my-8">
              <Divider />
            </div>
            <Reveal>
              <h2 className="text-xl tracking-widest uppercase mb-3">Our Story</h2>
              <p className="max-w-sm mx-auto opacity-90 leading-relaxed">{data.loveStory}</p>
            </Reveal>
          </>
        )}

        {data.galleryImages && data.galleryImages.length > 0 && (
          <>
            <div className="my-8">
              <Divider />
            </div>
            <Reveal>
              <h2 className="text-xl tracking-widest uppercase mb-4">Gallery</h2>
              <div className="grid grid-cols-3 gap-2">
                {data.galleryImages.map((src, i) => (
                  <img
                    key={i}
                    src={src}
                    alt=""
                    className="w-full h-24 object-cover rounded-lg border border-[#c9a24b]/40 transition-transform duration-300 hover:scale-105"
                  />
                ))}
              </div>
            </Reveal>
          </>
        )}

        <div className="my-8">
          <Divider />
        </div>

        <Reveal>
          <h2 className="text-xl tracking-widest uppercase mb-2">Venue</h2>
          <p>{venueName}</p>
          <p className="opacity-80">{venueAddress}</p>
          {data.googleMapsUrl && (
            <a
              href={data.googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-3 text-sm underline text-[#c9a24b] transition-transform hover:scale-105"
            >
              View Location
            </a>
          )}
        </Reveal>

        {data.events?.length > 0 && (
          <>
            <div className="my-8">
              <Divider />
            </div>
            <Reveal>
              <h2 className="text-xl tracking-widest uppercase mb-4">Events</h2>
            </Reveal>
            <div className="space-y-3">
              {data.events.map((e, i) => (
                <Reveal key={e.id} delay={i * 100}>
                  <p className="font-semibold">{e.eventName}</p>
                  <p className="text-sm opacity-80">
                    {e.eventDate ? new Date(e.eventDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + " · " : ""}
                    {e.eventTime}
                    {e.venue ? ` · ${e.venue}` : ""}
                  </p>
                </Reveal>
              ))}
            </div>
          </>
        )}

        {data.quote && (
          <Reveal>
            <p className="mt-8 italic opacity-80">&ldquo;{data.quote}&rdquo;</p>
          </Reveal>
        )}

        <div className="my-8">
          <Divider />
        </div>
        <Reveal>
          <p className="text-sm">With Love,</p>
          <p className="text-lg">{groomName} &amp; {brideName}</p>
        </Reveal>
      </div>
    </div>
  );
}
