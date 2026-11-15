import fs from "node:fs/promises";

const INDEX = "https://lottiefiles.com/sitemap/free-animations-index.xml";
const OUT = "scripts/candidates.json";

const KEYWORDS = {
  "paint brush stroke": {
    primary: ["brush", "paint"],
    secondary: ["stroke", "painting", "paintbrush"],
  },
  "gold shimmer": {
    primary: ["shimmer", "glitter", "foil"],
    secondary: ["gold", "shine", "metallic"],
  },
  sparkle: {
    primary: ["sparkle", "sparkles", "twinkle", "glint"],
    secondary: ["star", "magic"],
  },
  "ink splash": {
    primary: ["ink", "inkblot", "calligraphy"],
    secondary: ["splash", "splatter", "blot", "drop", "paint"],
  },
  "elegant text reveal": {
    primary: ["reveal", "typewriter"],
    secondary: ["text", "typography", "letter"],
  },
  "gold confetti": {
    primary: ["confetti"],
    secondary: ["gold", "celebration", "milestone"],
  },
};

const COLLECT = 60;
const OUTPUT = 8;

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

async function pool(items, size, worker) {
  let i = 0;
  await Promise.all(
    Array.from({ length: size }, async () => {
      while (i < items.length) await worker(items[i++]);
    })
  );
}

const CACHE = "scripts/all-free-urls.txt";
let urls;
try {
  const cached = (await fs.readFile(CACHE, "utf8")).split("\n").filter(Boolean);
  urls = new Set(cached);
  console.log(`cached urls: ${urls.size}`);
} catch {
  const indexXml = await fetchText(INDEX);
  const maps = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  console.log(`sitemaps: ${maps.length}`);
  urls = new Set();
  await pool(maps, 6, async (map) => {
    const xml = await fetchText(map);
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const u = m[1].trim();
      if (u.includes("/free-animation/")) urls.add(u);
    }
  });
  await fs.writeFile(CACHE, [...urls].join("\n"));
}

const word = (slug, w) => new RegExp(`(?:^|-)${w}(?:-|$)`, "i").test(slug);

const byKeyword = {};
for (const key of Object.keys(KEYWORDS)) byKeyword[key] = [];

for (const url of urls) {
  const slug = url.split("/free-animation/")[1];
  if (!slug) continue;
  const id = slug.match(/-([A-Za-z0-9]{8,12})$/)?.[1] ?? null;

  for (const [key, { primary, secondary }] of Object.entries(KEYWORDS)) {
    if (byKeyword[key].length >= COLLECT) continue;
    let score = 0;
    let hits = 0;
    let primaryHits = 0;
    for (const w of primary) if (word(slug, w)) { score += 10; hits++; primaryHits++; }
    for (const w of secondary) if (word(slug, w)) { score += 2; hits++; }
    if (primaryHits === 0) continue;
    score += hits;
    byKeyword[key].push({ slug, id, url, score });
  }
}

for (const key of Object.keys(byKeyword)) {
  const list = byKeyword[key];
  const seen = new Set();
  const ranked = list
    .filter((c) => (seen.has(c.slug) ? false : seen.add(c.slug)))
    .sort((a, b) => b.score - a.score)
    .slice(0, OUTPUT);
  byKeyword[key] = ranked;
}

await fs.writeFile(OUT, JSON.stringify(byKeyword, null, 2));
for (const [k, v] of Object.entries(byKeyword)) {
  console.log(`\n[${k}] ${v.length}`);
  for (const c of v) console.log(`  ${String(c.score).padStart(2)}  ${c.slug}`);
}
console.log(`\ntotal free urls scanned: ${urls.size}`);
