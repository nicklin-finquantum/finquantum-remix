import { redirect } from '@remix-run/node';

import { getUserSession, destroySession } from '~/lib/session.server';

/**
 * Logs out the user by destroying the session
 * @param request - The request object
 * @param redirectTo - Where to redirect after logout
 * @returns Promise<Response> - Redirect response with destroyed session
 */
export async function logout(
  request: Request,
  redirectTo = '/',
): Promise<Response> {
  const session = await getUserSession(request);

  // Get user for audit log before destroying session
  // const user = await getCurrentUser(request);
  // if (user) {
  //   await createAuditLog(
  //     user.id,
  //     'logout',
  //     'User logged out successfully'
  //   );
  // }

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}