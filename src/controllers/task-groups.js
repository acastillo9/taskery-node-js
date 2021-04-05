import Mongoose from 'mongoose';
import TaskGroup from '../models/task-group.js';
import TaskGroupUser from '../models/task-group-user.js';
import User from '../models/user.js';
import RoleType from '../models/role-type.js';

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     TaskGroup:
 *       properties:
 *         id:
 *           type: number
 *         name:
 *           type: string
 *         description:
 *           type: string
 *     TaskGroupCreate:
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         users:
 *           type: array
 *           minItems: 1
 *           items:
 *             $ref: '#/components/schemas/TaskGroupUserCreate'
 *       required:
 *         - name
 *         - description
 *         - users
 *     TaskGroupUserCreate:
 *       properties:
 *         id:
 *           type: object
 *           properties:
 *             user:
 *               type: number
 *           required:
 *             - user
 *         roleType:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *           required:
 *             - code
 *       required:
 *         - id
 *         - roleType
 *
 */
const controller = {
  getById: async (id, ctx, next) => {
    ctx.taskGroup = await TaskGroup.findById(id).exec();
    if (!ctx.taskGroup) {
      ctx.status = 404;
      return undefined;
    }
    return next();
  },

  /**
   * @swagger
   *
   * /task-groups:
   *   post:
   *     summary: create a new task group
   *     operationId: createTaskGroup
   *     tags:
   *       - task groups
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskGroupCreate'
   *     responses:
   *       '201':
   *         description: Task group created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TaskGroup'
   *       '400':
   *         description: Invalid request
   *       '401':
   *         description: Unauthorized
   *
   */
  create: async (ctx) => {
    let taskGroup;

    await Promise.all([
      TaskGroup.createCollection(),
      TaskGroupUser.createCollection(),
    ]);

    const session = await Mongoose.startSession();
    session.startTransaction();

    try {
      // save the task group
      taskGroup = await new TaskGroup({
        name: ctx.request.body.name,
        description: ctx.request.body.description,
      }).save({ session });

      // create the task group user with task group id and user id
      await new TaskGroupUser({
        _id: {
          taskGroup: taskGroup._id,
          user: ctx.state.user.id,
        },
        roleType: ctx.request.body.roleType.code,
      }).save({ session });

      await session.commitTransaction();
    } catch (ex) {
      await session.abortTransaction();
      ctx.status = 500;
      throw ex;
    } finally {
      session.endSession();
    }

    ctx.body = taskGroup.toClient();
    ctx.status = 201;
  },

  /**
   * @swagger
   *
   * /task-groups/{task_group_id}:
   *   get:
   *     summary: get a task group by id
   *     operationId: readTaskGroup
   *     tags:
   *       - task groups
   *     parameters:
   *       - name: task_group_id
   *         in: path
   *         required: true
   *         description: the id of the task group to retrieve
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TaskGroup'
   *       '404':
   *         description: Task group not found
   *
   */
  read: async (ctx) => {
    ctx.body = ctx.taskGroup.toClient();
  },

  /**
   * @swagger
   *
   * /task-groups/{task_group_id}:
   *   put:
   *     summary: update a task group by id
   *     operationId: updateTaskGroup
   *     tags:
   *       - task groups
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: task_group_id
   *         in: path
   *         required: true
   *         description: the id of the task group to update
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskGroupCreate'
   *     responses:
   *       '200':
   *         description: success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TaskGroup'
   *       '400':
   *         description: Invalid request
   *       '401':
   *         description: Unauthorized
   *       '404':
   *         description: Task group not found
   *
   */
  update: async (ctx) => {
    const { taskGroup } = ctx;
    taskGroup.name = ctx.request.body.name;
    taskGroup.description = ctx.request.body.description;
    await taskGroup.save();
    ctx.body = taskGroup.toClient();
  },

  /**
   * @swagger
   *
   * /task-groups/{task_group_id}:
   *   delete:
   *     summary: delete a task group by id
   *     operationId: deleteTaskGroup
   *     tags:
   *       - task groups
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: task_group_id
   *         in: path
   *         required: true
   *         description: the id of the task group to delete
   *         schema:
   *           type: string
   *     responses:
   *       '204':
   *         description: no content
   *       '404':
   *         description: Task group not found
   *       '401':
   *         description: Unauthorized
   *
   */
  delete: async (ctx) => {
    // Validates if the user exists and if the user belongs to the task group an his rol is ADMIN
    const user = await User.findById(ctx.state.user.id).exec();
    if (!user) {
      ctx.status = 400;
      return;
    }
    const taskGroupUser = await TaskGroupUser.findById({
      taskGroup: ctx.taskGroup._id,
      user: user._id,
    }).exec();
    if (
      !taskGroupUser ||
      taskGroupUser.roleType !== RoleType.enumObj.ADMIN.code
    ) {
      ctx.status = 401;
      return;
    }

    const session = await Mongoose.startSession();
    session.startTransaction();

    try {
      await TaskGroupUser.deleteMany(
        { '_id.taskGroup': ctx.taskGroup._id },
        { session }
      ).exec();
      await TaskGroup.deleteOne({ _id: ctx.taskGroup._id }, { session }).exec();

      await session.commitTransaction();
    } catch (ex) {
      await session.abortTransaction();
      throw ex;
    } finally {
      session.endSession();
    }

    ctx.status = 204;
  },

  /**
   * @swagger
   *
   * /task-groups:
   *   get:
   *     summary: list all task groups
   *     operationId: listTaskGroups
   *     tags:
   *       - task groups
   *     responses:
   *       '200':
   *         description: success
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/TaskGroup'
   * /users/{user_id}/task-groups:
   *   get:
   *     summary: list all task groups of a given user
   *     operationId: listUserTaskGroups
   *     tags:
   *       - task groups
   *     parameters:
   *       - name: user_id
   *         in: path
   *         required: true
   *         description: the id of the user
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: success
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/TaskGroup'
   *       '404':
   *         description: User not found
   *
   */
  list: async (ctx) => {
    let taskGroups = [];
    if (ctx.params.user_id) {
      const user = await User.findById(ctx.params.user_id).exec();
      const taskGroupsUser = await TaskGroupUser.find({
        '_id.user': user._id,
      })
        .populate('_id.taskGroup')
        .exec();
      taskGroups = taskGroupsUser.map((taskGroupUser) =>
        taskGroupUser.toClient()
      );
    } else {
      taskGroups = await TaskGroup.find().exec();
      taskGroups = taskGroups.map((taskGroup) => taskGroup.toClient());
    }
    ctx.body = taskGroups;
  },

  /**
   * @swagger
   *
   * /task-groups/:
   *   delete:
   *     summary: delete all task groups
   *     operationId: clearTaskGroups
   *     tags:
   *       - task groups
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '204':
   *         description: no content
   *       '401':
   *         description: Unauthorized
   *
   */
  clear: async (ctx) => {
    const session = await Mongoose.startSession();
    session.startTransaction();

    try {
      await TaskGroupUser.deleteMany(undefined, { session }).exec();
      await TaskGroup.deleteMany(undefined, { session }).exec();

      await session.commitTransaction();
    } catch (ex) {
      await session.abortTransaction();
      throw ex;
    } finally {
      session.endSession();
    }

    ctx.status = 204;
  },
};

export default controller;
