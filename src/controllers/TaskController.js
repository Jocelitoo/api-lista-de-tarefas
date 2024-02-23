import { prisma } from '../client';

class TaskController {
  async store(req, res) {
    try {
      const reqOwnerId = req.userId; // Pega o id do usuário que está fazendo a requisição, enviado pelo middleware
      const reqContent = req.body.content; // Pega o content enviado na requisição do body

      // Validar ownerID e content
      const formErrorMsg = [];

      if (!reqOwnerId) formErrorMsg.push('Campo ownerId não pode estar vazio');
      if (reqContent.length < 2 || reqContent.length > 40) formErrorMsg.push('Campo tarefa precisa ter entre 2 e 40 caracteres');

      if (formErrorMsg.length > 0) {
        return res.status(400).json({
          error: formErrorMsg,
        });
      }

      // Verificar se existe algum usuário com o id passado em ownerId
      const user = await prisma.user.findUnique({ where: { id: reqOwnerId } }); // Prisma vai acessar o model(tabela) user e vai procurar se existe nessa tabela algum usuário com o mesmo id enviado na requisição do body

      if (!user) {
        return res.status(400).json({
          error: ['Não existe um usuário com esse id'],
        });
      }

      // Criar task(tarefa)
      const task = await prisma.task.create({ data: { ownerId: reqOwnerId, content: reqContent } }); // Cria no model(tabela) task uma nova tarefa

      return res.json(task);
    } catch (e) {
      return res.status(400).json({
        error: ['Ocorreu um erro'],
      });
    }
  }

  async index(req, res) {
    try {
      const tasks = await prisma.task.findMany(); // Retorna todas as tarefas salvas na base de dados

      if (tasks.length === 0) {
        return res.json({
          Aviso: ['Não existe nenhuma tarefa salva na base de dados'],
        });
      }

      console.log(`UserId: ${req.userId}`);
      console.log(`UserEmail: ${req.userEmail}`);

      return res.json(tasks);
    } catch (e) {
      return res.status(400).json({
        error: ['Ocorreu um erro'],
      });
    }
  }

  async show(req, res) {
    try {
      const reqId = parseInt(req.params.id); // Pega o id enviado no parâmetro(URL) da requisição, por ele vim como STRING e a base de dados só receber o id como inteiro, usamos o parseInt

      // Verificar se a task(tarefa) existe
      const task = await prisma.task.findUnique({ where: { id: reqId } }); // Pega a task que tenha o id com o mesmo valor de reqId

      if (!task) {
        return res.status(400).json({
          error: ['A tarefa com esse id não existe'],
        });
      }

      return res.json(task);
    } catch (e) {
      return res.status(400).json({
        error: ['Ocorreu um erro'],
      });
    }
  }

  async update(req, res) {
    try {
      const { userId } = req; // Pega o id do usuário que está fazendo a requisição, enviado pelo middleware
      const reqId = parseInt(req.params.id); // Pega o id enviado no parâmetro(URL) da requisição, por ele vim como STRING e a base de dados só receber o id como inteiro, usamos o parseInt
      const reqContent = req.body.content; // Pega o content enviado no body da requisição

      // Validar content
      if (reqContent.length < 2 || reqContent.length > 40) {
        return res.status(400).json({
          error: ['Campo tarefa precisa ter entre 2 e 40 caracteres'],
        });
      }

      // Verificar se a task(tarefa) existe
      const task = await prisma.task.findUnique({ where: { id: reqId } }); // Pega a task que tenha o id com o mesmo valor de reqId

      if (!task) {
        return res.status(400).json({
          error: ['A tarefa com esse id não existe'],
        });
      }

      // Verificar se a task(tarefa) a ser atualizada pertence ao usuário que está fazendo a requisição
      if (userId !== task.ownerId) {
        return res.status(401).json({
          Error: ['Tarefa não encontrada'],
        });
      }

      // Atualizar tarefa
      const taskUpdated = await prisma.task.update({ where: { id: reqId }, data: { content: reqContent } }); // Pega a task que tenha o id com o mesmo valor de reqId e atualiza o content pelo valor de reqContent

      return res.json(taskUpdated);
    } catch (e) {
      return res.status(400).json({
        error: ['Ocorreu um erro'],
      });
    }
  }

  async delete(req, res) {
    try {
      const { userId } = req; // Pega o id do usuário que está fazendo a requisição, enviado pelo middleware
      const reqId = parseInt(req.params.id); // Pega o id enviado no parâmetro(URL) da requisição, por ele vim como STRING e a base de dados só receber o id como inteiro, usamos o parseInt

      // Verificar se a task(tarefa) existe
      const task = await prisma.task.findUnique({ where: { id: reqId } }); // Pega a task que tenha o id com o mesmo valor de reqId

      if (!task) {
        return res.status(400).json({
          error: ['A tarefa com esse id não existe'],
        });
      }

      // Verificar se a task(tarefa) a ser deletada pertence ao usuário que está fazendo a requisição
      if (userId !== task.ownerId) {
        return res.status(401).json({
          Error: ['Tarefa não encontrada'],
        });
      }

      // Deletar a task(tarefa)
      await prisma.task.delete({ where: { id: reqId } }); // Deleta a task(tarefa) que tem o id com o mesmo valor de reqId

      return res.json({
        Sucess: ['Tarefa deletada'],
      });
    } catch (e) {
      return res.status(400).json({
        error: ['Ocorreu um erro'],
      });
    }
  }
}

export const taskController = new TaskController();
