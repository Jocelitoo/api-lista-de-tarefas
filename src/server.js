import express from 'express';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { routes } from './routes/indexRoutes';

dotenv.config();

const app = express();

const port = process.env.PORT ?? 4000;

app.use(express.json()); // Usado para fazer o express realizar o parse de JSON para dentro da aplicação
app.use(routes);
app.use('/images/', express.static(resolve(__dirname, '..', 'uploads', 'images'))); // Usado para permitir acessar a URL das imagens salvas na base de dados
app.use(express.urlencoded({ extended: true })); // Usado para fazer o express retornar um objeto com os dados que receberam post

app.listen(port, () => console.log(`Servidor rodando na porta ${port}`));
