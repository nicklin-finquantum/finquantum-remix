import mongoose, { type InferSchemaType, type Types } from 'mongoose';

import type { Application } from './ApplicationModel';

export interface ReportPayload {
  requestBy: string;
  date: string;
  applicationId: string;
  realApplicationId: Types.ObjectId;
  reportId: string;
  inputs: Array<{
    name: string;
    files: { [key: string]: Array<{ name: string; path: string }> };
  }>;
}

const ReportSchema = new mongoose.Schema(
  {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    inputs: [
      {
        applicant: {
          id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Applicant',
          },
          files: [
            {
              type: mongoose.Schema.Types.ObjectId,
              ref: 'File',
            },
          ],
        },
      },
    ],
    reportId: {
      type: String,
    },
    reportType: {
      type: String,
    },
    archive: { type: Boolean, default: false },
    archiveAt: {
      type: Date,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    status: {
      percent: {
        type: Number,
        default: 0,
      },
      finished: {
        type: Boolean,
        default: false,
      },
      text: {
        type: String,
        default: '',
      },
      text_detailed: {
        type: String,
        default: '',
      },
      error: {
        type: Boolean,
        default: false,
      },
      error_text: {
        type: String,
        default: '',
      },
      updated_at: {
        type: Date,
        default: Date.now,
      },
      validated: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  },
);

export type Report = InferSchemaType<typeof ReportSchema> & {
  _id: Types.ObjectId;
  id?: Types.ObjectId;
  applicationId?: Application;
};

const ReportModel = mongoose.model('Report', ReportSchema);

export default ReportModel;
