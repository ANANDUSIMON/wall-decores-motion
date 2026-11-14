import { Config } from '@remotion/cli/config';
import path from 'path';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Paintings are photographic — chroma subsampling at 4:2:0 is fine and keeps
// the file small, but we hold quality high because texture is the whole point.
Config.setJpegQuality(95);

// tsconfig.json's `@/*` -> `./src/*` path alias (needed by components.json /
// the Onda + Remocn registries) only resolves for `tsc`. Webpack needs its
// own alias or every `@/...` import fails to bundle.
Config.overrideWebpackConfig((currentConfiguration) => ({
  ...currentConfiguration,
  resolve: {
    ...currentConfiguration.resolve,
    alias: {
      ...currentConfiguration.resolve?.alias,
      '@': path.join(process.cwd(), 'src'),
    },
  },
}));
