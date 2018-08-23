import fs from 'fs-extra';

export async function writeBase64ToBinaryFile(filename: string, base64: string) {
  const buffer = Buffer.from(base64, 'base64');
  await fs.writeFile(filename, buffer);
}
