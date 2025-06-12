import { redirect } from '@remix-run/node';
import { connectToDatabase } from '~/db/db.server';
import UserModel, { UserRole, type User } from '~/models/user.server';
import { getUserSession, commitSession, destroySession } from '~/utils/session.server';
import JWT from '~/utils/jwt.server';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string | null;
  organization?: {
    id: string;
    role: string;
  } | null;
}

/**
 * Parse request parameters (matching your backend parseParams function)
 */
export function parseParams(request: Request, requiredFields: string[]): Record<string, any> {
  const url = new URL(request.url);
  const params: Record<string, any> = {};

  // Get from URL params for GET requests
  for (const field of requiredFields) {
    const value = url.searchParams.get(field);
    if (value) {
      params[field] = value;
    }
  }

  return params;
}

/**
 * Create audit log entry (placeholder - implement based on your audit system)
 */
export async function createAuditLog(
  userId: string,
  action: string,
  description: string
): Promise<void> {
  try {
    // Implement your audit logging logic here
    console.log(`Audit Log - User: ${userId}, Action: ${action}, Description: ${description}`);

    // Example: Save to audit log collection
    // await AuditLogModel.create({
    //   userId,
    //   action,
    //   description,
    //   timestamp: new Date(),
    //   ipAddress: getClientIP(request)
    // });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

/**
 * Fetch user details (matching your backend fetchUser service)
 */
export async function fetchUser(userId: string): Promise<AuthUser | null> {
  try {
    await connectToDatabase();

    const user = await UserModel.findOne({
      _id: userId,
      delete: false
    }).lean();

    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      organization: user.organization ? {
        id: user.organization.id.toString(),
        role: user.organization.role
      } : null
    };
  } catch (error) {
    console.error('Fetch user error:', error);
    return null;
  }
}

/**
 * Authenticates a user with email and password (matching your backend logic)
 * @param email - User's email
 * @param password - User's plain text password
 * @returns Promise<{user: AuthUser, token: string} | null> - User and token if authenticated, null if not
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<{ user: AuthUser, token: string } | null> {
  try {
    await connectToDatabase();

    // Find user by email (matching your backend logic)
    const user = await UserModel.findOne({
      email: email,
      delete: false
    }).lean();

    if (!user) {
      return null;
    }

    // Extract salt from stored password (matching your backend logic)
    const salt = user.password.split("$")[0];

    // Hash the provided password with the extracted salt
    const hashedPassword = JWT.hash(password, salt);

    // Compare with stored password
    if (hashedPassword !== user.password) {
      return null;
    }

    // Create audit log for successful login
    await createAuditLog(
      user._id.toString(),
      'login',
      `User logged in successfully with email ${email}`
    );

    // Generate JWT token with 1 day expiration
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day in seconds

    const token = JWT.encode({
      userId: user._id.toString(),
      exp: expirationTime
    });

    // Fetch complete user details
    const returnUser = await fetchUser(user._id.toString());

    if (!returnUser) {
      return null;
    }

    return {
      user: returnUser,
      token: token
    };

  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

/**
 * Creates a new user account (matching your backend password hashing)
 * @param userData - User registration data
 * @returns Promise<{user: AuthUser, token: string} | null> - Created user and token or null if failed
 */
export async function createUser(userData: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role?: UserRole;
  avatar?: string;
  organization?: {
    id: string;
    role: string;
  };
}): Promise<{ user: AuthUser, token: string } | null> {
  try {
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      email: userData.email.toLowerCase().trim(),
      delete: false
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Generate salt and hash password (matching your backend logic)
    const salt = JWT.generateSalt();
    const hashedPassword = JWT.hash(userData.password, salt);

    // Create user
    const newUser = await UserModel.create({
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email.toLowerCase().trim(),
      password: hashedPassword,
      role: userData.role || UserRole.USER,
      avatar: userData.avatar || null,
      organization: userData.organization || null,
      delete: false
    });

    // Generate JWT token
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    const token = JWT.encode({
      userId: newUser._id,
      exp: expirationTime
    });

    // Create audit log for registration
    await createAuditLog(
      newUser._id.toString(),
      'register',
      `User registered successfully with email ${userData.email}`
    );

    // Fetch complete user details
    const returnUser = await fetchUser(newUser._id.toString());

    if (!returnUser) {
      return null;
    }

    return {
      user: returnUser,
      token: token
    };

  } catch (error) {
    console.error('User creation error:', error);
    return null;
  }
}

/**
 * Creates a user session and redirects (stores token in session)
 * @param options - Session creation options
 * @returns Promise<Response> - Redirect response with session cookie
 */
export async function createUserSession(options: {
  request: Request;
  userId: string;
  token: string;
  remember?: boolean;
  redirectTo?: string;
}): Promise<Response> {
  const { request, userId, token, remember = false, redirectTo = '/' } = options;

  const session = await getUserSession(userId);
  session.set('userId', userId);
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

/**
 * Gets the current user from session token
 * @param request - The request object
 * @returns Promise<AuthUser | null> - Current user or null if not authenticated
 */
export async function getCurrentUser(request: Request): Promise<AuthUser | null> {
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
    const user = await fetchUser(payload.userId);

    return user;

  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
}

/**
 * Requires user to be authenticated, redirects to login if not
 * @param request - The request object
 * @param redirectTo - Where to redirect after login
 * @returns Promise<AuthUser> - The authenticated user
 */
export async function requireAuth(
  request: Request,
  redirectTo: string = new URL(request.url).pathname
): Promise<AuthUser> {
  const user = await getCurrentUser(request);

  if (!user) {
    const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }

  return user;
}

/**
 * Requires user to have specific role(s)
 * @param request - The request object
 * @param allowedRoles - Array of allowed user roles
 * @param redirectTo - Where to redirect if unauthorized
 * @returns Promise<AuthUser> - The authenticated and authorized user
 */
export async function requireRole(
  request: Request,
  allowedRoles: UserRole[],
  redirectTo: string = '/unauthorized'
): Promise<AuthUser> {
  const user = await requireAuth(request);

  if (!allowedRoles.includes(user.role)) {
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
  redirectTo: string = '/unauthorized'
): Promise<AuthUser> {
  return requireRole(request, [UserRole.SUPERADMIN], redirectTo);
}

/**
 * Changes user password (matching your backend hashing)
 * @param userId - The user ID
 * @param currentPassword - Current password for verification
 * @param newPassword - New password to set
 * @returns Promise<boolean> - True if successful, false otherwise
 */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> {
  try {
    await connectToDatabase();

    const user = await UserModel.findOne({
      _id: userId,
      delete: false
    });

    if (!user) {
      return false;
    }

    // Extract salt and verify current password
    const salt = user.password.split("$")[0];
    const hashedCurrentPassword = JWT.hash(currentPassword, salt);

    if (hashedCurrentPassword !== user.password) {
      return false;
    }

    // Generate new salt and hash new password
    const newSalt = JWT.generateSalt();
    const hashedNewPassword = JWT.hash(newPassword, newSalt);

    // Update password
    await UserModel.updateOne(
      { _id: userId },
      { password: hashedNewPassword }
    );

    // Create audit log
    await createAuditLog(
      userId,
      'password_change',
      'User changed password successfully'
    );

    return true;

  } catch (error) {
    console.error('Change password error:', error);
    return false;
  }
}

/**
 * Logs out the user by destroying the session
 * @param request - The request object
 * @param redirectTo - Where to redirect after logout
 * @returns Promise<Response> - Redirect response with destroyed session
 */
export async function logout(
  request: Request,
  redirectTo: string = '/'
): Promise<Response> {
  const session = await getUserSession(request);

  // Get user for audit log before destroying session
  const user = await getCurrentUser(request);
  if (user) {
    await createAuditLog(
      user.id,
      'logout',
      'User logged out successfully'
    );
  }

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await destroySession(session),
    },
  });
}

/**
 * Gets user's full name
 * @param user - The user object
 * @returns string - Full name
 */
export function getUserFullName(user: AuthUser): string {
  return `${user.firstName} ${user.lastName}`.trim();
}

/**
 * Checks if user is authenticated (for optional auth)
 * @param request - The request object
 * @returns Promise<boolean> - True if authenticated, false otherwise
 */
export async function isAuthenticated(request: Request): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user !== null;
}