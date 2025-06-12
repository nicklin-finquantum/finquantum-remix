import mongoose, { type InferSchemaType, type Types } from 'mongoose';

import type { Application } from './ApplicationModel';

// Define the Applicant schema
const ApplicantSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    userApplicantId: {
      type: String,
      required: true,
    },
    archive: { type: Boolean, default: false },
    archiveAt: {
      type: Date,
    },
    delete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Virtual populate for files
ApplicantSchema.virtual('files', {
  ref: 'File',
  localField: '_id',
  foreignField: 'applicantId',
});

// Infer the type from the schema
export type Applicant = InferSchemaType<typeof ApplicantSchema> & {
  _id: Types.ObjectId;
  id?: Types.ObjectId;
  owner: string;
  applicationId?: Application;
};

// Create the model
const ApplicantModel = mongoose.model<Applicant>('Applicant', ApplicantSchema);

export default ApplicantModel;
