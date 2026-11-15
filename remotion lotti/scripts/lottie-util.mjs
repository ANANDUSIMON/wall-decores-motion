import { unzipSync, strFromU8 } from "fflate";

const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

const isLottieZip = (buf) => buf.length > 4 && buf[0] === 0x50 && buf[1] === 0x4b;

function inlineAssets(json, files) {
  if (!Array.isArray(json.assets)) return 0;
  let inlined = 0;
  for (const asset of json.assets) {
    if (!asset || !asset.p || typeof asset.p !== "string") continue;
    if (asset.p.startsWith("data:")) continue;
    const name = asset.p.split(/[\\/]/).pop();
    const entry = Object.keys(files).find(
      (n) => n === asset.p || n.endsWith("/" + asset.p) || n.split(/[\\/]/).pop() === name
    );
    if (!entry) continue;
    const ext = "." + entry.split(".").pop().toLowerCase();
    const mime = MIME[ext] || "application/octet-stream";
    const b64 = Buffer.from(files[entry]).toString("base64");
    asset.e = 1;
    asset.u = "";
    asset.p = `data:${mime};base64,${b64}`;
    inlined++;
  }
  return inlined;
}

export function extractLottie(buf) {
  if (!isLottieZip(buf)) return null;
  const files = unzipSync(new Uint8Array(buf));
  const names = Object.keys(files);
  const manifestName = names.find((n) => /(^|\/)manifest\.json$/i.test(n));
  let manifest = null;
  if (manifestName) {
    try {
      manifest = JSON.parse(strFromU8(files[manifestName]));
    } catch {}
  }

  const animNames = names.filter(
    (n) => n.toLowerCase().endsWith(".json") && n !== manifestName
  );
  let chosen = null;
  const ids = (manifest?.animations || []).map((a) => a?.id).filter(Boolean);
  for (const id of ids) {
    const hit = animNames.find((n) => n.includes(id));
    if (hit) {
      chosen = hit;
      break;
    }
  }
  if (!chosen) {
    chosen = animNames.sort((a, b) => files[b].length - files[a].length)[0];
  }
  if (!chosen) return null;

  const json = JSON.parse(strFromU8(files[chosen]));
  const inlined = inlineAssets(json, files);
  return {
    json,
    jsonText: JSON.stringify(json),
    innerName: chosen,
    manifest,
    inlinedAssets: inlined,
  };
}

export function metaFromJson(json) {
  const fps = json?.fr ?? null;
  const frames = json?.ip != null && json?.op != null ? json.op - json.ip : null;
  return {
    fps,
    frames,
    duration: fps && frames != null ? +(frames / fps).toFixed(3) : null,
    width: json?.w ?? null,
    height: json?.h ?? null,
    layers: Array.isArray(json?.layers) ? json.layers.length : 0,
    valid: Array.isArray(json?.layers) && json.layers.length > 0,
  };
}
