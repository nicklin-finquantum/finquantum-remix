export type APPLICATION_FORM = {
  userApplicationId: string;
  id?: string;
};

export type APPLICATION_ASSIGN_FORM = APPLICATION_FORM & {
  userId: string;
};

export type APPLICATION = APPLICATION_FORM & {
  createdAt: string;
  owner: string;
  status: string;
};

export var STATUS: Record<string, string> = {
  complete: "Complete",
  fail: "Fail",
  inProgress: "In Progress",
};
