import { prisma } from '../client';
import { uploader } from '../config/multerConfig';
import { destroyFile, uploadFile } from '../config/cloudinary';

class FotoController {
  async store(req, res) {
    return uploader(req, res, async (error) => {
      if (error) { // Verifica se tem algum error, se houver o IF será executado e a function ira parar aqui
        return res.status(400).json({ // Envia o status 400(Bad Request) e escreve o erro na tela por meio do json
          errors: [error],
        });
      }

      try {
        const filePath = req.file.path; // Pega o path do file da requisição

        // Verificar se o usuário existe
        const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { fotos: true } });

        if (!user) {
          return res.status(400).json({
            error: ['Usuário não existe'],
          });
        }

        // Verificar se o usuário já tem 1 foto, se tiver vamos destruir a antiga foto do cloudinary e da base de dados
        if (user.fotos.length > 0) {
          const picPublicID = user.fotos[0].public_id; // Pega o public_id da imagem
          await destroyFile(picPublicID); // Usa o public_id para destruir a img no cloudinary
          await prisma.foto.deleteMany({ where: { ownerId: req.userId } }); // Deleta todas as fotos que tiverem o ownerId com o mesmo valor do req.userId(id do usuário que está fazendo a requisição)
        }

        // Enviar imagem para o cloudinary
        const upload = await uploadFile(filePath); // Faz o upload do arquivo no cloudinary

        // Criar na base de dados a img
        const foto = await prisma.foto.create({
          data: {
            ownerId: req.userId,
            url: upload.secure_url,
            public_id: upload.public_id,
          },
        });

        return res.send({
          sucess: true,
          msg: 'File uploaded',
          dados: foto,
        });
      } catch (e) {
        return res.send({
          sucess: false,
          msg: e.message,
        });
      }
    });
  }

  async delete(req, res) {
    try {
      // Verificar se o usuário existe
      const user = await prisma.user.findUnique({ where: { id: req.userId }, select: { fotos: true } }); // Verifica se tem algum usuário que tenha o id com o msm valor de req.userId(id do usuário que fez a requisição) e especifica que quer os dados da tabela foto vinculada a esse usuário

      if (!user) {
        return res.status(400).json({
          error: ['Usuário não existe'],
        });
      }

      // Verificar se o usuário tem alguma foto
      if (user.fotos.length === 0) {
        return res.status(400).send({
          msg: 'Usuário não tem foto para ser apagada',
        });
      }

      // Pegar o public_id da img para apaga-lá
      const picPublicID = user.fotos[0].public_id; // Pega o public_id da imagem

      // Apagar a img no cloudinary e na base de dados
      await destroyFile(picPublicID); // Usa o public_id para destruir a img no cloudinary
      await prisma.foto.deleteMany({ where: { ownerId: req.userId } }); // Deleta da base de dados a foto que tem o ownerId com o mesmo valor de req.userId(id do usuário que fez a requisição)

      return res.send({
        sucess: true,
        msg: 'Foto apagada',
      });
    } catch (e) {
      return res.status(400).send({
        sucess: false,
        msg: e.message,
      });
    }
  }
}

export const fotoController = new FotoController();
