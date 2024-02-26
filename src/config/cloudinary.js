/* eslint-disable prefer-promise-reject-errors */
import cloudinary from 'cloudinary';

export const cloudinaryConfig = cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (filePath) => {
  try {
    const result = await cloudinary.v2.uploader.upload(filePath);
    console.log(result);
    return result;
  } catch (e) {
    return console.log(e.message);
  }
};

export const destroyFile = async (picUrl) => {
  try {
    const result = await cloudinary.v2.uploader.destroy(picUrl);
    console.log(result);
    return result;
  } catch (e) {
    return console.log(e.message);
  }
};
