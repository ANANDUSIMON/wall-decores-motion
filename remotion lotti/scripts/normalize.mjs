import fs from "node:fs/promises";
import path from "node:path";
import { extractLottie, metaFromJson } from "./lottie-util.mjs";

const MANIFEST = "manifest.json";
const manifest = JSON.parse(await fs.readFile(MANIFEST, "utf8"));

let done = 0;
for (const entry of manifest) {
  const file = entry.file;
  if (!file || !file.toLowerCase().endsWith(".lottie")) continue;
  let buf;
  try {
    buf = await fs.readFile(file);
  } catch {
    continue;
  }
  const ex = extractLottie(buf);
  if (!ex) {
    console.log(`skip (not a zip): ${file}`);
    continue;
  }
  const jsonFile = file.replace(/\.lottie$/i, ".json");
  await fs.writeFile(jsonFile, Buffer.from(ex.jsonText));
  entry.containerFile = file;
  entry.containerBytes = buf.length;
  entry.file = jsonFile;
  entry.format = "json";
  entry.bytes = Buffer.byteLength(ex.jsonText);
  entry.inlinedAssets = ex.inlinedAssets;
  entry.innerName = ex.innerName;
  Object.assign(entry, metaFromJson(ex.json));
  done++;
  console.log(`extracted ${jsonFile} (${entry.fps}fps, ${entry.duration}s, ${entry.width}x${entry.height})`);
}

await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`\nnormalized ${done} file(s)`);
