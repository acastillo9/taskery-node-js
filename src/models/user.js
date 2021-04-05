import Mongoose from 'mongoose';
import { autoIncrement } from 'mongoose-plugin-autoinc';

const userSchema = new Mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      index: {
        unique: true,
      },
      match: [
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g,
      ],
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

userSchema.methods.toClient = function toClient() {
  const obj = this.toObject();

  // Rename fields
  obj.id = obj._id;

  // Delete fields
  delete obj._id;
  delete obj.__v;
  delete obj.createdAt;
  delete obj.updatedAt;
  delete obj.password;

  return obj;
};

userSchema.plugin(autoIncrement, {
  model: 'User',
  startAt: 1,
});

const User = Mongoose.model('User', userSchema);

export default User;
