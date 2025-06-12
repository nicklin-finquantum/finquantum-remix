import mongoose, { type InferSchemaType, type Types } from 'mongoose';

const OrgInviteSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
    },
    role: {
      type: String,
      default: 'Member',
    },
    invitedId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    inviterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
      default: null,
    },
    accepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export type OrgInvite = InferSchemaType<typeof OrgInviteSchema> & {
  _id: Types.ObjectId;
  id?: Types.ObjectId;
};

const OrgInviteModel = mongoose.model('OrgInvite', OrgInviteSchema);

export default OrgInviteModel;
