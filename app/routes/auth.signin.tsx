import { redirect, type LoaderFunctionArgs, type ActionFunctionArgs } from '@remix-run/node';
import { useActionData, useNavigation } from '@remix-run/react';
import { useState } from 'react';

import { AuthAbout } from '~/components/auth/about';
import { SignInForm } from '~/components/auth/signinForm';
import { authenticateUser } from '~/lib/auth/authenticateUser';
import { createUserSession } from '~/lib/session/createUserSession';
import { getUserIdFromSession } from '~/lib/session.server';
import type { ActionDataType } from '~/types/actionDataType';
import { validateEmail } from '~/utils/validation';

export async function loader({ request }: LoaderFunctionArgs) {
  // Redirect if user is already authenticated
  const userId = await getUserIdFromSession(request);
  if (userId) {
    return redirect('/');
  }
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();

  const errors: ActionDataType['errors'] = {};

  // Validate email
  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email format';
  }

  // Validate password
  if (!password) {
    errors.password = 'Password is required';
  }

  // Return errors if validation fails
  if (Object.keys(errors).length > 0) {
    return Response.json({ errors }, { status: 400 });
  }

  try {
    // Authenticate user (returns user and token like your backend)
    const result = await authenticateUser(email!, password!);

    if (!result || !result?.user?.id) {
      return Response.json(
        { errors: { form: 'Account with email does not exist. Please sign up.' } },
        { status: 400 },
      );
    }

    // Create user session and redirect (stores both userId and token)
    return createUserSession(request, {
      token: result.token,
      remember: true,
      redirectTo: '/',
    });
  } catch (error) {
    console.error('Sign in error:', error);
    return Response.json(
      { errors: { form: 'Internal server error. Please try again.' } },
      { status: 500 },
    );
  }
}

export const SignIn = () => {
  const actionData = useActionData<{ errors?: ActionDataType['errors'] }>();
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
        <AuthAbout />

        {/* Sign In Form */}
        <SignInForm
          actionData={actionData}
          showPassword={showPassword}
          togglePasswordVisibility={togglePasswordVisibility}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default SignIn;