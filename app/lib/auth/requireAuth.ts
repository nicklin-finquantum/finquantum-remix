import { redirect } from '@remix-run/node';

import { getUserIdFromSession } from '~/lib/session.server';
import { fetchUser } from '~/lib/user/fetchUser.server';
import { UserRole, type User } from '~/models/UserModel';
import { SIGNIN_URL } from '~/utils/consts';

/**
 * Requires user to be authenticated, redirects to login if not
 * @param request - The request object
 * @param redirectTo - Where to redirect after login
 * @returns Promise<AuthUser> - The authenticated user
 */
export async function requireAuth(
  request: Request,
) {
  const userId = await getUserIdFromSession(request);

  if (!userId) {
    throw redirect(SIGNIN_URL);
  }

  return await fetchUser(userId);
}

/**
 * Requires user to have specific role(s)
 * @param request - The request object
 * @param allowedRoles - Array of allowed user roles
 * @param redirectTo - Where to redirect if unauthorized
 * @returns Promise<User> - The authenticated and authorized user
 */
export async function requireRole(
  request: Request,
  allowedRoles: UserRole[],
  redirectTo = '/unauthorized',
): Promise<User> {
  const user = await requireAuth(request);

  if (!user?.role || !allowedRoles.includes(user?.role)) {
    throw redirect(redirectTo);
  }

  return user;
}

/**
 * Requires user to be a superadmin
 * @param request - The request object
 * @param redirectTo - Where to redirect if unauthorized
 * @returns Promise<AuthUser> - The authenticated superadmin user
 */
export async function requireSuperAdmin(
  request: Request,
  redirectTo = '/unauthorized',
): Promise<User> {
  return requireRole(request, [UserRole.SUPERADMIN], redirectTo);
}