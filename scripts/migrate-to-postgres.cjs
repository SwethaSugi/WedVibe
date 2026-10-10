// One-time move of the local SQLite data to Postgres (Neon) + uploads to Vercel Blob.
//
//   node scripts/migrate-to-postgres.cjs <path-to-sqlite-client>          (dry run: counts only)
//   node scripts/migrate-to-postgres.cjs <path-to-sqlite-client> --apply  (copy everything)
//
// <path-to-sqlite-client> is a Prisma client generated from the old SQLite schema (output dir).
// Needs in .env: DATABASE_URL / DATABASE_URL_UNPOOLED (Postgres, schema already migrated with
// `npx prisma migrate deploy`) and BLOB_READ_WRITE_TOKEN. Keeps every id and timestamp; skips
// OTP codes (short-lived). Refuses to run if the Postgres database already has users.

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
for (const line of fs.readFileSync(path.join(ROOT, ".env"), "utf8").split(/\r?\n/)) {
  const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
  if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}

const [sqliteClientPath, flag] = process.argv.slice(2);
if (!sqliteClientPath) throw new Error("Pass the path to the SQLite Prisma client.");
const apply = flag === "--apply";

const { PrismaClient: SqliteClient } = require(path.resolve(sqliteClientPath));
const { PrismaClient } = require("@prisma/client");
const { put } = require("@vercel/blob");

const src = new SqliteClient();
const dst = new PrismaClient();

const CONTENT_TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", mp3: "audio/mpeg", m4a: "audio/mp4" };
const urlMap = new Map(); // "/uploads/..." -> Blob URL

async function toBlob(localUrl) {
  if (urlMap.has(localUrl)) return urlMap.get(localUrl);
  const file = path.join(ROOT, "public", localUrl);
  if (!fs.existsSync(file)) {
    console.warn(`  missing file, link kept as-is: ${localUrl}`);
    urlMap.set(localUrl, localUrl);
    return localUrl;
  }
  const name = path.basename(localUrl);
  const ext = name.split(".").pop().toLowerCase();
  const folder = localUrl.startsWith("/uploads/music/") ? "music" : "images";
  const blob = await put(`${folder}/${name}`, fs.readFileSync(file), {
    access: "public",
    addRandomSuffix: true,
    contentType: CONTENT_TYPES[ext],
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });
  urlMap.set(localUrl, blob.url);
  return blob.url;
}

// Replaces every "/uploads/..." string inside a JSON value with its Blob URL.
async function rewrite(value) {
  if (typeof value === "string") return value.startsWith("/uploads/") ? toBlob(value) : value;
  if (Array.isArray(value)) return Promise.all(value.map(rewrite));
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = await rewrite(v);
    return out;
  }
  return value;
}

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

  const existingUsers = await dst.user.count();
  console.log("Postgres users already present:", existingUsers);
  if (!apply) return console.log("\nDry run only. Re-run with --apply to copy.");
  if (existingUsers > 0) throw new Error("Postgres already has data; refusing to copy twice.");

  console.log("\nUploading files to Vercel Blob…");
  for (const t of data.musicTrack) t.url = await rewrite(t.url);
  for (const inv of data.invitation) inv.invitationData = JSON.stringify(await rewrite(JSON.parse(inv.invitationData)));
  console.log(`  ${[...urlMap.values()].filter((u) => u.startsWith("https://")).length} files uploaded`);

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
