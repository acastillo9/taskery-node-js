import controller from '../controllers/auth.js';

export default (router) => {
  router
    .post('/login', controller.login)
    .post('/register', controller.register);
};
