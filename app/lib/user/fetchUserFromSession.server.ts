import { getUserIdFromSession } from '~/lib/session.server';
import { fetchUser } from '~/lib/user/fetchUser.server';

export const fetchUserFromSession = async (request: Request) => {
  const userId = await getUserIdFromSession(request); // session, cookie, etc.
  if (!userId) {
    return null;
  }
  return await fetchUser(userId);
};
