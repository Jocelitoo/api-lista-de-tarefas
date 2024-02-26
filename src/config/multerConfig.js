import multer from 'multer';

export const uploader = multer({
  fileFilter: (req, file, callback) => {
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') { // Se o arquivo NÃO for jpeg ou png, esse IF vai dar true e terminar a function aqui msm
      return callback(new multer.MulterError('A foto precisa ser PNG ou JPG')); // Cria um erro com a mensagem 'Arquivo precisa ser PNG ou JPG'
    }

    return callback(null, true);
  },
  storage: multer.diskStorage({}),
  limits: { fileSize: 1000000 }, // Limite de tamanho da img = 1MB
}).single('foto');
