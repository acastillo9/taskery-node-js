import tasks from '../controllers/tasks.js';
import jwt from '../middlewares/jwt.js';

export default (router) => {
  router
    .param('task_id', tasks.getById)
    .post('/tasks', jwt, tasks.create)
    .get('/tasks/:task_id', jwt, tasks.read)
    .put('/tasks/:task_id', jwt, tasks.update)
    .delete('/tasks/:task_id', jwt, tasks.delete)
    .get('/tasks', jwt, tasks.list)
    .delete('/tasks', jwt, tasks.clear);
};
