import React from 'react';
import {AbsoluteFill, Audio, Series, interpolate} from 'remotion';
import {AUDIO_STEM, COLORS, DURATION, SHOTS} from './config';
import {CLAMP, findAsset} from './primitives';
import {
	Shot01,
	Shot02,
	Shot03,
	Shot04,
	Shot05,
	Shot06,
	Shot07,
	Shot08,
	Shot09,
	Shot10,
	Shot11,
	Shot12,
	Shot13,
	Shot14,
	Shot15,
	Shot16,
} from './shots';

const TIMELINE: [number, React.FC][] = [
	[SHOTS.s01, Shot01],
	[SHOTS.s02, Shot02],
	[SHOTS.s03, Shot03],
	[SHOTS.s04, Shot04],
	[SHOTS.s05, Shot05],
	[SHOTS.s06, Shot06],
	[SHOTS.s07, Shot07],
	[SHOTS.s08, Shot08],
	[SHOTS.s09, Shot09],
	[SHOTS.s10, Shot10],
	[SHOTS.s11, Shot11],
	[SHOTS.s12, Shot12],
	[SHOTS.s13, Shot13],
	[SHOTS.s14, Shot14],
	[SHOTS.s15, Shot15],
	[SHOTS.s16, Shot16],
];

/** "The Last Piece" — 60s. Hard cuts throughout: cut on stillness, never on motion. */
export const LastPiece: React.FC = () => {
	const audio = findAsset(AUDIO_STEM, ['mp3', 'wav', 'm4a', 'aac']);
	return (
		<AbsoluteFill style={{backgroundColor: COLORS.ink}}>
			<Series>
				{TIMELINE.map(([frames, Shot], i) => (
					<Series.Sequence key={i} durationInFrames={frames} name={`Shot ${String(i + 1).padStart(2, '0')}`}>
						<Shot />
					</Series.Sequence>
				))}
			</Series>
			{audio ? (
				<Audio src={audio} volume={(f) => interpolate(f, [0, 20, DURATION - 70, DURATION], [0, 1, 1, 0], CLAMP)} />
			) : null}
		</AbsoluteFill>
	);
};
