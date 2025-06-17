import ApplicationModel from '~/models/ApplicationModel';
import type { User } from '~/models/UserModel';
import { isSuperAdmin } from '~/utils/utils';

// Fetch a list of applications with sorting
export const fetchApplicationListHelper = async (
  query: Record<string, any>, // Use Record<string, any> for the query parameter
  sort: -1 | 1 = -1, // Type of sorting
) => {
  console.log(`[INFO] query: ${JSON.stringify(query)}`);
  const applicationList = await ApplicationModel.find(query)
    .populate({
      path: 'userId',
      select: 'firstName lastName',
    })
    .sort({ createdAt: sort })
    .lean();

  // Map the results to include a separate `user` field
  const transformedApplications = applicationList.map((application) => ({
    ...application,
    user: application.userId, // Assign populated userId to `user`
    userId: application.userId?._id, // Keep userId as the original _id
  }));

  return transformedApplications.map((application) => ({
    id: application._id,
    userApplicationId: application.userApplicationId,
    createdAt: application.createdAt,
    status: application.status,
    owner:
      (application.user?.firstName ?? '') +
      ' ' +
      (application.user?.lastName ?? ''),
  }));
};

// Define an interface for options
interface ListApplicationOptions {
  getAll: boolean;
  getOrgAll: boolean;
  archive: boolean;
  sort: 1 | -1;
}

export const fetchApplicationList = async (
  user: User | null,
  options: ListApplicationOptions,
) => {
  const { getAll, getOrgAll, archive, sort } = options;

  console.log(`[INFO] Getting application list for ${'mortgageAnalysis'}`);

  if (!user) {
    return null;
  }

  if (
    (getOrgAll && isSuperAdmin(user))
  ) {
    return null;
  }

  return await fetchApplicationListHelper(
    {
      ...(getAll ? {} : { orgId: user.organization.id }),
      ...(!getAll && !getOrgAll ? { userId: user._id } : {}),
      // productId: new Types.ObjectId('66418d0490681d73e08bdbf0'),
      archive: archive,
      delete: false,
    },
    sort,
  );
};