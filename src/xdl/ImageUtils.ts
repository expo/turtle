import fs from 'fs';
import path from 'path';
import probeImageSize from 'probe-image-size';

import { spawnAsyncThrowError } from './detach/ExponentTools';
import LoggerDetach from './detach/Logger';

/**
 * @param {string} projectDirname
 * @param {string} basename
 * @returns {} { width: number, height: number } image dimensions or null
 */
async function getImageDimensionsAsync(
  projectDirname: string,
  basename: string,
): Promise<{ width?: number; height?: number } | null> {
  return await customGetImageDimensionsAsync(projectDirname, basename).catch(
    () => null,
  );
}

async function customGetImageDimensionsWithImageProbeAsync(
  projectDirname: string,
  basename: string,
): Promise<{ width: number; height: number }> {
  const imagePath = path.resolve(projectDirname, basename);
  const readStream = fs.createReadStream(imagePath);
  const { width, height } = await probeImageSize(readStream);
  readStream.destroy();
  return { width, height };
}

let hasWarned = false;
async function resizeImageAsync(
  iconSizePx: number,
  iconFilename: string,
  destinationIconPath: string,
) {
  if (
    process.platform !== 'darwin' &&
    customResizeImageAsync === customResizeImageWithSipsAsync &&
    !hasWarned
  ) {
    LoggerDetach.warn('`sips` utility may or may not work outside of macOS');
    hasWarned = true;
  }
  return customResizeImageAsync(iconSizePx, iconFilename, destinationIconPath);
}

async function customResizeImageWithSipsAsync(
  iconSizePx: number,
  iconFilename: string,
  destinationIconPath: string,
) {
  return spawnAsyncThrowError(
    'sips',
    ['-Z', iconSizePx.toFixed(), iconFilename],
    {
      stdio: ['ignore', 'ignore', 'inherit'], // only stderr
      cwd: destinationIconPath,
    },
  );
}

// Allow us to swap out the default implementations of image functions
let customResizeImageAsync = customResizeImageWithSipsAsync;
let customGetImageDimensionsAsync: (
  dirname: string,
  filename: string,
) => Promise<{
  width?: number;
  height?: number;
} | null> = customGetImageDimensionsWithImageProbeAsync;

// Allow users to provide an alternate implementation for our image resize function.
// This is used internally in order to use sharp instead of sips in standalone builder.
function setResizeImageFunction(
  fn: (
    iconSizePx: number,
    iconFilename: string,
    destinationIconPath: string,
  ) => Promise<any>,
) {
  customResizeImageAsync = fn;
}

// Allow users to provide an alternate implementation for our image dimensions function.
// This is used internally in order to use sharp instead of sips in standalone builder.
function setGetImageDimensionsFunction(
  fn: (
    dirname: string,
    filename: string,
  ) => Promise<{ width?: number; height?: number } | null>,
) {
  customGetImageDimensionsAsync = fn;
}

export {
  resizeImageAsync,
  setResizeImageFunction,
  setGetImageDimensionsFunction,
  getImageDimensionsAsync,
};
