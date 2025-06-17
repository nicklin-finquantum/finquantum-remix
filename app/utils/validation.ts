/**
 * Validates email format using a comprehensive regex pattern
 * @param email - The email string to validate
 * @returns boolean - true if email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Comprehensive email regex pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  // Additional checks
  const trimmedEmail = email.trim();

  // Basic length check
  if (trimmedEmail.length < 5 || trimmedEmail.length > 254) {
    return false;
  }

  // Check for consecutive dots
  if (trimmedEmail.includes('..')) {
    return false;
  }

  // Check if starts or ends with dot
  if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
    return false;
  }

  return emailRegex.test(trimmedEmail);
};

/**
 * Get detailed password validation errors
 * @param password - The password string to validate
 * @param options - Optional configuration for password requirements
 * @returns array of error messages
 */
export const getPasswordValidationErrors = (
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
    maxLength?: number;
  } = {},
): string[] => {
  const errors: string[] = [];

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
    return errors;
  }

  const {
    minLength = 8,
    requireUppercase = false,
    requireLowercase = false,
    requireNumbers = false,
    requireSpecialChars = false,
    maxLength = 128,
  } = options;

  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }

  if (password.length > maxLength) {
    errors.push(`Password must be no more than ${maxLength} characters long`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (requireNumbers && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (requireSpecialChars && !/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return errors;
};

/**
 * Get detailed email validation error
 * @param email - The email string to validate
 * @returns string error message or null if valid
 */
export const getEmailValidationError = (email: string): string | null => {
  if (!email || typeof email !== 'string') {
    return 'Email is required';
  }

  const trimmedEmail = email.trim();

  if (trimmedEmail.length < 5) {
    return 'Email is too short';
  }

  if (trimmedEmail.length > 254) {
    return 'Email is too long';
  }

  if (trimmedEmail.includes('..')) {
    return 'Email cannot contain consecutive dots';
  }

  if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
    return 'Email cannot start or end with a dot';
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%^&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmedEmail)) {
    return 'Invalid email format';
  }

  return null;
};
