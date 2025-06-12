import mongoose, { type InferSchemaType, type Types } from 'mongoose';

const CodeSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export type Code = InferSchemaType<typeof CodeSchema> & {
  _id: Types.ObjectId;
  id?: Types.ObjectId;
};

const CodeModel = mongoose.model('Code', CodeSchema);

export default CodeModel;
