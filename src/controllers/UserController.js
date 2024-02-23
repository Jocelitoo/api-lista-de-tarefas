import bcryptjs from 'bcryptjs';
import { isEmail } from 'validator';
import { prisma } from '../client';

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
        error: ['Ocorreu um erro'],
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
          fotos: {
            select: {
              filename: true,
              url: true,
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

      // Pegar individualmente cada usuário do array users para buscar na base de dados seu array de tarefas e dps juntar o usuário e suas tarefas em um só bloco
      const response = [];

      const promises = users.map(async (user) => {
        const tasks = await prisma.task.findMany({ where: { ownerId: user.id }, select: { id: true, content: true } }); // Prisma acessa o model(tabela) 'task' e pega todas as tarefas que tem o ownerID com o mesmo valor do user.id e select vai pegar somento id e content

        response.push({
          usuário: user,
          tarefas: tasks,
        });
      });

      await Promise.all(promises); // O map n espera o await ser concluido, então usamos esse código para que a function só continue executando dps que as promises forem concluidas

      return res.json(response);
    } catch (e) {
      return res.status(400).json({
        error: ['Ocorreu um erro'],
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
          fotos: {
            select: {
              filename: true,
              url: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(400).json({
          error: ['Usuário não existe'],
        });
      }

      // Pegar todas as tasks(tarefas) que possuam o ownerId com o mesmo valor do id passado no parametro
      const tasks = await prisma.task.findMany({ where: { ownerId: reqId }, select: { id: true, content: true } }); // Prisma acessa o model(tabela) 'task' e pega todas as tarefas que tem o ownerID com o mesmo valor do reqId e select vai pegar somento id e content

      return res.json({
        usuário: user,
        tarefas: tasks,
      });
    } catch (e) {
      return res.status(400).json({
        error: ['Ocorreu um erro'],
      });
    }
  }

  async update(req, res) {
    try {
      const reqId = req.userId; // Pega o id do usuário que está fazendo a requisição, enviado pelo middleware
      const reqName = req.body.name; // Pega o 'name' enviado no body da requisição
      const reqEmail = req.body.email; // Pega o 'email' enviado no body da requisição
      const reqPassword = req.body.password; // Pega o 'password' enviado no body da requisição

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

      // Verificar se o usuário existe
      const user = await prisma.user.findUnique({
        where: { id: reqId },
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
      const reqPasswordHash = await bcryptjs.hash(reqPassword, 8);

      // Atualizar usuario
      const updateUser = await prisma.user.update({
        where: { id: reqId },
        data: { name: reqName, email: reqEmail, password: reqPasswordHash },
        select: {
          id: true, name: true, email: true,
        },
      });

      return res.json(updateUser);
    } catch (e) {
      return res.status(400).json({
        error: ['Ocorreu um erro'],
      });
    }
  }

  async delete(req, res) {
    try {
      const reqId = req.userId; // Pega o id do usuário que está fazendo a requisição, enviado pelo middleware

      // Verificar se o usuário existe
      const user = await prisma.user.findUnique({ where: { id: reqId } });

      if (!user) {
        return res.status(400).json({
          error: ['Usuário não existe'],
        });
      }

      // Pegar todas as tasks(tarefas) que possuam o ownerId com o mesmo valor do id passado no parametro
      const tasks = await prisma.task.findMany({ where: { ownerId: reqId } });

      // Deletar usuário
      await prisma.user.delete({ where: { id: reqId } }); // Deleta o usuário que tenha o id com o mesmo valor do reqId

      // Deletar todas as tasks(tarefas) pertencentes a esse usuário deletado
      if (tasks.length > 0) {
        await prisma.task.deleteMany({ where: { ownerId: reqId } }); // Deleta todas as tasks(tarefas) que tenham o ownerId com o mesmo valor do reqId
      }

      return res.json({
        Sucesso: [`Usuário de nome ${user.name} deletado`],
      });
    } catch (e) {
      return res.status(400).json({
        error: ['Ocorreu um erro'],
      });
    }
  }
}

export const userController = new UserController();
