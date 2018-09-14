import path from 'path';

import fs from 'fs-extra';
import sharp from 'sharp';
import uuidv4 from 'uuid/v4';

import config from 'turtle/config';

export async function resizeIconWithSharpAsync(iconSizePx: number, iconFilename: string, destinationIconPath: string) {
  const filename = path.join(destinationIconPath, iconFilename);

  const randomPath = _genRandomImagePath(filename);
  if (randomPath) {
    await fs.copy(filename, randomPath);
  }
  const imagePath = randomPath || filename;

  try {
    // sharp can't have same input and output filename, so load to buffer then
    // write to disk after resize is complete
    const buffer = await sharp(imagePath)
      .resize(iconSizePx, iconSizePx)
      .toBuffer();
    await fs.writeFile(filename, buffer);
  } finally {
    if (randomPath) {
      await fs.remove(randomPath);
    }
  }
}

export async function getImageDimensionsWithSharpAsync(basename: string, dirname: string) {
  const filename = path.join(dirname, basename);

  const randomPath = _genRandomImagePath(filename);
  if (randomPath) {
    await fs.copy(filename, randomPath);
  }
  const imagePath = randomPath || filename;

  try {
    const meta = await sharp(imagePath).metadata();
    return [meta.width, meta.height];
  } catch (e) {
    return null;
  } finally {
    if (randomPath) {
      await fs.remove(randomPath);
    }
  }
}

function _genRandomImagePath(imagePath: string) {
  const matched = imagePath.match(/\.[0-9a-z]+$/i);
  if (!matched) {
    return null;
  }
  const [ext] = matched;
  const randomPath = path.join(config.builder.temporaryFilesRoot, `${uuidv4()}${ext}`);
  return randomPath;
}
