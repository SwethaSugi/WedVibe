import { GroomFigure } from "./GroomFigure";
import { BrideFigure } from "./BrideFigure";

export type IllustrationVariant = "royal" | "floral" | "modern";

const VARIANT_STYLES: Record<
  IllustrationVariant,
  { groom: string; bride: string; glow: string; ring: string; ornament: string }
> = {
  royal: {
    groom: "text-[#8a6a2f]",
    bride: "text-[#c9a24b]",
    glow: "bg-[#c9a24b]",
    ring: "border-[#c9a24b]/40",
    ornament: "text-[#c9a24b]",
  },
  floral: {
    groom: "text-rose-300",
    bride: "text-rose-500",
    glow: "bg-rose-300",
    ring: "border-rose-400/40",
    ornament: "text-rose-500",
  },
  modern: {
    groom: "text-neutral-400",
    bride: "text-white",
    glow: "bg-fuchsia-500",
    ring: "border-cyan-400/40",
    ornament: "text-cyan-300",
  },
};

export function CoupleIllustration({ variant, className = "" }: { variant: IllustrationVariant; className?: string }) {
  const s = VARIANT_STYLES[variant];

  return (
    <div className={`relative flex items-end justify-center gap-1 select-none ${className}`} aria-hidden>
      {/* futuristic ambient glow */}
      <div className={`tpl-glow absolute inset-0 rounded-full ${s.glow} opacity-40`} />

      {/* orbiting particle rings */}
      <div className={`absolute inset-0 flex items-center justify-center`}>
        <div className={`tpl-orbit w-[92%] h-[92%] rounded-full border ${s.ring} relative`}>
          <span className={`absolute -top-1 left-1/2 w-1.5 h-1.5 rounded-full ${s.glow} tpl-sparkle`} />
        </div>
      </div>
      <div className={`absolute inset-0 flex items-center justify-center`}>
        <div className={`tpl-orbit-reverse w-[70%] h-[70%] rounded-full border ${s.ring} relative`}>
          <span className={`absolute -bottom-1 left-1/2 w-1 h-1 rounded-full ${s.glow} tpl-sparkle`} />
        </div>
      </div>

      <div className="tpl-couple-in relative w-28 sm:w-32" style={{ animationDelay: "0ms" }}>
        <div className="tpl-float" style={{ animationDelay: "0.2s" }}>
          <GroomFigure className={`w-full h-auto ${s.groom} drop-shadow-lg`} />
        </div>
      </div>

      <div className="relative flex flex-col items-center pb-10 z-10">
        <span className={`tpl-ring-pulse absolute w-10 h-10 rounded-full border ${s.ring}`} />
        <span className={`text-2xl ${s.ornament}`}>✦</span>
      </div>

      <div className="tpl-couple-in relative w-28 sm:w-32" style={{ animationDelay: "150ms" }}>
        <div className="tpl-float" style={{ animationDelay: "0.6s" }}>
          <BrideFigure className={`w-full h-auto ${s.bride} drop-shadow-lg`} />
        </div>
      </div>
    </div>
  );
}
