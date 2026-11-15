import fs from "node:fs/promises";
import path from "node:path";
import puppeteer from "puppeteer-core";
import { extractLottie, metaFromJson } from "./lottie-util.mjs";

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const CANDIDATES = "scripts/candidates.json";
const OUTROOT = "lottie";
const LOG = "scripts/capture-log.json";
const LIMIT_PER_KEYWORD = Number(process.env.LIMIT || 5);
const HEADLESS = process.env.HEADED !== "1";
const NAV_TIMEOUT = 45000;
const ASSET_WAIT = 22000;
const DELAY_MS = 1800;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

const ASSET_RE = /\.(json|lottie)(\?|$)/i;
const ASSET_HOST_RE = /(^|\.)(assets[^.]*\.lottiefiles\.com|lottie\.host)$/i;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const slugToId = (slug) => slug?.match(/-([A-Za-z0-9]{8,12})$/)?.[1] ?? null;
const safeName = (s) => s.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

const candidates = JSON.parse(await fs.readFile(CANDIDATES, "utf8"));
const manifestPath = "manifest.json";
let manifest = [];
if (await exists(manifestPath)) {
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, "utf8"));
  } catch {}
}
const manifestBySlug = new Map(manifest.map((m) => [m.slug, m]));

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: HEADLESS ? "new" : false,
  args: [
    "--disable-blink-features=AutomationControlled",
    "--no-first-run",
    "--no-default-browser-check",
    "--lang=en-US",
    "--window-size=1440,900",
  ],
  defaultViewport: { width: 1440, height: 900 },
});

const httpFailures = [];

async function downloadAsset(url, referer) {
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      accept: "*/*",
      "accept-language": "en-US,en;q=0.9",
      referer,
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`asset fetch ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

async function captureOne(keyword, cand) {
  const id = cand.id || slugToId(cand.slug);
  const slug = cand.slug;
  const dir = path.join(OUTROOT, safeName(keyword));
  await fs.mkdir(dir, { recursive: true });

  if (manifestBySlug.has(slug)) {
    return { ...manifestBySlug.get(slug), keyword, reused: true };
  }

  const page = await browser.newPage();
  await page.setUserAgent(UA);
  await page.setCacheEnabled(false);
  await page.setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });

  const found = [];
  page.on("response", (res) => {
    try {
      const url = res.url();
      if (!ASSET_RE.test(url)) return;
      const host = new URL(url).hostname;
      if (!ASSET_HOST_RE.test(host)) return;
      if (found.some((f) => f.url === url)) return;
      const status = res.status();
      const headers = res.headers();
      found.push({
        url,
        status,
        headers,
        size: Number(headers["content-length"] || 0),
        response: res,
      });
      if (status !== 200) httpFailures.push({ slug, url, status });
    } catch {}
  });

  const result = {
    keyword,
    slug,
    id,
    title: null,
    url: cand.url,
    assetUrl: null,
    file: null,
    bytes: 0,
    format: null,
    fps: null,
    frames: null,
    duration: null,
    width: null,
    height: null,
    license: "Lottie Simple License (free, commercial use allowed)",
    premium: false,
    capturedAt: new Date().toISOString(),
  };

  let bodyText = "";
  try {
    const resp = await page.goto(cand.url, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT });
    if (resp && resp.status() >= 400) result.httpStatus = resp.status();

    const start = Date.now();
    while (
      Date.now() - start < ASSET_WAIT &&
      found.filter((f) => f.status === 200).length === 0
    ) {
      await sleep(500);
    }

    try {
      result.title = await page.title();
      bodyText = (await page.evaluate(() => document.body?.innerText || "")).toLowerCase();
    } catch {}

    result.premium = /premium license|buy now|add to cart|purchase this/.test(bodyText);
    if (!result.premium && bodyText.split(/\s+/).slice(0, 40).join(" ").includes("pro")) {
      result.premiumMaybe = true;
    }

    const assets = found
      .filter((f) => f.status === 200)
      .sort((a, b) => b.size - a.size);
    if (assets.length === 0) {
      result.error = "no asset captured";
      return result;
    }

    let pick = null;
    let buf = null;
    for (const asset of assets) {
      try {
        const b = await downloadAsset(asset.url, cand.url);
        if (b && b.length >= 200) {
          pick = asset;
          buf = b;
          break;
        }
      } catch {}
    }
    if (!buf) {
      for (const asset of assets) {
        try {
          const b = await asset.response.buffer();
          if (b && b.length >= 200) {
            pick = asset;
            buf = b;
            break;
          }
        } catch {}
      }
    }
    if (!buf) {
      result.error = "no asset body";
      return result;
    }

    const base = safeName(slug);
    const isZip = buf[0] === 0x50 && buf[1] === 0x4b;

    let jsonBuf = buf;
    if (isZip) {
      const container = path.join(dir, `${base}.lottie`);
      await fs.writeFile(container, buf);
      result.containerFile = path.relative(process.cwd(), container);
      result.containerBytes = buf.length;
      const ex = extractLottie(buf);
      if (!ex) throw new Error("could not extract JSON from .lottie");
      jsonBuf = Buffer.from(ex.jsonText);
      result.inlinedAssets = ex.inlinedAssets;
      result.innerName = ex.innerName;
    }

    const file = path.join(dir, `${base}.json`);
    await fs.writeFile(file, jsonBuf);

    result.assetUrl = pick.url;
    result.file = path.relative(process.cwd(), file);
    result.bytes = jsonBuf.length;
    result.format = "json";

    try {
      const json = JSON.parse(jsonBuf.toString("utf8"));
      Object.assign(result, metaFromJson(json));
    } catch (e) {
      result.valid = false;
      result.error = "json parse failed: " + e.message;
    }
  } catch (e) {
    result.error = String(e.message || e);
  } finally {
    await page.close().catch(() => {});
  }
  return result;
}

const only = (process.env.ONLY_SLUGS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const all = [];
for (const [keyword, list] of Object.entries(candidates)) {
  let count = 0;
  console.log(`\n=== ${keyword} ===`);
  for (const cand of list) {
    if (count >= LIMIT_PER_KEYWORD) break;
    if (only.length && !only.includes(cand.slug)) continue;
    const res = await captureOne(keyword, cand);
    const ok = res.assetUrl && !res.premium && res.valid !== false && !res.error;
    console.log(
      `${ok ? "OK  " : "SKIP"} ${cand.slug}${res.bytes ? ` ${res.bytes}b` : ""}${
        res.fps ? ` ${res.fps}fps ${res.duration}s` : ""
      }${res.premium ? " [premium]" : ""}${res.error ? " (" + res.error + ")" : ""}`
    );
    if (res.assetUrl) all.push(res);
    if (ok) {
      count++;
      if (!manifestBySlug.has(res.slug)) {
        manifest.push(res);
        manifestBySlug.set(res.slug, res);
      }
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    }
    await sleep(DELAY_MS);
  }
}

await browser.close();
await fs.writeFile(LOG, JSON.stringify({ results: all, httpFailures }, null, 2));
console.log(`\nCaptured ${manifest.filter((m) => m.assetUrl).length} animation(s) total.`);
