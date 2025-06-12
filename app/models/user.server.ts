import dotenv from 'dotenv';
import mongoose, { type InferSchemaType, type Types } from 'mongoose';

import { OrgRole } from './OrganizationModel';

dotenv.config();

// Enum for user roles
export enum UserRole {
  SUPERADMIN = 'Superadmin',
  USER = 'User'
}

// Mongoose schema for users
const UsersSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      index: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    organization: {
      type: {
        id: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' },
        role: {
          type: String,
          enum: Object.values(OrgRole), // Ensure OrgRole is properly validated
        },
      },
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// Infer the type from the schema
export type User = InferSchemaType<typeof UsersSchema> & {
  _id: Types.ObjectId; // Add _id explicitly if needed in other parts of the app
  id?: Types.ObjectId; // Sometimes Mongoose uses `id` as a virtual property
};

// Mongoose model for users
const UserModel = mongoose.model('User', UsersSchema);

export default UserModel;
