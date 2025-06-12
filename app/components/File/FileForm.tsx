import React, { useEffect, useState, useRef } from "react";
import { Product } from "../../types/product";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DUP_FILE, FILE_INPUT } from "../../types/file";
import { DriveFolderUpload } from "@mui/icons-material";
import { Box } from "@mui/material";
import useModal from "../../hooks/useModal";

// Enum with camelCase keys, display names as values, and accepted file types
const FileNameMap = {
  bankStatements: { name: "Bank Statements", accept: ["application/pdf"] },
  taxReturns: { name: "Tax Returns", accept: ["application/pdf"] },
  creditReports: {
    name: "Credit Report (CreditKarma report document only): ",
    accept: ["application/pdf"],
  },
  paystubs: { name: "Paystubs", accept: ["application/pdf"] },
};

const FileForm: React.FC<{
  product: Product;
  fileInputs: { [key: string]: FILE_INPUT[] };
  setFileInputs: (fileList: { [key: string]: FILE_INPUT[] }) => void;
  appendDeleteFileId: (deleteFileId: string) => void;
}> = ({ product, fileInputs, setFileInputs, appendDeleteFileId }) => {
  const [dupInputList, setDupInputList] = useState<DUP_FILE[]>([]);
  const [dupIdx, setDupIdx] = useState<number>(0);

  const {
    Modal,
    openModal,
    closeModal,
    setMessage,
    setOkFunction,
    setCancelFunction,
    handleCancel,
  } = useModal();

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dupInputList.length) {
      const file = dupInputList[0];
      if (file.inDb) {
        setMessage(
          `${file["name"]} is already uploaded, please delete it first.`,
        );
        setOkFunction(
          () => () => handleRemoveInput(file.type, file.idx - dupIdx),
        );
        setCancelFunction(undefined);
        openModal();
        return;
      } else {
        setMessage(
          `${file["name"]} is selected already.\nDo you want to replace it?`,
        );
        setOkFunction(() => () => handleRemoveInput(file.type, file.prevIdx));
        setCancelFunction(
          () => () => handleRemoveInput(file.type, file.idx - dupIdx),
        );
        openModal();
        return;
      }
    }
    setDupIdx(0);
  }, [dupInputList]);

  let fileTypeList: Array<string> = [];
  if (product === Product.INCOME_ANALYSIS) {
    fileTypeList = ["bankStatements", "taxReturns", "paystubs"];
  } else if (product === Product.MORTGAGE_ANALYSIS) {
    fileTypeList = ["creditReports"];
  }

  const handleRemoveInput = (key: string, idx: number) => {
    const newFileInputs: { [key: string]: FILE_INPUT[] } = { ...fileInputs };
    newFileInputs[key] = [...newFileInputs[key]];
    newFileInputs[key].splice(idx, 1);
    setFileInputs(newFileInputs);
    setDupInputList(dupInputList.slice(1));
    closeModal();
    setDupIdx(dupIdx + 1);
  };

  const handleRemoveFile = (index: number, key: string) => {
    const fileToRemove = fileInputs[key][index];

    if (fileToRemove.inDb) {
      setMessage(
        `${fileToRemove.name} is already uploaded to the system. Do you want to delete it?`,
      );
      setOkFunction(() => () => {
        const newFileInputs: { [key: string]: FILE_INPUT[] } = {
          ...fileInputs,
        };
        newFileInputs[key] = [...newFileInputs[key]];
        newFileInputs[key].splice(index, 1);
        appendDeleteFileId(fileToRemove.id);
        setFileInputs(newFileInputs);
        closeModal();
      });
      setCancelFunction(handleCancel);
      openModal();
    } else {
      const newFileInputs: { [key: string]: FILE_INPUT[] } = { ...fileInputs };
      newFileInputs[key] = [...newFileInputs[key]];
      newFileInputs[key].splice(index, 1);
      setFileInputs(newFileInputs);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    const files = Array.from(e.target.files || []);
    const prevLen = fileInputs[key]?.length;

    const inputDupList = [];
    files.forEach((file, i) => {
      fileInputs[key]?.forEach((input, idx) => {
        if (input.name === file.name) {
          inputDupList.push({
            name: file.name,
            inDb: input.inDb,
            type: key,
            prevIdx: idx,
            idx: prevLen + i,
          });
        }
      });
    });

    setDupInputList(inputDupList);
    const newFileInputs: { [key: string]: FILE_INPUT[] } = { ...fileInputs };
    newFileInputs[key] = [...(newFileInputs[key] ?? []), ...files];
    setFileInputs(newFileInputs);
    e.target.value = ""; // Reset the input value to allow the same file to be uploaded again if needed
  };

  const renderFileList = (files: File[], fileType: string) => (
    <ul>
      {files.map((file, index) => (
        <Box key={index} className="flex">
          <li>{file.name}</li>
          <XMarkIcon
            className="icon hover:cursor-pointer"
            onClick={() => handleRemoveFile(index, fileType)}
          />
        </Box>
      ))}
    </ul>
  );

  const handleButtonClick = (fileType: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = FileNameMap[fileType].accept.join(",");
      fileInputRef.current.click();
    }
  };

  return (
    <Box>
      {Modal}
      {fileTypeList.map((key) => (
        <Box key={key}>
          <label className="block font-bold">
            {FileNameMap[key].name}
            <DriveFolderUpload
              onClick={() => handleButtonClick(key)}
              fontSize="inherit"
              className="cursor-pointer !text-black !text-2xl	!w-8 !h-8"
            />
          </label>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="file-upload-btn hidden"
            onChange={(e) => handleFileChange(e, key)}
          />
          {fileInputs[key] && fileInputs[key].length > 0 && (
            <Box>Uploaded Document List:</Box>
          )}
          {renderFileList(fileInputs[key] ?? [], key)}
        </Box>
      ))}
    </Box>
  );
};

export default FileForm;
