import Bcrypt from 'bcrypt';
import User from '../models/user.js';
import Task from '../models/task.js';

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         name:
 *           type: string
 *         email:
 *           type: string
 *     UserLogin:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *       required:
 *         - email
 *         - password
 *     UserRegister:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *       required:
 *         - name
 *         - email
 *         - password
 *     UsersArray:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/User'
 */
const controller = {
  getById: async (id, ctx, next) => {
    ctx.user = await User.findById(id).exec();
    if (!ctx.user) {
      ctx.status = 404;
      return undefined;
    }
    return next();
  },

  /**
   * @swagger
   *
   * /users/{user_id}:
   *   get:
   *     summary: get a user by id
   *     operationId: readUser
   *     tags:
   *       - users
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: user_id
   *         in: path
   *         required: true
   *         description: the id of the user to retrieve
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       '404':
   *         description: User not found
   *
   */
  read: async (ctx) => {
    ctx.body = ctx.user.toClient();
  },

  /**
   * @swagger
   *
   * /users/{user_id}:
   *   put:
   *     summary: update a user by id
   *     operationId: updateUser
   *     tags:
   *       - users
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: user_id
   *         in: path
   *         required: true
   *         description: the id of the user to update
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UserRegister'
   *     responses:
   *       '200':
   *         description: success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/User'
   *       '404':
   *         description: User not found
   *       '400':
   *         description: Invalid request body
   *       '401':
   *         description: Unauthorized
   *
   */
  update: async (ctx) => {
    const { user } = ctx;
    user.email = ctx.request.body.email;
    user.password = await Bcrypt.hash(ctx.request.body.password, 10);
    await user.save();
    ctx.body = user.toClient();
  },

  /**
   * @swagger
   *
   * /users/{user_id}:
   *   delete:
   *     summary: delete a user by id
   *     operationId: deleteUser
   *     tags:
   *       - users
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: user_id
   *         in: path
   *         required: true
   *         description: the id of the user to delete
   *         schema:
   *           type: string
   *     responses:
   *       '204':
   *         description: User deleted
   *       '404':
   *         description: User not found
   *       '401':
   *         description: Unauthorized
   *       '409':
   *         description: Conflict with dependent resources
   *
   */
  delete: async (ctx) => {
    // TODO resolve the problem with group tasks and current active tasks
    const nTasks = await Task.countDocuments({
      responsible: ctx.user._id,
    }).exec();
    if (nTasks > 0) {
      ctx.status = 409;
      return;
    }
    await User.findByIdAndDelete(ctx.user._id).exec();
    ctx.status = 204;
  },

  /**
   * @swagger
   *
   * /users/:
   *   get:
   *     summary: list all users
   *     operationId: listUsers
   *     tags:
   *       - users
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/UsersArray'
   *
   */
  list: async (ctx) => {
    const users = await User.find({}).exec();
    ctx.body = users.map((user) => user.toClient());
  },

  /**
   * @swagger
   *
   * /users/:
   *   delete:
   *     summary: delete all users
   *     operationId: clearUsers
   *     tags:
   *       - users
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '204':
   *         description: Users deleted
   *       '401':
   *         description: Unauthorized
   *       '409':
   *         description: Conflict with dependent resources
   *
   */
  clear: async (ctx) => {
    const nTasks = await Task.countDocuments().exec();
    if (nTasks > 0) {
      ctx.status = 409;
      return;
    }
    await User.deleteMany().exec();
    ctx.status = 204;
  },
};

export default controller;
