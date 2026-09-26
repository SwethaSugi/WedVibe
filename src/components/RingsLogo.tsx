// Original wedding-rings mark (two interlocking bands) used as the WedVibe logo.
export function RingsLogo({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="wv-ring-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#e11d48" />
        </linearGradient>
        <linearGradient id="wv-ring-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>
      <circle cx="19" cy="27" r="12" stroke="url(#wv-ring-a)" strokeWidth="4" />
      <circle cx="29" cy="27" r="12" stroke="url(#wv-ring-b)" strokeWidth="4" />
      <path d="M24 10 L27 16 L21 16 Z" fill="url(#wv-ring-b)" />
      <circle cx="24" cy="9" r="2" fill="#fbbf24" />
    </svg>
  );
}
