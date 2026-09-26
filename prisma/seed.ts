import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { SUPPORTED_FIELDS } from "../src/lib/invitation-types";

const prisma = new PrismaClient();

const NEW_TEMPLATES = [
  {
    name: "Celestial Cinema",
    slug: "celestial-cinema",
    description: "A cinematic full-screen couple photo with a slow Ken-Burns drift, gold names and a scrolling film-reel gallery.",
    category: "Modern",
    price: 499,
    componentKey: "celestial-cinema",
    previewImage: "/templates/celestial-cinema.svg",
  },
  {
    name: "Boho Botanica",
    slug: "boho-botanica",
    description: "A sage-green garden lookbook with drifting leaves, script lettering and an auto-scrolling gallery.",
    category: "Floral",
    price: 399,
    componentKey: "boho-botanica",
    previewImage: "/templates/boho-botanica.svg",
  },
  {
    name: "Aura Minimal",
    slug: "aura-minimal",
    description: "A Swiss editorial design with hairline grids, a duotone couple photo and a vertical film-strip gallery.",
    category: "Minimal",
    price: 299,
    componentKey: "aura-minimal",
    previewImage: "/templates/aura-minimal.svg",
  },
  {
    name: "Haldi Sunshine",
    slug: "haldi-sunshine",
    description: "A bright marigold Haldi invite with a spinning sunburst photo frame, floating flowers and shuffling polaroids.",
    category: "Haldi",
    price: 349,
    componentKey: "haldi-sunshine",
    previewImage: "/templates/haldi-sunshine.svg",
  },
  {
    name: "Mehendi Nights",
    slug: "mehendi-nights",
    description: "A fairy-lit Mehendi evening in peacock teal and fuchsia, with twinkling lights and a diamond-cut gallery.",
    category: "Mehendi",
    price: 399,
    componentKey: "mehendi-nights",
    previewImage: "/templates/mehendi-nights.svg",
  },
  {
    name: "Modern Aura",
    slug: "modern-aura",
    description: "A frosted-glass editorial card on a glowing aurora, with couple portraits, love story and an events timeline.",
    category: "Modern",
    price: 399,
    componentKey: "modern-aura",
    previewImage: "/templates/modern-aura.svg",
  },
  {
    name: "Emerald Nikah",
    slug: "emerald-nikah",
    description: "An emerald and gold Nikah invitation with swaying lanterns, arched motifs and a scrolling gallery.",
    category: "Muslim Wedding",
    price: 449,
    componentKey: "emerald-nikah",
    previewImage: "/templates/emerald-nikah.svg",
  },
  {
    name: "Ring of Eternity",
    slug: "ring-of-eternity",
    description: "A rose-gold engagement invite with an orbiting ring emblem and a rotating 3D photo carousel.",
    category: "Engagement",
    price: 349,
    componentKey: "ring-of-eternity",
    previewImage: "/templates/ring-of-eternity.svg",
  },
  {
    name: "Serene Chapel",
    slug: "serene-chapel",
    description: "A graceful church wedding invite with stained-glass light, script lettering and expanding photo panels.",
    category: "Christian Wedding",
    price: 399,
    componentKey: "serene-chapel",
    previewImage: "/templates/serene-chapel.svg",
  },
  {
    name: "Temple Bells",
    slug: "temple-bells",
    description: "A traditional South Indian invite in crimson silk and temple gold, with swaying bells and a gold-framed gallery.",
    category: "South Indian",
    price: 449,
    componentKey: "temple-bells",
    previewImage: "/templates/temple-bells.svg",
  },
  {
    name: "Velvet Royale",
    slug: "velvet-royale",
    description: "A midnight-velvet reception invite with rich gold lettering and a scrolling photo gallery.",
    category: "Reception",
    price: 499,
    componentKey: "velvet-royale",
    previewImage: "/templates/velvet-royale.svg",
  },
  {
    name: "Champagne Noir",
    slug: "champagne-noir",
    description: "An art-deco black and gold reception invite with rising sparkles and a fanned photo deck.",
    category: "Reception",
    price: 449,
    componentKey: "champagne-noir",
    previewImage: "/templates/champagne-noir.svg",
  },
  {
    name: "Cosmic Vows",
    slug: "cosmic-vows",
    description: "A starry twilight design with nebula glows, a turning constellation ring and floating photo cards.",
    category: "Modern",
    price: 399,
    componentKey: "cosmic-vows",
    previewImage: "/templates/cosmic-vows.svg",
  },
  {
    name: "Riverside Heritage",
    slug: "riverside-heritage",
    description: "A crimson and temple-gold traditional invite with glowing lamps and bobbing lotus-arch photo frames.",
    category: "Traditional",
    price: 449,
    componentKey: "riverside-heritage",
    previewImage: "/templates/riverside-heritage.svg",
  },
  {
    name: "Royal Punjabi",
    slug: "royal-punjabi",
    description: "A festive saffron and crimson North Indian invite with sparkling bursts and auto-flipping photo cards.",
    category: "North Indian",
    price: 449,
    componentKey: "royal-punjabi",
    previewImage: "/templates/royal-punjabi.svg",
  },
  {
    name: "Wedding Chronicle",
    slug: "wedding-chronicle",
    description: "An indigo and saffron multi-day invite with a numbered schedule and a spotlight photo gallery.",
    category: "Multi-Event",
    price: 499,
    componentKey: "wedding-chronicle",
    previewImage: "/templates/wedding-chronicle.svg",
  },
  {
    name: "Golden Doors",
    slug: "golden-doors",
    description:
      "Carved doors swing open to a full-screen couple photo, a scratch-to-reveal date, an event timeline with map and calendar buttons, and a live countdown.",
    category: "South Indian",
    price: 599,
    componentKey: "golden-doors",
    previewImage: "/templates/golden-doors.svg",
  },
  {
    name: "Blush Seal",
    slug: "blush-seal",
    description:
      "A wax seal opens onto an ivory and wine-rose invitation with Month/Day/Year scratch tiles, a live countdown, a swipeable story slider and day-by-day ceremony cards.",
    category: "Traditional",
    price: 499,
    componentKey: "blush-seal",
    previewImage: "/templates/blush-seal.svg",
  },
  {
    name: "Midnight Promise",
    slug: "midnight-promise",
    description:
      "Black, champagne gold and blush: a glowing ring opens onto a veiled couple photo, a live countdown, ceremony details with map and calendar buttons, and directions.",
    category: "Engagement",
    price: 449,
    componentKey: "midnight-promise",
    previewImage: "/templates/midnight-promise.svg",
  },
];

async function main() {
  const supportedFields = JSON.stringify(SUPPORTED_FIELDS);

  const templates = [
    {
      name: "Royal Gold Wedding",
      slug: "royal-gold",
      description: "An elegant traditional invitation in deep gold and maroon tones.",
      category: "Traditional",
      price: 299,
      componentKey: "royal-gold",
      previewImage: "/templates/royal-gold.svg",
    },
    {
      name: "Floral Love",
      slug: "floral-love",
      description: "A soft, romantic floral design perfect for garden weddings.",
      category: "Floral",
      price: 349,
      componentKey: "floral-love",
      previewImage: "/templates/floral-love.svg",
    },
    {
      name: "Modern Elegant",
      slug: "modern-elegant",
      description: "A minimal dark-themed design for the contemporary couple.",
      category: "Modern",
      price: 249,
      componentKey: "modern-elegant",
      previewImage: "/templates/modern-elegant.svg",
    },
    {
      name: "Royal Rajputana",
      slug: "royal-rajputana",
      description:
        "Regal palace splendour in royal maroon and antique gold, with jharokha arches, a glowing diya and falling petals.",
      category: "Royal",
      price: 1499,
      componentKey: "royal-rajputana",
      previewImage: "/templates/royal-rajputana.svg",
    },
    ...NEW_TEMPLATES,
  ];

  for (const t of templates) {
    await prisma.template.upsert({
      where: { slug: t.slug },
      update: {},
      create: { ...t, supportedFields, currency: "INR", status: "ACTIVE" },
    });
  }

  // No built-in default password (the repository is public): use ADMIN_PASSWORD, or generate a
  // random one and print it once when the admin account is first created.
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const existingAdmin = await prisma.adminUser.findUnique({ where: { username: adminUsername } });
  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_PASSWORD || crypto.randomBytes(12).toString("base64url");
    await prisma.adminUser.create({
      data: { username: adminUsername, passwordHash: await bcrypt.hash(adminPassword, 10), role: "ADMIN" },
    });
    if (!process.env.ADMIN_PASSWORD) {
      console.log(`Admin account created — username: ${adminUsername}  password: ${adminPassword}  (save it now; it is not stored anywhere)`);
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
