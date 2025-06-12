import mongoose, { type InferSchemaType, type Types } from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: {
      type: String,
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
    link: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export type Notification = InferSchemaType<typeof NotificationSchema> & {
  _id: Types.ObjectId;
  id?: Types.ObjectId;
};

const NotificationModel = mongoose.model('Notification', NotificationSchema);

export default NotificationModel;
