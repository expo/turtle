import path from 'path';

import fs from 'fs-extra';
import sharp from 'sharp';

export async function resizeIconWithSharpAsync(iconSizePx: number, iconFilename: string, destinationIconPath: string) {
  const filename = path.join(destinationIconPath, iconFilename);

  // PLEASE DON'T REMOVE THE FOLLOWING LINE (sharp caches files taking path as the cache key)
  sharp.cache(false);

  // sharp can't have same input and output filename, so load to buffer then
  // write to disk after resize is complete
  const buffer = await sharp(filename)
    .resize(iconSizePx, iconSizePx)
    .toBuffer();

  await fs.writeFile(filename, buffer);
}

export async function getImageDimensionsWithSharpAsync(dirname: string, filename: string) {
  const filepath = path.join(dirname, filename);

  // PLEASE DON'T REMOVE THE FOLLOWING LINE (sharp caches files taking path as the cache key)
  sharp.cache(false);

  try {
    const { width, height } = await sharp(filepath).metadata();
    return { width, height };
  } catch (e) {
    return null;
  }
}
