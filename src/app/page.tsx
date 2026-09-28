import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Reveal } from "@/templates/Reveal";
import { designCountLabel } from "@/lib/design-count";
import { effectivePrice, priceInfo } from "@/lib/pricing";
import { PriceTag } from "@/components/PriceTag";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const [featured, stats] = await Promise.all([
    // The 10 templates customers use most (by invitations created), newest first on ties.
    prisma.template.findMany({
      where: { status: "ACTIVE" },
      take: 10,
      orderBy: [{ invitations: { _count: "desc" } }, { createdAt: "desc" }],
    }),
    prisma.template.findMany({ where: { status: "ACTIVE" }, select: { price: true, offerPrice: true } }),
  ]);
  // "From ₹…" uses what customers actually pay, so an active offer lowers it.
  const prices = stats.map(effectivePrice);
  return { featured, count: stats.length, minPrice: prices.length ? Math.min(...prices) : null };
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

type FeaturedTemplate = { id: string; slug: string; name: string; category: string; price: number; offerPrice: number | null; previewImage: string | null };

// One card in the moving featured row. Uses a right margin (not flex gap) so the
// duplicated track is exactly twice as wide and the loop has no jump. The duplicate
// copy is hidden from keyboard and screen readers.
function FeaturedCard({ t, hidden }: { t: FeaturedTemplate; hidden: boolean }) {
  const tab = hidden ? -1 : undefined;
  const { percentOff } = priceInfo(t);
  return (
    <div className="group w-[280px] sm:w-[300px] shrink-0 mr-6 bg-white rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.35)] hover:-translate-y-1.5 hover:shadow-[0_28px_60px_rgba(0,0,0,0.45)] transition-all duration-300">
      {t.previewImage && (
        <Link href={`/templates/${t.slug}`} tabIndex={tab} className="relative block overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={t.previewImage}
            alt={hidden ? "" : t.name}
            loading="lazy"
            className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {percentOff > 0 && (
            <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-[11px] font-bold tracking-wide shadow-md">
              {percentOff}% OFF
            </span>
          )}
        </Link>
      )}
      <div className="p-5">
        <p className="text-xs uppercase tracking-wide text-neutral-400">{t.category}</p>
        <h3 className="font-semibold text-lg mt-1 truncate">{t.name}</h3>
        <PriceTag template={t} priceClassName="text-neutral-800" className="mt-1" />
        <div className="mt-4 flex gap-2.5">
          <Link
            href={`/templates/${t.slug}`}
            tabIndex={tab}
            className="flex-1 text-center text-sm whitespace-nowrap px-3 py-2.5 rounded-full border border-neutral-300 hover:bg-neutral-50 transition-colors"
          >
            Preview
          </Link>
          <Link
            href={`/templates/${t.slug}`}
            tabIndex={tab}
            className="flex-1 text-center text-sm font-medium whitespace-nowrap px-3 py-2.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 hover:shadow-md transition-all"
          >
            Use Template
          </Link>
        </div>
      </div>
    </div>
  );
}

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
        <div className="relative py-24">
          <Reveal>
            <div className="max-w-6xl mx-auto px-6 flex items-end justify-between gap-4 mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-rose-200">Most loved by couples</p>
                <h2 className={`mt-1 text-2xl font-semibold text-white ${textShadow}`}>Featured Templates</h2>
              </div>
              <Link href="/templates" className="shrink-0 text-sm text-rose-200 hover:text-white hover:underline">
                View all
              </Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="wv-marquee overflow-hidden">
              <div
                className="wv-marquee-track flex w-max py-4"
                style={{ "--wv-marquee-duration": `${templates.length * 6}s` } as React.CSSProperties}
              >
                {[0, 1].map((copy) => (
                  <div key={copy} className={`flex ${copy ? "wv-marquee-dup" : ""}`} aria-hidden={copy ? true : undefined}>
                    {templates.map((t) => (
                      <FeaturedCard key={t.id} t={t} hidden={copy === 1} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
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
