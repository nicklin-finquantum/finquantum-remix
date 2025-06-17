import { Form, Link } from '@remix-run/react';
import { Eye, EyeOff } from 'lucide-react';

import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import type { ActionDataType } from '~/types/actionDataType';
import { SIGNUP_URL } from '~/utils/consts';

export const SignInForm = ({ actionData, showPassword, isSubmitting, togglePasswordVisibility }: {actionData?: ActionDataType, showPassword?: boolean, togglePasswordVisibility?: () => void, isSubmitting?: boolean}) => (
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
              to={SIGNUP_URL}
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
);