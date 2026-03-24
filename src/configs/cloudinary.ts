import { v2 as cloudinary } from 'cloudinary';
import environment from './environment.js';

cloudinary.config({
  ...environment.cloudinary,
});

export default cloudinary;
