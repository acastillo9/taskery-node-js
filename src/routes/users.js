import tasks from '../controllers/tasks.js';
import taskGroups from '../controllers/task-groups.js';
import users from '../controllers/users.js';
import jwt from '../middlewares/jwt.js';

export default (router) => {
  router
    .param('user_id', users.getById)
    .get('/users/:user_id', jwt, users.read)
    .get('/users/:user_id/tasks', jwt, tasks.list)
    .get('/users/:user_id/task-groups', jwt, taskGroups.list)
    .put('/users/:user_id', jwt, users.update)
    .delete('/users/:user_id', jwt, users.delete)
    .get('/users', jwt, users.list)
    .delete('/users', jwt, users.clear);
};
