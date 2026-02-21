import multer from "multer";
import DatauriParser from "datauri/parser.js";
import path from "path";

const storage = multer.memoryStorage();
const upload = multer({ storage });
const parser = new DatauriParser();

/**
* @description This function converts the buffer to data url
* @param {import("../types/asyncHandler").MulterFile} file
* @returns {DatauriParser} The data url from the string buffer
*/
export const dataUri = (file) => parser.format(path.extname(file.originalname).toString(), file.buffer);


export default upload;
