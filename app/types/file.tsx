export type FileTypeMap = {
  creditReports: string;
  bankStatements: string;
  paystubs: string;
};

export const FILE_TYPE: FileTypeMap = {
  creditReports: "Credit Report",
  bankStatements: "Bank Statement",
  paystubs: "Paystub",
};
export type FILE_FORM = {
  name: string;
  path: string;
  type: string;
};

export type FILE = FILE_FORM & {
  id: string;
  createdAt: string;
  status: {
    percent: number;
    text: string;
    finished: boolean;
    text_detailed: string;
    error: boolean;
    error_text: string;
    updated_at: Date;
  };
};

export type FILE_INPUT = File & {
  id?: string;
  replace?: boolean;
  inDb?: boolean;
  _id?: string;
  status?: {
    percent: number;
    text: string;
    finished: boolean;
    text_detailed: string;
    error: boolean;
    error_text: string;
    updated_at: Date;
  };
};

export type DUP_FILE = FILE_INPUT & {
  idx: number;
  prevIdx: number;
};

export var STATUS: Record<string, string> = {
  complete: "Complete",
  fail: "Fail",
  inProgress: "In Progress",
};
