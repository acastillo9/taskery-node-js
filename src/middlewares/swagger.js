import swaggerJSDoc from 'swagger-jsdoc';

// Text content of the swagger.json document
let spec;

const swagger = (options) => {
  // Create the documentation with the given options
  spec = swaggerJSDoc(options);

  // Return a Koa middleware
  const swaggerDocEndpoint = (ctx, next) => {
    /**
     * If the path is the one specified in the options for
     * accessing the documentation, show it and interrupt the request.
     * Otherwise, call the next middleware.
     */
    if (ctx.path === options.path) {
      ctx.body = spec;
      return undefined;
    }
    return next();
  };
  return swaggerDocEndpoint;
};

export default swagger;
