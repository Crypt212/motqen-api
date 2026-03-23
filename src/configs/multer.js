import multer from "multer";
import AppError from "../errors/AppError.js";
const storage = multer.memoryStorage();
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const fileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return cb(null, true);
  }
  cb(
    new AppError(
      `Unsupported image format. Allowed: JPEG, PNG, WebP, GIF`,
      400
    ),
    false
  );
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

export default upload;

