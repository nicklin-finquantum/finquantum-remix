import mongoose, { type InferSchemaType, type Types } from 'mongoose';

// 'User' means too many things so use Member instead in orgs
export enum OrgRole {
  ADMIN = 'Admin',
  MEMBER = 'Member'
}

const OrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: null,
    },
    logo: {
      type: String,
      default: null,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    mortgage_status_custom: {
      type: [String],
      default: [
        'Initial Review',
        'Waiting for Documents',
        'Needs Credit Repair',
        'Review Complete',
        'Need More Info',
        'Credit Evaluation Completed',
        'Pre-approved',
        'Started',
      ],
    },
    /*users: {
      type: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: String
      }],
      default: []
    }*/
  },
  {
    timestamps: true,
  },
);

export type Organization = InferSchemaType<typeof OrganizationSchema> & {
  _id: Types.ObjectId;
  id?: Types.ObjectId;
};
const OrganizationModel = mongoose.model('Organization', OrganizationSchema);

export default OrganizationModel;
