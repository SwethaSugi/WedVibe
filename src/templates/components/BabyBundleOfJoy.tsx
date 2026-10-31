"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { InvitationData } from "@/lib/invitation-types";
import { Reveal } from "../Reveal";
import { useLiveCountdown, splitDuration } from "../useLiveCountdown";
import { parseDate, weddingMoment, pad, weekdayName, monthName, googleCalendarUrl, mapsSearchUrl } from "../invite-utils";

// Field mapping for this Baby & Family design (the editor relabels these fields for it):
//   groomName → the baby's name, brideName → the parents' names,
//   groom's father/mother → paternal grandparents, bride's father/mother → maternal grandparents,
//   coupleImage → a photo of the baby, loveStory → the family's message.

const A = "/templates/baby-bundle-of-joy";

const DEFAULT_GALLERY = [
  { src: `${A}/baby-gallery-1.svg`, caption: "Sweet Dreams" },
  { src: `${A}/baby-gallery-2.svg`, caption: "Little Explorer" },
  { src: `${A}/baby-gallery-3.svg`, caption: "Tiny Toes" },
  { src: `${A}/baby-gallery-4.svg`, caption: "Hello, World!" },
];

const BALLOONS = [
  { name: "pink", light: "#FFD3E1", base: "#FFB3CB", deep: "#F07FA2" },
  { name: "blue", light: "#D8EEFF", base: "#A9D8FA", deep: "#6EB6EA" },
  { name: "yellow", light: "#FFF1C4", base: "#FFE08A", deep: "#F5BE45" },
  { name: "mint", light: "#DDF7EC", base: "#ABE6CD", deep: "#62C79F" },
];
const PASTELS = ["#FFC4D6", "#BFE3FF", "#FFE7A3", "#C8F0DF", "#DCCBFF", "#FFD7BF"];
const PASTEL_SOFT = ["#FFEAF1", "#E8F5FF", "#FFF6DA", "#E6F9F1", "#F1EAFF", "#FFEFE5"];
const CONFETTI_COLORS = ["#FFB3CB", "#A9D8FA", "#FFE08A", "#ABE6CD", "#C8B4FF", "#FFD7BF", "#ffffff"];

const HOURS_4 = 4 * 3600 * 1000;

// Seeded so the stars and confetti sit in the same place on the server and in the browser.
function seeded(seed: number) {
  return () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
}
const rnd = seeded(7);
// Items from `low` onwards are hidden on low-end phones (the root gets .bj-low after mount).
const STARS = Array.from({ length: 16 }, (_, i) => ({
  left: rnd() * 96,
  top: rnd() * 70,
  size: 9 + rnd() * 12,
  delay: -rnd() * 3,
  dur: 2.4 + rnd() * 2.4,
  color: ["gold", "pink", "lavender", "blue"][i % 4],
  low: i >= 9,
}));
const CONFETTI = Array.from({ length: 22 }, (_, i) => ({
  left: (i % 2 ? 86 : 0) + rnd() * 14,
  color: PASTELS[i % PASTELS.length],
  dur: 7 + rnd() * 7,
  delay: -rnd() * 10,
  fall: 900 + rnd() * 400,
  w: 6 + rnd() * 6,
  h: 10 + rnd() * 8,
  radius: i % 3 ? 3 : 50,
  low: i >= 10,
}));
const RISING = ["pink", "blue", "yellow", "mint", "lavender", "pink", "blue"].map((c, i) => ({
  src: `${A}/pastel-balloon-${c}.svg`,
  left: [3, 86, 12, 74, 20, 92, 64][i],
  delay: -i * 2.1,
  dur: 12 + (i % 3) * 2.5,
  width: 40 + (i % 3) * 10,
}));

const ICONS: Record<string, string> = {
  blessing: '<path d="M12 3c2.5 3 3.5 5.4 3.5 7.4A3.5 3.5 0 0112 14a3.5 3.5 0 01-3.5-3.6C8.5 8.4 9.5 6 12 3z"/><path d="M5 21h14M7 21c0-3 2-5 5-5s5 2 5 5"/>',
  party: '<path d="M4 20l5-14 9 9-14 5z"/><path d="M14 4l1-1M19 9l1-1M17 3l.5 2M21 7l-2 .5M13 9c1.5-1.5 3-2 4-1"/>',
  lunch: '<path d="M5 3v7a2 2 0 002 2v9M9 3v7a2 2 0 01-2 2M7 3v6"/><path d="M17 21V3c-2 1.5-3 4-3 7v3h3"/>',
  cake: '<path d="M4 21h16M5 21v-7a2 2 0 012-2h10a2 2 0 012 2v7"/><path d="M5 16c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 5 0M12 12V8M12 5.5c.8-.8.8-1.7 0-2.5-.8.8-.8 1.7 0 2.5z"/>',
  music: '<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',
  gift: '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-2-4-6-4-6-1.5S12 8 12 8zm0 0c2-4 6-4 6-1.5S12 8 12 8z"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
};

// Picks a timeline icon from the event's name.
function eventIcon(name: string) {
  if (/bless|pooja|puja|naming|namakaran|cradle|thottil|prayer|havan|homam|ceremony/i.test(name)) return "blessing";
  if (/lunch|dinner|breakfast|feast|food|meal|tea|snack/i.test(name)) return "lunch";
  if (/cake|birthday/i.test(name)) return "cake";
  if (/music|dance|sangeet|song/i.test(name)) return "music";
  if (/gift/i.test(name)) return "gift";
  if (/photo|picture|camera/i.test(name)) return "camera";
  return "party";
}

function Icon({ name }: { name: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      dangerouslySetInnerHTML={{ __html: ICONS[name] ?? ICONS.party }}
    />
  );
}

function Star({ color, className = "", style }: { color: string; className?: string; style?: CSSProperties }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`${A}/star-${color}.svg`} alt="" className={`bj-deco bj-star ${className}`} style={style} />;
}

const PinSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

const Butterfly = ({ color, className }: { color: "pink" | "blue"; className: string }) => (
  <span className={className}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={`${A}/butterfly-${color}.svg`} alt="" />
  </span>
);

const prefersReducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Low-end phones get half the confetti and fewer stars and hearts.
const isLowEnd = () => {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 3;
};

type Particle = { x: number; y: number; vx: number; vy: number; g: number; size: number; rot: number; vr: number; color: string; shape: string; life: number };

// Confetti burst on a canvas laid over the opening screen.
function useConfetti(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const parts = useRef<Particle[]>([]);
  const running = useRef(false);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  return (x: number, y: number, accent: string, count = 70) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || prefersReducedMotion()) return;
    if (isLowEnd()) count = Math.round(count * 0.5);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 3 + Math.random() * 7;
      parts.current.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3, g: 0.16 + Math.random() * 0.08,
        size: 5 + Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
        color: i % 4 === 0 ? accent : CONFETTI_COLORS[(Math.random() * CONFETTI_COLORS.length) | 0],
        shape: Math.random() < 0.35 ? "circle" : Math.random() < 0.5 ? "heart" : "rect", life: 1,
      });
    }
    const heart = (s: number) => {
      ctx.beginPath();
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s, -s * 0.4, -s * 0.4, -s, 0, -s * 0.45);
      ctx.bezierCurveTo(s * 0.4, -s, s, -s * 0.4, 0, s * 0.3);
      ctx.fill();
    };
    const tick = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      parts.current = parts.current.filter((p) => p.life > 0 && p.y < h + 40);
      for (const p of parts.current) {
        p.vx *= 0.985; p.vy = p.vy * 0.985 + p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life -= 0.006;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life * 1.5));
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.shape === "circle") { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
        else if (p.shape === "heart") heart(p.size * 0.8);
        else ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (parts.current.length) frame.current = requestAnimationFrame(tick);
      else running.current = false;
    };
    if (!running.current) {
      running.current = true;
      frame.current = requestAnimationFrame(tick);
    }
  };
}

/** Full-screen photo viewer: arrows, swipe, Escape, focus kept inside. */
function Lightbox({
  photos,
  index,
  onIndex,
  onClose,
}: {
  photos: { src: string; caption: string }[];
  index: number;
  onIndex: (i: number, dir: number) => void;
  onClose: () => void;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [dir, setDir] = useState(0);
  const touch = useRef({ x: 0, y: 0 });
  const single = photos.length < 2;
  const go = (d: number) => {
    setDir(d);
    onIndex((index + d + photos.length) % photos.length, d);
  };

  useEffect(() => {
    closeRef.current?.focus();
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && !single) go(-1);
      else if (e.key === "ArrowRight" && !single) go(1);
      else if (e.key === "Tab") {
        const f = [...(boxRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])];
        const i = f.indexOf(document.activeElement as HTMLButtonElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1]?.focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0]?.focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  const photo = photos[index];
  return (
    <div
      ref={boxRef}
      className="bj-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button ref={closeRef} type="button" className="bj-lb-btn bj-lb-close" aria-label="Close photo viewer" onClick={onClose}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      {!single && (
        <button type="button" className="bj-lb-btn bj-lb-prev" aria-label="Previous photo" onClick={() => go(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
      )}
      <figure
        className="bj-lb-figure"
        onTouchStart={(e) => (touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY })}
        onTouchEnd={(e) => {
          const dx = e.changedTouches[0].clientX - touch.current.x;
          const dy = e.changedTouches[0].clientY - touch.current.y;
          if (!single && Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img key={index} src={photo.src} alt={photo.caption} className={dir > 0 ? "bj-slide-next" : dir < 0 ? "bj-slide-prev" : ""} />
        <figcaption>
          <b>{photo.caption}</b>
          <span>
            {index + 1} / {photos.length}
          </span>
        </figcaption>
      </figure>
      {!single && (
        <button type="button" className="bj-lb-btn bj-lb-next" aria-label="Next photo" onClick={() => go(1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      )}
    </div>
  );
}

/**
 * BabyBundleOfJoy — Baby & Family.
 * A pastel nursery sky with a cartoon baby in a cloud cradle: pop a balloon to open the
 * invitation card, then the date with a live countdown, Add to Calendar and directions, the
 * family, a celebration timeline, a photo gallery with a lightbox, a family message and a
 * closing scene with rising balloons.
 */
export function BabyBundleOfJoy({ data }: { data: InvitationData }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const inviteRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const burst = useConfetti(canvasRef);

  const [popped, setPopped] = useState<number[]>([]);
  const [opened, setOpened] = useState(false);
  const revealing = useRef(false);

  // Low-end phones: fewer stars, hearts and confetti pieces (a class, so server and client markup match).
  useEffect(() => {
    if (isLowEnd()) rootRef.current?.classList.add("bj-low");
  }, []);

  // Sections out of view pause their animations, so only what is on screen costs anything.
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) e.target.classList.toggle("bj-offscreen", !e.isIntersecting);
      },
      { rootMargin: "120px 0px" }
    );
    inner.querySelectorAll(":scope > section").forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [opened]);
  const [round, setRound] = useState(0); // remounts the balloons on Replay
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [broken, setBroken] = useState<number[]>([]);
  const lbOpener = useRef<HTMLElement | null>(null);

  const baby = data.groomName?.trim() || "Baby Name";
  const parents = data.brideName?.trim() || "";
  const paternal = [data.groomFatherName?.trim(), data.groomMotherName?.trim()].filter(Boolean).join(" & ");
  const maternal = [data.brideFatherName?.trim(), data.brideMotherName?.trim()].filter(Boolean).join(" & ");
  const grandparents = [paternal, maternal].filter(Boolean).join(" · ");
  const events = (data.events ?? []).filter((e) => e.eventName?.trim());
  const functionTitle = events[0]?.eventName.trim() || "Baby Welcome Ceremony";
  const inviteLine = "Join us as we celebrate the arrival of our little bundle of joy.";
  const familyMessage =
    data.loveStory?.trim() ||
    data.welcomeMessage?.trim() ||
    "Our little one has filled our world with happiness. We would love for you to join our family as we celebrate this precious new chapter.";

  const date = parseDate(data.weddingDate);
  const time = data.weddingTime?.trim() || "";
  const target = weddingMoment(data.weddingDate, data.weddingTime);
  const left = useLiveCountdown(target);
  const dateLong = date ? `${weekdayName(date)}, ${date.getDate()} ${monthName(date)} ${date.getFullYear()}` : "Date to be announced";

  const venueName = data.venueName?.trim() || "";
  const venueAddress = data.venueAddress?.trim() || "";
  const venueLine = [venueName, venueAddress].filter(Boolean).join(", ");
  const mapsUrl = data.googleMapsUrl?.trim() || (venueLine ? mapsSearchUrl(venueLine) : null);
  const calendarUrl = googleCalendarUrl(`${functionTitle} — ${baby}`, date, time, venueLine, inviteLine);

  const own = (data.galleryImages ?? []).filter(Boolean);
  const photos = own.length
    ? own.map((src, i) => ({ src: broken.includes(i) ? DEFAULT_GALLERY[i % DEFAULT_GALLERY.length].src : src, caption: `Moment ${i + 1}` }))
    : DEFAULT_GALLERY;

  const familyRows = [
    ["Little one", baby],
    ["Parents", parents],
    ["Grandparents", grandparents],
  ].filter(([, v]) => v);

  // Every balloon pops on its own; the first pop opens the invitation, the rest stay poppable.
  function pop(i: number, el: HTMLButtonElement) {
    if (popped.includes(i)) return;
    setPopped((p) => [...p, i]);
    const intro = introRef.current?.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (intro) burst(r.left - intro.left + r.width / 2, r.top - intro.top + r.height * 0.45, BALLOONS[i].base);
    if (opened || revealing.current) return;
    revealing.current = true;
    const reduced = prefersReducedMotion();
    setTimeout(() => {
      revealing.current = false;
      setOpened(true);
      setTimeout(() => {
        inviteRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        inviteRef.current?.focus({ preventScroll: true });
      }, reduced ? 0 : 350);
    }, reduced ? 60 : 650);
  }

  function replay() {
    setOpened(false);
    setPopped([]);
    setRound((r) => r + 1);
    requestAnimationFrame(() => rootRef.current?.scrollIntoView({ behavior: "auto", block: "start" }));
  }

  // Gentle mouse parallax on the opening screen (desktop pointers only).
  function parallax(e: ReactPointerEvent<HTMLElement>) {
    if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--px", String((e.clientX - r.left) / r.width - 0.5));
    e.currentTarget.style.setProperty("--py", String((e.clientY - r.top) / r.height - 0.5));
  }

  const countdown = (() => {
    if (!target) return null;
    if (left === null || left > 0) {
      const parts = left === null ? null : splitDuration(left);
      return (
        <div className="bj-countdown" role="timer" aria-label="Time left until the celebration">
          {(["days", "hours", "minutes", "seconds"] as const).map((unit) => {
            const v = parts ? pad(parts[unit]) : "--";
            return (
              <div key={unit} className="bj-cd-tile">
                <span key={v} className="bj-cd-num">{v}</span>
                <span className="bj-cd-label">{unit === "minutes" ? "Mins" : unit === "seconds" ? "Secs" : unit}</span>
              </div>
            );
          })}
        </div>
      );
    }
    return (
      <p className="bj-countdown-done">
        {left > -HOURS_4 ? "🎉 The celebration is happening right now — come join us!" : `💛 Thank you for celebrating ${baby} with us!`}
      </p>
    );
  })();

  return (
    <div ref={rootRef} className={`bj relative w-full ${opened ? "" : "max-h-[640px] overflow-hidden"}`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Fredoka:wght@400;500;600;700&family=Nunito:wght@400;600;700;800&display=swap');
        .bj {
          --c-pink: #FFC4D6; --c-pink-deep: #FF8FB0; --c-blue: #BFE3FF; --c-mint: #C8F0DF; --c-lavender: #DCCBFF;
          --c-lavender-deep: #A98BEA; --c-yellow-deep: #FFC94D; --c-ink: #463650; --c-ink-soft: #6E5C78;
          --c-accent: #E8638C; --c-accent-2: #8B6FE0;
          --font-display: "Fredoka", "Nunito", ui-rounded, system-ui, sans-serif;
          --font-script: "Dancing Script", "Segoe Script", cursive;
          --font-body: "Nunito", ui-rounded, system-ui, -apple-system, "Segoe UI", sans-serif;
          --shadow-soft: 0 18px 40px rgba(120, 90, 160, 0.16), 0 4px 12px rgba(120, 90, 160, 0.08);
          --shadow-lift: 0 26px 60px rgba(120, 90, 160, 0.24), 0 6px 16px rgba(120, 90, 160, 0.12);
          --ease-out: cubic-bezier(.2, .8, .2, 1);
          --ease-bounce: cubic-bezier(.34, 1.56, .64, 1);
          font-family: var(--font-body); color: var(--c-ink); background: #FFF8EF; line-height: 1.55;
          overflow-x: clip; -webkit-font-smoothing: antialiased;
        }
        /* Sizes follow the invitation's own width (container units), so the editor preview matches a phone. */
        .bj-inner { container-type: inline-size; container-name: bj; }
        .bj img { max-width: 100%; display: block; }
        .bj button { font: inherit; color: inherit; }
        .bj :focus-visible { outline: 3px solid var(--c-accent-2); outline-offset: 3px; border-radius: 10px; }

        .bj-section { position: relative; padding: 4.5rem 16px; overflow: hidden; }
        .bj-container { width: 100%; max-width: 980px; margin: 0 auto; position: relative; z-index: 2; }
        .bj-eyebrow { font-family: var(--font-display); font-weight: 600; font-size: .78rem; letter-spacing: .26em; text-transform: uppercase; color: var(--c-accent); text-align: center; margin: 0; }
        .bj-title { font-family: var(--font-display); font-weight: 600; font-size: clamp(1.9rem, 8.4cqi, 3.2rem); line-height: 1.1; text-align: center; margin: .5rem 0 2rem; }
        .bj-sparkle { background: linear-gradient(90deg, var(--c-accent), var(--c-accent-2)); -webkit-background-clip: text; background-clip: text; color: transparent; }

        .bj-btn { display: inline-flex; align-items: center; justify-content: center; gap: .55em; width: 100%; min-height: 48px; padding: .75em 1.4em; border-radius: 999px; border: 0; cursor: pointer;
          font-family: var(--font-display); font-weight: 600; font-size: 1.05rem; text-decoration: none; color: #fff;
          transition: transform 180ms var(--ease-out); -webkit-tap-highlight-color: transparent; }
        .bj-btn svg { width: 1.2em; height: 1.2em; flex: none; }
        .bj-btn:hover { transform: translateY(-2px); }
        .bj-btn:active { transform: scale(.97); }
        .bj-btn-primary { background: linear-gradient(135deg, #F583A7, var(--c-accent)); box-shadow: 0 12px 26px rgba(232, 99, 140, .35); }
        .bj-btn-secondary { background: linear-gradient(135deg, #A992F2, var(--c-accent-2)); box-shadow: 0 12px 26px rgba(139, 111, 224, .32); }
        .bj-btn-ghost { background: #fff; color: var(--c-ink) !important; box-shadow: inset 0 0 0 2px rgba(139, 111, 224, .25), 0 8px 18px rgba(120, 90, 160, .12); }

        @keyframes bj-float-y { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes bj-float-tilt { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-12px) rotate(3deg); } }
        @keyframes bj-twinkle { 0%, 100% { opacity: .25; transform: scale(.7) rotate(0deg); } 50% { opacity: 1; transform: scale(1.1) rotate(25deg); } }
        @keyframes bj-drift-x { from { transform: translateX(-30cqi); } to { transform: translateX(130cqi); } }
        @keyframes bj-rise-in { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        .bj-floaty { animation: bj-float-y 6s ease-in-out infinite; }
        .bj-deco { position: absolute; pointer-events: none; z-index: 1; }
        .bj-star { width: 18px; height: 18px; animation: bj-twinkle 3.2s ease-in-out infinite; }

        /* ---------- 1. Opening ---------- */
        .bj-intro { position: relative; height: 640px; overflow: hidden; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 48px 16px 22px;
          background: radial-gradient(60% 40% at 50% 0%, rgba(255,255,255,.95), transparent 70%), radial-gradient(70% 50% at 100% 60%, rgba(220,203,255,.55), transparent 70%),
            radial-gradient(70% 50% at 0% 75%, rgba(191,227,255,.55), transparent 70%), linear-gradient(180deg, #FFF6EE 0%, #FFE6EE 45%, #EFE6FF 100%); }
        .bj-layer { position: absolute; inset: 0; pointer-events: none; }
        .bj-depth { transform: translate3d(calc(var(--px, 0) * var(--d) * 28px), calc(var(--py, 0) * var(--d) * 18px), 0); transition: transform .3s ease-out; }
        .bj-cloud { position: absolute; opacity: .95; }
        .bj-c1 { width: min(46cqi, 260px); top: 9%; left: -8%; animation: bj-float-y 9s ease-in-out infinite; }
        .bj-c2 { width: min(38cqi, 220px); top: 22%; right: -10%; animation: bj-float-y 11s ease-in-out infinite -3s; }
        .bj-c3 { width: min(58cqi, 340px); bottom: -2%; left: -14%; opacity: .95; animation: bj-float-y 12s ease-in-out infinite -5s; }
        .bj-c4 { width: min(54cqi, 320px); bottom: -4%; right: -16%; opacity: .95; animation: bj-float-y 10s ease-in-out infinite -2s; }
        .bj-drift { width: 120px; top: 4%; left: 0; opacity: .7; animation: bj-drift-x 48s linear infinite; }
        .bj-butterfly { position: absolute; width: 40px; top: 30%; left: 0; animation: bj-butterfly 26s linear infinite; }
        .bj-butterfly.bj-b2 { top: 58%; width: 32px; animation-duration: 33s; animation-delay: -14s; }
        .bj .bj-butterfly img { width: 100%; height: auto; animation: bj-flap .3s ease-in-out infinite alternate; }
        @keyframes bj-flap { from { transform: scaleX(1); } to { transform: scaleX(.45); } }
        @keyframes bj-butterfly { 0% { transform: translate(-12cqi, 0) rotate(8deg); } 25% { transform: translate(25cqi, -45px) rotate(-6deg); } 50% { transform: translate(58cqi, 20px) rotate(10deg); } 75% { transform: translate(86cqi, -32px) rotate(-4deg); } 100% { transform: translate(114cqi, 12px) rotate(6deg); } }

        .bj-intro-text { position: relative; z-index: 5; max-width: 620px; }
        /* Soft cream glow behind the opening text keeps it readable over clouds and stars. */
        .bj-intro-text::before { content: ""; position: absolute; inset: -22px -34px -14px; z-index: -1; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,249,245,.92), rgba(255,249,245,.6) 60%, rgba(255,249,245,0)); }
        .bj-kicker { display: inline-flex; align-items: center; gap: .5em; margin: 0; padding: .45em 1.1em; border-radius: 999px; background: rgba(255,255,255,.75); box-shadow: 0 6px 16px rgba(232,99,140,.14);
          font-family: var(--font-display); font-weight: 600; font-size: .72rem; letter-spacing: .16em; text-transform: uppercase; color: var(--c-accent); animation: bj-rise-in .9s var(--ease-out) both .1s; }
        .bj-intro h1 { font-family: var(--font-display); font-weight: 700; font-size: clamp(1.9rem, 8.4cqi, 3.2rem); line-height: 1.04; margin: .75rem 0 .5rem;
          background: linear-gradient(100deg, #E8638C 0%, #B36BD8 55%, #6F8FE8 100%); -webkit-background-clip: text; background-clip: text; color: transparent;
          filter: drop-shadow(0 3px 0 rgba(255,255,255,.9)); animation: bj-rise-in .9s var(--ease-out) both .25s; }
        .bj-subtitle { margin: 0 auto; max-width: 30ch; font-size: clamp(.92rem, 3.8cqi, 1.15rem); color: var(--c-ink-soft); font-weight: 600; animation: bj-rise-in .9s var(--ease-out) both .4s; }
        .bj-who { margin: .75rem 0 0; font-family: var(--font-display); font-weight: 500; font-size: .92rem; color: var(--c-ink-soft); animation: bj-rise-in .9s var(--ease-out) both .55s; }
        .bj-who strong { font-family: var(--font-script); font-size: 1.7em; font-weight: 700; color: var(--c-accent); display: block; line-height: 1.15; overflow-wrap: break-word; }

        .bj-stage { position: relative; z-index: 4; flex: 1; width: 100%; max-width: 900px; display: grid; place-items: center; min-height: 220px; margin-top: .5rem; }
        .bj-hero-wrap { position: relative; animation: bj-pop-in 1s var(--ease-bounce) both .5s; }
        .bj-hero { width: min(60cqi, 300px); animation: bj-float-y 6s ease-in-out infinite; }
        @keyframes bj-pop-in { from { opacity: 0; transform: scale(.8) translateY(20px); } to { opacity: 1; transform: none; } }

        /* The button is the balloon itself (its rounded shape is the tap area, so a string never
           blocks a neighbour). The string hangs below and falls away on its own when popped. */
        .bj-balloon { --bw: clamp(66px, 19cqi, 112px); position: absolute; width: var(--bw); height: calc(var(--bw) * 1.25); padding: 0; border: 0; background: none; cursor: pointer; z-index: 6;
          border-radius: 50% 50% 48% 48% / 56% 56% 44% 44%; -webkit-tap-highlight-color: transparent; touch-action: manipulation;
          animation: bj-balloon-float var(--fd, 6s) ease-in-out infinite var(--fdelay, 0s), bj-balloon-in 1s var(--ease-bounce) both var(--in, .6s); }
        .bj .bj-b-body { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; transform-origin: 50% 60%; transition: transform 180ms var(--ease-bounce); }
        .bj-b-string { position: absolute; left: 50%; top: 94%; width: 34%; height: 72%; margin-left: -17%; pointer-events: none; overflow: visible; transform-origin: 50% 0; animation: bj-sway 3s ease-in-out infinite alternate; }
        .bj-b-burst { position: absolute; left: 50%; top: 45%; width: 120%; aspect-ratio: 1; margin-left: -60%; translate: 0 -50%; border-radius: 50%; pointer-events: none; opacity: 0; border: 4px dotted var(--burst); }
        .bj-balloon:hover .bj-b-body, .bj-balloon:focus-visible .bj-b-body { transform: scale(1.09); }
        .bj-balloon.bj-press .bj-b-body { animation: bj-squish .32s var(--ease-bounce); }
        .bj-bl1 { left: 1%; top: 2%; --fd: 6.4s; --in: .7s; }
        .bj-bl2 { right: 1%; top: 6%; --fd: 7.6s; --fdelay: -2s; --in: .85s; }
        .bj-bl3 { left: 1%; top: 50%; --fd: 5.8s; --fdelay: -1s; --in: 1s; }
        .bj-bl4 { right: 1%; top: 46%; --fd: 7s; --fdelay: -3s; --in: 1.15s; }
        @container bj (min-width: 900px) { .bj-bl1 { left: 6%; } .bj-bl2 { right: 6%; } .bj-bl3 { left: 13%; } .bj-bl4 { right: 12%; } }
        @keyframes bj-balloon-float { 0%, 100% { transform: translateY(0) rotate(-3deg); } 50% { transform: translateY(-14px) rotate(3deg); } }
        @keyframes bj-balloon-in { from { opacity: 0; translate: 0 60px; } to { opacity: 1; translate: 0 0; } }
        @keyframes bj-sway { from { transform: rotate(-6deg); } to { transform: rotate(6deg); } }
        @keyframes bj-squish { 0% { transform: scale(1); } 40% { transform: scale(1.14, .9); } 100% { transform: scale(1.09); } }
        /* Pop: stretch, burst ring, string drops; confetti comes from the canvas */
        .bj-balloon.bj-popping { animation-play-state: paused; pointer-events: none; }
        .bj-balloon.bj-popping .bj-b-body { animation: bj-pop .34s ease-in forwards; }
        .bj-balloon.bj-popping .bj-b-string { animation: bj-string-fall .9s ease-in forwards; }
        .bj-balloon.bj-popping .bj-b-burst { animation: bj-burst .45s ease-out forwards; }
        @keyframes bj-pop { 0% { transform: scale(1.09); opacity: 1; } 45% { transform: scale(1.32, 1.22); opacity: 1; } 100% { transform: scale(.15); opacity: 0; } }
        @keyframes bj-string-fall { to { transform: translateY(140px) rotate(28deg); opacity: 0; } }
        @keyframes bj-burst { 0% { opacity: .95; transform: scale(.35); } 100% { opacity: 0; transform: scale(1.25); } }
        .bj-canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 8; }

        .bj-tap-hint { position: relative; z-index: 7; margin: .75rem 0 0; padding: .7em 1.3em; border-radius: 999px; background: rgba(255,255,255,.85); box-shadow: var(--shadow-soft);
          font-family: var(--font-display); font-weight: 600; font-size: clamp(.9rem, 3.8cqi, 1.05rem); color: var(--c-ink);
          animation: bj-hint-bob 2.2s ease-in-out infinite, bj-rise-in .9s var(--ease-out) both 1.2s; }
        .bj-tap-hint.bj-hidden { visibility: hidden; }
        @keyframes bj-hint-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }

        /* ---------- 2. Invitation card ---------- */
        .bj-reveal { background: linear-gradient(180deg, #EFE6FF 0%, #FFF3EA 55%, #FFF8EF 100%); padding-top: 136px; }
        .bj-reveal:focus { outline: none; }
        .bj-card-invite { position: relative; max-width: 560px; margin: 0 auto; text-align: center; padding: 2rem 1.5rem 3rem; border-radius: 36px;
          background: rgba(255,255,255,.9); border: 2px solid #fff; box-shadow: var(--shadow-lift);
          animation: bj-card-in 1s var(--ease-bounce) both; }
        .bj-card-invite::before { content: ""; position: absolute; inset: 10px; border-radius: 28px; border: 1.5px dashed rgba(169,139,234,.45); pointer-events: none; }
        @keyframes bj-card-in { from { opacity: 0; transform: translateY(40px) scale(.92); } to { opacity: 1; transform: none; } }
        .bj-peek { width: min(64%, 230px); margin: -4.2rem auto .5rem; }
        .bj-baby-photo { width: 150px; height: 150px; margin: -5.5rem auto .75rem; border-radius: 50%; object-fit: cover; border: 6px solid #fff; box-shadow: 0 0 0 4px var(--c-pink), var(--shadow-soft); }
        .bj-card-invite h2 { font-family: var(--font-display); font-weight: 700; font-size: clamp(1.8rem, 7.5cqi, 2.6rem); margin: 0; color: var(--c-accent-2); }
        .bj-lead { margin: .75rem auto 0; max-width: 32ch; font-size: 1.05rem; color: var(--c-ink-soft); font-weight: 600; }
        .bj-quote { margin: .75rem auto 0; max-width: 32ch; font-style: italic; color: var(--c-ink-soft); }
        .bj-baby-name { margin: 1rem 0 0; line-height: 1; }
        .bj-baby-name .bj-pre { display: block; font-family: var(--font-display); font-weight: 600; font-size: .85rem; letter-spacing: .3em; text-transform: uppercase; color: var(--c-ink-soft); }
        .bj-baby-name .bj-name { display: block; font-family: var(--font-script); font-weight: 700; font-size: clamp(2.8rem, 14cqi, 5.6rem); line-height: 1.15; padding: 0 .1em; overflow-wrap: break-word;
          background: linear-gradient(100deg, #F07AA0, #B36BD8 60%, #6F8FE8); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .bj-divider { display: flex; align-items: center; justify-content: center; gap: .75rem; margin: 1rem auto; color: var(--c-yellow-deep); }
        .bj-divider::before, .bj-divider::after { content: ""; height: 2px; width: 70px; border-radius: 2px; background: linear-gradient(90deg, transparent, var(--c-lavender-deep)); }
        .bj-divider::after { transform: scaleX(-1); }
        .bj .bj-divider img { width: 22px; height: 22px; }
        .bj-with-love { margin: 0; font-family: var(--font-display); color: var(--c-ink-soft); font-size: .92rem; letter-spacing: .08em; }
        .bj-parents { margin: .25rem 0 0; font-family: var(--font-script); font-weight: 700; font-size: clamp(1.9rem, 8cqi, 2.6rem); color: var(--c-accent); line-height: 1.2; }
        .bj-pill { display: inline-block; margin: 1.5rem 0 1rem; padding: .55em 1.3em; border-radius: 999px; background: linear-gradient(135deg, #FFE1EA, #E9E0FF); font-family: var(--font-display); font-weight: 600; color: var(--c-ink); }
        .bj-when { display: grid; gap: .5rem; justify-items: center; font-weight: 700; }
        .bj-when p { margin: 0; display: inline-flex; align-items: center; gap: .5em; }
        .bj-when svg { width: 20px; height: 20px; color: var(--c-accent-2); flex: none; }
        .bj-stagger > * { opacity: 0; animation: bj-rise-in .8s var(--ease-out) forwards; }
        ${Array.from({ length: 10 }, (_, i) => `.bj-stagger > *:nth-child(${i + 1}) { animation-delay: ${0.15 + i * 0.15}s; }`).join("\n        ")}

        /* ---------- 3. Details ---------- */
        .bj-details { background: linear-gradient(180deg, #FFF8EF 0%, #FFF1F5 100%); }
        .bj-grid { display: grid; gap: 1.5rem; }
        @container bj (min-width: 760px) { .bj-grid { grid-template-columns: 1fr 1fr; } .bj-span-2 { grid-column: span 2; } }
        .bj-card { position: relative; background: #fff; border-radius: 30px; padding: 1.5rem; box-shadow: var(--shadow-soft); border: 1px solid rgba(220,203,255,.55); height: 100%; }
        .bj-card-head { display: flex; align-items: center; gap: .75rem; margin-bottom: 1rem; }
        .bj-card-head h3 { margin: 0; font-family: var(--font-display); font-weight: 600; font-size: clamp(1.25rem, 4.6cqi, 1.6rem); }
        .bj-ic { width: 58px; height: 58px; border-radius: 18px; display: grid; place-items: center; flex: none; }
        .bj-ic svg { width: 34px; height: 34px; overflow: visible; }
        .bj-ic-cal { background: linear-gradient(135deg, #FFE1EA, #FFD0DE); }
        .bj-ic-pin { background: linear-gradient(135deg, #DDF6EC, #C2EEDB); }
        .bj-ic-family { background: linear-gradient(135deg, #EAE2FF, #DCCBFF); }
        .bj-cal-page { transform-box: fill-box; transform-origin: 50% 0; animation: bj-page-flip 3.4s ease-in-out infinite; }
        .bj-cal-rings { animation: bj-ring 1.7s ease-in-out infinite; }
        @keyframes bj-ring { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
        @keyframes bj-page-flip { 0%, 70%, 100% { transform: rotateX(0); } 80% { transform: rotateX(80deg); } 90% { transform: rotateX(0); } }
        .bj-pin { transform-box: fill-box; transform-origin: 50% 100%; animation: bj-pin-bounce 2s var(--ease-out) infinite; }
        .bj-ripple { transform-box: fill-box; transform-origin: center; animation: bj-ripple 2s ease-out infinite; }
        @keyframes bj-pin-bounce { 0%, 100% { transform: translateY(0); } 30% { transform: translateY(-6px); } 50% { transform: translateY(0) scaleY(.9); } 60% { transform: scaleY(1); } }
        @keyframes bj-ripple { 0% { transform: scale(.4); opacity: .9; } 100% { transform: scale(1.6); opacity: 0; } }
        .bj-big { font-family: var(--font-display); font-weight: 700; font-size: clamp(1.2rem, 5.2cqi, 1.6rem); margin: 0; line-height: 1.25; }
        .bj-soft { margin: .25rem 0 0; color: var(--c-ink-soft); font-weight: 700; }
        .bj-countdown { display: grid; grid-template-columns: repeat(4, 1fr); gap: .5rem; margin: 1.5rem 0; }
        .bj-cd-tile { text-align: center; padding: .75rem 0; border-radius: 20px; background: linear-gradient(160deg, #FFF4F8, #F3EDFF); box-shadow: inset 0 0 0 1.5px rgba(255,196,214,.6); }
        .bj-cd-num { display: block; font-family: var(--font-display); font-weight: 700; font-size: clamp(1.4rem, 7cqi, 2.1rem); line-height: 1.1; color: var(--c-accent); font-variant-numeric: tabular-nums; animation: bj-tick .45s var(--ease-bounce); }
        @keyframes bj-tick { from { transform: translateY(-6px) scale(1.12); } to { transform: none; } }
        .bj-cd-label { font-size: .72rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: var(--c-ink-soft); }
        .bj-countdown-done { margin: 1.5rem 0; padding: 1rem; border-radius: 20px; text-align: center; background: linear-gradient(135deg, #FFF0C9, #FFE1EA); font-family: var(--font-display); font-weight: 600; }
        .bj-venue-address { margin: .25rem 0 1.5rem; color: var(--c-ink-soft); font-weight: 600; }
        .bj-family-list { display: grid; gap: .75rem; margin: 0; padding-right: 70px; }
        .bj-family-list div { display: flex; justify-content: space-between; gap: .75rem; padding-bottom: .75rem; border-bottom: 1.5px dashed rgba(169,139,234,.35); }
        .bj-family-list div:last-child { border-bottom: 0; padding-bottom: 0; }
        .bj-family-list dt { color: var(--c-ink-soft); font-weight: 700; font-size: .92rem; flex: none; }
        .bj-family-list dd { margin: 0; font-weight: 800; text-align: right; }
        .bj-teddy { position: absolute; right: -6px; bottom: -14px; width: 92px; opacity: .95; animation: bj-float-tilt 5s ease-in-out infinite; }
        @container bj (min-width: 760px) { .bj-teddy { width: 120px; } .bj-family-list { padding-right: 110px; } }

        /* ---------- 4. Timeline ---------- */
        .bj-timeline-section { background: linear-gradient(180deg, #FFF1F5 0%, #EEF7FF 100%); }
        .bj-timeline { list-style: none; margin: 0 auto; padding: 0; max-width: 620px; position: relative; }
        .bj-timeline::before { content: ""; position: absolute; left: 30px; top: 12px; bottom: 12px; width: 4px; border-radius: 4px; background: linear-gradient(180deg, var(--c-pink), var(--c-lavender), var(--c-blue), var(--c-mint)); }
        .bj-t-item { position: relative; display: grid; grid-template-columns: 64px 1fr; gap: 1rem; align-items: start; padding-bottom: 1.5rem; }
        .bj-t-item:last-child { padding-bottom: 0; }
        .bj-t-marker { position: relative; z-index: 1; width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; background: var(--mk); box-shadow: 0 0 0 6px #fff, 0 10px 20px rgba(120,90,160,.2); color: var(--c-ink); }
        .bj-t-marker svg { width: 30px; height: 30px; }
        .tpl-reveal-in .bj-t-marker { animation: bj-marker-pop .7s var(--ease-bounce) both; }
        @keyframes bj-marker-pop { from { transform: scale(.4); } to { transform: scale(1); } }
        .bj-t-card { background: #fff; border-radius: 20px; padding: 1rem 1.5rem; box-shadow: var(--shadow-soft); }
        .bj-t-time { display: inline-block; font-family: var(--font-display); font-weight: 600; font-size: .78rem; letter-spacing: .1em; padding: .3em .9em; border-radius: 999px; background: var(--mk-soft); color: var(--c-ink); }
        .bj-t-card h3 { margin: .5rem 0 0; font-family: var(--font-display); font-weight: 600; font-size: clamp(1.15rem, 4.6cqi, 1.5rem); }
        .bj-t-card p { margin: .25rem 0 0; color: var(--c-ink-soft); font-weight: 600; }
        .bj-t-link { display: inline-flex; align-items: center; gap: .35em; margin-top: .5rem; font-family: var(--font-display); font-weight: 600; font-size: .85rem; color: var(--c-accent-2); text-decoration: none; }
        .bj-t-link svg { width: 1em; height: 1em; }

        /* ---------- 5. Gallery ---------- */
        .bj-gallery-section { background: linear-gradient(180deg, #EEF7FF 0%, #FFF8EF 100%); }
        .bj-gallery { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        @container bj (min-width: 760px) { .bj-gallery { grid-template-columns: repeat(4, 1fr); gap: 1.5rem; } }
        .bj-g-item { position: relative; display: block; width: 100%; padding: 8px; border: 0; cursor: zoom-in; border-radius: 26px; background: var(--frame); box-shadow: var(--shadow-soft);
          transform: rotate(var(--tilt)); transition: transform 480ms var(--ease-bounce), box-shadow 480ms; -webkit-tap-highlight-color: transparent; }
        .bj-g-item:hover, .bj-g-item:focus-visible { transform: rotate(0) translateY(-6px) scale(1.03); box-shadow: var(--shadow-lift); }
        .bj-g-item img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 20px; background: #fff; }
        .bj-cap { position: absolute; left: 50%; bottom: 16px; transform: translateX(-50%); white-space: nowrap; max-width: 88%; overflow: hidden; text-overflow: ellipsis; padding: .3em .9em; border-radius: 999px;
          background: rgba(255,255,255,.88); font-family: var(--font-display); font-weight: 600; font-size: .78rem; }

        .bj-lightbox { position: fixed; inset: 0; z-index: 80; display: grid; place-items: center; padding: 1.5rem 16px; background: rgba(52,37,66,.82); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
          animation: bj-fade .3s ease both; font-family: var(--font-display); }
        @keyframes bj-fade { from { opacity: 0; } to { opacity: 1; } }
        .bj-lb-figure { margin: 0; width: min(92vw, 640px); text-align: center; touch-action: pan-y; }
        .bj-lb-figure img { width: 100%; max-height: 72vh; max-height: 72svh; object-fit: contain; border-radius: 26px; background: #fff; box-shadow: 0 30px 70px rgba(0,0,0,.35); }
        .bj-slide-next { animation: bj-slide-next .42s var(--ease-out); }
        .bj-slide-prev { animation: bj-slide-prev .42s var(--ease-out); }
        @keyframes bj-slide-next { from { opacity: 0; transform: translateX(40px) scale(.97); } to { opacity: 1; transform: none; } }
        @keyframes bj-slide-prev { from { opacity: 0; transform: translateX(-40px) scale(.97); } to { opacity: 1; transform: none; } }
        .bj-lb-figure figcaption { margin-top: .75rem; color: #fff; font-weight: 600; }
        .bj-lb-figure figcaption span { opacity: .7; font-weight: 500; margin-left: .5em; }
        .bj-lb-btn { position: absolute; width: 52px; height: 52px; border-radius: 50%; border: 0; cursor: pointer; background: rgba(255,255,255,.92); color: #463650 !important; display: grid; place-items: center; box-shadow: 0 10px 24px rgba(0,0,0,.25); }
        .bj-lb-btn svg { width: 24px; height: 24px; }
        .bj-lb-close { top: 16px; right: 16px; }
        .bj-lb-prev { left: 12px; top: 50%; transform: translateY(-50%); }
        .bj-lb-next { right: 12px; top: 50%; transform: translateY(-50%); }
        @media (max-width: 600px) { .bj-lb-prev, .bj-lb-next { top: auto; bottom: 18px; transform: none; } .bj-lb-prev { left: calc(50% - 64px); } .bj-lb-next { right: calc(50% - 64px); } .bj-lb-figure { margin-bottom: 64px; } }

        /* ---------- 6. Family message ---------- */
        .bj-message-section { background: linear-gradient(180deg, #FFF8EF 0%, #FCEFFF 100%); }
        .bj-message { position: relative; max-width: 620px; margin: 0 auto; text-align: center; padding: 3rem 1.5rem; border-radius: 40px; background: linear-gradient(160deg, #fff 0%, #FFF4F8 100%); box-shadow: var(--shadow-lift); }
        .bj-flower { position: absolute; width: 74px; z-index: 2; }
        .bj-f1 { top: -30px; left: -14px; animation: bj-float-tilt 6s ease-in-out infinite; }
        .bj-f2 { top: -26px; right: -12px; width: 62px; animation: bj-float-tilt 7s ease-in-out infinite -2s; }
        .bj-f3 { bottom: -24px; right: 18%; width: 54px; animation: bj-float-tilt 6.5s ease-in-out infinite -4s; }
        .bj-message h2 { position: relative; margin: 0; font-family: var(--font-script); font-weight: 700; font-size: clamp(2.2rem, 10cqi, 3.4rem); line-height: 1.1; color: var(--c-accent); }
        .bj-message p { position: relative; margin: 1rem auto 0; max-width: 34ch; font-size: clamp(1rem, 4.2cqi, 1.18rem); font-weight: 600; color: var(--c-ink-soft); white-space: pre-line; }
        .bj-message .bj-sign { margin-top: 1.5rem; font-family: var(--font-display); font-weight: 600; color: var(--c-ink); }
        .bj-hearts { position: absolute; inset: 0; pointer-events: none; overflow: hidden; border-radius: 40px; }
        .bj .bj-hearts img { position: absolute; bottom: -24px; opacity: 0; animation: bj-heart-rise 7s ease-in infinite; }
        @keyframes bj-heart-rise { 0% { transform: translateY(0) scale(.6); opacity: 0; } 20% { opacity: .45; } 100% { transform: translateY(-340px) scale(1.1); opacity: 0; } }

        /* ---------- 7. Closing ---------- */
        .bj-closing { text-align: center; background: radial-gradient(60% 40% at 50% 0%, rgba(255,255,255,.9), transparent 70%), linear-gradient(180deg, #FCEFFF 0%, #FFE6EE 50%, #FFF1E2 100%); }
        .bj-closing-fx { left: 0; right: 0; top: 0; height: calc(4.5rem + min(86cqi, 460px) * 1.08); overflow: hidden; }
        .bj-closing-art { position: relative; width: min(86cqi, 460px); margin: 0 auto; }
        .bj-closing-art .bj-baby { width: 100%; animation: bj-float-y 6s ease-in-out infinite; }
        .bj-closing-art .bj-teddy-c { position: absolute; width: 32%; right: -6%; bottom: 2%; animation: bj-float-tilt 5s ease-in-out infinite -1s; }
        .bj-rise { position: absolute; bottom: -120px; opacity: .95; animation: bj-rise 14s linear infinite; }
        @keyframes bj-rise { 0% { transform: translate(0, 0) rotate(-4deg); } 50% { transform: translate(18px, -400px) rotate(4deg); } 100% { transform: translate(-10px, -820px) rotate(-3deg); } }
        .bj-closing h2 { margin: 1rem 0 0; font-family: var(--font-display); font-weight: 700; font-size: clamp(1.6rem, 7cqi, 2.5rem); line-height: 1.15; }
        .bj-closing-name { margin: .75rem 0 0; font-family: var(--font-script); font-weight: 700; font-size: clamp(2.5rem, 12cqi, 3.8rem); line-height: 1.1; color: var(--c-accent); overflow-wrap: break-word; }
        .bj-closing-meta { margin: .75rem auto 0; display: grid; gap: .25rem; font-weight: 700; color: var(--c-ink-soft); }
        .bj-closing-meta p { margin: 0; }
        .bj-actions { margin: 2rem auto 0; display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; max-width: 520px; }
        .bj-actions .bj-btn { padding-left: .8em; padding-right: .8em; font-size: .92rem; }
        .bj-confetti { position: absolute; top: -20px; opacity: .85; animation: bj-fall linear infinite; }
        @keyframes bj-fall { 0% { transform: translateY(0) rotate(0); } 100% { transform: translateY(var(--fall, 900px)) rotate(540deg); } }
        .bj-contact { margin-top: 2rem; display: flex; flex-wrap: wrap; justify-content: center; gap: .5rem 1rem; font-size: .85rem; font-weight: 700; color: var(--c-ink-soft); }
        .bj-contact a { color: var(--c-accent-2); }

        .bj-offscreen, .bj-offscreen * { animation-play-state: paused !important; }
        .bj.bj-low .bj-lowhide { display: none; }

        .bj .bj-side-deco { display: none; }
        @container bj (min-width: 900px) { .bj .bj-side-deco { display: block; } }
        @container bj (max-width: 370px) { .bj-card { padding: 1rem; } .bj-actions { grid-template-columns: 1fr; } }

        @media (prefers-reduced-motion: reduce) {
          .bj *, .bj *::before, .bj *::after { animation-duration: 1ms !important; animation-iteration-count: 1 !important; animation-delay: 0ms !important; transition-duration: 1ms !important; }
          .bj-butterfly, .bj-drift, .bj-rise, .bj-confetti, .bj-hearts { display: none; }
        }
      `}</style>

      <div ref={innerRef} className="bj-inner">
        {/* ===== 1. Opening: pop a balloon ===== */}
        <section ref={introRef} className="bj-intro" aria-label="Opening" onPointerMove={parallax}>
          <div className="bj-layer bj-depth" style={{ "--d": 0.25 } as CSSProperties} aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bj-cloud bj-drift" src={`${A}/fluffy-cloud.svg`} alt="" />
            {STARS.map((s, i) => (
              <Star
                key={i}
                color={s.color}
                className={s.low ? "bj-lowhide" : ""}
                style={{ left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
              />
            ))}
          </div>
          <div className="bj-layer bj-depth" style={{ "--d": 0.5 } as CSSProperties} aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bj-cloud bj-c1" src={`${A}/fluffy-cloud.svg`} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bj-cloud bj-c2" src={`${A}/fluffy-cloud.svg`} alt="" />
            <Butterfly className="bj-butterfly" color="pink" />
            <Butterfly className="bj-butterfly bj-b2" color="blue" />
          </div>

          <div className="bj-intro-text bj-depth" style={{ "--d": 0.08 } as CSSProperties}>
            <p className="bj-kicker">
              <span aria-hidden>✦</span>
              <span>You&apos;re Invited to Celebrate</span>
              <span aria-hidden>✦</span>
            </p>
            <h1>A Little Bundle of Joy!</h1>
            <p className="bj-subtitle">Our family is growing, and our hearts are overflowing with happiness.</p>
            <p className="bj-who">
              <strong>{baby}</strong>
              {parents && <span>with love, {parents}</span>}
            </p>
          </div>

          <div className="bj-stage bj-depth" style={{ "--d": 0.15 } as CSSProperties}>
            <div className="bj-hero-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="bj-hero" src={`${A}/baby-hero.svg`} alt="A smiling cartoon baby sitting in a fluffy cloud cradle" />
            </div>
            {BALLOONS.map((c, i) => {
              const isPopped = popped.includes(i);
              return (
                <button
                  key={`${round}-${i}`}
                  type="button"
                  className={`bj-balloon bj-bl${i + 1}${isPopped ? " bj-popping" : ""}`}
                  style={{ "--burst": c.deep } as CSSProperties}
                  aria-label={opened ? `Pop the ${c.name} balloon` : `Pop the ${c.name} balloon to open your invitation`}
                  aria-hidden={isPopped || undefined}
                  tabIndex={isPopped ? -1 : undefined}
                  onPointerDown={(e) => {
                    const el = e.currentTarget;
                    el.classList.remove("bj-press");
                    void el.offsetWidth;
                    el.classList.add("bj-press");
                  }}
                  onClick={(e) => pop(i, e.currentTarget)}
                >
                  <svg className="bj-b-string" viewBox="0 0 30 80" aria-hidden>
                    <path d="M15 0 C9 18 22 32 13 50 C9 60 17 70 15 80" fill="none" stroke="#B5A3C8" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="bj-b-body" src={`${A}/balloon-body-${c.name}.svg`} alt="" draggable={false} />
                  <span className="bj-b-burst" aria-hidden />
                </button>
              );
            })}
          </div>

          <div className="bj-layer bj-depth" style={{ "--d": 0.7 } as CSSProperties} aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bj-cloud bj-c3" src={`${A}/fluffy-cloud.svg`} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="bj-cloud bj-c4" src={`${A}/fluffy-cloud.svg`} alt="" />
          </div>

          <p className={`bj-tap-hint ${popped.length ? "bj-hidden" : ""}`}>Tap a Balloon to Open Your Invitation 🎈</p>
          <canvas ref={canvasRef} className="bj-canvas" aria-hidden />
        </section>

        {opened && (
          <>
            {/* ===== 2. Invitation card ===== */}
            <section ref={inviteRef} className="bj-section bj-reveal" tabIndex={-1} aria-label="Invitation">
              <div className="bj-container">
                <article className="bj-card-invite">
                  <div className="bj-stagger">
                    {data.coupleImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="bj-baby-photo" src={data.coupleImage} alt={baby} />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="bj-peek bj-floaty" src={`${A}/baby-peek.svg`} alt="A giggling cartoon baby peeking over a cloud" />
                    )}
                    <h2>You&apos;re Invited!</h2>
                    <p className="bj-lead">{inviteLine}</p>
                    {data.quote?.trim() && <p className="bj-quote">&ldquo;{data.quote.trim()}&rdquo;</p>}
                    <p className="bj-baby-name">
                      <span className="bj-pre">Our little one</span>
                      <span className="bj-name">{baby}</span>
                    </p>
                    <div className="bj-divider" aria-hidden>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`${A}/star-gold.svg`} alt="" />
                    </div>
                    {parents && (
                      <>
                        <p className="bj-with-love">With Love,</p>
                        <p className="bj-parents">{parents}</p>
                      </>
                    )}
                    <p>
                      <span className="bj-pill">{functionTitle}</span>
                    </p>
                    <div className="bj-when">
                      <p>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                          <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
                          <path d="M3.5 10h17M8 3v4M16 3v4" />
                        </svg>
                        <span>{dateLong}</span>
                      </p>
                      {time && (
                        <p>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3 2" />
                          </svg>
                          <span>{time} onwards</span>
                        </p>
                      )}
                    </div>
                  </div>
                </article>
              </div>
              <Star color="gold" style={{ top: "12%", left: "8%" }} />
              <Star color="pink" style={{ top: "22%", right: "7%", animationDelay: "-1s" }} />
              <Star color="lavender" style={{ bottom: "14%", left: "10%", animationDelay: "-2s" }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="bj-deco bj-floaty" src={`${A}/fluffy-cloud.svg`} alt="" style={{ width: 150, bottom: "4%", right: -40, opacity: 0.85 }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="bj-deco bj-floaty" src={`${A}/fluffy-cloud.svg`} alt="" style={{ width: 120, top: "6%", left: -40, opacity: 0.75, animationDelay: "-3s" }} />
            </section>

            {/* ===== 3. Details ===== */}
            <section className="bj-section bj-details" aria-label="Celebration details">
              <div className="bj-container">
                <Reveal>
                  <p className="bj-eyebrow">Save the Date</p>
                  <h2 className="bj-title">
                    The <span className="bj-sparkle">Celebration</span>
                  </h2>
                </Reveal>
                <div className="bj-grid">
                  <Reveal>
                    <article className="bj-card">
                      <div className="bj-card-head">
                        <span className="bj-ic bj-ic-cal" aria-hidden>
                          <svg viewBox="0 0 40 40">
                            <rect x="4" y="8" width="32" height="28" rx="6" fill="#fff" />
                            <rect x="4" y="8" width="32" height="10" rx="5" fill="#FF8FB0" />
                            <rect x="4" y="13" width="32" height="5" fill="#FF8FB0" />
                            <g className="bj-cal-page">
                              <rect x="9" y="21" width="22" height="12" rx="3" fill="#FFF4F8" />
                              <text x="20" y="31" textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight="700" fontSize="10" fill="#E8638C">
                                {date ? date.getDate() : "?"}
                              </text>
                            </g>
                            <g className="bj-cal-rings">
                              <rect x="11" y="4" width="4" height="9" rx="2" fill="#A98BEA" />
                              <rect x="25" y="4" width="4" height="9" rx="2" fill="#A98BEA" />
                            </g>
                          </svg>
                        </span>
                        <h3>When</h3>
                      </div>
                      <p className="bj-big">{dateLong}</p>
                      {time && <p className="bj-soft">{time} onwards</p>}
                      {countdown}
                      {calendarUrl && (
                        <a className="bj-btn bj-btn-primary" href={calendarUrl} target="_blank" rel="noopener noreferrer">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                            <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
                            <path d="M3.5 10h17M8 3v4M16 3v4M12 13v5M9.5 15.5h5" />
                          </svg>
                          Add to Calendar
                        </a>
                      )}
                    </article>
                  </Reveal>

                  <Reveal delay={120}>
                    <article className="bj-card">
                      <div className="bj-card-head">
                        <span className="bj-ic bj-ic-pin" aria-hidden>
                          <svg viewBox="0 0 40 40">
                            <ellipse className="bj-ripple" cx="20" cy="34" rx="10" ry="3.5" fill="none" stroke="#3FBF8E" strokeWidth="2" />
                            <g className="bj-pin">
                              <path d="M20 35s-11-9.6-11-18a11 11 0 0122 0c0 8.4-11 18-11 18z" fill="#3FBF8E" />
                              <circle cx="20" cy="17" r="4.5" fill="#fff" />
                            </g>
                          </svg>
                        </span>
                        <h3>Where</h3>
                      </div>
                      <p className="bj-big">{venueName || "Venue to be announced"}</p>
                      <p className="bj-venue-address">{venueAddress}</p>
                      {mapsUrl && (
                        <a className="bj-btn bj-btn-secondary" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                          <PinSvg />
                          Get Directions
                        </a>
                      )}
                    </article>
                  </Reveal>

                  <Reveal delay={200} className="bj-span-2">
                    <article className="bj-card">
                      <div className="bj-card-head">
                        <span className="bj-ic bj-ic-family" aria-hidden>
                          <svg viewBox="0 0 40 40">
                            <path d="M20 33s-12-7.4-12-16a6.5 6.5 0 0112-3.4A6.5 6.5 0 0132 17c0 8.6-12 16-12 16z" fill="#A98BEA" />
                            <circle cx="15" cy="15" r="2.5" fill="#fff" opacity=".7" />
                          </svg>
                        </span>
                        <h3>Our Family</h3>
                      </div>
                      <dl className="bj-family-list">
                        {familyRows.map(([k, v]) => (
                          <div key={k}>
                            <dt>{k}</dt>
                            <dd>{v}</dd>
                          </div>
                        ))}
                      </dl>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img className="bj-teddy" src={`${A}/teddy-bear.svg`} alt="" />
                    </article>
                  </Reveal>
                </div>
              </div>
            </section>

            {/* ===== 4. Timeline ===== */}
            {events.length > 0 && (
              <section className="bj-section bj-timeline-section" aria-label="Celebration timeline">
                <div className="bj-container">
                  <Reveal>
                    <p className="bj-eyebrow">The Little Details</p>
                    <h2 className="bj-title">
                      Celebration <span className="bj-sparkle">Timeline</span>
                    </h2>
                  </Reveal>
                  <ol className="bj-timeline">
                    {events.map((evt, i) => {
                      const d = parseDate(evt.eventDate);
                      const showDate = d && (!date || d.toDateString() !== date.toDateString());
                      const chip = [showDate ? `${weekdayName(d).slice(0, 3)}, ${d.getDate()} ${monthName(d).slice(0, 3)}` : "", evt.eventTime?.trim() || ""]
                        .filter(Boolean)
                        .join(" · ");
                      const venue = evt.venue?.trim() || "";
                      const otherVenue = venue && venue !== venueName;
                      return (
                        <li key={evt.id}>
                          <Reveal delay={i * 110}>
                            <div className="bj-t-item" style={{ "--mk": PASTELS[i % PASTELS.length], "--mk-soft": PASTEL_SOFT[i % PASTEL_SOFT.length] } as CSSProperties}>
                              <span className="bj-t-marker">
                                <Icon name={eventIcon(evt.eventName)} />
                              </span>
                              <div className="bj-t-card">
                                {chip && <span className="bj-t-time">{chip}</span>}
                                <h3>{evt.eventName}</h3>
                                {evt.description?.trim() && <p>{evt.description.trim()}</p>}
                                {otherVenue && (
                                  <a className="bj-t-link" href={mapsSearchUrl(venue)} target="_blank" rel="noopener noreferrer">
                                    <PinSvg />
                                    {venue}
                                  </a>
                                )}
                              </div>
                            </div>
                          </Reveal>
                        </li>
                      );
                    })}
                  </ol>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="bj-deco bj-floaty bj-side-deco" src={`${A}/pastel-balloon-mint.svg`} alt="" style={{ width: 56, top: "30%", right: "3%" }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className="bj-deco bj-floaty bj-side-deco" src={`${A}/pastel-balloon-pink.svg`} alt="" style={{ width: 48, top: "62%", left: "2%", animationDelay: "-2s" }} />
              </section>
            )}

            {/* ===== 5. Gallery ===== */}
            <section className="bj-section bj-gallery-section" aria-label="Photo gallery">
              <div className="bj-container">
                <Reveal>
                  <p className="bj-eyebrow">Tiny Moments</p>
                  <h2 className="bj-title">
                    Precious <span className="bj-sparkle">Memories</span>
                  </h2>
                </Reveal>
                <div className="bj-gallery">
                  {photos.map((p, i) => (
                    <Reveal key={i} delay={i * 90}>
                      <button
                        type="button"
                        className="bj-g-item"
                        style={{ "--frame": PASTELS[i % PASTELS.length], "--tilt": i % 2 ? "2deg" : "-2deg" } as CSSProperties}
                        aria-label={`Open photo: ${p.caption}`}
                        onClick={(e) => {
                          lbOpener.current = e.currentTarget;
                          setLightbox(i);
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.src}
                          alt={p.caption}
                          loading="lazy"
                          onError={() => own.length && !broken.includes(i) && setBroken((b) => [...b, i])}
                        />
                        <span className="bj-cap">{p.caption}</span>
                      </button>
                    </Reveal>
                  ))}
                </div>
              </div>
              <Star color="gold" style={{ top: "8%", left: "12%" }} />
              <Star color="blue" style={{ top: "14%", right: "10%", animationDelay: "-1.5s" }} />
            </section>

            {/* ===== 6. Family message ===== */}
            <section className="bj-section bj-message-section" aria-label="A message from the family">
              <div className="bj-container">
                <Reveal>
                  <article className="bj-message">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="bj-flower bj-f1" src={`${A}/flower-pink.svg`} alt="" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="bj-flower bj-f2" src={`${A}/flower-lavender.svg`} alt="" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="bj-flower bj-f3" src={`${A}/flower-pink.svg`} alt="" />
                    <div className="bj-hearts" aria-hidden>
                      {Array.from({ length: 8 }, (_, i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={i}
                          src={`${A}/heart-${i % 2 ? "lavender" : "pink"}.svg`}
                          alt=""
                          className={i >= 4 ? "bj-lowhide" : ""}
                          style={{ left: `${8 + i * 11.5}%`, animationDelay: `${-i * 0.9}s`, width: 14 + (i % 3) * 5 }}
                        />
                      ))}
                    </div>
                    <h2>Little Hands, Big Love</h2>
                    <p>{familyMessage}</p>
                    {parents && <p className="bj-sign">— {parents}</p>}
                  </article>
                </Reveal>
              </div>
            </section>

            {/* ===== 7. Closing ===== */}
            <section className="bj-section bj-closing" aria-label="Closing">
              <div className="bj-deco bj-closing-fx" aria-hidden>
                {RISING.map((b, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    className="bj-rise"
                    src={b.src}
                    alt=""
                    style={{ left: `${b.left}%`, width: b.width, animationDelay: `${b.delay}s`, animationDuration: `${b.dur}s` }}
                  />
                ))}
                {CONFETTI.map((p, i) => (
                  <span
                    key={i}
                    className={`bj-confetti${p.low ? " bj-lowhide" : ""}`}
                    style={
                      {
                        left: `${p.left}%`,
                        background: p.color,
                        width: p.w,
                        height: p.h,
                        borderRadius: p.radius,
                        animationDuration: `${p.dur}s`,
                        animationDelay: `${p.delay}s`,
                        "--fall": `${p.fall}px`,
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
              <div className="bj-container">
                <Reveal>
                  <div className="bj-closing-art">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="bj-baby" src={`${A}/baby-hero.svg`} alt="The cartoon baby waving from a cloud cradle" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="bj-teddy-c" src={`${A}/teddy-bear.svg`} alt="" />
                  </div>
                  <h2>We Can&apos;t Wait to Celebrate With You!</h2>
                  <p className="bj-closing-name">{baby}</p>
                </Reveal>
                <Reveal delay={150}>
                  <div className="bj-closing-meta">
                    <p>
                      {dateLong}
                      {time && ` · ${time}`}
                    </p>
                    {venueLine && <p>{venueLine}</p>}
                  </div>
                  <div className="bj-actions">
                    <button type="button" className="bj-btn bj-btn-ghost" onClick={replay}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M3 12a9 9 0 103-6.7" />
                        <path d="M3 4v5h5" />
                      </svg>
                      Replay
                    </button>
                    <button
                      type="button"
                      className="bj-btn bj-btn-ghost"
                      onClick={() => rootRef.current?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" })}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M12 19V5M5 12l7-7 7 7" />
                      </svg>
                      Back to Top
                    </button>
                  </div>
                  {(data.contactDetails?.trim() || data.instagramLink?.trim()) && (
                    <div className="bj-contact">
                      {data.contactDetails?.trim() && <span>📞 {data.contactDetails.trim()}</span>}
                      {data.instagramLink?.trim() && (
                        <a href={data.instagramLink} target="_blank" rel="noopener noreferrer">
                          Follow us on Instagram
                        </a>
                      )}
                    </div>
                  )}
                </Reveal>
              </div>
            </section>
          </>
        )}
      </div>

      {/* Outside the container element: container queries make it a containing block for fixed elements. */}
      {lightbox !== null && photos[lightbox] && (
        <Lightbox
          photos={photos}
          index={lightbox}
          onIndex={(i) => setLightbox(i)}
          onClose={() => {
            setLightbox(null);
            lbOpener.current?.focus();
          }}
        />
      )}
    </div>
  );
}
