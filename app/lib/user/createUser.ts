import { connectToDatabase } from '~/db/db.server';
import JWT from '~/lib/jwt.server';
import { fetchUser } from '~/lib/user/fetchUser.server';
import UserModel, { type User, UserRole } from '~/models/UserModel';

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
  role?: string;
  avatar?: string;
  organization?: {
    id: string;
    role: string;
  };
}): Promise<{ user: User, token: string } | null> {
  try {
    await connectToDatabase();

    // Check if user already exists
    const existingUser = await UserModel.findOne({
      email: userData.email.toLowerCase().trim(),
      delete: false,
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // Generate salt and hash password (matching your backend logic)
    const salt = JWT.createSalt();
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
      delete: false,
    });

    // Generate JWT token
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
    const token = JWT.encode({
      userId: newUser._id,
      exp: expirationTime,
    });

    // // Create audit log for registration
    // await createAuditLog(
    //   newUser._id.toString(),
    //   'register',
    //   `User registered successfully with email ${userData.email}`
    // );

    // Fetch complete user details
    const returnUser = await fetchUser(newUser._id.toString());

    if (!returnUser) {
      return null;
    }

    return {
      user: returnUser,
      token: token,
    };

  } catch (error) {
    console.error('User creation error:', error);
    return null;
  }
}