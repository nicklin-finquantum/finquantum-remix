import React from "react";
import { Box, TextField, IconButton, Tooltip } from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import DeleteIcon from "@mui/icons-material/Delete";
import FileForm from "../File/FileForm";
import { APPLICANT_FORM } from "../../types/applicant";
import { Product } from "../../types/product";
import { Link } from "react-router-dom";
import {
  ApplicantMessage,
  ApplicantStatus,
} from "../../hooks/useApplicantList";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

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
    <Box className="card !rounded-lg p-5 mb-5">
      <Box className="flex justify-between items-center mb-2">
        <Box className="input-label">Applicant {index + 1}</Box>
        <IconButton
          aria-label="delete"
          onClick={() =>
            handleRemoveApplicant(index, applicant?.userApplicantId)
          }
        >
          <DeleteIcon />
        </IconButton>
      </Box>
      <Box className="pl-4">
        <Box className="gap-1 sm:flex-row md:w-1/2 items-start">
          <Box className="input-label-secondary">
            1. Applicant ID
            <Tooltip
              className="h-fit"
              title="Applicant is the individual requesting pre-approval. Here, you come up with any ID to help you identify the individual. It could be the first and last initial of their name plus 6 digits, up to 30 characters."
            >
              <IconButton>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box className="pl-4">
            <TextField
              name="userApplicantId"
              value={applicant?.userApplicantId}
              error={validationStatus?.userApplicantId === "error"}
              helperText={validationMessage?.userApplicantId}
              onChange={(e) => onApplicantChange(index, e, "Applicant ID")}
              onBlur={(e) => onApplicantChange(index, e, "Applicant ID")}
              fullWidth
              placeholder="Enter Applicant ID (example: GM124556)"
            />
          </Box>
        </Box>
        <Box className="flex flex-col gap-1 items-start mt-2">
          <Box className="flex h-full items-center input-label-secondary">
            2. Upload Document
            <Tooltip
              className="h-fit"
              title={
                <span>
                  Please download the CreditKarma document following these{" "}
                  <Link
                    className="text-sky-400 underline"
                    to="https://docs.google.com/document/d/1VqmWPB-I1zn4DhDfK0nEIyErJjo7aH0cAucMCLYzOuw/edit"
                    target="_blank"
                    rel="noopener"
                  >
                    instructions
                  </Link>{" "}
                  . PDF format is required.
                </span>
              }
            >
              <IconButton>
                <InfoIcon />
              </IconButton>
            </Tooltip>
            :
          </Box>
          <Box className="pl-4">
            <Box className="mb-3">
              Once a CreditKarma PDF document is uploaded, our upload process
              will automatically remove all PII before the credit report data is
              used for data aggregation and summary.
            </Box>
            <Box>
              <FileForm
                product={product}
                fileInputs={applicant?.fileInputs ?? {}}
                setFileInputs={(fileInputs) => setFileList(index, fileInputs)}
                appendDeleteFileId={(deleteFileId) =>
                  appendDeleteFileId(index, deleteFileId)
                }
              />
            </Box>
            <ErrorMessage message={validationMessage?.fileInputs} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ApplicantForm;
