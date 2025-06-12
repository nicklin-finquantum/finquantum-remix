import React, { useEffect } from "react";
import {
  TextField,
  Box,
  Tooltip,
  IconButton,
  Autocomplete,
  Typography,
  Button,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import { Product } from "../../types/product";
import ApplicantForm from "./ApplicantForm";
import useApplicationForm from "../../hooks/useApplicationForm";
import { APPLICATION_FORM } from "../../types/application";

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
    <Box>
      {Modal}
      <Box className="p-7">
        <form onSubmit={handleSubmit}>
          <Box className="mb-5.5 flex flex-col gap-1 sm:flex-row items-start sm:w-1/2">
            {edit ? (
              <Box className="searchbar-0 w-full flex">
                <Box
                  className="flex min-w-17 input-label-secondary bg-blue-400 items-center p-2 h-[41px]"
                  sx={{
                    borderRadius: "4px 4px 4px 4px",
                  }}
                >
                  <Typography variant="body1" className="text-white">
                    Search
                  </Typography>
                </Box>
                <Autocomplete
                  disablePortal
                  options={applicationList}
                  onChange={(event: any, newValue: APPLICATION_FORM | null) => {
                    setApplicationInfo(newValue);
                  }}
                  value={applicationInfo}
                  getOptionLabel={(option) => option.userApplicationId || ""} // Specify how to display the label
                  renderInput={(params) => (
                    <Box className="w-full flex align-top">
                      <TextField
                        {...params}
                        fullWidth
                        error={
                          applicationValidationStatus.userApplicationIdStatus ===
                          "error"
                        }
                        helperText={
                          applicationValidationMessage[
                            "userApplicationIdMessage"
                          ]
                        }
                        placeholder="Enter File Number (example: 12334456)"
                      />
                    </Box>
                  )}
                  fullWidth
                  isOptionEqualToValue={(option, value) =>
                    option.userApplicationId === value.userApplicationId
                  }
                  noOptionsText={"No file found"}
                />
              </Box>
            ) : (
              <Box className="w-full align-top">
                <Box className="input-label">
                  File Number
                  <Tooltip
                    className="h-fit"
                    title="This is the same number as that x digit file number (ie. 12334456) you use in your own system. Please enter the exact number here so our systems match up the files."
                  >
                    <IconButton>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <TextField
                  name="userApplicationId"
                  value={applicationInfo?.userApplicationId}
                  error={
                    applicationValidationStatus.userApplicationIdStatus ===
                    "error"
                  }
                  helperText={
                    applicationValidationMessage["userApplicationIdMessage"]
                  }
                  onChange={(e) => handleChange(e, "File Number")}
                  onBlur={(e) => handleChange(e, "File Number")}
                  fullWidth
                  placeholder="Enter File Number (example: 12334456)"
                />
              </Box>
            )}
          </Box>
          {applicantList.map(
            (applicant, index) =>
              applicant && (
                <ApplicantForm
                  key={index}
                  applicant={applicant}
                  index={index}
                  product={product}
                  validationStatus={
                    applicationValidationStatus?.applicantStatus[index]
                  }
                  validationMessage={
                    applicationValidationMessage?.applicantMessage[index]
                  }
                  onApplicantChange={handleApplicantChange}
                  handleRemoveApplicant={handleRemoveApplicant}
                  setFileList={setFileList}
                  appendDeleteFileId={appendDeleteFileId}
                />
              ),
          )}
          {(!edit || (edit && applicationInfo?.userApplicationId)) && (
            <Box>
              <Box className="gap-4.5 mt-4">
                <Button
                  type="button"
                  variant="outlined"
                  color="secondary"
                  onClick={addApplicant}
                  disabled={applicantList.length >= 5}
                >
                  Add More Applicants
                </Button>
              </Box>
              <Box className="flex justify-end">
                <Button
                  className="submit-btn"
                  type="button"
                  variant="contained"
                  color="primary"
                  onClick={handleSubmit}
                >
                  Save
                </Button>
              </Box>
            </Box>
          )}
        </form>
      </Box>
    </Box>
  );
};

export default ApplicationInfoForm;
