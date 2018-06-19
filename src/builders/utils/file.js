import fs from 'fs-extra';

export async function writeBase64ToBinaryFile(filename, base64Str) {
  const buffer = Buffer.from(base64Str, 'base64');
  await fs.writeFile(filename, buffer);
}
