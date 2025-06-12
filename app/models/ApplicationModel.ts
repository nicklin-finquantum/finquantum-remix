import mongoose, { type InferSchemaType, type Types } from 'mongoose';

import type { User } from './user.server';

const ApplicationSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    userApplicationId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'Started',
    },
    index: {
      type: Number,
      default: 1,
    },
    archive: { type: Boolean, default: false },
    archiveAt: {
      type: Date,
    },
    delete: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

// The type for Application should include userId as either an ObjectId or a populated User
export type Application = InferSchemaType<typeof ApplicationSchema> & {
  _id: Types.ObjectId;
  userId?: User;
};

const ApplicationModel = mongoose.model<Application>(
  'Application',
  ApplicationSchema,
);

export default ApplicationModel;
