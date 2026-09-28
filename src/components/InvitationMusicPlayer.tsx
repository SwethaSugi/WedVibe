"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { InvitationMusic } from "@/lib/invitation-types";

const VOLUME = 0.6;
const FADE_MS = 2500;

/**
 * Background song for a live invitation. Browsers only allow sound after the visitor interacts,
 * so the song starts on the guest's first tap anywhere — normally the tap that opens the
 * template's cover — and fades in. A floating button mutes/unmutes; it pauses while the tab is
 * hidden and resumes when the guest comes back.
 */
export function InvitationMusicPlayer({ music }: { music: InvitationMusic }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const wantsPlay = useRef(false); // the guest's choice, kept across tab switches
  const fadeTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);

  const play = useCallback(async (fade: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (fadeTimer.current) clearInterval(fadeTimer.current);
    audio.volume = fade ? 0 : VOLUME;
    try {
      await audio.play();
    } catch {
      return; // blocked or failed: stay paused, the button still works
    }
    wantsPlay.current = true;
    setStarted(true);
    if (fade) {
      const step = VOLUME / (FADE_MS / 100);
      fadeTimer.current = setInterval(() => {
        audio.volume = Math.min(VOLUME, audio.volume + step);
        if (audio.volume >= VOLUME && fadeTimer.current) clearInterval(fadeTimer.current);
      }, 100);
    }
  }, []);

  const pause = useCallback(() => {
    if (fadeTimer.current) clearInterval(fadeTimer.current);
    audioRef.current?.pause();
  }, []);

  // Start on the first tap/key anywhere on the page (except the music button, which handles itself).
  useEffect(() => {
    if (started) return;
    const onFirst = (e: Event) => {
      if (buttonRef.current?.contains(e.target as Node)) return;
      play(true);
    };
    document.addEventListener("pointerdown", onFirst, { capture: true, once: true });
    document.addEventListener("keydown", onFirst, { capture: true, once: true });
    return () => {
      document.removeEventListener("pointerdown", onFirst, { capture: true });
      document.removeEventListener("keydown", onFirst, { capture: true });
    };
  }, [started, play]);

  // Pause while the tab is hidden; resume on return if the guest had it on.
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pause();
      else if (wantsPlay.current) play(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [play, pause]);

  useEffect(() => () => { if (fadeTimer.current) clearInterval(fadeTimer.current); }, []);

  function toggle() {
    if (playing) {
      wantsPlay.current = false;
      pause();
    } else {
      play(!started);
    }
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={music.url}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <style>{`
        @keyframes imp-bar { 0%, 100% { transform: scaleY(0.35); } 50% { transform: scaleY(1); } }
        @keyframes imp-ring { 0% { transform: scale(1); opacity: .55; } 100% { transform: scale(1.6); opacity: 0; } }
        .imp-bar { transform-origin: bottom; animation: imp-bar .9s ease-in-out infinite; }
        .imp-ring { animation: imp-ring 1.8s ease-out infinite; }
        @media (prefers-reduced-motion: reduce) { .imp-bar, .imp-ring { animation: none !important; } }
      `}</style>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-label={playing ? `Mute music: ${music.title}` : `Play music: ${music.title}`}
        title={playing ? "Mute music" : "Play music"}
        className="fixed bottom-5 right-5 z-[60] flex items-center gap-2 h-12 pl-3 pr-4 rounded-full bg-black/60 text-white backdrop-blur-md border border-white/25 shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:bg-black/75 transition-colors"
      >
        <span className="relative flex items-center justify-center w-6 h-6">
          {!started && <span className="imp-ring absolute inset-0 rounded-full border border-white/70" aria-hidden />}
          {playing ? (
            <span className="flex items-end gap-[3px] h-4" aria-hidden>
              {[0, 0.2, 0.4, 0.1].map((d, i) => (
                <span key={i} className="imp-bar w-[3px] h-4 rounded-full bg-white" style={{ animationDelay: `${d}s` }} />
              ))}
            </span>
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden>
              <path d="M9 18V6l10-2v12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="6.5" cy="18" r="2.5" />
              <circle cx="16.5" cy="16" r="2.5" />
            </svg>
          )}
        </span>
        <span className="text-xs font-medium">{playing ? "Music on" : started ? "Music off" : "Play music"}</span>
      </button>
    </>
  );
}
