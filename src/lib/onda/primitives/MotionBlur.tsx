import React from 'react';
import { CameraMotionBlur, Trail } from '@remotion/motion-blur';
import { SHUTTER } from '../motion';

/**
 * Filmic per-frame motion blur — thin wrapper over `@remotion/motion-blur`'s
 * `<CameraMotionBlur>` so every fast move in the catalog shares the same
 * shutter defaults ({@link SHUTTER}) instead of re-tuning angle/samples per
 * call site.
 */
export type MotionBlurProps = {
  children?: React.ReactNode;
  /** Shutter angle in degrees, 0-360. Defaults to {@link SHUTTER.angle} (180). */
  shutterAngle?: number;
  /** Sub-frame samples accumulated per frame. Defaults to {@link SHUTTER.samples} (10). */
  samples?: number;
};

export const MotionBlur: React.FC<MotionBlurProps> = ({
  children,
  shutterAngle = SHUTTER.angle,
  samples = SHUTTER.samples,
}) => (
  <CameraMotionBlur shutterAngle={shutterAngle} samples={samples}>
    {children}
  </CameraMotionBlur>
);

/**
 * Directional smear trail — thin wrapper over `@remotion/motion-blur`'s
 * `<Trail>` for elements that move far enough per frame that per-frame
 * camera blur alone reads as soft rather than fast (kinetic type, whip
 * transitions).
 */
export type MotionTrailProps = {
  children?: React.ReactNode;
  /** Number of ghost layers behind the element. */
  layers?: number;
  /** Frame lag between consecutive ghost layers. */
  lagInFrames?: number;
  /** Peak opacity of the nearest ghost layer. */
  trailOpacity?: number;
};

export const MotionTrail: React.FC<MotionTrailProps> = ({
  children,
  layers = 6,
  lagInFrames = 1,
  trailOpacity = 0.5,
}) => (
  <Trail layers={layers} lagInFrames={lagInFrames} trailOpacity={trailOpacity}>
    {children}
  </Trail>
);
