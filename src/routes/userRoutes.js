import { Router } from 'express';
import { userController } from '../controllers/UserController';
import { loginRequired } from '../middlewares/loginRequired';

export const userRoutes = Router();

userRoutes.post('/', userController.store);
userRoutes.get('/', userController.index);
userRoutes.get('/:id', userController.show);

userRoutes.put('/', loginRequired, userController.update);
userRoutes.delete('/', loginRequired, userController.delete);
