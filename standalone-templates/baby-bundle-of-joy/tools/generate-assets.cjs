// Generates the illustration family for the "A Little Bundle of Joy" invitation.
// Original vector art (no third-party characters). Run:  node tools/generate-assets.cjs
// Writes SVG files to ../assets. Shared parts (baby head, swaddle, cloud, teddy, balloon)
// keep proportions and colours consistent across every illustration.

const fs = require("fs");
const path = require("path");
const OUT = path.join(__dirname, "..", "assets");
fs.mkdirSync(OUT, { recursive: true });

const C = {
  cream: "#FFF8EF",
  peach: "#FFD7BF",
  pink: "#FFC4D6",
  pinkDeep: "#FF9FBB",
  blue: "#BFE3FF",
  blueDeep: "#8CCBF5",
  mint: "#C8F0DF",
  mintDeep: "#93DDBE",
  lavender: "#DCCBFF",
  lavenderDeep: "#B9A2F2",
  yellow: "#FFE7A3",
  yellowDeep: "#FFD36B",
  ink: "#4A3B4F",
  mouth: "#D46B83",
};

let uid = 0;
const id = (p) => `${p}${++uid}`;

const svg = (w, h, body, defs = "") =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n<defs>${defs}</defs>\n${body}\n</svg>\n`;

const softShadow = (fid, color = "#9C86C9", opacity = 0.28, dy = 10, blur = 12) =>
  `<filter id="${fid}" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="${dy}" stdDeviation="${blur}" flood-color="${color}" flood-opacity="${opacity}"/></filter>`;

const blurF = (fid, s) => `<filter id="${fid}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${s}"/></filter>`;

function star(cx, cy, r, fill = C.yellowDeep, opacity = 1) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}" opacity="${opacity}" stroke="${fill}" stroke-width="${(r * 0.18).toFixed(1)}" stroke-linejoin="round"/>`;
}

function sparkle(cx, cy, r, fill = "#fff", opacity = 0.95) {
  return `<path d="M${cx} ${cy - r} Q${cx + r * 0.18} ${cy - r * 0.18} ${cx + r} ${cy} Q${cx + r * 0.18} ${cy + r * 0.18} ${cx} ${cy + r} Q${cx - r * 0.18} ${cy + r * 0.18} ${cx - r} ${cy} Q${cx - r * 0.18} ${cy - r * 0.18} ${cx} ${cy - r}Z" fill="${fill}" opacity="${opacity}"/>`;
}

function heart(cx, cy, s, fill = C.pinkDeep, opacity = 1) {
  return `<path d="M${cx} ${cy + s * 0.9} C${cx - s * 1.4} ${cy - s * 0.1} ${cx - s * 0.7} ${cy - s * 1.1} ${cx} ${cy - s * 0.35} C${cx + s * 0.7} ${cy - s * 1.1} ${cx + s * 1.4} ${cy - s * 0.1} ${cx} ${cy + s * 0.9}Z" fill="${fill}" opacity="${opacity}"/>`;
}

// Fluffy cloud built from overlapping puffs sharing one gradient (no seams).
function cloud(x, y, w, opts = {}) {
  const h = w * 0.5;
  const gid = id("cg");
  const top = opts.top ?? "#FFFFFF";
  const bottom = opts.bottom ?? "#ECE9FF";
  const puffs = opts.puffs ?? [
    [0.2, 0.68, 0.2],
    [0.38, 0.45, 0.27],
    [0.6, 0.4, 0.3],
    [0.8, 0.62, 0.22],
    [0.5, 0.72, 0.24],
  ];
  const defs = `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${x}" y1="${y}" x2="${x}" y2="${y + h}"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>`;
  const shapes = puffs.map(([px, py, pr]) => `<circle cx="${x + px * w}" cy="${y + py * h}" r="${pr * w}"/>`).join("");
  const base = `<ellipse cx="${x + w * 0.5}" cy="${y + h * 0.74}" rx="${w * 0.4}" ry="${h * 0.24}"/>`;
  const shine = `<ellipse cx="${x + w * 0.5}" cy="${y + h * 0.22}" rx="${w * 0.16}" ry="${h * 0.07}" fill="#fff" opacity=".7"/>`;
  return { defs, body: `<g fill="url(#${gid})" ${opts.filter ? `filter="url(#${opts.filter})"` : ""}>${shapes}${base}</g>${opts.shine === false ? "" : shine}` };
}

// Baby head. mood: "awake" | "sleep" | "giggle"
function babyHead(cx, cy, r, mood = "awake") {
  const sk = id("skin");
  const ear = id("ear");
  const blushF = id("blush");
  const defs = `
    <radialGradient id="${sk}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#FFF0E6"/><stop offset=".55" stop-color="#FFD9C4"/><stop offset="1" stop-color="#F3B697"/></radialGradient>
    <radialGradient id="${ear}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#FFE3D3"/><stop offset="1" stop-color="#F0AE8E"/></radialGradient>
    ${blurF(blushF, r * 0.05)}`;
  const eyeY = cy + r * 0.04;
  const ex = r * 0.34;
  let eyes;
  if (mood === "sleep") {
    eyes = [-1, 1].map((s) => `<path d="M${cx + s * ex - r * 0.13} ${eyeY} q${r * 0.13} ${r * 0.12} ${r * 0.26} 0" fill="none" stroke="${C.ink}" stroke-width="${r * 0.045}" stroke-linecap="round"/><path d="M${cx + s * ex + s * r * 0.11} ${eyeY + r * 0.02} l${s * r * 0.06} ${r * 0.04}" stroke="${C.ink}" stroke-width="${r * 0.03}" stroke-linecap="round"/>`).join("");
  } else if (mood === "giggle") {
    eyes = [-1, 1].map((s) => `<path d="M${cx + s * ex - r * 0.12} ${eyeY + r * 0.03} q${r * 0.12} ${-r * 0.14} ${r * 0.24} 0" fill="none" stroke="${C.ink}" stroke-width="${r * 0.05}" stroke-linecap="round"/>`).join("");
  } else {
    eyes = [-1, 1]
      .map(
        (s) => `
      <ellipse cx="${cx + s * ex}" cy="${eyeY}" rx="${r * 0.125}" ry="${r * 0.155}" fill="${C.ink}"/>
      <ellipse cx="${cx + s * ex}" cy="${eyeY + r * 0.07}" rx="${r * 0.08}" ry="${r * 0.05}" fill="#7A5E86" opacity=".55"/>
      <circle cx="${cx + s * ex - r * 0.045}" cy="${eyeY - r * 0.06}" r="${r * 0.05}" fill="#fff"/>
      <circle cx="${cx + s * ex + r * 0.04}" cy="${eyeY + r * 0.045}" r="${r * 0.022}" fill="#fff" opacity=".9"/>
      <path d="M${cx + s * ex + s * r * 0.1} ${eyeY - r * 0.12} l${s * r * 0.05} ${-r * 0.04}" stroke="${C.ink}" stroke-width="${r * 0.025}" stroke-linecap="round"/>`
      )
      .join("");
  }
  const mouth =
    mood === "sleep"
      ? `<ellipse cx="${cx}" cy="${cy + r * 0.38}" rx="${r * 0.05}" ry="${r * 0.035}" fill="${C.mouth}" opacity=".8"/>`
      : mood === "giggle"
        ? `<path d="M${cx - r * 0.14} ${cy + r * 0.3} q${r * 0.14} ${r * 0.24} ${r * 0.28} 0 z" fill="${C.mouth}"/><path d="M${cx - r * 0.07} ${cy + r * 0.4} q${r * 0.07} ${r * 0.06} ${r * 0.14} 0" fill="#FF9FB0"/>`
        : `<path d="M${cx - r * 0.11} ${cy + r * 0.32} q${r * 0.11} ${r * 0.13} ${r * 0.22} 0" fill="none" stroke="${C.mouth}" stroke-width="${r * 0.045}" stroke-linecap="round"/>`;
  const body = `
  <g>
    ${[-1, 1].map((s) => `<circle cx="${cx + s * r * 0.93}" cy="${cy + r * 0.08}" r="${r * 0.2}" fill="url(#${ear})"/><circle cx="${cx + s * r * 0.95}" cy="${cy + r * 0.09}" r="${r * 0.1}" fill="#F4A9A0" opacity=".45"/>`).join("")}
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${sk})"/>
    <path d="M${cx - r * 0.08} ${cy - r * 0.93} q${r * 0.02} ${-r * 0.32} ${r * 0.3} ${-r * 0.22} q${-r * 0.22} ${r * 0.02} ${-r * 0.1} ${r * 0.2}" fill="none" stroke="#9A6A52" stroke-width="${r * 0.075}" stroke-linecap="round"/>
    <path d="M${cx - r * 0.3} ${cy - r * 0.86} q${r * 0.05} ${-r * 0.16} ${r * 0.18} ${-r * 0.12}" fill="none" stroke="#9A6A52" stroke-width="${r * 0.05}" stroke-linecap="round" opacity=".8"/>
    <ellipse cx="${cx - r * 0.36}" cy="${cy - r * 0.45}" rx="${r * 0.26}" ry="${r * 0.14}" fill="#fff" opacity=".35" transform="rotate(-32 ${cx - r * 0.36} ${cy - r * 0.45})"/>
    ${[-1, 1].map((s) => `<ellipse cx="${cx + s * r * 0.55}" cy="${cy + r * 0.28}" rx="${r * 0.2}" ry="${r * 0.13}" fill="#FF8FA8" opacity=".5" filter="url(#${blushF})"/>`).join("")}
    ${eyes}
    <ellipse cx="${cx}" cy="${cy + r * 0.2}" rx="${r * 0.06}" ry="${r * 0.04}" fill="#EBA588" opacity=".9"/>
    ${mouth}
  </g>`;
  return { defs, body };
}

// Swaddled body (rounded bundle) with a soft knit pattern and tiny hands.
function swaddle(cx, top, w, color = C.blue, deep = C.blueDeep, hands = true) {
  const g = id("sw");
  const p = id("dots");
  const h = w * 0.95;
  const defs = `
    <linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".18" stop-color="${color}"/><stop offset="1" stop-color="${deep}"/></linearGradient>
    <pattern id="${p}" width="${w * 0.12}" height="${w * 0.12}" patternUnits="userSpaceOnUse"><circle cx="${w * 0.06}" cy="${w * 0.06}" r="${w * 0.012}" fill="#fff" opacity=".6"/></pattern>`;
  const d = `M${cx - w * 0.42} ${top + h * 0.2} Q${cx - w * 0.5} ${top + h * 0.85} ${cx} ${top + h} Q${cx + w * 0.5} ${top + h * 0.85} ${cx + w * 0.42} ${top + h * 0.2} Q${cx} ${top - h * 0.08} ${cx - w * 0.42} ${top + h * 0.2}Z`;
  const fold = `M${cx - w * 0.4} ${top + h * 0.24} Q${cx} ${top + h * 0.52} ${cx + w * 0.4} ${top + h * 0.24}`;
  const handsSvg = hands
    ? [-1, 1].map((s) => `<ellipse cx="${cx + s * w * 0.16}" cy="${top + h * 0.33}" rx="${w * 0.085}" ry="${w * 0.07}" fill="#FFD3BC"/><ellipse cx="${cx + s * w * 0.15}" cy="${top + h * 0.31}" rx="${w * 0.04}" ry="${w * 0.025}" fill="#fff" opacity=".5"/>`).join("")
    : "";
  const body = `<path d="${d}" fill="url(#${g})"/><path d="${d}" fill="url(#${p})"/><path d="${fold}" fill="none" stroke="#fff" stroke-width="${w * 0.03}" stroke-linecap="round" opacity=".8"/>${handsSvg}`;
  return { defs, body };
}

function teddy(cx, cy, s, bow = C.pinkDeep) {
  const fur = id("fur");
  const muz = id("muz");
  const defs = `
    <radialGradient id="${fur}" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#F7DABB"/><stop offset=".6" stop-color="#E9BB8E"/><stop offset="1" stop-color="#CF9568"/></radialGradient>
    <radialGradient id="${muz}" cx="45%" cy="35%" r="70%"><stop offset="0" stop-color="#FFF6EC"/><stop offset="1" stop-color="#F3D9BE"/></radialGradient>`;
  const body = `
  <g>
    <ellipse cx="${cx}" cy="${cy + s * 1.05}" rx="${s * 0.72}" ry="${s * 0.78}" fill="url(#${fur})"/>
    <ellipse cx="${cx}" cy="${cy + s * 1.12}" rx="${s * 0.42}" ry="${s * 0.48}" fill="url(#${muz})" opacity=".9"/>
    ${heart(cx, cy + s * 1.08, s * 0.16, C.pinkDeep, 0.85)}
    ${[-1, 1].map((k) => `<ellipse cx="${cx + k * s * 0.7}" cy="${cy + s * 0.95}" rx="${s * 0.22}" ry="${s * 0.36}" fill="url(#${fur})" transform="rotate(${k * -25} ${cx + k * s * 0.7} ${cy + s * 0.95})"/>`).join("")}
    ${[-1, 1].map((k) => `<ellipse cx="${cx + k * s * 0.42}" cy="${cy + s * 1.72}" rx="${s * 0.3}" ry="${s * 0.22}" fill="url(#${fur})"/><ellipse cx="${cx + k * s * 0.42}" cy="${cy + s * 1.74}" rx="${s * 0.16}" ry="${s * 0.12}" fill="url(#${muz})"/>`).join("")}
    ${[-1, 1].map((k) => `<circle cx="${cx + k * s * 0.5}" cy="${cy - s * 0.42}" r="${s * 0.26}" fill="url(#${fur})"/><circle cx="${cx + k * s * 0.5}" cy="${cy - s * 0.42}" r="${s * 0.14}" fill="#F7C9C0"/>`).join("")}
    <circle cx="${cx}" cy="${cy}" r="${s * 0.62}" fill="url(#${fur})"/>
    <ellipse cx="${cx}" cy="${cy + s * 0.2}" rx="${s * 0.3}" ry="${s * 0.23}" fill="url(#${muz})"/>
    <ellipse cx="${cx}" cy="${cy + s * 0.1}" rx="${s * 0.1}" ry="${s * 0.07}" fill="${C.ink}"/>
    <path d="M${cx} ${cy + s * 0.16} v${s * 0.07} M${cx - s * 0.09} ${cy + s * 0.25} q${s * 0.09} ${s * 0.08} ${s * 0.18} 0" fill="none" stroke="${C.ink}" stroke-width="${s * 0.035}" stroke-linecap="round"/>
    ${[-1, 1].map((k) => `<circle cx="${cx + k * s * 0.24}" cy="${cy - s * 0.08}" r="${s * 0.075}" fill="${C.ink}"/><circle cx="${cx + k * s * 0.24 - s * 0.025}" cy="${cy - s * 0.105}" r="${s * 0.025}" fill="#fff"/>`).join("")}
    ${[-1, 1].map((k) => `<ellipse cx="${cx + k * s * 0.4}" cy="${cy + s * 0.15}" rx="${s * 0.1}" ry="${s * 0.06}" fill="#FF9FB0" opacity=".45"/>`).join("")}
    <ellipse cx="${cx - s * 0.2}" cy="${cy - s * 0.32}" rx="${s * 0.18}" ry="${s * 0.09}" fill="#fff" opacity=".3" transform="rotate(-25 ${cx - s * 0.2} ${cy - s * 0.32})"/>
    <g transform="translate(${cx} ${cy + s * 0.6})">
      <path d="M0 0 L${-s * 0.3} ${-s * 0.14} Q${-s * 0.36} 0 ${-s * 0.3} ${s * 0.14}Z" fill="${bow}"/>
      <path d="M0 0 L${s * 0.3} ${-s * 0.14} Q${s * 0.36} 0 ${s * 0.3} ${s * 0.14}Z" fill="${bow}"/>
      <circle r="${s * 0.08}" fill="#FF7FA0"/>
    </g>
  </g>`;
  return { defs, body };
}

function balloonSvg(color, deep, w = 120) {
  const g = id("bl");
  const h = w * 1.25;
  const defs = `<radialGradient id="${g}" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".18" stop-color="${color}"/><stop offset=".85" stop-color="${deep}"/><stop offset="1" stop-color="${deep}"/></radialGradient>`;
  const cx = w / 2;
  const body = `
    <path d="M${cx} ${h * 0.78} C${cx - w * 0.03} ${h * 0.95} ${cx + w * 0.08} ${h * 1.1} ${cx - w * 0.02} ${h * 1.3}" fill="none" stroke="#B9A9C9" stroke-width="2" stroke-linecap="round"/>
    <path d="M${cx} ${h * 0.02} C${w * 0.95} ${h * 0.02} ${w * 1.02} ${h * 0.5} ${cx} ${h * 0.76} C${-w * 0.02} ${h * 0.5} ${w * 0.05} ${h * 0.02} ${cx} ${h * 0.02}Z" fill="url(#${g})"/>
    <path d="M${cx - w * 0.06} ${h * 0.8} L${cx + w * 0.06} ${h * 0.8} L${cx} ${h * 0.75}Z" fill="${deep}"/>
    <ellipse cx="${w * 0.33}" cy="${h * 0.2}" rx="${w * 0.08}" ry="${h * 0.12}" fill="#fff" opacity=".55" transform="rotate(-22 ${w * 0.33} ${h * 0.2})"/>`;
  return svg(w, Math.round(h * 1.32), body, defs);
}

function write(name, content) {
  fs.writeFileSync(path.join(OUT, name), content);
  console.log("wrote", name, `${(content.length / 1024).toFixed(1)} KB`);
}

// ---------- baby-hero.svg : baby in a cloud cradle ----------
{
  uid = 0;
  const W = 440, H = 492;
  const sh = id("sh");
  const back = cloud(40, 210, 360, { top: "#F4EEFF", bottom: "#DCCFFF", shine: false, puffs: [[0.12, 0.6, 0.16], [0.3, 0.32, 0.22], [0.7, 0.3, 0.24], [0.9, 0.58, 0.16], [0.5, 0.5, 0.3]] });
  const sw = swaddle(220, 192, 190, C.blue, C.blueDeep);
  const head = babyHead(220, 150, 82, "awake");
  const front = cloud(30, 252, 380, { top: "#FFFFFF", bottom: "#E9E4FF", filter: sh, puffs: [[0.1, 0.62, 0.15], [0.27, 0.42, 0.2], [0.47, 0.34, 0.22], [0.68, 0.38, 0.21], [0.88, 0.6, 0.15], [0.5, 0.75, 0.22]] });
  const bowG = id("bow");
  const defs = `${softShadow(sh, "#8F7BC8", 0.3, 14, 14)}${back.defs}${sw.defs}${head.defs}${front.defs}
    <linearGradient id="${bowG}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD3E1"/><stop offset="1" stop-color="${C.pinkDeep}"/></linearGradient>`;
  const body = `
  <ellipse cx="220" cy="474" rx="160" ry="13" fill="#B8A6E8" opacity=".22"/>
  ${back.body}
  ${sw.body}
  ${head.body}
  ${front.body}
  <g transform="translate(220 318)">
    <path d="M0 0 C-20 -18 -46 -14 -44 2 C-42 18 -18 14 0 0Z" fill="url(#${bowG})"/>
    <path d="M0 0 C20 -18 46 -14 44 2 C42 18 18 14 0 0Z" fill="url(#${bowG})"/>
    <path d="M-4 2 L-16 26 M4 2 L16 26" stroke="${C.pinkDeep}" stroke-width="6" stroke-linecap="round"/>
    <circle r="8" fill="#FF8FB0"/>
  </g>
  ${star(70, 120, 14)}${star(378, 96, 11, C.yellow)}${star(395, 205, 8, C.pink)}${star(48, 210, 7, C.lavenderDeep)}
  ${sparkle(110, 60, 10)}${sparkle(340, 40, 8)}${sparkle(392, 150, 6, C.yellow)}
  ${heart(330, 300, 10, C.pinkDeep, 0.8)}${heart(96, 300, 8, C.lavenderDeep, 0.7)}`;
  write("baby-hero.svg", svg(W, H, body, defs));
}

// ---------- baby-peek.svg : baby peeking over a cloud (reveal card) ----------
{
  uid = 0;
  const W = 300, H = 286;
  const head = babyHead(150, 112, 62, "giggle");
  const sw = swaddle(150, 150, 120, C.pink, C.pinkDeep, false);
  const front = cloud(20, 150, 260, { top: "#FFFFFF", bottom: "#EDE6FF", puffs: [[0.12, 0.6, 0.15], [0.3, 0.38, 0.2], [0.52, 0.32, 0.22], [0.72, 0.4, 0.2], [0.9, 0.62, 0.14]] });
  const body = `${sw.body}${head.body}${front.body}${star(42, 70, 11)}${star(262, 58, 9, C.pink)}${sparkle(240, 120, 7, C.yellow)}${sparkle(60, 128, 6)}`;
  write("baby-peek.svg", svg(W, H, body, `${head.defs}${sw.defs}${front.defs}`));
}

// ---------- teddy-bear.svg ----------
{
  uid = 0;
  const t = teddy(150, 115, 110);
  const body = `<ellipse cx="150" cy="320" rx="95" ry="10" fill="#C9A47F" opacity=".25"/>${t.body}`;
  write("teddy-bear.svg", svg(300, 340, body, t.defs));
}

// ---------- fluffy-cloud.svg ----------
{
  uid = 0;
  const c = cloud(10, 6, 300, { top: "#FFFFFF", bottom: "#ECE8FF" });
  const sb = id("sb");
  // Shadow baked into the image, so the page needs no CSS filter on moving clouds.
  const shadow = `<ellipse cx="160" cy="166" rx="118" ry="9" fill="#9C86C9" opacity=".22" filter="url(#${sb})"/>`;
  write("fluffy-cloud.svg", svg(320, 184, shadow + c.body, c.defs + blurF(sb, 5)));
}

// ---------- balloons ----------
for (const [name, col, deep] of [
  ["pink", C.pink, C.pinkDeep],
  ["blue", C.blue, C.blueDeep],
  ["yellow", C.yellow, C.yellowDeep],
  ["mint", C.mint, C.mintDeep],
  ["lavender", C.lavender, C.lavenderDeep],
]) {
  uid = 0;
  write(`pastel-balloon-${name}.svg`, balloonSvg(col, deep));
}

// ---------- gallery-1.svg : "Sweet Dreams" baby asleep on the moon ----------
{
  uid = 0;
  const W = 600, H = 600;
  const sky = id("sky"), moon = id("moon"), glow = id("glow");
  const head = babyHead(205, 368, 62, "sleep");
  const sw = swaddle(262, 368, 150, C.lavender, C.lavenderDeep, false);
  const bed = cloud(70, 360, 460, { top: "#FFFFFF", bottom: "#E3DBFF", puffs: [[0.1, 0.62, 0.14], [0.26, 0.46, 0.18], [0.46, 0.42, 0.2], [0.66, 0.44, 0.19], [0.86, 0.6, 0.14], [0.5, 0.72, 0.24]] });
  const pillow = cloud(108, 368, 150, { top: "#FFFFFF", bottom: "#F0EAFF", shine: false });
  const cl1 = { defs: "", body: "" };
  const cl2 = cloud(390, 120, 150, { top: "#FFFFFF", bottom: "#E9E2FF" });
  const mask = id("cres");
  const defs = `
    <linearGradient id="${sky}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B9B4F5"/><stop offset=".6" stop-color="#D9CCFF"/><stop offset="1" stop-color="#FCE3EE"/></linearGradient>
    <radialGradient id="${moon}" cx="40%" cy="35%" r="75%"><stop offset="0" stop-color="#FFF7D6"/><stop offset=".7" stop-color="#FFE39A"/><stop offset="1" stop-color="#F7C969"/></radialGradient>
    <radialGradient id="${glow}"><stop offset="0" stop-color="#FFF5C8" stop-opacity=".8"/><stop offset="1" stop-color="#FFF5C8" stop-opacity="0"/></radialGradient>
    <mask id="${mask}"><rect width="${W}" height="${H}" fill="#fff"/><circle cx="470" cy="128" r="78" fill="#000"/></mask>
    ${head.defs}${sw.defs}${bed.defs}${pillow.defs}${cl2.defs}`;
  const stars = [[80, 90, 9], [500, 70, 12], [540, 200, 7], [120, 230, 6], [440, 140, 5], [230, 60, 7], [60, 360, 5]].map(([x, y, r]) => star(x, y, r, "#FFF3B8")).join("") + [[170, 140, 6], [380, 100, 5], [520, 320, 6]].map(([x, y, r]) => sparkle(x, y, r)).join("");
  const body = `
  <rect width="${W}" height="${H}" fill="url(#${sky})"/>
  <circle cx="430" cy="150" r="170" fill="url(#${glow})"/>
  ${stars}
  <circle cx="430" cy="150" r="92" fill="url(#${moon})" mask="url(#${mask})"/>
  ${cl2.body}
  ${bed.body}
  <g transform="rotate(-90 262 368)">${sw.body}</g>
  ${pillow.body}
  ${head.body}
  <text x="250" y="292" font-family="Fredoka, Nunito, sans-serif" font-size="30" fill="#7B6AB8" opacity=".75" font-weight="600">z</text>
  <text x="276" y="262" font-family="Fredoka, Nunito, sans-serif" font-size="22" fill="#7B6AB8" opacity=".6" font-weight="600">z</text>
  <text x="296" y="238" font-family="Fredoka, Nunito, sans-serif" font-size="16" fill="#7B6AB8" opacity=".45" font-weight="600">z</text>`;
  write("baby-gallery-1.svg", svg(W, H, body, defs));
}

// ---------- gallery-2.svg : "Little Explorer" baby with teddy and blocks ----------
{
  uid = 0;
  const W = 600, H = 600;
  const bg = id("bg");
  const head = babyHead(250, 268, 78, "awake");
  const sw = swaddle(250, 318, 190, C.mint, C.mintDeep);
  const t = teddy(455, 300, 66, C.lavenderDeep);
  const block = (x, y, s, col, deep, letter, rot) => {
    const g = id("blk");
    return {
      defs: `<linearGradient id="${g}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${col}"/><stop offset="1" stop-color="${deep}"/></linearGradient>`,
      body: `<g transform="rotate(${rot} ${x + s / 2} ${y + s / 2})"><rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.16}" fill="url(#${g})"/><rect x="${x + s * 0.1}" y="${y + s * 0.1}" width="${s * 0.8}" height="${s * 0.8}" rx="${s * 0.12}" fill="#fff" opacity=".55"/><text x="${x + s / 2}" y="${y + s * 0.7}" text-anchor="middle" font-family="Fredoka, Nunito, sans-serif" font-weight="700" font-size="${s * 0.55}" fill="${C.ink}" opacity=".75">${letter}</text></g>`,
    };
  };
  const b1 = block(70, 470, 80, C.pink, C.pinkDeep, "A", -8);
  const b2 = block(160, 482, 74, C.blue, C.blueDeep, "B", 6);
  const b3 = block(112, 400, 72, C.yellow, C.yellowDeep, "C", 4);
  const defs = `<linearGradient id="${bg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4FBF1"/><stop offset=".65" stop-color="#FFF6EA"/><stop offset="1" stop-color="#FFE7D8"/></linearGradient>${head.defs}${sw.defs}${t.defs}${b1.defs}${b2.defs}${b3.defs}`;
  const body = `
  <rect width="${W}" height="${H}" fill="url(#${bg})"/>
  <circle cx="110" cy="110" r="60" fill="#fff" opacity=".6"/><circle cx="500" cy="90" r="40" fill="#fff" opacity=".5"/>
  ${[[60, 200, 8, C.yellowDeep], [530, 210, 9, C.pinkDeep], [380, 80, 7, C.blueDeep]].map(([x, y, r, c]) => star(x, y, r, c, 0.8)).join("")}
  ${heart(330, 140, 12, C.pinkDeep, 0.6)}${heart(180, 120, 9, C.lavenderDeep, 0.6)}
  <ellipse cx="300" cy="560" rx="260" ry="26" fill="#E8CDB7" opacity=".35"/>
  ${sw.body}${head.body}${t.body}${b3.body}${b1.body}${b2.body}`;
  write("baby-gallery-2.svg", svg(W, H, body, defs));
}

// ---------- gallery-3.svg : "Tiny Toes" footprints, rattle, hearts ----------
{
  uid = 0;
  const W = 600, H = 600;
  const bg = id("bg"), rat = id("rat"), foot = id("ft");
  const defs = `
    <linearGradient id="${bg}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE5DA"/><stop offset=".55" stop-color="#FFEAF2"/><stop offset="1" stop-color="#EDE3FF"/></linearGradient>
    <radialGradient id="${rat}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="${C.blue}"/><stop offset="1" stop-color="${C.blueDeep}"/></radialGradient>
    <radialGradient id="${foot}" cx="40%" cy="30%" r="80%"><stop offset="0" stop-color="#FFE4D6"/><stop offset="1" stop-color="#F7B9A2"/></radialGradient>`;
  const footprint = (x, y, rot, flip) => {
    const f = flip ? -1 : 1;
    return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${f} 1)">
      <path d="M0 -70 C40 -70 46 -10 34 30 C26 60 -26 64 -32 30 C-40 -10 -40 -70 0 -70Z" fill="url(#${foot})"/>
      ${[[-26, -96, 13], [-4, -104, 11], [15, -100, 10], [30, -90, 8.5], [40, -76, 7]].map(([a, b, r]) => `<circle cx="${a}" cy="${b}" r="${r}" fill="url(#${foot})"/>`).join("")}
    </g>`;
  };
  const body = `
  <rect width="${W}" height="${H}" fill="url(#${bg})"/>
  ${footprint(200, 330, -14, false)}${footprint(330, 290, 12, true)}
  <g transform="rotate(-28 450 430)">
    <rect x="438" y="440" width="24" height="120" rx="12" fill="${C.pinkDeep}"/><rect x="430" y="548" width="40" height="22" rx="11" fill="#FF8FB0"/>
    <circle cx="450" cy="410" r="62" fill="url(#${rat})"/>
    <path d="M400 400 Q450 380 500 400" fill="none" stroke="#fff" stroke-width="8" opacity=".7" stroke-linecap="round"/>
    ${star(450, 418, 16, "#fff", 0.9)}
  </g>
  ${heart(110, 120, 26, C.pinkDeep, 0.75)}${heart(500, 150, 18, C.lavenderDeep, 0.7)}${heart(90, 480, 16, "#FFB4C8", 0.8)}${heart(300, 520, 12, C.pinkDeep, 0.6)}
  ${star(470, 260, 12, C.yellowDeep, 0.85)}${star(250, 110, 9, C.yellowDeep, 0.8)}${sparkle(160, 220, 9)}${sparkle(420, 90, 8)}`;
  write("baby-gallery-3.svg", svg(W, H, body, defs));
}

// ---------- gallery-4.svg : "Hello World" baby with balloons ----------
{
  uid = 0;
  const W = 600, H = 600;
  const bg = id("bg");
  const head = babyHead(300, 330, 74, "giggle");
  const sw = swaddle(300, 376, 180, C.yellow, C.yellowDeep);
  const cl = cloud(110, 430, 380, { top: "#FFFFFF", bottom: "#E9E4FF" });
  const balloon = (x, y, col, deep, rot) => {
    const g = id("bl");
    return {
      defs: `<radialGradient id="${g}" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".2" stop-color="${col}"/><stop offset="1" stop-color="${deep}"/></radialGradient>`,
      body: `<path d="M${x} ${y + 60} Q${x + (300 - x) * 0.4} ${y + 160} 300 ${396}" fill="none" stroke="#B9A9C9" stroke-width="2.5"/><g transform="rotate(${rot} ${x} ${y})"><path d="M${x} ${y - 66} C${x + 58} ${y - 66} ${x + 62} ${y + 6} ${x} ${y + 56} C${x - 62} ${y + 6} ${x - 58} ${y - 66} ${x} ${y - 66}Z" fill="url(#${g})"/><path d="M${x - 7} ${y + 62} L${x + 7} ${y + 62} L${x} ${y + 54}Z" fill="${deep}"/><ellipse cx="${x - 20}" cy="${y - 34}" rx="9" ry="16" fill="#fff" opacity=".5" transform="rotate(-20 ${x - 20} ${y - 34})"/></g>`,
    };
  };
  const bs = [balloon(170, 120, C.pink, C.pinkDeep, -10), balloon(300, 90, C.blue, C.blueDeep, 0), balloon(430, 125, C.mint, C.mintDeep, 10)];
  const defs = `<linearGradient id="${bg}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#D7EEFF"/><stop offset="1" stop-color="#FFF4E6"/></linearGradient>${head.defs}${sw.defs}${cl.defs}${bs.map((b) => b.defs).join("")}`;
  const body = `<rect width="${W}" height="${H}" fill="url(#${bg})"/>${[[70, 80, 8], [540, 60, 9], [520, 300, 7], [80, 300, 6]].map(([x, y, r]) => star(x, y, r, C.yellowDeep, 0.8)).join("")}${bs.map((b) => b.body).join("")}${sw.body}${head.body}${cl.body}`;
  write("baby-gallery-4.svg", svg(W, H, body, defs));
}

// ---------- balloon bodies (no string) for the interactive balloons ----------
// Same shape and shading as pastel-balloon-*.svg; the page draws the string separately so it
// can fall away on its own when the balloon pops.
for (const [name, col, deep] of [
  ["pink", C.pink, C.pinkDeep],
  ["blue", C.blue, C.blueDeep],
  ["yellow", C.yellow, C.yellowDeep],
  ["mint", C.mint, C.mintDeep],
  ["lavender", C.lavender, C.lavenderDeep],
]) {
  uid = 0;
  const g = id("bl");
  const w = 120, h = 150;
  const cx = w / 2;
  const defs = `<radialGradient id="${g}" cx="35%" cy="28%" r="80%"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".18" stop-color="${col}"/><stop offset=".85" stop-color="${deep}"/><stop offset="1" stop-color="${deep}"/></radialGradient>`;
  const body = `
    <path d="M${cx} ${h * 0.02} C${w * 0.95} ${h * 0.02} ${w * 1.02} ${h * 0.5} ${cx} ${h * 0.9} C${-w * 0.02} ${h * 0.5} ${w * 0.05} ${h * 0.02} ${cx} ${h * 0.02}Z" fill="url(#${g})"/>
    <path d="M${cx - 8} ${h * 0.96} L${cx + 8} ${h * 0.96} L${cx} ${h * 0.89}Z" fill="${deep}"/>
    <ellipse cx="${w * 0.33}" cy="${h * 0.24}" rx="${w * 0.08}" ry="${h * 0.13}" fill="#fff" opacity=".55" transform="rotate(-22 ${w * 0.33} ${h * 0.24})"/>
    <ellipse cx="${w * 0.68}" cy="${h * 0.64}" rx="${w * 0.1}" ry="${h * 0.04}" fill="#fff" opacity=".18" transform="rotate(-35 ${w * 0.68} ${h * 0.64})"/>`;
  write(`balloon-body-${name}.svg`, svg(w, h, body, defs));
}

// ---------- butterflies ----------
for (const [name, a, b, c2, d] of [
  ["pink", "#FFD0DE", C.pinkDeep, "#EFE6FF", C.lavenderDeep],
  ["blue", "#DDF0FF", C.blueDeep, "#FFF2C9", C.yellowDeep],
]) {
  uid = 0;
  const g1 = id("w"), g2 = id("w");
  const defs = `<radialGradient id="${g1}" cx="30%" cy="35%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>
    <radialGradient id="${g2}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset=".4" stop-color="${c2}"/><stop offset="1" stop-color="${d}"/></radialGradient>`;
  const wing = (s) => `<g transform="translate(40 34) scale(${s} 1)">
      <path d="M0 -2 C-6 -26 -34 -32 -36 -12 C-38 4 -14 8 0 -2Z" fill="url(#${g1})"/>
      <path d="M0 2 C-12 6 -28 18 -22 30 C-16 38 -4 24 0 2Z" fill="url(#${g2})"/>
      <circle cx="-22" cy="-14" r="4" fill="#fff" opacity=".7"/></g>`;
  const body = `${wing(1)}${wing(-1)}<rect x="37.5" y="18" width="5" height="34" rx="2.5" fill="${C.ink}"/><path d="M39 19 Q34 8 30 6 M41 19 Q46 8 50 6" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round"/>`;
  write(`butterfly-${name}.svg`, svg(80, 70, body, defs));
}

// ---------- stars & hearts ----------
for (const [name, col] of [["gold", C.yellowDeep], ["pink", C.pinkDeep], ["lavender", C.lavenderDeep], ["blue", C.blueDeep]]) {
  uid = 0;
  const g = id("st");
  const defs = `<radialGradient id="${g}" cx="38%" cy="32%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${col}"/><stop offset="1" stop-color="${col}"/></radialGradient>`;
  write(`star-${name}.svg`, svg(48, 48, star(24, 25, 19, `url(#${g})`), defs));
}
for (const [name, col] of [["pink", C.pinkDeep], ["lavender", C.lavenderDeep]]) {
  uid = 0;
  const g = id("hz");
  const defs = `<radialGradient id="${g}" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${col}"/><stop offset="1" stop-color="${col}"/></radialGradient>`;
  write(`heart-${name}.svg`, svg(48, 48, heart(24, 26, 17, `url(#${g})`), defs));
}

// ---------- small decorative pieces ----------
{
  uid = 0;
  const petals = (cx, cy, r, col, deep) => {
    const g = id("pt");
    const d = `<radialGradient id="${g}" cx="50%" cy="80%" r="80%"><stop offset="0" stop-color="${deep}"/><stop offset="1" stop-color="${col}"/></radialGradient>`;
    const b = [0, 72, 144, 216, 288].map((a) => `<ellipse cx="${cx}" cy="${cy - r * 0.55}" rx="${r * 0.36}" ry="${r * 0.55}" fill="url(#${g})" transform="rotate(${a} ${cx} ${cy})"/>`).join("") + `<circle cx="${cx}" cy="${cy}" r="${r * 0.28}" fill="${C.yellowDeep}"/><circle cx="${cx - r * 0.08}" cy="${cy - r * 0.08}" r="${r * 0.09}" fill="#fff" opacity=".7"/>`;
    return { d, b };
  };
  const f1 = petals(60, 60, 50, "#FFE1EA", C.pinkDeep);
  const leaf = `<path d="M60 112 Q30 140 10 130 Q30 100 60 112Z" fill="${C.mintDeep}"/><path d="M60 112 Q92 138 112 126 Q90 98 60 112Z" fill="${C.mint}"/>`;
  write("flower-pink.svg", svg(120, 140, `${leaf}${f1.b}`, f1.d));
  uid = 0;
  const f2 = petals(60, 60, 50, "#EFE6FF", C.lavenderDeep);
  write("flower-lavender.svg", svg(120, 140, `${leaf}${f2.b}`, f2.d));
}
