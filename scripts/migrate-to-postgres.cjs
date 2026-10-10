// One-time move of the local SQLite data to Postgres (Neon), plus the uploaded files it links to
// into Netlify Blobs (same /uploads/... keys, so no links change).
//
//   node scripts/migrate-to-postgres.cjs <path-to-sqlite-client>          (dry run: counts only)
//   node scripts/migrate-to-postgres.cjs <path-to-sqlite-client> --apply  (copy everything)
//   add --rows-only or --files-only to do just the database rows or just the files.
//
// <path-to-sqlite-client> is a Prisma client generated from the old SQLite schema (output dir).
// Needs DATABASE_URL / DATABASE_URL_UNPOOLED in .env (Postgres, schema already created with
// `npx prisma db push`), and NETLIFY_SITE_ID + NETLIFY_AUTH_TOKEN in the environment for the
// files. Keeps every id and timestamp; skips OTP codes (short-lived). Refuses to run if the
// Postgres database already has users.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
for (const line of fs.readFileSync(path.join(ROOT, ".env"), "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}

const [sqliteClientPath, ...flags] = process.argv.slice(2);
if (!sqliteClientPath) throw new Error("Pass the path to the SQLite Prisma client.");
const apply = flags.includes("--apply");
// The two halves can run separately: --rows-only (database) and --files-only (Netlify Blobs).
const doRows = !flags.includes("--files-only");
const doFiles = !flags.includes("--rows-only");

const { PrismaClient: SqliteClient } = require(path.resolve(sqliteClientPath));
const { PrismaClient } = require("@prisma/client");
const { getStore } = require("@netlify/blobs");

const src = new SqliteClient();
const dst = new PrismaClient();

const CONTENT_TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", mp3: "audio/mpeg", m4a: "audio/mp4" };

(async () => {
  const data = {
    adminUser: await src.adminUser.findMany(),
    user: await src.user.findMany(),
    template: await src.template.findMany(),
    musicTrack: await src.musicTrack.findMany(),
    invitation: await src.invitation.findMany(),
    event: await src.event.findMany(),
    payment: await src.payment.findMany(),
    customRequest: await src.customRequest.findMany(),
  };
  console.log("SQLite rows:", Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v.length])));

  // Every /uploads/... file any row links to.
  const files = new Set();
  for (const rows of Object.values(data)) {
    for (const s of JSON.stringify(rows).match(/\/uploads\/(music\/)?[A-Za-z0-9_-]+\.(jpg|png|webp|mp3|m4a)/g) ?? []) files.add(s);
  }
  console.log("Linked upload files:", files.size);

  const existingUsers = await dst.user.count();
  console.log("Postgres users already present:", existingUsers);
  if (!apply) return console.log("\nDry run only. Re-run with --apply to copy.");
  if (doRows && existingUsers > 0) throw new Error("Postgres already has data; refusing to copy twice.");

  if (doFiles && files.size) {
    if (!process.env.NETLIFY_SITE_ID || !process.env.NETLIFY_AUTH_TOKEN) throw new Error("Set NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN.");
    const store = getStore({ name: "uploads", siteID: process.env.NETLIFY_SITE_ID, token: process.env.NETLIFY_AUTH_TOKEN });
    console.log("\nUploading files to Netlify Blobs…");
    for (const url of files) {
      const file = path.join(ROOT, "public", url);
      if (!fs.existsSync(file)) {
        console.warn(`  missing file, link kept as-is: ${url}`);
        continue;
      }
      const buf = fs.readFileSync(file);
      const key = url.slice("/uploads/".length);
      await store.set(key, buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length), {
        metadata: { contentType: CONTENT_TYPES[key.split(".").pop()] },
      });
      console.log(`  ${key}`);
    }
  }

  if (!doRows) return;
  console.log("Copying rows…");
  await dst.$transaction([
    dst.adminUser.createMany({ data: data.adminUser }),
    dst.user.createMany({ data: data.user }),
    dst.template.createMany({ data: data.template }),
    dst.musicTrack.createMany({ data: data.musicTrack }),
    dst.invitation.createMany({ data: data.invitation }),
    dst.event.createMany({ data: data.event }),
    dst.payment.createMany({ data: data.payment }),
    dst.customRequest.createMany({ data: data.customRequest }),
  ]);

  const after = {
    adminUser: await dst.adminUser.count(),
    user: await dst.user.count(),
    template: await dst.template.count(),
    musicTrack: await dst.musicTrack.count(),
    invitation: await dst.invitation.count(),
    event: await dst.event.count(),
    payment: await dst.payment.count(),
    customRequest: await dst.customRequest.count(),
  };
  console.log("Postgres rows now:", after);
  const same = Object.keys(after).every((k) => after[k] === data[k].length);
  console.log(same ? "All rows copied." : "WARNING: counts differ, please check.");
})()
  .catch((e) => {
    console.error("FAILED:", e.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await src.$disconnect();
    await dst.$disconnect();
  });
