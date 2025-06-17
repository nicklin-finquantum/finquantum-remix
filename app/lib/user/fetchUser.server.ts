import { connectToDatabase } from '~/db/db.server';
import UserModel, { type User } from '~/models/UserModel';

/**
 * Fetch user details (matching your backend fetchUser service)
 */
export async function fetchUser(userId: string): Promise<User | null> {
  try {
    await connectToDatabase();

    const user = await UserModel.findOne({
      _id: userId,
      delete: false,
    }).lean();

    if (!user) {
      return null;
    }

    return {
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      organization: user.organization ? {
        id: user.organization.id,
        role: user.organization.role,
      } : null,
    };
  } catch (error) {
    console.error('Fetch user error:', error);
    return null;
  }
}