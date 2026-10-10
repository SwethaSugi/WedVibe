// Exports the active templates for the static showcase site (no prices) and makes a 1200x630
// share-preview image for each (WhatsApp/Instagram/Facebook can't show SVG previews).
//   npm run showcase:export      (then commit + push; Cloudflare Pages rebuilds the showcase)
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { PrismaClient } = require("@prisma/client");

const ROOT = path.join(__dirname, "..");
const OUT_JSON = path.join(ROOT, "src", "showcase", "templates.json");
const OG_DIR = path.join(ROOT, "public", "og");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function shareImage(t) {
  const W = 1200, H = 630;
  const thumbFile = path.join(ROOT, "public", (t.previewImage || "").replace(/^\//, ""));
  const thumb = fs.existsSync(thumbFile)
    ? await sharp(thumbFile, { density: 200 }).resize(400, 500, { fit: "cover" }).png().toBuffer()
    : null;
  const logo = await sharp(path.join(ROOT, "public", "logo-wedvibe.webp")).resize(120, 120).png().toBuffer();
  const bg = Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fdf6ef"/><stop offset="1" stop-color="#f3e3d3"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect x="70" y="58" width="420" height="514" rx="26" fill="#ffffff" opacity="0.9"/>
    <text x="560" y="250" font-family="Georgia, serif" font-size="28" letter-spacing="6" fill="#b0843a">${esc(t.category.toUpperCase())}</text>
    <text x="560" y="330" font-family="Georgia, serif" font-size="64" font-weight="bold" fill="#5b1530">${esc(t.name)}</text>
    <text x="560" y="395" font-family="Arial, sans-serif" font-size="30" fill="#6b5a52">Live digital wedding invitation</text>
    <text x="560" y="440" font-family="Arial, sans-serif" font-size="30" fill="#6b5a52">Tap to open the full design</text>
    <text x="690" y="535" font-family="Georgia, serif" font-size="34" font-weight="bold" fill="#5b1530">WedVibe</text>
  </svg>`);
  const layers = [{ input: logo, left: 560, top: 470 }];
  if (thumb) layers.unshift({ input: thumb, left: 80, top: 65 });
  await sharp(bg).composite(layers).png({ compressionLevel: 9 }).toFile(path.join(OG_DIR, `${t.slug}.png`));
}

(async () => {
  const prisma = new PrismaClient();
  const templates = await prisma.template.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    select: { slug: true, name: true, category: true, description: true, componentKey: true, previewImage: true },
  });
  await prisma.$disconnect();

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, JSON.stringify(templates, null, 2) + "\n");

  fs.mkdirSync(OG_DIR, { recursive: true });
  for (const f of fs.readdirSync(OG_DIR)) if (f.endsWith(".png")) fs.unlinkSync(path.join(OG_DIR, f));
  for (const t of templates) await shareImage(t);

  console.log(`Exported ${templates.length} templates to src/showcase/templates.json and share images to public/og/`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
