import { Router } from 'express';
import { userRoutes } from './userRoutes';
import { taskRoutes } from './taskRoutes';
import { tokenRoutes } from './tokenRoutes';
import { fotoRoutes } from './fotoRoutes';

export const routes = Router();

routes.use('/users', userRoutes); // Se na URL da requisição houver '/users', será usado as rotas de userRoutes
routes.use('/tasks', taskRoutes); // Se na URL da requisição houver '/tasks', será usado as rotas de taskRoutes
routes.use('/tokens', tokenRoutes); // Se na URL da requisição houver '/tokens', será usado as rotas de tokenRoutes
routes.use('/fotos', fotoRoutes); // Se na URL da requisição houver '/fotos', será usado as rotas de fotoRoutes
