import { Router } from 'express';
import { taskController } from '../controllers/TaskController';
import { loginRequired } from '../middlewares/loginRequired';

export const taskRoutes = Router();

taskRoutes.get('/', taskController.index);
taskRoutes.get('/:id', taskController.show);

taskRoutes.post('/', loginRequired, taskController.store);
taskRoutes.put('/:id', loginRequired, taskController.update);
taskRoutes.delete('/:id', loginRequired, taskController.delete);
