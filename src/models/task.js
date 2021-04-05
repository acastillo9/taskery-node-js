import Mongoose from 'mongoose';
import { autoIncrement } from 'mongoose-plugin-autoinc';
import FrecuencyType from './frecuency-type.js';

const taskSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    frecuencyType: {
      type: String,
      enum: FrecuencyType.getKeys(),
      required: true,
    },
    responsible: {
      type: Number,
      required: true,
      ref: 'User',
    },
    taskGroup: {
      type: Number,
      required: true,
      ref: 'TaskGroup',
    },
  },
  { timestamps: true }
);

taskSchema.methods.toClient = function toClient() {
  const obj = this.toObject();

  // Rename fields
  obj.id = obj._id;
  obj.responsible = {
    id: obj.responsible._id,
    name: obj.responsible.name,
    email: obj.responsible.email,
  };
  obj.frecuencyType = FrecuencyType.getValueByKey(obj.frecuencyType);
  obj.taskGroup = {
    id: obj.taskGroup._id,
    name: obj.taskGroup.name,
    description: obj.taskGroup.description,
  };

  // Delete fields
  delete obj._id;
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;

  return obj;
};

taskSchema.plugin(autoIncrement, {
  model: 'Task',
  startAt: 1,
});

const Task = Mongoose.model('Task', taskSchema);

export default Task;
