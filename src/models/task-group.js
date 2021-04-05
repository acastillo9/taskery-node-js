import Mongoose from 'mongoose';
import { autoIncrement } from 'mongoose-plugin-autoinc';

const taskGroupSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

taskGroupSchema.methods.toClient = function toClient() {
  const obj = this.toObject();

  // Rename fields
  obj.id = obj._id;

  // Delete fields
  delete obj._id;
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;

  return obj;
};

taskGroupSchema.plugin(autoIncrement, {
  model: 'TaskGroup',
  startAt: 1,
});

const TaskGroup = Mongoose.model('TaskGroup', taskGroupSchema);

export default TaskGroup;
