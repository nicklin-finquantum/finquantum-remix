import { useNavigate } from '@remix-run/react';
import { Info } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { useUser } from '~/hooks/useUser';
import { Product } from '~/types/product';
import { APPLICATION_UPDATE_STATUS_API } from '~/utils/consts';
import { sendRequest } from '~/utils/utils';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

const ApplicationStatusEdit: React.FC<{ applicationId: string }> = ({ applicationId }) => {
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    const getApplicationStatus = async () => {
      if (!user) return;

      try {
        const response = await sendRequest(
          APPLICATION_UPDATE_STATUS_API,
          'GET',
          {
            id: applicationId,
            product: Product.MORTGAGE_ANALYSIS,
            status: '',
          },
          true,
        );
        if (response.status === 200 && response.data) {
          setStatus(response.data.status);
        }
      } catch (error) {
        console.error('Failed to fetch application status:', error);
        setError('Failed to fetch application status');
      }
    };
    getApplicationStatus();
  }, [applicationId, user]);

  const handleStatusChange = async (newStatus: string) => {
    if (!user) return;

    try {
      const response = await sendRequest(
        APPLICATION_UPDATE_STATUS_API,
        'GET',
        {
          id: applicationId,
          product: Product.MORTGAGE_ANALYSIS,
          status: newStatus,
        },
        true,
      );
      if (response.status === 200) {
        setStatus(newStatus);
        setSuccess('Status updated successfully');
        setError('');
      }
    } catch (error) {
      console.error('Failed to update application status:', error);
      setError('Failed to update application status');
      setSuccess('');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Application Status</h2>
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            Back
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="status" className="text-base font-medium">
              Current Status:
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Current status of the application</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="status"
            value={status}
            readOnly
            className="bg-gray-50"
          />
        </div>

        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium">Update Status</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={status === 'Approved' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('Approved')}
              className="w-full"
            >
              Approve
            </Button>
            <Button
              variant={status === 'Rejected' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('Rejected')}
              className="w-full"
            >
              Reject
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationStatusEdit;
