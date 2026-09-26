// Original chibi-style illustration (hand-drawn SVG, not traced from any reference image).
export function GroomFigure({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 260" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* body / coat */}
      <path
        d="M100 150 C66 150 46 172 42 202 C39 224 40 244 44 256 L156 256 C160 244 161 224 158 202 C154 172 134 150 100 150Z"
        fill="currentColor"
      />
      {/* coat placket */}
      <path d="M100 150 L88 176 L100 190 L112 176 Z" fill="var(--tpl-bg, #1a0f00)" opacity="0.4" />
      <line x1="100" y1="190" x2="100" y2="254" stroke="var(--tpl-bg, #1a0f00)" strokeWidth="2" opacity="0.25" />
      <circle cx="100" cy="205" r="2.2" fill="var(--tpl-bg, #1a0f00)" opacity="0.4" />
      <circle cx="100" cy="222" r="2.2" fill="var(--tpl-bg, #1a0f00)" opacity="0.4" />
      {/* sash */}
      <path d="M70 176 L92 254" stroke="var(--tpl-accent, #c9a24b)" strokeWidth="7" opacity="0.55" strokeLinecap="round" />

      {/* arms */}
      <path d="M42 210 C30 216 24 230 26 246" stroke="currentColor" strokeWidth="16" strokeLinecap="round" fill="none" />
      <path d="M158 210 C170 216 176 230 174 246" stroke="currentColor" strokeWidth="16" strokeLinecap="round" fill="none" />

      {/* neck */}
      <rect x="88" y="128" width="24" height="24" rx="8" fill="#f2c9a0" />

      {/* big chibi head */}
      <circle cx="100" cy="86" r="58" fill="#f2c9a0" />

      {/* hair */}
      <path
        d="M42 84 C40 40 68 14 100 14 C132 14 160 40 158 84 C158 66 146 52 130 50 C132 40 120 32 108 36 C104 26 92 26 88 36 C74 34 64 44 64 56 C50 58 42 68 42 84Z"
        fill="#3a2418"
      />

      {/* ears */}
      <circle cx="42" cy="90" r="9" fill="#f2c9a0" />
      <circle cx="158" cy="90" r="9" fill="#f2c9a0" />

      {/* blush */}
      <circle cx="72" cy="104" r="9" fill="#f2a6a0" opacity="0.55" />
      <circle cx="128" cy="104" r="9" fill="#f2a6a0" opacity="0.55" />

      {/* eyes */}
      <circle cx="80" cy="90" r="7" fill="#3a2418" />
      <circle cx="120" cy="90" r="7" fill="#3a2418" />
      <circle cx="82.5" cy="87.5" r="2" fill="white" />
      <circle cx="122.5" cy="87.5" r="2" fill="white" />

      {/* eyebrows */}
      <path d="M70 76 Q80 70 90 76" stroke="#3a2418" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M110 76 Q120 70 130 76" stroke="#3a2418" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* smile */}
      <path d="M86 112 Q100 122 114 112" stroke="#8a4a3a" strokeWidth="3" strokeLinecap="round" fill="none" />

      {/* shirt collar */}
      <path d="M88 146 L100 136 L112 146 L100 154 Z" fill="white" />
    </svg>
  );
}
