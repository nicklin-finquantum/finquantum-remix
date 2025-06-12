import mongoose, { type InferSchemaType, type Types } from 'mongoose';

const ReportAlertSchema = new mongoose.Schema({
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
  },
  link: {
    type: String,
    default: null,
  },
  reportName: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  orgId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
  },
});

export type ReportAlert = InferSchemaType<typeof ReportAlertSchema> & {
  _id: Types.ObjectId;
  id?: Types.ObjectId;
};

const ReportAlertModel = mongoose.model('ReportAlert', ReportAlertSchema);

export default ReportAlertModel;
