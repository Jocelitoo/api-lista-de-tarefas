import multer from 'multer';
import multerConfig from '../config/multerConfig';
import { prisma } from '../client';

const upload = multer(multerConfig).single('foto'); // single('foto') --> Só pode ser enviado um arquivo por vez e 'foto' é o nome dado no insomnia, ele tmb habilita o req.file para poder pegarmos os dados do arquivo enviados na requisição

class FotoController {
  async store(req, res) { // É store pq recebemos os dados da img serão salvos na base de dados
    return upload(req, res, async (error) => {
      if (error) { // Verifica se tem algum error, se houver o IF será executado e a function ira parar aqui
        return res.status(400).json({ // Envia o status 400(Bad Request) e escreve o erro na tela por meio do json
          errors: [error],
        });
      }

      try {
        const reqOwnerId = req.userId; // Pega o id do usuário que está fazendo a requisição enviado pelo middleware
        const reqOriginalname = req.file.originalname; // Pega o originalname enviado no file(arquivo) da requisição
        const reqFilename = req.file.filename; // Pega o filename enviado no file(arquivo) da requisição

        // Verificar se o user que está fazendo a requisição existe
        const user = await prisma.user.findUnique({ // Pega o usuário que tem o id com o mesmo valor de reqOwnerId e pega as fotos vinculadas a esse usuário
          where: { id: reqOwnerId },
          select: { fotos: true },
        });

        if (!user) {
          return res.status(400).json({
            Error: ['Usuário não existe'],
          });
        }

        // Verificar se já existe alguma foto, se houver alguma foto deletamos
        if (user.fotos.length > 0) {
          await prisma.foto.deleteMany({ where: { ownerId: reqOwnerId } }); // Deleta a foto que tem ownerId com o mesmo valor de reqOwnerId
        }

        // Criar foto
        const foto = await prisma.foto.create({
          data: {
            originalname: reqOriginalname,
            filename: reqFilename,
            ownerId: reqOwnerId,
          },
        });

        return res.json(foto);
      } catch (e) {
        return res.status(400).json({
          Error: ['Ocorreu um erro'],
        });
      }
    });
  }
}

export const fotoController = new FotoController();
