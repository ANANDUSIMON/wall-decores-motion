// Fonts ship inside the project (public/last-piece/fonts) — no network needed
// at render time, so a Cloud Run render can never fail on a font download.
// All three families are SIL Open Font License.
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

const dir = 'last-piece/fonts';

export const serif = 'LP Cormorant';
export const sans = 'LP Inter';
export const hand = 'LP Kalam';

loadFont({family: serif, url: staticFile(`${dir}/cormorant-garamond-latin-400-normal.woff2`), weight: '400'});
loadFont({family: serif, url: staticFile(`${dir}/cormorant-garamond-latin-500-normal.woff2`), weight: '500'});
loadFont({family: sans, url: staticFile(`${dir}/inter-latin-400-normal.woff2`), weight: '400'});
loadFont({family: sans, url: staticFile(`${dir}/inter-latin-500-normal.woff2`), weight: '500'});
loadFont({family: hand, url: staticFile(`${dir}/kalam-latin-400-normal.woff2`), weight: '400'});
