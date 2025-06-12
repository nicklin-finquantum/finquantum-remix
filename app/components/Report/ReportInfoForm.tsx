import React, { useEffect, useState } from "react";
import { StatusType } from "../../types/statusType";
import { getProductUrl, sendRequest } from "../../utils/utils";
import {
  APPLICANT_LIST_BY_APPLICATION_API,
  APPLICATION_LIST_API,
  DOWNLOAD_REPORT_PATH,
  REPORT_CREATE_API,
} from "../../utils/consts";
import { REPORT_FORM } from "../../types/report";
import { Product } from "../../types/product";
import { APPLICANT, APPLICANT_FORM } from "../../types/applicant";
import {
  Autocomplete,
  Box,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";
import { APPLICATION } from "../../types/application";
import useModal from "../../hooks/useModal";
import { Link, useSearchParams } from "react-router-dom";
import ErrorMessage from "../ErrorMessage/ErrorMessage";

const defaultvalidationStatus: {
  selectedApplicationStatus: StatusType;
  applicantListStatus: StatusType;
} = {
  selectedApplicationStatus: "default",
  applicantListStatus: "default",
};

const defaultValidationMessage = {
  selectedApplicationMessage: "",
  applicantListMessage: "",
};

const ReportInfoForm: React.FC<{
  reportData?: REPORT_FORM;
  product: Product;
}> = ({ reportData, product }) => {
  const [applicationList, setApplicationList] = useState<APPLICATION[]>([]);
  const [selectedApplication, setSelectedApplication] =
    useState<APPLICATION>(null);
  const [checkboxList, setCheckboxList] = useState<APPLICANT[]>([]);

  const [reportInfo, setReportInfo] = useState<REPORT_FORM>({
    reportType: "Credit",
  });

  const [searchParams] = useSearchParams();
  const applicationId = searchParams.get("applicationId");

  const {
    Modal,
    openModal,
    setMessage,
    setOkFunction,
    handleOk,
    handleOkRedirect,
  } = useModal();

  useEffect(() => {
    reportData && setReportInfo(reportData);
  }, [reportData]);

  useEffect(() => {
    const getApplicationList = async () => {
      const response = await sendRequest(
        APPLICATION_LIST_API,
        "GET",
        {
          product: product,
        },
        true,
      );
      if (
        response.status === 200 &&
        response.data &&
        response.data.applicationList
      ) {
        setApplicationList(
          response.data.applicationList.map((application) => {
            const newApplication = {
              ...application,
              label: application.userApplicationId,
              id: application.id,
            };
            if (newApplication.id === applicationId) {
              setSelectedApplication(newApplication);
            }
            return newApplication;
          }),
        );
      }
    };

    getApplicationList();
  }, [product]);

  useEffect(() => {
    const getDataList = async () => {
      const response = await sendRequest(
        APPLICANT_LIST_BY_APPLICATION_API,
        "GET",
        { product: product, applicationId: selectedApplication?.id },
        true,
      );
      if (
        response.status === 200 &&
        response.data &&
        response.data.applicantList
      ) {
        const newAppliantList = response.data.applicantList.map(
          (applicant: APPLICANT_FORM) => ({ ...applicant, checked: true }),
        );
        setCheckboxList(newAppliantList);
      }
    };

    selectedApplication && getDataList();
  }, [selectedApplication, product]);

  const [validationStatus, setValidationStatus] = useState<{
    selectedApplicationStatus: StatusType;
    applicantListStatus: StatusType;
  }>(defaultvalidationStatus);

  const [validationMessage, setValidationMessage] = useState<{
    selectedApplicationMessage: string;
    applicantListMessage: string;
  }>(defaultValidationMessage);

  const validateInput = (
    name: string,
    label: string,
    value: string | number,
  ) => {
    switch (name) {
      case "userReportId":
        return value ? "" : `${label} is required`;
      default:
        return "";
    }
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string,
  ) => {
    const { checked } = e.target;
    setValidationMessage((prev) => ({
      ...prev,
      applicantListMessage: "",
    }));
    setCheckboxList((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: checked } : item,
      ),
    );
  };

  const handleSelectAll = () => {
    setValidationStatus(defaultvalidationStatus);
    setValidationMessage(defaultValidationMessage);
    setCheckboxList((prev) => prev.map((item) => ({ ...item, checked: true })));
  };

  const handleSelectNone = () => {
    setValidationStatus(defaultvalidationStatus);
    setValidationMessage(defaultValidationMessage);
    setCheckboxList((prev) =>
      prev.map((item) => ({ ...item, checked: false })),
    );
  };

  const handleChange = (e: SelectChangeEvent<string>, label: string) => {
    const { name, value } = e.target;
    let newValue: string | number = value;
    const errorMessage = validateInput(name, label, newValue);
    const status = errorMessage ? "error" : "default";

    setReportInfo((prev) => ({ ...prev, [name]: newValue }));
    setValidationStatus((prev) => ({ ...prev, [`${name}Status`]: status }));
    setValidationMessage((prev) => ({
      ...prev,
      [`${name}Message`]: errorMessage,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedApplication) {
      setValidationStatus((prev) => ({
        ...prev,
        selectedApplicationStatus: "error",
      }));
      setValidationMessage((prev) => ({
        ...prev,
        selectedApplicationMessage: "Please select a file number",
      }));
      return;
    }

    const applicantIds = checkboxList
      .filter((item) => item.checked)
      .map((item) => item.id);

    if (!applicantIds.length) {
      setValidationMessage((prev) => ({
        ...prev,
        applicantListMessage: "An applicant must be selected.",
      }));
      return;
    }

    try {
      const response = await sendRequest(
        REPORT_CREATE_API,
        "POST",
        {
          ...reportInfo,
          applicantIds: applicantIds,
          applicationId: selectedApplication?.id,
          product: product,
        },
        true,
      );
      if (response.status === 200) {
        setMessage(
          <span className="font-bold report-generation-success">
            Report generation started
          </span>,
        );
        setOkFunction(() =>
          handleOkRedirect(`${getProductUrl(product)}${DOWNLOAD_REPORT_PATH}`),
        );
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setMessage(
        <Box className="items-center">
          <Box className="font-bold report-generation-fail">
            Report generation failed.
          </Box>
          <Box>{error instanceof Error ? error.message : "Internal Error"}</Box>
        </Box>,
      );
      setOkFunction(handleOk);
    } finally {
      openModal();
    }
  };

  return (
    <Box>
      {Modal}

      <form onSubmit={handleSubmit}>
        <Box className="gap-6 p-5">
          <Box className="info-card mb-5">
            Before you start, make sure you've already created a file with
            applicant info as well as uploaded the CreditKarma document per
            these{" "}
            <Link
              className="underline"
              to="https://docs.google.com/document/d/1VqmWPB-I1zn4DhDfK0nEIyErJjo7aH0cAucMCLYzOuw/edit"
            >
              instructions
            </Link>
            .
          </Box>
          <Box className="grid grid-cols-3 gap-10 sm:w-3/4 pb-10">
            <Box className="input-label-secondary min-w-40">
              1. File Number:
            </Box>
            <Box className="col-span-2">
              <Autocomplete
                disablePortal
                options={applicationList}
                onChange={(event: any, newValue: APPLICATION | null) => {
                  setSelectedApplication(newValue);
                  setValidationStatus((prev) => ({
                    ...prev,
                    selectedApplicationStatus: "default",
                  }));
                  setValidationMessage((prev) => ({
                    ...prev,
                    selectedApplicationMessage: "",
                  }));
                }}
                value={selectedApplication}
                renderInput={(params) => (
                  <Box className="w-full flex align-top">
                    <TextField
                      {...params}
                      fullWidth
                      error={
                        validationStatus.selectedApplicationStatus === "error"
                      }
                      helperText={validationMessage.selectedApplicationMessage}
                      placeholder="Search File Number (example: 12334456)"
                    />
                  </Box>
                )}
                fullWidth
                isOptionEqualToValue={(option, value) =>
                  option.userApplicationId === value?.userApplicationId
                }
              />
            </Box>
            <Box className="input-label-secondary">2. Applicant ID: </Box>
            <Box className="w-full col-span-2">
              <Box className="flex gap-4 mb-2">
                <Button
                  variant="contained"
                  color="secondary"
                  type="button"
                  onClick={handleSelectAll}
                >
                  Select All
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  type="button"
                  onClick={handleSelectNone}
                >
                  Select None
                </Button>
              </Box>
              <FormGroup>
                {checkboxList.map((data) => (
                  <FormControlLabel
                    key={data.id}
                    control={
                      <Checkbox
                        checked={data.checked}
                        onChange={(e) => handleCheckboxChange(e, data.id)}
                      />
                    }
                    label={data.userApplicantId}
                  />
                ))}
              </FormGroup>
              <ErrorMessage message={validationMessage.applicantListMessage} />
            </Box>
            <Box className="input-label-secondary">
              3. Type of Summary Report:
            </Box>
            <Box className="col-span-2">
              <FormControl fullWidth>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={reportInfo.reportType}
                  onChange={handleChange}
                >
                  <MenuItem value="Credit">Credit</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          <Box className="generate-report-button flex justify-end gap-4.5">
            <Button variant="contained" color="primary" type="submit">
              Generate Report
            </Button>
          </Box>
        </Box>
      </form>
    </Box>
  );
};

export default ReportInfoForm;
