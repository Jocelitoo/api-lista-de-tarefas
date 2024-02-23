import { Router } from 'express';
import { tokenController } from '../controllers/TokenController';

export const tokenRoutes = Router();

tokenRoutes.post('/', tokenController.store);
