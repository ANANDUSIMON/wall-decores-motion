import { continueRender, delayRender, staticFile } from "remotion";

// Load local woff2 files before the first frame is captured.
const faces: [string, string, string, string][] = [
  ["Cormorant Garamond", "400", "normal", "cormorant-garamond-latin-400-normal"],
  ["Cormorant Garamond", "400", "italic", "cormorant-garamond-latin-400-italic"],
  ["Cormorant Garamond", "500", "normal", "cormorant-garamond-latin-500-normal"],
  ["Cormorant Garamond", "500", "italic", "cormorant-garamond-latin-500-italic"],
  ["Cormorant Garamond", "600", "normal", "cormorant-garamond-latin-600-normal"],
  ["Cormorant Garamond", "600", "italic", "cormorant-garamond-latin-600-italic"],
  ["Inter", "300", "normal", "inter-latin-300-normal"],
  ["Inter", "400", "normal", "inter-latin-400-normal"],
  ["Inter", "500", "normal", "inter-latin-500-normal"],
];

if (typeof document !== "undefined") {
  const handle = delayRender("Loading fonts");
  Promise.all(
    faces.map(([family, weight, style, file]) => {
      const f = new FontFace(family, `url(${staticFile(`reel/fonts/${file}.woff2`)}) format('woff2')`, { weight, style });
      (document.fonts as any).add(f);
      return f.load();
    }),
  ).then(() => continueRender(handle)).catch((e) => { console.error(e); continueRender(handle); });
}
