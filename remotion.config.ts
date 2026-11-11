import { Config } from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
// Paintings are photographic — chroma subsampling at 4:2:0 is fine and keeps
// the file small, but we hold quality high because texture is the whole point.
Config.setJpegQuality(95);
