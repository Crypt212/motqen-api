import { v2 as cloudinary } from 'cloudinary';
import environment from './environment.js';

cloudinary.config({
  ...environment.cloudinary,
});

console.log('Cloudinary Configured:', cloudinary.config().cloud_name);

export default cloudinary;
