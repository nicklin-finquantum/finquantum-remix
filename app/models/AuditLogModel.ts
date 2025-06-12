import mongoose, { type InferSchemaType, type Types } from 'mongoose';

// Enum for user roles
export enum TargetType {
  APPLICANT = 'applicant',
  APPLICATION = 'application',
  FILE = 'file',
  ORGANIZATION = 'organization',
  REPORT = 'report',
  USER = 'user'
}

// Define the AuditLog schema
const AuditLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: null,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    },
    targetType: {
      type: String,
      enum: Object.values(TargetType),
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

export type AuditLog  = InferSchemaType<typeof AuditLogSchema> & {
  _id: Types.ObjectId;
  id?: Types.ObjectId;
}

// Create the AuditLog model
const AuditLogModel = mongoose.model<AuditLog>('AuditLog', AuditLogSchema);

export default AuditLogModel;