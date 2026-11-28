/**
 * Self-hosted voiceover generation with Kokoro-82M (runs locally, no API key).
 * Replaces ElevenLabs for voice only — music/SFX still come from ElevenLabs.
 *
 * Usage:
 *   node scripts/voiceover/generate.mjs --text "Line to speak" --voice af_heart
 *   node scripts/voiceover/generate.mjs --file script.txt --voice bm_george --out public/audio/voiceover.wav
 *   node scripts/voiceover/generate.mjs --file script.txt --raw   # skip mastering
 */
import { parseArgs } from "node:util";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { KokoroTTS, TextSplitterStream } from "kokoro-js";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

// Gentle voice-over mastering: tame the sub-80Hz rumble, knock down the
// 9kHz sibilance Kokoro tends to add, even out levels, add a touch of room
// warmth, then bring loudness to a broadcast-ish -16 LUFS.
const MASTER_FILTER = [
  "highpass=f=80",
  "equalizer=f=9000:t=q:w=1:g=-3",
  "acompressor=threshold=-18dB:ratio=2:attack=5:release=150",
  "aecho=0.8:0.9:40:0.15",
  "loudnorm=I=-16:TP=-1.5:LRA=11",
].join(",");

const { values } = parseArgs({
  options: {
    text: { type: "string" },
    file: { type: "string" },
    voice: { type: "string", default: "af_heart" },
    out: { type: "string", default: "public/audio/voiceover.wav" },
    raw: { type: "boolean", default: false },
  },
});

if (!values.text && !values.file) {
  console.error("Provide --text \"...\" or --file <path>");
  process.exit(1);
}

const script = values.text ?? fs.readFileSync(values.file, "utf-8");

console.log(`Loading ${MODEL_ID} (dtype=fp32, device=cpu)...`);
const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
  dtype: "fp32",
  device: "cpu",
});

// TextSplitterStream breaks the script into sentence-sized chunks so pacing
// (pauses, intonation) stays natural instead of synthesizing one long run.
const splitter = new TextSplitterStream();
splitter.push(script);
splitter.close();

const chunks = [];
let samplingRate = null;
for await (const { text, audio } of tts.stream(splitter, { voice: values.voice })) {
  console.log(`  "${text}"`);
  chunks.push(audio.audio);
  samplingRate ??= audio.sampling_rate;
}

const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
const combined = new Float32Array(totalLength);
let offset = 0;
for (const chunk of chunks) {
  combined.set(chunk, offset);
  offset += chunk.length;
}

const { RawAudio } = await import("@huggingface/transformers");
const outPath = path.resolve(values.out);
fs.mkdirSync(path.dirname(outPath), { recursive: true });

if (values.raw) {
  await new RawAudio(combined, samplingRate).save(outPath);
  console.log(`Saved ${outPath} (voice=${values.voice}, ${(totalLength / samplingRate).toFixed(2)}s, unmastered)`);
} else {
  const rawPath = outPath.replace(/\.wav$/i, ".raw.wav");
  await new RawAudio(combined, samplingRate).save(rawPath);

  // loudnorm oversamples internally for true-peak detection; without -ar
  // pinning the output, that oversampled rate (e.g. 192kHz) leaks through.
  execFileSync(
    "ffmpeg",
    ["-y", "-i", rawPath, "-af", MASTER_FILTER, "-ar", String(samplingRate), outPath],
    { stdio: "inherit" },
  );

  console.log(`Saved ${outPath} (voice=${values.voice}, ${(totalLength / samplingRate).toFixed(2)}s, mastered)`);
  console.log(`Raw file kept alongside for A/B comparison: ${rawPath}`);
}
