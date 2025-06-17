import { useNavigate } from '@remix-run/react';
import { Search } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { useUser } from '~/hooks/useUser';
import { Product } from '~/types/product';
import { APPLICATION_LIST_API, APPLICATION_LIST_ARCHIVED_API, APPLICATION_LIST_ORG_ALL_API, APPLICATION_LIST_ORG_ARCHIVED_API } from '~/utils/consts';
import { isOrgAdmin, fetchDataList } from '~/utils/utils';

interface Application {
  id: string;
  userApplicationId: string;
  status: string;
}

const ApplicationList: React.FC<{ product?: Product; isArchive?: boolean }> = ({
  product = Product.MORTGAGE_ANALYSIS,
  isArchive = false,
}) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useUser();
  const isOrgAdmin = user ? isOrgAdmin(user) : false;
  const navigate = useNavigate();

  useEffect(() => {
    const getDataList = async () => {
      if (!user) return;

      try {
        const data = await fetchDataList(
          isArchive
            ? isOrgAdmin
              ? APPLICATION_LIST_ORG_ARCHIVED_API
              : APPLICATION_LIST_ARCHIVED_API
            : isOrgAdmin
              ? APPLICATION_LIST_ORG_ALL_API
              : APPLICATION_LIST_API,
          { product },
        );
        setApplications(data.applicationList);
      } catch (error) {
        console.error('Failed to fetch application list:', error);
      }
    };
    getDataList();
  }, [isArchive, isOrgAdmin, product, user]);

  const filteredApplications = applications.filter((app) =>
    app.userApplicationId.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleStatusChange = (applicationId: string, newStatus: string) => {
    // Handle status change
    console.log('Status changed to:', newStatus, 'for application:', applicationId);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">
            {isArchive ? 'Archived Applications' : 'Applications'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search by File Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="text-gray-600 hover:text-gray-900"
            >
              Back
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File No.</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell>{app.userApplicationId}</TableCell>
                  <TableCell>
                    <Select
                      value={app.status}
                      onValueChange={(value: string) => handleStatusChange(app.id, value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Approved">Approved</SelectItem>
                        <SelectItem value="Rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/application/${app.id}`)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredApplications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    No applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationList;
