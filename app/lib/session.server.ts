import { createCookieSessionStorage } from '@remix-run/node';

import JWT from '~/lib/jwt.server';

if (!process.env.JWT_SECRET_KEY) {
  throw new Error('JWT_SECRET_KEY environment variable is required');
}

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    maxAge: 0, // Session cookie by default
    path: '/',
    sameSite: 'lax',
    secrets: [process.env.JWT_SECRET_KEY!],
    secure: process.env.NODE_ENV === 'production',
  },
});

export const getUserSession = async (request: Request) => {
  return await sessionStorage.getSession(
    request.headers.get('Cookie'),
  );
};

// Helper function to get user ID from session
export const getUserIdFromSession = async (request: Request): Promise<string | null> => {
  try {
    const session = await getUserSession(request);

    const token = session.get('token');

    return JWT.decode(token)?.userId;
  } catch (error) {
    console.error('Error getting user ID:', error);
    return null;
  }
};

export const { getSession, commitSession, destroySession } = sessionStorage;