import { Info } from 'lucide-react';
import React, { useEffect } from 'react';

import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import useApplicationForm from '~/hooks/useApplicationForm';
import type { APPLICATION_FORM } from '~/types/application';
import type { Product } from '~/types/product';

import ApplicantForm from './ApplicantForm';

import { Combobox } from '~/components/ui/combobox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip';

const ApplicationInfoForm: React.FC<{ edit?: boolean; product: Product }> = ({
  product,
  edit = false,
}) => {
  const {
    Modal,
    applicationInfo,
    applicationList,
    applicantList,
    applicationValidationStatus,
    applicationValidationMessage,
    handleChange,
    handleApplicantChange,
    addApplicant,
    handleRemoveApplicant,
    setFileList,
    handleSubmit,
    setApplicationInfo,
    appendDeleteFileId,
    handleResetApplication,
  } = useApplicationForm(edit, product);

  useEffect(() => {
    handleResetApplication();
  }, [edit]);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        {Modal}
        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex flex-col gap-1 sm:flex-row items-start sm:w-1/2">
            {edit ? (
              <div className="w-full">
                <div className="flex min-w-17 bg-blue-400 items-center p-2 h-[41px] rounded-tl-md rounded-bl-md">
                  <span className="text-white">Search</span>
                </div>
                <Combobox
                  items={applicationList}
                  value={applicationInfo}
                  onChange={(value: APPLICATION_FORM | null) => setApplicationInfo(value)}
                  getOptionLabel={(option) => option.userApplicationId || ''}
                  placeholder="Enter File Number (example: 12334456)"
                  error={applicationValidationStatus.userApplicationIdStatus === 'error'}
                  errorMessage={applicationValidationMessage['userApplicationIdMessage']}
                />
              </div>
            ) : (
              <div className="w-full">
                <div className="flex items-center gap-2 mb-2">
                  <Label htmlFor="userApplicationId">File Number</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="h-4 w-4 text-gray-500" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>This is the same number as that x digit file number (ie. 12334456) you use in your own system. Please enter the exact number here so our systems match up the files.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  id="userApplicationId"
                  name="userApplicationId"
                  value={applicationInfo?.userApplicationId}
                  onChange={(e) => handleChange(e, 'File Number')}
                  onBlur={(e) => handleChange(e, 'File Number')}
                  placeholder="Enter File Number (example: 12334456)"
                  className={applicationValidationStatus.userApplicationIdStatus === 'error' ? 'border-red-500' : ''}
                />
                {applicationValidationStatus.userApplicationIdStatus === 'error' && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>
                      {applicationValidationMessage['userApplicationIdMessage']}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>

          {applicantList.map(
            (applicant, index) =>
              applicant && (
                <ApplicantForm
                  key={index}
                  applicant={applicant}
                  index={index}
                  product={product}
                  validationStatus={applicationValidationStatus?.applicantStatus[index]}
                  validationMessage={applicationValidationMessage?.applicantMessage[index]}
                  onApplicantChange={handleApplicantChange}
                  handleRemoveApplicant={handleRemoveApplicant}
                  setFileList={setFileList}
                  appendDeleteFileId={appendDeleteFileId}
                />
              ),
          )}

          {(!edit || (edit && applicationInfo?.userApplicationId)) && (
            <div className="mt-6 space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={addApplicant}
                disabled={applicantList.length >= 5}
              >
                Add More Applicants
              </Button>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  variant="default"
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ApplicationInfoForm;
