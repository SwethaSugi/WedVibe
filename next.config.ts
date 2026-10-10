import type { NextConfig } from "next";

// Two sites from one codebase:
//  - the main WedVibe app (default), and
//  - the showcase: a static site of live template demos for social media
//    (`npm run build:showcase`, output in ./out, hosted on Cloudflare Pages). In that mode only
//    files named *.showcase.tsx in src/app are routes, so the app's pages and API stay out of it,
//    while both share the same template components.
const showcase = process.env.SHOWCASE_BUILD === "1";

const nextConfig: NextConfig = showcase
  ? {
      output: "export",
      pageExtensions: ["showcase.tsx"],
      // With a static export the finished site is written to distDir: ./out (served by Cloudflare).
      distDir: "out",
      images: { unoptimized: true },
      // The main build and `tsc` already type-check everything (showcase files included); the
      // main app's generated route types don't apply to this cut-down route set.
      typescript: { ignoreBuildErrors: true },
    }
  : {};

export default nextConfig;
