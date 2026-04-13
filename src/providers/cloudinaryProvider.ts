import cloudinary from '../configs/cloudinary.js';

const uploadToCloudinary = (
  buffer: Buffer,
  folder: string = 'Motqen',
  publicId: string | null = null
): Promise<{ url: string; publicId: string }> => {
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
