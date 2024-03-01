import jwt from 'jsonwebtoken';
import { prisma } from '../client';

export async function loginRequired(req, res, next) {
  // Pegar o token enviado na requisição
  const { authorization } = req.headers; // Pega o authorization enviado no headers da requisição que é 'Bearer token'

  if (!authorization) {
    return res.status(401).json({
      error: ['Login required'],
    });
  }

  // eslint-disable-next-line no-unused-vars
  const [texto, token] = authorization.split(' '); // Separa o 'Bearer' do 'token'

  try {
    // Decodificar o token
    const dados = jwt.verify(token, process.env.TOKEN_SECRET); // Usa o TOKEN_SECRET para pegar uma versão decodificada do token, permitindo assim acessar o id e email do usuário passados pro token na hora da sua criação

    // Pegar os dados do usuário contidos no token
    const tokenId = dados.id;
    const tokenEmail = dados.email;

    // Verificar se existe algum usuário com o mesmo id e email contidos no token
    const user = await prisma.user.findUnique({ where: { id: tokenId, email: tokenEmail } }); // Pega o usuário que tem o id com o mesmo valor do tokenID e o email com o mesmo valor do tokenEmail

    if (!user) {
      return res.status(401).json({
        error: ['Token inválido'],
      });
    }

    // Enviar os dados para a função que vai ser executada dps do middleware
    req.userId = tokenId;
    req.userEmail = tokenEmail;

    return next(); // Responsável por permitir que a função que vem dps da middleware seja executada
  } catch (e) {
    return res.status(401).json({
      error: ['Token expirando ou inválido'],
    });
  }
}
