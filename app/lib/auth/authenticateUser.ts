import { connectToDatabase } from '~/db/db.server';
import JWT from '~/lib/jwt.server';
import { fetchUser } from '~/lib/user/fetchUser.server';
import UserModel, { type User } from '~/models/UserModel';

/**
 * Authenticates a user with email and password (matching your backend logic)
 * @param email - User's email
 * @param password - User's plain text password
 * @returns Promise<{user: AuthUser, token: string} | null> - User and token if authenticated, null if not
 */
export async function authenticateUser(
  email: string,
  password: string,
): Promise<{ user: User, token: string } | null> {
  try {
    await connectToDatabase();

    // Find user by email (matching your backend logic)
    const user = await UserModel.findOne({
      email: email,
      delete: false,
    }).lean();

    if (!user) {
      return null;
    }

    // Extract salt from stored password (matching your backend logic)
    const salt = user.password.split('$')[0];

    // Hash the provided password with the extracted salt
    const hashedPassword = JWT.hash(password, salt);

    // Compare with stored password
    if (hashedPassword !== user.password) {
      return null;
    }

    // Generate JWT token with 1 day expiration
    const expirationTime = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 1 day in seconds

    const token = JWT.encode({
      userId: user._id.toString(),
      exp: expirationTime,
    });

    // Fetch complete user details
    const returnUser = await fetchUser(user._id.toString());

    if (!returnUser) {
      return null;
    }

    return {
      user: returnUser,
      token: token,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}