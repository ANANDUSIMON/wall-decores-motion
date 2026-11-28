import { loadFont as loadInter } from '@remotion/google-fonts/Inter';
import { loadFont as loadInstrumentSerif } from '@remotion/google-fonts/InstrumentSerif';

export const { fontFamily: interFontFamily } = loadInter('normal', {
  weights: ['500', '600'],
  subsets: ['latin'],
});

export const { fontFamily: serifFontFamily } = loadInstrumentSerif('italic', {
  weights: ['400'],
  subsets: ['latin'],
});
