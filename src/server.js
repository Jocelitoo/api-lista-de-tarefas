import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { routes } from './routes/indexRoutes';

dotenv.config();

const whiteList = [ // URL(dominio) dos sites que podem consumir a API
  'http://localhost:3000',
  'https://lista-de-tarefassss.netlify.app',
];

const corsOptions = {
  origin(origin, callback) { // Esse origin retorna o domínio que está tentando acessar a aplicação, pode ser undefined
    if (whiteList.indexOf(origin) !== -1 || !origin) { // Verifica se o origin(domínio) tentando acessar a Api está dentro da whiteList OU se ela não existe(caso seja undefined)
      callback(null, true);
    } else {
      callback(new Error('Not aloweed by CORS'));
    }
  },
};

const app = express();

app.use(express.json()); // Usado para fazer o express realizar o parse de JSON para dentro da aplicação
app.use(express.urlencoded({ extended: true })); // Usado para fazer o express retornar um objeto com os dados que receberam post, sem ele o sistema da erro na hora da criação do token quando a api está no ar

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // '*' permite qualquer origem, troque para uma origem específica se necessário
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); // Métodos permitidos
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Headers permitidos
  next();
});

app.use(routes);
app.use(helmet());
app.use(cors(corsOptions));

const port = process.env.PORT ?? 4000;

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
