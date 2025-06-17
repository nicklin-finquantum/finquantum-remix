// src/hooks/useApplicationForm.ts

import { Box } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import type { APPLICANT } from '~/types/applicant';
import type { APPLICATION, APPLICATION_FORM } from '~/types/application';
import type { FILE_INPUT } from '~/types/file';
import type { Product } from '~/types/product';
import {
  APPLICATION_CREATE_API,
  APPLICATION_EDIT_API,
  APPLICANT_EDIT_API,
  APPLICANT_CREATE_API,
  APPLICATION_LIST_API,
  APPLICANT_LIST_BY_APPLICATION_API,
  ADD_REPORT_PATH,
  APPLICATION_GET_API,
  APPLICATION_ROLLBACK_API,
} from '~/utils/consts';
import { getProductUrl, inputValidation, sendRequest } from '~/utils/utils';

import useApplicantList from './useApplicantList';
import useModal from './useModal';

import { useSnackbar } from '~/context/SnackbarContext';

const useApplicationForm = (edit: boolean, product: Product) => {
  const initialFormState = edit
    ? null
    : {
      userApplicationId: '',
      id: '',
    };
  const [applicationInfo, setApplicationInfo] =
    useState<APPLICATION_FORM>(initialFormState);

  const { addApplicant: addSnackApplicant } = useSnackbar();

  const {
    Modal,
    openModal,
    closeModal,
    setMessage,
    setOkText,
    setCancelText,
    setOkFunction,
    setCancelFunction,
    handleOk,
    handleOkRedirect,
    handleCancel,
  } = useModal();

  const {
    applicantList,
    deleteApplicantList,
    applicantValidationStatus,
    applicantValidationMessage,
    setApplicantList,
    setApplicantValidationStatus,
    setApplicantValidationMessage,
    addApplicant,
    handleRemoveApplicant,
    handleResetApplicantList,
  } = useApplicantList(
    edit,
    openModal,
    closeModal,
    setMessage,
    setOkFunction,
    setCancelFunction,
    handleCancel,
  );

  const [applicationList, setApplicationList] = useState<APPLICATION[]>([]);

  const [searchParams] = useSearchParams();

  const applicationId = searchParams.get('applicationId');

  useEffect(() => {
    const getApplicationList = async () => {
      const response = await sendRequest(
        APPLICATION_LIST_API,
        'GET',
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
          response.data.applicationList.map((application) => ({
            ...application,
            label: application.userApplicationId,
          })),
        );
      }
    };
    if (edit) {
      getApplicationList();
    }
  }, [edit, product]);

  useEffect(() => {
    const getApplicantList = async () => {
      const response = await sendRequest(
        APPLICANT_LIST_BY_APPLICATION_API,
        'GET',
        {
          product: product,
          applicationId: applicationInfo.id,
        },
        true,
      );
      if (
        response.status === 200 &&
        response.data &&
        response.data.applicantList
      ) {
        setApplicantList(
          response.data.applicantList.map((applicant: APPLICANT) => ({
            ...applicant,
            id: applicant.id,
            inDb: true,
          })),
        );
      }
    };
    if (edit) {
      if (applicationInfo && applicationInfo.id) {
        getApplicantList();
      } else {
        handleResetApplicantList();
      }
    }
  }, [edit, product, applicationInfo?.id]);

  useEffect(() => {
    const getApplication = async () => {
      const response = await sendRequest(
        APPLICATION_GET_API,
        'GET',
        {
          product: product,
          id: applicationId,
        },
        true,
      );
      if (
        response.status === 200 &&
        response.data &&
        response.data.application
      ) {
        setApplicationInfo(response.data.application);
      }
    };
    if (applicationId) {
      getApplication();
    }
  }, [applicationId]);

  const appendDeleteFileId = (index: number, deleteFileId: string) => {
    if (!applicantList[index].deleteFileList) {
      applicantList[index].deleteFileList = [];
    }
    deleteFileId && applicantList[index].deleteFileList.push(deleteFileId);
  };

  const setFileList = (
    index: number,
    fileInputs: {
      [key: string]: FILE_INPUT[];
    },
  ) => {
    // Only validate on save
    validateAndSetField(
      'fileInputs',
      `File ID ${index + 1}`,
      null,
      index,
      fileInputs,
      true,
    );
    const newApplicantList = [...applicantList];
    newApplicantList[index].fileInputs = fileInputs;
    setApplicantList(newApplicantList);
  };

  const validateInput = (
    name: string,
    label: string,
    value: string | number,
    index?: number,
    fileInputs?: Record<string, File[]>,
    onlyOnSave?: boolean,
  ) => {
    switch (name) {
      case 'userApplicationId':
        if (!value) {
          return 'File number is required';
        }
        if (typeof value === 'string' && value.length > 30) {
          return 'File number cannot be longer than 30 characters';
        }
        if (onlyOnSave && applicantList.length <= 0) {
          return 'At least one applicant is required';
        }
        if (onlyOnSave) {
          const inputCheck = inputValidation(value);
          if (!inputCheck.isValid) return inputCheck.errorMessage;
        }
        return '';
      case 'userApplicantId':
        if (onlyOnSave && !value) {
          return 'Applicant ID is required';
        }
        if (typeof value === 'string' && value.length > 30) {
          return 'Applicant ID cannot be longer than 30 characters';
        }
        if (
          onlyOnSave &&
          applicantList.some(
            (applicant, idx) =>
              applicant.userApplicantId === value && idx !== index,
          )
        ) {
          return 'Applicant ID must be unique';
        }
        if (onlyOnSave) {
          const inputCheck = inputValidation(value);
          if (!inputCheck.isValid) return inputCheck.errorMessage;
        }
        return '';
      case 'fileInputs':
        if (
          onlyOnSave &&
          (!fileInputs || Object.values(fileInputs).flat().length <= 0)
        ) {
          return 'Document is required';
        }
        return '';
      default:
        return '';
    }
  };

  const validateAndSetField = (
    name: string,
    label: string,
    value: string,
    index?: number,
    fileInputs?: Record<string, File[]>,
    onlyOnSave = false,
  ) => {
    const errorMessage = validateInput(
      name,
      label,
      value,
      index,
      fileInputs,
      onlyOnSave,
    );
    const status = errorMessage ? 'error' : 'default';

    if (name === 'userApplicationId') {
      ((edit && value) || !edit) &&
        setApplicationInfo((prev) => ({ ...prev, [name]: value }));
      setApplicantValidationStatus((prev) => ({
        ...prev,
        [`${name}Status`]: status,
      }));
      setApplicantValidationMessage((prev) => ({
        ...prev,
        [`${name}Message`]: errorMessage,
      }));
    } else if (name === 'userApplicantId' && index !== undefined) {
      // Update the applicant list
      setApplicantList((prevList) => {
        const newList = [...prevList];
        newList[index] = { ...newList[index], [name]: value };
        return newList;
      });

      // Update the validation status
      setApplicantValidationStatus((prevStatus) => {
        const newStatus = [...prevStatus.applicantStatus];
        newStatus[index] = { ...newStatus[index], userApplicantId: status };
        return {
          ...prevStatus,
          applicantStatus: newStatus,
        };
      });

      // Update the validation message
      setApplicantValidationMessage((prevMessage) => {
        const newMessage = [...prevMessage.applicantMessage];
        newMessage[index] = {
          ...newMessage[index],
          userApplicantId: errorMessage,
        };
        return {
          ...prevMessage,
          applicantMessage: newMessage,
        };
      });
    } else if (name === 'fileInputs' && index !== undefined) {
      // Update the validation status
      setApplicantValidationStatus((prevStatus) => {
        const newStatus = [...prevStatus.applicantStatus];
        newStatus[index] = { ...newStatus[index], fileInputs: status };
        return {
          ...prevStatus,
          applicantStatus: newStatus,
        };
      });

      // Update the validation message
      setApplicantValidationMessage((prevMessage) => {
        const newMessage = [...prevMessage.applicantMessage];
        newMessage[index] = {
          ...newMessage[index],
          fileInputs: errorMessage,
        };
        return {
          ...prevMessage,
          applicantMessage: newMessage,
        };
      });
    }

    return !errorMessage;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    label: string,
  ) => {
    const { name, value } = e.target;
    validateAndSetField(name, label, value);
  };

  const handleApplicantChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    label: string,
  ) => {
    const { name, value } = e.target;
    validateAndSetField(name, label, value, index);
  };

  const validateForm = () => {
    const fieldsToValidate = [
      {
        name: 'userApplicationId',
        label: 'File Number',
        value: applicationInfo?.userApplicationId,
      },
    ];

    let isValid = true;

    fieldsToValidate.forEach((field) => {
      if (
        !validateAndSetField(
          field.name,
          field.label,
          field.value,
          null,
          null,
          true,
        )
      ) {
        isValid = false;
      }
    });

    applicantList.forEach((applicant, index) => {
      const validateApplicant = validateAndSetField(
        'userApplicantId',
        `File ID ${index + 1}`,
        applicant.userApplicantId,
        index,
        null,
        true,
      );
      const validateFileInputs = validateAndSetField(
        'fileInputs',
        `File ID ${index + 1}`,
        null,
        index,
        applicant.fileInputs,
        true,
      );
      if (!validateApplicant || !validateFileInputs) {
        isValid = false;
      }
    });

    return isValid;
  };

  const printFileInputNames = (fileInputs: { [key: string]: FILE_INPUT[] }) => {
    const fileNames: string[] = [];

    // Iterate over each key in the fileInputs object
    for (const key in fileInputs) {
      if (fileInputs.hasOwnProperty(key)) {
        // Extract the name of each file in the array associated with the key
        fileInputs[key].forEach((file) => {
          fileNames.push(file.name);
        });
      }
    }

    // Join the file names with a comma separator
    const fileNamesString = fileNames.join(', ');

    // Return the result if needed
    return fileNamesString;
  };

  const getConfirmationMessage = (application: APPLICATION_FORM) => {
    return (
      <Box className="flex flex-col gap-3">
        <Box>You've entered the following information. Is this correct?</Box>
        <Box>
          <span className="font-bold">File No: </span>
          {application.userApplicationId}
        </Box>
        {applicantList.map((applicant, i) => (
          <Box key={i}>
            <Box>
              <span className="font-bold">Applicant {i + 1}</span>
            </Box>
            <Box className="pl-10">
              <Box>
                <span className="font-bold">Applicant ID: </span>
                <span className="red">{applicant.userApplicantId}</span>
              </Box>
              <Box>
                <span className="font-bold">Document Uploaded: </span>
                {printFileInputNames(applicant.fileInputs)}
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setMessage(getConfirmationMessage(applicationInfo));
    setOkText('YES, Submit');
    setCancelText('No, Cancel');
    setOkFunction(() => handleConfirmSubmit);
    setCancelFunction(handleCancel);
    openModal();
  };

  const handleConfirmSubmit = async () => {
    let response;
    try {
      response = await sendRequest(
        edit ? APPLICATION_EDIT_API : APPLICATION_CREATE_API,
        'POST',
        {
          ...applicationInfo,
          id: applicationInfo.id,
          product: product,
          deleteApplicantList: deleteApplicantList,
        },
        true,
      );

      if (response?.status === 200) {
        const applicantIds = [];
        let hasFile = false;
        for (const applicant of applicantList) {
          if (applicant?.userApplicantId) {
            const formData = new FormData();
            formData.append('id', applicant.id);
            formData.append('applicationId', response?.data?.id);
            formData.append('product', product);
            formData.append(
              'userApplicantId',
              applicant?.userApplicantId ?? '',
            );
            edit &&
              formData.append(
                'deleteFileList',
                JSON.stringify(applicant?.deleteFileList ?? []),
              );
            Object.entries(applicant.fileInputs).forEach(([key, value]) => {
              value.forEach((file) => {
                if (!file.inDb) {
                  hasFile = true;
                  formData.append(key, file);
                }
              });
            });
            const applicantResponse = await sendRequest(
              edit && applicant.inDb
                ? APPLICANT_EDIT_API
                : APPLICANT_CREATE_API,
              'POST',
              formData,
              true,
            );

            // Set snackbar for this applicant
            if (applicantResponse?.status === 200) {
              console.log('Applicant Response: ', applicantResponse);
              applicantIds.push(applicantResponse.data.id);
              addSnackApplicant(applicantResponse.data.id);
            } else {
              throw new Error(applicantResponse.message);
            }
          }
        }
        setMessage(
          <span className="create-application-result create-application-success inline-block align-middle font-bold">
            {hasFile
              ? 'Thank you for the submission. We are starting document PII removal. Please wait for the process to complete before generating a report. See upper right for PII removal status.'
              : edit
                ? 'File Updated'
                : 'File Added'}
          </span>,
        );
        setOkFunction(() =>
          handleOkRedirect(
            `${getProductUrl(product)}${ADD_REPORT_PATH}${
              response?.data?.id && '?applicationId=' + response?.data?.id
            }`,
          ),
        );
        setOkText('OK');
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      !edit &&
        sendRequest(
          APPLICATION_ROLLBACK_API,
          'POST',
          {
            applicationId: response?.data?.id,
            product: product,
          },
          true,
        );

      setMessage(
        <Box className="items-center create-application-result create-application-fail">
          <Box className="font-bold">
            {edit ? 'File modification failed. ' : 'File creation failed. '}
          </Box>
          <Box>{error instanceof Error ? error.message : 'Internal Error'}</Box>
        </Box>,
      );
      setOkFunction(handleOk);
      setOkText('OK');
    } finally {
      setCancelFunction(undefined);
      openModal();
    }
  };

  const handleResetApplication = () => {
    setApplicationInfo(initialFormState);
    handleResetApplicantList();
  };

  return {
    Modal,
    applicationInfo,
    applicationList,
    applicantList,
    applicationValidationStatus: applicantValidationStatus,
    applicationValidationMessage: applicantValidationMessage,
    handleChange,
    handleApplicantChange,
    addApplicant,
    handleRemoveApplicant,
    setFileList,
    handleSubmit,
    handleConfirmSubmit, // This is the method to be called on confirmation
    setApplicationInfo,
    appendDeleteFileId,
    handleResetApplication,
  };
};

export default useApplicationForm;
