import { Router } from 'express';
import { fotoController } from '../controllers/FotoController';
import { loginRequired } from '../middlewares/loginRequired';

export const fotoRoutes = Router();

fotoRoutes.post('/', loginRequired, fotoController.store);
