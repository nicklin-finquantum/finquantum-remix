import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import React from 'react';

import ApplicationHomeTable from '~/components/Application/ApplicationHomeTable';
import ApplicationStatisticsTable from '~/components/Application/ApplicationStatisticsTable';
import DefaultLayout from '~/components/layout/DefaultLayout';
import { useUser } from '~/hooks/useUser';
import { fetchApplicationList } from '~/lib/application/fetchApplicationList';
import { fetchUserFromSession } from '~/lib/user/fetchUserFromSession.server';

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await fetchUserFromSession(request); // session, cookie, etc.

  const applicationList = await fetchApplicationList(user, { getAll: true, getOrgAll: false, archive: false, sort: -1 });
  return { user, applicationList };
};

const MortgageAnalysis: React.FC = () => {
  const { user } = useUser();
  const { applicationList } = useLoaderData<typeof loader>();

  // if (!user?.organization) {
  //   return null;
  // }

  return (
    <DefaultLayout>
      <div className="min-h-[calc(100vh-253px)] overflow-y-auto p-4">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-semibold text-black dark:text-white my-4">
              Hello, {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Organization: </span>
              {/* {orgName} */}
            </p>
          </div>

          <div className="space-y-6">
            <ApplicationStatisticsTable />
            <ApplicationHomeTable applicationList={applicationList} />
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default MortgageAnalysis;
