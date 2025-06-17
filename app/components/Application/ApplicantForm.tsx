import { Info, Trash2 } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom';

import FileForm from '~/components/File/FileForm';
import { Alert, AlertDescription } from '~/components/ui/alert';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import type {
  ApplicantMessage,
  ApplicantStatus,
} from '~/hooks/useApplicantList';
import type { APPLICANT_FORM } from '~/types/applicant';
import type { Product } from '~/types/product';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';

interface ApplicantFormProps {
  applicant: APPLICANT_FORM;
  index: number;
  product: Product;
  validationStatus: ApplicantStatus;
  validationMessage: ApplicantMessage;
  onApplicantChange: (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    label: string,
    setValue?: boolean,
    validateName?: string,
  ) => void;
  handleRemoveApplicant: (index: number, userApplicantId: string) => void;
  setFileList: (index: number, fileInputs: Record<string, File[]>) => void;
  appendDeleteFileId: (index: number, deleteFileId: string) => void;
}

const ApplicantForm: React.FC<ApplicantFormProps> = ({
  applicant,
  index,
  product,
  validationStatus,
  validationMessage,
  onApplicantChange,
  handleRemoveApplicant,
  setFileList,
  appendDeleteFileId,
}) => {
  return (
    <Card className="mb-5">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-2">
          <Label className="text-base font-medium">Applicant {index + 1}</Label>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleRemoveApplicant(index, applicant?.userApplicantId)}
            aria-label="delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="pl-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">1. Applicant ID</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Applicant is the individual requesting pre-approval. Here, you come up with any ID to help you identify the individual. It could be the first and last initial of their name plus 6 digits, up to 30 characters.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                name="userApplicantId"
                value={applicant?.userApplicantId}
                className={validationStatus?.userApplicantId === 'error' ? 'border-red-500' : ''}
                onChange={(e) => onApplicantChange(index, e, 'Applicant ID')}
                onBlur={(e) => onApplicantChange(index, e, 'Applicant ID')}
                placeholder="Enter Applicant ID (example: GM124556)"
              />
              {validationMessage?.userApplicantId && (
                <p className="text-sm text-red-600">{validationMessage.userApplicantId}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">2. Upload Document</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        Please download the CreditKarma document following these{' '}
                        <Link
                          className="text-sky-400 underline"
                          to="https://docs.google.com/document/d/1VqmWPB-I1zn4DhDfK0nEIyErJjo7aH0cAucMCLYzOuw/edit"
                          target="_blank"
                          rel="noopener"
                        >
                          instructions
                        </Link>
                        . PDF format is required.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="pl-4">
                <p className="mb-3 text-sm text-muted-foreground">
                  Once a CreditKarma PDF document is uploaded, our upload process
                  will automatically remove all PII before the credit report data is
                  used for data aggregation and summary.
                </p>
                <FileForm
                  product={product}
                  fileInputs={applicant?.fileInputs ?? {}}
                  setFileInputs={(fileInputs: Record<string, File[]>) => setFileList(index, fileInputs)}
                  appendDeleteFileId={(deleteFileId: string) =>
                    appendDeleteFileId(index, deleteFileId)
                  }
                />
                {validationMessage?.fileInputs && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{validationMessage.fileInputs}</AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicantForm;
