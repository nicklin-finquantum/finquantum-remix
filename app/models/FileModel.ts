import mongoose, { type InferSchemaType, type Types } from 'mongoose';

const FileSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Applicant',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
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
    },
  },
  {
    timestamps: true,
  },
);

export type File = InferSchemaType<typeof FileSchema> & {
  _id: Types.ObjectId;
  inDb?: boolean;
};

const FileModel = mongoose.model('File', FileSchema);

export default FileModel;
