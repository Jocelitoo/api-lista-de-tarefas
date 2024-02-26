import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (filePath) => {
  try {
    return await cloudinary.uploader.upload(filePath, (error, result) => {
      console.log(error, result); // Se houver um erro, 'error' retornará o erro e result retornará undefined. Se der tudo certo, result retornará os dados do resultado e error retornará undefined
    });
  } catch (e) {
    return console.log(e.message);
  }
};

export const destroyFile = async (picPublicID) => {
  try {
    return await cloudinary.uploader.destroy(picPublicID, (error, result) => {
      console.log(error, result); // Se houver um erro, 'error' retornará o erro e 'result' retornará undefined. Se der tudo certo, 'result' retornará os dados do resultado e 'error' retornará undefined
    });
  } catch (e) {
    return console.log(e.message);
  }
};
