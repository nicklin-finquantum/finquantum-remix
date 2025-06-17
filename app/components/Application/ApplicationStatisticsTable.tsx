import React, { useEffect, useState } from 'react';

import { Card, CardContent } from '~/components/ui/card';
import { useUser } from '~/hooks/useUser';
import { Product } from '~/types/product';
import { APPLICATION_STATISTICS_API } from '~/utils/consts';
import { isOrgAdmin } from '~/utils/utils';

interface StatisticsItem {
  key: string;
  label: string;
  content: number;
}

const ApplicationStatisticsTable = () => {
  const [statisticsData, setstatisticsData] = useState<StatisticsItem[]>([]);
  const { user } = useUser();
  const isUserOrgAdmin = isOrgAdmin(user);
  const orgId = user?.organization?.id;
  const userId = user?.id;

  // useEffect(() => {
  //   const getDataList = async () => {
  //     if (!user) return;

  //     const response = await sendRequest(
  //       APPLICATION_STATISTICS_API,
  //       'GET',
  //       {
  //         product: Product.MORTGAGE_ANALYSIS,
  //         userId: userId ?? user.id,
  //         orgId: orgId,
  //       },
  //       true,
  //       isUserOrgAdmin,
  //     );
  //     if (response.status === 200 && response.data) {
  //       try {
  //         const newStats = Object.entries(response.data).map(
  //           ([key, value]) => {
  //             const { count, label } = value as { count: number; label: string };
  //             return {
  //               key,
  //               label,
  //               content: count,
  //             };
  //           },
  //         );
  //         setstatisticsData(newStats);
  //       } catch (e) {
  //         console.log('Couldnt fetch app data', e);
  //       }
  //     }
  //   };
  //   getDataList();
  // }, [user, userId, orgId, isUserOrgAdmin]);

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {statisticsData.map((item, index) => (
          <Card key={index} className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center">
                <span className="font-semibold text-base">
                  {item.label}:
                </span>
                <span className="ml-2 text-base">
                  {item.content}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ApplicationStatisticsTable;
