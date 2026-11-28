/**
 * Self-hosted voiceover generation with Kokoro-82M v2 (runs locally, no API key).
 * Replaces ElevenLabs for voice only — music/SFX still come from ElevenLabs.
 *
 * Usage:
 *   node scripts/voiceover/generate.mjs --text "Line to speak" --voice af_heart
 *   node scripts/voiceover/generate.mjs --file script.txt --voice bm_george --preset broadcast
 *   node scripts/voiceover/generate.mjs --file script.txt --voice af_heart --voice2 af_bella --blend 0.3
 *   node scripts/voiceover/generate.mjs --file script.txt --raw   # skip mastering
 */
import { parseArgs } from "node:util";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { KokoroTTS, TextSplitterStream } from "kokoro-js";

const MODEL_ID = "onnx-community/Kokoro-82M-v1.0-ONNX";

// Below this, loudnorm's own LRA target didn't just fail to apply fully, the
// clip is actually audibly flat/compressed into a single level.
const MIN_ACCEPTABLE_LRA_DB = 4;

const NATURAL_EQ = [
  "highpass=f=65:poles=2",
  "equalizer=f=4500:t=q:w=1.2:g=-2",
  "equalizer=f=220:t=q:w=0.8:g=1.5",
  "highshelf=f=10000:g=1",
];

const PRESETS = {
  natural: {
    eq: NATURAL_EQ,
    compressor: "acompressor=threshold=-12dB:ratio=1.5:attack=20:release=300:knee=6dB",
    echo: "aecho=0.8:0.88:15|25:0.12|0.08",
    loudnorm: "loudnorm=I=-16:TP=-1.5:LRA=7",
  },
  // Deeper low-mid warmth, rolled-off highs.
  warm: {
    eq: [
      "highpass=f=65:poles=2",
      "equalizer=f=4500:t=q:w=1.2:g=-2",
      "equalizer=f=200:t=q:w=0.8:g=2.5",
      "highshelf=f=8000:g=-1",
    ],
    compressor: "acompressor=threshold=-12dB:ratio=1.5:attack=20:release=300:knee=6dB",
    echo: "aecho=0.8:0.88:15|25:0.12|0.08",
    loudnorm: "loudnorm=I=-16:TP=-1.5:LRA=7",
  },
  // Presence boost and extra air instead of the de-essing dip.
  bright: {
    eq: [
      "highpass=f=65:poles=2",
      "equalizer=f=3000:t=q:w=1.2:g=2",
      "equalizer=f=6000:t=q:w=1.2:g=1",
      "highshelf=f=10000:g=2",
    ],
    compressor: "acompressor=threshold=-12dB:ratio=1.5:attack=20:release=300:knee=6dB",
    echo: "aecho=0.8:0.88:15|25:0.12|0.08",
    loudnorm: "loudnorm=I=-16:TP=-1.5:LRA=7",
  },
  // Tighter dynamics, no room echo, narrower loudness range.
  broadcast: {
    eq: NATURAL_EQ,
    compressor: "acompressor=threshold=-15dB:ratio=2:attack=20:release=300:knee=6dB",
    echo: null,
    loudnorm: "loudnorm=I=-16:TP=-1.5:LRA=5",
  },
};

function buildFilterChain(presetName) {
  const preset = PRESETS[presetName];
  if (!preset) {
    throw new Error(`Unknown --preset "${presetName}". Choose from: ${Object.keys(PRESETS).join(", ")}`);
  }
  return [...preset.eq, preset.compressor, ...(preset.echo ? [preset.echo] : []), preset.loudnorm].join(",");
}

function measureLoudness(file) {
  // Analysis-only loudnorm pass: feeding it back its own I/TP/LRA target
  // doesn't matter here — the "input_*" fields it prints are the *measured*
  // stats of the file as given, before any further normalization.
  const result = spawnSync(
    "ffmpeg",
    ["-i", file, "-af", "loudnorm=I=-16:TP=-1.5:LRA=7:print_format=json", "-f", "null", "-"],
    { encoding: "utf-8" },
  );
  const match = (result.stderr || "").match(/\{[\s\S]*\}/);
  return match ? JSON.parse(match[0]) : null;
}

const { values } = parseArgs({
  options: {
    text: { type: "string" },
    file: { type: "string" },
    voice: { type: "string", default: "af_heart" },
    voice2: { type: "string" },
    blend: { type: "string", default: "0.5" },
    speed: { type: "string", default: "0.94" },
    out: { type: "string", default: "public/audio/voiceover.wav" },
    raw: { type: "boolean", default: false },
    preset: { type: "string", default: "natural" },
  },
});

if (!values.text && !values.file) {
  console.error('Provide --text "..." or --file <path>');
  process.exit(1);
}

const script = values.text ?? fs.readFileSync(values.file, "utf-8");
const speed = Number(values.speed);
const blend = Number(values.blend);

console.log(`Loading ${MODEL_ID} (dtype=fp32, device=cpu)...`);
const tts = await KokoroTTS.from_pretrained(MODEL_ID, {
  dtype: "fp32",
  device: "cpu",
});

async function synthesize(voice) {
  const splitter = new TextSplitterStream();
  splitter.push(script);
  splitter.close();

  const chunks = [];
  let samplingRate = null;
  // TextSplitterStream breaks the script into sentence-sized chunks so
  // pacing (pauses, intonation) stays natural instead of one long run.
  for await (const { text, audio } of tts.stream(splitter, { voice, speed })) {
    console.log(`  [${voice}] "${text}"`);
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
  return { samples: combined, samplingRate };
}

const { RawAudio } = await import("@huggingface/transformers");
const outPath = path.resolve(values.out);
fs.mkdirSync(path.dirname(outPath), { recursive: true });

const primary = await synthesize(values.voice);
// The file mastering reads from: either the final --raw output, or an
// intermediate kept alongside the mastered file for A/B comparison.
const rawTarget = values.raw ? outPath : outPath.replace(/\.wav$/i, ".raw.wav");

if (values.voice2) {
  const secondary = await synthesize(values.voice2);
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "kokoro-blend-"));
  const tmp1 = path.join(tmpDir, "voice1.wav");
  const tmp2 = path.join(tmpDir, "voice2.wav");
  await new RawAudio(primary.samples, primary.samplingRate).save(tmp1);
  await new RawAudio(secondary.samples, secondary.samplingRate).save(tmp2);

  const weight1 = 1 - blend;
  const weight2 = blend;
  console.log(`Blending ${values.voice} (${weight1.toFixed(2)}) + ${values.voice2} (${weight2.toFixed(2)}) via ffmpeg amix...`);
  execFileSync(
    "ffmpeg",
    [
      "-y", "-i", tmp1, "-i", tmp2,
      "-filter_complex", `amix=inputs=2:duration=longest:dropout_transition=0:weights=${weight1} ${weight2}`,
      "-ar", String(primary.samplingRate),
      rawTarget,
    ],
    { stdio: "inherit" },
  );
  fs.rmSync(tmpDir, { recursive: true, force: true });
} else {
  await new RawAudio(primary.samples, primary.samplingRate).save(rawTarget);
}

if (values.raw) {
  console.log(`Saved ${rawTarget} (unmastered)`);
} else {
  const filterChain = buildFilterChain(values.preset);

  // -ar is an OUTPUT flag here, not an `aresample` filter stage: aresample
  // inside the -af chain conflicts with loudnorm's internal true-peak
  // oversampling and the output silently comes out at 192kHz instead.
  execFileSync(
    "ffmpeg",
    ["-y", "-i", rawTarget, "-af", filterChain, "-ar", "48000", outPath],
    { stdio: "inherit" },
  );
  console.log(`Saved ${outPath} (preset=${values.preset}, mastered)`);
  console.log(`Raw file kept alongside for A/B comparison: ${rawTarget}`);

  const stats = measureLoudness(outPath);
  if (stats) {
    const lra = Number(stats.input_lra);
    console.log(`Measured loudness: I=${stats.input_i} LUFS, LRA=${stats.input_lra} dB, TP=${stats.input_tp} dBTP`);
    if (Number.isFinite(lra) && lra < MIN_ACCEPTABLE_LRA_DB) {
      console.warn(
        `WARNING: measured LRA ${stats.input_lra} dB is below the ${MIN_ACCEPTABLE_LRA_DB} dB floor — ` +
        `this clip will sound flat/over-compressed. Note this is expected for a single short, evenly-paced ` +
        `test line; check a full-length script before treating it as a mastering defect.`,
      );
    }
  } else {
    console.warn("WARNING: could not parse loudnorm measurement output — skipping LRA check.");
  }
}
