import type { Types } from 'mongoose';

import ApplicationModel from '~/models/ApplicationModel';
import { OrgRole } from '~/models/OrganizationModel';

// Fetch a single application by ID with orgId and userId conditions
export const fetchApplication = async (
  applicationId: Types.ObjectId,
  orgId: Types.ObjectId | null = null,
  orgRole: OrgRole = OrgRole.MEMBER,
  userId: Types.ObjectId | null = null,
  isAdmin = false,
) => {
  console.log(`[INFO] Getting application with id: ${applicationId}`);
  return await ApplicationModel.findOne({
    _id: applicationId,
    ...(isAdmin ? {} : { orgId: orgId }), // Apply userId filter if not an admin
    ...(orgRole === OrgRole.ADMIN ? {} : { userId: userId }), // Apply userId filter if not an admin
    delete: false,
  }).lean();
};
