import { connectToDatabase } from '~/db/db.server';
import JWT from '~/lib/jwt.server';
import UserModel from '~/models/UserModel';

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
  newPassword: string,
): Promise<boolean> {
  try {
    await connectToDatabase();

    const user = await UserModel.findOne({
      _id: userId,
      delete: false,
    });

    if (!user) {
      return false;
    }

    // Extract salt and verify current password
    const salt = user.password.split('$')[0];
    const hashedCurrentPassword = JWT.hash(currentPassword, salt);

    if (hashedCurrentPassword !== user.password) {
      return false;
    }

    // Generate new salt and hash new password
    const newSalt = JWT.createSalt();
    const hashedNewPassword = JWT.hash(newPassword, newSalt);

    // Update password
    await UserModel.updateOne(
      { _id: userId },
      { password: hashedNewPassword },
    );

    // // Create audit log
    // await createAuditLog(
    //   userId,
    //   'password_change',
    //   'User changed password successfully'
    // );

    return true;

  } catch (error) {
    console.error('Change password error:', error);
    return false;
  }
}