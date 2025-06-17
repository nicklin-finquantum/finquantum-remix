import type { LoaderFunctionArgs } from '@remix-run/node';
import { Outlet, useLoaderData } from '@remix-run/react';

import DefaultLayout from '~/components/layout/DefaultLayout';
import { getCurrentUser } from '~/lib/user/getCurrentUser';
import type { USER } from '~/types/user';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await getCurrentUser(request);
  return { user };
};

export default function Layout() {
  const { user } = useLoaderData<{ user: USER | null }>();
  return <DefaultLayout user={user}>{<Outlet />}</DefaultLayout>;
}