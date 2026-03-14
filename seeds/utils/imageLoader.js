import path from 'path';
import fs from 'fs/promises';
export default async function loadLocalImage (filepath, filename) {
  const imgData = await fs.readFile(path.resolve(filepath, filename), {encoding: 'base64'});
  const imgBuffer = Buffer.from(imgData, 'base64');
  return imgBuffer;
}
