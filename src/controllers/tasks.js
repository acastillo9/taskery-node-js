import TaskGroup from '../models/task-group.js';
import Task from '../models/task.js';
import User from '../models/user.js';

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     Task:
 *       properties:
 *         id:
 *           type: number
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         frecuencyType:
 *           $ref: '#/components/schemas/FrecuencyType'
 *         responsible:
 *           $ref: '#/components/schemas/User'
 *         taskGroup:
 *           $ref: '#/components/schemas/TaskGroup'
 *     TaskCreate:
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         frecuencyType:
 *           type: object
 *           properties:
 *             code:
 *               type: string
 *           required:
 *             - code
 *         responsible:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *           required:
 *             - id
 *         taskGroup:
 *           type: object
 *           properties:
 *             id:
 *               type: number
 *           required:
 *             - id
 *       required:
 *         - title
 *         - description
 *         - frecuencyType
 *         - responsible
 *         - taskGroup
 *     FrecuencyType:
 *       properties:
 *         code:
 *           type: string
 *         description:
 *           type: string
 *
 */
const controller = {
  getById: async (id, ctx, next) => {
    ctx.task = await Task.findById(id).populate('responsible').exec();
    if (!ctx.task) {
      ctx.status = 404;
      return undefined;
    }
    return next();
  },

  /**
   * @swagger
   *
   * /tasks/:
   *   post:
   *     summary: create a new task
   *     operationId: createTask
   *     tags:
   *       - tasks
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskCreate'
   *     responses:
   *       '201':
   *         description: Task created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       '400':
   *         description: Invalid request
   *       '401':
   *         description: Unauthorized
   *
   */
  create: async (ctx) => {
    const user = await User.findById(ctx.request.body.responsible.id);
    if (!user) {
      ctx.status = 400;
      return;
    }
    const taskGroup = await TaskGroup.findById(ctx.request.body.taskGroup.id);
    if (!taskGroup) {
      ctx.status = 400;
      return;
    }
    let task = new Task({
      name: ctx.request.body.name,
      description: ctx.request.body.description,
      frecuencyType: ctx.request.body.frecuencyType.code,
      responsible: user._id,
      taskGroup: taskGroup._id,
    });
    task = await task.save();
    await task.populate('responsible').populate('taskGroup').execPopulate();
    ctx.body = task.toClient();
    ctx.status = 201;
  },

  /**
   * @swagger
   *
   * /tasks/{task_id}:
   *   get:
   *     summary: get a task by id
   *     operationId: readTask
   *     tags:
   *       - tasks
   *     parameters:
   *       - name: task_id
   *         in: path
   *         required: true
   *         description: the id of the task to retrieve
   *         schema:
   *           type: string
   *     responses:
   *       '200':
   *         description: success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       '404':
   *         description: Task not found
   *
   */
  read: async (ctx) => {
    ctx.body = ctx.task.toClient();
  },

  /**
   * @swagger
   *
   * /tasks/{task_id}:
   *   put:
   *     summary: update a task by id
   *     operationId: updateTask
   *     tags:
   *       - tasks
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: task_id
   *         in: path
   *         required: true
   *         description: the id of the task to update
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/TaskCreate'
   *     responses:
   *       '200':
   *         description: success
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Task'
   *       '400':
   *         description: Invalid request
   *       '401':
   *         description: Unauthorized
   *       '404':
   *         description: Task not found
   *
   */
  update: async (ctx) => {
    const user = await User.findById(ctx.request.body.responsible.id);
    if (!user) {
      ctx.body = 400;
      return;
    }
    const { task } = ctx.task;
    task.name = ctx.request.body.name;
    task.description = ctx.request.body.description;
    task.frecuencyType = ctx.request.body.frecuencyType;
    task.responsible = user._id;
    await task.save();
    await task.populate('responsible').populate('taskGroup').execPopulate();
    ctx.body = task.toClient();
  },

  /**
   * @swagger
   *
   * /tasks/{task_id}:
   *   delete:
   *     summary: delete a task by id
   *     operationId: deleteTask
   *     tags:
   *       - tasks
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: task_id
   *         in: path
   *         required: true
   *         description: the id of the task to delete
   *         schema:
   *           type: string
   *     responses:
   *       '204':
   *         description: no content
   *       '404':
   *         description: Task not found
   *       '401':
   *         description: Unauthorized
   *
   */
  delete: async (ctx) => {
    await Task.findOneAndDelete({ _id: ctx.task.id }).exec();
    ctx.status = 204;
  },

  /**
   * @swagger
   *
   * /tasks/:
   *   get:
   *     summary: list all tasks
   *     operationId: listTasks
   *     tags:
   *       - tasks
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       '200':
   *         description: success
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Task'
   * /users/{user_id}/tasks/:
   *   get:
   *     summary: list all tasks responsability by a given user
   *     operationId: listUserTasks
   *     tags:
   *       - tasks
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - name: user_id
   *         in: path
   *         required: true
   *         description: the id of the responsible
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
   *                 $ref: '#/components/schemas/Task'
   *       '404':
   *         description: User not found
   *
   */
  list: async (ctx) => {
    const req = {};
    if (ctx.query.user_id) {
      try {
        const user = await User.findById(ctx.query.user_id).exec();
        req.responsible = user._id;
      } catch (err) {
        req.responsible = null;
      }
    }
    let tasks = await Task.find(req)
      .populate('taskGroup')
      .populate('responsible')
      .exec();
    tasks = tasks.map((task) => task.toClient());
    ctx.body = tasks;
  },

  /**
   * @swagger
   *
   * /tasks/:
   *   delete:
   *     summary: delete all tasks
   *     operationId: clearTasks
   *     tags:
   *       - tasks
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
    await Task.deleteMany().exec();
    ctx.status = 204;
  },
};

export default controller;
