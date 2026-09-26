import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/templates/Reveal";
import { designCountLabel } from "@/lib/design-count";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const [featured, stats] = await Promise.all([
    prisma.template.findMany({ where: { status: "ACTIVE" }, take: 3, orderBy: { createdAt: "asc" } }),
    prisma.template.aggregate({ where: { status: "ACTIVE" }, _count: true, _min: { price: true } }),
  ]);
  return { featured, count: stats._count, minPrice: stats._min.price };
}

// Shared deep tone the photo sections fade into, so stacked sections blend without hard lines.
const EDGE = "#140d0e";

/**
 * Full-bleed background photo(s) for a section: one even dark shade over the whole photo,
 * plus soft fades at the top and/or bottom edge into the shared deep tone. Two photos
 * crossfade slowly into each other. All photos are free-licence Pexels images.
 */
function PhotoBackdrop({
  photos,
  shade,
  fadeTop = true,
  fadeBottom = true,
  drift = false,
}: {
  photos: string[];
  shade: string;
  fadeTop?: boolean;
  fadeBottom?: boolean;
  drift?: boolean;
}) {
  return (
    <div className="absolute inset-0" aria-hidden>
      {photos.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          loading={i === 0 && drift ? "eager" : "lazy"}
          className={`absolute inset-0 w-full h-full object-cover object-[50%_55%] ${drift ? "wv-hero-drift" : ""} ${
            photos.length > 1 ? "wv-xfade" : ""
          }`}
          style={photos.length > 1 ? { animationDelay: `${-i * 9}s` } : undefined}
        />
      ))}
      <div className={`absolute inset-0 ${shade}`} />
      {fadeTop && <div className="absolute inset-x-0 top-0 h-24" style={{ background: `linear-gradient(to bottom, ${EDGE}, transparent)` }} />}
      {fadeBottom && <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: `linear-gradient(to top, ${EDGE}, transparent)` }} />}
    </div>
  );
}

const textShadow = "drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]";

export default async function Home() {
  const { featured: templates, count, minPrice } = await getHomeData();

  return (
    <div style={{ backgroundColor: EDGE }}>
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden">
        <PhotoBackdrop photos={["/defaults/home-hero.jpg"]} shade="bg-black/40" fadeTop={false} drift />
        <span className="tpl-float absolute top-16 left-[8%] text-2xl opacity-60" style={{ animationDelay: "0s" }} aria-hidden>
          🌸
        </span>
        <span className="tpl-float absolute top-32 right-[12%] text-3xl opacity-50" style={{ animationDelay: "1.2s" }} aria-hidden>
          💍
        </span>
        <span className="tpl-float absolute bottom-16 left-[18%] text-2xl opacity-50" style={{ animationDelay: "0.6s" }} aria-hidden>
          ✨
        </span>
        <span className="tpl-sparkle absolute top-24 right-[30%] text-rose-200 text-lg" style={{ animationDelay: "0.4s" }} aria-hidden>
          ✦
        </span>

        <div className="max-w-4xl mx-auto px-6 pt-28 pb-32 text-center relative">
          <Reveal>
            <h1 className={`text-4xl md:text-5xl font-semibold tracking-tight text-white ${textShadow}`}>
              Create Your Beautiful Digital Wedding Invitation
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className={`mt-5 text-lg text-white/90 max-w-2xl mx-auto ${textShadow}`}>
              Choose a beautiful template, personalize your wedding details and share your invitation
              with everyone through one simple link.
            </p>
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link
                href="/templates"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-neutral-900 font-medium shadow-sm hover:bg-rose-50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                Explore Templates
              </Link>
              <Link
                href="/#how-it-works"
                className="w-full sm:w-auto px-6 py-3 rounded-full border border-white/70 text-white font-medium backdrop-blur-sm hover:bg-white/15 hover:-translate-y-0.5 active:translate-y-0 transition-all"
              >
                How It Works
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ===== Featured templates ===== */}
      <section className="relative overflow-hidden">
        <PhotoBackdrop photos={["/defaults/featured-rings-silver.jpg", "/defaults/featured-ring-gold.jpg"]} shade="bg-black/55" />
        <div className="relative max-w-6xl mx-auto px-6 py-24">
          <Reveal>
            <div className="flex items-center justify-between mb-8">
              <h2 className={`text-2xl font-semibold text-white ${textShadow}`}>Featured Templates</h2>
              <Link href="/templates" className="text-sm text-rose-200 hover:text-white hover:underline">
                View all
              </Link>
            </div>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t, i) => (
              <Reveal key={t.id} delay={i * 120}>
                <div className="group bg-white rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:-translate-y-1 transition-all duration-300">
                  {t.previewImage && (
                    <div className="overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={t.previewImage}
                        alt={t.name}
                        className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-5">
                    <p className="text-xs uppercase tracking-wide text-neutral-400">{t.category}</p>
                    <h3 className="font-semibold text-lg mt-1">{t.name}</h3>
                    <p className="mt-1 text-neutral-500 text-sm">₹{t.price}</p>
                    <div className="mt-4 flex gap-3">
                      <Link
                        href={`/templates/${t.slug}`}
                        className="flex-1 text-center text-sm px-4 py-2 rounded-full border border-neutral-300 hover:bg-neutral-50 transition-colors"
                      >
                        Preview
                      </Link>
                      <Link
                        href={`/templates/${t.slug}`}
                        className="flex-1 text-center text-sm px-4 py-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 hover:shadow-md transition-all"
                      >
                        Use Template
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How it works ===== */}
      <section id="how-it-works" className="relative overflow-hidden">
        <PhotoBackdrop photos={["/defaults/how-it-works.jpg"]} shade="bg-black/45" />
        <div className="relative max-w-6xl mx-auto px-6 py-28 text-white">
          <Reveal>
            <h2 className={`text-2xl font-semibold text-center mb-12 ${textShadow}`}>How It Works</h2>
          </Reveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { step: "1", title: "Choose a Template", desc: "Browse and preview real, live invitation designs." },
              { step: "2", title: "Login with WhatsApp", desc: "Verify your number once with an OTP, then log in with your PIN." },
              { step: "3", title: "Customize & Preview", desc: "Add your details and see the invitation update instantly." },
              { step: "4", title: "Pay & Share", desc: "Generate your unique link and share it on WhatsApp." },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 100}>
                <div className="group">
                  <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center mx-auto font-semibold shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:shadow-rose-300 group-hover:shadow-lg">
                    {s.step}
                  </div>
                  <h3 className={`mt-4 font-semibold ${textShadow}`}>{s.title}</h3>
                  <p className={`mt-2 text-sm text-white/85 ${textShadow}`}>{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section id="pricing" className="relative overflow-hidden">
        <PhotoBackdrop photos={["/defaults/pricing.jpg"]} shade="bg-black/55" />
        <div className="relative max-w-4xl mx-auto px-6 py-28 text-center text-white">
          <Reveal>
            <h2 className={`text-2xl font-semibold mb-4 ${textShadow}`}>Simple, Transparent Pricing</h2>
            {minPrice !== null && (
              <p className={`text-4xl font-semibold tracking-tight ${textShadow}`}>
                <span className="text-base font-normal text-white/80 align-middle mr-1">from</span>₹{minPrice}
              </p>
            )}
            <p className={`text-white/85 mt-3 mb-8 ${textShadow}`}>
              {designCountLabel(count) && `${designCountLabel(count)} designs to choose from. `}Pay once per invitation — no subscriptions, no hidden fees.
            </p>
            <Link
              href="/templates"
              className="inline-block px-6 py-3 rounded-full bg-white text-neutral-900 font-medium shadow-sm hover:bg-rose-50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Browse Templates
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
