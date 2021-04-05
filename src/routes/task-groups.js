import taskGroups from '../controllers/task-groups.js';
import jwt from '../middlewares/jwt.js';

export default (router) => {
  router
    .param('task_group_id', taskGroups.getById)
    .post('/task-groups', jwt, taskGroups.create)
    .get('/task-groups/:task_group_id', jwt, taskGroups.read)
    .put('/task-groups/:task_group_id', jwt, taskGroups.update)
    .delete('/task-groups/:task_group_id', jwt, taskGroups.delete)
    .get('/task-groups', jwt, taskGroups.list)
    .delete('/task-groups', jwt, taskGroups.clear);
};
