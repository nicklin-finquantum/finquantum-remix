import { FILE_INPUT, FILE } from "./file";

export type APPLICANT_FORM = {
  userApplicantId: string;
  fileInputs: { [key: string]: FILE_INPUT[] };
  fileList?: FILE[];
  deleteFileList?: string[];
  id?: string;
  inDb?: boolean;
};

export type APPLICANT = APPLICANT_FORM & {
  createdAt: string;
  userApplicationId: string;
  owner?: string;
  checked?: boolean;
};

export var STATUS: Record<string, string> = {
  complete: "Complete",
  fail: "Fail",
  inProgress: "In Progress",
};
