import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { isEmail } from 'validator';
import { prisma } from '../client';

class TokenController {
  async store(req, res) {
    try {
      const reqEmail = req.body.email; // Pega o email enviado no body da requisição
      const reqPassword = req.body.password; // Pega o password enviado no body da requisição

      // Validar email e password
      const formErrorMsg = [];

      if (!isEmail(reqEmail)) formErrorMsg.push('Email inválido');
      if (reqPassword.length < 8 || reqPassword.length > 20) formErrorMsg.push('Campo SENHA precisa ter entre 8 e 20 caracteres');

      if (formErrorMsg.length > 0) {
        return res.status(400).json({
          error: formErrorMsg,
        });
      }

      // Verificar se existe algum usuário com o email enviado
      const user = await prisma.user.findUnique({ where: { email: reqEmail } }); // Pega o usuário que tenha o email com o mesmo valor de reqEmail

      if (!user) {
        return res.status(400).json({
          error: ['Email ou senha incorreto'], // Por segurança, é importante não especificarmos se é o email que está errado ou o password
        });
      }

      // Verificar se o password está correto
      const validPassword = await bcryptjs.compare(reqPassword, user.password); // Compara se reqPassword tem o mesmo valor da senha criptografada user.password

      if (!validPassword) {
        return res.status(400).json({
          error: ['Email ou senha incorreta'], // Por segurança, é importante não especificarmos se é o email que está errado ou o password
        });
      }

      // Gerar o token
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.TOKEN_SECRET, { // Enviamos o user.id e user.email para que possamos identificar de qual usuário pertence o token através do id e email presentes no token
        expiresIn: process.env.TOKEN_EXPIRATION,
      });

      return res.json({
        token,
      });
    } catch (e) {
      return res.status(400).json({
        error: ['Ocorreu um erro'],
      });
    }
  }
}

export const tokenController = new TokenController();
