import { Box } from '@mui/material';
import { useState } from 'react';

import type { APPLICANT_FORM } from '~/types/applicant';
import type { StatusType } from '~/types/statusType';

export interface ApplicantStatus {
  userApplicantId: StatusType;
  fileInputs: StatusType;
}

export interface ApplicantMessage {
  userApplicantId: string;
  fileInputs: string;
}

export interface ApplicantValidationStatus {
  userApplicationIdStatus: StatusType;
  applicantStatus: ApplicantStatus[];
}

export interface ApplicantValidationMessage {
  userApplicationIdMessage: string;
  applicantMessage: ApplicantMessage[];
}

const useApplicantList = (
  emptyInitial = false,
  openModal: () => void,
  closeModal: () => void,
  setMessage: (message: React.ReactNode) => void,
  setOkFunction: (fn: () => void) => void,
  setCancelFunction: (fn: () => void) => void,
  handleCancel: () => void,
) => {
  const initialApplicantList = [
    {
      userApplicantId: '',
      fileInputs: {
        bankStatements: [],
        taxReturns: [],
        paystubs: [],
        creditReports: [],
      },
      deleteFileList: [],
    },
  ];

  const [applicantList, setApplicantList] = useState<APPLICANT_FORM[]>(
    emptyInitial ? [] : initialApplicantList,
  );
  const [deleteApplicantList, setDeleteApplicantList] = useState<string[]>([]);

  const defaultApplicantValidationStatus: ApplicantValidationStatus = {
    userApplicationIdStatus: 'default',
    applicantStatus: [
      {
        userApplicantId: 'default',
        fileInputs: 'default',
      },
    ],
  };
  const defaultApplicantValidationMessage: ApplicantValidationMessage = {
    userApplicationIdMessage: '',
    applicantMessage: [
      {
        userApplicantId: '',
        fileInputs: '',
      },
    ],
  };

  const [applicantValidationStatus, setApplicantValidationStatus] =
    useState<ApplicantValidationStatus>(defaultApplicantValidationStatus);

  const [applicantValidationMessage, setApplicantValidationMessage] =
    useState<ApplicantValidationMessage>(defaultApplicantValidationMessage);

  const addApplicant = () => {
    if (applicantList.length >= 5) {
      // Show an error message or handle max applicantList reached logic
      alert('Maximum number of applicantList reached.');
      return;
    }
    setApplicantList((prevApplicantList) => [
      ...prevApplicantList,
      {
        userApplicantId: '',
        fileInputs: {
          bankStatements: [],
          taxReturns: [],
          paystubs: [],
          creditReports: [],
        },
        replaceList: [],
      },
    ]);

    setApplicantValidationStatus((prevStatus) => ({
      ...prevStatus,
      applicantStatus: [
        ...prevStatus.applicantStatus,
        { userApplicantId: 'default', fileInputs: 'default' },
      ],
    }));

    setApplicantValidationMessage((prevMessages) => ({
      ...prevMessages,
      applicantMessage: [
        ...prevMessages.applicantMessage,
        { userApplicantId: '', fileInputs: '' },
      ],
    }));
  };

  const handleRemoveApplicant = (index: number, userApplicantId: string) => {
    if (userApplicantId) {
      setMessage(
        <Box>
          Are you sure you want to remove applicant{' '}
          <span className="text-blue-500">{userApplicantId}</span>?
        </Box>,
      );
      setOkFunction(() => () => {
        removeApplicant(index);
        closeModal();
      });
      setCancelFunction(handleCancel);
      openModal();
    } else {
      removeApplicant(index);
    }
  };

  const removeApplicant = (index: number) => {
    applicantList[index].inDb &&
      setDeleteApplicantList([...deleteApplicantList, applicantList[index].id]);
    const newApplicantList = [...applicantList];
    newApplicantList.splice(index, 1);
    setApplicantList(newApplicantList);

    const newApplicantValidationStatus = {
      ...applicantValidationStatus,
      applicantStatus: [...applicantValidationStatus.applicantStatus],
    };
    newApplicantValidationStatus.applicantStatus.splice(index, 1);
    setApplicantValidationStatus(newApplicantValidationStatus);

    const newApplicantValidationMessage = {
      ...applicantValidationMessage,
      applicantMessage: [...applicantValidationMessage.applicantMessage],
    };
    newApplicantValidationMessage.applicantMessage.splice(index, 1);
    setApplicantValidationMessage(newApplicantValidationMessage);
  };

  const handleResetApplicantList = () => {
    setApplicantList(emptyInitial ? [] : initialApplicantList);
    setApplicantValidationStatus(defaultApplicantValidationStatus);
    setApplicantValidationMessage(defaultApplicantValidationMessage);
  };

  return {
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
  };
};

export default useApplicantList;
