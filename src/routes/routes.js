import authRoutes from './auth.js';
import userRoutes from './users.js';
import taskRoutes from './tasks.js';
import taskGroupRoutes from './task-groups.js';

const routes = (router) => {
  authRoutes(router);
  userRoutes(router);
  taskRoutes(router);
  taskGroupRoutes(router);
};

export default routes;
