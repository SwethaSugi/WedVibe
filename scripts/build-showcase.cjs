// Builds the static showcase site into ./out (works on Windows and on Cloudflare Pages).
//   npm run build:showcase
// In this mode next.config.ts only uses the *.showcase.tsx files in src/app (see there).
const { spawnSync } = require("child_process");

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, SHOWCASE_BUILD: "1", NEXT_TELEMETRY_DISABLED: "1" },
});
process.exit(result.status ?? 1);
