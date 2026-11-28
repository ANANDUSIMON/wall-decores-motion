import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { px } from './timeline';

const clamp = { extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const };

type Props = {
  start: number;
  end: number;
  role: 'outgoing' | 'incoming';
  /** T2 runs the same whip right-to-left. */
  reverse?: boolean;
  children: React.ReactNode;
};

/**
 * Wraps a scene so it blurs + slides + cross-dissolves during its transition
 * window, and sits at rest (full opacity, no blur/offset) outside it — so
 * the outgoing scene can stay mounted past its own content's duration and
 * the incoming scene can mount before its content timeline "starts" without
 * either needing bespoke pre/post-transition styling.
 */
export const WhipTransition: React.FC<Props> = ({ start, end, role, reverse = false, children }) => {
  const frame = useCurrentFrame();
  const whipProgress = interpolate(frame, [start, end], [0, 1], clamp);
  const sign = reverse ? -1 : 1;

  let x: number;
  let blur: number;
  let opacity: number;

  if (role === 'outgoing') {
    x = interpolate(whipProgress, [0, 1], [0, -px(400) * sign]);
    blur = interpolate(whipProgress, [0, 0.5], [0, px(30)], { extrapolateRight: 'clamp' });
    opacity = interpolate(whipProgress, [0.4, 0.7], [1, 0], clamp);
  } else {
    x = interpolate(whipProgress, [0, 1], [px(400) * sign, 0]);
    blur = interpolate(whipProgress, [0.5, 1], [px(30), 0], { extrapolateLeft: 'clamp' });
    opacity = interpolate(whipProgress, [0.3, 0.6], [0, 1], clamp);
  }

  return (
    <div style={{ position: 'absolute', inset: 0, transform: `translateX(${x}px)`, filter: `blur(${blur}px)`, opacity }}>
      {children}
    </div>
  );
};
