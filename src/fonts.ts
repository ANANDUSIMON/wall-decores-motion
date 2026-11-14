import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadInstrumentSerif } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadJetBrainsMono } from "@remotion/google-fonts/JetBrainsMono";

export const { fontFamily: interFontFamily } = loadInter("normal", {
	weights: ["700", "800", "900"],
	subsets: ["latin"],
});

export const { fontFamily: instrumentSerifFontFamily } = loadInstrumentSerif("italic", {
	weights: ["400"],
	subsets: ["latin"],
});

export const { fontFamily: jetBrainsMonoFontFamily } = loadJetBrainsMono("normal", {
	weights: ["400", "500", "700"],
	subsets: ["latin"],
});
