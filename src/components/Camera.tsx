import React from 'react';
import { AbsoluteFill } from 'remotion';

/**
 * A 2.5D camera rig.
 *
 * Everything in a shot sits at a notional distance from the lens. When the
 * camera moves, near things sweep across the frame faster than far things —
 * that parallax is the single cheapest way to turn a flat composition into a
 * space with depth, and it is why a shot can feel filmed rather than
 * animated.
 *
 * Wrap a shot in <Camera>, then put each element inside a <Layer depth={n}>.
 * depth 0 is painted on the back wall and barely moves; 1 is the subject
 * plane; above 1 is closer to the lens and moves more.
 */

type CameraState = { x: number; y: number; scale: number };

const CameraContext = React.createContext<CameraState>({ x: 0, y: 0, scale: 1 });

export const Camera: React.FC<{
  /** camera translation in px — positive x pushes content left */
  x?: number;
  y?: number;
  scale?: number;
  children: React.ReactNode;
}> = ({ x = 0, y = 0, scale = 1, children }) => (
  <CameraContext.Provider value={{ x, y, scale }}>
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        transformOrigin: '50% 50%',
        willChange: 'transform',
      }}
    >
      {children}
    </AbsoluteFill>
  </CameraContext.Provider>
);

export const Layer: React.FC<{
  depth?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ depth = 1, children, style }) => {
  const cam = React.useContext(CameraContext);
  return (
    <AbsoluteFill
      style={{
        transform: `translate3d(${(-cam.x * depth).toFixed(2)}px, ${(
          -cam.y * depth
        ).toFixed(2)}px, 0)`,
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

export const useCamera = () => React.useContext(CameraContext);
