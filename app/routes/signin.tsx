import  { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/node';
import { Form, Link, useActionData, useNavigation } from '@remix-run/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

import { SignInAbout } from '../components/signin/about';
import { validateEmail, validatePassword } from '../utils/validation';
import { authenticateUser, createUserSession } from '../utils/auth.server';
import { connectToDatabase } from '../db/db.server';
import UserModel from '../models/user.server';

interface ActionData {
  errors?: {
    email?: string;
    password?: string;
    form?: string;
  };
  success?: boolean;
}

// export async function loader({ request }: LoaderFunctionArgs) {
//   // Redirect if user is already authenticated
//   // const user = await getUserFromSession(request);
//   await connectToDatabase();
//   const users = await UserModel.find().lean(); // use `.lean()` to return plain JS objects
//   console.log('Loaded users:', users);
// }

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  const errors: ActionData['errors'] = {};

  // Validate email
  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  // // Validate password
  // if (!password) {
  //   errors.password = 'Password is required';
  // } else if (!validatePassword(password)) {
  //   errors.password = 'Password must be at least 8 characters';
  // }

  // Return errors if validation fails
  if (Object.keys(errors).length > 0) {
    return json<ActionData>({ errors }, { status: 400 });
  }

  try {
    // Authenticate user (returns user and token like your backend)
    const result = await authenticateUser(email!, password!);

    if (!result) {
      return json(
        { errors: { form: 'Account with email does not exist. Please sign up.' } },
        { status: 400 }
      );
    }

    // Create user session and redirect (stores both userId and token)
    return createUserSession({
      request,
      userId: result.user.id,
      token: result.token,
      remember: true,
      redirectTo: '/',
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return json(
      { errors: { form: 'Internal server error. Please try again.' } },
      { status: 500 }
    );
  }
}

export default function SignIn() {
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);

  const isSubmitting = navigation.state === 'submitting';

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* About Section */}
        <SignInAbout />

        {/* Sign In Form */}
        <div className="flex flex-col justify-center">
          <Card className="w-full max-w-md mx-auto">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
              <CardDescription>
                Enter your email and password to access your account
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
                      autoComplete="current-password"
                      required
                      className={`pr-10 ${actionData?.errors?.password ? 'border-red-500' : ''}`}
                      placeholder="Enter your password"
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

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in...' : 'Sign In'}
                </Button>

                {/* Sign up link */}
                <div className="text-center text-sm">
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link
                    to="/signup"
                    className="font-medium text-blue-600 hover:text-blue-500 underline underline-offset-4"
                  >
                    Sign Up
                  </Link>
                </div>

                {/* Forgot password link */}
                <div className="text-center">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-gray-600 hover:text-gray-500 underline underline-offset-4"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}