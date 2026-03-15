import path from 'path';
import fs from 'fs/promises';
/**
 * Load a local image file and return its binary data as a Buffer.
 * @param {string} filepath - Directory path or path segment containing the image.
 * @param {string} filename - Name of the image file.
 * @returns {Buffer} Buffer containing the image's binary data.
 */
export default async function loadLocalImage (filepath, filename) {
  const imgData = await fs.readFile(path.resolve(filepath, filename), {encoding: 'base64'});
  const imgBuffer = Buffer.from(imgData, 'base64');
  return imgBuffer;
}
