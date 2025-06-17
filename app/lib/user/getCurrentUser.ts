import JWT from '~/lib/jwt.server';
import { getUserSession } from '~/lib/session.server';
import { fetchUser } from '~/lib/user/fetchUser.server';
import type { User } from '~/models/UserModel';

/**
 * Gets the current user from session token
 * @param request - The request object
 * @returns Promise<AuthUser | null> - Current user or null if not authenticated
 */
export async function getCurrentUser(request: Request): Promise<User | null> {
  try {
    const session = await getUserSession(request);
    const token = session.get('token');

    if (!token) {
      return null;
    }

    // Decode and verify JWT token
    const payload = JWT.decode(token);
    if (!payload || !payload.userId) {
      return null;
    }

    // Fetch user from database
    const user = await fetchUser(payload?.userId);

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}