import { createCookieSessionStorage } from '@remix-run/node';

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

export const { getSession: getUserSession, commitSession, destroySession } = sessionStorage;