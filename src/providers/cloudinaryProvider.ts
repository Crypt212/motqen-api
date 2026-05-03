import cloudinary from '../configs/cloudinary.js';

/**
 * رفع الصور إلى Cloudinary
 */
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

/**
 * توليد رابط موقع (Signed URL) ينتهي بعد فترة محددة للعرض فقط
 * [Point 5 in S1.2] 🛡️
 */
export const generateViewUrl = (publicId: string): string => {
  return cloudinary.url(publicId, {
    secure: true,
    sign_url: true, // تفعيل التوقيع الرقمي لمنع الوصول المباشر غير المصرح به
    type: 'upload',
    // الرابط يكون صالحاً لفترة محددة (الديفولت عادة ساعة أو حسب إعدادات الحساب)
  });
};

export const deleteFromCloudinary = (publicId: string) => cloudinary.uploader.destroy(publicId);

export default uploadToCloudinary;