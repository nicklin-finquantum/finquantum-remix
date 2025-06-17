import { X } from 'lucide-react';
import React, { useEffect, useState, useRef } from 'react';

import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import useModal from '~/hooks/useModal';
import type { DUP_FILE, FILE_INPUT } from '~/types/file';
import { Product } from '~/types/product';

// Enum with camelCase keys, display names as values, and accepted file types
const FileNameMap = {
  bankStatements: { name: 'Bank Statements', accept: ['application/pdf'] },
  taxReturns: { name: 'Tax Returns', accept: ['application/pdf'] },
  creditReports: {
    name: 'Credit Report (CreditKarma report document only): ',
    accept: ['application/pdf'],
  },
  paystubs: { name: 'Paystubs', accept: ['application/pdf'] },
} as const;

type FileType = keyof typeof FileNameMap;

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
          `${file.name} is already uploaded, please delete it first.`,
        );
        setOkFunction(
          () => () => handleRemoveInput(file.type, file.idx - dupIdx),
        );
        setCancelFunction(undefined);
        openModal();
        return;
      } else {
        setMessage(
          `${file.name} is selected already.\nDo you want to replace it?`,
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

  let fileTypeList: FileType[] = [];
  if (product === Product.INCOME_ANALYSIS) {
    fileTypeList = ['bankStatements', 'taxReturns', 'paystubs'];
  } else if (product === Product.MORTGAGE_ANALYSIS) {
    fileTypeList = ['creditReports'];
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
        if (fileToRemove.id) {
          appendDeleteFileId(fileToRemove.id);
        }
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

    const inputDupList: Array<{
      name: string;
      inDb: boolean | undefined;
      type: string;
      prevIdx: number;
      idx: number;
    }> = [];
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

    setDupInputList(inputDupList as DUP_FILE[]);
    const newFileInputs: { [key: string]: FILE_INPUT[] } = { ...fileInputs };
    newFileInputs[key] = [...(newFileInputs[key] ?? []), ...files];
    setFileInputs(newFileInputs);
    e.target.value = ''; // Reset the input value to allow the same file to be uploaded again if needed
  };

  const renderFileList = (files: File[], fileType: string) => (
    <ul className="mt-2 space-y-2">
      {files.map((file, index) => (
        <li key={index} className="flex items-center justify-between rounded-md border p-2">
          <span className="text-sm truncate">{file.name}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleRemoveFile(index, fileType)}
          >
            <X className="h-4 w-4" />
          </Button>
        </li>
      ))}
    </ul>
  );

  const handleButtonClick = (fileType: FileType) => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = FileNameMap[fileType].accept.join(',');
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-6">
      {Modal}
      {fileTypeList.map((key) => (
        <div key={key} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-base font-semibold">
              {FileNameMap[key].name}
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleButtonClick(key)}
              className="gap-2"
            >
              <span>Upload</span>
            </Button>
          </div>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => handleFileChange(e, key)}
          />
          {fileInputs[key] && fileInputs[key].length > 0 && (
            <div className="text-sm text-muted-foreground">Uploaded Documents:</div>
          )}
          {renderFileList(fileInputs[key] ?? [], key)}
        </div>
      ))}
    </div>
  );
};

export default FileForm;
