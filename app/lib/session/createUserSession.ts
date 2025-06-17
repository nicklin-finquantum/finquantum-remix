import { redirect } from '@remix-run/react';

import { commitSession, getUserSession } from '~/lib/session.server';

/**
 * Creates a user session and redirects (stores token in session)
 * @param options - Session creation options
 * @returns Promise<Response> - Redirect response with session cookie
 */
export async function createUserSession(request: Request, options: {
  token: string;
  remember?: boolean;
  redirectTo?: string;
}): Promise<Response> {
  const { token, remember = false, redirectTo = '/' } = options;

  const session = await getUserSession(request);
  session.set('token', token);

  const cookieOptions = remember
    ? { maxAge: 60 * 60 * 24 * 30 } // 30 days
    : undefined; // Session cookie (expires when browser closes)

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await commitSession(session, cookieOptions),
    },
  });
}