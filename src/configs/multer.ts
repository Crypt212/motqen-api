import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import AppError from '../errors/AppError.js';

const storage = multer.memoryStorage();
const fileFilter = (_: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    return cb(null, true);
  }
  cb(new AppError(`Not an image! Please upload an image.`, 400));
};
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
