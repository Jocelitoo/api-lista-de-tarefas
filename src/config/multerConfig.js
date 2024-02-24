import multer from 'multer';
import { extname, resolve } from 'path';

const aleatorio = () => parseInt(Math.random() * ((20000 + 1) - 10000) + 10000); // Sorteia um número aleatório entre 20000 e 10000, será usado para impedir arquivos de terem o mesmo nome caso sejam enviados exatamente no mesmo segundo

export default {
  fileFilter: (req, file, callback) => { // Usado para filtrar os arquivos recebidos, deixando passar somente os arquivos que vc deseja, como os arquivos do tipo img, ou arquivos do tipo pdf, etc.
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg') { // Se o arquivo NÃO for jpeg ou png, esse IF vai dar true e terminar a function aqui msm
      return callback(new multer.MulterError('Arquivo precisa ser PNG ou JPG')); // Cria um erro com a mensagem 'Arquivo precisa ser PNG ou JPG'
    }

    return callback(null, true);
  },
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, resolve(__dirname, '..', '..', 'uploads', 'images')); // callback(se erro: null, se sucesso: caminho da pasta que vai receber o arquivo)
    },
    filename: (req, file, callback) => {
      callback(null, `${Date.now()}_${aleatorio()}${extname(file.originalname)}`); // callback(se erro: null, se sucesso: novo nome do arquivo --> O nome do arquivo vai ser a data que foi enviado + numero aleatório + extname vai pegar a extensão(EX: .JPG, .PNG,...))
    },
  }),
};
