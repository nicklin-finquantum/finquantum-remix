import type { LoaderFunctionArgs } from '@remix-run/node';

import { logout } from '~/lib/auth/logout';
import { SIGNIN_URL } from '~/utils/consts';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return logout(request, SIGNIN_URL);
};

const Logout = () => {
  return <div>Logout</div>;
};

export default Logout;
