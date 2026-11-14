import React from 'react';
import { useCurrentFrame } from 'remotion';
import { MotionBlur } from '@/lib/onda/primitives';
import { fonts } from '../theme';
import { riseIn } from '../motion';

export type HeadlineSegment = {
  text: string;
  style?: 'bold' | 'italic';
  color?: string;
};

export type EditorialHeadlineProps = {
  /** Mixed bold-grotesque / italic-serif segments, rendered word by word. */
  segments: HeadlineSegment[];
  /** Local frame the first word starts entering. */
  delay?: number;
  /** Frames between each word's entrance. */
  stagger?: number;
  fontSize?: number;
  color?: string;
  align?: 'left' | 'center';
  maxWidth?: number;
};

type Word = { text: string; style?: 'bold' | 'italic'; color?: string };

const toWords = (segments: HeadlineSegment[]): Word[] =>
  segments.flatMap((segment) =>
    segment.text.split(' ').filter(Boolean).map((text) => ({ text, style: segment.style, color: segment.color })),
  );

/**
 * Huge Inter 800/900 headline that mixes bold grotesque words with coral
 * Instrument Serif italic accents in a single line. Each word enters on its
 * own 3-frame stagger (fade + 14px rise); the whole block is wrapped in
 * `MotionBlur` so words moving fast through their entrance smear — static
 * (already-settled) words reconstruct with no visible blur (CLAUDE.md
 * motion-blur note: identical recent frames recompose losslessly).
 */
export const EditorialHeadline: React.FC<EditorialHeadlineProps> = ({
  segments,
  delay = 0,
  stagger = 3,
  fontSize = 104,
  color,
  align = 'left',
  maxWidth = 920,
}) => {
  const frame = useCurrentFrame();
  const words = toWords(segments);

  return (
    <MotionBlur>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: align === 'center' ? 'center' : 'flex-start',
          alignItems: 'baseline',
          gap: '0 0.3em',
          maxWidth,
          fontFamily: fonts.headline,
          fontWeight: 900,
          fontSize,
          lineHeight: 0.95,
          letterSpacing: '-0.03em',
        }}
      >
        {words.map((word, i) => {
          const { opacity, translateY } = riseIn(frame, delay + i * stagger, 14, 14);
          const isItalic = word.style === 'italic';
          return (
            <span
              key={`${word.text}-${i}`}
              style={{
                display: 'inline-block',
                opacity,
                transform: `translateY(${translateY}px)`,
                fontFamily: isItalic ? fonts.italic : fonts.headline,
                fontStyle: isItalic ? 'italic' : 'normal',
                fontWeight: isItalic ? 400 : 900,
                color: word.color ?? color,
              }}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    </MotionBlur>
  );
};
