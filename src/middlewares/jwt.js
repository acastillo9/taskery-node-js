/**
 * This file is a Koa middleware. All it does is call
 * another middleware that handles the JWT authentication
 * using the given secret.
 */

import KoaJwt from 'koa-jwt';

export default KoaJwt({
  secret: process.env.JWT_SECRET,
});
