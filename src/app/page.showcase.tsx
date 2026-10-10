import { SHOWCASE_TEMPLATES, SHOWCASE_URL } from "@/showcase/config";
import { ShowcaseGrid } from "@/showcase/ShowcaseGrid";

// Showcase homepage: every live design, each with its own shareable link.
export default function ShowcaseHome() {
  return (
    <div className="relative flex-1 overflow-hidden">
      <div className="pointer-events-none absolute -top-40 -left-40 w-[30rem] h-[30rem] rounded-full bg-rose-200/40 blur-3xl" aria-hidden />
      <div className="pointer-events-none absolute top-[40rem] -right-40 w-[30rem] h-[30rem] rounded-full bg-amber-200/40 blur-3xl" aria-hidden />

      <header className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 pb-10 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-wedvibe.webp" alt="WedVibe" className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full shadow-[0_0_40px_rgba(217,179,106,0.35)]" />
        <p className="mt-6 text-xs uppercase tracking-[0.35em] text-[#b0843a]">Digital wedding invitations</p>
        <h1 className="mt-3 font-serif text-3xl sm:text-5xl text-[#5b1530] leading-tight">Our Invitation Designs</h1>
        <p className="mt-4 text-neutral-600 max-w-xl mx-auto">
          Animated openings, music, live countdown, photo gallery and venue maps. Tap any design to open it as a real
          invitation.
        </p>
      </header>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <ShowcaseGrid templates={SHOWCASE_TEMPLATES} siteUrl={SHOWCASE_URL} />
      </main>

      <footer className="relative border-t border-[#ead9cc] py-8 text-center text-sm text-neutral-500">
        © {new Date().getFullYear()} WedVibe · Make Your Moments Special
      </footer>
    </div>
  );
}
