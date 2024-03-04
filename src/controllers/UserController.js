import bcryptjs from 'bcryptjs';
import { isEmail } from 'validator';
import { prisma } from '../client';
import { destroyFile } from '../config/cloudinary';

class UserController {
  async store(req, res) {
    try {
      const reqName = req.body.name; // Pega o name enviado no body da requisição
      const reqEmail = req.body.email; // Pega o email enviado no body da requisição
      const reqPassword = req.body.password; // Pega o password enviado no body da requisição

      // Validar nome, email e password
      const formErrorMsg = [];

      if (reqName.length < 2 || reqName.length > 20) formErrorMsg.push('Campo NOME precisa ter entre 2 e 20 caracteres');
      if (!isEmail(reqEmail)) formErrorMsg.push('EMAIL inválido');
      if (reqPassword.length < 8 || reqPassword.length > 20) formErrorMsg.push('Campo SENHA precisa ter entre 8 e 20 caracteres');

      if (formErrorMsg.length > 0) {
        return res.status(400).json({
          errors: formErrorMsg,
        });
      }

      // Verificar se o name e email já existem na base de dados
      const nameExists = await prisma.user.findUnique({ where: { name: reqName } }); // Prisma vai acessar o model(tabela) "user" e vai procurar se existe nessa tabela algum usuário com o mesmo name enviado na requisição
      const emailExists = await prisma.user.findUnique({ where: { email: reqEmail } }); // Prisma vai acessar o model(tabela) "user" e vai procurar se existe nessa tabela algum usuário com o mesmo email enviado na requisição

      if (nameExists) formErrorMsg.push('Esse NOME já está em uso');
      if (emailExists) formErrorMsg.push('Esse EMAIL já está em uso');

      if (formErrorMsg.length > 0) { // Se houver algum erro, esse IF será TRUE
        return res.status(400).json({ // return terminará aqui a function mostrando a msg de erro
          errors: formErrorMsg,
        });
      }

      // Criptografar password
      const reqPasswordHash = await bcryptjs.hash(reqPassword, 8); // reqPasswordHash ira receber o reqPassword  no formato "decodificado". Não utilize um valor de salt tão alto pra n gastar muito poder de processamento do servidor, prefira entre 8 e 10

      // Criar usuário
      const user = await prisma.user.create({ // Cria no model(tabela) user um novo usuário
        data: {
          name: reqName,
          email: reqEmail,
          password: reqPasswordHash,
        },
      });

      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (e) {
      return res.status(400).json({
        sucess: false,
        msg: e.message,
      });
    }
  }

  async index(req, res) {
    try {
      const users = await prisma.user.findMany({ // Retorna todos os usuários e select especifica os dados que queremos ver desses usuários
        select: {
          id: true,
          name: true,
          email: true,
          tasks: {
            select: {
              id: true,
              content: true,
            },
          },
          fotos: {
            select: {
              url: true,
              public_id: true,
            },
          },
        },
        orderBy: {
          id: 'desc', // Ordena os usuários pelo id de forma decrescente
        },
      });

      if (users.length === 0) {
        return res.json({
          Aviso: ['Não existe nenhum usuário salvo na base de dados'],
        });
      }

      return res.json(users);
    } catch (e) {
      return res.status(400).json({
        sucess: false,
        msg: e.message,
      });
    }
  }

  async show(req, res) {
    try {
      const reqId = parseInt(req.params.id); // Pega o id enviado no parâmetro(URL) da requisição, por ele vim como STRING e a base de dados só receber o id como inteiro, usamos o parseInt

      // Verificar se o usuário existe
      const user = await prisma.user.findUnique({ // Busca na base de dados algum usuário que tenha o id com o mesmo valor de reqId e select especifica os dados que queremos pegar desse usuário
        where: { id: reqId },
        select: {
          id: true,
          name: true,
          email: true,
          tasks: {
            select: {
              id: true,
              content: true,
            },
          },
          fotos: {
            select: {
              url: true,
              public_id: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(400).json({
          error: ['Usuário não existe'],
        });
      }

      return res.json({
        usuário: user,
      });
    } catch (e) {
      return res.status(400).json({
        sucess: false,
        msg: e.message,
      });
    }
  }

  async update(req, res) {
    try {
      const loggedUserId = req.userId; // Pega o id do usuário que está fazendo a requisição, enviado pelo middleware
      const reqName = req.body.name; // Pega o 'name' enviado no body da requisição
      const reqEmail = req.body.email; // Pega o 'email' enviado no body da requisição
      const reqPassword = req.body.password; // Pega o 'password' enviado no body da requisição

      // Validar nome, email e password
      const formErrorMsg = [];

      if (reqName.length < 2 || reqName.length > 20) formErrorMsg.push('Campo NOME precisa ter entre 2 e 20 caracteres');

      if (!isEmail(reqEmail)) formErrorMsg.push('EMAIL inválido');

      if (reqPassword) { // Validação do password só será necessário se o usuário quiser altera-lo, se n existir é pq o usuário não quer altera-lo
        if (reqPassword.length < 8 || reqPassword.length > 20) formErrorMsg.push('Campo SENHA precisa ter entre 8 e 20 caracteres');
      }

      if (formErrorMsg.length > 0) {
        return res.status(400).json({
          errors: formErrorMsg,
        });
      }

      // Verificar se o usuário existe
      const user = await prisma.user.findUnique({
        where: { id: loggedUserId },
        select: {
          id: true, name: true, email: true, password: true,
        },
      });

      if (!user) {
        return res.status(400).json({
          error: ['Não existe usuário com esse ID'],
        });
      }

      // Verificar se o name e email já existem na base de dados
      const nameExists = await prisma.user.findUnique({ where: { name: reqName } }); // Prisma vai acessar o model(tabela) "user" e vai procurar se existe nessa tabela algum usuário com o mesmo name enviado na requisição
      const emailExists = await prisma.user.findUnique({ where: { email: reqEmail } }); // Prisma vai acessar o model(tabela) "user" e vai procurar se existe nessa tabela algum usuário com o mesmo email enviado na requisição

      if (nameExists && user.name !== reqName) formErrorMsg.push('Esse NOME já está em uso'); // Verifica se o name já existe e se o name do usuário que está fazendo a atualização é diferente do name enviado na requisição, pq assim se torna possível o usuário alterar apenas o email e deixar o msm name sem dar o erro de name já existir

      if (emailExists && user.email !== reqEmail) formErrorMsg.push('Esse EMAIL já está em uso'); // Verifica se o email já existe e se o email do usuário que está fazendo a atualização é diferente do email enviado na requisição, pq assim se torna possível o usuário alterar apenas o name e deixar o msm email sem dar o erro de email já existir

      if (formErrorMsg.length > 0) { // Se houver algum erro, esse IF será TRUE
        return res.status(400).json({ // return terminará aqui a function mostrando a msg de erro
          errors: formErrorMsg,
        });
      }

      // Criptografar password
      let reqPasswordHash = '';

      if (reqPassword) {
        reqPasswordHash = await bcryptjs.hash(reqPassword, 8);
      }

      // Atualizar usuario
      let updateUser = '';
      if (reqPassword) {
        updateUser = await prisma.user.update({
          where: { id: user.id },
          data: { name: reqName, email: reqEmail, password: reqPasswordHash },
          select: {
            id: true, name: true, email: true,
          },
        });
      } else {
        updateUser = await prisma.user.update({
          where: { id: user.id },
          data: { name: reqName, email: reqEmail },
          select: {
            id: true, name: true, email: true,
          },
        });
      }

      return res.json(updateUser);
    } catch (e) {
      return res.status(400).json({
        sucess: false,
        msg: e.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const loggedUserId = req.userId; // Pega o id do usuário que está fazendo a requisição, enviado pelo middleware

      // Verificar se o usuário existe
      const user = await prisma.user.findUnique({
        where: { id: loggedUserId },
        select: {
          id: true, name: true, tasks: true, fotos: true,
        },
      });

      if (!user) {
        return res.status(400).json({
          error: ['Usuário não existe'],
        });
      }

      // Deletar as tasks do usuário
      if (user.tasks.length > 0) {
        await prisma.task.deleteMany({ where: { ownerId: user.id } });
      }

      // Deletar as fotos do cloudinary e da base de dados
      if (user.fotos.length > 0) {
        const picPublicID = user.fotos[0].public_id; // Pega o public_id da imagem

        await destroyFile(picPublicID); // Usa o public_id para destruir a img no cloudinary
        await prisma.foto.deleteMany({ where: { ownerId: user.id } }); // Deleta todas as fotos que tiverem o ownerId com o mesmo valor do user.id(id do usuário que está fazendo a requisição)
      }

      // Deletar usuário
      await prisma.user.delete({ where: { id: user.id } }); // Deleta o usuário que tenha o id com o mesmo valor do user.id

      return res.json({
        Sucesso: [`Usuário de nome ${user.name} deletado`],
      });
    } catch (e) {
      return res.status(400).json({
        sucess: false,
        msg: e.message,
      });
    }
  }
}

export const userController = new UserController();
