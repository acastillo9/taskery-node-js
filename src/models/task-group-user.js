import Mongoose from 'mongoose';
import RoleType from './role-type.js';

const taskGroupUserSchema = new Mongoose.Schema(
  {
    _id: {
      taskGroup: {
        type: Number,
        required: true,
        ref: 'TaskGroup',
      },
      user: {
        type: Number,
        required: true,
        ref: 'User',
      },
    },
    roleType: {
      type: String,
      enum: RoleType.getKeys(),
      required: true,
    },
  },
  { timestamps: true }
);

taskGroupUserSchema.methods.toClient = function toClient() {
  const obj = this.toObject();

  // Rename fields
  obj.taskGroup =
    typeof obj._id.taskGroup === 'object'
      ? {
          id: obj._id.taskGroup._id,
          name: obj._id.taskGroup.name,
          description: obj._id.taskGroup.description,
        }
      : undefined;
  obj.user =
    typeof obj._id.user === 'object'
      ? {
          id: obj._id.user._id,
          name: obj._id.user.name,
          email: obj._id.user.email,
        }
      : undefined;
  obj.roleType = RoleType.getValueByKey(obj.roleType);

  // Delete fields
  delete obj._id;
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;

  return obj;
};

const TaskGroupUser = Mongoose.model('TaskGroupUser', taskGroupUserSchema);

export default TaskGroupUser;
