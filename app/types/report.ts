export type REPORT_FORM = {
  reportType: string;
};

export type REPORT = REPORT_FORM & {
  id: string,
  inputs: [{
    applicant: {
      name: string,
      files: []
    }
  }],
  reportType: string,
  reportId: string,
  createdAt: string,
  status: {
    percent: number,
    text: string,
    finished: boolean,
    text_detailed: string,
    error: boolean,
    error_text: string,
    updated_at: Date
  },
  validate: boolean,
  userApplicationId: string,
  applicationId?: {
    _id : string,
    userApplicationId: string,
    orgId: string,
  },
  statusText?: string,
};

export var STATUS: Record<string, string> = {
  complete: "Complete",
  fail: "Fail",
  inProgress: "In Progress",
}

// export var REPORT_LIST_TYPE: Record<string, string> = {
//   overview: "overview",
//   download: "download",
// }

export type REPORT_LIST_TYPE = "overview" | "download";

