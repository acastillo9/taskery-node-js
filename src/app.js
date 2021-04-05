import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import Router from 'koa-router';
import Mongoose from 'mongoose';
import { koaSwagger } from 'koa2-swagger-ui';
import Swagger from './middlewares/swagger.js';
import Routes from './routes/routes.js';

// Options to use with mongoose (mainly to avoid deprecacy warnings)
const mongooseOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
// Connect to the MongoDB database
Mongoose.connect(process.env.DB_URI, mongooseOptions);

// Create the Koa app
const app = new Koa();
// Create a router object
const router = new Router();
// Register all routes by passing the router to them
Routes(router);

// Options to generate the swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Taskery',
      version: '1.0.0',
      description: 'Task manager',
    },
  },
  /**
   * Paths to the API docs. The library will fetch comments marked
   * by a @swagger tag to create the swagger.json document
   */
  apis: [
    './src/controllers/auth.js',
    './src/controllers/users.js',
    './src/controllers/tasks.js',
    './src/controllers/task-groups.js',
  ],
  // where to publish the document
  path: '/swagger.json',
};

// Call our own middleware (see in file)
const swagger = Swagger(swaggerOptions);

// Build the UI for swagger and expose it on the /doc endpoint
const swaggerUi = koaSwagger({
  routePrefix: '/doc',
  swaggerOptions: {
    url: swaggerOptions.path,
  },
});

// Register all middlewares, in the right order
app
  .use(swagger)
  .use(swaggerUi)
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(process.env.PORT);
