import cloudinary from '../configs/cloudinary.js';

/**
 * @param {Buffer} buffer - The buffer to upload to Cloudinary.
 * @param {string} [folder='Motqen'] - The folder to upload the file to.
 * @param {string | null} [publicId=null] - The public id to use for the uploaded file.
 */
const uploadToCloudinary = (buffer, folder = 'Motqen', publicId = null) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, ...(publicId && { public_id: publicId, overwrite: true }) },

      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

export default uploadToCloudinary;
