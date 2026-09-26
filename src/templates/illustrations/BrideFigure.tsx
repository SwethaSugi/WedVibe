// Original chibi-style illustration (hand-drawn SVG, not traced from any reference image).
export function BrideFigure({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* veil, behind everything */}
      <path
        d="M100 44 C60 54 40 92 38 150 C36 196 40 230 46 256 L26 256 C18 218 16 172 20 130 C24 92 44 54 100 44Z"
        fill="currentColor"
        opacity="0.5"
      />
      <path
        d="M100 44 C140 54 160 92 162 150 C164 196 160 230 154 256 L174 256 C182 218 184 172 180 130 C176 92 156 54 100 44Z"
        fill="currentColor"
        opacity="0.5"
      />

      {/* gown bell body */}
      <path
        d="M100 150 C74 152 58 168 52 194 C46 224 44 244 48 256 L152 256 C156 244 154 224 148 194 C142 168 126 152 100 150Z"
        fill="currentColor"
      />
      <line x1="100" y1="154" x2="100" y2="254" stroke="var(--tpl-bg, #1a0f00)" strokeWidth="1.5" opacity="0.2" />
      {/* dupatta drape across body */}
      <path d="M64 160 Q100 182 136 160 Q134 176 100 196 Q66 176 64 160Z" fill="var(--tpl-accent, #c9a24b)" opacity="0.55" />
      {/* hem trim */}
      <path d="M48 250 Q100 262 152 250" stroke="var(--tpl-accent, #c9a24b)" strokeWidth="3" opacity="0.6" fill="none" />

      {/* arms holding bouquet */}
      <path d="M56 202 C46 210 42 222 46 236" stroke="currentColor" strokeWidth="14" strokeLinecap="round" fill="none" />
      <path d="M144 202 C154 210 158 222 154 236" stroke="currentColor" strokeWidth="14" strokeLinecap="round" fill="none" />
      {/* bouquet */}
      <circle cx="100" cy="236" r="10" fill="#e0637a" />
      <circle cx="92" cy="230" r="7" fill="#f2a6b8" />
      <circle cx="108" cy="230" r="7" fill="#f2a6b8" />
      <circle cx="100" cy="224" r="7" fill="white" opacity="0.85" />

      {/* neck */}
      <rect x="88" y="128" width="24" height="24" rx="8" fill="#f2c9a0" />

      {/* big chibi head */}
      <circle cx="100" cy="86" r="58" fill="#f2c9a0" />

      {/* hair — center part, pulled back */}
      <path
        d="M42 82 C40 36 68 16 100 16 C132 16 160 36 158 82 C158 68 150 58 138 54 C140 44 128 34 116 38 C112 26 88 26 84 38 C72 34 60 44 62 54 C50 58 42 68 42 82Z"
        fill="#3a2418"
      />
      {/* bun */}
      <circle cx="132" cy="42" r="14" fill="#3a2418" />

      {/* maang tikka */}
      <path d="M100 26 L100 40" stroke="var(--tpl-accent, #c9a24b)" strokeWidth="2.5" />
      <circle cx="100" cy="42" r="4" fill="var(--tpl-accent, #c9a24b)" />
      {/* bindi */}
      <circle cx="100" cy="66" r="2.2" fill="#c0304a" />

      {/* ears + earrings */}
      <circle cx="42" cy="90" r="9" fill="#f2c9a0" />
      <circle cx="158" cy="90" r="9" fill="#f2c9a0" />
      <circle cx="42" cy="102" r="3" fill="var(--tpl-accent, #c9a24b)" />
      <circle cx="158" cy="102" r="3" fill="var(--tpl-accent, #c9a24b)" />

      {/* blush */}
      <circle cx="72" cy="104" r="9" fill="#f2a6a0" opacity="0.55" />
      <circle cx="128" cy="104" r="9" fill="#f2a6a0" opacity="0.55" />

      {/* eyes */}
      <circle cx="80" cy="90" r="7.5" fill="#3a2418" />
      <circle cx="120" cy="90" r="7.5" fill="#3a2418" />
      <circle cx="82.5" cy="87" r="2.2" fill="white" />
      <circle cx="122.5" cy="87" r="2.2" fill="white" />
      {/* lashes */}
      <path d="M72 84 L68 80" stroke="#3a2418" strokeWidth="2" strokeLinecap="round" />
      <path d="M128 84 L132 80" stroke="#3a2418" strokeWidth="2" strokeLinecap="round" />

      {/* eyebrows */}
      <path d="M70 76 Q80 70 90 76" stroke="#3a2418" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M110 76 Q120 70 130 76" stroke="#3a2418" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* smile */}
      <path d="M86 112 Q100 122 114 112" stroke="#8a4a3a" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}
