export type CornerOffset = [number, number];

export type PerspectiveCorners = {
  note?: string;
  topLeft: CornerOffset;
  topRight: CornerOffset;
  bottomLeft: CornerOffset;
  bottomRight: CornerOffset;
};

export type PaintingSlot = {
  note?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  perspective?: PerspectiveCorners;
};

export type PlacementConfig = {
  left_corner: PaintingSlot;
  closeup: PaintingSlot;
  right_angle: PaintingSlot;
};

export type BeatCue = {
  in: number;
  out: number;
  kicker: string;
  lines: [string, string];
  line2Delay: number;
};
