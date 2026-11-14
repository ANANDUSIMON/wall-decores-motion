import React from 'react';
import { Img, staticFile } from 'remotion';
import { PAINT_SRC, W, H } from '../theme';

/** scale so the 1254x1254 square source covers the 1080x1920 canvas */
const BASE = Math.max(W, H) / PAINT_SRC;

/** A cropped, zoomed window onto one standalone painting still — the macro
 * detail shots for the process explainer. */
export const PaintCrop: React.FC<{
  /** file under public/paintings, without extension */
  src: string;
  /** crop centre, fraction of the source frame */
  cx: number;
  cy: number;
  /** 1 = the base cover crop, higher = tighter macro crop */
  zoom: number;
}> = ({ src, cx, cy, zoom }) => {
  const size = PAINT_SRC * BASE * zoom;
  const left = W / 2 - cx * size;
  const top = H / 2 - cy * size;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <Img
        src={staticFile(`paintings/${src}.png`)}
        style={{ position: 'absolute', left, top, width: size, height: size, objectFit: 'cover' }}
      />
    </div>
  );
};
