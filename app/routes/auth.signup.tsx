import { redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { AuthAbout } from '~/components/auth/about';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { createUserSession } from '~/lib/session/createUserSession';
import { getUserIdFromSession } from '~/lib/session.server';
import { createUser } from '~/lib/user/createUser';
import UserRole from '~/types/userRole';
import { SIGNIN_URL } from '~/utils/consts';
import { getPasswordValidationErrors, getEmailValidationError } from '~/utils/validation';

interface ActionData {
  errors?: {
    code?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    rePassword?: string;
    form?: string;
  };
  success?: boolean;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Redirect if user is already authenticated
  const userId = await getUserIdFromSession(request);
  if (userId) {
    return redirect('/');
  }
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  // const code = formData.get('code')?.toString();
  const firstName = formData.get('firstName')?.toString();
  const lastName = formData.get('lastName')?.toString();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const rePassword = formData.get('rePassword')?.toString();

  const errors: ActionData['errors'] = {};

  // Validate first name
  if (!firstName) {
    errors.firstName = 'First Name is required';
  }

  // Validate last name
  if (!lastName) {
    errors.lastName = 'Last Name is required';
  }

  // Validate email
  if (!email) {
    errors.email = 'Email is required';
  } else {
    const emailError = getEmailValidationError(email);
    if (emailError) {
      errors.email = emailError;
    }
  }

  // Validate password
  if (!password) {
    errors.password = 'Password is required';
  } else {
    const passwordErrors = getPasswordValidationErrors(password, {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
    });
    if (passwordErrors.length > 0) {
      errors.password = passwordErrors.join(', ');
    }
  }

  // Validate password confirmation
  if (!rePassword) {
    errors.rePassword = 'Please confirm your password';
  } else if (password !== rePassword) {
    errors.rePassword = 'Passwords do not match';
  }

  // Return errors if validation fails
  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  try {
    // Create user account
    const result = await createUser({
      firstName: firstName!,
      lastName: lastName!,
      email: email!,
      password: password!,
      role: UserRole.USER,
    });

    if (!result || !result.user.id) {
      return Response.json(
        { errors: { form: 'Failed to create account. Please try again.' } },
        { status: 400 },
      );
    }

    // Create user session and redirect
    return createUserSession(request, {
      token: result.token,
      remember: true,
      redirectTo: '/',
    });
  } catch (error: any) {
    console.error('Sign up error:', error);

    // Handle specific error cases
    if (error.message?.includes('email already exists')) {
      return Response.json(
        { errors: { email: 'An account with this email already exists.' } },
        { status: 400 },
      );
    }

    if (error.message?.includes('invalid invitation code')) {
      return Response.json(
        { errors: { code: 'Invalid invitation code.' } },
        { status: 400 },
      );
    }

    return Response.json(
      { errors: { form: 'Internal server error. Please try again.' } },
      { status: 500 },
    );
  }
};

export const SignUp = () => {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showRePassword, setShowRePassword] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRePasswordVisibility = () => {
    setShowRePassword(!showRePassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* About Section */}
        <AuthAbout />

        {/* Sign Up Form */}
        <div className="flex flex-col justify-center">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Sign up</CardTitle>
              <CardDescription>
                Create your account to get started
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form method="post" className="space-y-4">
                {/* General form error */}
                {actionData?.errors?.form && (
                  <Alert variant="destructive">
                    <AlertDescription>{actionData.errors.form}</AlertDescription>
                  </Alert>
                )}

                {/* Invitation Code field */}
                <div className="space-y-2">
                  <Label htmlFor="code">Invitation Code</Label>
                  <Input
                    id="code"
                    name="code"
                    type="text"
                    className={actionData?.errors?.code ? 'border-red-500' : ''}
                    placeholder="Enter your invitation code"
                  />
                  {actionData?.errors?.code && (
                    <p className="text-sm text-red-600">{actionData.errors.code}</p>
                  )}
                </div>

                {/* First Name field */}
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    autoComplete="given-name"
                    required
                    className={actionData?.errors?.firstName ? 'border-red-500' : ''}
                    placeholder="Enter your first name"
                  />
                  {actionData?.errors?.firstName && (
                    <p className="text-sm text-red-600">{actionData.errors.firstName}</p>
                  )}
                </div>

                {/* Last Name field */}
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    autoComplete="family-name"
                    required
                    className={actionData?.errors?.lastName ? 'border-red-500' : ''}
                    placeholder="Enter your last name"
                  />
                  {actionData?.errors?.lastName && (
                    <p className="text-sm text-red-600">{actionData.errors.lastName}</p>
                  )}
                </div>

                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className={actionData?.errors?.email ? 'border-red-500' : ''}
                    placeholder="Enter your email"
                  />
                  {actionData?.errors?.email && (
                    <p className="text-sm text-red-600">{actionData.errors.email}</p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className={`pr-10 ${actionData?.errors?.password ? 'border-red-500' : ''}`}
                      placeholder="Create a password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {actionData?.errors?.password && (
                    <p className="text-sm text-red-600">{actionData.errors.password}</p>
                  )}
                </div>

                {/* Confirm Password field */}
                <div className="space-y-2">
                  <Label htmlFor="rePassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="rePassword"
                      name="rePassword"
                      type={showRePassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      className={`pr-10 ${actionData?.errors?.rePassword ? 'border-red-500' : ''}`}
                      placeholder="Confirm your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={toggleRePasswordVisibility}
                      aria-label={showRePassword ? 'Hide password' : 'Show password'}
                    >
                      {showRePassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                  {actionData?.errors?.rePassword && (
                    <p className="text-sm text-red-600">{actionData.errors.rePassword}</p>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account~.' : 'Sign Up'}
                </Button>

                {/* Sign in link */}
                <div className="text-center text-sm">
                  <span className="text-gray-600">Already have an account? </span>
                  <Link
                    to={SIGNIN_URL}
                    className="font-medium text-blue-600 hover:text-blue-500 underline underline-offset-4"
                  >
                    Sign In
                  </Link>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SignUp;