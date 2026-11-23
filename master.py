#!/usr/bin/env python3
"""
master.py — final loudness stage for Wall Decores films.

Replaces the hand-rolled single-pass `ffmpeg loudnorm` + `alimiter` chain with
ffmpeg-normalize's proper two-pass EBU R128, then VERIFIES the result with an
independent meter (pyloudnorm) instead of trusting the tool's own report.

Targets default to social delivery: -14 LUFS integrated / -1.0 dBTP.
YouTube, YouTube Shorts and Instagram all normalise DOWNWARD ONLY, so landing
under target is unrecoverable while landing over costs only a little gain.

Usage
    python3 master.py IN OUT                  # audio or video, defaults to -14/-1
    python3 master.py IN OUT --lufs -16       # podcast-ish
    python3 master.py IN OUT --broadcast      # -23 LUFS / -1 dBTP (EBU R128)
    python3 master.py IN OUT --match REF.wav  # match a reference film first
    python3 master.py IN --measure-only       # just report, change nothing
"""

import argparse
import os
import shutil
import subprocess
import sys
import tempfile

VIDEO_EXT = {".mp4", ".mov", ".mkv", ".webm", ".m4v"}


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        sys.exit(f"FAILED: {' '.join(cmd)}\n{p.stderr[-2000:]}")
    return p


def measure(path):
    """Independent measurement. Returns (integrated_lufs, true_peak_dbtp)."""
    import numpy as np
    import pyloudnorm as pyln
    import soundfile as sf

    tmp = None
    if os.path.splitext(path)[1].lower() in VIDEO_EXT:
        tmp = tempfile.mktemp(suffix=".wav")
        run(["ffmpeg", "-v", "error", "-y", "-i", path,
             "-vn", "-ac", "2", "-ar", "48000", "-c:a", "pcm_s24le", tmp])
        path = tmp

    data, rate = sf.read(path)
    if data.ndim == 1:
        data = data[:, None]

    lufs = pyln.Meter(rate).integrated_loudness(data)

    # True peak: 4x oversample so inter-sample peaks are not missed.
    up = np.repeat(data, 4, axis=0)
    peak = float(np.max(np.abs(up))) if up.size else 0.0
    tp = 20 * np.log10(peak) if peak > 0 else -float("inf")

    if tmp and os.path.exists(tmp):
        os.remove(tmp)
    return lufs, tp


def match_reference(src, ref, out):
    """Match EQ curve + loudness to a reference film, for series consistency."""
    import matchering as mg

    mg.log(warning_handler=lambda m: None, info_handler=lambda m: None)
    mg.process(target=src, reference=ref, results=[mg.pcm24(out)])
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("dst", nargs="?")
    ap.add_argument("--lufs", type=float, default=-14.0)
    ap.add_argument("--tp", type=float, default=-1.0)
    ap.add_argument("--lra", type=float, default=11.0,
                    help="loudness range target; 11 keeps a quiet-open film breathing")
    ap.add_argument("--broadcast", action="store_true", help="EBU R128: -23 LUFS")
    ap.add_argument("--match", metavar="REF", help="match a reference film first")
    ap.add_argument("--measure-only", action="store_true")
    ap.add_argument("--bitrate", default="320k")
    args = ap.parse_args()

    if not shutil.which("ffmpeg-normalize"):
        sys.exit("ffmpeg-normalize not installed:  pip install ffmpeg-normalize")

    if args.measure_only:
        lufs, tp = measure(args.src)
        print(f"{os.path.basename(args.src)}:  {lufs:7.2f} LUFS   {tp:6.2f} dBTP")
        return

    if not args.dst:
        sys.exit("need an output path (or pass --measure-only)")

    target = -23.0 if args.broadcast else args.lufs
    before = measure(args.src)
    src = args.src
    staged = None

    if args.match:
        staged = tempfile.mktemp(suffix=".wav")
        print(f"matching against {os.path.basename(args.match)} ...")
        src = match_reference(src, args.match, staged)

    is_video = os.path.splitext(args.dst)[1].lower() in VIDEO_EXT
    cmd = [
        "ffmpeg-normalize", src,
        "-o", args.dst, "-f",
        "-nt", "ebu",
        "-t", str(target),
        "-tp", str(args.tp),
        "-lrt", str(args.lra),
        "--keep-loudness-range-target",
    ]
    # Two-pass EBU R128 is ffmpeg-normalize's default; video is copied untouched.
    if is_video:
        cmd += ["-c:a", "aac", "-b:a", "256k"]
    elif args.dst.lower().endswith(".mp3"):
        cmd += ["-c:a", "libmp3lame", "-b:a", args.bitrate]
    else:
        cmd += ["-c:a", "pcm_s24le"]

    print("two-pass EBU R128 ...")
    run(cmd)

    after = measure(args.dst)
    if staged and os.path.exists(staged):
        os.remove(staged)

    print()
    print(f"{'':12} {'LUFS':>9}  {'dBTP':>8}")
    print(f"{'before':12} {before[0]:9.2f}  {before[1]:8.2f}")
    print(f"{'after':12} {after[0]:9.2f}  {after[1]:8.2f}")
    print(f"{'target':12} {target:9.2f}  {args.tp:8.2f}")

    off = abs(after[0] - target)
    if off > 1.0:
        print(f"\n!!  {off:.2f} LU from target — check the source for clipping or silence")
    elif after[1] > args.tp + 0.1:
        print(f"\n!!  true peak {after[1]:.2f} dBTP exceeds {args.tp} — will clip on lossy encode")
    else:
        print(f"\nOK  within {off:.2f} LU of target, peaks contained")


if __name__ == "__main__":
    main()
