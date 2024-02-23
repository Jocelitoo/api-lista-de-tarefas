import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient().$extends({
  result: {
    foto: { // model que vai receber o dado virtual(dados que não são enviados para a base de dados)
      url: { // nome desse dado virtual
        needs: { filename: true }, // Dados do model foto que esse dado virtual vai precisar
        compute(foto) {
          return `${process.env.URL}/images/${foto.filename}`; // Valor desse dado virtual
        },
      },
    },
  },
});
