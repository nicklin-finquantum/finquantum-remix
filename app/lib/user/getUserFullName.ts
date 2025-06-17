import type { User } from '~/models/UserModel';

/**
 * Gets user's full name
 * @param user - The user object
 * @returns string - Full name
 */
export function getUserFullName(user: User): string {
  return `${user.firstName} ${user.lastName}`.trim();
}
