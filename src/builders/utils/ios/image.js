import path from 'path';

import fs from 'fs-extra';
import sharp from 'sharp';

export async function resizeIconWithSharpAsync(iconSizePx, iconFilename, destinationIconPath) {
  const filename = path.join(destinationIconPath, iconFilename);

  // sharp can't have same input and output filename, so load to buffer then
  // write to disk after resize is complete
  const buffer = await sharp(filename)
    .resize(iconSizePx, iconSizePx)
    .toBuffer();

  await fs.writeFile(filename, buffer);
}

export async function getImageDimensionsWithSharpAsync(basename, dirname) {
  const filename = path.join(dirname, basename);

  try {
    const meta = await sharp(filename).metadata();
    return [meta.width, meta.height];
  } catch (e) {
    return null;
  }
}
