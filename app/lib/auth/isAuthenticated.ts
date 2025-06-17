import { getCurrentUser } from '~/lib/user/getCurrentUser';

/**
 * Checks if user is authenticated (for optional auth)
 * @param request - The request object
 * @returns Promise<boolean> - True if authenticated, false otherwise
 */
export async function isAuthenticated(request: Request): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user !== null;
}